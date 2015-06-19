/*global describe:false, it:false*/
/*exported should*/
var cluster = require('cluster'),
    should = require('should'),
    rewire = require('rewire'),
    sinon = require('sinon'),
    wrapper = rewire('./../index'),
    request = require('supertest')('http://localhost:1337');

describe('cluster', function () {
    'use strict';

    it('wrapper should be an instance of a function', function () {
        wrapper.should.be.an.instanceof(Function);
    });
});

describe('cluster with 1 single core', function () {
    'use strict';

    var revert = wrapper.__set__('cpus', [0]);

    it('should start the HTTP server without error', function (done) {
        wrapper('rewire');
        request.get('/').expect(200, done);
    });
    revert();
});

describe('cluster with no master', function () {
    'use strict';

    var clusterMock = {
        isMaster: false
    };

    it('should start the HTTP server without error', function (done) {
        wrapper = rewire('./../index');
        var revert = wrapper.__set__('cluster', clusterMock);
        wrapper('rewire');
        wrapper.__get__('cluster.isMaster').should.equal(false);
        done();
        revert();
    });
});

describe('cluster with only master', function () {
    'use strict';

    var clusterMock = {
        isMaster: true,
        fork: function () {
            return true;
        },
        on: function () {
            return true;
        }
    };


    it('should call fork', function (done) {
        var revert = wrapper.__set__('cluster', clusterMock),
            spy = sinon.spy(clusterMock, 'fork');
        wrapper('rewire');
        spy.callCount.should.equal(require('os').cpus().length);
        done();
        revert();
    });
});

describe('Cluster HTTP Server', function () {
    'use strict';

    it('should start the HTTP server without error', function (done) {
        if (cluster.isMaster) {
            wrapper('./test-http-server');
        } else {
            // worker
            cluster.isWorker.should.equal(true);
        }

        request.get('/').expect(200, done);
    });
});
