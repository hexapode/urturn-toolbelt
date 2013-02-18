module.exports = function(grunt) {

  var descriptor = grunt.file.readJSON('expression.json');
  var Tempdir = require('temporary/lib/dir');
  var tmpdir = new Tempdir();
  var curdir = process.cwd();


  // Configure Grunt tasks
  var config = {};
  

  // Lint / jsHint
  config.jshint = {
    options: {
      "passfail": true,
      "maxerr": 150,
      "debug": false,
      "devel": false,
      "es5": false,
      "strict": false,
      "globalstrict": false,
      "curly": false,
      "eqeqeq": false,
      "immed": true,
      "latedef": true,
      "newcap": true,
      "noarg": true,
      "sub": true,
      "undef": false,
      "boss": true,
      "eqnull": true,
      "node": true
    },
    "globals":  {
      "document"  : false,
      "WebDoc"    : false,
      "$"         : false,
      "jQuery"    : false,
      "Zepto"     : false,
      "jq"        : false,
      "FILTERS"   : false,
      "SHEEP"     : false,
      "UT"        : false,
      "WD"        : false,
      "utils"     : false,
      "window"    : false
    }
  };

  config.lint = {
    files: ['grunt-config.js', '*/*.js']
    // comment expcommon cause pluging trow too much error :p
    //files: ['grunt-config.js', '*/*.js','expcommon/**/*.js']
  };

  config.watch = {
    default: {
      files: '*/*',
      tasks: 'shell:deploy'
    },
    debug: {
      files: '*/*',
      tasks: ['lint','shell:deploy']
    }
  };

  config.shell = {
    deploy: {
      command: 'urturn -h local.urturn.com expression:deploy'
    },
    options: {
      stdout: true
    }
  };

  // init Grunt
  grunt.config.init(config);

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('debug', ['watch:debug']);
}