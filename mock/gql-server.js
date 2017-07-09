import gql from 'express-graphql';
import express from 'express';
import url from 'url';
import { schema, create } from '../index.js';

import { ENDPOINT, logs } from './setup';

const app = express();

app.use('/graphql', gql(
  async (req, res, params) => ({
    schema: schema,
    graphiql: true,
    context: {
      loaders: create({ base: url.resolve(ENDPOINT, 'api/') })
    },
    pretty: true,
    extensions: (document, variables, operationName, result) => {
      const l = logs.slice();
      logs.length = 0;
      return l;
    },
  })
));

app.listen(3010, '0.0.0.0', _ => console.log('listening on 0.0.0.0:3010'));
