'use strict';

// Require tracer before any other modules
require('./tracer');
const Redis = require('ioredis');

const redis = new Redis();

async function main() {
  try {
    await redis.set('test', 'data');
    await redis.get('test');
  } catch (error) {
    console.error(error);
  }
}

main();
