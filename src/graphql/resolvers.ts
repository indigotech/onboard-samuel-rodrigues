import { hash } from 'bcrypt';
import { User } from '../entity/User';
import {
  comparePassword,
  emailAlreadyExists,
  validateEmail,
  validateEmailLogin,
  validatePassword,
} from '../validators/validators';
import { generateToken } from '../jwt';
import { AddressInput, LoginInput, UserInput, UsersInput } from '../interfaces/interfaces';
import { CustomError } from '../errors/error-formatter';
import { Address } from '../entity/Address';

export const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    getUsers: async () => await User.find(),
    user: async (_: any, args: { id: string }, context) => {
      if (!context.id) {
        throw new CustomError('Token not found.', 401);
      }

      const user = await User.findOneBy({ id: args.id });

      if (!user) {
        throw new CustomError('User not found.', 404);
      }

      return user;
    },
    users: async (_: any, args: { input?: UsersInput }, context) => {
      if (!context.id) {
        throw new CustomError('Invalid token.', 401);
      }

      if (args.input.numberOfUsers <= 0) {
        throw new CustomError('numberOfUsers must be positive.', 400);
      }

      if (args.input.skip < 0) {
        throw new CustomError('skip can not be negative.', 400);
      }

      const [users, totalUsers] = await User.findAndCount({
        order: {
          name: 'ASC',
        },
        take: args.input.numberOfUsers ?? 5,
        skip: args.input.skip ?? 0,
      });

      const numberOfUsers = args.input.numberOfUsers ?? 5;
      const skip = args.input.skip ?? 0;

      const usersBefore = skip;
      const usersAfter = totalUsers - skip - numberOfUsers;

      return {
        users,
        totalUsers,
        usersBefore: usersBefore > totalUsers ? totalUsers : usersBefore,
        usersAfter: usersAfter < 0 ? 0 : usersAfter,
      };
    },
  },

  Mutation: {
    createUser: async (_: any, args: { input: UserInput }, context) => {
      if (!context.id) {
        throw new CustomError('Invalid token', 401);
      }

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

    login: async (_: any, args: { input: LoginInput }) => {
      await validateEmailLogin(args.input.email);
      const user = await User.findOneBy({ email: args.input.email });
      await comparePassword(args.input.password, user.password);
      const token = generateToken(user.id, args.input.rememberMe);

      return { user, token };
    },

    addAddress: async (_: any, args: { input: AddressInput }, context) => {
      if (!context.id) {
        throw new CustomError('Invalid token', 401);
      }

      const user = await User.findOne({ where: { email: args.input.userEmail }, relations: { addresses: true } });

      if (!user) {
        throw new CustomError('User not found!', 404);
      }

      const newAddress = new Address();
      newAddress.postalCode = args.input.postalCode;
      newAddress.street = args.input.street;
      newAddress.streetNumber = args.input.streetNumber;
      newAddress.complement = args.input.complement;
      newAddress.neighborhood = args.input.neighborhood;
      newAddress.city = args.input.city;
      newAddress.state = args.input.state;

      const address = await Address.save(newAddress);

      user.addresses.push(address);
      await User.save(user);

      return address;
    },
  },
};
