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
targets so that it can look for different types of practice files such as

- QUnit javascript files
- JUnit javascript files
- JSDoc files
- Etc.

## Telling Ensure what to do using the gruntfile.js

### Options
#### ignoreCase
Type: `Boolean`

By default ensure requires the case of the production and practice files to match. Setting this option to true tells ensure
to lower case all production file and best practice file names before comparing them, and treats any mis-matches as warnings
instead of errors

#### allowWeakReferences
Type: `Boolean`

By default ensure requires that any production and practice files that match also have duplicate directory structures after
having there production and practice `root` properties (if any) stripped from there full path names, for instance the first
and second files match, the third would not

Production \site\js\lib\myFile.js    root=\site\js\   resolves to \lib\myFile.js
Practice   \test\lib\myFile.js       root=\test\      resolves to \lib\myFile.js
Practice   \test\myFile.js           root=\test\      resolves to myFile.js

Setting this option to true removes this requirement and only the name is matched, in the above example that means that
both myFile.js entries would match resulting in either an orphan practice or an incorrect match between the correct
production and practice file

```javascript
production    : {
                    root      : "tmp/website/",
                    pattern   : ["tmp/website/**/*.js", "!tmp/website/*.js", "!tmp/website/vendor/**"],
                    normalize : {
                        suffix  : "js",
                        prefix  : null
                    }
                }

```

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