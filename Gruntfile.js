/**
 * Created by rgwozdz on 7/20/15.
 */

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        apidoc: {
            docs: {
                src: ["app", "node_modules/cadasta-data-transformer/src/ingestion"],
                dest: "docs-app/public/",
                options: {
                    debug: true,
                    includeFilters: [ ".*\\.js$" ],
                    excludeFilters: [  "ship/" ]
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-apidoc');

    grunt.registerTask('updateDocs', [
        'apidoc:docs'
    ]);

};
