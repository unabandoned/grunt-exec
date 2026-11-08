'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var os = require('node:os');
var path = require('node:path');
var grunt = require('./helpers/grunt');

var lf = os.EOL;

// Upstream's suite: one grunt run over test1..test10, then the files the
// shell redirects and the test4 callback wrote.
test('upstream targets', function(t) {
  var base = grunt.tempDir(t);
  var result = grunt.run(base, [
    'exec:test1', 'exec:test2', 'exec:test3:42:love', 'exec:test4', 'exec:test5',
    'exec:test6', 'exec:test7', 'exec:test8', 'exec:test9', 'exec:test10'
  ]);
  assert.equal(result.status, 0, result.output);

  assert.equal(grunt.read(base, 'test1'), 'bruce willis was dead' + lf);
  assert.equal(grunt.read(base, 'test2'), 'grunt@' + grunt.version + lf);
  assert.equal(grunt.read(base, 'test3'), 'the answer to life is 42, thoughts on tacos? love' + lf);
  assert.equal(grunt.read(base, 'test4'), 'you can use callback, and error, stdout, stderr can be used as arguments' + lf);
  assert.equal(grunt.read(base, 'test7'), 'you do not even need an object' + lf);

  // test8..test10 are sync: their output appears in order.
  var one = result.stdout.indexOf('synchronous echo 1');
  var two = result.stdout.indexOf('synchronous echo 2');
  var three = result.stdout.indexOf('synchronous echo 3');
  assert.ok(one >= 0 && one < two && two < three, result.output);
});

test('an unexpected exit code fails the task', function(t) {
  var result = grunt.run(grunt.tempDir(t), ['exec:fail_exit']);
  assert.notEqual(result.status, 0);
  assert.match(result.output, /Exited with code: 3\./);
});

test('a target without a command fails the task', function(t) {
  var result = grunt.run(grunt.tempDir(t), ['exec:missing_command']);
  assert.notEqual(result.status, 0);
  assert.match(result.output, /Missing command property\./);
});

test('stdout: false hides the command output', function(t) {
  var result = grunt.run(grunt.tempDir(t), ['exec:quiet_stdout']);
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /stdout-marker/);
});

test('stderr: false hides the command error output', function(t) {
  var result = grunt.run(grunt.tempDir(t), ['exec:quiet_stderr']);
  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /stderr-marker/);
});

test('stdout and stderr are shown by default', function(t) {
  var result = grunt.run(grunt.tempDir(t), ['exec:loud']);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /stdout-marker/);
  assert.match(result.output, /stderr-marker/);
});

test('sync: true with a shell redirect', function(t) {
  var base = grunt.tempDir(t);
  var result = grunt.run(base, ['exec:sync_redirect']);
  assert.equal(result.status, 0, result.output);
  assert.equal(grunt.read(base, 'sync.txt'), 'sync redirect\n');
});

test('commands chained with ; run through the shell, as CyberChef chains them', function(t) {
  var base = grunt.tempDir(t);
  var result = grunt.run(base, ['exec:chained']);
  assert.equal(result.status, 0, result.output);
  assert.equal(grunt.read(base, 'chained.txt'), 'one' + lf + 'two' + lf);
});

test('cwd sets the working directory of the command', function(t) {
  var base = grunt.tempDir(t);
  fs.mkdirSync(path.join(base, 'sub'));
  var result = grunt.run(base, ['exec:in_cwd']);
  assert.equal(result.status, 0, result.output);
  assert.equal(grunt.read(base, path.join('sub', 'cwd.txt')), 'in cwd' + lf);
});

test('a callback gets the buffered stdout and callbackArgs', function(t) {
  var base = grunt.tempDir(t);
  var result = grunt.run(base, ['exec:callback_args']);
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(JSON.parse(grunt.read(base, 'callback.json')), {
    error: null,
    stdout: 'callback output' + lf,
    args: ['first', 'second']
  });
});

test('a callback gets an error carrying the exit code', function(t) {
  var base = grunt.tempDir(t);
  var result = grunt.run(base, ['exec:callback_failure']);
  assert.notEqual(result.status, 0);
  assert.deepEqual(JSON.parse(grunt.read(base, 'failure.json')), {
    message: 'Process exited with code 4.',
    code: 4
  });
});
