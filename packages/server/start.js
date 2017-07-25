const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress } = require('apollo-server-express');
const { schema, createContext } = require('nice-sharebase');

const app = express();

const baseUrl = 'https://app.sharebase.com/sharebaseapi/api/';
const sessionStore = new Map();

app.use('/graphql', bodyParser.json(), graphqlExpress(req => ({
  schema,
  context: createContext({
    base: baseUrl,
    sessionStore,
    authorization: req.headers.authorization,
  }),
  debug: app.get('env') === 'development',
})));

const PORT = 4040;
const ADDR = '127.0.0.1';

const server = app.listen(PORT, ADDR);
server.on('listening', () => {
  const addr = server.address();
  console.log(`Server Started At ${addr.address}:${addr.port}`);
});
