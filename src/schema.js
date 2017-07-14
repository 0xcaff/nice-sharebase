import { makeExecutableSchema } from 'graphql-tools';

import { resolvers } from './resolvers';
import { create } from './loaders';
import { nop, required } from './utils';
import rawSchema from './schema.graphql';

export const schema = makeExecutableSchema({typeDefs: [rawSchema], resolvers});

// A to create the context for the nice-sharebase schema. The context holds the
// sessions and loaders responsible for making request sto the ShareBase API.
export const createContext = ({
  // The base url of the official ShareBase API we will be resolving request
  // against.
  base = required('base', 'createContext()'),

  // A function which takes in a Request, modifies it and returns the request to
  // send to the official ShareBase API. transform will always only be called
  // before a request is made to the official ShareBase API.
  transform = nop,

  // A place to keep newly created sessions and retrive informatino about
  // existing sessions. This can be any map like object (set, get, has, clear,
  // delete, values). This should be persisted between requests.
  sessionStore = required('sessionStore', 'createContext()'),

  // A token to use to authenticate against the endpoint. This can be a
  // BOX-TOKEN or PHONIEX-TOKEN. See the Query type for more information about
  // authentication.
  authorization,
}) => {
  const loaders = create({ base, transform });
  const { session, token } = tryGetSession(sessionStore, authorization);

  return { base, transform, loaders, sessionStore, token, session };
};

// Tries to get a session from the given information. If there isn't enough
// information or a session doesn't exist returns a falsy value.
function tryGetSession(store, header) {
  if (!header) {
    return {};
  }

  const [ prefix, creds ] = header.split(' ');
  if (prefix !== 'BOX-TOKEN') {
    return {};
  }

  // try to look up session information
  const session = store.get(creds);
  return { session, token: creds };
}