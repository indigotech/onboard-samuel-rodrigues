import { ApolloServer } from 'apollo-server';
import { AppDataSource, createDataSource } from './data-source';
import { formatError } from './errors/error-formatter';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';

export async function startServer() {
  createDataSource();
  await AppDataSource.initialize();
  const server = new ApolloServer({ typeDefs, resolvers, formatError });
  const { url } = await server.listen({ port: process.env.PORT || 4000 });
  console.log(`Server listening at ${url}`);
}
