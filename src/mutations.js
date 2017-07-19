import { jsonify } from './network';

// We assume that queries and mutations don't happen in the same request to
// avoid purging the caches. graphql-express doesn't allow you to do this but
// other libraries might.

export const auth = async (email, password, { network }) => {
  const res = await network.renew(email, password);
  return res;
};

// TODO: figure out testing strategy for these mutations
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
