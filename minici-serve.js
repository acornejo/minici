#!/usr/bin/env node

var yaml = require('js-yaml');
var fs = require('fs');
var fsu = require('fs-utils');

var config = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));
console.log(config);
