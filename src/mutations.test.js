jest.mock('./utils');
import '../mock/date';

import url from 'url';
import { DEFAULT_ENDPOINT, setup } from '../mock/setup';
import { auth } from './mutations';
import { nop } from './utils';
import { initNetwork } from './network';

const base = url.resolve(DEFAULT_ENDPOINT, 'api/');

let context = null;
beforeEach(() => {
  const logs = [];
  const sessionStore = new Map();

  const session = { store: sessionStore };
  const network = initNetwork({ base, transform: nop, logs, session });
  context = { network, session };
});

setup();

it('should authenticate with the backend', async () => {
  const resp = await auth('sam.babic@onbase.com', 'password', context);

  // the sesion should be updated so future requests don't reauth
  expect(context.session.me).toBeTruthy();
  expect(resp).toMatchSnapshot();
  expect(context.session).toMatchSnapshot();
  expect(context.logs).toMatchSnapshot();
});
