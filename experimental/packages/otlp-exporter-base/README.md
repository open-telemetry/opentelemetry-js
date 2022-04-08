# OpenTelemetry Collector Exporter for web and node

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This module provides a base exporter for web and node to be used with [opentelemetry-collector][opentelemetry-collector-url].

## Installation

```bash
npm install --save @opentelemetry/otlp-exporter-base
```

## GRPC

For GRPC please check [npm-url-grpc]

## PROTOBUF

For PROTOBUF please check [npm-url-proto]

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/otlp-exporter-base
[npm-url-grpc]: https://www.npmjs.com/package/@opentelemetry/otlp-grpc-exporter-base
[npm-url-proto]: https://www.npmjs.com/package/@opentelemetry/otlp-proto-exporter-base
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fotlp-exporter-base.svg
[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-collector
[opentelemetry-spec-protocol-exporter]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options
[semconv-resource-service-name]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service
[metrics-exporter-url]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-exporter-metrics-otlp-http
