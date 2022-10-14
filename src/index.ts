import { ApolloServer } from 'apollo-server';
import { AppDataSource } from './data-source';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';

export const server = AppDataSource.initialize()
  .then(() => {
    const server = new ApolloServer({ typeDefs, resolvers });

    server.listen().then(({ url }) => {
      console.log(`Server listening at ${url}`);
    });
  })
  .catch((error) => console.log(error));
