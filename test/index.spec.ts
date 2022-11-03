import * as dotenv from 'dotenv';
import axios from 'axios';
import { expect } from 'chai';
import { startServer } from '../src/start-server';
import { User } from '../src/entity/User';
import { compare, hashSync } from 'bcrypt';
import { generateToken, verifyToken } from '../src/jwt';
import { LoginInput, UserInput } from '../src/interfaces/interfaces';
import { createRandomAddress, createRandomUsers } from '../seed/users-faker';
import { Address } from '../src/entity/Address';

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

describe('Test createUser:', () => {
  const query = `mutation($input: UserInput!) {
    createUser(input: $input) {
      id, name, email, birthdate
    }
  }`;

  let userInput: UserInput;
  let token: string;

  beforeEach(() => {
    userInput = {
      name: 'Default',
      email: 'default@email.com',
      password: 'password123',
      birthdate: '01-01-2000',
    };

    token = generateToken('1', false);
  });

  it('should insert a user into the database.', async () => {
    const result = await (
      await connection.post(
        '/graphql',
        { query, variables: { input: userInput } },
        { headers: { Authorization: token } },
      )
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

  it('should return an error for trying to create a user with an email that does not meet the requirements.', async () => {
    userInput.email = 'invalid&format@email.com';

    const result = await connection.post(
      '/graphql',
      { query, variables: { input: userInput } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Invalid email.',
        code: 401,
      },
    ]);
  });

  it('should return an error for trying to create a user with a password that does not meet the requirements.', async () => {
    userInput.password = 'wrong';

    const result = await connection.post(
      '/graphql',
      { query, variables: { input: userInput } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Invalid password.',
        code: 401,
      },
    ]);
  });

  it('should return an error for trying to create a user with email already registered.', async () => {
    const newUser = new User();
    newUser.name = 'Default';
    newUser.email = 'default@email.com';
    newUser.password = 'password123';
    newUser.birthdate = '01-01-2000';

    await User.save(newUser);

    const result = await connection.post(
      '/graphql',
      { query, variables: { input: userInput } },
      { headers: { Authorization: token } },
    );

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
  newUser.name = 'Default';
  newUser.email = 'default@email.com';
  newUser.password = hashSync('password123', 8);
  newUser.birthdate = '01-01-2000';

  let loginInput: LoginInput;

  beforeEach(async () => {
    await User.save(newUser);

    loginInput = {
      email: 'default@email.com',
      password: 'password123',
    };
  });

  afterEach(async () => {
    await User.delete({ email: newUser.email });
  });

  it('should autenticate the user.', async () => {
    const result = await connection.post('/graphql', { query, variables: { input: loginInput } });
    const user = await User.findOneBy({ email: loginInput.email });

    expect(result.data.data.login.user).to.be.deep.eq({
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate,
    });

    const payload = verifyToken(result.data.data.login.token);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    expect(result.data.data.login.token).to.be.a('string');
    expect(result.data.data.login.token).to.have.lengthOf(187);
    expect(payload).to.have.keys(['id', 'iat', 'exp']);
    expect(payload.id).to.be.eq(user.id);
    expect(payload.exp).to.be.eq(payload['iat'] + 86400);
    expect(payload.exp).to.be.gt(nowInSeconds);
  });

  it('should autenticate the user with extended expiration time.', async () => {
    loginInput.rememberMe = true;

    const result = await connection.post('/graphql', { query, variables: { input: loginInput } });
    const user = await User.findOneBy({ email: loginInput.email });

    expect(result.data.data.login.user).to.be.deep.eq({
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate,
    });

    const payload = verifyToken(result.data.data.login.token);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    expect(result.data.data.login.token).to.be.a('string');
    expect(result.data.data.login.token).to.have.lengthOf(187);
    expect(payload).to.have.keys(['id', 'iat', 'exp']);
    expect(payload['id']).to.be.eq(user.id);
    expect(payload['exp']).to.be.eq(payload['iat'] + 604800);
    expect(payload['exp']).to.be.gt(nowInSeconds);
  });

  it('should return an error for trying to sign in with an unregistered email.', async () => {
    loginInput.email = 'unregistered@email.com';

    const result = await connection.post('/graphql', { query, variables: { input: loginInput } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Email or password is incorrect.',
        code: 401,
      },
    ]);
  });

  it('should return an error for trying to sign in with an incorrect password.', async () => {
    loginInput.password = 'incorrect123';

    const result = await connection.post('/graphql', { query, variables: { input: loginInput } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Email or password is incorrect.',
        code: 401,
      },
    ]);
  });
});

describe('Test query user:', async () => {
  const query = `query($id: String) {
    user(id: $id) {
      id
      name
      email
      birthdate
      addresses { id, postalCode, street, streetNumber, complement, neighborhood, city, state }
    }
  }`;

  const newUser = new User();
  newUser.id = '00000000-0000-0000-0000-000000000000';
  newUser.name = 'Default';
  newUser.email = 'default@email.com';
  newUser.password = hashSync('password123', 8);
  newUser.birthdate = '01-01-2000';

  let idInput: string;
  let token: string;

  beforeEach(async () => {
    const newAddress = await Address.save([createRandomAddress(), createRandomAddress()]);
    newUser.addresses = newAddress;
    await User.save(newUser);
    idInput = '00000000-0000-0000-0000-000000000000';
    token = generateToken(idInput, false);
  });

  afterEach(async () => {
    await User.delete({ email: newUser.email });
  });

  it('should return the user.', async () => {
    const result = await (
      await connection.post('/graphql', { query, variables: { id: idInput } }, { headers: { Authorization: token } })
    ).data.data.user;

    result.addresses.forEach((address) => (address.user = undefined));

    const user = await User.findOne({ where: { id: idInput }, relations: { addresses: true } });

    expect(result).to.be.deep.eq({
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate,
      addresses: user.addresses,
    });
  });

  it('should return an error for searching for a user with non-existent id.', async () => {
    idInput = '00000000-0000-0000-0000-000000000001';

    const result = await connection.post(
      '/graphql',
      { query, variables: { id: idInput } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'User not found.',
        code: 404,
      },
    ]);
  });

  it('should return an error when the user is not authenticated.', async () => {
    token = '';

    const result = await connection.post(
      '/graphql',
      { query, variables: { id: idInput } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Token not found.',
        code: 401,
      },
    ]);
  });
});

