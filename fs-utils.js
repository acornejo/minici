var fs = require('fs');

exports.dirExists = function (dirname) {
  try {
    return fs.lstatSync(dirname).isDirectory();
  } catch (e) {
    return false;
  }
};

exports.fileExists = function (filename) {
  try {
    return !fs.lstatSync(filename).isDirectory();
  } catch (e) {
    return false;
  }
};

exports.filePerms = function (filename, mask) {
  try {
    var stat = fs.statSync(filename);
    return !!(mask & parseInt((stat.mode & parseInt("777", 8)).toString(8)[0]));
  } catch (e) {
    return false;
  }
};
