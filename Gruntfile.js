/**
 * Created by rgwozdz on 7/20/15.
 */

module.exports = function(grunt) {



    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        apidoc: {
            myapp: {
                src: "app/",
                dest: "app/public/docs",
                options: {
                    debug: true,
                    includeFilters: [ ".*\\.js$" ],
                    excludeFilters: [ "node_modules/" ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-apidoc');

};
