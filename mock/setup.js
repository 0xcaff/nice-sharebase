// Sets up nock to respond to requests to the mock endpoint.
import nock from 'nock';

import { handle } from './utils';

export const ENDPOINT = 'http://mock.com/';

const setup = app => app
	.get(_ => true)
	.reply(function(url, body, cb) {
		h(url, body)
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
  const { status, message, headers } = await handle(path);
  return [status, message, headers];
};

