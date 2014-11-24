node-fs is an extension to the original [nodejs](http://nodejs.org) [fs library](http://nodejs.org/docs/v0.3.1/api/fs.html), offering new functionalities. See example.js for an example of how to use it.

Right now, the following new operations are supported:

* mkdir(path, mode, [recursive], [callback]): if the 'recursive' parameter is true, creates a directory recursively;
* mkdirSync(path, mode, [recursive]): if the 'recursive' parameter is true, synchronously creates a directory recursively.

[![Build Status](https://secure.travis-ci.org/bpedro/node-fs.png?branch=master)](http://travis-ci.org/bpedro/node-fs)
