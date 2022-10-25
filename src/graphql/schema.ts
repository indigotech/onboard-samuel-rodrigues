import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String
    getUsers: [User]
  }

  type Mutation {
    createUser(input: UserInput!): User!
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
`;
