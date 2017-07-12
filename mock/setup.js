// Sets up nock to respond to requests to the mock endpoint.
import nock from 'nock';

import { handle } from './utils';

export const ENDPOINT = 'http://mock.com/';

export const logs = [];

global.beforeEach && beforeEach(() => logs.length = 0);

const setup = app => app
  .get(() => true)
  .reply(function(url, body, cb) {
    h(url)
      .then((...args) => {
        // setup for next request
        setup(app);
        cb(null, ...args);
      })
      .catch(err => cb(err));
  });

const app = nock(ENDPOINT);
setup(app);

async function h(path) {
  log(path);
  const { status, message, headers } = await handle(path);
  return [status, message, headers];
}

const log = (path) => logs.push(path);

