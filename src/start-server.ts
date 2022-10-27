import { ApolloServer } from 'apollo-server';
import { AppDataSource, createDataSource } from './data-source';
import { CustomError, formatError } from './errors/error-formatter';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';
import { verifyToken } from './jwt';

export async function startServer() {
  createDataSource();
  await AppDataSource.initialize();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
    context: ({ req }) => {
      let id: string;
      const token = req.headers.authorization;
      if (token) {
        try {
          const payload = verifyToken(token);
          id = payload.id;
        } catch (e) {
          console.log(e);
          throw new CustomError('Invalid token', 401);
        }
      }

      return { id };
    },
  });
  const { url } = await server.listen({ port: process.env.PORT || 4000 });
  console.log(`Server listening at ${url}`);
}
