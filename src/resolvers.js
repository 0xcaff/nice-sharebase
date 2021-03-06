import { getters } from './utils';
import { auth, revoke, pnxToken,
  newFolder, deleteFolder, shareFolder, revokeFolderShare,
  shareDoc, revokeDocShare, deleteDoc
} from './mutations';

export const resolvers = {
  Query: {
    libraries: (obj, args, { loaders: { library } }) =>
      library.load(undefined, 'all'),

    library: (obj, args, { loaders: { library } }) =>
      library.load(args['id']),

    folder: (obj, args, { loaders: { folder } }) =>
      folder.load(args['id']),

    document: (obj, args, { loaders: { document } }) =>
      document.load(args['id']),

    me: (obj, args, { session: { me: { authed } } }) =>
      authed
  },

  Mutation: {
    authenticate: (obj, args, context) =>
      auth(args['email'], args['password'], context),

    revokeSession: (obj, args, context) =>
      revoke(context),

    phoenixToken: (obj, args, context) =>
      pnxToken(context),

    newFolder: (obj, args, context) =>
      newFolder(args['libraryId'], args['path'], context),

    deleteFolder: (obj, args, context) =>
      deleteFolder(args['id'], context),

    shareFolder: (obj, args, context) =>
      shareFolder(args['id'], args['input'], context),

    revokeFolderShare: (obj, args, context) =>
      revokeFolderShare(args['documentId'], args['shareId'], context),

    shareDocument: (obj, args, context) =>
      shareDoc(args['id'], args['input'], context),

    revokeDocumentShare: (obj, args, context) =>
      revokeDocShare(args['id'], args['shareId'], context),

    deleteDocument: (obj, args, context) =>
      deleteDoc(args['id'], context),
  },

  PNXToken: getters({
    token: 'Token',
    expires: (obj) => +new Date.parse(obj['ExpirationDate']),
  }),

  Share: getters({
    id: 'ShareId',
    reference: 'ReferenceString',
    url: (obj) => obj['Links']['WebUri'],
  }),

  Authed: getters({
    token: 'delegate',
    name: 'UserName',
    id: 'UserId',
  }),

  Library: getters({
    id: 'LibraryId',
    name: 'LibraryName',
    isPrivate: 'IsPrivate',

    folders: (obj, args, { loaders: { libraryFolders } }) =>
      libraryFolders.load(obj['LibraryId']),
  }),

  Folder: getters({
    id: 'FolderId',
    name: 'FolderName',

    folders: async (obj, args, { loaders: { folder } }) => {
      const f = await folder.load(obj['FolderId'], { folders: true });
      return f['Embedded']['Folders'];
    },

    documents: async (obj, args, { loaders: { folder } }) => {
      const f = await folder.load(obj['FolderId'], { documents: true });
      return f['Embedded']['Documents'];
    },
  }),

  Document: getters({
    id: 'DocumentId',
    name: 'DocumentName',
    modified: (obj) => +new Date(obj['DateModified']),
  }),
};
