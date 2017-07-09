// Sets up nock to respond to requests to the mock endpoint.
import nock from 'nock';
import path from 'path';
import { readFile, first } from './utils';

export const ENDPOINT = 'http://mock.com/';

const setup = app => app
	.get(_ => true)
	.reply(function(url, body, cb) {
		handle.bind(this)(url, body)
			.then((...args) => {
				// setup for next request
				setup(app);
				cb(null, ...args);
			})
			.catch(err => cb(err));
	});

const app = nock(ENDPOINT);
setup(app);

async function handle(p, reqBody) {
	// get path and trim leading /
	p = p.slice(1);

	const paths = [`${p}.json`, `${p}/index.json`]
 		.map(raw => path.resolve(__dirname, raw));

	const result = await first(paths, path => readFile(path));

	if (result !== undefined) {
			return [200, result, {'Content-Type': 'application/json'}];
	} else {
		const message = `Path not found for ${p}. Tried:`;
		const tried = paths.map(path => '\t' + path).join('\n');
		return [404, message + '\n' + tried];
	}
};

