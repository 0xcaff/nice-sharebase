import { jsonify } from './network';

// We assume that queries and mutations don't happen in the same request to
// avoid purging the caches. graphql-express doesn't allow you to do this but
// other libraries might.

export const auth = async (email, password, { network }) => {
  const res = await network.renew(email, password);
  return res;
};

// TODO: figure out testing strategy for these mutations
export const revoke = ({ session }) => {
  // setting the token to undefined makes it seem as it was never passed in
  session.me = undefined;

  // remove so future request need to re-authenticate.
  session.store.remove(session.token);

  // token is only used when me is null by network but set it to undefined for
  // good measure
  session.token = undefined;

  // the official ShareBase API doesn't provide a mechanism to revoke tokens so
  // the pnx tokens are still active, just discarded.
  return true;
};

export const pnxToken = async ({ network, session: { me } }) => {
  const { email, password } = me;
  const pnxToken = await network.getPnxToken(email, password);
  return pnxToken;
};

export const newFolder = async(libraryId, path, { network }) => {
  // We only allow setting the path because the name is just a path with one
  // component.

  const res = await network.request(`libraries/${libraryId}/folders`, {
    method: 'POST', ...jsonify({ "FolderPath": path }),
  });

  return res;
};

export const deleteFolder = async (folderId, { network }) => {
  const res = await network.request(`folders/${folderId}`, { method: 'DELETE' });
  return true;
};

export const deleteDoc = async (documentId, { network }) => {
  const res = await network.result(`documents/${documentId}`, { method: 'DELETE' });
  return true;
};
