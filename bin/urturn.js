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
    fs = require('fs'),
    path = require('path');

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

program.parse(process.argv);