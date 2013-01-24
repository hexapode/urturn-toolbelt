module.exports = function(grunt) {

  var descriptor = grunt.file.readJSON('expression.json')

  grunt.loadTasks(require('grunt-contrib-mincss'));

  var files = {
    javascript: {
      editor: [],
      player: [],
      all: []
    },
    stylesheet: {
      editor: [],
      player: [],
      all: []
    }
  }

  var Tempdir = require('temporary/lib/dir');
  var tmpdir = new Tempdir();

  if(descriptor.dependencies){
    for( i in descriptor.dependencies ) {
      var dep = descriptor.dependencies[i];
      if(dep.context === undefined) {
        dep.context = 'all'
      }
      files[dep.type][dep.context].push(dep.path);
    }
  }

  grunt.config.init({
    concat: {
      editor_script: {
        src: files.javascript.all.concat(files.javascript.editor),
        dest: tmpdir.path + "/build/editor.js"
      },
      player_script: {
        src: files.javascript.all.concat(files.javascript.player),
        dest: tmpdir.path + "/build/player.js"
      }
    },
    mincss: {
      editor_css: {
        src: files.stylesheet.all.concat(files.stylesheet.editor),
        dest: tmpdir.path + "/dist/editor.min.css"
      },
      player_css: {
        src: files.stylesheet.all.concat(files.stylesheet.editor),
        dest: tmpdir.path + "/dist/player.min.css"
      }
    },
    min: {
      editor_script: {
        src: tmpdir.path + "/build/editor.js",
        dest: tmpdir.path + "/dist/editor.min.js"
      },
      player_script: {
        src: tmpdir.path + "/build/player.js",
        dest: tmpdir.path + "/dist/player.min.js"
      }
    }
  });

  grunt.registerTask('copyAll', function(){
    var files = grunt.file.expandFiles('**/*.*');
    for(var i in files){
      var file = files[i];
      var destPath = tmpdir.path + '/dist/' + file;
      grunt.file.copy(file, destPath);
      grunt.log.writeln("Created " + destPath);
    }
  });

  grunt.registerTask('updateDescriptor', function(){
    descriptor.dependencies = [
      {type: 'javascript', context: 'editor', path: 'editor.min.js'},
      {type: 'javascript', context: 'player', path: 'player.min.js'},
      {type: 'stylesheet', context: 'editor', path: 'editor.min.css'},
      {type: 'stylesheet', context: 'player', path: 'player.min.css'}
    ];
    grunt.file.write(tmpdir.path + '/dist/expression.json', JSON.stringify(descriptor));
    grunt.log.writeln('rewritten ' + tmpdir.path + '/dist/expression.json');
  });

  grunt.registerTask('default', ['copyAll', 'concat', 'min', 'mincss', 'updateDescriptor']);
}