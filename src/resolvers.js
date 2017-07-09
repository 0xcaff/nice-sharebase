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
    async libraries(obj, args, context) {
      const { loaders } = context;
      const { library } = loaders;

      const libs = await library.load('all');
      return libs;
    },

    async library(obj, args, context) {
      const { loaders } = context;
      const { library } = loaders;

      const lib = await library.load(args['id']);
      return lib;
    },
  },

  Library: getters({
    id: "LibraryId",
    name: "LibraryName",
    isPrivate: "IsPrivate",

    async folders(obj, args, context) {
      // TODO: query planning for nested children

      const { loaders } = context;
      const { libraryFolders } = loaders;

      const folders = await libraryFolders.load(obj['LibraryId']);
      return folders;
    },
  }),

  Folder: getters({
    id: "FolderId",
    name: "FolderName",

    async folders(obj, args, context) {
      // TODO: Implement
    },

    async documents(obj, args, context) {
      // TODO: Implement
    },
  }),

  Document: getters({
    id: "DocumentId",
    name: "DocumentName",
    modified: "DateModified",

    // async contents(obj, args, context) {
    //   // TODO: Implement
    // },
  }),
};

