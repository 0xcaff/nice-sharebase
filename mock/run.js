require('babel-register');
require("regenerator-runtime/runtime");

const app = require('./server');
app.listen(30101, '0.0.0.0', function() { console.log('started mock server on port 30101') });
