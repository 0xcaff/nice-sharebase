import gql from 'express-graphql';
import express from 'express';
import url from 'url';
import { schema, createContext } from '../index.js';

import { setup, DEFAULT_ENDPOINT, logs } from './setup';

setup();
const app = express();
const sessionStore = new Map();

app.use('/graphql', gql(
  async () => {
    const base = url.resolve(DEFAULT_ENDPOINT, 'api/');
    const context = createContext({ base, sessionStore });

    return {
      schema,
      context,
      extensions: () => {
        const l = logs.slice();
        logs.length = 0;
        return l;
      },
      graphiql: true,
      pretty: true,
    };
  }
));

app.listen(3010, '0.0.0.0', () => console.log('listening on 0.0.0.0:3010'));
