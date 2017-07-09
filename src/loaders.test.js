import url from 'url';

import { FolderLoader } from './loaders';
import { logs, ENDPOINT } from '../mock/setup';

const base = url.resolve(ENDPOINT, 'api/');

it('should batch loads to folders and documents in a folder', async () => {
  const loader = new FolderLoader({ base, transform: (r) => r });

  const responses = [
    loader.load(6890),
    loader.load(6890, { folders: true }),
    loader.load(6890, { documents: true }),
  ];

  await loader.dispatch();
  const data = await Promise.all(responses);

  expect(data).toMatchSnapshot();
  expect(logs).toMatchSnapshot();
});

it('should cache loads for a folder between dispatches', async () => {
  const loader = new FolderLoader({ base, transform: (r) => r });

  const first = loader.load(6890);
  await loader.dispatch();

  const second = loader.load(6890);
  await loader.dispatch();

  expect(await first).toMatchSnapshot();
  expect(await first).toBe(await second);
  expect(logs).toMatchSnapshot();
});
