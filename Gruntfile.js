/**
 * Created by rgwozdz on 7/20/15.
 */





module.exports = function(grunt) {

    var settings, envSettings;

    var env = grunt.option('env') || 'development';
    var pem = grunt.option('pem') || null;
    var deployer = grunt.option('deployer') || null;
    var revision = grunt.option('rev') || null;

    //if settings.js doesn't exist, let the user know and exit
    try {
        settings = require('./app/settings/settings.js');

        // Environment specific configuration settings
        envSettings = require("./app/settings/environment-settings.js")[env];
    } catch (e) {
        console.log("Missing a settings file.\n", e);
        return;
    }


    if(env === 'production' || env === 'staging') {
        var hostIp = envSettings[env].hostIp;
        var hostPath = envSettings[env].hostPath;
        var hostUser = envSettings[env].hostUsername;
    }


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        apidoc: {
            docs: {
                src: "app",
                dest: "app/public/docs/",
                options: {
                    debug: true,
                    includeFilters: [ ".*\\.js$" ],
                    excludeFilters: [ "node_modules/", "ship/" ]
                }
            }
        },

        mkdir: {
            deploy: {
                options: {
                    create: ['ship']
                }
            }
        },

        clean: {
            deploy: ["ship/**"]
        },

        copy : {

            publish : {
                files: [
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
                            + "-F access_token=" + settings.rollbarKey + " \\\n"
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
                command : 'tar -czf ship/app.tar.gz app/* package.json'
            },

            scp : {
                command : [
                    'scp -v -i ' + pem + ' ship/app.tar.gz '+ hostUser + '@' + hostIp + ':'+ hostPath,
                    'scp -v -i ' + pem + ' ship/publish.sh '+ hostUser + '@' + hostIp + ':'+ hostPath
                ].join('&&')
            },

            markdownDocs : {
                command: 'node node_modules/apidoc-markdown -p app/public/docs -o api-documentation.md'
            }

        }
    });

    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-file-append');

    grunt.registerTask('updateDocs', [
        'apidoc:docs',
        'shell:markdownDocs',
    ]);

    // The build and 'deploy' task
    grunt.registerTask('deploy', [
        'mkdir:deploy',
        'clean:deploy',
        'copy:publish',
        'apidoc:docs',
        'shell:markdownDocs',
        'file_append:deploy',
        'shell:compress',
        'shell:scp'
    ]);

};
