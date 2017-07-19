import { jsonify } from './network';

// We assume that queries and mutations don't happen in the same request to
// avoid purging the caches. express-graphql doesn't allow queries and mutations
// in the same request, but other libraries might.

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

export const shareFolder = async (folderId, input, context) => {
  const resp = await shareFor(`folders/${folderId}/share`, input, context);
  return resp;
};

export const revokeFolderShare = async (folderId, shareId, { network }) => {
  const resp = await network.request(`folders/${folderId}/share/${shareId}`, {
    method: 'DELETE'
  });
  return true;
};

export const shareDoc = async (documentId, input, context) => {
  const resp = await shareFor(`documents/${documentId}/share`, input, context);
  return resp;
};

export const revokeDocShare = async (documentId, shareId, { network }) => {
  const resp = await network.request(`documents/${documentId}/share/${shareId}`, {
    method: 'DELETE'
  });

  return true;
};

export const deleteDoc = async (documentId, { network }) => {
  const res = await network.result(`documents/${documentId}`, { method: 'DELETE' });
  return true;
};

// Converts data sharing requests udata from our format into a format for the
// official ShareBase API.
export const shareFor = async (url, input, { network }) => {
  const { expiresOn, singleUse, password, allowView, allowDownload, allowUpload }
    = input;

  if (expiresOn !== undefined && singleUse !== undefined) {
    throw TypeError(
      'expiresOn and singleUse are mutally exclusive. You can only have one' +
      'or only the other'
    );
  }

  const r = {};
  if (expiresOn !== undefined) {
    // TODO: the format for this might be wrong. The official docs dont document
    // it.
    r['ExpiresOn'] = new Date(expiresOn).toString();
    r['ExpireStyle'] = 'date';
  } else if (singleUse !== undefined) {
    r['ExpireStyle'] = 'singleuse';
  }

  if (password) { r['Password'] = password }

  r['AllowView'] = allowView;
  r['AllowDownload'] = allowDownload;
  r['AllowUpload'] = allowUpload;

  // send request and return response
  const resp = await network.request(url, { method: 'POST', ...jsonify(r) });
  return resp;
};
