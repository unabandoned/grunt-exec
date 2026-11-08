'use strict';

var path = require('node:path');

// Run by test/helpers/grunt.js with --base set to a temporary directory, so
// every relative path below (and every command's default cwd) is inside it.
module.exports = function(grunt) {
  grunt.initConfig({
    exec: {
      test1: {
        cmd: 'echo bruce willis was dead> test1'
      }
    , test2: {
        cmd: function() { return 'echo grunt@' + this.version + '> test2'; }
      }
    , test3: {
        cmd: function(answerToLife, tacoThoughts) {
          var text = [
            'the answer to life is ' + answerToLife
          , 'thoughts on tacos? ' + tacoThoughts
          ].join(', ');

          return 'echo ' + text + '> test3';
        }
      }
    , test4: {
        cmd: function(){
          return 'echo you can use callback, and error, stdout, stderr can be' +
           ' used as arguments';
        }
      , callback: function(error, stdout, stderr){
          var fs = require('fs')
            , path = require('path')
            , outputPath = path.resolve(process.cwd(), 'test4');

          console.log('outputPath : ' + outputPath);
          console.log('stderr: ' + stderr);

          try {
            fs.writeFileSync(outputPath, stdout, 'utf-8');
          } catch (err) {
            console.error(err.stack);
          }
        }
      }
    , test5: {
        cmd: 'node -e "process.exit(8);"'
      , exitCodes: 8
      , shell: true
      }
    , test6: {
        cmd: 'node -e "process.exit(9);"'
      , exitCodes: [8, 9]
      , shell: true
      }
    , test7: 'echo you do not even need an object> test7'
    , test8: {
      cmd: 'node -e "console.log(\'synchronous echo 1\'); process.exit(0);"',
      sync: true,
      shell: true
    }
    , test9: {
      cmd: 'node -e "setTimeout(function () { console.log(\'synchronous echo 2, wait 3 seconds\'); process.exit(0); }, 3000);"',
      sync: true,
      shell: true
    }
    , test10: {
      cmd: 'node -e "console.log(\'synchronous echo 3\'); process.exit(0);"',
      sync: true,
      shell: true
    }

    // Fork additions: the option combinations TheTechNetwork/CyberChef uses,
    // and the failure paths upstream's suite never exercised.
    , fail_exit: 'node -e "process.exit(3);"'
    , missing_command: { stdout: true }
    , loud: 'echo stdout-marker && node -e "console.error(\'stderr-marker\');"'
    , quiet_stdout: {
        cmd: 'echo stdout-marker'
      , stdout: false
      }
    , quiet_stderr: {
        cmd: 'node -e "console.error(\'stderr-marker\');"'
      , stderr: false
      }
    , sync_redirect: {
        cmd: 'node -e "console.log(\'sync redirect\');" > sync.txt'
      , sync: true
      }
    , chained: {
        cmd: 'echo one> chained.txt; echo two>> chained.txt'
      , sync: true
      }
    , in_cwd: {
        cmd: 'echo in cwd> cwd.txt'
      , cwd: 'sub'
      }
    , callback_args: {
        cmd: 'echo callback output'
      , callbackArgs: ['first', 'second']
      , callback: function(error, stdout, stderr, args) {
          require('fs').writeFileSync('callback.json', JSON.stringify({
            error: error, stdout: stdout, args: args
          }));
        }
      }
    , callback_failure: {
        cmd: 'node -e "process.exit(4);"'
      , callback: function(error) {
          require('fs').writeFileSync('failure.json', JSON.stringify({
            message: error && error.message, code: error && error.code
          }));
        }
      }
    }
  });

  grunt.loadTasks(path.join(__dirname, '..', 'tasks'));
};
