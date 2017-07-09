// Creates an express server to serve the mock data.
import path from 'path';
import express from 'express';
import { handle } from './utils';

const app = express();

// handle all paths dynamically
app.get('*', (req, res, next) => {
  h(req, res)
    .then(_ => next())
    .catch(err => console.error(err));
});

const h = async (req, res) => {
  const { status, message, headers } = await handle(req.url);

  res.status(status);
  headers && Object.entries(headers)
    .forEach(([key, value]) => res.set(key, value));
  res.send(message);
};

export default app;

