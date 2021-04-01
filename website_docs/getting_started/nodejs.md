---
title: "Node.JS"
weight: 2
---

This guide uses the example application in node.js provided below, but the steps to instrument your own application should be broadly the same. Here is an overview of what we will be doing.

- Install the required OpenTelemetry libraries
- Initialize a global [tracer](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#tracer)
- Initialize and register a [span exporter](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/sdk.md#span-exporter)

Copy the following file into an empty directory and call it `app.js`.

```javascript
"use strict";

const PORT = process.env.PORT || "8080";

const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

Run `npm install express` to have all dependencies available.

## Installation

To create traces on NodeJS, you will need `@opentelemetry/node`, `@opentelemetry/core`, and any plugins required by your application such as gRPC, or HTTP. If you are using the example application, you will need to install `@opentelemetry/plugin-http`, `@opentelemetry/plugin-https` and `@opentelemetry/plugin-express`.

```sh
$ npm install \
  @opentelemetry/core \
  @opentelemetry/node \
  @opentelemetry/plugin-http \
  @opentelemetry/plugin-https \
  @opentelemetry/plugin-express \
  @opentelemetry/metrics \
  @opentelemetry/tracing
```

## Initialization and Configuration

All tracing initialization should happen before your application’s code runs. The easiest way to do this is to initialize tracing in a separate file that is required using node’s `-r` option before application code runs.

## Creating a Tracer Provider

Create a file named `tracing.js` and add the following code to create a tracer provider:

```javascript
'use strict';

const { LogLevel } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");

const provider = new NodeTracerProvider({
  logLevel: LogLevel.ERROR
});

provider.register();
```

If you run your application now with `node -r ./tracing.js app.js`, your application will create and propagate traces over HTTP. If an already instrumented service that supports [Trace Context](https://www.w3.org/TR/trace-context/) headers calls your application using HTTP, and you call another application using HTTP, the Trace Context headers will be correctly propagated.

If you wish to see a completed trace, however, there is one more step. You must register an exporter.

## Creating a Metric Provider

In order to create and monitor metrics, we will need a `Meter`. In OpenTelemetry, a `Meter` is the mechanism used to create and manage metrics, labels, and metric exporters.

Create a file named `monitoring.js` and add the following code:

```javascript
'use strict';

const { MeterProvider } = require('@opentelemetry/metrics');

const meter = new MeterProvider().getMeter('your-meter-name');
```

Now, you can require this file from your application code and use the `Meter` to create and manage metrics. The simplest of these metrics is a counter. Let's create and export from our `monitoring.js` file a middleware function that express can use to count all requests by route. Modify the `monitoring.js` file so that it looks like this:

```javascript
'use strict';

const { MeterProvider } = require('@opentelemetry/metrics');

const meter = new MeterProvider().getMeter('your-meter-name');

const requestCount = meter.createCounter("requests", {
  description: "Count all incoming requests"
});

const boundInstruments = new Map();

module.exports.countAllRequests = () => {
  return (req, res, next) => {
    if (!boundInstruments.has(req.path)) {
      const labels = { route: req.path };
      const boundCounter = requestCount.bind(labels);
      boundInstruments.set(req.path, boundCounter);
    }

    boundInstruments.get(req.path).add(1);
    next();
  };
};
```

Now let's import and use this middleware in our application code:

```javascript
const { countAllRequests } = require("./monitoring");
const app = express();
app.use(countAllRequests());
```

Now, when we make requests (e.g. `curl http://localhost:8080`) to our service our meter will count all requests.

**Note**: Creating a new `labelSet` and `binding` on every request is not ideal as creating the `labelSet` can often be an expensive operation. This is why instruments are created and stored in a `Map` according to the route key.

## Creating a Console Exporter

To export traces, modify `tracing.js` so that it matches the following code snippet:

```javascript
'use strict';

const { LogLevel } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor, ConsoleSpanExporter } = require("@opentelemetry/tracing");

const provider = new NodeTracerProvider({
  logLevel: LogLevel.ERROR
});

provider.register();

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

console.log("tracing initialized");
```

To export metrics, modify `monitoring.js` so that it matches the following code snippet:

```javascript
'use strict';

const { MeterProvider, ConsoleMetricExporter } = require('@opentelemetry/metrics');

const exporter = new ConsoleMetricExporter()

const meter = new MeterProvider({
  exporter,
  interval: 5000
}).getMeter('your-meter-name');

const requestCount = meter.createCounter("requests", {
  description: "Count all incoming requests"
});

const boundInstruments = new Map();

module.exports.countAllRequests = () => {
  return (req, res, next) => {
    if (!boundInstruments.has(req.path)) {
      const labels = { route: req.path };
      const boundCounter = requestCount.bind(labels);
      boundInstruments.set(req.path, boundCounter);
    }

    boundInstruments.get(req.path).add(1);
    next();
  };
};
```

Now, restart your application and add some load, you will see traces & metrics printed to your console:

```javascript
{
  traceId: 'f27805526b1c74293bbc9345cd48ff3b',
  parentId: 'd6bdf2a18df04ef0',
  name: 'middleware - query',
  id: '36335b81de12cc4a',
  kind: 0,
  timestamp: 1603789083744612,
  duration: 365,
  attributes: {
    component: 'express',
    'express.name': 'query',
    'express.type': 'middleware'
  },
  status: { code: 0 },
  events: []
}
{
  name: 'requests',
  description: 'Count all incoming requests',
  unit: '1',
  metricKind: 0,
  valueType: 1
}
{ route: '/' }
value: 1
```

If you'd like to write those traces and spanes to Zipkin or Prometheus follow the [complete guide](https://github.com/open-telemetry/opentelemetry-js/blob/main/getting-started/README.md).

## Quick Start

To have everything up and running in a few seconds, create an empty directory and create the following files:

- package.json

  ```json
  {
    "dependencies": {
      "@opentelemetry/core": "^0.12.0",
      "@opentelemetry/metrics": "^0.12.0",
      "@opentelemetry/node": "^0.12.0",
      "@opentelemetry/plugin-express": "^0.10.0",
      "@opentelemetry/plugin-http": "^0.12.0",
      "@opentelemetry/plugin-https": "^0.12.0",
      "express": "^4.17.1"
    }
  }
  ```
  
- app.js

  ```javascript
  "use strict";
  const PORT = process.env.PORT || "8080";
  const express = require("express");
  const app = express();
  const { countAllRequests } = require("./monitoring");
  app.use(countAllRequests());
  app.get("/", (req, res) => { res.send("Hello World"); });
  app.listen(parseInt(PORT, 10), () => { console.log(`Listening for requests on http://localhost:${PORT}`); });
  ```
  
- tracing.js

  ```javascript
  'use strict';
  const { LogLevel } = require("@opentelemetry/core");
  const { NodeTracerProvider } = require("@opentelemetry/node");
  const { SimpleSpanProcessor, ConsoleSpanExporter } = require("@opentelemetry/tracing");
  const provider = new NodeTracerProvider({ logLevel: LogLevel.ERROR });
  provider.register();
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  console.log("tracing initialized");
  ```
  
- monitoring.js

  ```javascript
  'use strict';
  const { MeterProvider, ConsoleMetricExporter } = require('@opentelemetry/metrics');
  const exporter = new ConsoleMetricExporter()
  const meter = new MeterProvider({
    exporter,
    interval: 5000
  }).getMeter('your-meter-name');
  const requestCount = meter.createCounter("requests", { description: "Count all incoming requests" });
  const boundInstruments = new Map();
  module.exports.countAllRequests = () => {
    return (req, res, next) => {
      if (!boundInstruments.has(req.path)) {
        const labels = { route: req.path };
        const boundCounter = requestCount.bind(labels);
        boundInstruments.set(req.path, boundCounter);
      }
      boundInstruments.get(req.path).add(1);
      next();
    };
  };
  ```

Run `npm install` and `node -r ./tracing.js app.js` and add some load to the app, e.g. `curl http://localhost:8080`
