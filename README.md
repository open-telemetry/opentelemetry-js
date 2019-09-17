# OpenTelemetry - distributed tracing and stats collection framework
[![Gitter chat][node-gitter-image]][node-gitter-url]
[![CircleCI][circleci-image]][circleci-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Apache License][license-image]][license-image]

## Contributing
We'd love your help!. Use tags [up-for-grabs][up-for-grabs-issues] and
[good first issue][good-first-issues] to get started with the project. Follow
[CONTRIBUTING](CONTRIBUTING.md) guide to report issues or submit a proposal.

We have a weekly SIG meeting! See the [community page](https://github.com/open-telemetry/community#javascript-sdk) for meeting details and notes.

## Packages

### API

| Package                 | Description |
| ----------------------- | -----------------|
| [@opentelemetry/types](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-types) | This package provides TypeScript interfaces and enums for the OpenTelemetry core trace and metrics model. It is intended for use both on the server and in the browser. |
| [@opentelemetry/core](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-core) | This package provides default and no-op implementations of the OpenTelemetry types for trace and metrics. It's intended for use both on the server and in the browser. |

### Implementation / SDKs

| Package                 | Description |
| ----------------------- | -----------------|
| [@opentelemetry/basic-tracer](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-basic-tracer) | This module provides a full control over instrumentation and span creation. It doesn't load [`async_hooks`](https://nodejs.org/api/async_hooks.html) or any instrumentation plugin by default. It is intended for use both on the server and in the browser. |
| [@opentelemetry/node-tracer](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node-tracer) | This module provides automatic tracing for Node.js applications. It is intended for use on the server only. |

### Exporters

OpenTelemetry is vendor-agnostic and can upload data to any backend with various exporter implementations. Even though, OpenTelemetry provides support for many backends, vendors/users can also implement their own exporters for proprietary and unofficially supported backends. Currently, OpenTelemetry supports:

- [@opentelemetry/exporter-jaeger](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-exporter-jaeger)
- [@opentelemetry/exporter-zipkin](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-exporter-zipkin)

### Plugins

OpenTelemetry can collect tracing data automatically using plugins. Vendors/Users can also create and use their own. Currently, OpenTelemetry supports automatic tracing for:

- [@opentelemetry/plugin-http](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-http)
- [@opentelemetry/plugin-grpc](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-grpc)

## Release Schedule

OpenTelemetry JS is under active development. Our goal is to release an
_alpha_ version of the library at the end of September 2019. This release isn't
guaranteed to conform to a specific version of the specification, and future
releases will not attempt to maintain backwards compatibility with the alpha
release.

| Component                   | Version | Target Date       |
| --------------------------- | ------- | ----------------- |
| Tracing API                 | Alpha   | September 30 2019 |
| Tracing SDK                 | Alpha   | September 30 2019 |
| Metrics API                 | Alpha   | September 30 2019 |
| Metrics SDK                 | Alpha   | Unknown           |
| Jaeger Trace Exporter       | Alpha   | September 30 2019 |
| Zipkin Trace Exporter       | Alpha   | September 30 2019 |
| Prometheus Metrics Exporter | Alpha   | Unknown           |
| OpenTracing Bridge          | Alpha   | Unknown           |
| OpenCensus Bridge           | Alpha   | Unknown           |

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
