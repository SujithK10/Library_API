// src/graphql/resolvers/author.ts
import { db } from '../../db';
import { Author as PrismaAuthor } from '@prisma/client';

export const Author = {
  // Resolve the 'books' field for an Author
  books: (parent: PrismaAuthor) => {
    return db.book.findMany({
      where: { authors: { some: { id: parent.id } } },
      // Avoid including authors again here to prevent infinite loops if not careful
      // include: { authors: false } // Explicitly exclude if needed
    });
  },
  createdAt: (parent: PrismaAuthor) => parent.createdAt.toISOString(),
  updatedAt: (parent: PrismaAuthor) => parent.updatedAt.toISOString(),
};