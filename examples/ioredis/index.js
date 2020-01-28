'use strict';

// Require tracer before any other modules
require('./tracer');
const Redis = require('ioredis');

const redis = new Redis();

async function main() {
  try {
    await redis.set('test', 'data');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
