
---
<p align="center">
  <strong>
    <a href="getting-started/README.md">Getting Started<a/>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://open-telemetry.github.io/opentelemetry-js">API Documentation<a/>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://gitter.im/open-telemetry/opentelemetry-node">Getting In Touch (Gitter)<a/>
  </strong>
</p>

<p align="center">
  <a href="https://github.com/open-telemetry/opentelemetry-js/releases">
    <img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/open-telemetry/opentelemetry-js?include_prereleases&style=for-the-badge">
  </a>
  <a href="https://codecov.io/gh/open-telemetry/opentelemetry-js/branch/master/">
    <img alt="Codecov Status" src="https://img.shields.io/codecov/c/github/open-telemetry/opentelemetry-js?style=for-the-badge">
  </a>
  <a href="https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/badge/license-Apache_2.0-green.svg?style=for-the-badge">
  </a>
  <br/>
  <a href="https://circleci.com/gh/open-telemetry/opentelemetry-js">
    <img alt="Build Status" src="https://circleci.com/gh/open-telemetry/opentelemetry-js.svg?style=shield">
  </a>
  <img alt="Beta" src="https://img.shields.io/badge/status-beta-informational?logo=data:image/png;base64,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">
</p>

<p align="center">
  <strong>
    <a href="CONTRIBUTING.md">Contributing<a/>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="doc/development-guide.md">Development Guide<a/>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="benchmark/README.md">Benchmarks<a/>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="examples/">Examples<a/>
  </strong>
</p>

---

## About this project

