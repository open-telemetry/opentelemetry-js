'use strict';

const url = require('url');
const http = require('http');
// Construct a schema, using GraphQL schema language

const source = `
query {
  books {
    name
    authors {
      name
      address {
        country
      }
    }
  }
}
`;

makeRequest(source).then(console.log);

function makeRequest(query) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL('http://localhost:4000/graphql');
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const req = http.request(options, (res) => {
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        resolve(data.toString());
      });
      res.on('error', (err) => {
        reject(err);
      });
    });

    req.write(JSON.stringify({ query }));
    req.end();
  });
}
