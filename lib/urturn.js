#! /usr/bin/env node

/*
 * urturn-node-cli
 * 
 *
 * Copyright (c) 2013 Webdoc, Olivier Amblet
 * Licensed under the MIT license.
 */

var userArgs = process.argv.slice(2);

var grunt = require('grunt'),
    path  = require('path'),
    zip = new require('node-zip')();

var projectDir = process.cwd().toString();
var expressionDesc = grunt.file.readJSON(path.resolve(projectDir, 'expression.json'));

grunt.loadTasks(path.resolve(__dirname, '../node_modules/grunt-contrib-mincss/tasks'));

grunt.cli({
  base: projectDir,
  config: path.resolve(__dirname, 'grunt-config.js')
});
