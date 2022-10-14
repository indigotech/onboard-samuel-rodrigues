import axios from 'axios';
import { ApolloServer } from 'apollo-server';
import { AppDataSource } from '../src/data-source';
import { resolvers } from '../src/graphql/resolvers';
import { typeDefs } from '../src/graphql/schema';

describe('Users query', function () {
  before('[SERVER] Starting server', function (done) {
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
  it('Returning the users:', async function () {
    const endpoint = 'http://localhost:4000/';
    const query = `query {
      hello
    }`;

    const connection = axios.create({ baseURL: endpoint });
    const result = await connection.post('/graphql', { query });
    console.table(JSON.stringify(result.data));
  });
});
