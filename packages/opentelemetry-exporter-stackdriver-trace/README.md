# OpenTelemetry Stackdriver Trace Exporter
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

OpenTelemetry Stackdriver Trace Exporter allows the user to send collected traces to Stackdriver.

[Stackdriver Trace](https://cloud.google.com/trace) is a distributed tracing system. It helps gather timing data needed to troubleshoot latency problems in microservice architectures. It manages both the collection and lookup of this data.

## Setup

Stackdriver Trace is a managed service provided by Google Cloud Platform.

### Installation

Install the npm package `@opentelemetry/exporter-stackdriver-trace`

```shell
$ npm install @opentelemetry/exporter-stackdriver-trace
```

## Usage

Install the exporter on your application, register the exporter, and start tracing. If you are running in a GCP environment, the exporter will automatically authenticate using the environment's service account. If not, you will need to follow the instructions in [Authentication](#Authentication).

```js
const { StackdriverTraceExporter } = require('@opentelemetry/exporter-stackdriver-trace');

const exporter = new StackdriverTraceExporter({
  // If you are not in a GCP environment, you will need to provide your
  // service account key here. See the Authentication section below.
});

tracer.addSpanProcessor(new BatchSpanProcessor(exporter));
```

You can use the built-in `SimpleSpanProcessor` or `BatchSpanProcessor`, or write your own.

- [SimpleSpanProcessor](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/sdk-tracing.md#simple-processor): The implementation of `SpanProcessor` that passes ended span directly to the configured `SpanExporter`.
- [BatchSpanProcessor](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/sdk-tracing.md#batching-processor): The implementation of the `SpanProcessor` that batches ended spans and pushes them to the configured `SpanExporter`. It is recommended to use this `SpanProcessor` for better performance and optimization.

## Viewing your traces

Visit the google cloud trace UI at https://console.cloud.google.com/traces/list?project=your-gcp-project-id


## Authentication

The Stackdriver Trace exporter supports authentication using service accounts. These can either be defined in a keyfile (usually called `service_account_key.json` or similar), or by the environment. If your application runs in a GCP environment, such as Compute Engine, you don't need to provide any application credentials. The client library will find the credentials by itself. For more information, go to <https://cloud.google.com/docs/authentication/>.

### Service account key

If you are not running in a GCP environment, you will need to give the service account credentials to the exporter.

```js
const { StackdriverTraceExporter } = require('@opentelemetry/exporter-stackdriver-trace');

const exporter = new StackdriverTraceExporter({
  /** option 1. provide a service account key json */
  keyFile: './service_account_key.json',
  keyFileName: './service_account_key.json',

  /** option 2. provide credentials directly */
  credentials: {
    client_email: string,
    private_key: string,
  },
});
```

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- Learn more about Stackdriver Trace at https://cloud.google.com/trace
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-exporter-stackdriver-trace
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-stackdriver-trace
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-exporter-stackdriver-trace
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-stackdriver-trace&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-stackdriver-trace
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-stackdriver-trace.svg
