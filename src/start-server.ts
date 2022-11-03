import { ApolloServer } from 'apollo-server';
import { AppDataSource, createDataSource } from './data-source';
import { formatError } from './errors/error-formatter';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';
import { verifyToken } from './jwt';

function context({ req }) {
  let id: string;
  const token = req.headers.authorization;
  if (token) {
    const payload = verifyToken(token);
    id = payload.id;
  }

  return { id };
}

export async function startServer() {
  createDataSource();
  await AppDataSource.initialize();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
    context,
  });
  const { url } = await server.listen({ port: process.env.PORT || 4000 });
  console.log(`Server listening at ${url}`);
}
