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
    Authenticate = require('../lib/authenticate'),
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
  .command('deploy [path]')
  .description('Deploy the expression')
  .option('-h, --host <host>', 'Specify server path')
  .option('-l, --login <login>', 'Server login')
  .option('-p, --password <password>', 'Server password')
  .action(function(path, context){

    var authenticate = new Authenticate();
    var host = context.host || 'pierre.urturn.com';
    var login = context.login || null;
    var password = context.password || null;
    var path = path || process.cwd();
    if (context.host ) 
      host = context.host ;
    authenticate.login(function(){
      console.log('Packaging Expression....');
      packager.package(terminal, path, {
        debug: 0
      }, function(){
          console.log('upload Expression');
          authenticate.uploadExpression(path);
      });
    }, host, login, password);
  });

program
  .command('devmode [path]')
  .description('dev mode for expression')
  .option('-d, --debug', 'jslint')
  .action(function(path, context){
    path = path || process.cwd();
    devmode.devmode(terminal, path, {
      debug: context.debug || context.parent.debug,
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