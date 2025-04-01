// src/graphql/typeDefs.ts
import * as fs from 'fs';
import * as path from 'path';

// Read the schema file
const schemaPath = path.join(__dirname, 'schema.graphql');
export const typeDefs = fs.readFileSync(schemaPath, 'utf-8');