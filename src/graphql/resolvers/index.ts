// src/graphql/resolvers/index.ts
import { Query } from './query'; // Assuming Query resolvers are grouped
import { Mutation } from './mutation';
import { Book } from './book';
import { Author } from './author';
import { User } from './user';

export const resolvers = {
  Query,
  Mutation,
  Book,
  Author,
  User,
   // Add scalar resolvers if needed (e.g., for Date)
  // DateTime: GraphQLDateTime, // Example if using a date scalar library
};