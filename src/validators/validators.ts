import { User } from '../entity/User';
import { CustomError } from '../errors/error-formatter';

export async function validateEmail(email) {
  const emailAlreadyExists = await User.findOneBy({ email: email });

  if (emailAlreadyExists) {
    throw new CustomError('Email already registered.', 401);
  }
}

export function validatePassword(password) {
  const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!regexPassword.test(password)) {
    throw new CustomError('Invalid password', 401);
  }
}
