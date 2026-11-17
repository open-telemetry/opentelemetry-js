const { W3CTraceContextPropagator } = require("@opentelemetry/core");
const { TracerProvider } = require("@opentelemetry/sdk-trace");
const { context, propagation, trace, ROOT_CONTEXT } = require("@opentelemetry/api");
const {
  AsyncLocalStorageContextManager,
} = require("@opentelemetry/context-async-hooks");
const bodyParser = require("body-parser");

// set global propagator
propagation.setGlobalPropagator(new W3CTraceContextPropagator());

// set global context manager
context.setGlobalContextManager(new AsyncLocalStorageContextManager());

// set global tracer provider
trace.setGlobalTracerProvider(new TracerProvider());

// Get a tracer
const tracer = trace.getTracer("w3c-tests");

// --- Simple Express app setup
const express = require("express");
const port = 5000;
const app = express();

app.use(bodyParser.json());

// The W3C test harness only ever asks this service to call back to itself
// (a loopback HTTP server on an ephemeral port). Rebuild the target URL from
// validated parts with a fixed host, rather than passing a user-supplied URL
// to the HTTP client, so this endpoint cannot be used to reach other hosts.
const ALLOWED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

function buildCallbackUrl(rawUrl) {
  const parsed = new URL(String(rawUrl));
  if (parsed.protocol !== "http:" || !ALLOWED_HOSTNAMES.has(parsed.hostname)) {
    throw new Error("callback URL must be an http loopback address");
  }
  const callbackPort = Number.parseInt(parsed.port, 10);
  if (!Number.isInteger(callbackPort) || callbackPort < 1 || callbackPort > 65535) {
    throw new Error("callback URL must have an explicit valid port");
  }
  return `http://127.0.0.1:${callbackPort}${parsed.pathname}${parsed.search}`;
}

// Mount our demo route
app.post("/verify-tracecontext", (req, res) => {
  context.with(propagation.extract(ROOT_CONTEXT, req.headers), () => {
    Promise.all(
      req.body.map((action) => {
        const span = tracer.startSpan("propagate-w3c");
        let promise;
        context.with(trace.setSpan(context.active(), span), () => {
          const headers = {};
          propagation.inject(context.active(), headers);
          promise = fetch(buildCallbackUrl(action.url), {
            method: "POST",
            headers: { ...headers, "content-type": "application/json" },
            body: JSON.stringify([...action.arguments]),
            signal: AbortSignal.timeout(10),
          })
            .then((response) => {
              // match previous axios behavior: non-2xx rejects
              if (!response.ok) {
                throw new Error(`callback failed with status ${response.status}`);
              }
              return response.arrayBuffer();
            })
            .finally(() => {
              span.end();
            });
        });
        return promise;
      })
    )
    .then(() => res.send("hello"))
    .catch((err) => res.status(500).send(String(err)));
  });
});

// Start the server
app.listen(port, () =>
  console.log(`W3c test server listening on port ${port}!`)
);
