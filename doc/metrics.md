# Metrics

This quick start is for end users of OpenTelemetry who wish to manually measure their applications. If you wish to automatically instrument your application, see the automatic instrumentation documentation for the SDK you wish to use.

For a high-level overview of OpenTelemetry metrics in general and definitions of some common terms, you can refer to the [OpenTelemetry Specification Overview][spec-overview]

_Metrics API Specification: <https://github.com/open-telemetry/opentelemetry-specification/blob/v1.14.0/specification/metrics/api.md>_

_Metrics API Reference: <https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api._opentelemetry_api.MetricsAPI.html>_

- [Getting Started](#getting-started)
- [Acquiring a Meter](#acquiring-a-meter)
- [Create a metric instrument](#create-a-metric-instrument)
- [Describing a instrument measurement](#describing-a-instrument-measurement)
  - [Metric Attributes](#metric-attributes)
  - [Semantic Conventions](#semantic-conventions)
- [Configuring metric views](#configuring-metric-views)
  - [Configuring explicit bucket sizes for the Histogram instrument](#configuring-explicit-bucket-sizes-for-the-histogram-instrument)
  - [Dropping instrument from being exported](#dropping-instrument-from-being-exported)
  - [Customizing the metric attributes of instrument](#customizing-the-metric-attributes-of-instrument)
- [Exporting measurements](#exporting-measurements)
  - [Exporting measurements to Prometheus](#exporting-measurements-to-prometheus)
  - [Exporting measurements to OpenTelemetry Protocol](#exporting-measurements-to-opentelemetry-protocol)

## Getting Started

In this page, you'll learn how to setup OpenTelemetry JS to export metrics from an HTTP server with Fastify. If you're not using Fastify, that's fine -- this guide will also work with Express, etc.

### Installation

To begin, set up an environment in a new directory:

```bash
mkdir otel-getting-started
cd otel-getting-started
npm init -y
```

Now install Fastify and OpenTelemetry:

```bash
npm install fastify @opentelemetry/sdk-node @opentelemetry/exporter-prometheus @opentelemetry/auto-instrumentations-node
```

The `@opentelemetry/sdk-node` and `@opentelemetry/auto-instrumentations-node` will install all the
necessary packages to start with OpenTelemetry including instrumentation for a wide variety of popular
packages, such as `http`, `fetch` etc. The package `@opentelemetry/exporter-prometheus` is installed
to export our collected metrics to Prometheus.

### Create the sample HTTP Server

Create a file `app.js`:

```javaScript
const api = require('@opentelemetry/api')
const opentelemetry = require("@opentelemetry/sdk-node");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const prometheusExporter = new PrometheusExporter();

const sdk = new opentelemetry.NodeSDK({
  // Optional - If omitted, the metrics SDK will not be initialized
  metricReader: prometheusExporter,
  // Optional - you can use the metapackage or load each instrumentation individually
  instrumentations: [getNodeAutoInstrumentations()],
  // See the Configuration section below for additional  configuration options
});

// You can optionally detect resources asynchronously from the environment.
// Detected resources are merged with the resources provided in the SDK configuration.
sdk.start();
// Resources have been detected and SDK is started
console.log(`SDK started`)

// Start the http server
const fastify = require('fastify')({
    logger: true
})

fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' })
})

fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }

    console.log(`Server is now listening on ${address}`)
})

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
const process = require("process");
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(
      () => console.log("SDK shut down successfully"),
      (err) => console.log("Error shutting down SDK", err)
    )
    .finally(() => process.exit(0));
});
```

In the above example we are initializing the Node SDK to enable the Metrics SDK
and configure it to export the metrics in Prometheus format by registering the
`PrometheusExporter`.

You can now run the instrument application and it will run the HTTP server on
port 3000 with command:

```bash
node app.js
```

Now when accessing the HTTP server via <http://localhost:3000> you will
see the following:

```json
{"hello":"world"}
```

### Add manual instrumentation

Automatic instrumentation is powerful but it doesn't capture what's going  on in
your application. For that you'll need to write some manual instrumentation. Below
we will show you how you can count the number of times a HTTP endpoint has been
accessed.

#### Counting number of incoming http requests

First, modify `app.js` to include code that initializes a meter and uses it to
create a counter instrument which counts the number of times the `/` http endpoint
has been requested.

```javaScript
const api = require('@opentelemetry/api')
const opentelemetry = require("@opentelemetry/sdk-node");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const prometheusExporter = new PrometheusExporter();

const sdk = new opentelemetry.NodeSDK({
  // Optional - If omitted, the metrics SDK will not be initialized
  metricReader: prometheusExporter,
  // Optional - you can use the metapackage or load each instrumentation individually
  instrumentations: [getNodeAutoInstrumentations()],
  // See the Configuration section below for additional  configuration options
});

// You can optionally detect resources asynchronously from the environment.
// Detected resources are merged with the resources provided in the SDK configuration.
sdk.start();
// Resources have been detected and SDK is started
console.log(`SDK started`)

// Create Meter with the name `http-server`
const appMeter = api.metrics.getMeter('http-server')
// Use the created Meter to create a counter instrument
const numberOfRequests = appMeter.createCounter('request-counter')

// Start the http server
const fastify = require('fastify')({
    logger: true
})

fastify.get('/', function (request, reply) {
    // Increase the counter by 1 each time the `/` endpoint is requested
    numberOfRequests.add(1)
    reply.send({ hello: 'world' })
})

fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }

    console.log(`Server is now listening on ${address}`)
})

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
const process = require("process");
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(
      () => console.log("SDK shut down successfully"),
      (err) => console.log("Error shutting down SDK", err)
    )
    .finally(() => process.exit(0));
});
```

Now run the application again:

```bash
node app.js
```

When you navigate to <http://localhost:3000>, the counter instrument will be increased
each time the page is accessed. If you want to see the exporter instruments, you
can access via the dedicates metrics endpoint for Prometheus by accessing:
<http://localhost:9464/metrics> the contents will look similar to:

```text
# HELP request_counter_total description missing
# TYPE request_counter_total counter
request_counter_total 6 1666624810428
```

In the above example output you can that one instrument is available with the
name `request_counter_total`:

```text
request_counter_total 6 1666624810428
```

The postfixed `_total` get automatically to the instrument name for each counter instrument
when the measurements are getting exported in the Prometheus format. In the above
example you see that we accessed our `/` endpoint six times.

## Acquiring a Meter

In OpenTelemetry, Instruments that allow for measurement operations are acquired through a _meter_. You can get a meter by calling [`getMeter`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.MeterProvider.html#getmeter) on the global meter provider. `getMeter` takes the name and version of the application or library acquiring the meter, and provides a meter which can be used to create instruments.

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter("my-application", "0.1.0");
```

## Create a metric instrument

In OpenTelemetry, all _metrics_ are composed of [`Instruments`](https://open-telemetry.github.io/opentelemetry-js/enums/_opentelemetry_sdk-metrics.InstrumentType.html). An instrument is responsible for reporting measurements,
there are four types of instruments that can be created:

- Counter, a synchronous instrument which supports non-negative increments
- Asynchronous Counter, a asynchronous instrument which supports non-negative increments
- Histogram, a synchronous instrument which supports arbitrary values that are statistically meaningful, such as histograms, summaries or percentile
- Asynchronous Gauge, an asynchronous instrument which supports non-additive values, such as room temperature
- UpDownCounter, a synchronous instrument which supports increments and decrements, such as number of active requests
- Asynchronous UpDownCounter, an asynchronous instrument which supports increments and decrements

You can create a Counter instrument by calling [`Meter#createCounter`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.Meter.html#createcounter). The only required argument to `createCounter` is the _instrument name_, which should describe the item that is being measurement.

```typescript
const counter = meter.createCounter("events.counter");

// increase the counter
counter.add(1);
```

Most of the time, instruments will be used to measure operations in your application. The following example shows what it might look like to manually measure a function's duration.

```typescript
async function myTask() {
  const histogram = meter.createHistogram("task.duration");
  const startTime = new Date().getTime()
  try {
    // Wait for five seconds before continuing code execution
    await setTimeout(5_000)
  } catch (err) {
  } finally {
    const endTime = new Date().getTime()
    const executionTime = endTime - startTime

    // Record the duration of the task operation
    histogram.record(executionTime)
  }
}

await myTask()
```

## Describing a instrument measurement

Using attributes, kind, and the related [semantic conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/general/metrics.md), we can more accurately describe the measurement in a way our metrics backend will more easily understand. The following example uses these mechanisms, which are described below, for recording a measurement
of a HTTP request.

Each metric instruments allows to associate a description, unit of measure, and the value type.
The description of a metric instrument can expose up in the metrics backend, the unit or value type
can be used to information about the record measurement itself.

```typescript
async function myTask() {
  const httpServerDuration = meter.createHistogram("my.http.server.request.duration", {
    description: 'HTTP server request duration',
    unit: 's',
    valueType: ValueType.DOUBLE
  });
  const startTime = new Date().getTime()
  try {
    // Wait for five seconds before continuing code execution
    await setTimeout(5_000)
  } catch (err) {
  } finally {
    const endTime = new Date().getTime()
    const executionTime = (endTime - startTime) / 1000

    httpServerDuration.record(executionTime, {
      [ATTR_HTTP_REQUEST_METHOD]: 'POST',
      [ATTR_HTTP_RESPONSE_STATUS_CODE]: '200',
      [ATTR_URL_SCHEME]: 'https',
    })
  }
}

await myTask()
```

In the above example we are recording a measurement of roughly 5000ms and associate
three metric attributes with this measurement. Metrics backends can show these metric
attributes. In Prometheus the metric attributes would become labels and can be used
as part of queries, and allow search queries, such as what's the 90% percentile of
all successful POST requests.

### Metric Attributes

While name and measurement are the minimum required to record a metric measurement,
most of the time they will not be enough information on their own to effectively observe
an application. To solve this, OpenTelemetry uses _Metric Attributes_. Metric attributes are object with
string keys and string values which add more context to the measurement.

For example, when you are measuring the number of inflight requests, you might want to be able to count
the number of POST, or GET requests. You can add the a metric attribute for `http.method` to allow more
flexibility when leveraging your metric measurement like in Grafana dashboards.

### Semantic Conventions

One problem with metrics names and attributes is recognizing, categorizing, and analyzing them in your metrics backend. Between different applications, libraries, and metrics backends there might be different names and expected values for various attributes. For example, your application may use `http.status` to describe the HTTP status code, but a library you use may use `http.status_code`. In order to solve this problem, OpenTelemetry uses a library of semantic conventions which describe the name and attributes which should be used for specific types of metrics.

The use of semantic conventions is always recommended where applicable, but they are merely conventions. For example, you may find that some name other than the name suggested by the semantic conventions more accurately describes your metric, you may decide not to include a metric attribute which is suggested by semantic conventions for privacy reasons, or you may wish to add a custom attribute which isn't covered by semantic conventions. All of these cases are fine, but please keep in mind that if you stray from the semantic conventions, the categorization of metrics in your metrics backend may be affected.

_See the current metrics semantic conventions in the OpenTelemetry Specification repository: <https://github.com/open-telemetry/semantic-conventions/blob/main/docs/general/metrics.md>_

[spec-overview]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/overview.md

## Configuring metric views

A [Metric View](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#view) provides the ability to customize the metrics that are exposed by the
Metrics SDK. Metric Views allows you to do:

- Customize which Metric Attributes are reported on metrics
- Customize which instruments get processed/ignored
- Change the aggregation of a metric
- Define explicit bucket sizes to Histogram instruments

The Metric view requires the instrument selection query, and the configuration
for the resulting metric. The first step is select to the metrics to whom the View
is relevant, the second step is to configure the customizations for the the selected
metrics.

A Metric View can be added to a `MeterProvider` like so

````typescript
new MeterProvider({
  views: [{
    name: 'metric-view', // optionally, give the view a unique name
    // select instruments with a specific name
    instrumentName: 'http.server.duration',
  }]
});
````

In the above example a View is created which select instruments with the name `http.server.duration` other options to select instruments are:

- By Instrument Type: use `instrumentType` to select instruments of the given type
- By Meter: use `meterName` to select meters with the given name
- By Meter Version: use `meterVersion` to select meters with the given version
- By Meter Schema URL: use `meterSchemaUrl` to select meters with given schema url

The `instrumentName` has support for wildcards, so you can select all instruments
using `*` or select all instruments starting with 'http.' by using `http.*`.

_Note_: The Views can only be defined when the `MeterProvider` instance gets
instantiated. A proposal is submitted to ease the ability to define Metrics Views:
<https://github.com/open-telemetry/oteps/issues/209>

### Configuring explicit bucket sizes for the Histogram instrument

The Histogram instrument has a predefined set of bucket sizes defined which might not
suit all your needs. The bucket sizes can be overridden by configuring a different
aggregation for the Histogram instrument. The `ExplicitBucketHistogramAggregation`
should be used to define the bucket sizes for the Histogram instrument.

Below an example is given how you can define explicit buckets for a histogram.

```typescript
// Create an instance of the metric provider
const meterProvider = new MeterProvider({
  views: [
    // Define view for the histogram metric
    {
      aggregation: {
        type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
        options: {
          boundaries: [0, 1, 5, 10, 15, 20, 25, 30],
        }
      },
      // Note, the instrumentName is the same as the name that has been passed for
      // the Meter#createHistogram function
      instrumentName: 'http.server.duration',
      instrumentType: InstrumentType.HISTOGRAM,
    }
  ]
});

// Create histogram metric
const httpServerDuration = meter.createHistogram('my.http.server.request.duration', {
  description: 'HTTP server request duration',
  unit: 's',
  valueType: ValueType.DOUBLE
});

// Record measurement for histogram
httpServerDuration.record(50, {
  [ATTR_HTTP_REQUEST_METHOD]: 'POST',
  [ATTR_HTTP_RESPONSE_STATUS_CODE]: '200',
  [ATTR_URL_SCHEME]: 'https',
});
```

### Dropping instrument from being exported

In some circumstances you don't want specific metrics to be exported by OpenTelemetry,
for example, you might be using custom instrumentations or third-party packages that
define their own metrics you are not interested in.

In such cases you can define a view which drops the instruments you are
not interested in. For example, you can drop instruments of a specific meter or
instruments with a specific name:

The following view drops all instruments that are associated with a meter named `pubsub`:

```typescript
{
  aggregation: { type: AggregationType.DROP },
  meterName: 'pubsub',
}
```

Alternatively, you can also drop instruments with a specific instrument name,
for example, all instruments of which the name starts with `http`:

```typescript
{
  aggregation: { type: AggregationType.DROP },
  instrumentName: 'http*',
}
```

### Customizing the metric attributes of instrument

If you want to limit the Metric Attributes that get exported in measurements of
an instrument, you can create a Metric View which defines which attributes should
be exported. Attributes that are missing in the list will not be exported.

In the example below will drop all attributes except attribute `environment` for
all instruments.

```typescript
{
  // only export the attribute 'environment'
  attributeKeys: ['environment'],
  // apply the view to all instruments
  instrumentName: '*',
}
```

## Exporting measurements

After you have instrumented your application with metrics, you also need to make
sure that the metrics get collected by your metrics backend. The most common formats
that are used are Prometheus and OTLP.

The latter is the [OpenTelemetry protocol format](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md)
which is supported by the OpenTelemetry Collector. The former is based on the [OpenMetrics
format](https://github.com/prometheus/OpenMetrics/blob/v1.0.0/specification/OpenMetrics.md) can be consumed by Prometheus and Thanos or other OpenMetrics compatible
backends.

_Note_: Both OpenTelemetry JavaScript and OpenTelemetry Collector support
exporters for different formats, such as [Cloud Monitoring](https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/tree/master/packages/opentelemetry-cloud-monitoring-exporter).

## Exporting measurements to Prometheus

If you want to export your metrics to Prometheus you need to initialize OpenTelemetry
to use the Prometheus exporter `PrometheusExporter` which is included in the
`@opentelemetry/exporter-prometheus`-package.

```typescript
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider }  = require('@opentelemetry/sdk-metrics');

// Add your port to the Prometheus options
const options = { port: 9464 };
const exporter = new PrometheusExporter(options);

// Creates MeterProvider and installs the exporter as a MetricReader
const meterProvider = new MeterProvider({
  readers: [exporter],
});
const meter = meterProvider.getMeter('example-prometheus');

// Now, start recording data
const counter = meter.createCounter('metric_name', {
  description: 'Example of a counter'
});
counter.add(10, { pid: process.pid });
```

In the above example the instantiated `PrometheusExporter` is configured to expose
a new http server on port 9464. You can now access the metrics at the endpoint
<http://localhost:9464/metrics>. This is the URL that can be scraped by Prometheus so it can consumed the metrics collected by OpenTelemetry in your application.

More information about Prometheus and how to configure can be found at:
[Prometheus Scraping Config](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)

For a fully functioning code example for using this exporter, please have a look
at: <https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/examples/prometheus>

## Exporting measurements to OpenTelemetry Protocol

OpenTelemetry JavaScript comes with three different kinds of exporters that export
the OTLP protocol, a) [over HTTP](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-exporter-metrics-otlp-http), b) [over GRPC](https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-grpc), c) [over Protobuf](https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-proto). (XXX Trent wuz here.)

The example below shows how you can configure OpenTelemetry JavaScript to use
the OTLP exporter using http/protobuf.

```typescript
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-proto');
const collectorOptions = {
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
  concurrencyLimit: 1, // an optional limit on pending requests
};
const exporter = new OTLPMetricExporter(collectorOptions);
const meterProvider = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exporter,
      exportIntervalMillis: 1000,
    }),
  ],
});

// Now, start recording data
const meter = meterProvider.getMeter('example-meter');
const counter = meter.createCounter('metric_name');
counter.add(10, { 'key': 'value' });
```

For a fully functioning code example for using this exporter, please have a look
at: <https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/otlp-exporter-node>
