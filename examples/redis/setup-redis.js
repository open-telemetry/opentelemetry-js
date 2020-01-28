'use strict';

const redis = require('redis');

const client = redis.createClient('redis://localhost:6379');
const redisPromise = new Promise(((resolve, reject) => {
  client.once('ready', () => {
    resolve(client);
  });
  client.once('error', (error) => {
    reject(error);
  });
}));

exports.redis = redisPromise;
