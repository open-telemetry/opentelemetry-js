# OpenTelemetry - distributed tracing and stats collection framework
[![Gitter chat][node-gitter-image]][node-gitter-url]
[![CircleCI][circleci-image]][circleci-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Apache License][license-image]][license-image]

## About this project
This is the JavaScript version of [OpenTelemetry](https://opentelemetry.io/), a framework for collecting traces, metrics and logs from applications.

> This project is currently in Alpha stage. Its APIs can change at any time and it is not intended to be used in production scenarios!

## Documentation

For detailed documentation of the OpenTelemetry API, see [the documentation][docs].

## Quick start

### Application Owner

To get started tracing your own application, see the [Getting Started Guide](getting-started/README.md). For more information about automatic instrumentation see [@opentelemetry/node][otel-node], which provides auto-instrumentation for Node.js applications. If the automatic instrumentation does not suit your needs, or you would like to create manual traces, see [@opentelemetry/tracing][otel-tracing]

For more information, see [@opentelemetry/tracing][otel-tracing] for an SDK that supports creating traces through manual instrumentation or [@opentelemetry/node][otel-node] which provides auto-instrumentation for Node.js applications.

### Library Author

If you are a library author looking to build OpenTelemetry into your library, please see [the documentation][docs]. As a library author, it is important that you only depend on properties and methods published on the public API. If you use any properties or methods from the SDK that are not officially a part of the public API, your library may break if an [Application Owner](#application-owner) uses a different SDK implementation.

## Release Schedule

OpenTelemetry JS is under active development.
This release isn't guaranteed to conform to a specific version of the specification, and future
releases will not attempt to maintain backwards compatibility with the alpha release.

The [v0.2 alpha
release](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v0.2.0)
includes:

- Tracing API
- Tracing SDK (Node and Web)
- Metrics API
- Jaeger Trace Exporter
- Zipkin Trace Exporter
- OpenTracing Bridge
- HTTP, GRPC, DNS Instrumentations
- Document Load for web
- Metrics SDK (`Counter` and `Gauge` support) - Export work is underway.

The [v0.3 alpha
release](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v0.3.0)
includes:

- Prometheus Metric Exporter
- OpenTelemetry Collector Exporter
- mongodb, redis, mysql Instrumentations

See the [project
milestones](https://github.com/open-telemetry/opentelemetry-js/milestones)
for details on upcoming releases. The dates and features described here are
estimates, and subject to change.

Future release targets include:

| Component                   | Version    | Target Date        |
| --------------------------- | ---------- | ------------------ |
| Support for Tags/Baggage    | Alpha v0.4 | January 31 2020    |
| Metrics Aggregation         | Alpha v0.4 | January 31 2020    |
| Metrics SDK (Complete)      | Alpha v0.4 | January 31 2020    |
| OpenCensus Bridge           | Alpha v0.4 | January 31 2020    |

## Contributing
We'd love your help!. Use tags [up-for-grabs][up-for-grabs-issues] and
[good first issue][good-first-issues] to get started with the project. Follow
[CONTRIBUTING](CONTRIBUTING.md) guide to report issues or submit a proposal.

We have a weekly SIG meeting! See the [community page](https://github.com/open-telemetry/community#javascript-sdk) for meeting details and notes.

Approvers ([@open-telemetry/js-approvers](https://github.com/orgs/open-telemetry/teams/javascript-approvers)):

- [Roch Devost](https://github.com/rochdev), DataDog
- [Brandon Gonzalez](https://github.com/bg451), LightStep
- [Olivier Albertini](https://github.com/OlivierAlbertini), Ville de Montréal
- [Valentin Marchaud](https://github.com/vmarchaud), Open Source Contributor
- [Mark Wolff](https://github.com/markwolff), Microsoft
- [Bartlomiej Obecny](https://github.com/obecny), LightStep

*Find more about the approver role in [community repository](https://github.com/open-telemetry/community/blob/master/community-membership.md#approver).*

Maintainers ([@open-telemetry/js-maintainers](https://github.com/orgs/open-telemetry/teams/javascript-maintainers)):

- [Mayur Kale](https://github.com/mayurkale22), Google
- [Daniel Dyla](https://github.com/dyladan), Dynatrace

*Find more about the maintainer role in [community repository](https://github.com/open-telemetry/community/blob/master/community-membership.md#maintainer).*

## Packages

### API

| Package                 | Description |
| ----------------------- | -----------------|
| [@opentelemetry/types][otel-types] | This package provides TypeScript interfaces and enums for the OpenTelemetry core trace and metrics model. It is intended for use both on the server and in the browser. |
| [@opentelemetry/core][otel-core] | This package provides default and no-op implementations of the OpenTelemetry types for trace and metrics. It's intended for use both on the server and in the browser. |

### Implementation / SDKs

| Package                 | Description |
| ----------------------- | -----------------|
| [@opentelemetry/tracing][otel-tracing] | This module provides a full control over instrumentation and span creation. It doesn't load [`async_hooks`](https://nodejs.org/api/async_hooks.html) or any instrumentation plugin by default. It is intended for use both on the server and in the browser. |
| [@opentelemetry/metrics][otel-metrics] | This module provides instruments and meters for reporting of time series data. |
| [@opentelemetry/node][otel-node] | This module provides automatic tracing for Node.js applications. It is intended for use on the server only. |
| [@opentelemetry/web][otel-web] | This module provides automated instrumentation and tracing for Web applications. It is intended for use in the browser only. |
| [@opentelemetry/base][otel-base] | This package provides base code for the SDK packages (tracing and metrics). |

### Exporters

OpenTelemetry is vendor-agnostic and can upload data to any backend with various exporter implementations. Even though, OpenTelemetry provides support for many backends, vendors/users can also implement their own exporters for proprietary and unofficially supported backends. Currently, OpenTelemetry supports:

#### Trace Exporters
- [@opentelemetry/exporter-jaeger][otel-exporter-jaeger]
- [@opentelemetry/exporter-zipkin][otel-exporter-zipkin]
- [@opentelemetry/exporter-stackdriver-trace][otel-exporter-stackdriver-trace]
- [@opentelemetry/exporter-collector][otel-exporter-collector]

#### Metric Exporters
- [@opentelemetry/exporter-prometheus][otel-exporter-prometheus]

### Plugins

OpenTelemetry can collect tracing data automatically using plugins. Vendors/Users can also create and use their own. Currently, OpenTelemetry supports automatic tracing for:

#### Node Plugins
- [@opentelemetry/plugin-grpc][otel-plugin-grpc]
- [@opentelemetry/plugin-http][otel-plugin-http]
- [@opentelemetry/plugin-https][otel-plugin-https]
- [@opentelemetry/plugin-mongodb][otel-plugin-mongodb]
- [@opentelemetry/plugin-mysql][otel-plugin-mysql]
- [@opentelemetry/plugin-pg][otel-plugin-pg]
- [@opentelemetry/plugin-pg-pool][otel-plugin-pg-pool]
- [@opentelemetry/plugin-redis][otel-plugin-redis]
- [@opentelemetry/plugin-ioredis][otel-plugin-ioredis]
- [@opentelemetry/plugin-dns][otel-plugin-dns] - By default, this plugin is not loaded [#612](https://github.com/open-telemetry/opentelemetry-js/issues/612)

#### Web Plugins
- [@opentelemetry/plugin-document-load][otel-plugin-document-load]
- [@opentelemetry/plugin-xml-http-request][otel-plugin-xml-http-request]

To request automatic tracing support for a module not on this list, please [file an issue](https://github.com/open-telemetry/opentelemetry-js/issues). Alternatively, you can [write a plugin yourself](https://github.com/open-telemetry/opentelemetry-js/blob/master/doc/plugin-guide.md).

### Shims

| Package                 | Description |
| ----------------------- | -----------------|
| [@opentelemetry/shim-opentracing][otel-shim-opentracing] | OpenTracing shim allows existing OpenTracing instrumentation to report to OpenTelemetry |


## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us on [gitter][node-gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[circleci-image]: https://circleci.com/gh/open-telemetry/opentelemetry-js.svg?style=svg
[circleci-url]: https://circleci.com/gh/open-telemetry/opentelemetry-js
[node-gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[node-gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[up-for-grabs-issues]: https://github.com/open-telemetry/OpenTelemetry-js/issues?q=is%3Aissue+is%3Aopen+label%3Aup-for-grabs
[good-first-issues]: https://github.com/open-telemetry/OpenTelemetry-js/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22
[codecov-image]: https://codecov.io/gh/open-telemetry/opentelemetry-js/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/open-telemetry/opentelemetry-js/branch/master/
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat

[docs]: https://open-telemetry.github.io/opentelemetry-js

[otel-base]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-base
[otel-exporter-collector]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-exporter-collector
[otel-exporter-jaeger]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-exporter-jaeger
[otel-exporter-prometheus]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-exporter-prometheus
[otel-exporter-stackdriver-trace]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-exporter-stackdriver-trace
[otel-exporter-zipkin]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-exporter-zipkin
[otel-metrics]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-metrics
[otel-node]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node
[otel-plugin-dns]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-dns
[otel-plugin-document-load]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-document-load
[otel-plugin-grpc]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-grpc
[otel-plugin-http]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-http
[otel-plugin-https]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-https
[otel-plugin-ioredis]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-ioredis
[otel-plugin-mongodb]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-mongodb
[otel-plugin-mysql]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-mysql
[otel-plugin-pg-pool]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-postgres/opentelemetry-plugin-pg-pool
[otel-plugin-pg]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-postgres/opentelemetry-plugin-pg
[otel-plugin-redis]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-redis
[otel-plugin-xml-http-request]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-xml-http-request
[otel-shim-opentracing]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-shim-opentracing
[otel-tracing]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing
[otel-web]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-web
[otel-types]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-types
[otel-core]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-core
