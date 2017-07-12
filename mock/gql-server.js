import gql from 'express-graphql';
import express from 'express';
import url from 'url';
import { schema, createContext } from '../index.js';

import { ENDPOINT, logs } from './setup';

const app = express();

app.use('/graphql', gql(
  async (req, res, params) => {
    const base = url.resolve(ENDPOINT, 'api/');
    const context = createContext({ base });

    return {
      schema,
      context,
      extensions: (document, variables, operationName, result) => {
        const l = logs.slice();
        logs.length = 0;
        return l;
      },
      graphiql: true,
      pretty: true,
    };
  }
));

app.listen(3010, '0.0.0.0', _ => console.log('listening on 0.0.0.0:3010'));
