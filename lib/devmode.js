var grunt = require('grunt'),
    path  = require('path'),
    term  = require('./term');

var devmode = {
  devmode: function(term, dir, options, callback){
    term.title('Package: ', dir);
    var projectDir = dir.toString();

    grunt.loadTasks(path.resolve(__dirname, '../node_modules/grunt-shell/tasks'));
    grunt.tasks( (options.debug ? 'debug' : 'default') , {
      base: projectDir,
      config: path.resolve(__dirname, 'devmode/grunt-config.js')
    }, callback);
  }
};

module.exports = devmode;