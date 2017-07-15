import url from 'url';
import 'isomorphic-fetch';

import { throwOnFail } from './errors';
import { base64Encode, MINUTES, required, token } from './utils';

export const initNetwork = ({ base, transform, logs, session }) => {
  const network = {};
  network.req = req({ network, base, transform, logs });
  network.renew = renew({ network, session });
  network.request = request({ network, session });
  return network;
};

// Makes a request to the original ShareBase API getting new tokens if needed.
const req = ({ base, transform, logs }) =>
  async (path, headers) => {
    const fullPath = url.resolve(base, path);
    logs.push(fullPath);
    const req = transform(new Request(fullPath, { headers }));
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
    const headers = new Headers({'Authorization': `Basic ${inner}`});
    const authed = await network.req('authenticate', headers);

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
  async (path) => {
    const { session, network: { renew, req } } = context;
    const { me = required('me', 'req') } = session;

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

    // we have an active session, use it
    const token = me.authed['Token'];
    const headers = new Headers({ 'Authorization': `PHOENIX-TOKEN ${token}` });
    return await req(path, headers);
  };