// src/graphql/resolvers/query.ts
import { db } from '../../db';
import { Prisma } from '@prisma/client'; // Import Prisma types if needed

export const Query = {
  // --- Book Queries ---
  listBooks: (_: any, args: { authorId?: string; borrowedStatus?: boolean }) => {
    const where: Prisma.BookWhereInput = {};

    if (args.authorId) {
      where.authors = { some: { id: args.authorId } };
    }

    if (args.borrowedStatus !== undefined && args.borrowedStatus !== null) {
      where.borrowedById = args.borrowedStatus ? { not: null } : { equals: null };
    }

    return db.book.findMany({
      where,
      include: { authors: true, borrowedBy: true }, // Include related data
    });
  },
  book: (_: any, args: { id: string }) => {
    return db.book.findUnique({
      where: { id: args.id },
      include: { authors: true, borrowedBy: true },
    });
  },

  // --- Author Queries ---
  listAuthors: () => {
    return db.author.findMany({ include: { books: false } }); // Avoid fetching all books by default here if list is long
  },
  author: (_: any, args: { id: string }) => {
    return db.author.findUnique({
      where: { id: args.id },
      include: { books: true }, // Fetch books for a single author detail
    });
  },

  // --- User Queries ---
  listUsers: () => {
    return db.user.findMany({ include: { borrowedBooks: false } }); // Avoid fetching all books
  },
  user: (_: any, args: { id: string }) => {
    return db.user.findUnique({
      where: { id: args.id },
      include: { borrowedBooks: true }, // Fetch details for single user
    });
  },
};