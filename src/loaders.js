import url from 'url';
import 'isomorphic-fetch';

import { BatchLoader, Loader } from './loader';
import { throwOnFail } from './errors';

// Called usually once per request to create the caches responsible for holding
// on to data.
export const create = ({ base, transform = nop}) => ({
  library: Library({ base, transform }),
  libraryFolders: LibraryFolders({ base, transform }),
  folder: Folder({ base, transform }),
});

const Library = ({ base, transform }) => new Loader({
  fetchFn: async (id, extras) => {
    // TODO: 'all' is probably not a good key
    const endpoint = id === 'all' ? 'libraries' : `libraries/${id}`;
    const path = url.resolve(base, endpoint);

    const req = transform(new Request(path));
    const resp = await throwOnFail(await fetch(req));
    const body = await resp.json();

    return body;
  },
  putCacheFn(id, extras, ret) {
    // put all values in cache
    this.cache.set(id, ret);

    if (id === 'all') {
      // add each lib to cache
      ret.forEach(lib => this.cache.set(+lib['LibraryId'], lib));
    };
  },
});

const LibraryFolders = ({ base, transform }) => new Loader({
  fetchFn: async (id, extras) => {
    const path = url.resolve(base, `libraries/${id}/folders`);
    const req = transform(new Request(path));
    const resp = await throwOnFail(await fetch(req));
    const body = await resp.json();
    return body;
  },
});

const Folder = ({ base, transform }) => new FolderLoader({ base, transform });

export class FolderLoader extends BatchLoader {
  constructor({ base, transform, autoDispatch }) {
    super({ autoDispatch });
    this.base = base;
    this.transform = transform;
  }

  getFromCache(id, { folders: needFolders, documents: needDocs }) {
    const cached = this.cache.get(id);
    if (!cached) {
      return null;
    }

    const { extras, promise } = cached;
    const { folders: hasFolders, documents: hasDocs } = extras;

    // ensure that the extras for the cached request are better than or equal to
    // the one requested
    if (needFolders && !hasFolders) {
      return null;
    }

    if (needDocs && !hasDocs) {
      return null;
    }

    return promise;
  }

  async batchLoad(queue) {
    const { base, transform } = this;

    // reduce into minimum required requests
    const reqs = queue.reduce(
      (acc, { id, extras: rExtras, resolve, reject }) => {
        const { promiseFuncs = [], extras = {} } = (acc[id] || {});

        // update
        promiseFuncs.push({ resolve, reject });
        Object.assign(extras, filter(rExtras));

        acc[id] = { promiseFuncs, extras };
        return acc;
      }, {});

    return await Promise.all(
      Object.entries(reqs)
        .map(async ([id, { promiseFuncs, extras: { folders, documents }} ]) => {
          try {
            const paramsString =
              Object.keys(filter({ 'f': folders, 'd': documents }))
                .join();

            const path = url.resolve(base, `folders/${id}` + (paramsString && `?embed=${paramsString}`));
            const req = transform(new Request(path));
            const resp = await throwOnFail(await fetch(req));
            const body = await resp.json();

            promiseFuncs.forEach(({ resolve, reject }) => resolve(body));
          } catch(e) {
            promiseFuncs.forEach(({ resolve, reject }) => reject(e));
          }
        })
    );
  }
}

const nop = (arg) => arg;

const filter = (obj) =>
  Object.entries(obj)
    .reduce(
      (acc, [k, v]) => { if (v) { acc[k] = v }; return acc; },
      {},
    );

