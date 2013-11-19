## grunt-ensure

Makes sure things exist like unit tests, documentation etc. It takes a set of directories with a file extension and searches
the same or another directory for files that contains the same file name with a prefix or suffix attached


### Installation

`npm install grunt-ensure`

### Setup

```javascript
grunt.initConfig({
  ensure: [
    'You are the greatest!',
    'Please, don\'t ever leave. You give me purpose.'
  ]
});

grunt.loadNpmTasks('grunt-ensure');
```