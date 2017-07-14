const utils = require.requireActual('../utils');

utils.token = jest.fn(() => {
  const calls = utils.token.mock.calls.length;
  return `Session${calls}`;
});

module.exports = utils;
