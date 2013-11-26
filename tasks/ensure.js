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
    grunt.registerMultiTask('ensure', "Ensures production files have associated best practice files which " +
                            "typically include Unit Tests, Documentation etc.", function() {

        var
            options         = this.options(),
            debug           = grunt.option("debug"),
            production      = options.production,
            practice        = this.data.practice,
            filter          = {filter:"isFile"},
            name            = this.data.name ? this.data.name : "Best Practice File",
            productionSet   = {},
            practiceSet     = {},
            intersectionSet,
            productionFiles,
            bestPracticeFiles,
            good,
            bad,
            warn
        ;

        // Get all production files and normalize the names for matching into a set
        productionFiles   = grunt.file.expand(filter  , production.pattern );
        productionSet     = stripFile( productionFiles  , production.normalize.root,production.normalize.prefix, production.normalize.suffix );

        // Get all practice files that might be associated and normalize the names for matching into a set
        bestPracticeFiles = grunt.file.expand(filter, practice.pattern   );
        practiceSet       = stripFile( bestPracticeFiles, practice.normalize.root , practice.normalize.prefix  , practice.normalize.suffix   );

        // Map phase - create an intersection set and remove found files from normalized sets
        intersectionSet = mapToSet( productionSet, practiceSet );

        good = _.size(intersectionSet);
        warn = _.size(practiceSet);
        bad  = _.size(productionSet);

        if ( bad ) {
            logWriter("\nEnsure detected " + bad + " missing " + name,ERROR,true);
            logSet(name + " MISSING :",productionSet,productionFiles,ERROR);
            logWriter("",NORMAL);
            grunt.fatal(name + " MISSING");
        } else if ( warn ) {
            logSet(name + " FOUND   :",intersectionSet,productionFiles,OK);
            logWriter("",NORMAL);
            logWriter("\nEnsure found " + good + " " + name + "(s) for "+ productionFiles.length +" production file(s), "+name+" orphans found",WARN,true);
            logSet("ORPHANS", practiceSet,bestPracticeFiles,WARN);
        } else {
            logWriter("\nEnsure found " + good + " " + name + "(s) for "+ productionFiles.length +" production file(s)",OK,true);

        }
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