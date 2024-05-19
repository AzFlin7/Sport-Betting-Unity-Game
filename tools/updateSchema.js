import fetch from 'node-fetch';
import fs from 'fs';
import {
  buildClientSchema,
  printSchema,
  introspectionQuery,
} from 'graphql/utilities';
import path from 'path';
import { backendUrlGraphql } from '../constants.json';

const schemaPath = path.join(__dirname, '../data/schema');
console.log(schemaPath);
// Save JSON of full schema introspection for Babel Relay Plugin to use
fetch(backendUrlGraphql, {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: introspectionQuery }),
})
  .then(res => res.json())
  .then(schemaJSON => {
    fs.writeFileSync(
      `${schemaPath}.json`,
      JSON.stringify(schemaJSON, null, 2),
    );
    // Save user readable type system shorthand of schema
    const graphQLSchema = buildClientSchema(schemaJSON.data);
    fs.writeFileSync(`${schemaPath}.graphql`, printSchema(graphQLSchema));
  });
