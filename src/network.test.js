jest.mock('./utils');
import '../mock/date';

import url from 'url';
import { DEFAULT_ENDPOINT, setup } from '../mock/setup';
import { nop } from './utils';
import { initNetwork } from './network';

const base = url.resolve(DEFAULT_ENDPOINT, 'api/');
const transform = nop;

const allowed = new Set();
setup({ allowed });

beforeEach(() => {
  allowed.clear();
});

it('should authenticate with the backend', async () => {
  const session = { store: new Map() };
  const logs = [];

  const network = initNetwork({ base, transform, logs, session });
  const resp = await network.renew('sam.babic@onbase.com', 'password');

  // the sesion should be updated so future requests don't reauth
  expect(session.me).toBeTruthy();

  expect(resp).toMatchSnapshot();
  expect(session).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should make requests using a phoenix token', async () => {
  const token = 'PHNX-BACKEND-TOKEN';
  const session = { store: new Map(), me: null, token };
  const logs = [];

  allowed.add(token);
  const network = initNetwork({ base, transform, logs, session });
  const resp = await network.request('libraries');

  expect(resp).toMatchSnapshot();
  expect(session).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should get pnx tokens without updating context', async () => {
  const token = 'NICE-SHAREBASE-ACCESS-TOKEN';
  const email = 'sam.babic@onbase.com';
  const password = 'password';

  const logs = [];
  const me = { email, password };
  const store = new Map();
  store.set(token, me);

  const session = { store, me, token };
  const network = initNetwork({ base, transform, logs, session });

  const pnxToken = await network.getPnxToken(email, password);

  expect(pnxToken).toMatchSnapshot();
  expect(session).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});
