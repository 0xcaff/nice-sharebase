import url from 'url';

import { FolderLoader } from './loaders';
import { logs, ENDPOINT } from '../mock/setup';

const base = url.resolve(ENDPOINT, 'api/');

it('should batch loads to folders and documents in a folder', async () => {
  const loader = new FolderLoader({ base, transform: (r) => r, autoDispatch: false });

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
  const loader = new FolderLoader({ base, transform: (r) => r, autoDispatch: false });

  const first = loader.load(6890);
  await loader.dispatch();

  const second = loader.load(6890);
  await loader.dispatch();

  expect(await first).toMatchSnapshot();
  expect(await first).toEqual(await second);
  expect(logs).toMatchSnapshot();
});

it('should automatically execute loader.dispatch', async () => {
  const loader  = new FolderLoader({ base, transform: (r) => r });

  const first = await loader.load(6890);
  expect(first).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

// TODO: test multiple case
// TODO: test single failure case
// TODO: test mass failure case
