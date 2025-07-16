
---
<p align="center">
  <strong>
    <a href="https://opentelemetry.io/docs/languages/js/getting-started/">Getting Started</a>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://open-telemetry.github.io/opentelemetry-js">API and SDK Reference</a>
  </strong>
</p>

<p align="center">
  <a href="https://github.com/open-telemetry/opentelemetry-js/releases">
    <img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/open-telemetry/opentelemetry-js?include_prereleases&style=for-the-badge">
  </a>
  <a href="https://codecov.io/gh/open-telemetry/opentelemetry-js/branch/main/">
    <img alt="Codecov Status" src="https://img.shields.io/codecov/c/github/open-telemetry/opentelemetry-js?style=for-the-badge">
  </a>
  <a href="https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE">
    <img alt="license" src="https://img.shields.io/badge/license-Apache_2.0-green.svg?style=for-the-badge">
  </a>
  <br/>
    <a href="https://github.com/open-telemetry/opentelemetry-js/actions">
    <img alt="Build Status" src="https://github.com/open-telemetry/opentelemetry-js/actions/workflows/unit-test.yml/badge.svg?style=shield">
  </a>
  <img alt="Beta" src="https://img.shields.io/badge/status-beta-informational?logo=data:image/png;base64,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">
</p>

<p align="center">
  <strong>
    <a href="https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md">Contributing</a>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://github.com/open-telemetry/opentelemetry-js/tree/main/examples">Examples</a>
  </strong>
</p>

---

## About this project

