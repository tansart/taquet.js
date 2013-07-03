module.exports = function(grunt) {
  "use strict";
  var fs = require('fs'),
    mOutput = 'taquet.js',
    mFiles = [
      'src/com/stilva/util/Queue.js',
      'src/com/stilva/taquet/util/TaquetCore.js',
      'src/com/stilva/taquet/event/BubbleEventManager.js',
      'src/com/stilva/taquet/event/CommandManager.js',
      'src/com/stilva/taquet/event/CommandQueue.js',
      'src/com/stilva/taquet/event/BaseEvent.js',
      'src/com/stilva/taquet/application/BaseApplication.js',
      'src/com/stilva/taquet/view/BaseView.js',
      'src/com/stilva/taquet/view/BaseAnimatedView.js',
      'src/com/stilva/taquet/model/BaseModel.js',
      'src/com/stilva/taquet/router/BaseRouter.js'
    ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      test : {
        port : 8000
      }
    },

    concat: {
      options: {
        banner: (fs.readFileSync('./src/out/banner.tmpl').toString()),
        footer: (fs.readFileSync('./src/out/footer.tmpl').toString()),
        separator: '\r',
        process: function(src, filepath) {
//          return '// Source: ' + filepath + '\n' +
          return src.replace(/^.|\r./mg, function(match) {
              return "  "+match;
            });
        }
      },
      dist: {
        src: mFiles,
        dest: mOutput
      }
    },

    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
//      src: mFiles
      beforeconcat: mFiles,
      afterconcat: mOutput
    },

    jasmine: {
      taquet: {
        src: [
          './src/vendor/lodash.js',
          './src/vendor/jquery.js',
          './src/vendor/backbone.js',
          './src/com/stilva/taquet/event/BubbleEvent.js',
          './taquet.js'
        ],
        options: {
          keepRunner: true,
          specs: 'test/com/stilva/taquet/*Spec.js',
          host: 'http://127.0.0.1:<%= connect.test.port %>/',
        }
      }
    },

    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/test/com/backbone/index.html'
          ]
        }
      }
    },

    benchmark: {
      all: {
        src: ['benchmarks/*.js']
      }
    },

    watch: {
      scripts: {
        files: ['src/**/*.js', 'src/out/*.tmpl', 'src/**/*Spec.js'],
        tasks: ['test']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-benchmark');

  // Default task(s).
  grunt.registerTask('default', ['watch']);
//  grunt.registerTask('default', ['concat', 'jshint']);

  grunt.registerTask('compile', ['concat', 'jshint']);
  grunt.registerTask('test', ['concat', 'jshint', 'connect', 'qunit', 'jasmine']);
  grunt.registerTask('bench', ['benchmark']);

};