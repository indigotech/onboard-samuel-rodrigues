import bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { CustomError } from '../errors/error-formatter';
import { verifyToken } from '../jwt';

export function validateEmail(email: string) {
  const regexEmail = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/;

  if (!regexEmail.test(email)) {
    throw new CustomError('Invalid email.', 401);
  }
}

export function validatePassword(password: string) {
  const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!regexPassword.test(password)) {
    throw new CustomError('Invalid password.', 401);
  }
}

export async function validateEmailLogin(email: string) {
  const emailRegistered = await User.findOneBy({ email: email });

  if (!emailRegistered) {
    throw new CustomError('Email or password is incorrect.', 401);
  }
}

export async function comparePassword(password: string, hash: string) {
  const passwordIsRight = await bcrypt.compare(password, hash);

  if (!passwordIsRight) {
    throw new CustomError('Email or password is incorrect.', 401);
  }
}

export async function emailAlreadyExists(email: string) {
  const emailAlreadyExists = await User.findOneBy({ email: email });

  if (emailAlreadyExists) {
    throw new CustomError('Email already registered.', 401);
  }
}

export function validateToken(token: string, id: string) {
  const payload = verifyToken(token);
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (payload['id'] !== id) {
    throw new CustomError('Invalid token.', 401);
  }

  if (payload['exp'] < nowInSeconds) {
    throw new CustomError('Expired token.', 401);
  }
}
