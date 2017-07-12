import crypto from 'crypto';

const get = (prop) => (obj) => obj[prop];

// Creates a new object copying all functions and replacing other values with
// getter functions.
export const getters = (kvs) =>
  Object.entries(kvs)
    .reduce(
      (acc, [key, value]) => {
        if (value instanceof Function) {
          // just copy it
          acc[key] = value;
        } else {
          acc[key] = get(value);
        }
        return acc;
      },
      {},
    );

// Returns a base64 encoded string of the string passed in.
export const base64Encode = (toEncode) => Buffer.from(toEncode).toString('base64');

// A function which returns its first argument.
export const nop = (arg) => arg;

// Copys the properties and their values of the input object to a new output
// object and returns it.
export const filter = (obj) =>
  Object.entries(obj)
    .reduce(
      (acc, [k, v]) => { if (v) { acc[k] = v } return acc; },
      {},
    );

// Creates a cryptographically random sequence of characters.
export const token = async () => base64Encode(await rand(256));

// Wraps the crypto.randomBytes API to use promises.
const rand = (size) =>
  new Promise((resolve, reject) =>
    crypto.randomBytes(size, (err, buf) => {
      if (err) { reject(err) }
      resolve(buf);
    })
  );

// A functional way to throw errors. This is useful for throwing errors when
// destructuring an object when a value isn't provided.
export const toss = (err) => { throw err };