This is the JavaScript version of [OpenTelemetry](https://opentelemetry.io/), a framework for collecting traces and metrics from applications.

## Quick start

### Application Owner

To get started tracing your own application, see the [Getting Started Guide](getting-started/README.md). For more information about automatic instrumentation see [@opentelemetry/node][otel-node], which provides auto-instrumentation for Node.js applications. If the automatic instrumentation does not suit your needs, or you would like to create manual traces, see [@opentelemetry/tracing][otel-tracing]

### Library Author

If you are a library author looking to build OpenTelemetry into your library, please see [the documentation][docs]. As a library author, it is important that you only depend on properties and methods published on the public API. If you use any properties or methods from the SDK that are not officially a part of the public API, your library may break if an [Application Owner](#application-owner) uses a different SDK implementation.

## Supported Runtimes

| Platform Version | Supported                                       |
|------------------|-------------------------------------------------|
| Node.JS `v14`    | ✅                                               |
| Node.JS `v12`    | ✅                                               |
| Node.JS `v10`    | ✅                                               |
| Node.JS `v8`     | See [Node Support](#node-support) below         |
| Web Browsers     | ✅ See [Browser Support](#browser-support) below |

### Node Support

Automated tests are run using the latest release of each currently active version of Node.JS.
While Node.JS v8 is no longer supported by the Node.JS team, the latest version of Node.JS v8 is still included in our testing suite.
Please note that versions of Node.JS v8 prior to `v8.5.0` will NOT work, because OpenTelemetry Node depends on the `perf_hooks` module introduced in `v8.5.0`

### Browser Support

Automated browser tests are run in the latest version of Headless Chrome.
There is currently no list of officially supported browsers, but OpenTelemetry is developed using standard web technologies with wide support and should work in currently supported versions of major browsers.

## Release Schedule

OpenTelemetry JS is under active development.
This release isn't guaranteed to conform to a specific version of the specification, and future
releases will not attempt to maintain backwards compatibility with the alpha release.

| Component                  | Initial Version | Release Date     |
|----------------------------|-----------------|------------------|
| Tracing API                | Alpha v0.1.0    | October 14 2019  |
| Tracing SDK (Node and Web) | Alpha v0.1.0    | October 14 2019  |
| Jaeger Trace Exporter      | Alpha v0.1.0    | October 14 2019  |
| Trace Context Propagation  | Alpha v0.1.0    | October 14 2019  |
| Zipkin Trace Exporter      | Alpha v0.1.0    | October 14 2019  |
| OpenTracing Bridge         | Alpha v0.1.0    | October 14 2019  |
| Metrics API                | Alpha v0.2.0    | November 04 2019 |
| Metrics SDK                | Alpha v0.2.0    | November 04 2019 |
| Prometheus Metric Exporter | Alpha v0.3.0    | December 13 2019 |
| Resources                  | Beta v0.5.0     | March 16 2020    |
| Metrics SDK (Complete)     | Beta v0.5.0     | March 16 2020    |
| OpenCensus Bridge          | Unknown         | Unknown          |
| Support for Tags/Baggage   | Unknown         | Unknown          |

## Feature Status

Last updated March 2020

| Feature             | API Status | Specification Target | SDK Status  |
|---------------------|------------|----------------------|-------------|
| Tracing             | Beta       | v0.3                 | Beta        |
| Metrics             | Beta       | v0.3                 | Beta        |
| Context             | Beta       | v0.3                 | Beta        |
| Propagation         | Beta       | v0.3                 | Beta        |
| Correlation Context | Alpha      | v0.3                 | Development |
| OpenTracing Bridge  | N/A        | v0.3                 | Beta        |
| Resources           | N/A        | v0.3                 | Beta        |

See the [project
milestones](https://github.com/open-telemetry/opentelemetry-js/milestones)
for details on upcoming releases. The dates and features described here are
estimates, and subject to change.

## Contributing

We'd love your help!. Use tags [up-for-grabs][up-for-grabs-issues] and
[good first issue][good-first-issues] to get started with the project. Follow
[CONTRIBUTING](CONTRIBUTING.md) guide to report issues or submit a proposal.

We have a weekly SIG meeting! See the [community page](https://github.com/open-telemetry/community#javascript-sdk) for meeting details and notes.

Approvers ([@open-telemetry/js-approvers](https://github.com/orgs/open-telemetry/teams/javascript-approvers)):

- [Olivier Albertini](https://github.com/OlivierAlbertini), Ville de Montréal
- [Valentin Marchaud](https://github.com/vmarchaud), Open Source Contributor
- [Mark Wolff](https://github.com/markwolff), Microsoft
- [Matthew Wear](https://github.com/mwear), LightStep
- [Naseem K. Ullah](https://github.com/naseemkullah), Transit
- [Chengzhong Wu](https://github.com/legendecas), Alibaba

*Find more about the approver role in [community repository](https://github.com/open-telemetry/community/blob/master/community-membership.md#approver).*

Maintainers ([@open-telemetry/js-maintainers](https://github.com/orgs/open-telemetry/teams/javascript-maintainers)):

- [Mayur Kale](https://github.com/mayurkale22), Google
- [Daniel Dyla](https://github.com/dyladan), Dynatrace
- [Bartlomiej Obecny](https://github.com/obecny), LightStep

*Find more about the maintainer role in [community repository](https://github.com/open-telemetry/community/blob/master/community-membership.md#maintainer).*

### Thanks to all the people who already contributed

<a href="https://github.com/open-telemetry/opentelemetry-js/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=open-telemetry/opentelemetry-js" />
</a>

## Packages

### API

| Package                          | Description                                                                                                                                                                                    |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [@opentelemetry/api][otel-api]   | This package provides TypeScript interfaces, enums and no-op implementations for the OpenTelemetry core trace and metrics model. It is intended for use both on the server and in the browser. |
| [@opentelemetry/core][otel-core] | This package provides default and no-op implementations of the OpenTelemetry api for trace and metrics. It's intended for use both on the server and in the browser.                           |

### Implementation / SDKs

| Package                                | Description                                                                                                                                                                                                                                                  |
|----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [@opentelemetry/tracing][otel-tracing] | This module provides a full control over instrumentation and span creation. It doesn't load [`async_hooks`](https://nodejs.org/api/async_hooks.html) or any instrumentation plugin by default. It is intended for use both on the server and in the browser. |
| [@opentelemetry/metrics][otel-metrics] | This module provides instruments and meters for reporting of time series data.                                                                                                                                                                               |
| [@opentelemetry/node][otel-node]       | This module provides automatic tracing for Node.js applications. It is intended for use on the server only.                                                                                                                                                  |
| [@opentelemetry/web][otel-web]         | This module provides automated instrumentation and tracing for Web applications. It is intended for use in the browser only.                                                                                                                                 |

### Compatible Exporters

OpenTelemetry is vendor-agnostic and can upload data to any backend with various exporter implementations. Even though, OpenTelemetry provides support for many backends, vendors/users can also implement their own exporters for proprietary and unofficially supported backends.

See the [OpenTelemetry registry](https://opentelemetry.io/registry/?s=node.js) for a list of exporters available.

### Plugins

OpenTelemetry can collect tracing data automatically using plugins. Vendors/Users can also create and use their own. Currently, OpenTelemetry supports automatic tracing for:

#### Node Plugins

##### Core

- [@opentelemetry/plugin-grpc][otel-plugin-grpc]
- [@opentelemetry/plugin-grpc-js][otel-plugin-grpc-js]
- [@opentelemetry/plugin-http][otel-plugin-http]
- [@opentelemetry/plugin-https][otel-plugin-https]

##### Contrib

These plugins are hosted at <https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node>

- [@opentelemetry/plugin-mongodb][otel-contrib-plugin-mongodb]
- [@opentelemetry/plugin-mysql][otel-contrib-plugin-mysql]
- [@opentelemetry/plugin-pg][otel-contrib-plugin-pg]
- [@opentelemetry/plugin-pg-pool][otel-contrib-plugin-pg-pool]
- [@opentelemetry/plugin-redis][otel-contrib-plugin-redis]
- [@opentelemetry/plugin-ioredis][otel-contrib-plugin-ioredis]
- [@opentelemetry/plugin-express][otel-contrib-plugin-express]
- [@opentelemetry/plugin-dns][otel-contrib-plugin-dns] - By default, this plugin is not loaded [#612](https://github.com/open-telemetry/opentelemetry-js/issues/612)

#### Web Plugins

##### Core

- [@opentelemetry/plugin-xml-http-request][otel-plugin-xml-http-request]
- [@opentelemetry/plugin-fetch][otel-plugin-fetch]

##### Contrib

These plugins are hosted at <https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/web>

- [@opentelemetry/plugin-document-load][otel-contrib-plugin-document-load]
- [@opentelemetry/plugin-user-interaction][otel-contrib-plugin-user-interaction]

To request automatic tracing support for a module not on this list, please [file an issue](https://github.com/open-telemetry/opentelemetry-js/issues). Alternatively, you can [write a plugin yourself](https://github.com/open-telemetry/opentelemetry-js/blob/master/doc/plugin-guide.md).

### Shims

| Package                                                  | Description                                                                             |
|----------------------------------------------------------|-----------------------------------------------------------------------------------------|
| [@opentelemetry/shim-opentracing][otel-shim-opentracing] | OpenTracing shim allows existing OpenTracing instrumentation to report to OpenTelemetry |

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us on [gitter][node-gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[node-gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[up-for-grabs-issues]: https://github.com/open-telemetry/OpenTelemetry-js/issues?q=is%3Aissue+is%3Aopen+label%3Aup-for-grabs
[good-first-issues]: https://github.com/open-telemetry/OpenTelemetry-js/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

[docs]: https://open-telemetry.github.io/opentelemetry-js

[otel-metrics]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-metrics
[otel-node]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node

[otel-plugin-fetch]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-fetch
[otel-plugin-grpc]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-grpc
[otel-plugin-grpc-js]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-grpc-js
[otel-plugin-http]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-http
[otel-plugin-https]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-https
[otel-plugin-xml-http-request]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-xml-http-request

[otel-shim-opentracing]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-shim-opentracing
[otel-tracing]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing
[otel-web]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-web
[otel-api]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-api
[otel-core]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-core
[generate-api-documentation]: https://github.com/open-telemetry/opentelemetry-js/blob/master/CONTRIBUTING.md#generating-api-documentation

[otel-contrib-plugin-dns]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node/opentelemetry-plugin-dns
[otel-contrib-plugin-ioredis]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node/opentelemetry-plugin-ioredis
[otel-contrib-plugin-mongodb]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node/opentelemetry-plugin-mongodb
[otel-contrib-plugin-mysql]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node/opentelemetry-plugin-mysql
[otel-contrib-plugin-pg-pool]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node/opentelemetry-plugin-pg-pool
[otel-contrib-plugin-pg]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node/opentelemetry-plugin-pg
[otel-contrib-plugin-redis]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node/opentelemetry-plugin-redis
[otel-contrib-plugin-express]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node/opentelemetry-plugin-express
[otel-contrib-plugin-user-interaction]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/web/opentelemetry-plugin-user-interaction
[otel-contrib-plugin-document-load]: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/web/opentelemetry-plugin-document-load
