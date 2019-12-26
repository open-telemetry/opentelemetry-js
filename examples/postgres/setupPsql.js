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
    let pool = new Pool(CONFIG);

    pool.connect(function(err, client, release) {
        if (err) throw err;
        release();
        const queryText = 'CREATE TABLE IF NOT EXISTS test(id SERIAL PRIMARY KEY, text VARCHAR(40) not null)';
        client.query(queryText, (err, res) => {
            if (err) throw err;
        });
    });

    return pool;
}

exports.startPsql = startPsql;
