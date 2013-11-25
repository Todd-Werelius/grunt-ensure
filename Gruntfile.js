/*
 * grunt-ensure
 * https://github.com/Todd-Werelius/grunt-ensure
 *
 * Copyright (c) 2013 Todd.Werelius
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig( {

        pkg    : grunt.file.readJSON('package.json'),

        banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
          ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        defaultsObj : {
          globalDefault : true
        },

        jshint: {
          all: [
            'Gruntfile.js',
            'tasks/*.js'
          ],
          options: {
            jshintrc: '.jshintrc',

            globals : {
                require : false
            }
          }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
          tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        ensure: {
            options: {
                forceDirMatch   : false,
                warnDirMismatch : true
            },
            qJS : {
                banner          : "Ensuring Production.js files have Q.Production.js Unit Tests",
                options         : {
                },

                production  : {
                    root    : "tmp/website/",
                    pattern : ["tmp/website/**/*.js", "!tmp/website/*.js", "!tmp/website/vendor/**"],
                    options : {
                        filter : "isFile"
                    },
                    normalize : {
                        suffix  : "js",
                        prefix  : null
                    }
                },

                practice     : {
                    root     : "tmp/tests/unit/",
                    pattern  : ["tmp/tests/unit/**/q.*.js", "!tmp/tests/unit/*.js"],
                    options  : {
                        filter : "isFile"
                    },
                    normalize : {
                        prefix  : "q",
                        suffix  : "js"
                    },
                    orphans : {
                        list : true,
                        del  : false
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

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'ensure', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
