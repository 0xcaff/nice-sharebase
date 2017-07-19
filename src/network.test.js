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
  const session = { store: new Map(), me: null };
  const logs = [];

  const token = 'PHNX-BACKEND-TOKEN';
  allowed.add(token);
  const network = initNetwork({ base, transform, logs, session, token });
  const resp = await network.request('libraries');

  expect(resp).toMatchSnapshot();
  expect(session).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});
