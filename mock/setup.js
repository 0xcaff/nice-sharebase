// Sets up nock to respond to requests to the mock endpoint.
import nock from 'nock';

import { handle, authenticate } from './utils';

export const DEFAULT_ENDPOINT = 'http://mock.com/';

// TODO: move this log wrangling
export const logs = [];

global.beforeEach && beforeEach(() => logs.length = 0);

const promisify = (inner) =>
  function promiseWrapper(url, body, cb) {
    inner(this.req)
      .then((...args) => cb(null, ...args))
      .catch(err => cb(err));
  };

const translate = (inner) =>
  promisify(async req => {
    log(req.path);
    const { status, message, headers } = await inner(req);
    return [ status, message, headers ];
  });

const log = (path) => logs.push(path);

// Setups nock to intercept and handle HTTP requests.
export const setup = ({
  // The base url at which we will capture all traffic to.
  endpoint = DEFAULT_ENDPOINT,

  // Whether or not the authentication is required before accessing data. This
  // is used when testing.
  authEnabled = true,

  // The set of email:password allowed to access to get access tokens to this
  // site.
  users = new Set(['sam.babic@onbase.com:password']),

  // The set of allowed access tokens.
  allowed = new Set(),
} = {}) => {
  const app = nock(endpoint);
  app
    .get('/api/authenticate')
    .times(Infinity)
    .reply(translate(async req => authenticate(req.headers, allowed, users)));

  app
    .get(() => true)
    .times(Infinity)
    .reply(translate(req => handle(req.path, req.headers, allowed, authEnabled)));

  return app;
};