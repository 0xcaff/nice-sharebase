// Creates an express server to serve the mock data.
import express from 'express';
import { handle, authenticate } from './utils';
const app = express();

const allowed = new Set();
const users = new Set();

const promisify = (inner) =>
  (req, res, next) =>
    inner(req, res)
      .then(() => next())
      .catch(err => console.error(err));

const translate = (inner) =>
  promisify(async (req, res) => {
    const { status, message, headers } = await inner(req, res);

    res.status(status);

    headers && Object.entries(headers)
      .forEach(([key, value]) => res.set(key, value));

    res.send(message);
  });

app.get('/api/authenticate', translate(async req => authenticate(req.headers, allowed, users)));
app.get('/api/*', translate(req => handle(req.url, req.headers, allowed)));

app.listen(30101, '0.0.0.0', function() { console.log('started mock server on port 30101') });