'use strict';

require('./tracer');

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const buildSchema = require('./schema');

const schema = buildSchema();

const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
