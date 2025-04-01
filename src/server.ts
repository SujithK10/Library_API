// src/server.ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers'; // Ensure this imports the merged resolvers
import { db } from './db'; // Import prisma client instance
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// Define context type if needed (optional but good practice)
interface MyContext {
  // You can add properties to context here, like authentication info
  // For now, we don't strictly need it as Prisma client is globally accessible via import
  // Example: token?: String;
}

async function startApolloServer() {
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    // You might add plugins for logging, error handling etc. here
    // plugins: [...]
  });

  const { url } = await startStandaloneServer(server, {
    // Context can be used to pass database clients, auth info, etc. to resolvers
    context: async ({ req, res }) => {
        // Example: Can add auth logic here based on req.headers
        return {
            // db // If you prefer passing db via context instead of importing directly
        };
    },
    listen: { port: 4000 }, // Default port is 4000
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startApolloServer().catch((error) => {
  console.error('💥 Error starting server:', error);
  process.exit(1);
});