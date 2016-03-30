
module.exports = {
    start: function(tasks, parallelCount, callback, endCallback) {
        if (typeof parallelCount === 'function') {
            endCallback = callback;
            callback = parallelCount;
            parallelCount = 1;
        }

        var allCount;

        if (Array.isArray(tasks)) {
            allCount = tasks.length;
        } else if (typeof tasks === 'number') {
            allCount = tasks;
            tasks    = null;
        } else {
            throw new Error('Parameter "tasks" must be type of Array or Number');
        }

        if (allCount === 0) {
            if (endCallback) {
                endCallback(null, []);
            }
            return Promise.resolve([]);

        } else {
            return new Promise(function(resolve, reject) {
                var state = {
                    tasks,
                    allCount,
                    parallelCount,
                    callback,
                    endCallback,
                    i: 0,
                    running: 0,
                    result: [],
                    error: false,
                    resolve,
                    reject,
                    inWhile: false
                };

                checkNext(state);
            });
        }
    }
};

function checkNext(state) {
    state.inWhile = true;

    while (state.running < state.parallelCount && state.i < state.allCount && !state.error) {
        checkNextIter(state);
    }
    state.inWhile = false;
}

function checkNextIter(state) {
    var retValue;
    var curI = state.i++;

    state.running++;

    try {
        if (state.tasks) {
            retValue = state.callback(state.tasks[curI], curI, nextFunc);
        } else {
            retValue = state.callback(curI, nextFunc);
        }
    } catch(e) {
        nextFunc(e);
    }

    if (retValue && retValue.then && typeof retValue.then === 'function') {
        retValue.then(function(data) { nextFunc(null, data); }, nextFunc);
    }

    function nextFunc(err, res) {
        next(state, curI, err, res);
    }
}

function next(state, i, err, res) {
    if (state.result[i] !== undefined) {
        return;
    }

    state.running--;

    if (!state.error) {
        if (err) {
            state.result[i] = null;

            state.error = true;

            err.iterIndex = i;
            if (state.endCallback) {
                state.endCallback(err);
            }
            state.reject(err);

        } else {
            state.result[i] = res;

            if (state.running === 0 && state.i === state.allCount) {
                if (state.endCallback) {
                    state.endCallback(null, state.result);
                }
                state.resolve(state.result);

            } else {
                if (state.inWhile === false) {
                    checkNext(state);
                }
            }
        }
    }
}
