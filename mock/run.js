require('babel-register');
require("regenerator-runtime/runtime");

const server = require('./server');
server.default.listen(30101, '0.0.0.0', function() { console.log('started mock server on port 30101') });
