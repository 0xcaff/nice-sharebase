import fs from 'fs';

// Returns the result of the first value in elems send through predicate which didn't throw an error.
export async function first(elems, predicate) {
	for (let elem of elems) {
		const { result, error } = await tryIt(_ => predicate(elem));
		if (!error) {
			return result;
		}
	}
}

// Wraps fs.readFile to use promises.
export const readFile = (...args) =>
  new Promise((resolve, reject) =>
    fs.readFile(...args, (err, data) => {
      if (err) { reject(err) } else { resolve(data) }
    })
  );

// Async returns an object with an error if one was caught. Otherwise returns the
// result.
export const tryIt = async (it) => {
  try {
    return {result: await it()};
  } catch(e) {
    return {error: e};
  }
};

