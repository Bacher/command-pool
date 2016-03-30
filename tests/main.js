
var expect = require('chai').expect;
var CP     = require('../command-pool');

describe('common functionality', function() {
    describe('as promise', function() {
        describe('in series', function() {
            it('worked', function(done) {
                CP.start(7, function() {
                    return new Promise(function(resolve) {
                        setTimeout(resolve);
                    });
                }).then(function(data) {
                    expect(data.length).to.equal(7);
                    done();
                });
            });

            it('correct result', function(done) {
                CP.start(7, function(i) {
                    return new Promise(function(resolve) {
                        setTimeout(resolve.bind(null, 'OK' + i));
                    });
                }).then(function(data) {
                    expect(data.length).to.equal(7);
                    for (var i = 0; i < 7; i++) {
                        expect(data[i]).to.equal('OK' + i);
                    }
                    done();
                });
            });
        });

        describe('parallel', function() {
            it('worked', function(done) {
                CP.start(7, 3, function() {
                    return new Promise(function(resolve) {
                        setTimeout(resolve);
                    });
                }).then(function(data) {
                    expect(data.length).to.equal(7);
                    done();
                });
            });

            it('correct result', function(done) {
                CP.start(7, 3, function(i) {
                    return new Promise(function(resolve) {
                        setTimeout(resolve.bind(null, 'OK' + i));
                    });
                }).then(function(data) {
                    expect(data.length).to.equal(7);
                    for (var i = 0; i < 7; i++) {
                        expect(data[i]).to.equal('OK' + i);
                    }
                    done();
                });
            });
        });
    });

    describe('as next', function() {
        describe('in series', function() {
            it('worked', function(done) {
                CP.start(7, function(i, next) {
                    setTimeout(next);
                }).then(function(data) {
                    expect(data.length).to.equal(7);
                    done();
                });
            });

            it('correct result', function(done) {
                CP.start(7, function(i, next) {
                    setTimeout(next.bind(null, null, 'OK' + i));
                }).then(function(data) {
                    expect(data.length).to.equal(7);
                    for (var i = 0; i < 7; i++) {
                        expect(data[i]).to.equal('OK' + i);
                    }
                    done();
                });
            });
        });

        describe('parallel', function() {
            it('worked', function(done) {
                CP.start(7, 3, function(i, next) {
                    setTimeout(next);
                }).then(function(data) {
                    expect(data.length).to.equal(7);
                    done();
                });
            });

            it('correct result', function(done) {
                CP.start(7, 3, function(i, next) {
                    setTimeout(next.bind(null, null, 'OK' + i));
                }).then(function(data) {
                    expect(data.length).to.equal(7);
                    for (var i = 0; i < 7; i++) {
                        expect(data[i]).to.equal('OK' + i);
                    }
                    done();
                });
            });
        });
    });
});

describe('if sync callbacks', function() {
    describe('callback must be called', function() {

        it('once', function(done) {
            CP.start(1, function(i, next) {
                next();
            }).then(function() {
                done();
            });
        });

        it('twice', function(done) {
            var calledCount = 0;

            CP.start(2, function(i, next) {
                calledCount++;
                next();
            }).then(function() {
                expect(calledCount).to.equal(2);
                done();
            });
        });

    });

    describe('reject promise', function() {

        it('if error occur', function(done) {
            CP.start(2, function(i) {
                if (i === 1) {
                    throw new Error('some error');
                } else {
                    next();
                }

            }).catch(function(e) {
                expect(e).to.be.an.instanceof(Error);
                done();
            });
        });

        it('stop iterate', function(done) {
            var calledCount = 0;

            CP.start(5, function(i, next) {
                calledCount++;

                if (calledCount === 2) {
                    throw new Error('some error');
                } else {
                    next();
                }

            }).catch(function(e) {
                expect(e).to.be.an.instanceof(Error);
                expect(calledCount).to.equal(2);
                done();
            });
        });

    });
});

describe('if async callbacks', function() {

    describe('callback must be called', function() {

        it('once', function(done) {
            CP.start(1, function() {
                return Promise.resolve();

            }).then(function() {
                done();
            });
        });

        it('twice', function(done) {
            var calledCount = 0;

            CP.start(2, function() {
                calledCount++;

                return Promise.resolve();

            }).then(function() {
                expect(calledCount).to.equal(2);
                done();
            });
        });

    });

    describe('reject promise', function() {

        it('if error occur', function(done) {
            CP.start(3, function(i, next) {
                if (i === 1) {
                    throw new Error('some error');
                } else {
                    next();
                }

            }).catch(function(e) {
                expect(e).to.be.an.instanceof(Error);
                done();
            });
        });

        it('stop iterate', function(done) {
            var calledCount = 0;

            CP.start(5, 1, function(i, next) {
                calledCount++;

                if (calledCount === 2) {
                    throw new Error('some error');
                } else {
                    next();
                }

            }).catch(function() {
                expect(calledCount).to.equal(2);
                done();
            });
        });

    });

});
