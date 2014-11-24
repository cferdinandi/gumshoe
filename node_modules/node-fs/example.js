//
// Require our fs lib, not the original.
//
var fs = require('./lib/fs');

//
// Example with non-recursion.
//
fs.mkdir('/tmp/example_dir/first/second/third/fourth/fifth', 0777, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Directory created');
  }
});

//
// Example with recursion -- notice the parameter
// right before the callback function.
//
fs.mkdir('/tmp/example_dir/first/second/third/fourth/fifth', 0777, true, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Directory created');
  }
});

//
// Synchronous example with recursion.
//
fs.mkdirSync('/tmp/example_sync/first/second/third/fourth/fifth', 0777, true);
