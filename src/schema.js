import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';
import rawSchema from './schema.graphql';

export const schema = makeExecutableSchema({typeDefs: [rawSchema], resolvers});
