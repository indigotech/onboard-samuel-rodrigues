import bcrypt from 'bcrypt';
import { CustomError } from './errors/error-formatter';
import { User } from './entity/User';
import { sign } from 'jsonwebtoken';

export async function autenticateUser(input) {
  const user = await User.findOneBy({ email: input.email });

  if (!user) {
    throw new CustomError('Email or password is incorrect.', 401);
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password);

  if (!passwordMatch) {
    throw new CustomError('Email or password is incorrect.', 401);
  }

  const token = sign({}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  return { user, token };
}
