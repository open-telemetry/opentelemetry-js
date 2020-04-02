# Getting Started with OpenTelemetry JS

This guide will walk you through the setup and configuration process for a tracing backend (in this case [Zipkin](https://zipkin.io), but [Jaeger](https://www.jaegertracing.io) would be simple to use as well), a metrics backend like [Prometheus](https://prometheus.io), and auto-instrumentation of NodeJS. [You can find the guide for TypeScript here](ts-example/README.md#getting-started-with-opentelemetry-js-typescript).

1. [Tracing Your Application with OpenTelemetry](#tracing-your-application-with-opentelemetry)
    1. [Setting up a Tracing Backend](#setting-up-a-tracing-backend)
    2. [Trace Your NodeJS Application](#trace-your-nodejs-application)
        1. [Install the required OpenTelemetry libraries](#install-the-required-opentelemetry-libraries)
        2. [Initialize a global tracer](#initialize-a-global-tracer)
        3. [Initialize and register a trace exporter](#initialize-and-register-a-trace-exporter)
2. [Collect Metrics Using OpenTelemetry](#collect-metrics-using-opentelemetry)
    1. [Set up a Metrics Backend](#set-up-a-metrics-backend)
    2. [Monitor Your NodeJS Application](#monitor-your-nodejs-application)
        1. [Install the required OpenTelemetry metrics libraries](#install-the-required-opentelemetry-metrics-libraries)
        2. [Initialize a meter and collect metrics](#initialize-a-meter-and-collect-metrics)
        3. [Initialize and register a metrics exporter](#initialize-and-register-a-metrics-exporter)

## Tracing Your Application with OpenTelemetry

([link to TypeScript version](ts-example/README.md#tracing-your-application-with-opentelemetry))

This guide assumes you are going to be using Zipkin as your tracing backend, but modifying it for Jaeger should be straightforward.

An example application which can be used with this guide can be found at in the [example directory](example). You can see what it looks like with tracing enabled in the [traced-example directory](traced-example).

### Setting up a Tracing Backend

([link to TypeScript version](ts-example/README.md#setting-up-a-tracing-backend))

The first thing we will need before we can start collecting traces is a tracing backend like Zipkin that we can export traces to. If you already have a supported tracing backend (Zipkin or Jaeger), you can skip this step. If not, you will need to run one.

In order to set up Zipkin as quickly as possible, run the latest [Docker Zipkin](https://github.com/openzipkin/docker-zipkin) container, exposing port `9411`. If you can’t run Docker containers, you will need to download and run Zipkin by following the Zipkin [quickstart guide](https://zipkin.io/pages/quickstart.html).

```sh
$ docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Browse to <http://localhost:9411> to ensure that you can see the Zipkin UI.

<p align="center"><img src="./images/zipkin.png?raw=true"/></p>

### Trace Your NodeJS Application

([link to TypeScript version](ts-example/README.md#trace-your-nodejs-application))

This guide uses the example application provided in the `example` directory, but the steps to instrument your own application should be broadly the same. Here is an overview of what we will be doing.

1. Install the required OpenTelemetry libraries
2. Initialize a global tracer
3. Initialize and register a trace exporter

#### Install the required OpenTelemetry libraries

([link to TypeScript version](ts-example/README.md#install-the-required-opentelemetry-libraries))

To create traces on NodeJS, you will need `@opentelemetry/node`, `@opentelemetry/core`, and any plugins required by your application such as gRPC, or HTTP. If you are using the example application, you will need to install `@opentelemetry/plugin-http`.

```sh
$ npm install \
  @opentelemetry/core \
  @opentelemetry/node \
  @opentelemetry/plugin-http
```

#### Initialize a global tracer

([link to TypeScript version](ts-example/README.md#initialize-a-global-tracer))

All tracing initialization should happen before your application’s code runs. The easiest way to do this is to initialize tracing in a separate file that is required using node’s `-r` option before application code runs.

Create a file named `tracing.js` and add the following code:

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

If you wish to see a completed trace, however, there is one more step. You must register an exporter to send traces to a tracing backend.

#### Initialize and Register a Trace Exporter

([link to TypeScript version](ts-example/README.md#initialize-and-register-a-trace-exporter))

This guide uses the Zipkin tracing backend, but if you are using another backend like [Jaeger](https://www.jaegertracing.io), this is where you would make your change.

To export traces, we will need a few more dependencies. Install them with the following command:

```sh
$ npm install \
  @opentelemetry/tracing \
  @opentelemetry/exporter-zipkin

$ # for jaeger you would run this command:
$ # npm install @opentelemetry/exporter-jaeger
```

After these dependencies are installed, we will need to initialize and register them. Modify `tracing.js` so that it matches the following code snippet, replacing the service name `"getting-started"` with your own service name if you wish.

```javascript
'use strict';

const { LogLevel } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");

const provider = new NodeTracerProvider({
  logLevel: LogLevel.ERROR
});

provider.register();

provider.addSpanProcessor(
  new SimpleSpanProcessor(
    new ZipkinExporter({
      serviceName: "getting-started",
      // If you are running your tracing backend on another host,
      // you can point to it using the `url` parameter of the
      // exporter config.
    })
  )
);

console.log("tracing initialized");
```

Now if you run your application with the `tracing.js` file loaded, and you send requests to your application over HTTP (in the sample application just browse to http://localhost:8080), you will see traces exported to your tracing backend that look like this:

```sh
$ node -r ./tracing.js app.js
```

<p align="center"><img src="./images/zipkin-trace.png?raw=true"/></p>

**Note:** Some spans appear to be duplicated, but they are not. This is because the sample application is both the client and the server for these requests. You see one span that is the client side request timing, and one span that is the server side request timing. Anywhere they don’t overlap is network time.

## Collect Metrics Using OpenTelemetry

([link to TypeScript version](ts-example/README.md#collect-metrics-using-opentelemetry))

This guide assumes you are going to be using Prometheus as your metrics backend. It is currently the only metrics backend supported by OpenTelemetry JS.

**Note**: This section is a work in progress

### Set up a Metrics Backend

([link to TypeScript version](ts-example/README.md#set-up-a-metrics-backend))

Now that we have end-to-end traces, we will collect and export some basic metrics.

Currently, the only supported metrics backend is [Prometheus](https://prometheus.io). Head to the [Prometheus download page](https://prometheus.io/download/) and download the latest release of Prometheus for your operating system.

Open a command line and `cd` into the directory where you downloaded the Prometheus tarball. Untar it and change into the newly created directory.

```sh
$ cd Downloads

$ # Replace the file name below with your downloaded tarball
$ tar xvfz prometheus-2.14.0.darwin-amd64.tar

$ # Replace the dir below with your created directory
$ cd prometheus-2.14.0.darwin-amd64

$ ls
LICENSE           console_libraries data              prometheus.yml    tsdb
NOTICE            consoles          prometheus        promtool
```

The created directory should have a file named `prometheus.yml`. This is the file used to configure Prometheus. For now, just make sure Prometheus starts by running the `./prometheus` binary in the folder and browse to <http://localhost:9090>.

```sh
$ ./prometheus
# some output elided for brevity
msg="Starting Prometheus" version="(version=2.14.0, branch=HEAD, revision=edeb7a44cbf745f1d8be4ea6f215e79e651bfe19)"
# some output elided for brevity
level=info ts=2019-11-21T20:39:40.262Z caller=web.go:496 component=web msg="Start listening for connections" address=0.0.0.0:9090
# some output elided for brevity
level=info ts=2019-11-21T20:39:40.383Z caller=main.go:626 msg="Server is ready to receive web requests."
```

<p align="center"><img src="./images/prometheus.png?raw=true"/></p>

Once we know prometheus starts, replace the contents of `prometheus.yml` with the following:

```yaml
# my global config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds.

scrape_configs:
  - job_name: 'opentelemetry'
    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.
    static_configs:
      - targets: ['localhost:9464']
```

### Monitor Your NodeJS Application

([link to TypeScript version](ts-example/README.md#monitor-your-nodejs-application))

An example application which can be used with this guide can be found at in the [example directory](example). You can see what it looks like with metric monitoring enabled in the [monitored-example directory](monitored-example).

1. Install the required OpenTelemetry metrics libraries
2. Initialize a meter and collect metrics
3. Initialize and register a metrics exporter

#### Install the required OpenTelemetry metrics libraries

([link to TypeScript version](ts-example/README.md#install-the-required-opentelemetry-metrics-libraries))

To create metrics on NodeJS, you will need `@opentelemetry/metrics`.

```sh
$ npm install \
  @opentelemetry/metrics
```

#### Initialize a meter and collect metrics

([link to TypeScript version](ts-example/README.md#initialize-a-meter-and-collect-metrics))

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
  monotonic: true,
  labelKeys: ["route"],
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

Now, when we make requests to our service our meter will count all requests.

**Note**: Creating a new `labelSet` and `binding` on every request is not ideal as creating the `labelSet` can often be an expensive operation. This is why instruments are created and stored in a `Map` according to the route key.

#### Initialize and register a metrics exporter

([link to TypeScript version](ts-example/README.md#initialize-and-register-a-metrics-exporter))

Counting metrics is only useful if we can export them somewhere that we can see them. For this, we're going to use prometheus. Creating and registering a metrics exporter is much like the tracing exporter above. First we will need to install the prometheus exporter.

```sh
$ npm install @opentelemetry/exporter-prometheus
```

Next, modify your `monitoring.js` file to look like this:

```javascript
"use strict";

const { MeterProvider } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const exporter = new PrometheusExporter(
  {
    startServer: true,
  },
  () => {
    console.log('prometheus scrape endpoint: http://localhost:9464/metrics');
  },
);

const meter = new MeterProvider({
  exporter,
  interval: 1000,
}).getMeter('your-meter-name');

const requestCount = meter.createCounter("requests", {
  monotonic: true,
  labelKeys: ["route"],
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

Ensure prometheus is running by running the `prometheus` binary from earlier and start your application.

```sh
$ npm start

> @opentelemetry/getting-started@1.0.0 start /App/opentelemetry-js/getting-started/monitored-example
> node app.js

prometheus scrape endpoint: http://localhost:9464/metrics
Listening for requests on http://localhost:8080
```

Now, each time you browse to <http://localhost:8080> you should see "Hello from the backend" in your browser and your metrics in prometheus should update. You can verify the current metrics by browsing to <http://localhost:9464/metrics>, which should look like this:

```
# HELP requests Count all incoming requests
# TYPE requests counter
requests{route="/"} 1
requests{route="/middle-tier"} 2
requests{route="/backend"} 4
```

You should also be able to see gathered metrics in your prometheus web UI.

<p align="center"><img src="./images/prometheus-graph.png?raw=true"/></p>
