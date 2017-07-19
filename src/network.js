import url from 'url';
import 'isomorphic-fetch';

import { throwOnFail } from './errors';
import { base64Encode, MINUTES, required, token } from './utils';

export const initNetwork = ({ base, transform, logs, session, token }) => {
  const network = {};
  network.req = req({ network, base, transform, logs });
  network.renew = renew({ network, session });
  network.request = request({ network, session, token });
  return network;
};

// Makes a request to the original ShareBase API getting new tokens if needed.
const req = ({ base, transform, logs }) =>
  async (path, init) => {
    const fullPath = url.resolve(base, path);
    logs.push(fullPath);
    const req = transform(new Request(fullPath, init));
    const resp = await throwOnFail(await fetch(req));
    const body = await resp.json();

    return body;
  };

// Renews or creates the session using the information provided. It updates
// context.session, context.sessionStore and returns the response received from
// the server along with the token to use to access the just renewed session.
const renew = ({ network, session }) =>
  async (
    email = required('email', 'renew'),
    password = required('password', 'renew')
  ) => {
    const { store } = session;

    const inner = base64Encode(`${email}:${password}`);
    const headers = { 'Authorization': `Basic ${inner}` };
    const authed = await network.req('authenticate', { headers });

    // update session
    if (!session.me) {
      // this is a new session, update the session store and context
      const delegate = await token();

      const me = { email, password };
      authed.delegate = delegate;
      store.set(delegate, me);

      session.me = me;
    }

    const { me } = session;
    me.expires = +Date.parse(authed['ExpirationDate']);
    me.authed = authed;

    // expose the delegate token
    return authed;
  };

const request = (context) =>
  async (path, init) => {
    const { session, token, network: { renew, req } } = context;
    const { me = required('me', 'request') } = session;

    var backendToken = null;
    if (me === null) {
      // a token for communicating directly with the ShareBase API was provided.
      backendToken = token;
    } else {
      // a delegate token was supplied

      // handle renewals
      const timeToExpire = me.expires - Date.now();
      if (!me.renewalPromise && timeToExpire < 5 * MINUTES) {
        // renew the credentials
        const { email, password } = me;

        me.renewalPromise = renew(email, password);
      }

      if (me.renewalPromise) {
        // if the renewal fails, the following line will throw and any request
        // which triggered a renewal will fail
        await me.renewalPromise;
        me.renewalPromise = null;
      }

      backendToken = me.authed['Token'];
    }

    // we have an active session with the official ShareBase, use it
    const headers = { 'Authorization': `PHOENIX-TOKEN ${backendToken}` };
    return await req(path, mergeInits(init, { headers }));
  };

// Creates a fetch init object which encodes the object as JSON and sets the
// mime type to application/json.
export const jsonify = (obj) => ({
  body: JSON.stringify(obj),
  headers: { 'Content-Type': 'application/json' },
});

// Merges fetch initialization objects taking care to preserve headers.
const mergeInits = (...args) => {
  const definedArgs = args.filter(arg => arg !== undefined);

  const finalObject = definedArgs.reduce(
    (acc, arg) => Object.assign(acc, arg), {});

  const headers = definedArgs.map(init => init.headers).filter(e => !!e);
  const finalHeaders = mergeHeaders(...headers);


  return {
    ...finalObject,
    headers: finalHeaders,
  };
};

// Merges a list of headers like arguments into a single Headers object.
const mergeHeaders = (...args) => {
  return args.reduce((acc, headers) => {
    for (const [key, value] of Object.entries(headers)) {
      acc.append(key, value);
    }

    return acc;
  }, new Headers());
};
