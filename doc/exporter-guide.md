# Exporter Developer Guide

We strongly recommended to create a dedicated package for newly added exporter, example: `@opentelemetry/exporter-xxx`.

## Tracing

`SpanExporter` defines the interface that protocol-specific exporters must implement so that they can be plugged into OpenTelemetry SDK and support sending of spans data. Exporters should expect to receive only sampled-in ended spans. Exporters must not throw. Exporters should not modify spans they receive.

Each exporter should subclass `SpanExporter` and implement `export` and `shutdown` methods:

- `export`: Exports a batch of telemetry data. Protocol exporters that will implement this function are typically expected to serialize and transmit the data to the destination.

- `shutdown`: Shuts down the exporter. This is an opportunity for exporter to do any cleanup required. `Shutdown` should be called only once for each Exporter instance. After the call to `Shutdown` subsequent calls to Export are not allowed and should return `FailedNotRetryable` error.

A typical package layout:

```
opentelemetry-exporter-xxx
   ├── src
   │   └── index.ts
   │   └── transform.ts
   │   └── types.ts
   │   └── xxx.ts
   └── test
       └── transform.test.ts
       └── xxx.test.ts
```

The queuing or batching functionalities are not needed to implemented by the exporter, it is being taken care by the `BatchSpanProcessor`.

Please refer to the [Zipkin Exporter][zipkin-exporter] or [Jaeger Exporter][jaeger-exporter] for more comprehensive examples.

## Metrics

`MetricExporter` defines the interface that protocol-specific exporters must implement so that they can be plugged into OpenTelemetry SDK and support sending of metrics data.

Each exporter should subclass `MetricExporter` and implement `export` and `shutdown` methods:

- `export`: Exports a batch of telemetry data. Protocol exporters that will implement this function are typically expected to serialize and transmit the data to the destination.

- `shutdown`: Shuts down the exporter. This is an opportunity for exporter to do any cleanup required. `Shutdown` should be called only once for each Exporter instance. After the call to `Shutdown` subsequent calls to Export are not allowed and should return `FailedNotRetryable` error.

Please refer to the [Prometheus Exporter][prometheus-exporter] for more comprehensive examples.

[zipkin-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-zipkin/src/zipkin.ts
[jaeger-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-jaeger/src/jaeger.ts
[prometheus-exporter]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-exporter-prometheus/src/prometheus.ts
