/**
 * Created by rgwozdz on 7/20/15.
 */

var config = require('./deployment-config.json');

module.exports = function(grunt) {

    var env = grunt.option('env') || 'development';
    var pem = grunt.option('pem') || null;
    var deployer = grunt.option('deployer') || null;
    var revision = grunt.option('rev') || null;


    if(env === 'production' || env === 'staging') {
        var hostIp = config.environment[env].hostIp;
        var hostPath = config.environment[env].hostPath;
        var hostUser = config.environment[env].hostUsername;
    }


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        apidoc: {
            docs: {
                src: ".",
                dest: "public/docs/",
                options: {
                    debug: true,
                    includeFilters: [ ".*\\.js$" ],
                    excludeFilters: [ "node_modules/" ]
                }
            }
        },

        mkdir: {
            deploy: {
                options: {
                    create: ['deploy', 'ship']
                }
            }
        },

        clean: {
            deploy: ["deploy/**"]
        },

        copy : {

            deploy : {
                files: [
                    {expand: true, cwd: '', src: [
                            '**',
                            '!node_modules/**',
                            '!test/**',
                            '!deploy/**',
                            '!ship/**',
                            '!.gitignore',
                            '!Gruntfile.js',
                            '!README.md',
                            '!webstorm-api-debug-config.png'
                        ],
                        dest: 'deploy/'},
                    {expand: true, cwd: '', src: ['publish.sh'], dest: 'ship/'}
                ]
            }
        },

        file_append: {
            deploy: {
                files: [
                    {
                        append: "\nsudo pm2 restart <%=pkg.name%>-" + env + " || sudo pm2 start app.js --name <%=pkg.name%>-" + env + " -- " + env + " || exit 1\n\n",
                        input: 'ship/publish.sh',
                        output: 'ship/publish.sh'
                    },
                    {
                        append: "\ncurl https://api.rollbar.com/api/1/deploy/ \\\n"
                            + "-F access_token=" + config.environment[env].rollbarKey + " \\\n"
                                + "-F environment=" + env + " \\\n"
                                + "-F revision=" + revision + " \\\n"
                                + "-F local_username=" + deployer +" \\\n",
                        input: 'ship/publish.sh',
                        output: 'ship/publish.sh'
                    },
                ]
            }
        },

        shell: {

            compress: {
                command : 'tar -zcvf ship/deploy.tar.gz deploy'
            },

            scp : {
                command : [
                    'scp -v -i ' + pem + ' ship/deploy.tar.gz '+ hostUser + '@' + hostIp + ':'+ hostPath,
                    'scp -v -i ' + pem + ' ship/publish.sh '+ hostUser + '@' + hostIp + ':'+ hostPath
                ].join('&&')
            }

        }
    });

    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-file-append');

    // The build and 'deploy' task
    grunt.registerTask('deploy', [
        'mkdir:deploy',
        'clean:deploy',
        'copy:deploy',
        'apidoc:docs',
        'file_append:deploy',
        'shell:compress',
        'shell:scp'
    ]);

};