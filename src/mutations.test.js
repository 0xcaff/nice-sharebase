jest.mock('./utils');
import '../mock/date';

import url from 'url';
import { DEFAULT_ENDPOINT, setup } from '../mock/setup';
import { auth } from './mutations';
import { nop } from './utils';

const base = url.resolve(DEFAULT_ENDPOINT, 'api/');
setup();

it('should authenticate with the backend', async () => {
  const sessionStore = new Map();
  const resp = await auth('sam.babic@onbase.com', 'password',
    { base, transform: nop, sessionStore });

  expect(resp).toMatchSnapshot();
  expect(sessionStore).toMatchSnapshot();
});