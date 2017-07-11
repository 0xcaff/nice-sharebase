const get = (prop) => (obj) => obj[prop];

export const getters = (kvs) =>
  Object.entries(kvs)
    .reduce(
      (acc, [key, value]) => {
        if (value instanceof Function) {
          // just copy it
          acc[key] = value;
        } else {
          acc[key] = get(value);
        }
        return acc;
      },
      {},
    );

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
  },

  Library: getters({
    id: "LibraryId",
    name: "LibraryName",
    isPrivate: "IsPrivate",

    folders: (obj, args, { loaders: { libraryFolders } }) =>
      libraryFolders.load(obj['LibraryId']),
  }),

  Folder: getters({
    id: "FolderId",
    name: "FolderName",

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
    id: "DocumentId",
    name: "DocumentName",
    modified: "DateModified",

    // contents(obj, args, context) {
    //   // TODO: Implement
    // },
  }),
};

