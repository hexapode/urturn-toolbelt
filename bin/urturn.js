#! /usr/bin/env node

/*
 * urturn-node-cli
 * 
 *
 * Copyright (c) 2013 Webdoc, Olivier Amblet
 * Licensed under the MIT license.
 */

var terminal = require('../lib/term.js'),
    program = require('commander'),
    packager = require('../lib/packager'),
    devmode = require('../lib/devmode'),
    fs = require('fs'),
    path = require('path'),
    http = require('http');

var info = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));

program
  .version(info.version)
  .option('--host <host>', 'Specify the host [www.urturn.com]', String, 'www.urturn.com');

program
  .command('package [path]')
  .description('package the expression')
  .option('-d, --debug', 'Do not compress scripts and stylesheets.')
  .action(function(path, context){
    path = path || process.cwd();
    packager.package(terminal, path, {
      debug: context.debug || context.parent.debug,
      host: context.host || context.parent.host
    }, function(){
      terminal.write('Successfuly packaged');
    });
  });

program
  .command('devmode [path]')
  .description('dev mode for expression')
  .action(function(path, context){
    path = path || process.cwd();
    devmode.devmode(terminal, path, {
      host: context.host || context.parent.host
    }, function(){
      terminal.write('Dev mode on');
    });
  });

program
  .command('sandbox [path]')
  .description('start a sandbox server')
  .option('-p, --port <port>', Number)
  .action(function(p, context){
    var port = context.parent.port || context.port || 3333;
    var expressionDir = path.resolve(p) || process.cwd().toString();
    var server = require('urturn-sandbox').configure(expressionDir, port);
    http.createServer(server).listen(server.get('port'), function(){
      console.log("Express server listening on port " + server.get('port'));
    });
  });

program.parse(process.argv);