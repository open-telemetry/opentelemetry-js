# (Deprecated) OpenTelemetry Jaeger Trace Exporter for Node.js

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**NOTE: Support for `@opentelemetry/exporter-jaeger` will end March 2024, please use any of the following packages instead:**

- `@opentelemetry/exporter-trace-otlp-proto`
- `@opentelemetry/exporter-trace-otlp-grpc`
- `@opentelemetry/exporter-trace-otlp-http`

OpenTelemetry Jaeger Trace Exporter allows the user to send collected traces to Jaeger.

[Jaeger](https://jaeger.readthedocs.io/en/latest/), inspired by [Dapper](https://research.google.com/pubs/pub36356.html) and [OpenZipkin](http://zipkin.io/), is a distributed tracing system released as open source by [Uber Technologies](http://uber.github.io/). It is used for monitoring and troubleshooting microservices-based distributed systems, including:

- Distributed context propagation
- Distributed transaction monitoring
- Root cause analysis
- Service dependency analysis
- Performance / latency optimization

## Prerequisites

This project relies on [jaeger-client](https://github.com/jaegertracing/jaeger-client-node) library and is thus only supported for **Node.js**.

Get up and running with Jaeger in your local environment.

[Jaeger](https://www.jaegertracing.io/docs/latest/) stores and queries traces exported by
applications instrumented with OpenTelemetry. The easiest way to [start a Jaeger
server](https://www.jaegertracing.io/docs/latest/getting-started/) is to paste the below:

```bash
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

Or run the `jaeger-all-in-one(.exe)` executable from the [binary distribution archives](https://www.jaegertracing.io/download/):

```bash
jaeger-all-in-one --collector.zipkin.http-port=9411
```

You can then navigate to <http://localhost:16686> to access the Jaeger UI.

## Installation

```bash
npm install --save @opentelemetry/exporter-jaeger
```

## Usage

Install the exporter on your application and pass the options, it must contain a service name.

Furthermore, the `host` option (which defaults to `localhost`), can instead be set by the
`OTEL_EXPORTER_JAEGER_AGENT_HOST` environment variable to reduce in-code config. If both are
set, the value set by the option in code is authoritative.

```js
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const options = {
  tags: [], // optional
  // You can use the default UDPSender
  host: 'localhost', // optional
  port: 6832, // optional
  // OR you can use the HTTPSender as follows
  // endpoint: 'http://localhost:14268/api/traces',
  maxPacketSize: 65000 // optional
}
const exporter = new JaegerExporter(options);
```

Now, register the exporter.

```js
tracer.addSpanProcessor(new BatchSpanProcessor(exporter));
```

You can use built-in `SimpleSpanProcessor` or `BatchSpanProcessor` or write your own.

- [SimpleSpanProcessor](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/sdk.md#simple-processor): The implementation of `SpanProcessor` that passes ended span directly to the configured `SpanExporter`.
- [BatchSpanProcessor](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/sdk.md#batching-processor): The implementation of the `SpanProcessor` that batches ended spans and pushes them to the configured `SpanExporter`. It is recommended to use this `SpanProcessor` for better performance and optimization.

## Useful links

- To know more about Jaeger, visit: <https://www.jaegertracing.io/docs/latest/getting-started/>
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-jaeger
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-jaeger.svg
