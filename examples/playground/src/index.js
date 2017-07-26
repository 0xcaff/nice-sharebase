import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';

import defaultQuery from './defaultQuery.js'

import './index.css';

import { createContext, schema } from 'nice-sharebase';
import { graphql } from 'graphql';

const handleInputFor = (t, what) =>
  e => t.setState({ [what]: e.target.value });

const sessionStore = new Map();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      basepath: 'https://app.sharebase.com/sharebaseapi/api/',
      auth: '',
    };
  }

  render() {
    const { basepath, auth } = this.state;

    return (
      <div className='App'>
        <div className='toolbar'>

          <label htmlFor='basepath'>
            API Basepath:
          </label>

          <input
            id='basepath'
            value={basepath}
            type='url'
            onChange={handleInputFor(this, 'basepath')} />

          <label htmlFor='auth'>
            Authorization Header:
          </label>

          <input
            id='auth'
            type='text'
            placeholder='BOX-TOKEN or PHOENIX-TOKEN'
            value={auth}
            onChange={handleInputFor(this, 'auth')} />
        </div>

        <GraphiQL
          fetcher={async ({ operationName, query, variables }) => {
            const startTime = Date.now();

            const rootValue = null;
            const context = createContext({
              base: this.state.basepath,
              authorization: this.state.auth,
              sessionStore
            });

            const result = await graphql(schema, query, rootValue, context,
              variables, operationName);

            const endTime = Date.now();

            // attach logs
            result['extensions'] = { logs: context.logs, duration: `${endTime - startTime}ms` };

            return result;
          } }
          schema={schema}
          defaultQuery={defaultQuery} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
