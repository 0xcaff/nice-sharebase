import url from 'url';
import 'isomorphic-fetch';

import { throwOnFail } from './errors';

// Called usually once per request to create the caches responsible for holding
// on to data.
export const create = ({ base, transform = nop}) => ({
  library: LibraryLoaderFor({ base, transform }),
});

const LibraryLoaderFor = ({ base, transform }) => new Loader({
  fetchFn: async (id, extras) => {
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

// A minimal data loader which doesn't batch requests since we can gain
// flexibility without it and and we don't need it because the ShareBase API
// doesn't do batching.
class Loader {
  constructor({ fetchFn, tryCacheFn = this.tryCache, putCacheFn = this.putCache, cache }) {
    this.cache = cache || new Map();

    this.tryCache = tryCacheFn.bind(this);
    this.putCache = putCacheFn.bind(this);
    this.fetch = fetchFn.bind(this);
  }

  tryCache(id, extras) {
    return this.cache.get(id);
  }

  putCache(id, extras, thing) {
    this.cache.set(id, thing);
  }

  async load(id, extras) {
    const cached = this.tryCache(id, extras);
    if (cached) {
      return cached;
    }

    const ret = await this.fetch(id, extras);
    this.putCache(id, extras, ret);
    return ret;
  }
}

const nop = (arg) => arg;
