import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';
import rawSchema from './schema.graphql';

export { create } from './loaders';

export const schema = makeExecutableSchema({typeDefs: [rawSchema], resolvers});
