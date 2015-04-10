#!/usr/bin/env node

var program = require('commander');
var yaml = require('js-yaml');
var fs = require('fs');
var fsu = require('./fs-utils');
var path = require('path');
var glob = require('glob');
var spawn = require('child_process').spawn;

function error(str) {
  console.log('Error: ' + str);
}

function dox(script, cb) {
  if (fsu.fileExists(script)) {
    if (fsu.filePerms(script, 1)) {
      console.log('executing ' + script);
      var cmd = spawn(script);
      cmd.stdout.on('data', function (data) {
        console.log('' + data);
      });
      cmd.stderr.on('data', function (data) {
        console.log('' + data);
      });
      cmd.on('close', function (code) {
        cb(code);
      });
    } else {
      error('script ' + script + " is not executable.");
      cb(1);
    }
  } else {
    cb(0);
  }
}

function doxlist(scripts, cb) {
  if (scripts.length === 0)
    cb(0);
  else {
    dox(scripts[0], function (code) {
      if (!code) doxlist(scripts.slice(1), cb);
      else cb(code);
    });
  }
}

function doxdo(scriptname, cb) {
  doxlist(['.minici/pre-' + scriptname,
           '.minici/' + scriptname,
           '.minici/post-' + scriptname], cb);
}

function requireminiciProject() {
  if (!fsu.dirExists('.minici')) {
    error('current directory is not a minici project.');
    process.exit(1);
  }
}

function RunTests(pattern, cb) {
  if (!pattern)
    pattern = "*";
  glob('.minici/tests/' + pattern, function (e, files) {
    if (e) {
      error('Unable to find tests.');
      cb(1);
    } else
      doxlist(files, cb);
  });
}

function ListTests(pattern, cb) {
  if (!pattern)
    pattern = "*";
  glob('.minici/tests/' + pattern, function (e, files) {
    if (e) {
      error('Unable to find tests.');
      cb(1);
    }
    else {
      console.log('Tests Available:');
      for (var i = 0; i < files.length; i++) {
        var name = path.relative('.minici/tests', files[i]);
        console.log(' - ' + name);
      }
      cb(0);
    }
  });
}

program
  .description('Minimalist Continuos Integration')
  .version('0.1.0');

program
  .command('install')
  .description('install the package')
  .action(function () {
    requireminiciProject();
    doxdo('build', function (code) {
      if (!code) doxdo('install', process.exit);
      else process.exit(code);
    });
  });

program
  .command('deploy')
  .description('deploy the package')
  .action(function () {
    requireminiciProject();
    doxdo('build', function (code) {
      if (!code) doxdo('deploy', process.exit);
      else process.exit(code);
    });
  });

program
  .command('build')
  .description('build the package')
  .action(function () {
    requireminiciProject();
    doxdo('build', process.exit);
  });

program
  .command('list [pattern]')
  .description('list tests that match optional pattern')
  .action(function (pattern) {
    requireminiciProject();
    ListTests(pattern, process.exit);
  });

program
  .command('test [pattern]')
  .description('run tests that match optional pattern')
  .action(function (pattern) {
    requireminiciProject();
    doxdo('build', function (code) {
      if (!code) RunTests(pattern, process.exit);
      else process.exit(code);
    });
  });

program.parse(process.argv);

if (!program.args.length) {
  console.log('No arguments specified');
  program.help();
}
