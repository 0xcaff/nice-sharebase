import url from 'url';
import nock from 'nock';
import { graphql } from 'graphql';

import { schema, createContext } from './schema';
import { setup, logs, DEFAULT_ENDPOINT } from '../mock/setup';

const base = url.resolve(DEFAULT_ENDPOINT, 'api/');

let context = null;
let nockApp = null;

beforeEach(() => {
  nockApp = setup({ authEnabled: false, });
  context = createContext({ base, sessionStore: new Map() });
});

afterEach(() => {
  nock.removeInterceptor(nockApp);
});

it('should get all library names', async () => {
  const resp = await graphql(schema, '{ libraries { name } }', undefined, context);

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should fail explicitly when fetching a non-existing resource', async () => {
  const resp = await graphql(schema, '{ library(id: 42069) { name } }', undefined, context);

  expect(resp.errors).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should only make the required requests on complex queries', async () => {
  const resp = await graphql(schema, '{ library(id: 406) { folders { name folders { name } documents { name } } } }', undefined, context);

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should resolve documents', async () => {
  const resp = await graphql(schema, '{ document(id: 19749) { name } }', undefined, context);

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should hit the cache when getting the same library resources multiple times', async () => {
  const resp = await graphql(schema, '{ library(id: 406) { name folders { name } } libraries { id name folders { name } } }', undefined, context);

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should fail explicitly when a single library resources doesn\'t exist while fetching many', async () => {
  const resp = await graphql(schema, '{ library(id: 406) { name } libOne: library(id: 420) { name } }', undefined, context);

  expect(resp.errors).toMatchSnapshot();
  expect(resp.data).toBeFalsy();
  expect(logs).toMatchSnapshot();
});
