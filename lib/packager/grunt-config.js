module.exports = function(grunt) {

  var descriptor = grunt.file.readJSON('expression.json');
  var Tempdir = require('temporary/lib/dir');
  var tmpdir = new Tempdir();
  var curdir = process.cwd();

  // Map helper func
  function map(arr, fn){
    newArr = [];
    for( var i in arr) {
      newArr.push(fn.apply(arr[i], [arr[i]]));
    }
    return newArr;
  }

  function endsWith(str, suffix0, suffixn) {
    var suffixes = Array.prototype.splice.apply(arguments, [1, arguments.length-1]);
    for (var i in suffixes){
      var suf = suffixes[i];
      if(str.indexOf(suf, str.length - suf.length) !== -1){
        return true;
      }
    }
    return false;
  }

  // get js and css paths sorted by type then context
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
  };
  if(descriptor.dependencies){
    for(i in descriptor.dependencies) {
      var dep = descriptor.dependencies[i];
      if(dep.context === undefined) {
        dep.context = 'all';
      }
      files[dep.type][dep.context].push(dep.path);
    }
  }

  // Configure Grunt tasks
  var config = {};
  
  // Concat
  config.concat =  {
    editor_script: {
      src: files.javascript.all.concat(files.javascript.editor),
      dest: tmpdir.path + "/build/editor.js"
    },
    player_script: {
      src: files.javascript.all.concat(files.javascript.player),
      dest: tmpdir.path + "/build/player.js"
    }
  };

  // Minimify JS
  config.min = {
    editor_script: {
      src: tmpdir.path + "/build/editor.js",
      dest: tmpdir.path + "/dist/editor.min.js"
    },
    player_script: {
      src: tmpdir.path + "/build/player.js",
      dest: tmpdir.path + "/dist/player.min.js"
    }
  };

  // Minimify CSS
  config.mincss = {};
  config.mincss.player_css = {
    dest: tmpdir.path + "/dist/player.min.css",
    src: ['import_statement_all.css', 'import_statement_player.css'].concat(map(
      files.stylesheet.all.concat(files.stylesheet.player),
      function(p){ return tmpdir.path  + '/dist/' + p; }
    ))
  };
  var a = map(
    files.stylesheet.all.concat(files.stylesheet.editor),
    function(p){ return tmpdir.path  + '/dist/' + p; }
  );
  //console.log("LENGTH: " + a.length + '   ' + a[0]);
  config.mincss.editor_css = {
    dest: tmpdir.path + "/dist/editor.min.css",
    src: ['import_statement_all.css', 'import_statement_player.css'].concat(map(
      files.stylesheet.all.concat(files.stylesheet.editor),
      function(p){ return tmpdir.path  + '/dist/' + p; }
    ))
  };

  // Lint / jsHint
  config.jshint = {
    options: {
      "passfail": false,
      "maxerr": 50,
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
      "undef": true,
      "boss": true,
      "eqnull": true,
      "node": true
    },
    "globals":  {
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

  // init Grunt
  grunt.config.init(config);

  grunt.registerTask('copyAll', "copy all files into dist", function(){
    var files = grunt.file.expandFiles('**/*.*');
    for(var i in files){
      var file = files[i];

      if(!endsWith(file, '.expression', '.zip', '.log')){
        var destPath = tmpdir.path + '/dist/' + file;
        grunt.file.copy(file, destPath);
        grunt.log.writeln("Created " + destPath);
      } else {
        grunt.log.writeln("Skipped " + destPath);
      }
    }

    // Rebase to the new dist directory
    grunt.file.setBase(tmpdir.path, 'dist');
  });

  grunt.registerTask('exportCSSImportStatement', function(){
    grunt.file.setBase(tmpdir.path + '/dist');
    var cssImport = {all: [], player: [], editor: []};
    var domains = ['all', 'player', 'editor'];
    for(var i in domains){
      map(files.stylesheet[domains[i]], function(path){
        var cssData = grunt.file.read(path);
        var rex = /@import.*/g;
        var matches = cssData.match(rex);
        if(matches && matches.length > 0){
          grunt.log.write("Found " + matches.join(", "));
          cssImport[domains[i]].push(matches.join("\n"));
          cssData = cssData.replace(rex, '');
          grunt.file.write(path, cssData);
        }
      });
      var importPath = "import_statement_" + domains[i] + ".css";
      grunt.file.write(importPath, cssImport[domains[i]].join("\n"));
    }
  });

  grunt.registerTask('updateDescriptor', 'updated descriptor with compressed dependencies', function(){
    descriptor.dependencies = [
      {type: 'javascript', context: 'editor', path: 'editor.min.js'},
      {type: 'javascript', context: 'player', path: 'player.min.js'},
      {type: 'stylesheet', context: 'editor', path: 'editor.min.css'},
      {type: 'stylesheet', context: 'player', path: 'player.min.css'}
    ];
    grunt.file.write(tmpdir.path + '/dist/expression.json', JSON.stringify(descriptor));
    grunt.log.writeln('rewritten ' + tmpdir.path + '/dist/expression.json');
  });

  grunt.registerTask('rebindCssUrl', 'translate relative path from css that will be compressed', function(){
    grunt.file.setBase(tmpdir.path + '/dist');
    var css_files = files.stylesheet.all.concat(files.stylesheet.editor).concat(files.stylesheet.player);
    for(var i in css_files){
      var path = css_files[i];
      function dirname(path){
        var splits = path.split('/');
        splits.pop();
        return splits.join('/');
      }
      var basedir = dirname(path);
      if(basedir){
        var data = grunt.file.read(path);
        data = data.replace(/url\(['\"]?([^'\"\:]+)['\"]?\)/g, 'url('+basedir+'/$1)');
        grunt.file.write(path, data);
        grunt.log.writeln('dist/' + path);
      }
    }
  });

  grunt.registerTask('compressDist', function(){
    grunt.file.setBase(tmpdir.path + '/dist');
    
    var zippath = curdir + "/" + descriptor.system_name + '-' + descriptor.version + '.zip';
    var spawn = require('child_process').spawn;
    var done = this.async();
    // Options -r recursive -j ignore directory info - redirect to stdout
    var distpath = '.';
    var zip = spawn('zip', ['-rT', zippath, distpath]);

    zip.stdout.on('data', function (data) {
      // console.log('zip out: ' + data)
    });

    zip.stderr.on('data', function (data) {
      // Uncomment to see the files being added
      // console.log('zip stderr: ' + data);
    });

    // End the response on zip exit
    zip.on('exit', function (code) {
      console.log("Written " + zippath);
      done();
    });
    
  });

  grunt.registerTask('default', ['copyAll', 'rebindCssUrl', "exportCSSImportStatement", 'concat', 'min', 'mincss', 'updateDescriptor', 'compressDist']);
}