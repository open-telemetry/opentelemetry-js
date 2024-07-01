# OpenTelemetry SDK for Web

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package provides the full OpenTelemetry SDK for Web including tracing.

## Quick Start

To get started you need to install `@opentelemetry/sdk-web`, a tracing exporter, and any appropriate instrumentation for the web modules used by your application.

### Installation

```sh
# Install the SDK
npm install @opentelemetry/sdk-web

# Install exporters
npm install @opentelemetry/exporter-trace-otlp-http

# or install all officially supported core and contrib plugins
npm install @opentelemetry/auto-instrumentations-web

```

### Initialize the SDK

Before any other module in your application is loaded, you must initialize the SDK.
If you fail to initialize the SDK or initialize it too late, no-op implementations will be provided to any library which acquires a tracer or meter from the API.

This example uses the OTLP Http Json exporter, but the OTLP Proto exporter can be used as well.
As shown in the installation instructions, exporters passed to the SDK must be installed alongside `@opentelemetry/sdk-web`.

```javascript
const opentelemetry = require("@opentelemetry/sdk-web");
cont { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const {
  getWebAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-web");

const otlpTraceExporter = new OTLPTraceExporter();

const sdk = new opentelemetry.WebSDK({
  // Optional - if omitted, the tracing SDK will be initialized from environment variables
  traceExporter: otlpTraceExporter,
  // Optional - you can use the metapackage or load each instrumentation individually
  instrumentations: [getWebAutoInstrumentations()],
  // See the Configuration section below for additional  configuration options
});

sdk.start();
```

## Configuration

Below is a full list of configuration options which may be passed into the `WebSDK` constructor;

### contextManager

Use a custom context manager. Default: [ZoneContextManager](../../../packages/opentelemetry-context-zone/README.md)

### textMapPropagator

Use a custom propagator. Default: [CompositePropagator](../../../packages/opentelemetry-core/src/propagation/composite.ts) using [W3C Trace Context](../../../packages/opentelemetry-core/README.md#w3ctracecontextpropagator-propagator) and [Baggage](../../../packages/opentelemetry-core/README.md#baggage-propagator)

### instrumentations

Configure instrumentations. By default none of the instrumentation is enabled,
if you want to enable them you can use either [metapackage](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-web)
or configure each instrumentation individually.

### resource

Configure a resource.

### resourceDetectors

Configure resource detectors. By default, the resource detectors are [browserDetector].
NOTE: In order to enable the detection, the parameter `autoDetectResources` has to be `true`.

### sampler

Configure a custom sampler. By default, all traces will be sampled.

### spanProcessor

### traceExporter

Configure a trace exporter. If an exporter is configured, it will be used with a [BatchSpanProcessor](../../../packages/opentelemetry-sdk-trace-base/src/platform/node/export/BatchSpanProcessor.ts).

### spanLimits

Configure tracing parameters. These are the same trace parameters used to [configure a tracer](../../../packages/opentelemetry-sdk-trace-base/src/types.ts#L71).

### serviceName

Configure the [service name](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service).

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
