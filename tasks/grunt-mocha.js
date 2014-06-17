module.exports = function(grunt) {
  'use strict';

  grunt.config.set('mochaTest' , {
    options: {
      reporter: 'spec',
      require: 'test/integration/util/proxy'
    },
    files: ['test/integration/my_first_test.js']
  });

  grunt.loadNpmTasks('grunt-mocha-test');
};