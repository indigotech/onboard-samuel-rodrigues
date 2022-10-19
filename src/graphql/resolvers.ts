import { hash } from 'bcrypt';
import { User } from '../entity/User';
import { validateEmail, validatePassword } from '../validators/validators';

export interface UserInput {
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
    createUser: async (_: any, args: UserInput) => {
      validateEmail(args.email);
      validatePassword(args.password);
      const passwordHash = await hash(args.password, 8);

      const newUser = new User();
      newUser.name = args.name;
      newUser.email = args.email;
      newUser.password = passwordHash;
      newUser.birthdate = args.birthdate;

      await User.save(newUser);
      return newUser;
    },
  },
};
