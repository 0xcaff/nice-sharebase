import { getters } from './utils';
import { auth } from './mutations';

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

    // TODO: implement the rest of the mutations
  },

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
    modified: 'DateModified',
  }),
};