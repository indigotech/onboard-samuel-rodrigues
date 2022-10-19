import { User } from '../entity/User';

export async function validateEmail(email) {
  const emailAlreadyExists = await User.findOneBy({ email: email });

  if (emailAlreadyExists) {
    throw new Error('Email already registered.');
  }
}

export async function validatePassword(password) {
  const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!regexPassword.test(password)) {
    throw new Error('Invalid password');
  }
}
