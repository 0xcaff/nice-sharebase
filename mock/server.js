// Creates an express server to serve the mock data.
import express from 'express';
import { handle } from './utils';
const app = express();

// handle all paths dynamically
app.get('/api/*', (req, res, next) => {
  h(req, res)
    .then(() => next())
    .catch(err => console.error(err));
});

const h = async (req, res) => {
  const { status, message, headers } = await handle(req.url);

  res.status(status);
  headers && Object.entries(headers)
    .forEach(([key, value]) => res.set(key, value));
  res.send(message);
};

app.listen(30101, '0.0.0.0', function() { console.log('started mock server on port 30101') });

