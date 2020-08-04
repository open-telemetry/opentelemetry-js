const axios = require("axios");
const {
  HttpTraceContext,
  getExtractedSpanContext,

  setExtractedSpanContext,
} = require("@opentelemetry/core");
const { BasicTracerProvider } = require("@opentelemetry/tracing");
const { Context } = require("@opentelemetry/context-base");
const bodyParser = require("body-parser");
const {
  defaultGetter,
  defaultSetter,
  propagation,
  trace,
} = require("@opentelemetry/api");

// set global propagator
const myPropagator = new HttpTraceContext();
propagation.setGlobalPropagator(myPropagator);

// Create a provider for activating and tracking spans
const tracerProvider = new BasicTracerProvider({});

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
  const context = myPropagator.extract(
    Context.ROOT_CONTEXT,
    req.headers,
    defaultGetter
  );
  const spanContext = getExtractedSpanContext(context);
  Promise.all(
    req.body.map((action) => {
      const span = tracer.startSpan(
        "propagate-w3c",
        { parent: spanContext },
        context
      );
      const headers = {};
      myPropagator.inject(
        setExtractedSpanContext(context, span.context()),
        headers,
        defaultSetter
      );
      return axios
        .post(
          action.url,

          [...action.arguments],

          {
            headers,
            timeout: 5,
          }
        )
        .finally(() => {
          span.end();
        });
    })
  )
    .then(() => res.send("hello"))
    .catch((err) => res.status(500).send(err));
});

// Start the server
app.listen(port, () =>
  console.log(`W3c test server listening on port ${port}!`)
);
