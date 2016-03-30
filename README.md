# Command-Pool

Library for limiting parallel work.

### Installation:

```
npm install --save command-pool
```

### Usage:

#### API:

Static method **.start** (returns a Promise):

```javascript
CommandPool.start(commandArguments, [parallelCount], callback);
```
* commandArguments (Array) - Array of arguments for commands or count of iterations;
* parallelCount (Optional, Number, Default = 1) - Count of parallel work tasks;
* callback (Function(arg, i, next)) - Function that calls on task, **you must return a Promise or call next()**;

```javascript
CommandPool.start(tasksCount, [parallelCount], callback);
```
* tasksCount (Number) - Count of iterations;
* parallelCount (Optional, Number, Default = 1) - Count of parallel work tasks;
* callback (Function(i, next)) - Function that calls on task, **you must return a Promise or call next()**;

#### Example:
```javascript
var CommandPool = require('command-pool');

CommandPool.start(5, 3, function(i) {
    console.log('%s started', i);

    setTimeout(function() {
        console.log('%s resolved', i);
        next(null, 'OK');
    }, Math.floor(Math.random() * 2000));
}).then(function(data) {
    console.log('RESULT:', data);
}, function(error) {
    console.log('ERROR:', error);
});
```

#### Output:
```
0 started
1 started
2 started
0 resolved
3 started
1 resolved
4 started
3 resolved
2 resolved
4 resolved
RESULT: [ 'OK', 'OK', 'OK', 'OK', 'OK' ]
```

#### Caution:
Work only in node version >= 0.12.
