'use strict';

const https = require('https');
const graphql = require('graphql');

const url1 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';

function getData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

const authors = [];
const books = [];

function addBook(name, authorIds) {
  let authorIdsLocal = authorIds;
  if (typeof authorIdsLocal === 'string') {
    authorIdsLocal = authorIdsLocal.split(',').map((id) => parseInt(id, 10));
  }
  const id = books.length;
  books.push({
    id,
    name,
    authorIds: authorIdsLocal,
  });
  return books[books.length - 1];
}

function addAuthor(name, country, city) {
  const id = authors.length;
  authors.push({
    id,
    name,
    address: {
      country,
      city,
    },
  });
  return authors[authors.length - 1];
}

function getBook(id) {
  return books[id];
}

function getAuthor(id) {
  return authors[id];
}

function prepareData() {
  addAuthor('John', 'Poland', 'Szczecin');
  addAuthor('Alice', 'Poland', 'Warsaw');
  addAuthor('Bob', 'England', 'London');
  addAuthor('Christine', 'France', 'Paris');
  addBook('First Book', [0, 1]);
  addBook('Second Book', [2]);
  addBook('Third Book', [3]);
}

prepareData();
module.exports = function buildSchema() {
  const Author = new graphql.GraphQLObjectType({
    name: 'Author',
    fields: {
      id: {
        type: graphql.GraphQLString,
        resolve(obj, _args) {
          return obj.id;
        },
      },
      name: {
        type: graphql.GraphQLString,
        resolve(obj, _args) {
          return obj.name;
        },
      },
      description: {
        type: graphql.GraphQLString,
        resolve(_obj, _args) {
          return new Promise((resolve, reject) => {
            getData(url1).then((response) => {
              resolve(response.description);
            }, reject);
          });
        },
      },
      address: {
        type: new graphql.GraphQLObjectType({
          name: 'Address',
          fields: {
            country: {
              type: graphql.GraphQLString,
              resolve(obj, _args) {
                return obj.country;
              },
            },
            city: {
              type: graphql.GraphQLString,
              resolve(obj, _args) {
                return obj.city;
              },
            },
          },
        }),
        resolve(obj, _args) {
          return obj.address;
        },
      },
    },
  });

  const Book = new graphql.GraphQLObjectType({
    name: 'Book',
    fields: {
      id: {
        type: graphql.GraphQLInt,
        resolve(obj, _args) {
          return obj.id;
        },
      },
      name: {
        type: graphql.GraphQLString,
        resolve(obj, _args) {
          return obj.name;
        },
      },
      authors: {
        type: new graphql.GraphQLList(Author),
        resolve(obj, _args) {
          return obj.authorIds.map((id) => authors[id]);
        },
      },
    },
  });

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      author: {
        type: Author,
        args: {
          id: { type: graphql.GraphQLInt },
        },
        resolve(obj, args, _context) {
          return Promise.resolve(getAuthor(args.id));
        },
      },
      authors: {
        type: new graphql.GraphQLList(Author),
        resolve(_obj, _args, _context) {
          return Promise.resolve(authors);
        },
      },
      book: {
        type: Book,
        args: {
          id: { type: graphql.GraphQLInt },
        },
        resolve(obj, args, _context) {
          return Promise.resolve(getBook(args.id));
        },
      },
      books: {
        type: new graphql.GraphQLList(Book),
        resolve(_obj, _args, _context) {
          return Promise.resolve(books);
        },
      },
    },
  });

  const mutation = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addBook: {
        type: Book,
        args: {
          name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
          authorIds: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
        },
        resolve(obj, args, _context) {
          return Promise.resolve(addBook(args.name, args.authorIds));
        },
      },
    },
  });

  const schema = new graphql.GraphQLSchema({ query, mutation });
  return schema;
};
