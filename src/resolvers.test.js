import url from 'url';
import { graphql } from 'graphql';

import { schema } from './schema';
import { create } from './loaders';
import { ENDPOINT } from '../mock/setup';

import { getters } from './resolvers';

it('should create getters', () => {
  const data = {
    agent: 820,
    operation: 'Dark Night',
  };

  const acc = getters({
    id: 'agent',
    op: 'operation',
  });

  expect(acc.id(data)).toBe(data['agent']);
  expect(acc.op(data)).toBe(data['operation']);
});

it('should get all library names', async () => {
  const loaders = create({ base: url.resolve(ENDPOINT, 'api/') });
  const context = { loaders };

  const resp = await graphql(schema, "{ libraries { name } }", undefined, context);

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
});

