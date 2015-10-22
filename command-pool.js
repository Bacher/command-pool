
'use strict';

function noop() {}

function startCommandPool(commands, options, callback) {
    return new Promise(function(resolve, reject) {
        var isForEach = Array.isArray(commands);
        var isIterCount = !isForEach && Number.isInteger(commands);
        var count = isForEach ? commands.length : commands;
        var lastIndex = count - 1;
        var results = [];
        var end = false;

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

        var index = -1;
        var inWork = 0;
        var MAX = options.parallel || Infinity;
        var TRY_COUNT = options.tryCount || 1;
        var continueWithErrors = options.continueWithErrors || false;
        var error = null;

        if (!isForEach && !isIterCount) {
            throw new Error('Unsupported input type.');
        }

        while (inWork < MAX && index !== lastIndex && !end) {
            index++;
            startCommand(index);
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
                startCommand(i);

            } else if (!error && !continueWithErrors) {
                error = er;
                runNext(true);
            }
        }

        function runNext(checkExit) {
            if (!end) {
                if (inWork === 0 && error) {
                    reject(error);
                    end = true;

                } else if (inWork === 0 && index === lastIndex) {
                    resolve(results);
                    end = true;

                } else if (index !== lastIndex && (!error || continueWithErrors) && !checkExit) {
                    index++;
                    startCommand(index);
                }
            }
        }

        function startCommand(index) {
            inWork++;
            var result;

            try {
                result = callback(isForEach ? commands[index] : index);
            } catch(e) {
                onFail(index, e);
                return;
            }

            if (result instanceof Promise) {
                result.then(onSuccess.bind(null, index), onFail.bind(null, index));
            } else {
                onSuccess(index, result);
            }
        }

    });
}

module.exports = {
    start: startCommandPool
};
