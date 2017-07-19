import gql from 'express-graphql';
import express from 'express';
import url from 'url';
import { schema, createContext } from '../index.js';
import { setup, DEFAULT_ENDPOINT } from './setup';

setup({ authEnabled: false });
const app = express();
const sessionStore = new Map();

app.use('/graphql', gql(
  async req => {
    const base = url.resolve(DEFAULT_ENDPOINT, 'api/');
    const authorization = req.headers['authorization'];
    const context = createContext({ base, sessionStore, authorization });

    return {
      schema,
      context,
      extensions: () => context.logs,
      graphiql: true,
      pretty: true,
    };
  }
));

app.listen(3010, '0.0.0.0', () => console.log('listening on 0.0.0.0:3010'));
