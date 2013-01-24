#! /usr/bin/env node

/*
 * urturn-node-cli
 * 
 *
 * Copyright (c) 2013 Webdoc, Olivier Amblet
 * Licensed under the MIT license.
 */

console.log(process.argv);
var userArgs = process.argv.slice(2);

var grunt = require('grunt'),
    path  = require('path');

var projectDir = process.cwd().toString();
console.log(__dirname, projectDir);
var expressionDesc = grunt.file.readJSON(path.resolve(projectDir, 'expression.json'));

grunt.config.init({
  concat: {
    dist: {
      src: '**/*.js'
    }
  }
});

grunt.cli( { base: projectDir } );
