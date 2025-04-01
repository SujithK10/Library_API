// src/graphql/resolvers/book.ts
import { db } from '../../db';
import { Book as PrismaBook } from '@prisma/client'; // Type import

export const Book = {
  // Resolver for the 'authors' field on the Book type
  authors: (parent: PrismaBook) => {
    // If authors were already included in the parent query, return them
    // This check might require knowing how the parent was fetched or always fetching
    // A safer approach is always fetching if not explicitly checked.
    return db.author.findMany({
      where: { books: { some: { id: parent.id } } },
    });
  },
  // Resolver for the 'borrowedBy' field on the Book type
  borrowedBy: (parent: PrismaBook & { borrowedBy?: any }) => { // Include potential prefetched relation
    // If borrowedBy was included via Prisma's include, return it
    if (parent.borrowedBy) return parent.borrowedBy;
    // Otherwise, if there's an ID, fetch the user
    if (parent.borrowedById) {
      return db.user.findUnique({ where: { id: parent.borrowedById } });
    }
    return null; // No user is borrowing this book
  },
  // Resolver for the derived 'isBorrowed' field
  isBorrowed: (parent: PrismaBook) => {
    return parent.borrowedById !== null; // True if borrowedById is set
  },
   // Resolvers for date formatting if needed (otherwise default ISO string is fine)
   createdAt: (parent: PrismaBook) => parent.createdAt.toISOString(),
   updatedAt: (parent: PrismaBook) => parent.updatedAt.toISOString(),
};