import * as dotenv from 'dotenv';
import axios from 'axios';
import { expect } from 'chai';
import { startServer } from '../src/start-server';
import { User } from '../src/entity/User';
import { validateEmail, validatePassword } from '../src/validators/validators';

dotenv.config({ path: './test.env' });

before('Starting server', async () => {
  await startServer();
});

const connection = axios.create({ baseURL: process.env.APOLLO_SERVER_BASE_URL });

describe('query hello', function () {
  it('Returning hello', async () => {
    const query = `query { hello }`;

    const result = await connection.post('/graphql', { query });
    const queryResponseField = JSON.stringify(result.data.data.hello);
    console.table(queryResponseField);

    expect(queryResponseField).to.be.eq('"Hello, world!"');
  });
});

describe('Test createUser', () => {
  it('Returning user', async () => {
    const query = `mutation($name: String!, $email: String!, $password: String!, $birthdate: String!) {
      createUser(name: $name, email: $email, password: $password, birthdate: $birthdate) {
        id
        name
        email
        birthdate
      }
    }`;

    const userInput = {
      name: 'Teste',
      email: 'teste@email.com',
      password: 'senha123',
      birthdate: '01-01-2000',
    };

    await validateEmail(userInput.email);
    await validatePassword(userInput.password);

    const result = await connection.post('/graphql', { query, variables: userInput });
    const queryResponseField = JSON.stringify(result.data.data.createUser);
    console.table(queryResponseField);

    const user = await User.findOneBy({ email: userInput.email });

    expect(queryResponseField).to.be.eq(
      `{"id":"${user.id}","name":"${userInput.name}","email":"${userInput.email}","birthdate":"${userInput.birthdate}"}`,
    );

    await User.delete({ email: userInput.email });
  });
});
