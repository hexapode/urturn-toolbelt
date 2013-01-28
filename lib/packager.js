var grunt = require('grunt'),
    path  = require('path'),
    term  = require('./term');

var packager = {
  package: function(term, dir, options, callback){
    term.title('Package: ', dir);
    var projectDir = dir.toString();

    grunt.loadTasks(path.resolve(__dirname, '../node_modules/grunt-contrib-mincss/tasks'));
    grunt.tasks( (options.debug ? 'debug' : 'default') , {
      base: projectDir,
      config: path.resolve(__dirname, 'packager/grunt-config.js')
    }, callback);
  }
};

module.exports = packager;