'use strict';

// set up ot
const opentelemetry = require('@opentelemetry/core');
const { SpanKind, CanonicalCode } = require('@opentelemetry/types');
const config = require('./setup');
config.setupTracerAndExporters('postgres-server-service');
const tracer = opentelemetry.getTracer();

// set up pg
const setupPg  = require('./setupPsql');
const pool = setupPg.startPsql();

// set up express
const express = require('express');
const app = express();

app.get('/:cmd', (req, res) => {
  const cmd = req.path.slice(1);
  if (!req.query.id) {
    res.status(400).send('No id provided');
    return;
  }
  let queryText = `SELECT id, text FROM test WHERE id = ${req.query.id}`;
  if (cmd === 'insert') {
    if (!req.query.text) {
      res.status(400).send('No text provded');
      return;
    }
    queryText = {
      text: `INSERT INTO test (id, text) VALUES($1, $2) ON CONFLICT(id) DO UPDATE SET text=$2`,
      values: [req.query.id, req.query.text],
    };
  }
  const currentSpan = tracer.getCurrentSpan();
  console.log(`traceid: ${currentSpan.context().traceId}`);
  const span = tracer.startSpan(cmd, {
    parent: currentSpan,
    kind: SpanKind.SERVER,
  });
  tracer.withSpan(span, () => {
    try {
      pool.query(queryText, (err, ret) => {
        if (err) throw err;
        res.send(ret.rows);
      });
    } catch (e) {
      res.status(400).send({message: e.message});
      span.setStatus(CanonicalCode.UNKNOWN);
    }
    span.end();
  });
});

// start server
const port = 3000;
app.listen(port, function() {
  console.log(`Node HTTP listening on ${port}`);
});

