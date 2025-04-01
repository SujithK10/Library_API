// src/db.ts
import { PrismaClient } from '@prisma/client';

// Add prisma to the NodeJS global type
// Optional: helps with TypeScript inference in serverless environments or similar
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const db =
  global.prisma ||
  new PrismaClient({
    // Log Prisma queries (optional)
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}