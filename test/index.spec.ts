import * as dotenv from 'dotenv';
import axios from 'axios';
import { expect } from 'chai';
import { startServer } from '../src/start-server';
import { User } from '../src/entity/User';
import { compare } from 'bcrypt';
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
  it('should insert a user into the database', async () => {
    const query = `mutation($input: UserInput!) {
      createUser(input: $input) {
        id, name, email, birthdate
      }
    }`;

    const userInput = {
      name: 'Teste',
      email: 'teste@email.com',
      password: 'senha123',
      birthdate: '01-01-2000',
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: userInput } })
    ).data.data.createUser;
    const user = await User.findOneBy({ email: userInput.email });

    expect(user.name).to.be.eq(userInput.name);
    expect(user.email).to.be.eq(userInput.email);
    expect(user.birthdate).to.be.eq(userInput.birthdate);

    const passwordMatch = await compare(userInput.password, user.password);
    expect(passwordMatch).to.be.eq(true);

    expect(result).to.be.deep.eq({
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate,
    });

    await User.delete({ email: userInput.email });
  });
});

describe('Test createUser with existing email', () => {
  it('should return an error for trying to create a user with email already registered', async () => {
    const query = `mutation($input: UserInput!) {
      createUser(input: $input) {
        id, name, email, birthdate
      }
    }`;

    const userInput = {
      name: 'Teste',
      email: 'teste2@email.com',
      password: 'senha123',
      birthdate: '01-01-2000',
    };

    const result = await connection.post('/graphql', { query, variables: { input: userInput } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Email already registered.',
        code: 401,
      },
    ]);
  });
});

describe('Test createUser with invalid password', () => {
  it('should return an error for trying to create a user with a password that does not meet the requirements', async () => {
    const query = `mutation($input: UserInput!) {
      createUser(input: $input) {
        id, name, email, birthdate
      }
    }`;

    const userInput = {
      name: 'Teste',
      email: 'teste@email.com',
      password: 'senha',
      birthdate: '01-01-2000',
    };

    const result = await connection.post('/graphql', { query, variables: { input: userInput } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Invalid password',
        code: 401,
      },
    ]);
  });
});
