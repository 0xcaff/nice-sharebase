import url from 'url';
import { graphql } from 'graphql';

import { schema } from './schema';
import { create } from './loaders';
import { ENDPOINT } from '../mock/setup';

import { getters } from './resolvers';
import { FetchError } from './errors';

const getContext = _ => ({
  loaders: create({ base: url.resolve(ENDPOINT, 'api/') }),
});

it('should create getters', () => {
  const data = {
    agent: 820,
    operation: 'Dark Night',
  };

  const acc = getters({
    id: 'agent',
    op: 'operation',
    realFunc: (obj) => 420,
  });

  expect(acc.id(data)).toBe(data['agent']);
  expect(acc.op(data)).toBe(data['operation']);
  expect(acc.realFunc(data)).toBe(420);
});

it('should get all library names', async () => {
  const context = getContext();
  const resp = await graphql(schema, "{ libraries { name } }", undefined, context);

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
});

it('should fail explicitly when fetching a non-existing resource', async () => {
  const context = getContext();
  const resp = await graphql(schema, "{ library(id: 42069) { name } }", undefined, context);

  expect(resp.errors).toMatchSnapshot();
});

it('should get all library names', async () => {
  const context = getContext();
  const resp = await graphql(schema, "{ libraries { folders { name } } }", undefined, context);

  expect(resp.data).toMatchSnapshot();
});
