## grunt-ensure v0.1

>Ensures production files have associated best practice files which typically include Unit Tests, Documentation etc.
A Alpha feature includes the ability to process templates that can update and create test runners, and create js tests skeletons
for QUnit, JUnit, and Jasmine

## Installation
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started)
guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.
Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-ensure --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-ensure');
```

## Ensure task
_Run this task using the `grunt ensure` command._

- Matches production files to best practice files (QUnit, Doc's etc)
- If templating information is present any missing best practice files will be created
- If any production files cannot be matched to best practice files the task will abort grunt

## How ensure works
Ensure is a multi-task grunt plugin that allows you to match production files to best practice files. Ensure accepts 1:n
targets so that it can look for different types of practice files

### Matching Production to Practice Files
Ensure expects practice files to be at least a substring of the associated production file.  An exact match is not required
since ensure can normalize the names by removing prefix or suffix information from the practice or production files before
comparing them, for instance any of these practice files could be matched using ensures normalization settings

*Production* - /website/js/lib/myDate.js

*Practice*
- /website/js/lib/q.myDate.js
- /test/lib/myDate.js
- /test/lib/test.myDate.js

## Telling Ensure what to do using the grunfile

### Options
#### ignoreCase
Type: `Boolean`

Tells ensure to treat case mismatches as warnings instead of errors


`practice`
An array that grunt uses to create a list of practice files



### Sample Gruntfile Setup

```javascript
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig( {

        ensure: {
            options: {
                ignoreCase     : false,
                weakReferences : false,
                showOrphans    : false
            },
            qJS : {
                options         : {
                },

                practiceName : "QUnit Test"

                production   : {
                    root     : "tmp/website/",
                    pattern  : ["tmp/website/**/*.js", "!tmp/website/*.js", "!tmp/website/vendor/**"],
                    options  : {
                        filter : "isFile"
                    },
                    normalize : {
                        suffix  : "js",
                        prefix  : null
                    }
                },

                practice      : {
                    root      : "tmp/tests/unit/",
                    pattern   : ["tmp/tests/unit/**/q.*.js", "!tmp/tests/unit/*.js"],
                    normalize : {
                        prefix  : "q",
                        suffix  : "js"
                    }
                },

                templates   : {
                    vendor       : [],
                    utils        : [],
                    perRoot      : [],
                    perDir       : [],
                    perFile      : []
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-ensure');

    // Sample tasks
    grunt.registerTask('test', ['ensure' ]);
    grunt.registerTask('default', ['ensure']);

};
```