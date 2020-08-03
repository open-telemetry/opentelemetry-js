const axios = require("axios");
const { B3Propagator } = require("@opentelemetry/core");
const { HttpTraceContext } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");
const bodyParser = require("body-parser");
const opentelemetry = require("@opentelemetry/api");

// Get the args
const myArgs = process.argv.slice(2);

// Get the propagator type
const propagatorTypeArg = myArgs[0];
const myPropagator =
  propagatorTypeArg === "b3" ? B3Propagator : HttpTraceContext;

// set global propagator
opentelemetry.propagation.setGlobalPropagator(new myPropagator());

// Create a provider for activating and tracking spans
const tracerProvider = new NodeTracerProvider({});

// Register the tracer
tracerProvider.register();

// --- Simple Express app setup
const express = require("express");
const port = 5000;
const app = express();

app.use(bodyParser.json());

// Mount our demo route
app.post("/verify-tracecontext", (req, res) => {
  Promise.all(
    req.body.map((action) =>
      axios.post(
        action.url,

        [...action.arguments],

        {
          timeout: 5,
        }
      )
    )
  )
    .then(() => res.send("hello"))
    .catch((err) => res.status(500).send(err));
});

// Start the server
app.listen(port, () =>
  console.log(`W3c test server listening on port ${port}!`)
);
