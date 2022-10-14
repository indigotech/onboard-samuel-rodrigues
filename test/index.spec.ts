import axios from 'axios';
import { ApolloServer } from 'apollo-server';
import { AppDataSource } from '../src/data-source';
import { resolvers } from '../src/graphql/resolvers';
import { typeDefs } from '../src/graphql/schema';

describe('query hello', function () {
  before('Starting server', function (done) {
    AppDataSource.initialize()
      .then(() => {
        const server = new ApolloServer({ typeDefs, resolvers });
        server.listen().then(({ url }) => {
          console.log(`Server listening at ${url}`);
        });
      })
      .catch((error) => console.log(error))
      .then(done);
  });
  it('Returning hello:', async function () {
    const query = `query { hello }`;

    const connection = axios.create({ baseURL: 'http://localhost:4000/' });
    const result = await connection.post('/graphql', { query });
    console.table(JSON.stringify(result.data));
  });
});
