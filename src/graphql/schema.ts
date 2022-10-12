import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String
    getUsers: [User]
  }

  type User {
    id: String
    name: String
    email: String
    birthdate: String
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!, birthdate: String!): User!
  }
`;
