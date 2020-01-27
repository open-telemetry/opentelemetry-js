'use strict';

// eslint-disable-next-line import/order
const tracer = require('./tracer')('example-mysql-http-server');
const mysql = require('mysql');
const http = require('http');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'my_db',
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'my_db',
});

const cluster = mysql.createPoolCluster();

cluster.add({
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'my_db',
});

/** Starts a HTTP server that receives requests on sample server port. */
function startServer(port) {
  // Creates a server
  const server = http.createServer(handleRequest);
  // Starts the server
  server.listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Node HTTP listening on ${port}`);
  });
}

/** A function which handles requests and send response. */
function handleRequest(request, response) {
  const currentSpan = tracer.getCurrentSpan();
  // display traceid in the terminal
  const { traceId } = currentSpan.context();
  console.log(`traceid: ${traceId}`);
  console.log(`Jaeger URL: http://localhost:16686/trace/${traceId}`);
  console.log(`Zipkin URL: http://localhost:9411/zipkin/traces/${traceId}`);
  try {
    const body = [];
    request.on('error', (err) => console.log(err));
    request.on('data', (chunk) => body.push(chunk));
    request.on('end', () => {
      if (request.url === '/connection/query') {
        handleConnectionQuery(response);
      } else if (request.url === '/pool/query') {
        handlePoolQuery(response);
      } else if (request.url === '/cluster/query') {
        handleClusterQuery(response);
      } else {
        handleNotFound(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

startServer(8080);

function handlePoolQuery(response) {
  const query = 'SELECT 1 + 1 as pool_solution';
  pool.getConnection((connErr, conn, _fields) => {
    conn.query(query, (err, results) => {
      tracer.getCurrentSpan().addEvent('results');
      if (err) {
        console.log('Error code:', err.code);
        response.end(err.message);
      } else {
        response.end(`${query}: ${results[0].pool_solution}`);
      }
    });
  });
}

function handleConnectionQuery(response) {
  const query = 'SELECT 1 + 1 as solution';
  connection.query(query, (err, results, _fields) => {
    if (err) {
      console.log('Error code:', err.code);
      response.end(err.message);
    } else {
      response.end(`${query}: ${results[0].solution}`);
    }
  });
}

function handleClusterQuery(response) {
  const query = 'SELECT 1 + 1 as cluster_solution';
  cluster.getConnection((connErr, conn) => {
    conn.query(query, (err, results, _fields) => {
      tracer.getCurrentSpan().addEvent('results');
      if (err) {
        console.log('Error code:', err.code);
        response.end(err.message);
      } else {
        response.end(`${query}: ${results[0].cluster_solution}`);
      }
    });
  });
}

function handleNotFound(response) {
  response.end('not found');
}
