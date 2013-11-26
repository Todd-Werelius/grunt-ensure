## grunt-ensure v0.1

>Ensures that production files have associated best practice files which typically would be Unit Tests, Documentation etc.
An Alpha feature includes the ability to process templates that can update and create test runners, and create tests skeletons
for QUnit, JUnit, and Jasmine.

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
- Matches production files to best practice files (QUnit, Doc's etc)
- If templating information is present best practice files stubs can be created or updated
- If any production files cannot be matched to best practice files grunt will abort

## How ensure works
Ensure is a multi-task grunt plugin that allows you to match production files to best practice files. Ensure accepts 1:n
targets so that it can look for different types of practice files for each target like

- QUnit javascript files
- JUnit javascript files
- JSDoc files
- Etc.

```javascript
ensure : {
    JUnit : {  Target Scope
    },
    JSDoc : {  Target Scope
    }
```

Target's are names that you provide to carry out a specific ensure task for instance


The following command runs ensure against all targets (JUnit and JSDoc) in placement order
```shell
grunt ensure
```

The following command runs ensure only against the JUnit target
```shell
grunt ensure:JUnit
```


## Telling Ensure what to do using the gruntfile.js

### Options
In grunt options are declared at the task scope and or the target scope.  If an options object is present at both the task
and target scope they are merged, with the target scope object overwriting and or adding properties to items already in the
task scope

```javascript
ensure : {
    options  : { // Task scope
         ignoreCase          : true,
         allowWeakReferences : false,
         production          : { ...
    }

    myTarget : { // Target Scope
        options : {...
    }
```

#### options.ignoreCase
Type        | Required | default
------------|----------|--------
`Boolean`   | **NO**   | true

By default ensure ignores the case of the production and practice directory and file names to match. Setting this option
to false tells ensure to treat case differences as non-matches when comparing them, and treats any mis-matches as errors
instead of warnings

#### options.allowWeakReferences
Type        | Required | default
------------|----------|--------
`Boolean`   | **NO**   | false


By default ensure requires that any production and practice files that match also have duplicate directory structures after
having their production and practice `root` properties (if any) stripped from there full path names, for instance the 1st
and 2nd files match, the 1st and 3rd would not

Type       | File                    | Root          | Resolves To
-----------|-------------------------|---------------|------------
Production | \site\js\lib\myFile.js  | root=\site\js | \lib\myFile.js
Practice   | \test\lib\myFile.js     | root=\test\   | \lib\myFile.js
Practice   | \test\myFile.js         | ...           | myFile.js

Setting this option to true removes this requirement and only the name is matched, in the above example that means that
both of the practice entries would match resulting in either an orphan practice file or an incorrect match between the
correct production and practice file

#### options.production
Type       | Required
-----------|------
`Object`   | **YES**


```javascript
production : {
    root      : "tmp/website/",
    pattern   : ["tmp/website/**/*.js", "!tmp/website/*.js", "!tmp/website/vendor/**"],
    normalize : {
        suffix  : "js",
        prefix  : null
    }
}
```

The production object tells ensure how to find production files and how to normalize the directory and file names so that
they can be matched against best practice file names.  The ensure `options.production` object is shared among all targets
unless it is overridden in a `options.production` object at the target scope.

- options.production.root `string`
This is the part of the path that will be stripped before being compared to potential practice files

- options.production.pattern `string` |  `Array` of `string`
This pattern is used to search for production files, using entries from the example option.production object above

Pattern                | Action
-----------------------|---------------------------------------------------------
"tmp/website/**/*.js"  | recursively searches starting at the website dir for js files
!tmp/website/*.js      | excludes any files found in the root of the website dir
!tmp/website/vendor/** | excludes the entire vendor directory

All of the file specifications are used together to determine which files are considered production files. You can read
more about creating file globbing at [Configuring Grunt Tasks - Globbing Patterns](http://gruntjs.com/configuring-tasks#globbing-patterns)



