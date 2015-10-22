
var expect = require('chai').expect;
var commandPool = require('../command-pool');

function noop() {}

describe('if sync callbacks', function() {
    describe('callback must be called', function() {

        it('once', function(done) {
            commandPool.start(1, noop).then(function() {
                done();
            });
        });

        it('twice', function(done) {
            var calledCount = 0;

            commandPool.start(2, function() {
                calledCount++;

            }).then(function() {
                expect(calledCount).to.equal(2);
                done();
            });
        });

    });

    describe('reject promise', function() {

        it('if error occur', function(done) {
            commandPool.start(2, function(i) {
                if (i === 1) {
                    throw new Error('some error');
                }

            }).catch(function(e) {
                expect(e).to.be.an.instanceof(Error);
                done();
            });
        });

        it('stop iterate', function(done) {
            var calledCount = 0;

            commandPool.start(3, function() {
                calledCount++;

                if (calledCount === 2) {
                    throw new Error('some error');
                }

            }).catch(function() {
                expect(calledCount).to.equal(2);
                done();
            });
        });

        it('don\'t stop if present "continueWithErrors" option', function(done) {
            var calledCount = 0;

            commandPool.start(3, {
                continueWithErrors: true
            }, function() {
                calledCount++;

                if (calledCount === 2) {
                    throw new Error('some error');
                }

            }).then(function() {
                expect(calledCount).to.equal(3);
                done();
            });
        });

    });
});

describe('if async callbacks', function() {

    describe('callback must be called', function() {

        it('once', function(done) {
            commandPool.start(1, function() {
                return Promise.resolve();

            }).then(function() {
                done();
            });
        });

        it('twice', function(done) {
            var calledCount = 0;

            commandPool.start(2, function() {
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
            commandPool.start(3, function(i) {
                if (i === 1) {
                    throw new Error('some error');
                }

            }).catch(function(e) {
                expect(e).to.be.an.instanceof(Error);
                done();
            });
        });

        it('stop iterate', function(done) {
            var calledCount = 0;

            commandPool.start(3, 1, function() {
                calledCount++;

                if (calledCount === 2) {
                    throw new Error('some error');
                }

            }).catch(function() {
                expect(calledCount).to.equal(2);
                done();
            });
        });

        it('don\'t stop if present "continueWithErrors" option', function(done) {
            var calledCount = 0;

            commandPool.start(3, {
                continueWithErrors: true
            }, function() {
                calledCount++;

                if (calledCount === 2) {
                    return Promise.reject();
                } else {
                    return Promise.resolve();
                }

            }).then(function() {
                expect(calledCount).to.equal(3);
                done();
            });
        });

    });

});
