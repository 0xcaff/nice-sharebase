// Sets up nock to respond to requests to the mock endpoint.
import nock from 'nock';
import path from 'path';
import { readFile, first } from './utils';

export const ENDPOINT = 'http://mock.com/';
const app = nock(ENDPOINT)
  .get(_ => true)
	.reply(function(url, body, cb) {
		handle.bind(this)(url, body)
			.then((...args) => cb(null, ...args))
			.catch(err => cb(err));
	});

async function handle(_, reqBody) {
	// get path and trim leading /
	// TODO: possibly from params
	const p = this.req.path.slice(1);

  const paths = [`${p}.json`, `${p}/index.json`]
 		.map(raw => path.resolve(__dirname, raw));

	const result = await first(paths, path => readFile(path));

	if (result !== undefined) {
			return [200, result, {'Content-Type': 'application/json'}];
	} else {
		// TODO: properly mock the failure case
		return [404, `Path not found for ${p}. Tried: ${paths.join('\n')}`];
	}
};

