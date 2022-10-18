import axios from 'axios';
import { expect } from 'chai';
import { startServer } from '../src/index';

before('Starting server', async () => {
  await startServer;
});

describe('query hello', function () {
  it('Returning hello', async function () {
    const query = `query { hello }`;

    const connection = axios.create({ baseURL: 'http://localhost:4000/' });
    const result = await connection.post('/graphql', { query });
    const queryResponseField = JSON.stringify(result.data.data.hello);
    console.table(queryResponseField);

    expect(queryResponseField).to.be.eq('"Hello, world!"');
  });
});
