const axios = require("axios");
const { HttpTraceContext } = require("@opentelemetry/core");
const { BasicTracerProvider } = require("@opentelemetry/tracing");
const { context, propagation, trace } = require("@opentelemetry/api");
const {
  AsyncHooksContextManager,
} = require("@opentelemetry/context-async-hooks");
const bodyParser = require("body-parser");

// set global propagator
propagation.setGlobalPropagator(new HttpTraceContext());

// set global context manager
context.setGlobalContextManager(new AsyncHooksContextManager());

// Create a provider for activating and tracking spans
const tracerProvider = new BasicTracerProvider();

// Register the tracer
tracerProvider.register();

// Get a tracer
const tracer = trace.getTracer("w3c-tests");

// --- Simple Express app setup
const express = require("express");
const port = 5000;
const app = express();

app.use(bodyParser.json());

// Mount our demo route
app.post("/verify-tracecontext", (req, res) => {
  context.with(propagation.extract(req.headers), () => {
    Promise.all(
      req.body.map((action) => {
        const span = tracer.startSpan("propagate-w3c");
        let promise;
        tracer.withSpan(span, () => {
          const headers = {};
          propagation.inject(headers);
          promise = axios
            .post(
              action.url,

              [...action.arguments],

              {
                headers,
                timeout: 10,
              }
            )
            .finally(() => {
              span.end();
            });
        });
        return promise;
      })
    )
      .then(() => res.send("hello"))
      .catch((err) => res.status(500).send(err));
  });
});

// Start the server
app.listen(port, () =>
  console.log(`W3c test server listening on port ${port}!`)
);
