## grunt-ensure

Makes sure things exist like unit tests, documentation etc. It takes a set of directories with a file extension and searches
the same or another directory for files that contains the same file name with a prefix or suffix attached, if it cannot
find a match it issues a custom warning to alert you to the missing file.


### Installation

`npm install grunt-ensure`

### Setup

```javascript
grunt.initConfig({
  ensure: [

  ]
});

grunt.loadNpmTasks('grunt-ensure');
```