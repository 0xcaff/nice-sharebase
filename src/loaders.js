import url from 'url';

import DataLoader from 'dataloader';
import 'isomorphic-fetch';

export const create = ({ base, transform = nop}) => ({
  library: LibraryLoaderFor({ base, transform }),
});

const LibraryLoaderFor = ({ base, transform }) => new DataLoader(keys => Promise.all(
  keys.map(async id => {
    const endpoint = id === 'all' ? 'libraries' : `libraries/${id}`;
    const path = url.resolve(base, endpoint);

    // TODO: handle error
    const req = transform(new Request(path));
    const resp = await fetch(req);
    const body = await resp.json();

    return body;
  })
));

const nop = (arg) => arg;
