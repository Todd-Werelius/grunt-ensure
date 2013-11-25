## grunt-ensure v0.1

>Validates that production files have associated best practice files which typically include Unit Tests, Documentation etc.
beta features also include the ability to process templates that can update and create test runners and js tests skeletons
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