// src/graphql/resolvers/user.ts
import { db } from '../../db';
import { User as PrismaUser } from '@prisma/client';

export const User = {
  // Resolve the 'borrowedBooks' field for a User
  borrowedBooks: (parent: PrismaUser) => {
    return db.book.findMany({
      where: { borrowedById: parent.id },
       include: { authors: true } // Optionally include authors for the books list
    });
  },
  createdAt: (parent: PrismaUser) => parent.createdAt.toISOString(),
  updatedAt: (parent: PrismaUser) => parent.updatedAt.toISOString(),
};