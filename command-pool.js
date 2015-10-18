
'use strict';

function startCommandPool(commands, options, callback) {
    return new Promise(function(resolve, reject) {
        var isForEach = Array.isArray(commands);
        var isIterCount = !isForEach && Number.isInteger(commands);
        var count = isForEach ? commands.length : commands;
        var results = [];

        var badTries = {};

        if (!callback) {
            callback = options;
            options = {};
        }

        if (Number.isInteger(options)) {
            options = {
                parallel: options
            };
        }

        var index = 0;
        var inWork = 0;
        var MAX = options.parallel || Infinity;
        var TRY_COUNT = options.tryCount || 1;
        var stopOnFirstError = options.stopOnFirstError || true;
        var emergencyStop = false;
        var error = null;

        if (!isForEach && !isIterCount) {
            throw new Error('Unsupported input type.');
        }

        while (inWork < MAX) {
            inWork++;
            callback(isForEach ? commands[index] : index).then(onSuccess.bind(null, index), onFail.bind(null, index));

            index++;

            if (index === count) {
                break;
            }
        }

        function onSuccess(i, data) {
            inWork--;
            results[i] = data;

            runNext();
        }

        function onFail(i, er) {
            inWork--;

            badTries[i] = badTries[i] || 0;
            badTries[i]++;

            if (TRY_COUNT > badTries[i]) {
                inWork++;
                callback(isForEach ? commands[i] : i).then(onSuccess.bind(null, i), onFail.bind(null, i));

            } else if (!error) {
                error = er;

                if (stopOnFirstError) {
                    emergencyStop = true;
                }
            }
        }

        function runNext() {
            if (inWork === 0 && emergencyStop) {
                reject(error);

            } else if (inWork === 0 && index === count) {
                resolve(results);

            } else if (index !== count) {
                inWork++;
                callback(isForEach ? commands[index] : index).then(onSuccess.bind(null, index), onFail.bind(null, index));

                index++;
            }
        }
    });
}

module.exports = {
    start: startCommandPool
};
