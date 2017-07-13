import fs from 'fs';
import url, { URLSearchParams } from 'url';
import path from 'path';

const ContentTypeJSON = {'Content-Type': 'application/json'};
const root = path.resolve(__dirname, '../');

const after = (date, n, what) => { date[`set${what}`](n); return date };

let i = 0;
const getNextId = () => i++;

const base64Decode = (encoded) => Buffer.from(encoded, 'base64');

// Returns the result of the first value in elems send through predicate which didn't throw an error.
export async function first(elems, predicate) {
  for (let elem of elems) {
    const { result, error } = await tryIt(() => predicate(elem));
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

    const { result, error } = await tryIt(() => readFile(file));
    if (!error && result) {
      const folders = JSON.parse(result);
      folder['Embedded']['Folders'].push(...folders);
    }
  }

  // try to get folders
  if (embeds.includes('d')) {
    // try to embed documents
    const file = path.resolve(__dirname, `api/folders/${id}/documents.json`);

    const { result, error } = await tryIt(() => readFile(file));
    if (!error && result) {
      const documents = JSON.parse(result);
      folder['Embedded']['Documents'].push(...documents);
    }
  }

  return JSON.stringify(folder);
}

// Handles returning data for routes which require authentication.
export async function handle(p, headers, allowed, authEnabled) {
  if (authEnabled) {
    const { creds, resp } = getCreds(headers, 'PHOENIX-TOKEN');
    if (resp) {
      return resp;
    }

    if (!allowed.has(creds)) {
      const status = 401;
      const message = "The authorization token isn't valid";

      return { status, message };
    }
  }

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
    const tried = paths.map(p => '\t' + path.relative(root, p)).join('\n');
    const message = pre + '\n' + tried;

    return { status, message };
  }
}

// Given some http headers, gets the type and credentials from the authorization
// header.
function parseAuth(headers) {
  const auth = headers['authorization'];
  const [ prefix, credentials ] = auth.split(' ');
  return { prefix, credentials };

}

function getCreds(headers, type) {
  const { prefix, credentials } = parseAuth(headers);
  if (prefix.toUpperCase() !== type.toUpperCase()) {
    const creds = null;

    const status = 400;
    const message = 'The format of the auth token is invalid';
    const resp = { status, message };

    return { creds, resp };
  }

  return { creds: credentials };
}

export function authenticate(headers, allowed, users) {
  const { creds, resp } = getCreds(headers, 'Basic');
  if (resp) {
    return resp;
  }

  const plain = base64Decode(creds);
  if (!users.has(plain)) {
    // the user isn't registered
    const status = 401;
    const message = "Who are you?";

    return { status, message };
  }

  const [ email ] = plain.split(':');

  // user is registered
  allowed.add(creds);

  const status = 200;
  const message = JSON.stringify({
    Token: Math.floor(Math.random() * Number.MAX_VALUE).toString(),
    UserName: email,
    UserId: getNextId(),
    ExpirationDate: after(new Date(), 60, 'minutes'),
  });

  return { status, headers: ContentTypeJSON, message };
}
