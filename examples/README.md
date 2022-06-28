# OpenTelemetry JavaScript Examples

This directory contains a number of examples of how to run real applications
with OpenTelemetry JavaScript.

## Maintained Examples

Maintained Examples are expected to be updated with every OpenTelemetry JavaScript release, to
use the latest and greatest features, and best practices.

|Name | Description | Complexity Level |
------------- | ------------- | ------------ |
|[basic-tracer-node](basic-tracer-node/) | Basic use of Tracing in Node.js application | Beginner |
|[tracer-web](tracer-web/) | Basic use of Tracing in Web application | Beginner |
|[http](http/)   | HTTP Instrumentation to automatically collect trace data and export them to the backend of choice | Intermediate |
|[https](https/) | HTTPS Instrumentation to automatically collect trace data and export them to the backend of choice | Intermediate |
|[grpc](grpc/)   | gRPC Instrumentation to automatically collect trace data and export them to the backend of choice | Intermediate |
|[otlp-exporter-node](otlp-exporter-node/) | This example shows how to use `@opentelemetry/exporter-otlp-http` to instrument a simple Node.js application | Intermediate |
|[opentracing-shim](opentracing-shim/) | This is a simple example that demonstrates how existing OpenTracing instrumentation can be integrated with OpenTelemetry | Intermediate |

Examples of experimental packages can be found at [experimental/examples](../experimental/examples).

Additional examples can be found at [@opentelemetry/opentelemetry-js-contrib][opentelemetry-js-contrib-examples].

## Contributing

Please see [CONTRIBUTING.md](https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md) for instructions on how to contribute.

## LICENSE

Apache License 2.0

[opentelemetry-js-contrib-examples]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/examples
