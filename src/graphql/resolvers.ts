import { User } from '../entity/User';

interface UserInput {
  id: number;
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

export const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    getUsers: async () => await User.find(),
  },

  Mutation: {
    createUser: async (_, args: UserInput) => {
      const newUser = new User();
      newUser.name = args.name;
      newUser.email = args.email;
      newUser.password = args.password;
      newUser.birthdate = args.birthdate;

      await User.save(newUser);
      return newUser;
    },
  },
};
