# OpenTelemetry Collector Exporter for node with grpc

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This module provides exporter for web and node to be used with [opentelemetry-collector][opentelemetry-collector-url] - last tested with version **0.25.0**.

## Installation

```bash
npm install --save @opentelemetry/exporter-trace-otlp-grpc
```

## Service Name

The OpenTelemetry Collector Exporter does not have a service name configuration.
In order to set the service name, use the `service.name` resource attribute as prescribed in the [OpenTelemetry Resource Semantic Conventions][semconv-resource-service-name].
To see documentation and sample code for the metric exporter, see the [exporter-metrics-otlp-grpc package][metrics-exporter-url]

## Traces in Node - GRPC

The OTLPTraceExporter in Node expects the URL to only be the hostname. It will not work with `/v1/traces`.

```js
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-grpc');

const collectorOptions = {
  // url is optional and can be omitted - default is localhost:4317
  url: '<collector-hostname>:<port>',
};

const provider = new BasicTracerProvider();
const exporter = new OTLPTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => provider.shutdown().catch(console.error));
});
```

By default, plaintext connection is used. In order to use TLS in Node.js, provide `credentials` option like so:

```js
const fs = require('fs');
const grpc = require('@grpc/grpc-js');

const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-grpc');

const collectorOptions = {
  // url is optional and can be omitted - default is localhost:4317
  url: '<collector-hostname>:<port>',
  credentials: grpc.credentials.createSsl(),
};

const provider = new BasicTracerProvider();
const exporter = new OTLPTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => provider.shutdown().catch(console.error));
});
```

To use mutual authentication, pass to the `createSsl()` constructor:

```js
  credentials: grpc.credentials.createSsl(
    fs.readFileSync('./ca.crt'),
    fs.readFileSync('./client.key'),
    fs.readFileSync('./client.crt')
  ),
```

To generate credentials for mutual authentication, you can refer to the script used to generate certificates for tests [here](./test/certs/regenerate.sh)

The exporter can be configured to send custom metadata with each request as in the example below:

```js
const grpc = require('@grpc/grpc-js');

const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-grpc');

const metadata = new grpc.Metadata();
// For instance, an API key or access token might go here.
metadata.set('k', 'v');

const collectorOptions = {
  // url is optional and can be omitted - default is localhost:4317
  url: '<collector-hostname>:<port>',
  metadata, // // an optional grpc.Metadata object to be sent with each request
};

const provider = new BasicTracerProvider();
const exporter = new OTLPTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => provider.shutdown().catch(console.error));
});
```

Note, that this will only work if TLS is also configured on the server.

## Exporter Timeout Configuration

The OTLPTraceExporter has a timeout configuration option which is the maximum time, in milliseconds, the OTLP exporter will wait for each batch export. The default value is 10000ms.

To override the default timeout duration, use the following options:

+ Set with environment variables:

  | Environment variable | Description |
  |----------------------|-------------|
  | OTEL_EXPORTER_OTLP_TRACES_TIMEOUT | The maximum waiting time, in milliseconds, allowed to send each OTLP trace batch. Default is 10000. |
  | OTEL_EXPORTER_OTLP_TIMEOUT | The maximum waiting time, in milliseconds, allowed to send each OTLP trace and metric batch. Default is 10000. |

  > `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT` takes precedence and overrides `OTEL_EXPORTER_OTLP_TIMEOUT`.

+ Provide `timeoutMillis` to OTLPTraceExporter with `collectorOptions`:
  ```js
  const collectorOptions = {
    timeoutMillis: 15000
  };
  ```
  > Providing `timeoutMillis` with `collectorOptions` takes precedence and overrides timeout set with environment variables.

## Running opentelemetry-collector locally to see the traces

1. Go to examples/otlp-exporter-node
2. run `npm run docker:start`
3. Open page at `http://localhost:9411/zipkin/` to observe the traces

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-trace-otlp-grpc.svg
[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-collector
[semconv-resource-service-name]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service
[metrics-exporter-url]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-exporter-metrics-otlp-grpc
