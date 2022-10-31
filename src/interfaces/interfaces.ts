export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}