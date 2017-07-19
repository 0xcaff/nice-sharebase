import '../mock/date';

import url from 'url';
import nock from 'nock';
import { graphql } from 'graphql';

import { schema, createContext } from './schema';
import { setup, DEFAULT_ENDPOINT } from '../mock/setup';
import { MINUTES } from './utils';

const base = url.resolve(DEFAULT_ENDPOINT, 'api/');

const backendToken = 'GODMODETOKEN';
const testSessionToken = 'TESTINGSESSION';

let context = null;
let nockApp = null;
let sessionStore = null;

beforeEach(() => {
  // add a session to the nock backend
  const allowed = new Set([backendToken]);
  nockApp = setup({ allowed });

  // add session info context
  sessionStore = new Map();
  const expires = new Date(+Date.now() + 100 * MINUTES);

  // add session
  sessionStore.set(testSessionToken, {
    expires: +expires,
    authed: {
      Token: backendToken,
      delegate: testSessionToken,
      UserName: "Sam Babic",
      UserId: 420,
      ExpirationDate: expires.toString(),
    },
    email: 'sam.babic@onbase.com',
    password: 'password',
  });

  context = createContext({
    authorization: `BOX-TOKEN ${testSessionToken}`,
    base, sessionStore,
  });
});

afterEach(() => {
  nock.removeInterceptor(nockApp);
  context = null;
});

// executes a graphql query using mocked stuff
const query = (query) => graphql(schema, query, undefined, context);

it('should get all library names', async () => {
  const resp = await query('{ libraries { name } }');

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(context.logs).toMatchSnapshot();
});

it('should fail explicitly when fetching a non-existing resource', async () => {
  const resp = await query('{ library(id: 42069) { name } }');

  expect(resp.errors).toMatchSnapshot();
  expect(context.logs).toMatchSnapshot();
});

it('should only make the required requests on complex queries', async () => {
  const resp = await query('{ library(id: 406) { folders { name folders { name } documents { name } } } }');

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(context.logs).toMatchSnapshot();
});

it('should resolve documents', async () => {
  const resp = await query('{ document(id: 19749) { name } }');

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(context.logs).toMatchSnapshot();
});

it('should hit the cache when getting the same library resources multiple times', async () => {
  const resp = await query('{ library(id: 406) { name folders { name } } libraries { id name folders { name } } }');

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(context.logs).toMatchSnapshot();
});

it('should fail explicitly when a single library resources doesn\'t exist while fetching many', async () => {
  const resp = await query('{ library(id: 406) { name } libOne: library(id: 420) { name } }');

  expect(resp.errors).toMatchSnapshot();
  expect(resp.data).toBeFalsy();
  expect(context.logs).toMatchSnapshot();
});

it('should get information about the authenticated user', async () => {
  const resp = await query('{ me { token name id } }');

  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(context.logs).toMatchSnapshot(); // the logs should be empty because there were no network requests made
});

it('should authenticate with phoenix tokens directly', async () => {
  context = createContext({
    authorization: `PHOENIX-TOKEN ${backendToken}`,
    sessionStore, base,
  });

  // try to make a request
  const resp = await query('{ libraries { name } }');
  expect(resp.errors).toBeFalsy();
  expect(resp.data).toMatchSnapshot();
  expect(context.logs).toMatchSnapshot();
});

// TODO: a me test for un-authed session
