const axios = require("axios");
const {
  HttpTraceContext,
  getExtractedSpanContext,
  setExtractedSpanContext,
} = require("@opentelemetry/core");
const { BasicTracerProvider } = require("@opentelemetry/tracing");
const { defaultSetter, propagation, trace } = require("@opentelemetry/api");
const bodyParser = require("body-parser");

// set global propagator
propagation.setGlobalPropagator(new HttpTraceContext());

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
  const context = propagation.extract(req.headers);
  const spanContext = getExtractedSpanContext(context);
  Promise.all(
    req.body.map((action) => {
      const span = tracer.startSpan(
        "propagate-w3c",
        { parent: spanContext },
        context
      );
      const headers = {};
      propagation.inject(
        headers,
        defaultSetter,
        setExtractedSpanContext(context, span.context())
      );
      return axios
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
    })
  )
    .then(() => res.send("hello"))
    .catch((err) => res.status(500).send(err));
});

// Start the server
app.listen(port, () =>
  console.log(`W3c test server listening on port ${port}!`)
);
