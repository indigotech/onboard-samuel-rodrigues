import * as dotenv from 'dotenv';
import axios from 'axios';
import { expect } from 'chai';
import { startServer } from '../src/start-server';
import { User } from '../src/entity/User';
import { compare, hashSync } from 'bcrypt';

dotenv.config({ path: './test.env' });

before('Starting server', async () => {
  await startServer();
});

const connection = axios.create({ baseURL: process.env.APOLLO_SERVER_BASE_URL });

describe('Test query hello:', function () {
  it('should return a greeting.', async () => {
    const query = `query { hello }`;

    const result = await connection.post('/graphql', { query });
    const queryResponseField = JSON.stringify(result.data.data.hello);

    expect(queryResponseField).to.be.eq('"Hello, world!"');
  });
});

describe('Test createUser', () => {
  const query = `mutation($input: UserInput!) {
    createUser(input: $input) {
      id, name, email, birthdate
    }
  }`;

  it('should insert a user into the database', async () => {
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

    await User.delete({ email: userInput.email });

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
  });

  it('should return an error for trying to create a user with an email that does not meet the requirements', async () => {
    const userInput = {
      name: 'Teste',
      email: 'test&@email.com',
      password: 'senha123',
      birthdate: '01-01-2000',
    };

    const result = await connection.post('/graphql', { query, variables: { input: userInput } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Invalid email.',
        code: 401,
      },
    ]);
  });

  it('should return an error for trying to create a user with a password that does not meet the requirements', async () => {
    const userInput = {
      name: 'Teste',
      email: 'teste@email.com',
      password: 'senha',
      birthdate: '01-01-2000',
    };

    const result = await connection.post('/graphql', { query, variables: { input: userInput } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Invalid password.',
        code: 401,
      },
    ]);
  });

  it('should return an error for trying to create a user with email already registered', async () => {
    const newUser = new User();
    newUser.name = 'Teste';
    newUser.email = 'teste@email.com';
    newUser.password = 'senha123';
    newUser.birthdate = '01-01-2000';

    await User.save(newUser);

    const userInput = {
      name: 'Teste',
      email: 'teste@email.com',
      password: 'senha123',
      birthdate: '01-01-2000',
    };

    const result = await connection.post('/graphql', { query, variables: { input: userInput } });

    await User.delete({ email: newUser.email });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Email already registered.',
        code: 401,
      },
    ]);
  });
});

describe('Test login:', () => {
  const query = `mutation($input: LoginInput!) {
    login(input: $input) {
      user { id, name, email, birthdate }
      token
    }
  }`;

  const newUser = new User();
  newUser.name = 'Teste';
  newUser.email = 'teste@email.com';
  newUser.password = hashSync('senha123', 8);
  newUser.birthdate = '01-01-2000';

  it('should autenticate the user.', async () => {
    await User.save(newUser);

    const loginInput = {
      email: 'teste@email.com',
      password: 'senha123',
    };

    const result = await connection.post('/graphql', { query, variables: { input: loginInput } });
    const user = await User.findOneBy({ email: loginInput.email });

    await User.delete({ email: newUser.email });

    expect(result.data.data.login).to.be.deep.eq({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthdate: user.birthdate,
      },
      token: 'the_token',
    });
  });

  it('should return an error for trying to sign in with an unregistered email.', async () => {
    const loginInput = {
      email: 'teste@email.com',
      password: 'senha123',
    };

    const result = await connection.post('/graphql', { query, variables: { input: loginInput } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'This email is not registered.',
        code: 401,
      },
    ]);
  });

  it('should return an error for trying to sign in with an incorrect password.', async () => {
    await User.save(newUser);

    const loginInput = {
      email: 'teste@email.com',
      password: 'senha',
    };

    const result = await connection.post('/graphql', { query, variables: { input: loginInput } });

    await User.delete({ email: newUser.email });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Incorrect password.',
        code: 401,
      },
    ]);
  });
});
