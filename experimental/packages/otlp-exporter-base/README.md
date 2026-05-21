# OpenTelemetry Collector Exporter for web and node

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This package is intended for internal use only.**

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This module provides base components for OTLP Exporters, both Web and Node.js.

## Installation

```bash
npm install --save @opentelemetry/otlp-exporter-base
```

## HTTP exporter configuration

HTTP JSON and HTTP/protobuf exporters for traces, metrics, and logs share these configuration options.
Node.js exporters accept `OTLPExporterNodeConfigBase`, which also includes the options from `OTLPExporterConfigBase`.

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `url` | `string` | Signal-specific localhost endpoint, such as `http://localhost:4318/v1/traces` | Collector endpoint URL. Signal-specific environment variables override `OTEL_EXPORTER_OTLP_ENDPOINT`. |
| `headers` | `Record<string, string> \| HeadersFactory` | Required OTLP headers for the exporter transport | Custom HTTP headers. A factory function may be async and must not throw. |
| `concurrencyLimit` | `number` | `30` | Maximum number of in-flight export requests. |
| `timeoutMillis` | `number` | `10000` | Maximum time, in milliseconds, to wait for each batch export. |
| `compression` | `CompressionAlgorithm.NONE \| CompressionAlgorithm.GZIP` | `CompressionAlgorithm.NONE` | Compression for outgoing OTLP HTTP requests in Node.js. |
| `keepAlive` | `boolean` | `true` | Sets `keepAlive` on the Node.js HTTP or HTTPS agent created by the exporter. A `keepAlive` value in `httpAgentOptions` takes precedence. |
| `httpAgentOptions` | `http.AgentOptions \| https.AgentOptions \| HttpAgentFactory` | Agent options with `keepAlive: true` | Custom Node.js HTTP or HTTPS agent options, or a factory function that receives the request protocol and returns an agent. |
| `userAgent` | `string` | The exporter's default user agent | Prefix to add to the exporter's default `User-Agent` header in Node.js. |

Programmatic options take precedence over environment variables. Per-signal environment variables take precedence over non-signal variables.

| Option | General environment variable | Signal-specific environment variables |
| ------ | ---------------------------- | ------------------------------------- |
| `url` | `OTEL_EXPORTER_OTLP_ENDPOINT` | `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`, `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`, `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` |
| `headers` | `OTEL_EXPORTER_OTLP_HEADERS` | `OTEL_EXPORTER_OTLP_TRACES_HEADERS`, `OTEL_EXPORTER_OTLP_METRICS_HEADERS`, `OTEL_EXPORTER_OTLP_LOGS_HEADERS` |
| `timeoutMillis` | `OTEL_EXPORTER_OTLP_TIMEOUT` | `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`, `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`, `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT` |
| `compression` | `OTEL_EXPORTER_OTLP_COMPRESSION` | `OTEL_EXPORTER_OTLP_TRACES_COMPRESSION`, `OTEL_EXPORTER_OTLP_METRICS_COMPRESSION`, `OTEL_EXPORTER_OTLP_LOGS_COMPRESSION` |
| `concurrencyLimit` | Not supported | Not supported |
| `keepAlive` | Not supported | Not supported |
| `httpAgentOptions` | `OTEL_EXPORTER_OTLP_CERTIFICATE`, `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE`, `OTEL_EXPORTER_OTLP_CLIENT_KEY` | `OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE`, `OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE`, `OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY`, `OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE`, `OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE`, `OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY`, `OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE`, `OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE`, `OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY` |
| `userAgent` | Not supported | Not supported |

## GRPC

For GRPC please check [npm-url-grpc]

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
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fotlp-exporter-base.svg
