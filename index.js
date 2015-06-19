var cluster = require('cluster'),
    cpus = require('os').cpus();

module.exports = function (serverPath) {
    'use strict';

    if (cluster.isMaster) {
        // Fork workers
        cpus.forEach(function () {
            cluster.fork();
        });
    } else {
        // Workers can share any TCP server
        require(serverPath);
    }
};
