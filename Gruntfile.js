module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      test : {
        port : 8000
      }
    },

    jasmine: {
      taquet: {
        src: ['src/**/*.js', '!src/vendor/require.js', '!src/vendor/r.js'],
        options: {
          specs: 'test/**/*Spec.js',
          helpers: 'test/**/*Helper.js',
          host: 'http://127.0.0.1:<%= connect.test.port %>/',
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfigFile: './src/main.js',
            requireConfig: {
              baseUrl: './src/'
            }
          }
        }
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: "./src/",
          name: "main",
          mainConfigFile: "./src/main.js",
          out: "./js/main-built.js"
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Default task(s).
  grunt.registerTask('default', ['connect', 'jasmine']);

  grunt.registerTask('compile', ['requirejs']);
  grunt.registerTask('test', ['connect', 'jasmine']);

};