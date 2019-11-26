# Exporter Developer Guide

An exporter sends traces and metrics to any backend that is capable of consuming them. The exporter itself can change without requiring a change in your client code.

OpenTelemetry exporters can be contributed by anyone, and we provide support for several open source backends and vendors out-of-the-box, example Zipkin, Jaeger, Prometheus. This document will provide a means for developers to create their own. We strongly recommended to create a dedicated package for newly added exporter, example: `@opentelemetry/exporter-myexporter`.

## Tracing

`SpanExporter` defines the interface that protocol-specific exporters must implement so that they can be plugged into OpenTelemetry SDK and support sending of spans data. Exporters should expect to receive only sampled-in ended spans. Exporters must not throw. Exporters should not modify spans they receive.

Each exporter must implement `SpanExporter`, which contain `export` and `shutdown` methods:

- `export`: Exports a batch of telemetry data. In this method you’ll process and translate `ReadableSpan` Data into the data that your trace backend accepts.

- `shutdown`: Shuts down the exporter. This is an opportunity for exporter to do any cleanup required. `Shutdown` should be called only once for each Exporter instance. After the call to `Shutdown` subsequent calls to Export are not allowed and should return `FailedNotRetryable` error.

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

The queuing or batching functionalities are not needed to implemented by the exporter, it is being taken care by the `BatchSpanProcessor`.

Please refer to the [Zipkin Exporter][zipkin-exporter] or [Jaeger Exporter][jaeger-exporter] for more comprehensive examples.

## Metrics

`MetricExporter` defines the interface that protocol-specific exporters must implement so that they can be plugged into OpenTelemetry SDK and support sending of metrics data.

Each exporter must implement `MetricExporter`, which contain `export` and `shutdown` methods:

- `export`: Exports a batch of telemetry data. In this method you’ll process and translate `ReadableMetric` Data into the data that your trace backend accepts.

- `shutdown`: Shuts down the exporter. This is an opportunity for exporter to do any cleanup required. `Shutdown` should be called only once for each Exporter instance. After the call to `Shutdown` subsequent calls to Export are not allowed and should return `FailedNotRetryable` error.

Please refer to the [Prometheus Exporter][prometheus-exporter] for more comprehensive examples.

[zipkin-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-zipkin
[jaeger-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-jaeger
[prometheus-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-prometheus
