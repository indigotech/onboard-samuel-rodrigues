import { User } from '../entity/User';
import { CustomError } from '../errors/error-formatter';

export function validateEmail(email) {
  const regexEmail = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/;

  if (!regexEmail.test(email)) {
    throw new CustomError('Invalid email.', 401);
  }
}

export function validatePassword(password) {
  const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!regexPassword.test(password)) {
    throw new CustomError('Invalid password', 401);
  }
}

export async function emailAlreadyExists(email) {
  const emailAlreadyExists = await User.findOneBy({ email: email });

  if (emailAlreadyExists) {
    throw new CustomError('Email already registered.', 401);
  }
}
