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
        envSettings = require("./app/settings/environment-settings.js");
    } catch (e) {
        console.log("Missing a settings file.\n", e);
        return;
    }


    if(env === 'production' || env === 'staging' || 'demo') {
        envSettings = envSettings[env];
    }


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        apidoc: {
            docs: {
                src: ["app", "node_modules/cadasta-data-transformer/src/ingestion"],
                dest: "app/public/docs/",
                options: {
                    debug: true,
                    includeFilters: [ ".*\\.js$" ],
                    excludeFilters: [  "ship/" ]
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
                        append: "\npm2 restart <%=pkg.name%>-" + env + " || pm2 start app.js --name <%=pkg.name%>-" + env + " -- --env " + env + " || exit 1\n\n",
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

        replace: {

            docs: {
                src: ['app/public/docs/api_data.js', 'app/public/docs/api_data.json'],
                overwrite: true,
                replacements: [{ from: 'http://localhost', to: 'http://' + envSettings.hostIp + ':' + envSettings.apiPort }]
            }
        },

        shell: {

            compress: {
                command : 'tar -czf ship/app.tar.gz app/* package.json requirements.txt'
            },

            scp : {
                command : [
                    'scp -v -i ' + pem + ' ship/app.tar.gz '+ envSettings.hostUsername + '@' + envSettings.hostIp + ':'+ envSettings.hostPath,
                    'scp -v -i ' + pem + ' ship/publish.sh '+ envSettings.hostUsername + '@' + envSettings.hostIp + ':'+ envSettings.hostPath
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
    grunt.loadNpmTasks('grunt-text-replace');

    grunt.registerTask('updateDocs', [
        'apidoc:docs'
        //'shell:markdownDocs',
    ]);

    // The build and 'deploy' task
    grunt.registerTask('deploy', [
        'mkdir:deploy',
        'clean:deploy',
        'copy:publish',
        'apidoc:docs',
        'replace:docs',
        'file_append:deploy',
        'shell:compress',
        'shell:scp'
    ]);

};
