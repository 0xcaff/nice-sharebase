import url from 'url';
import 'isomorphic-fetch';

import { base64Encode, token } from './utils';
import { throwOnFail } from './errors';

// TODO: test me endpoint
// TODO: wire up proper authentication for everything

export const auth = async (email, password, { base, transform, sessionStore }) => {
  const inner = base64Encode(`${email}:${password}`);
  const headers = new Headers({'Authorization': `Basic ${inner}`});

  // According to the official API documentation, this should be a GET
  // request.

  // TODO: It's time to abstract the network layer away. Also log requests in
  // the app network layer instead of the mock network layer.
  const endpoint = url.resolve(base, 'authenticate');
  const request = new Request(endpoint, { headers: headers });
  const resp = await throwOnFail(await fetch(transform(request)));
  const res = await resp.json();

  // create a new session
  const delegate = await token();

  sessionStore.set(delegate, {
    expires: +Date.parse(res['ExpirationDate']),
    authed: res,
    email,
    password,
  });
  
  return { ...res, Token: delegate };
};
