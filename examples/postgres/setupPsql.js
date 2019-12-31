'use strict';

const { Pool } = require('pg');

// create new pool for psql
const CONFIG = {
  user: process.env.POSTGRES_USER || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT
    ? parseInt(process.env.POSTGRES_PORT, 10)
    : 54320,
};

function startPsql() {
  const pool = new Pool(CONFIG);

  pool.connect((connectErr, client, release) => {
    if (connectErr) throw connectErr;
    release();
    const queryText = 'CREATE TABLE IF NOT EXISTS test(id SERIAL PRIMARY KEY, text VARCHAR(40) not null)';
    client.query(queryText, (err, res) => {
      if (err) throw err;
      console.log(res.rows[0]);
    });
  });

  return pool;
}

exports.startPsql = startPsql;
