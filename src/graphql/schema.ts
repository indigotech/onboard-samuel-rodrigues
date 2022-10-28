import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String
    getUsers: [User]
    user(id: String): User
    users(numberOfUsers: Int): [User]
  }

  type Mutation {
    createUser(input: UserInput!): User!
    login(input: LoginInput): Login!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    birthdate: String!
  }

  type User {
    id: String!
    name: String!
    email: String!
    birthdate: String!
  }

  input LoginInput {
    email: String!
    password: String!
    rememberMe: Boolean
  }

  type Login {
    user: User
    token: String
  }
`;
