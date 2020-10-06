'use strict';

require('./tracer');

const { ApolloServer } = require('apollo-server');
const buildSchema = require('./schema');

// Construct a schema, using GraphQL schema language
const schema = buildSchema();

const server = new ApolloServer({ schema });
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

// app.use('/graphql', server);
// app.listen(4000);

// server.applyMiddleware({ app });

console.log('Running a GraphQL API server at http://localhost:4000/graphql');