This is the JavaScript version of [OpenTelemetry](https://opentelemetry.io/), a framework for collecting traces, metrics, and logs from applications.

## Quick Start

**Much of OpenTelemetry JS documentation is written assuming the compiled application is run as CommonJS.**
For more details on ECMAScript Modules vs CommonJS, refer to [esm-support](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/esm-support.md).

The following describes how to set up tracing for a basic web application.
For more detailed documentation, see the website at <https://opentelemetry.io/docs/instrumentation/js/>.

### Installation

Dependencies with the `latest` tag on NPM should be compatible with each other.
See the [version compatibility matrix](#package-version-compatibility) below for more information.

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/sdk-node
npm install --save @opentelemetry/auto-instrumentations-node
```

**Note:** `auto-instrumentations-node` is a meta package from [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node) that provides a simple way to initialize multiple Node.js instrumentations.

### Set up Tracing

```js
// tracing.js

'use strict'

const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

// configure the SDK to export telemetry data to the console
// enable all auto-instrumentations from the meta package
const traceExporter = new ConsoleSpanExporter();
const sdk = new opentelemetry.NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'my-service',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start();

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

### Run Your Application

```shell
node -r ./tracing.js app.js
```

The above example will emit auto-instrumented telemetry about your Node.js application to the console. For a more in-depth example, see the [Getting Started Guide](https://opentelemetry.io/docs/languages/js/getting-started/). For more information about automatic instrumentation see [@opentelemetry/sdk-trace-node][otel-node], which provides auto-instrumentation for Node.js applications. If the automatic instrumentation does not suit your needs, or you would like to create manual traces, see [@opentelemetry/sdk-trace-base][otel-tracing]

## Library Author

If you are a library author looking to build OpenTelemetry into your library, please see [the documentation][docs]. As a library author, it is important that you only depend on properties and methods published on the public API. If you use any properties or methods from the SDK that are not officially a part of the public API, your library may break if an application owner uses a different SDK implementation.

## Supported Runtimes

| Platform Version    | Supported                                     |
| ------------------- | --------------------------------------------- |
| Node.JS `v22`       | :heavy_check_mark:                            |
| Node.JS `v20`       | :heavy_check_mark:                            |
| Node.JS `v18`       | :heavy_check_mark:                            |
| Older Node Versions | See [Node Support](#node-support)             |
| Web Browsers        | See [Browser Support](#browser-support) below |

### Node Support

Only Node.js Active or Maintenance LTS versions are supported.
Previous versions of node *may* work, but they are not tested by OpenTelemetry and they are not guaranteed to work.

### Browser Support

> [!IMPORTANT]
> Client instrumentation for the browser is **experimental** and mostly **unspecified**. If you are interested in
> helping out, get in touch with the [Client Instrumentation SIG][client-instrumentation-sig].

Rather than define versions of specific browsers / runtimes, OpenTelemetry sets the minimum supported version based on the
underlying language features used.

The current minumum language feature support is set as [ECMAScript 2022](https://262.ecma-international.org/13.0/) that are available
in all modern browsers / runtimes.

This means that if you are targeting or your end-users are using a browser / runtime that does not support ES2022, you will need
to transpile the code and provide any necessary polyfills for the missing features to ensure compatibility with your target
environments. Any support issues that arise from using a browser or runtime that does not support ES2022 will be closed as "won't fix".

This minimum support level is subject to change as the project evolves and as the underlying language features evolve.

## TypeScript Support

OpenTelemetry JavaScript is built with TypeScript `v5.0.4`. If you have a TypeScript project (app, library, instrumentation, etc.)
that depends on it, we recommend using same or higher version to compile the project.

OpenTelemetry JavaScript will follows DefinitelyType's [support policy for TypeScript](https://github.com/DefinitelyTyped/DefinitelyTyped#support-window) which sets a support window of 2 years. Support for TypeScript versions older than 2 years will be dropped in minor releases of OpenTelemetry JavaScript.

## Package Version Compatibility

OpenTelemetry is released as a set of distinct packages in 3 categories: API, stable SDK, and experimental.
The API is located at [/api](/api/), the stable SDK packages are in the [/packages](/packages/) directory, and the experimental packages are listed in the [/experimental/packages](/experimental/packages/) directory.
There may also be API packages for experimental signals in the experimental directory.
All stable packages are released with the same version, and all experimental packages are released with the same version.
The below table describes which versions of each set of packages are expected to work together.

| Stable Packages | Experimental Packages |
|-----------------|-----------------------|
| 2.0.x           | 0.200.x               |
| 1.30.x          | 0.57.x                |
| 1.29.x          | 0.56.x                |
| 1.28.x          | 0.55.x                |
| 1.27.x          | 0.54.x                |
| 1.25.x          | 0.52.x                |

<details>
<summary>Older version compatibility matrix</summary>

<table>
<tr><th>Stable Packages</th>                            <th>Experimental Packages</th></tr>
<tr><td>1.24.x</td>                                                    <td>0.51.x</td></tr>
<tr><td>1.23.x</td>                                                    <td>0.50.x</td></tr>
<tr><td>1.22.x</td>                                                    <td>0.49.x</td></tr>
<tr><td>1.21.x</td>                                                    <td>0.48.x</td></tr>
<tr><td>1.20.x</td>                                                    <td>0.47.x</td></tr>
<tr><td>1.19.x</td>                                                    <td>0.46.x</td></tr>
<tr><td>1.18.x</td>                                                    <td>0.45.x</td></tr>
<tr><td>1.17.x</td>                                                    <td>0.43.x, 0.44.x</td></tr>
<tr><td>1.16.x</td>                                                    <td>0.42.x</td></tr>
<tr><td>1.15.x</td>                                                    <td>0.41.x</td></tr>
<tr><td>1.14.x</td>                                                    <td>0.40.x</td></tr>
<tr><td>1.13.x</td>                                                    <td>0.39.x</td></tr>
<tr><td>1.12.x</td>                                                    <td>0.38.x</td></tr>
<tr><td>1.11.x</td>                                                    <td>0.37.x</td></tr>
<tr><td>1.10.x</td>                                                    <td>0.36.x</td></tr>
<tr><td>1.9.x</td>                                                     <td>0.35.x</td></tr>
<tr><td>1.8.x (this and later versions require API >=1.3.0 for metrics)</td><td>0.34.x</td></tr>
<tr><td>1.7.x</td>                                                     <td>0.33.x</td></tr>
<tr><td>1.6.x</td>                                                     <td>0.32.x</td></tr>
<tr><td>1.5.x</td>                                                     <td>0.31.x</td></tr>
<tr><td>1.4.x</td>                                                     <td>0.30.x</td></tr>
<tr><td>1.3.x</td>                                                     <td>0.29.x</td></tr>
<tr><td>1.2.x</td>                                                     <td>0.29.x</td></tr>
<tr><td>1.1.x</td>                                                     <td>0.28.x</td></tr>
<tr><td>1.0.x</td>                                                     <td>0.27.x</td></tr>
<tr><td>1.0.x (this and later versions require API >=1.0.0 for traces)</td><td>0.26.x</td></tr>
</table>

</details>

## Versioning

The current version for each package can be found in the respective `package.json` file for that module. For additional details see the [versioning and stability][spec-versioning] document in the specification.

## Feature Status

| Signal  | API Status  | SDK Status  |
| ------- | ----------- | ----------- |
| Tracing | Stable      | Stable      |
| Metrics | Stable      | Stable      |
| Logs    | Development | Development |

For a more detailed breakdown of feature support see the [specification compliance matrix][compliance-matrix].

## Contributing

We'd love your help!. Use tags [up-for-grabs][up-for-grabs-issues] and
[good first issue][good-first-issues] to get started with the project. For
instructions to build and make changes to this project, see the
[CONTRIBUTING][CONTRIBUTING] guide.

We have a weekly SIG meeting! See the [community page](https://github.com/open-telemetry/community#javascript-sdk) for meeting details and notes.

### Maintainers

- [Amir Blum](https://github.com/blumamir), Odigos
- [Chengzhong Wu](https://github.com/legendecas), Bloomberg
- [Daniel Dyla](https://github.com/dyladan), Dynatrace
- [Jamie Danielson](https://github.com/JamieDanielson), Honeycomb
- [Marc Pichler](https://github.com/pichlermarc), Dynatrace
- [Trent Mick](https://github.com/trentm), Elastic

For more information about the maintainer role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#maintainer).

### Approvers

- [David Luna](https://github.com/david-luna), Elastic
- [Hector Hernandez](https://github.com/hectorhdzg), Microsoft
- [Martin Kuba](https://github.com/martinkuba), Lightstep
- [Marylia Gutierrez](https://github.com/maryliag), Grafana Labs
- [Matthew Wear](https://github.com/mwear), LightStep
- [Neville Wylie](https://github.com/MSNev), Microsoft
- [Purvi Kanal](https://github.com/pkanal), Honeycomb
- [Svetlana Brennan](https://github.com/svetlanabrennan), New Relic

For more information about the approver role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#approver).

### Triagers

Members of this team have triager permissions for opentelemetry-js.git and opentelemetry-js-contrib.git.

- [Jackson Weber](https://github.com/JacksonWeber), Microsoft

For more information about the triager role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#triager).

### Contrib Triagers

Members of this team have triager permissions for opentelemetry-js-contrib.git.
Typically, members of this are [component owners](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/.github/component_owners.yml) of one or more packages in the contrib repo.

- [Aaron Abbott](https://github.com/aabmass), Google
- [Abhinav Mathur](https://github.com/abhee11), AppDynamics
- [Bartlomiej Obecny](https://github.com/obecny)
- [Daniel Li](https://github.com/d4nyll)
- [Florencia Acosta](https://github.com/facostaembrace), Embrace
- [Jackson Weber](https://github.com/JacksonWeber), Microsoft
- [Jaryk](https://github.com/Ugzuzg), Volvo Cars
- [Jonathan Lee](https://github.com/jj22ee)
- [Jonathan Munz](https://github.com/jpmunz), Embrace
- [kirrg001](https://github.com/kirrg001), Instana
- [MartenH](https://github.com/mhennoch), Splunk
- [Mike Goldsmith](https://github.com/MikeGoldsmith), Honeycomb
- [Motti](https://github.com/mottibec)
- [Punya Biswal](https://github.com/punya), Google
- [Siim Kallas](https://github.com/seemk), Splunk
- [t2t2](https://github.com/t2t2), Splunk
- [Trivikram Kamat](https://github.com/trivikr), AWS

For more information about the triager role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#triager).

### Emeriti

- [Bartlomiej Obecny](https://github.com/obecny), Maintainer
- [Brandon Gonzalez](https://github.com/bg451), Approver
- [Daniel Khan](https://github.com/dkhan), Maintainer
- [Gerhard Stöbich](https://github.com/Flarna), Approver
- [Haddas Bronfman](https://github.com/haddasbronfman), Approver
- [John Bley](https://github.com/johnbley), Approver
- [Mark Wolff](https://github.com/markwolff), Approver
- [Mayur Kale](https://github.com/mayurkale22), Maintainer
- [Naseem K. Ullah](https://github.com/naseemkullah), Approver
- [Olivier Albertini](https://github.com/OlivierAlbertini), Approver
- [Rauno Viskus](https://github.com/rauno56), Maintainer
- [Roch Devost](https://github.com/rochdev), Approver
- [Valentin Marchaud](https://github.com/vmarchaud), Maintainer

For more information about the emeritus role, see the [community repository](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md#emeritus-maintainerapprovertriager).

### Thanks to all of our contributors!

<a href="https://github.com/open-telemetry/opentelemetry-js/graphs/contributors">
  <img alt="Repo contributors" src="https://contrib.rocks/image?repo=open-telemetry/opentelemetry-js" />
</a>

## Packages

### API

| Package                          | Description                                                                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@opentelemetry/api][otel-api]   | This package provides TypeScript interfaces, enums and no-op implementations for the OpenTelemetry core trace and metrics model. It is intended for use both on the server and in the browser. |
| [@opentelemetry/core][otel-core] | This package provides default and no-op implementations of the OpenTelemetry api for trace and metrics. It's intended for use both on the server and in the browser.                           |

### Implementation / SDKs

| Package                                       | Description                                                                                                                                                                                                                                           |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@opentelemetry/sdk-trace-base][otel-tracing] | This module provides a full control over instrumentation and span creation. It doesn't load [`async_hooks`](https://nodejs.org/api/async_hooks.html) or any instrumentation by default. It is intended for use both on the server and in the browser. |
| [@opentelemetry/sdk-metrics][otel-metrics]    | This module provides instruments and meters for reporting of time series data.                                                                                                                                                                        |
| [@opentelemetry/sdk-trace-node][otel-node]    | This module provides automatic tracing for Node.js applications. It is intended for use on the server only.                                                                                                                                           |
| [@opentelemetry/sdk-trace-web][otel-web]      | This module provides automated instrumentation and tracing for Web applications. It is intended for use in the browser only.                                                                                                                          |

### Compatible Exporters

OpenTelemetry is vendor-agnostic and can upload data to any backend with various exporter implementations. Even though, OpenTelemetry provides support for many backends, vendors/users can also implement their own exporters for proprietary and unofficially supported backends.

See the [OpenTelemetry registry](https://opentelemetry.io/registry/?language=js&component=exporter#) for a list of exporters available.

### Instrumentations

OpenTelemetry can collect tracing data automatically using instrumentations.

To request automatic tracing support for a module not on this list, please [file an issue](https://github.com/open-telemetry/opentelemetry-js/issues). Alternatively, Vendor/Users can [write an instrumentation yourself](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/instrumentation-guide.md).

Currently, OpenTelemetry supports automatic tracing for:

#### Node Instrumentations

##### Core

- [@opentelemetry/instrumentation-grpc][otel-instrumentation-grpc]
- [@opentelemetry/instrumentation-http][otel-instrumentation-http]

##### Contrib

These instrumentations are hosted at <https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/node>

#### Web Instrumentations

##### Core

- [@opentelemetry/instrumentation-xml-http-request][otel-instrumentation-xml-http-request]
- [@opentelemetry/instrumentation-fetch][otel-instrumentation-fetch]

##### Contrib

These instrumentations are hosted at <https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/plugins/web>

### Shims

| Package                                                  | Description                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [@opentelemetry/shim-opentracing][otel-shim-opentracing] | OpenTracing shim allows existing OpenTracing instrumentation to report to OpenTelemetry |

## Useful links

- [Upgrade to SDK 2.x guide](./doc/upgrade-to-2.x.md)
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[up-for-grabs-issues]: https://github.com/open-telemetry/OpenTelemetry-js/issues?q=is%3Aissue+is%3Aopen+label%3Aup-for-grabs
[good-first-issues]: https://github.com/open-telemetry/OpenTelemetry-js/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

[client-instrumentation-sig]: https://docs.google.com/document/d/16Vsdh-DM72AfMg_FIt9yT9ExEWF4A_vRbQ3jRNBe09w/edit

[docs]: https://open-telemetry.github.io/opentelemetry-js
[compliance-matrix]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md
[CONTRIBUTING]: https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md

[otel-metrics]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/sdk-metrics
[otel-node]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-node

[otel-instrumentation-fetch]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch
[otel-instrumentation-grpc]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc
[otel-instrumentation-http]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http
[otel-instrumentation-xml-http-request]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-xml-http-request

[otel-shim-opentracing]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-shim-opentracing
[otel-tracing]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base
[otel-web]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-web
[otel-api]: https://github.com/open-telemetry/opentelemetry-js/tree/main/api
[otel-core]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-core

[spec-versioning]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md
