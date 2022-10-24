# Metrics

This quick start is for end users of OpenTelemetry who wish to manually measure their applications. If you are a library author, please see the [Library Authors Guide](library-author.md). If you wish to automatically instrument your application, see the automatic instrumentation documentation for the SDK you wish to use.

For a high-level overview of OpenTelemetry metrics in general and definitions of some common terms, you can refer to the [OpenTelemetry Specification Overview][spec-overview]

_Metrics API Specification: <https://github.com/open-telemetry/opentelemetry-specification/blob/v1.14.0/specification/metrics/api.md>_

_Metrics API Reference: <https://open-telemetry.github.io/opentelemetry-js-api/classes/metricseapi.html>_

- [Acquiring a Meter](#acquiring-a-meter)
- [Create a metric instrument](#create-a-metric-instrument)
- [Describing a instrument measurement](#describing-a-instrument-measurement)
  - [Metric Attributes](#metric-attributes)
  - [Semantic Conventions](#semantic-conventions)
- [Configuring metric views](#configuring-metric-views)
  - [Configuring explicit bucket sizes for the Histogram instrument](#configuring-explicit-bucket-sizes-for-the-histogram-instrument)
  - [Dropping instrument from being exported](#dropping-instrument-from-being-exported)
  - [Customising the metric attributes of instrument](#customising-the-metric-attributes-of-instrument)
- [Exporting measurements](#exporting-measurements)
  - [Exporting measurements to Prometheus](#exporting-measurements-to-prometheus)
  - [Exporting measurements to Opentelemetry Protocol](#exporting-measurements-to-opentelemetry-protocol)

## Acquiring a Meter

In OpenTelemetry, Metrics measurement operations are performed using methods on a _meter_. You can get a meter by calling [`getMeter`](https://open-telemetry.github.io/opentelemetry-js-api/classes/metricsapi.html#getmetrics) on the global meter provider. `getMeter` takes the name and version of the application or library acquiring the meter, and provides a meter which can be used to create instruments.

```typescript
import { metrics } from '@opentelemetry/api-metrics';

const meter = metrics.getMeter("my-application", "0.1.0");
```

## Create a metric instrument

In OpenTelemetry, all _metrics_ are composed of [`Instruments`](https://open-telemetry.github.io/opentelemetry-js-api/interfaces/instrument.html). A instrument is responsible for reporting measurements,
there are four types of instruments that can be created:

- Counter, a synchronous instrument which supports non-negative increments
- Asynchronous Counter, a asynchronous instrument which supports non-negative increments
- Histogram,a synchronous instrument which supports arbitrary values that are statistically meaningful, such as histograms, summaries or percentile
- Asynchronous Gauge, asynchronous instrument which supports non-additive values, such as room temperature
- UpDownCounter, a synchronous instrument which supports increments and decrements, such as number of active requests
- Asynchronous UpDownCounter, a asynchronous instrument which supports increments and decrements

You can create a Counter instrument by calling [`Meter#createCounter`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api_metrics.Meter.html#createCounter). The only required argument to `createCounter` is the _instrument name_, which should describe the item that is being measurement.

```typescript
const counter = meter.createCounter("events.counter");

// increase the counter
counter.add(1);

```

Most of the time, instruments will be used to measure operations in your application. The following example shows what it might look like to manually measure duration a function.

```typescript
async function myTask() {
  const histogram = meter.createHistogram("taks.duration");
  const startTime = new Date().getTime()
  try {
    // Wait for five seconds bore continueing code execution
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

Using attributes, kind, and the related [semantic conventions](https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/metrics/semantic_conventions), we can more accurately describe the measurement in a way our metrics backend will more easily understand. The following example uses these mechanisms, which are described below, for recording a measurement
of a HTTP request.

Each metric instruments allows to associate a description, unit of measure, and the value type.
The description of a metric instrument can expose up in the metrics backend, the unit or value type
can be used to information about the record measurement itself.

```typescript
async function myTask() {
  const httpServerDuration = meter.createHistogram("http.server.duration", {
    description: 'A http server duration',
    unit: 'milliseconds',
    valueType: ValueType.INT
  });
  const startTime = new Date().getTime()
  try {
    // Wait for five seconds bore continueing code execution
    await setTimeout(5_000)
  } catch (err) {
  } finally {
    const endTime = new Date().getTime()
    const executionTime = endTime - startTime

    httpServerDuration.record(executionTime, {
      [SemanticAttributes.HTTP_METHOD]: 'POST',
      [SemanticAttributes.HTTP_STATUS_CODE]: '200',
      [SemanticAttributes.HTTP_SCHEME]: 'https',
    })
  }
}

await myTask()
```

In the above example we are recording a measurement of roughly 5000ms and associates
three metric attributes with this measurement. Metrics backends can show these metric
attributes. In Prometheus the metric attributes would become labels and can be used
as part of queries, and allow search queries, such as what's the 90% percentile of
all successful POST requests.

### Metric Attributes

While name and measurement are the minimum required to record a metric measurement,
most of the time they will not be enough information on their own to effectively observer
an application. To solve this, OpenTelemetry uses _Metric Attributes_. Metric attributes are object with
string keys and string values which add more context to the measurement.

For example, when you are measuring the number of inflight requests, you might want to be able to count
the number of POST, or GET requests. You can add the a metric attribute for `http.method` to allow more
flexibility when leveraging your metric measurement like in Grafana dashboards.

### Semantic Conventions

One problem with metrics names and attributes is recognizing, categorizing, and analyzing them in your metrics backend. Between different applications, libraries, and metrics backends there might be different names and expected values for various attributes. For example, your application may use `http.status` to describe the HTTP status code, but a library you use may use `http.status_code`. In order to solve this problem, OpenTelemetry uses a library of semantic conventions which describe the name and attributes which should be used for specific types of metrics.

The use of semantic conventions is always recommended where applicable, but they are merely conventions. For example, you may find that some name other than the name suggested by the semantic conventions more accurately describes your metric, you may decide not to include a metric attribute which is suggested by semantic conventions for privacy reasons, or you may wish to add a custom attribute which isn't covered by semantic conventions. All of these cases are fine, but please keep in mind that if you stray from the semantic conventions, the categorization of metrics in your metrics backend may be affected.

_See the current metrics semantic conventions in the OpenTelemetry Specification repository: <https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/metrics/semantic_conventions>_

[spec-overview]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/overview.md

## Configuring metric views

A [Metric View](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#view) provides the ability to customise the metrics that are exposed by the
Metrics SDK. Metric Views allows you to do:

- Customise which Metric Attributes are reported on metrics
- Customise which instruments get processed/ignored
- Change the aggregration of a metric
- Define explicit bucket sizes to Histogram instruments

The Metric view requires the instrument selection query, and the configuration
for the resulting metric. The first step is select to the metrics to whom the View
is relevant, the second step is to configure the customisations for the the selected
metrics.

A Metric View is a class that can be instantiated via:

````typescript
const view = new View({
  name: 'metric-view', // optionally, give the view a unique name
  // select instruments with a specific name
  instrumentName: 'http.server.duration',
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
instantiated. A proposal is submitted to ease the ability to define Metris Views:
<https://github.com/open-telemetry/oteps/issues/209>

### Configuring explicit bucket sizes for the Histogram instrument

The Histogram instruments has default set of bucket sizes defined which not might
not all suit your needs. The bucket sizes can be overriden by configuring a different
aggregration for the Histogram instrument. The `ExplicitBucketHistogramAggregation`
should be used to define the bucket sizes for the Histogram instrument.

Below an example is given how you can define explicit buckets for a histogram.

```typescript
// Define view for the histogram metric
const histogramView = new View({
  aggregation: new ExplicitBucketHistogramAggregation([0, 1, 5, 10, 15, 20, 25, 30]),
  instrumentName: 'http.server.duration',
  instrumentType: InstrumentType.HISTOGRAM,
});

// Note, the instrumentName is the same as the name that has been passed for
// the Meter#createHistogram function

// Create an instance of the metric provider
const meterProvider = new MeterProvider({
  views: [
    histogramView
  ]
});

// Create histogram metric
const httpServerDuration = meter.createHistogram("http.server.duration", {
  description: 'A http server duration',
  unit: 'milliseconds',
  valueType: ValueType.INT
});

// Record measurement for histogram
httpServerDuration.record(50, {
  [SemanticAttributes.HTTP_METHOD]: 'POST',
  [SemanticAttributes.HTTP_STATUS_CODE]: '200',
  [SemanticAttributes.HTTP_SCHEME]: 'https',
});
```

### Dropping instrument from being exported

In some circumstances you don't want specific metrics to be exported by Opentelemetry,
for example, you might be using custom instrumentation or third-party packages that
define their own metrics you are not interested in.

In such cases you can define a customer view which drop the instruments you are
not interesting in, for example, you can drop instruments of a specific meter or
instruments with a specific name:

The following view drops all instruments that are associated with a meter with
the name `pubsub`:

```typescript
const dropView = new View({
  aggregation: new DropAggregation(),
  meterName: 'pubsub',
});
```

Alternatively, you can also drop instruments with a specific instrument name,
for example, all instruments of which the name starts with `http`:

```typescript
const dropView = new View({
  aggregation: new DropAggregation(),
  instrumentName: 'htpp*',
});
```

### Customising the metric attributes of instrument

If you want to limit the Metric Attributes that get exported in measurements of
an instrument, you can create a Metric View which defines which attributes should
be exported. Attributes that are missing in the list will not be exported.

In the example below will drop all attributes except attribute `environment` for
all instruments.

```typescript
new View({
  // only export the attribute 'environment'
  attributeKeys: ['environment'],
  // apply the view to all instruments
  instrumentName: '*',
})
```

## Exporting measurements

After you have instrumented your application with metrics, you also need to make
sure that the metrics get collected by your metrics backend. The most common formats
that are used are Prometheus and OLTP.

The latter is the [Opentelemetry protocol format](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md)
which is supported by the Opentelemetry Collector. The former is based on the [OpenMetrics
format](https://github.com/OpenObservability/OpenMetrics/blob/main/specification/OpenMetrics.md) can be consumed by Prometheus and Thanos or other OpenMetrics compatible
backends.

_Note_: Both Opentelemetry Javascript and Opentelemetry Collector support
exporters for different formats, such as [Cloud Monitoring](https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/tree/master/packages/opentelemetry-cloud-monitoring-exporter).

## Exporting measurements to Prometheus

If you want to export your metrics to Prometheus you need to initialise Opentelemetry
to use the Prometheus exporter `PrometheusExporter` which is included in the
`@opentelemetry/exporter-prometheus`-package.

```typescript
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider }  = require('@opentelemetry/sdk-metrics');

// Add your port and startServer to the Prometheus options
const options = { port: 9464, startServer: true };
const exporter = new PrometheusExporter(options);

// Creates MeterProvider and installs the exporter as a MetricReader
const meterProvider = new MeterProvider();
meterProvider.addMetricReader(exporter);
const meter = meterProvider.getMeter('example-prometheus');

// Now, start recording data
const counter = meter.createCounter('metric_name', {
  description: 'Example of a counter'
});
counter.add(10, { pid: process.pid });
```

In the above example the instantiated `PrometheusExporter` is configured to expose
a new http server on port 9464. You can now access the metrics at the endpoint
<http://localhost:9464/metrics>.  This is the url that can be scraped by Prometheus so it can consumed the metrics collected by Opentelemetry in your application.

More information about Prometheus and how to configure can be found at:
[https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config](Prometheus Scraping Config)

For a fully functioning code example for using this exporter, please have a look
at: <https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/examples/prometheus>

## Exporting measurements to Opentelemetry Protocol

Opentelemetry Javascript comes with three different kind of exporters that export
the collected metrics in the Opentelemetry Protocol (OTLP). The three exports
different in the transport method to send the metrics to a backend that supports
the OTLP protocol, (a) [https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-exporter-metrics-otlp-http](over HTTP) (b) [https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-grpc](over GRPC) (c) [https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-proto](over Protofbuf).

In the example below shows how you can configure Opentelemetry Javascript to use
the OTLP exporter over HTTP.

```typescript
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-http');
const collectorOptions = {
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
  concurrencyLimit: 1, // an optional limit on pending requests
};
const exporter = new OTLPMetricExporter(collectorOptions);
const meterProvider = new MeterProvider({});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 1000,
}));

// Now, start recording data
const meter = meterProvider.getMeter('example-meter');
const counter = meter.createCounter('metric_name');
counter.add(10, { 'key': 'value' });
```

For a fully functioning code example for using this exporter, please have a look
at: <https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/otlp-exporter-node>
