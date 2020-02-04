'use strict';

// eslint-disable-next-line import/order
const tracer = require('./tracer')('example-redis-server');

// Require in rest of modules
const express = require('express');
const axios = require('axios').default;
const tracerHandlers = require('./express-tracer-handlers');
const redisPromise = require('./setup-redis').redis;

// Setup express
const app = express();
const PORT = 8080;

/**
 * Redis Routes are set up async since we resolve the client once it is successfully connected
 */
async function setupRoutes() {
  const redis = await redisPromise;

  app.get('/run_test', async (req, res) => {
    const uuid = Math.random()
      .toString(36)
      .substring(2, 15)
      + Math.random()
        .toString(36)
        .substring(2, 15);
    await axios.get(`http://localhost:${PORT}/set?args=uuid,${uuid}`);
    const body = await axios.get(`http://localhost:${PORT}/get?args=uuid`);

    if (body.data !== uuid) {
      throw new Error('UUID did not match!');
    } else {
      res.sendStatus(200);
    }
  });

  app.get('/:cmd', (req, res) => {
    if (!req.query.args) {
      res.status(400).send('No args provided');
      return;
    }

    const { cmd } = req.params;
    const args = req.query.args.split(',');
    redis[cmd].call(redis, ...args, (err, result) => {
      if (err) {
        res.sendStatus(400);
      } else if (result) {
        res.status(200).send(result);
      } else {
        throw new Error('Empty redis response');
      }
    });
  });
}

// Setup express routes & middleware
app.use(tracerHandlers.getMiddlewareTracer(tracer));
setupRoutes().then(() => {
  app.use(tracerHandlers.getErrorTracer(tracer));
  app.listen(PORT);
  console.log(`Listening on http://localhost:${PORT}`);
});
