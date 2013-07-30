var depsName  = [],
    rootPath  = process.cwd(),
    bowerPath = rootPath+"/bower_components",

    fs        = require('fs'),
    path      = require('path'),
    bower     = require("bower"),
    grunt     = require('grunt'),
    wrench    = require("wrench"),
    prompt    = require('prompt');

var deps = [
  {name:'jquery', path:"/jquery", file:"jquery.js"},
  {name:'lodash', path:"/lodash", file:"lodash.js"},
  {name:'backbone', path:"/backbone", file:"backbone.js"}
];

deps.forEach(function(el) {
  "use strict";
  depsName.push(el.name);
});

function copyBackboneTestFiles() {
  "use strict";

  var sourcePath = bowerPath+"/backbone/test/",
      testRoot = rootPath+"/test/com/backbone/";

  // Deep-copy an existing directory
  wrench.copyDirSyncRecursive(sourcePath, testRoot, {
    forceDelete: false, // Whether to overwrite existing directory or not
    excludeHiddenUnix: true, // Whether to copy hidden Unix files or not (preceding .)
    preserveFiles: false, // If we're overwriting something and the file already exists, keep the existing
    inflateSymlinks: false, // Whether to follow symlinks or not when copying files
    filter: /index\.html/ // A filter to match files against; if matches, do nothing (exclude).
  });

  var paths = {
    pathToTaquet: '"'+path.relative(testRoot, rootPath+'/taquet.js')+'"',
    pathToBackbone: '"'+path.relative(testRoot, rootPath+'/src/vendor/backbone.js')+'"'
  },
  indexfile = grunt.template.process((fs.readFileSync('./src/out/backbone-test.tmpl').toString()), {data: paths});

  fs.writeFile(testRoot+"index.html", indexfile, function(err) {
    if(err) {
      throw err;
    }
  });
}

function moveFiles() {
  "use strict";
  var sourcePath, targetPath, targetRoot;

  targetRoot = rootPath+"/src/vendor/";
  if(!fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot);
  }

  //move files from bower
  for(var i = 0, l = deps.length; i<l; i++) {
    sourcePath = bowerPath+deps[i].path+"/"+deps[i].file;
    targetPath = targetRoot+deps[i].file;

    fs.renameSync(sourcePath, targetPath);
  }

  copyBackboneTestFiles();
  // Start the prompt
  prompt.start();

  //mainly for Travis. By default, it won't delete the bower_components directory
  setTimeout(prompt.pause, 10000);

  prompt.get([

    {
      name: 'todelete',
      description: ("I'm about to delete the bower_components folder and all its content. y/n").red,
      pattern: /^[yn]$/,
      required: true
    }

  ], function (err, result) {

    if(err) {
      throw err;
    }

    if(result.todelete === "y") {
      //move the
      wrench.rmdirSyncRecursive(bowerPath, true);
    }
  });
}

(function init() {
  "use strict";

  bower.commands
    .install(depsName)
    .on("error", function(error) {
      throw error;
    })
    .on("end", function() {
      moveFiles();
    });
}());