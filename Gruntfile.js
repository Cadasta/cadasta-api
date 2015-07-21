/**
 * Created by rgwozdz on 7/20/15.
 */

module.exports = function(grunt) {



    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        apidoc: {
            myapp: {
                src: "app/",
                dest: "apidoc/"
            }
        }
    });

    grunt.loadNpmTasks('grunt-apidoc');

};
