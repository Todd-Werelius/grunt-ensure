## grunt-ensure v0.1

>Takes a specification for production files and attempts to ensure that best practice files such as unit tests or
documentation files exist.

`practice`
An array that grunt uses to create a list of practice files

### Installation

`npm install grunt-ensure`

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