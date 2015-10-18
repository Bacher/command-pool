# Command-Pool

Library for limiting parallel work.

### Usage:

#### API:

Static method **.start** (returns a Promise):

````javascript
CommandPool.start(commandArguments, options, callback);
````

* commandArguments (Array|Number) - Array of arguments for commands or count of iterations;
* options (Optional, Object|Number) - Options, if Number then uses as options.parallel (see below);
    * options.parallel (Optional, Number) - Count of parallel work tasks;
    * options.tryCount (Optional, Number, Default = 1) - Count of try run task (in case of reject or throwing Error);
    * options.stopOnFirstError (Optional, Boolean, Default = true) - If it is not needed to reject when occur error;
* callback (Function) - Function that call on task, **must return a Promise**;

#### Example:
````javascript
var CommandPool = require('command-pool');

CommandPool.start(6, 3, function(i) {
    return new Promise(function(resolve, reject) {
        console.log('%s started', i);

        setTimeout(function() {
            console.log('%s resolved', i);
            resolve('OK');
        }, Math.floor(Math.random() * 2000));
    });
}).then(function(data) {
    console.log('RESULT:', data);
}, function(error) {
    console.log('ERROR:', error);
});
````

#### Output:
````
0 started
1 started
2 started
0 resolved
3 started
1 resolved
4 started
3 resolved
5 started
2 resolved
4 resolved
5 resolved
RESULT: [ 'OK', 'OK', 'OK', 'OK', 'OK', 'OK' ]
````
