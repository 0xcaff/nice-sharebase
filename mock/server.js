// Creates an express server to serve the mock data.
import path from 'path';
import express from 'express';
import { readFile, first } from './utils';

const app = express();

// handle all paths dynamically
app.get('*', (req, res, next) => {
  handle(req, res)
    .then(_ => next());
});

export default app;

const handle = async (req, res) => {
  const rPath = req.path.slice(1);

  // try resolving the url. Examples:
  //
  // /api/libraries
  // /api/libraries/{libraryid}
  // /api/libraries/{libraryid}/folders
  //
  // /api/folders/{folderid}/documents
  // /api/folders/{folderid}/folders

  const paths = [`${rPath}.json`, `${rPath}/index.json`]
    .map(raw => path.resolve(__dirname, raw));

  const result = await first(paths, path => readFile(path));
  if (result !== undefined) {
    res
      .set('Content-Type', 'application/json')
      .send(result);
  } else {
    const message = `Path not found for ${rPath}. Tried:`;
    const tried = paths.map(path => '\t' + path).join('\n');

    res
      .status(404)
      .send(message + '\n' + tried);
  }
};

