#! /usr/bin/env node

/*
 * urturn-node-cli
 * 
 *
 * Copyright (c) 2013 Webdoc, Olivier Amblet
 * Licensed under the MIT license.
 */

var terminal = require('./term.js'),
    program = require('commander'),
    packager = require('./packager');

program
  .version("0.7.0")
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