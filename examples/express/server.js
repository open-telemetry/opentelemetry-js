'use strict';

// eslint-disable-next-line
const tracer = require('./tracer')('example-express-server');

// Require in rest of modules
const express = require('express');
const axios = require('axios').default;

// Setup express
const app = express();
const PORT = 8080;


const getCrudController = () => {
  const router = express.Router();
  const resources = [];
  router.get('/', (req, res) => res.send(resources));
  router.post('/', (req, res) => {
    resources.push(req.body);
    return res.status(201).send(req.body);
  });
  return router;
};

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && authorization.includes('secret_token')) {
    next();
  } else {
    res.sendStatus(401);
  }
};

async function setupRoutes() {
  app.use(express.json());

  app.get('/run_test', async (req, res) => {
    const createdCat = await axios.post(`http://localhost:${PORT}/cats`, {
      name: 'Tom',
      friends: [
        'Jerry',
      ],
    }, {
      headers: {
        Authorization: 'secret_token',
      },
    });

    return res.status(201).send(createdCat.data);
  });
  app.use('/cats', authMiddleware, getCrudController());
}

setupRoutes().then(() => {
  app.listen(PORT);
  console.log(`Listening on http://localhost:${PORT}`);
});
