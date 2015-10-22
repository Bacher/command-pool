
var CommandPool = require('./../command-pool');

var result = CommandPool.start(10, {
    parallel: 3,
    tryCount: 2
}, function(i) {
    return new Promise(function(resolve, reject) {

        console.log('%s started', i);

        setTimeout(function() {
            if (i !== 8) {
                console.log('%s resolve', i);
                resolve(i)

            } else {
                console.log('%s reject', i);
                reject('BAD');
            }

        }, Math.floor(Math.random() * 3000));

    });
});

result.then(function(data) {
    console.log('RESULT:', data);
}, function(error) {
    console.log('ERROR:', error);
});

