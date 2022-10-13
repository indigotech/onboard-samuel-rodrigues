import { User } from '../entity/User';

interface UserInput {
  id: number;
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

async function validators(args: UserInput) {
  const emailAlreadyExists = await User.findOneBy({ email: args.email });
  console.log(emailAlreadyExists);

  if (emailAlreadyExists) {
    throw new Error('Email already registered.');
  }

  const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!regexPassword.test(args.password)) {
    throw new Error('Invalid password');
  }
}

export const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    getUsers: async () => await User.find(),
  },

  Mutation: {
    createUser: async (_, args: UserInput) => {
      validators(args);

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