describe('Test query users:', () => {
  const query = `query($input: UsersInput) {
  users(input: $input) {
    users {
      id
      name
      email
      birthdate
      addresses { id, postalCode, street, streetNumber, complement, neighborhood, city, state }
    }
    totalUsers
    usersBefore
    usersAfter
  }
}`;

  let allUsers: User[];
  let token: string;

  beforeEach(async () => {
    allUsers = await createRandomUsers(50);
    token = generateToken('00000000-0000-0000-0000-0000000000000000', false);
  });

  afterEach(async () => {
    await User.delete(allUsers.map((user) => user.id));
  });

  it('should return users.', async () => {
    const input = {
      numberOfUsers: 10,
      skip: 5,
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.data.users;

    const users = await User.find({ order: { name: 'ASC' }, relations: { addresses: true } });

    let index = input.skip;
    result.users.forEach((user) => {
      expect(user).to.be.deep.eq({
        id: users[index].id,
        name: users[index].name,
        email: users[index].email,
        birthdate: users[index].birthdate,
        addresses: users[index].addresses,
      });
      index++;
    });

    expect(result.users).to.have.lengthOf(10);
    expect(result.totalUsers).to.be.deep.eq(50);
    expect(result.usersBefore).to.be.deep.eq(5);
    expect(result.usersAfter).to.be.deep.eq(35);
  });

  it('should return users even without the numberOfUsers parameter.', async () => {
    const input = {
      skip: 10,
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.data.users;

    const users = await User.find({ order: { name: 'ASC' }, relations: { addresses: true } });

    let index = input.skip;
    result.users.forEach((user) => {
      expect(user).to.be.deep.eq({
        id: users[index].id,
        name: users[index].name,
        email: users[index].email,
        birthdate: users[index].birthdate,
        addresses: users[index].addresses,
      });
      index++;
    });

    expect(result.users).to.have.lengthOf(5);
    expect(result.totalUsers).to.be.deep.eq(50);
    expect(result.usersBefore).to.be.deep.eq(10);
    expect(result.usersAfter).to.be.deep.eq(35);
  });

  it('should return users even without the skip parameter.', async () => {
    const input = {
      numberOfUsers: 10,
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.data.users;

    const users = await User.find({ order: { name: 'ASC' }, relations: { addresses: true } });

    let index = 0;
    result.users.forEach((user) => {
      expect(user).to.be.deep.eq({
        id: users[index].id,
        name: users[index].name,
        email: users[index].email,
        birthdate: users[index].birthdate,
        addresses: users[index].addresses,
      });
      index++;
    });

    expect(result.users).to.have.lengthOf(10);
    expect(result.totalUsers).to.be.deep.eq(50);
    expect(result.usersBefore).to.be.deep.eq(0);
    expect(result.usersAfter).to.be.deep.eq(40);
  });

  it('should return users even without parameters.', async () => {
    const input = {};

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.data.users;

    const users = await User.find({ order: { name: 'ASC' }, relations: { addresses: true } });

    let index = 0;
    result.users.forEach((user) => {
      expect(user).to.be.deep.eq({
        id: users[index].id,
        name: users[index].name,
        email: users[index].email,
        birthdate: users[index].birthdate,
        addresses: users[index].addresses,
      });
      index++;
    });

    expect(result.users).to.have.lengthOf(5);
    expect(result.totalUsers).to.be.deep.eq(50);
    expect(result.usersBefore).to.be.deep.eq(0);
    expect(result.usersAfter).to.be.deep.eq(45);
  });

  it('should return users even when numberOfUsers is greater than the amount of remaining users.', async () => {
    const input = {
      numberOfUsers: 10,
      skip: 45,
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.data.users;

    const users = await User.find({ order: { name: 'ASC' }, relations: { addresses: true } });

    let index = input.skip;
    result.users.forEach((user) => {
      expect(user).to.be.deep.eq({
        id: users[index].id,
        name: users[index].name,
        email: users[index].email,
        birthdate: users[index].birthdate,
        addresses: users[index].addresses,
      });
      index++;
    });

    expect(result.users).to.have.lengthOf(5);
    expect(result.totalUsers).to.be.deep.eq(50);
    expect(result.usersBefore).to.be.deep.eq(45);
    expect(result.usersAfter).to.be.deep.eq(0);
  });

  it('should return users if skip is less than the total number of users and numberOfUsers is greater than 0.', async () => {
    const input = {
      numberOfUsers: 60,
      skip: 45,
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.data.users;

    const users = await User.find({ order: { name: 'ASC' }, relations: { addresses: true } });

    let index = input.skip;
    result.users.forEach((user) => {
      expect(user).to.be.deep.eq({
        id: users[index].id,
        name: users[index].name,
        email: users[index].email,
        birthdate: users[index].birthdate,
        addresses: users[index].addresses,
      });
      index++;
    });

    expect(result.users).to.have.lengthOf(5);
    expect(result.totalUsers).to.be.deep.eq(50);
    expect(result.usersBefore).to.be.deep.eq(45);
    expect(result.usersAfter).to.be.deep.eq(0);
  });

  it('should return no user when skip is greater than or equal to the total number of users.', async () => {
    const input = {
      numberOfUsers: 10,
      skip: 50,
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.data.users;

    expect(result.users).to.be.deep.eq([]);
    expect(result.users).to.have.lengthOf(0);
    expect(result.totalUsers).to.be.deep.eq(50);
    expect(result.usersBefore).to.be.deep.eq(50);
    expect(result.usersAfter).to.be.deep.eq(0);
  });

  it('should return an error when numberOfUsers is less than or equal to 0.', async () => {
    const input = {
      numberOfUsers: -1,
      skip: 5,
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.errors;

    expect(result).to.be.deep.eq([
      {
        message: 'numberOfUsers must be positive.',
        code: 400,
      },
    ]);
  });

  it('should return an error when skip is negative.', async () => {
    const input = {
      numberOfUsers: 10,
      skip: -5,
    };

    const result = await (
      await connection.post('/graphql', { query, variables: { input: input } }, { headers: { Authorization: token } })
    ).data.errors;

    expect(result).to.be.deep.eq([
      {
        message: 'skip can not be negative.',
        code: 400,
      },
    ]);
  });
});
