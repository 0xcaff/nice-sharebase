import url from 'url';
import 'isomorphic-fetch';

import { BatchLoader, Loader } from './loader';
import { throwOnFail } from './errors';
import { filter } from './utils';

// Called usually once per request to create the caches responsible for holding
// on to data.
export const create = ({ base, transform }) => ({
  library: Library({ base, transform }),
  libraryFolders: LibraryFolders({ base, transform }),
  folder: Folder({ base, transform }),
  document: Document({ base, transform }),
});

const Library = ({ base, transform }) => new LibraryLoader({ base, transform });

class LibraryLoader extends BatchLoader {
  constructor({ base, transform, autoDispatch }) {
    super({ autoDispatch });
    this.base = base;
    this.transform = transform;
  }

  async batchLoad(queue) {
    const { base, transform } = this;

    // find minimum required work, we will only have one qualifying promise
    // because of the cache
    const gettingAll = queue.length > 1 ||
      queue.some(({ extras }) => extras === 'all');

    if (gettingAll) {
      // if we fail here, the entire batch will fail transiently
      const path = url.resolve(base, 'libraries');
      const req = transform(new Request(path));
      const resp = await throwOnFail(await fetch(req));
      const all = await resp.json();

      queue.forEach(({ id, extras, resolve, reject }) => {
        if (extras === 'all') {
          resolve(all);
        }

        const lib = all.find(lib => lib['LibraryId'] == id);
        if (!lib) {
          reject(new TypeError(`The library with id ${id} can't be found.`));
        }

        resolve(lib);
      });
    } else {
      // resolve queue one by one
      return await Promise.all(
        queue.map(async ({ id, resolve, reject }) => {
          try {
            const path = url.resolve(base, `libraries/${id}`);
            const req = transform(new Request(path));
            const resp = await throwOnFail(await fetch(req));
            const body = await resp.json();
            resolve(body);
          } catch(e) {
            reject(e);
          }
        })
      );
    }
  }
}

const LibraryFolders = ({ base, transform }) => new Loader({
  fetchFn: async (id) => {
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

            promiseFuncs.forEach(({ resolve }) => resolve(body));
          } catch(e) {
            promiseFuncs.forEach(({ reject }) => reject(e));
          }
        })
    );
  }
}

const Document = ({ base, transform }) => new Loader({
  fetchFn: async (id) => {
    const path = url.resolve(base, `documents/${id}`);
    const req = transform(new Request(path));
    const resp = await throwOnFail(await fetch(req));
    const body = await resp.json();
    return body;
  },
});