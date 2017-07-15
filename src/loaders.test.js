import url from 'url';
import 'isomorphic-fetch';

import { FolderLoader } from './loaders';
import { throwOnFail } from './errors';
import { setup, DEFAULT_ENDPOINT } from '../mock/setup';

setup({ authEnabled: false });
const base = url.resolve(DEFAULT_ENDPOINT, 'api/');

const logs = [];
beforeEach(() => logs.length = 0);

// A network mock without authentication.
const network = {
  request: async path => {
    const fullPath = url.resolve(base, path);
    logs.push(fullPath);
    const resp = await throwOnFail(await fetch(fullPath));
    const body = await resp.json();

    return body;
  },
};

it('should batch loads to folders and documents in a folder', async () => {
  const loader = new FolderLoader({ network, autoDispatch: false });

  const responses = [
    loader.load(6890),
    loader.load(6890, { folders: true }),
    loader.load(6890, { documents: true }),
  ];

  await loader.dispatch();
  const data = await Promise.all(responses);

  expect(data[0]).toEqual(data[1]);
  expect(data[1]).toEqual(data[2]);
  expect(data[0]['Embedded']).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should cache loads for a folder between dispatches', async () => {
  const loader = new FolderLoader({ network, autoDispatch: false });

  const first = loader.load(6890);
  await loader.dispatch();

  const second = loader.load(6890);
  await loader.dispatch();

  expect(await first).toMatchSnapshot();
  expect(await first).toEqual(await second);
  expect(logs).toMatchSnapshot();
});

it('should automatically execute loader.dispatch', async () => {
  const loader  = new FolderLoader({ network });

  const first = await loader.load(6890);
  expect(first).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

// TODO: test multiple case
// TODO: test single failure case
// TODO: test mass failure case