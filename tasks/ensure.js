/*
 * grunt-ensure
 * https://github.com/Todd-Werelius/grunt-ensure
 *
 * Copyright (c) 2013 Todd.Werelius
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

    'use strict';

    var
          _    = require("underscore"),
        path   = require("path"),
        DEBUG  = 1,
        ERROR  = 2,
        WARN   = 3,
        OK     = 4,
        NORMAL = 5,

        stripName = function(parts,prefix,suffix) {
            var file;

            if (!parts || 0 === parts.length) {
                return "";
            }

            if ( prefix  && _.first(parts) === prefix ) {
                file = "";
            } else
                file  = _.first(parts) + ".";

            _.each(_.rest(_.initial(parts),1),function(part,index,list){
                file = file + part + ".";
            });

            if (!suffix || _.last(parts) !== suffix) {
                file = file + _.last(parts);
            }

            return file.substring(0,file.length-1);
        },

        stripPath = function stripRootFromPath(root,path) {
            var dir = path;

            if (root && root.length <= dir.length)  {
                if (root.toLowerCase() === dir.substring(0,root.length).toLowerCase()) {
                    dir = dir.substring(root.length);
                }
            }

            return dir;
        },

        /***
         * Map entries to a common format for comparison with pointers to original data
         * @param list
         * @param root
         * @param prefix
         * @param suffix
         */
        stripFile = function mapNormalize(list,root,prefix,suffix) {

            var set = {};

            _.each(list,function(entry,index){
                set[stripName(path.basename(entry).split('.'),prefix,suffix)+"#"+stripPath(root,path.dirname(entry))] = index;
            });

            return set;
        },

        /***
         * Takes two objects that each represent a set, if it finds an intersection it removes the entry from
         * both objects and adds it to an intersection set
         *
         * @param production      {object} contains a list of key/value pairs, the key is a name#dir entry
         *                           that identifies a file, the value is an index to the original entry
         *                           and has no use in this function

         * @param shouldHave      {object} contains a list of key/value pairs, the key is a name#dir entry
         *                           that identifies a file, the value is an index to the original entry
         *                           and has no use in this function

         * @returns {object} the intersection of both passed in objects
         *
         */
        mapToSet = function mapSets( production, shouldHave ) {

            var
                intersection = {}
            ;

            _.each(production, function( value, key, set) {

                if (_.has(shouldHave,key)) {
                    intersection[key] = value; // add it to the intersection list
                    delete set[key];           // remove it from both objects
                    delete shouldHave[key];
                }
            });

            //_.each(shouldHave, function( value, key, set) {
            //    if (_.has(production,key)) {
            //        is[key] = value;  // add it to the intersection list
            //        delete set[key];  // remove it from both objects
            //        delete production[key];
            //    }
            //});

            return intersection;
        },

        logWriter = function logWriter(message,level,bold) {
            var logger;

            switch(level) {
                case DEBUG:
                    process.stdout.write(message.blue+"\n");
                break;

                case OK:
                    process.stdout.write(message.green+"\n");
                break;

                case ERROR:
                    if (bold)
                        process.stdout.write(message.red.bold+"\n");
                    else
                        process.stdout.write(message.red+"\n");
                break;

                default:
                case WARN:
                    process.stdout.write(message.yellow+"\n");
                break;
                case NORMAL:
                    process.stdout.write(message+"\n");
                break;
            }


        },

        logArray = function debugList(name,list,level) {

            logWriter(name,level);
            _.each(list,function(item){
                logWriter(" "+item,NORMAL);
            });

        },

        logSet = function logSet(prefix, set, lookup, level) {

            _.each(set,function(value,key){
                if (lookup && lookup.length > value) {
                    logWriter(" " + prefix + " " + lookup[value],level);
                } else
                {
                    logWriter("  LOOKUP FAILED " + key,ERROR);
                }
            });
        }

    ;

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks
    grunt.registerMultiTask('ensure', 'Make sure unit tests, docs etc. exist', function() {

        var
            options        = this.options(),
            debug          = grunt.option("debug"),
            kvProduction   = {},
            kvBestPractice = {},
            kvIntersection     ,
            productionFiles    ,
            bestPracticeFiles  ,
            good,
            bad,
            warn,

            // The default is to ignore directories
            globOptions = {
                filter : "isFile"
            }
        ;

        // Print out the task:target banner, process it for template embeds
        //if (this.data.banner) {
        //    grunt.log.subhead(grunt.config.process(this.data.banner));
        //}

        // Get all of the production files
        this.data.production.options   = this.data.production.options ? _.extend(globOptions,this.data.production.options) : globOptions;
        productionFiles            = grunt.file.expand(this.data.production.options, this.data.production.pattern );

        // Get all of the files that might be associated
        this.data.practice.options = this.data.practice.options ?  _.extend(globOptions,this.data.practice.options) : globOptions;
        bestPracticeFiles          = grunt.file.expand(this.data.practice.options, this.data.practice.pattern);

        // Map phase - normalize and map into 2 unique sets, and 1 intersection set
        kvBestPractice = stripFile( bestPracticeFiles, this.data.practice.root, this.data.practice.normalize.prefix, this.data.practice.normalize.suffix );
        kvProduction   = stripFile( productionFiles , this.data.production.root, this.data.production.normalize.prefix, this.data.production.normalize.suffix );
        kvIntersection = mapToSet( kvProduction, kvBestPractice );

        if (debug) {
            logArray("Production files",productionFiles,DEBUG);
            logArray("QUnit files",bestPracticeFiles,DEBUG);
            logSet("Production Orphans",kvProduction,productionFiles,DEBUG);
            logSet("QUnit Orphans",kvBestPractice,bestPracticeFiles,DEBUG);
        }

        good = _.size(kvIntersection);
        warn = _.size(kvBestPractice);
        bad  = _.size(kvProduction);

        if ( bad ) {
            logWriter("\nEnsure detected " + bad + " missing " + "QUnit Test",ERROR,true);
            logSet("QUnit Test MISSING :",kvProduction,productionFiles,ERROR);
            if ( warn )
                logSet("QUnit Test ORPHAN  :", kvBestPractice,bestPracticeFiles,WARN);
            logSet("QUnit Test FOUND   :",kvIntersection,productionFiles,OK);
            logWriter("",NORMAL);
            grunt.fatal("QUnit Test MISSING");
        } else if ( warn ) {
            logWriter("\nEnsure found " + good + " " +"QUnit Tests" + " for "+ productionFiles.length +" production files, QUnit orphans found",WARN,true);
            logSet("ORPHANS", kvBestPractice,bestPracticeFiles,WARN);
        } else {
            logWriter("\nEnsure found " + good + " " +"QUnit Tests" + " for "+ productionFiles.length +" production files",OK,true);

        }

        //if ((warn = _.size(kvBestPractice))) {
        //    logSet(warn+" Orphaned "+"QUnit"+" tests found; clean up your mess!",kvBestPractice,bestPracticeFiles,WARN);
        //}

        //if ((bad = _.size(kvProduction))) {
        //    logSet(bad+" Production files are missing "+"QUnit"+" tests!",kvProduction,productionFiles,ERROR);
        //    grunt.fatal("Ensure cannot find QUnit Test files");
        //}


    });
};



/*toType = function toType(type) {
    return ({}).toString.call(type).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
},

    getOrdinal = function getOrdinal(num) {

        var s = ["th","st","nd","rd"],
            v = num%100;

        return ( 0 === num ) ? 0 : num+(s[(v-20)%10]||s[v]||s[0]);
    },

    OBJECT     = "object"   ,
    ERROR      = "error"    ,
    ARRAY      = "array"    ,
    NUMBER     = "number"   ,
    ARGUMENTS  = "arguments",
    DATE       = "date"     ,
    REGEX      = "regexp"   ,
    JSON       = "json"     ,
    STRING     = "string"   ,
    BOOLEAN    = "boolean"  ,
    MATH       = "math"     ,
    NULL       = "null"     ,
    UNDEFINED  = "undefined",
    FUNCTION   = "function"
*/