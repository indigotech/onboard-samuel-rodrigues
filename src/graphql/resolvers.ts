import { hash } from 'bcrypt';
import { User } from '../entity/User';
import { emailAlreadyExists, validateEmail, validatePassword } from '../validators/validators';

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
    createUser: async (_: any, args: { input: UserInput }) => {
      validateEmail(args.input.email);
      validatePassword(args.input.password);
      await emailAlreadyExists(args.input.email);
      const passwordHash = await hash(args.input.password, 8);

      const newUser = new User();
      newUser.name = args.input.name;
      newUser.email = args.input.email;
      newUser.password = passwordHash;
      newUser.birthdate = args.input.birthdate;

      await User.save(newUser);
      return newUser;
    },
  },
};
