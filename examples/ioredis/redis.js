'use strict';

const Redis = require('ioredis');

const redis = new Redis('redis://localhost:6379');

module.exports = redis;
