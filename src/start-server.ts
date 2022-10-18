import { ApolloServer } from 'apollo-server';
import { AppDataSource, createDataSource } from './data-source';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';

export async function startServer() {
  createDataSource();
  AppDataSource.initialize();
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await server.listen({ port: process.env.PORT || 4000 });
  console.log(`Server listening at ${url}`);
}
