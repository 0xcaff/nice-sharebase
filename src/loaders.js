import { BatchLoader, Loader } from './loader';
import { filter } from './utils';

// Called usually once per request to create the caches responsible for holding
// on to data.
export const create = ({ network }) => ({
  library: Library({ network }),
  libraryFolders: LibraryFolders({ network }),
  folder: Folder({ network }),
  document: Document({ network }),
});

const Library = ({ network }) => new LibraryLoader({ network });

class LibraryLoader extends BatchLoader {
  constructor({ network, autoDispatch }) {
    super({ autoDispatch });
    this.network = network;
  }

  async batchLoad(queue) {
    const { network } = this;

    // find minimum required work, we will only have one qualifying promise
    // because of the cache
    const gettingAll = queue.length > 1 ||
      queue.some(({ extras }) => extras === 'all');

    if (gettingAll) {
      // if we fail here, the entire batch will fail transiently
      const all = await network.request('libraries');

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
            const body = await network.request(`libraries/${id}`);
            resolve(body);
          } catch(e) {
            reject(e);
          }
        })
      );
    }
  }
}

const LibraryFolders = ({ network }) => new Loader({
  fetchFn: async (id) => await network.request(`libraries/${id}/folders`),
});

const Folder = ({ network }) => new FolderLoader({ network });

export class FolderLoader extends BatchLoader {
  constructor({ network, autoDispatch }) {
    super({ autoDispatch });
    this.network = network;
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
    const { network } = this;

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

            const path = `folders/${id}` + (paramsString && `?embed=${paramsString}`);
            const body = await network.request(path);

            promiseFuncs.forEach(({ resolve }) => resolve(body));
          } catch(e) {
            promiseFuncs.forEach(({ reject }) => reject(e));
          }
        })
    );
  }
}

const Document = ({ network }) => new Loader({
  fetchFn: async (id) => await network.request(`documents/${id}`),
});