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

### Configuring metric views

TODO

### Histogram instrument

The Histogram metric instruments requires you to define a collection of buckets were
each of the recording measurements fall in. The buckets can not be defined when the
histogram metric gets created but need to configured via the Views which were discussed
in the previous section.

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

## Exporting measurements to Prometheus

TODO

## Exporting measurements to Opentelemetry Protocol

TODO
