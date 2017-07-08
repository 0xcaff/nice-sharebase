const get = (prop) => (obj) => obj[prop];

export const getters = (kvs) =>
  Object.entries(kvs)
    .reduce(
      (acc, [key, value]) => {
        acc[key] = get(value);
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
    name: "LibraryName",
    id: "LibraryId",
    isPrivate: "IsPrivate",
  }),
};

