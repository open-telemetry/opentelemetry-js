# Exporter Developer Guide

An exporter sends traces and metrics to any backend that is capable of consuming them. With OpenTelemetry, you can easily add and remove any exporter without requiring changes to your application code.

We provide support for several open source backends and vendors out-of-the-box like Zipkin, Jaeger, and Prometheus, but OpenTelemetry exporters follow a public interface which can be implemented by anyone. This document describes the process for developers to create their own exporter if the provided ones do not meet their needs.

A typical package layout:

```text
opentelemetry-exporter-myexporter
   ├── src
   │   └── index.ts
   │   └── transform.ts
   │   └── types.ts
   │   └── my-trace-exporter.ts
   │   └── my-metric-exporter.ts
   └── test
       └── transform.test.ts
       └── my-trace-exporter.test.ts
       └── my-metric-exporter.test.ts
```

## Traces

The `SpanExporter` interface defines which methods the protocol-specific trace/span exporters must implement so that they can be plugged into OpenTelemetry SDK. Span exporters must follow these rules:

1. Implement the `SpanExporter` interface.
2. Expect to only receive spans which have been sampled.
3. Expect to only receive spans which are ended.
4. Do not throw exceptions.
5. Do not modify received spans.
6. Do not implement queuing or batching logic because this is handled by Span Processors.

The current `SpanExporter` interface contains 2 methods:

- `export`: Exports a batch of spans. In this method, you’ll process and translate `ReadableSpan` Data into the data that your trace backend accepts, and send them to your tracing backend.

- `shutdown`: Shuts down the exporter. This is an opportunity for exporter to do any cleanup required. `Shutdown` should be called only once for each Exporter instance. After the call to `Shutdown` subsequent calls to Export are not allowed and should return `FailedNotRetryable` error.

Please refer to the [Zipkin Exporter][zipkin-exporter] or [Jaeger Exporter][jaeger-exporter] for more comprehensive examples.

## Metrics

Metrics can be exported with two distinct patterns:

- Push model exporting, like periodically push metrics to the backend.
- Pull model exporting, like Prometheus pulling metrics from the application.

### Push model exporting

The `PushMetricExporter` defines the interface that protocol-specific exporters must implement so that they can be plugged into OpenTelemetry SDK and support sending of metrics data with `PeriodicMetricReader`.

The current `PushMetricExporter` interface defines 3 required methods:

- `export`: Exports a batch of telemetry data. In this method you’ll process and translate `ResourceMetrics` into the data that your metric backend accepts.

- `shutdown`: Shuts down the exporter. This is an opportunity for exporter to do any cleanup required. `Shutdown` should be called only once for each Exporter instance.

- `forceFlush`: Ensure that the export of any metrics the exporter has received is completed before the returned promise is settled.

The `PushMetricExporter` interface can also implement following methods to provide a preference on metric configuration:

- `selectAggregationTemporality`: Select the preferred `AggregationTemporality` for the given `InstrumentType` for this exporter.

- `selectAggregation`: Select the preferred `Aggregation` for the given `InstrumentType` for this exporter.

Please refer to the [OTLP Exporter][otlp-exporter] for more comprehensive examples.

### Pull model exporting

The pulling model exporting requires the export pipeline proactively initiate metric collections. Such exporting pipeline must be modeled as a `MetricReader`.

The abstract class `MetricReader` defines the interface that protocol-specific readers must implement so that they can be plugged into OpenTelemetry SDK and support pulling of metrics data.

The current `MetricReader` interface defines 2 required methods:

- `onShutdown`: Shuts down the reader. This is an opportunity for reader to do any cleanup required. `Shutdown` should be called only once for each reader instance.

- `onForceFlush`: Ensure that the export of any metrics the reader has received is completed before the returned promise is settled.

A `MetricReader` can initiate a metric collection request with `MetricReader.collect()` method. The `MetricReader.collect()` returns a promise that settles with a `CollectionResult`, containing the `ResourceMetrics` record and a series of reasons for possibly failed asynchronous metric instrument collection. The `ResourceMetrics` record can be processed and translated into the data that your metric backend accepts.

Please refer to the [Prometheus Exporter][prometheus-exporter] for more comprehensive examples.

[zipkin-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-exporter-zipkin
[jaeger-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-exporter-jaeger
[otlp-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-exporter-metrics-otlp-grpc
[prometheus-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-exporter-prometheus
