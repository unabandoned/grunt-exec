'use strict';

// Runs the real grunt CLI against test/Gruntfile.js with a throwaway base
// directory, so every test gets a fresh grunt process and a fresh cwd.

var childProcess = require('node:child_process');
var fs = require('node:fs');
var os = require('node:os');
var path = require('node:path');

var gruntBin = require.resolve('grunt/bin/grunt');
var gruntfile = path.join(__dirname, '..', 'Gruntfile.js');

exports.version = require('grunt/package.json').version;

exports.tempDir = function(t) {
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grunt-exec-test-'));
  t.after(function() {
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
};

exports.run = function(base, args) {
  var result = childProcess.spawnSync(process.execPath, [gruntBin, '--gruntfile', gruntfile, '--base', base, '--no-color'].concat(args), {
    encoding: 'utf8'
  });
  result.output = result.stdout + result.stderr;
  return result;
};

exports.read = function(base, name) {
  return fs.readFileSync(path.join(base, name), 'utf8');
};
