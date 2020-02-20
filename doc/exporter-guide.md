# Exporter Developer Guide

An exporter sends traces and metrics to any backend that is capable of consuming them. With OpenTelemetry, you can easily add and remove any exporter without requiring changes to your application code.

We provide support for several open source backends and vendors out-of-the-box like Zipkin, Jaeger, and Prometheus, but OpenTelemetry exporters follow a public interface which can be implemented by anyone. This document describes the process for developers to create their own exporter if the provided ones do not meet their needs.

A typical package layout:

```
opentelemetry-exporter-myexporter
   ├── src
   │   └── index.ts
   │   └── transform.ts
   │   └── types.ts
   │   └── myexporter.ts
   └── test
       └── transform.test.ts
       └── myexporter.test.ts
```

## Tracing

The `SpanExporter` interface defines which methods the protocol-specific trace/span exporters must implement so that they can be plugged into OpenTelemetry SDK. Span exporters must follow these rules:

1. Implement the `SpanExporter` interface.
2. Expect to only receive spans which have been sampled.
3. Expect to only receive spans which are ended.
4. Do not throw exceptions.
5. Do not modify received spans.
6. Do not implement queuing or batching logic because this is handled by Span Processors.

The current `SpanExporter` interface (`0.2.0`) contains 2 methods:

- `export`: Exports a batch of spans. In this method, you’ll process and translate `ReadableSpan` Data into the data that your trace backend accepts, and send them to your tracing backend.

- `shutdown`: Shuts down the exporter. This is an opportunity for exporter to do any cleanup required. `Shutdown` should be called only once for each Exporter instance. After the call to `Shutdown` subsequent calls to Export are not allowed and should return `FailedNotRetryable` error.

Please refer to the [Zipkin Exporter][zipkin-exporter] or [Jaeger Exporter][jaeger-exporter] for more comprehensive examples.

## Metrics

The `MetricExporter` defines the interface that protocol-specific exporters must implement so that they can be plugged into OpenTelemetry SDK and support sending of metrics data.

The current `MetricExporter` interface (`0.2.0`) defines 2 methods:

- `export`: Exports a batch of telemetry data. In this method you’ll process and translate `MetricRecord` Data into the data that your metric backend accepts.

- `shutdown`: Shuts down the exporter. This is an opportunity for exporter to do any cleanup required. `Shutdown` should be called only once for each Exporter instance. After the call to `Shutdown` subsequent calls to Export are not allowed and should return `FailedNotRetryable` error.

Please refer to the [Prometheus Exporter][prometheus-exporter] for more comprehensive examples.

[zipkin-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-zipkin
[jaeger-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-jaeger
[prometheus-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-prometheus
