// src/graphql/resolvers/mutation.ts
import { db } from '../../db';
import { GraphQLError } from 'graphql'; // For error handling

export const Mutation = {
  // --- Book Mutations ---
  addBook: async (_: any, args: { input: { title: string; isbn?: string; authorIds: string[] } }) => {
    const { title, isbn, authorIds } = args.input;

    // Basic validation: Check if authors exist (optional but good practice)
    const authorsExist = await db.author.count({
      where: { id: { in: authorIds } },
    });
    if (authorsExist !== authorIds.length) {
      throw new GraphQLError('One or more authors not found', {
          extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    return db.book.create({
      data: {
        title,
        isbn,
        authors: {
          connect: authorIds.map((id) => ({ id })), // Connect relation
        },
      },
      include: { authors: true, borrowedBy: true },
    });
  },
  updateBook: async (_: any, args: { id: string; input: { title?: string; isbn?: string; authorIds?: string[] } }) => {
      const { id, input } = args;
      const { title, isbn, authorIds } = input;

      // Check if book exists
      const book = await db.book.findUnique({ where: { id } });
      if (!book) {
         throw new GraphQLError(`Book with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
         });
      }

      // Handle author updates if provided
      let authorConnectDisconnect;
      if (authorIds) {
          const authorsExist = await db.author.count({ where: { id: { in: authorIds } } });
          if (authorsExist !== authorIds.length) {
              throw new GraphQLError('One or more authors for update not found', {
                  extensions: { code: 'BAD_USER_INPUT' },
              });
          }
          // Simple approach: disconnect all existing, connect new ones
          // More complex logic might be needed for partial updates
          authorConnectDisconnect = {
               // disconnect: book.authors.map(a => ({ id: a.id })), // Requires fetching authors first if not included
               // connect: authorIds.map(id => ({ id })),
               // More efficient: Use set for complete replacement
               set: authorIds.map(id => ({ id }))
          }
      }


      return db.book.update({
          where: { id },
          data: {
              title: title ?? undefined, // Use ?? undefined to avoid setting null if not provided
              isbn: isbn ?? undefined,
              authors: authorConnectDisconnect,
          },
          include: { authors: true, borrowedBy: true },
      });
  },
  deleteBook: async (_: any, args: { id: string }) => {
    try {
      // Check if book is borrowed first? Depends on requirements.
      // For simplicity, we allow deleting even if borrowed here.
      await db.book.delete({ where: { id: args.id } });
      return true; // Indicate success
    } catch (error: any) {
      // Handle cases where the book doesn't exist (Prisma throws error)
      if (error.code === 'P2025') { // Prisma record not found code
         return false; // Or throw new GraphQLError('Book not found', { extensions: { code: 'NOT_FOUND' }});
      }
      console.error("Error deleting book:", error);
      // Optionally throw a generic error
      throw new GraphQLError('Could not delete book', { extensions: { code: 'INTERNAL_SERVER_ERROR' }});
    }
  },

  // --- Author Mutations ---
  addAuthor: (_: any, args: { input: { name: string } }) => {
    return db.author.create({
      data: { name: args.input.name },
    });
  },
  updateAuthor: async (_: any, args: { id: string; input: { name?: string } }) => {
      const { id, input } = args;
      // Check if author exists
      const author = await db.author.findUnique({ where: { id } });
      if (!author) {
         throw new GraphQLError(`Author with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
         });
      }
      return db.author.update({
          where: { id },
          data: { name: input.name ?? undefined },
      });
  },
  deleteAuthor: async (_: any, args: { id: string }) => {
     // Note: Deleting an author might fail if they are linked to books,
     // depending on database constraints or if you add checks.
     // Consider if you should disallow deletion if books exist, or delete/unlink books.
     try {
        // Check if author has books (optional constraint)
        const booksCount = await db.book.count({ where: { authors: { some: { id: args.id } } } });
        if (booksCount > 0) {
             throw new GraphQLError('Cannot delete author with associated books. Update books first.', {
                extensions: { code: 'BAD_REQUEST' }, // Or another suitable code
             });
        }

        await db.author.delete({ where: { id: args.id } });
        return true;
     } catch (error: any) {
        if (error instanceof GraphQLError) throw error; // Re-throw known GraphQL errors
        if (error.code === 'P2025') {
            return false; // Author not found
        }
        console.error("Error deleting author:", error);
        throw new GraphQLError('Could not delete author', { extensions: { code: 'INTERNAL_SERVER_ERROR' }});
     }
  },

  // --- User Mutations ---
  addUser: (_: any, args: { input: { name: string } }) => {
    return db.user.create({
      data: { name: args.input.name },
    });
  },

  // --- Borrowing Mutations ---
  borrowBook: async (_: any, args: { bookId: string; userId: string }) => {
    const { bookId, userId } = args;

    // 1. Check if user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new GraphQLError(`User with ID ${userId} not found`, { extensions: { code: 'NOT_FOUND' } });
    }

    // 2. Check if book exists and is NOT already borrowed
    const book = await db.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new GraphQLError(`Book with ID ${bookId} not found`, { extensions: { code: 'NOT_FOUND' } });
    }
    if (book.borrowedById) {
      throw new GraphQLError(`Book with ID ${bookId} is already borrowed`, { extensions: { code: 'BAD_REQUEST' } });
    }

    // 3. Update the book to mark it as borrowed by the user
    return db.book.update({
      where: { id: bookId },
      data: {
        borrowedById: userId, // Set the foreign key
      },
      include: { authors: true, borrowedBy: true }, // Include data for response
    });
  },
  returnBook: async (_: any, args: { bookId: string }) => {
    const { bookId } = args;

     // 1. Check if book exists and IS currently borrowed
     const book = await db.book.findUnique({ where: { id: bookId } });
     if (!book) {
         throw new GraphQLError(`Book with ID ${bookId} not found`, { extensions: { code: 'NOT_FOUND' } });
     }
     if (!book.borrowedById) {
         throw new GraphQLError(`Book with ID ${bookId} is not currently borrowed`, { extensions: { code: 'BAD_REQUEST' } });
     }

    // 2. Update the book to mark it as returned (clear the foreign key)
    return db.book.update({
      where: { id: bookId },
      data: {
        borrowedById: null, // Set foreign key to null
      },
      include: { authors: true, borrowedBy: true }, // Include data for response
    });
  },
};