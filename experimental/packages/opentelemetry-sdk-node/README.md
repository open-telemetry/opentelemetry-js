# OpenTelemetry SDK for Node.js

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package provides the full OpenTelemetry SDK for Node.js including tracing and metrics.

## Quick Start

To get started you need to install `@opentelemetry/sdk-node`, a metrics and/or tracing exporter, and any appropriate instrumentation for the node modules used by your application.

### Installation

```sh
$ # Install the SDK
$ npm install @opentelemetry/sdk-node

$ # Install exporters and plugins
$ npm install \
    @opentelemetry/exporter-jaeger \ # add tracing exporters as needed
    @opentelemetry/exporter-prometheus \ # add metrics exporters as needed
    @opentelemetry/instrumentation-http # add instrumentations as needed

$ # or install all officially supported core and contrib plugins
$ npm install @opentelemetry/auto-instrumentations-node

```

> Note: this example is for Node.js. See [examples/opentelemetry-web](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentelemetry-web) for a browser example.

### Initialize the SDK

Before any other module in your application is loaded, you must initialize the SDK.
If you fail to initialize the SDK or initialize it too late, no-op implementations will be provided to any library which acquires a tracer or meter from the API.

This example uses Jaeger and Prometheus, but exporters exist for [other tracing backends][other-tracing-backends].

```javascript
const opentelemetry = require("@opentelemetry/sdk-node");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const jaegerExporter = new JaegerExporter();
const prometheusExporter = new PrometheusExporter({ startServer: true });

const sdk = new opentelemetry.NodeSDK({
  // Optional - if omitted, the tracing SDK will not be initialized
  traceExporter: jaegerExporter,
  // Optional - If omitted, the metrics SDK will not be initialized
  metricReader: prometheusExporter,
  // Optional - you can use the metapackage or load each instrumentation individually
  instrumentations: [getNodeAutoInstrumentations()],
  // See the Configuration section below for additional  configuration options
});

// You can optionally detect resources asynchronously from the environment.
// Detected resources are merged with the resources provided in the SDK configuration.
sdk.start().then(() => {
  // Resources have been detected and SDK is started
});

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

## Configuration

Below is a full list of configuration options which may be passed into the `NodeSDK` constructor;

### autoDetectResources

Detect resources automatically from the environment using the default resource detectors. Default `true`.

### contextManager

Use a custom context manager. Default: [AsyncHooksContextManager](../../../packages/opentelemetry-context-async-hooks/README.md)

### textMapPropagator

Use a custom propagator. Default: [CompositePropagator](../../../packages/opentelemetry-core/src/propagation/composite.ts) using [W3C Trace Context](../../../packages/opentelemetry-core/README.md#w3ctracecontextpropagator-propagator) and [Baggage](../../../packages/opentelemetry-core/README.md#baggage-propagator)

### metricReader

Add a [MetricReader](../opentelemetry-sdk-metrics/src/export/MetricReader.ts)
that will be passed to the `MeterProvider`. If `metricReader` is not configured,
the metrics SDK will not be initialized and registered.

### views

A list of views to be passed to the `MeterProvider`.
Accepts an array of [View](../opentelemetry-sdk-metrics/src/view/View.ts)-instances.
This parameter can be used to configure explicit bucket sizes of histogram metrics.

### instrumentations

Configure instrumentations. By default none of the instrumentation is enabled,
if you want to enable them you can use either [metapackage](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node)
or configure each instrumentation individually.

### resource

Configure a resource. Resources may also be detected by using the `autoDetectResources` method of the SDK.

### resourceDetectors

Configure resource detectors. By default, the resource detectors are [envDetector, processDetector].
NOTE: In order to enable the detection, the parameter `autoDetectResources` has to be `true`.

### sampler

Configure a custom sampler. By default, all traces will be sampled.

### spanProcessor

### traceExporter

Configure a trace exporter. If an exporter is configured, it will be used with a [BatchSpanProcessor](../../../packages/opentelemetry-sdk-trace-base/src/platform/node/export/BatchSpanProcessor.ts). If an exporter OR span processor is not configured programatically, this package will auto setup the default `otlp` exporter  with `http/protobuf` protocol with a `BatchSpanProcessor`.

### spanLimits

Configure tracing parameters. These are the same trace parameters used to [configure a tracer](../../../packages/opentelemetry-sdk-trace-base/src/types.ts#L71).

### serviceName

Configure the [service name](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service).

## Disable the SDK from the environment

Disable the SDK by setting the `OTEL_SDK_DISABLED` environment variable to `true`.

## Configure log level from the environment

Set the log level by setting the `OTEL_LOG_LEVEL` environment variable to enums:

- `NONE`,
- `ERROR`,
- `WARN`,
- `INFO`,
- `DEBUG`,
- `VERBOSE`,
- `ALL`.

The default level is `INFO`.

## Configure Trace Exporter from environment

This is an alternative to programmatically configuring an exporter or span processor. This package will auto setup the default `otlp` exporter with `http/protobuf` protocol if `traceExporter` or `spanProcessor` hasn't been passed into the `NodeSDK` constructor.

### Exporters

| Environment variable | Description |
|----------------------|-------------|
| OTEL_TRACES_EXPORTER | List of exporters to be used for tracing, separated by commas. Options include `otlp`, `jaeger`, `zipkin`, and `none`. Default is `otlp`. `none` means no autoconfigured exporter.

### OTLP Exporter

| Environment variable | Description |
|----------------------|-------------|
| OTEL_EXPORTER_OTLP_PROTOCOL | The transport protocol to use on OTLP trace, metric, and log requests. Options include `grpc`, `http/protobuf`, and `http/json`. Default is `http/protobuf`. |
| OTEL_EXPORTER_OTLP_TRACES_PROTOCOL | The transport protocol to use on OTLP trace requests. Options include `grpc`, `http/protobuf`, and `http/json`. Default is `http/protobuf`. |
| OTEL_EXPORTER_OTLP_METRICS_PROTOCOL | The transport protocol to use on OTLP metric requests. Options include `grpc`, `http/protobuf`, and `http/json`. Default is `http/protobuf`. |

Additionally, you can specify other applicable environment variables that apply to each exporter such as the following:

- [OTLP exporter environment configuration](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options)
- [Zipkin exporter environment configuration](https://github.com/open-telemetry/opentelemetry-specification/blob/6ce62202e5407518e19c56c445c13682ef51a51d/specification/sdk-environment-variables.md#zipkin-exporter)
- [Jaeger exporter environment configuration](https://github.com/open-telemetry/opentelemetry-specification/blob/6ce62202e5407518e19c56c445c13682ef51a51d/specification/sdk-environment-variables.md#jaeger-exporter)

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sdk-node
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsdk-node.svg
[other-tracing-backends]: https://github.com/open-telemetry/opentelemetry-js#trace-exporters
