interface UserInput {
  id: number;
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

const users: UserInput[] = [
  {
    id: 0,
    name: 'Jonh Doe',
    email: 'jonh.doe@email.com',
    password: 'senha123',
    birthdate: '01-01-2000',
  },
];

export const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    getUsers: () => users,
  },

  Mutation: {
    createUser: (_, args) => {
      const newUser = {
        id: users.length++,
        name: args.name,
        email: args.email,
        password: args.password,
        birthdate: args.birthdate,
      };

      users.push(newUser);
      return newUser;
    },
  },
};
