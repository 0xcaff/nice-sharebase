import fs from 'fs';
import url, { URLSearchParams } from 'url';
import path from 'path';

// Returns the result of the first value in elems send through predicate which didn't throw an error.
export async function first(elems, predicate) {
	for (let elem of elems) {
		const { result, error } = await tryIt(_ => predicate(elem));
		if (!error) {
			return result;
		}
	}
}

// Wraps fs.readFile to use promises.
export const readFile = (...args) =>
  new Promise((resolve, reject) =>
    fs.readFile(...args, (err, data) => {
      if (err) { reject(err) } else { resolve(data) }
    })
  );

// Async returns an object with an error if one was caught. Otherwise returns the
// result.
export const tryIt = async (it) => {
  try {
    return {result: await it()};
  } catch(e) {
    return {error: e};
  }
};

// If a folder is requested with embeddings added, add we add them here.
export async function embedIfNeeded(folder, location) {
  const params = new URLSearchParams(location.search);
  const embed = params.get('embed');

  if (!embed) {
    return folder;
  }

  const embeds = embed.split(',');
  folder = JSON.parse(folder);

  const id = folder['FolderId'];
  if (embeds.includes('f')) {
    // try to embed folders
    const file = path.resolve(__dirname, `api/folders/${id}/folders.json`);

    const { result, error } = await tryIt(_ => readFile(file));
    if (!error && result) {
      const folders = JSON.parse(result);
      folder["Embedded"]["Folders"].push(...folders);
    }
  }

  // try to get folders
  if (embeds.includes('d')) {
    // try to embed documents
    const file = path.resolve(__dirname, `api/folders/${id}/documents.json`);

    const { result, error } = await tryIt(_ => readFile(file));
    if (!error && result) {
      const documents = JSON.parse(result);
      folder["Embedded"]["Documents"].push(...documents);
    }
  }

  return JSON.stringify(folder);
};

export async function handle(p) {
  const location = url.parse(p);
  p = location.pathname.slice(1);

	const paths = [`${p}.json`, `${p}/index.json`]
 		.map(raw => path.resolve(__dirname, raw));

  const result = await first(paths, path => readFile(path));
  if (result !== undefined) {
    const status = 200;
    const message = await embedIfNeeded(result, location);
    const headers = {'Content-Type': 'application/json'};

    return { status, message, headers };
  } else {
    const status = 404;
		const pre = `Path not found for ${p}. Tried:`;
		const tried = paths.map(path => '\t' + path).join('\n');
    const message = pre + '\n' + tried;

    return { status, message };
  }
}
