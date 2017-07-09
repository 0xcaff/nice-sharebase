// A minimal data loader which batches and caches requests
export class BatchLoader {
  constructor({ autoDispatch = true }) {
    // A queue of data requests which need to be fulfilled.
    this.promiseQueue = [];

    // A map of ids to extras and in-promise results.
    this.cache = new Map();

    this.autoDispatch = autoDispatch;
  }

  // Checks whether something is in the cache. Override this to check whether
  // the extras are enough.
  getFromCache(id, reqExtras) {
    const cached = this.cache.get(id);
    if (!cached) {
      return null;
    }

    const { extras, promise } = cached;
    return promise;
  }

  putCache(id, extras = {}, promise) {
    this.cache.set(id, { extras, promise });
  }

  load(id, extras = {}) {
    // try to get from cache
    const cached = this.getFromCache(id, extras);
    if (cached) {
      // cache hit
      return cached;
    }

    // enqueue get from remote
    const promise = new Promise((resolve, reject) => {
      this.promiseQueue.push({ id, extras, resolve, reject });

      if (this.promiseQueue.length === 1 && this.autoDispatch) {
        // first element in the queue, schedule dispatch to run after the stack
        // is completely unwound and when the promise microtask queue is
        // executing. The procces.nextTick causes dispatch to run after the
        // promise microtask queue is exhausted. The promise microtask queue can
        // be added to by things on the promise microtask queue.

        Promise.resolve().then(_ => process.nextTick(_ => this.dispatch()));
      }
    });

    // cache request
    this.putCache(id, extras, promise);

    return promise;
  }

  // Called by dispatch when it is time to load the batched queries. This method
  // is responsible for notifying promises about results and failures.
  batchLoad(queue) {
    throw new TypeError(`You need to implement this method.`);
  }

  // Call when you want promises from load to be resolved.
  async dispatch() {
    // pull and reset queue
    const queue = this.promiseQueue;
    this.promiseQueue = [];

    try {
      await this.batchLoad(queue);
    } catch (e) {
      // we encountered some kind of error, fail all promises
      queue.forEach(({ id, extras, resolve, reject }) => {
        reject(e);

        // remove from cache so the next time load is called, we fetch new data
        this.cache.delete(id);
      });
    }
  }
}

// A minimal data loader which doesn't batch requests since we can gain
// flexibility without it and and we don't need it because the ShareBase API
// doesn't do batching.
export class Loader {
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

