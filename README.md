
---
<p align="center">
  <strong>
    <a href="https://opentelemetry.io/docs/js/getting-started/">Getting Started</a>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://open-telemetry.github.io/opentelemetry-js-api">API Reference</a>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://open-telemetry.github.io/opentelemetry-js">SDK Reference</a>
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
  <a href="https://circleci.com/gh/open-telemetry/opentelemetry-js">
    <img alt="Build Status" src="https://circleci.com/gh/open-telemetry/opentelemetry-js.svg?style=shield">
  </a>
  <img alt="Beta" src="https://img.shields.io/badge/status-beta-informational?logo=data:image/png;base64,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">
</p>

<p align="center">
  <strong>
    <a href="https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md">Contributing</a>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/development-guide.md">Development Guide</a>
    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
    <a href="https://github.com/open-telemetry/opentelemetry-js/tree/main/examples">Examples</a>
  </strong>
</p>

---

## About this project

This is the JavaScript version of [OpenTelemetry](https://opentelemetry.io/), a framework for collecting traces and metrics from applications.

## Compatibility Matrix

| API Version | Core version | Experimental Packages |
| ----------- | ------------ | --------------------- |
| 1.1.x       | 1.1.x        | 0.28.x                |
| 1.0.x       | 1.0.x        | 0.26.x, 0.27.x        |
| 1.0.x       | 0.26.x       | -----                 |
| 1.0.x       | 0.25.x       | -----                 |
| 1.0.x       | 0.24.x       | -----                 |
| 1.0.x       | 0.23.x       | -----                 |
| 1.0.x       | 0.22.x       | -----                 |
| 0.21.x      | 0.21.x       | -----                 |
| 0.20.x      | 0.20.x       | -----                 |
| v1.0.0-rc.3 | 0.19.x       | -----                 |
| 0.18.x      | 0.18.x       | -----                 |
|             | 0.17.x       | -----                 |
|             | 0.16.x       | -----                 |
|             | 0.15.x       | -----                 |
|             | 0.14.x       | -----                 |
|             | 0.13.x       | -----                 |
|             | 0.12.x       | -----                 |
|             | 0.11.x       | -----                 |

## Versioning

The current version for each package can be found in the respective `package.json` file for that module. For additional details see the [versioning and stability][spec-versioning] document in the specification.

## Quick start

### Application Owner

#### Install Dependencies

```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/sdk-node
npm install --save @opentelemetry/auto-instrumentations-node
```

**Note:** `auto-instrumentations-node` is a meta package from [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node) that provides a simple way to initialize multiple Node.js instrumentations.

#### Instantiate Tracing

```js
// tracing.js

'use strict'

const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// configure the SDK to export telemetry data to the console
// enable all auto-instrumentations from the meta package
const traceExporter = new ConsoleSpanExporter();
const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-service',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start()
  .then(() => console.log('Tracing initialized'))
  .catch((error) => console.log('Error initializing tracing', error));

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

#### Run Your Application

```shell
node -r ./tracing.js app.js
```

The above example will emit auto-instrumented telemetry about your Node.js application to the console. For a more in-depth example, see the [Getting Started Guide](https://opentelemetry.io/docs/js/getting-started/). For more information about automatic instrumentation see [@opentelemetry/sdk-trace-node][otel-node], which provides auto-instrumentation for Node.js applications. If the automatic instrumentation does not suit your needs, or you would like to create manual traces, see [@opentelemetry/sdk-trace-base][otel-tracing]

### Library Author

If you are a library author looking to build OpenTelemetry into your library, please see [the documentation][docs]. As a library author, it is important that you only depend on properties and methods published on the public API. If you use any properties or methods from the SDK that are not officially a part of the public API, your library may break if an [Application Owner](#application-owner) uses a different SDK implementation.

## Supported Runtimes

| Platform Version    | Supported                                       |
| ------------------- | ----------------------------------------------- |
| Node.JS `v18`       | ✅                                               |
| Node.JS `v16`       | ✅                                               |
| Node.JS `v14`       | ✅                                               |
| Older Node Versions | See [Node Support](#node-support)               |
| Web Browsers        | ✅ See [Browser Support](#browser-support) below |

### Node Support

Only Node.js Active or Maintenance LTS versions are supported.
Previous versions of node _may_ work, but they are not tested by OpenTelemetry and they are not guaranteed to work.
Please note that versions of Node.JS v8 prior to `v8.12.0` will NOT work, because OpenTelemetry Node depends on the `perf_hooks` module introduced in `v8.5.0` and `performance.timeOrigin` that is set correctly starting in `v8.12.0`.

### Browser Support

Automated browser tests are run in the latest version of Headless Chrome.
There is currently no list of officially supported browsers, but OpenTelemetry is developed using standard web technologies with wide support and should work in currently supported versions of major browsers.

## Feature Status

| Signal  | API Status  | SDK Status        |
| ------- | ----------- | ----------------- |
| Tracing | Stable      | Release Candidate |
| Metrics | Development | Development       |
| Logs    | Roadmap     | Roadmap           |

For a more detailed breakdown of feature support see the [specification compliance matrix][compliance-matrix].

## Contributing

We'd love your help!. Use tags [up-for-grabs][up-for-grabs-issues] and
[good first issue][good-first-issues] to get started with the project. For
instructions to build and make changes to this project, see the
[CONTRIBUTING][CONTRIBUTING] guide.

We have a weekly SIG meeting! See the [community page](https://github.com/open-telemetry/community#javascript-sdk) for meeting details and notes.

Approvers ([@open-telemetry/js-approvers](https://github.com/orgs/open-telemetry/teams/javascript-approvers)):

- [Gerhard Stöbich](https://github.com/Flarna), Dynatrace
- [John Bley](https://github.com/johnbley), Splunk
- [Marc Pichler](https://github.com/pichlermarc), Dynatrace
- [Mark Wolff](https://github.com/markwolff), Microsoft
- [Matthew Wear](https://github.com/mwear), LightStep
- [Naseem K. Ullah](https://github.com/naseemkullah), Transit
- [Neville Wylie](https://github.com/MSNev), Microsoft
- [Olivier Albertini](https://github.com/OlivierAlbertini), Ville de Montréal
- [Rauno Viskus](https://github.com/Rauno56), Splunk

*Find more about the approver role in [community repository](https://github.com/open-telemetry/community/blob/main/community-membership.md#approver).*

Maintainers ([@open-telemetry/js-maintainers](https://github.com/orgs/open-telemetry/teams/javascript-maintainers)):

- [Amir Blum](https://github.com/blumamir), Aspecto
- [Chengzhong Wu](https://github.com/legendecas), Alibaba
- [Daniel Dyla](https://github.com/dyladan), Dynatrace
- [Rauno Viskus](https://github.com/Rauno56), Splunk
- [Valentin Marchaud](https://github.com/vmarchaud), Open Source Contributor

*Find more about the maintainer role in [community repository](https://github.com/open-telemetry/community/blob/main/community-membership.md#maintainer).*

### Thanks to all the people who already contributed

<a href="https://github.com/open-telemetry/opentelemetry-js/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=open-telemetry/opentelemetry-js" />
</a>

### Thanks to all previous approvers and maintainers

- [Bartlomiej Obecny](https://github.com/obecny), LightStep, Maintainer
- [Daniel Khan](https://github.com/dkhan), Dynatrace, Maintainer
- [Mayur Kale](https://github.com/mayurkale22), Google, Maintainer
- [Brandon Gonzalez](https://github.com/bg451), LightStep, Approver
- [Roch Devost](https://github.com/rochdev), DataDog, Approver

## Packages

### API

| Package                          | Description                                                                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@opentelemetry/api][otel-api]   | This package provides TypeScript interfaces, enums and no-op implementations for the OpenTelemetry core trace and metrics model. It is intended for use both on the server and in the browser. |
| [@opentelemetry/core][otel-core] | This package provides default and no-op implementations of the OpenTelemetry api for trace and metrics. It's intended for use both on the server and in the browser.                           |

### Implementation / SDKs

| Package                                         | Description                                                                                                                                                                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@opentelemetry/sdk-trace-base][otel-tracing]   | This module provides a full control over instrumentation and span creation. It doesn't load [`async_hooks`](https://nodejs.org/api/async_hooks.html) or any instrumentation by default. It is intended for use both on the server and in the browser. |
| [@opentelemetry/sdk-metrics-base][otel-metrics] | This module provides instruments and meters for reporting of time series data.                                                                                                                                                                        |
| [@opentelemetry/sdk-trace-node][otel-node]      | This module provides automatic tracing for Node.js applications. It is intended for use on the server only.                                                                                                                                           |
| [@opentelemetry/sdk-trace-web][otel-web]        | This module provides automated instrumentation and tracing for Web applications. It is intended for use in the browser only.                                                                                                                          |

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

## Upgrade guidelines

### 0.28.x to 0.29.x

- `@opentelemetry/exporter-trace-otlp-http` is now exporting `scopeSpans` instead of `instrumentationLibrarySpans`
  - this exporter now requires collector version `0.48` and up.
- `@opentelemetry/exporter-metrics-otlp-http` is now exporting `scopeMetrics` instead of `instrumentationLibraryMetrics`
  - this exporter now requires collector version `0.48` and up.

### 0.27.x to 0.28.x

- In `@opentelemetry/exporter-trace-otlp-http`, `OTLPExporterBase._isShutdown` is replaced with `_shutdownOnce`.

### 0.26.x to 0.27.x

Metric and trace exporters are split into separate packages:

- `@opentelemetry/exporter-otlp-http` => `@opentelemetry/exporter-trace-otlp-http` and `@opentelemetry/exporter-metrics-otlp-http`
- `@opentelemetry/exporter-otlp-grpc` => `@opentelemetry/exporter-trace-otlp-grpc` and `@opentelemetry/exporter-metrics-otlp-grpc`
- `@opentelemetry/exporter-otlp-proto` => `@opentelemetry/exporter-trace-otlp-proto` and `@opentelemetry/exporter-metrics-otlp-proto`

Metric types are renamed:

- `@openetelemetry/api-metrics`
  - `Meter`
    - `createValueRecorder` => `createHistogram`
    - `createValueObserver` => `createObservableGauge`
    - `createSumObserver` => `createObservableCounter`
    - `createUpDownSumObserver` => `createObservableUpDownCounter`
  - `ValueRecorder` => `Histogram`
  - `ValueObserver` => `ObservableGauge`
  - `SumObserver` => `ObservableCounter`
  - `UpDownSumObserver` => `ObservableUpDownCounter`
  - `ObserverResult` => `ObservableResult`
  - `Observation.observer` => `Observation.observable`
- `@opentelemetry/sdk-metrics-base`
  - `MetricKind`
    - `VALUE_RECORDER` => `HISTOGRAM`
    - `SUM_OBSERVER` => `OBSERVABLE_COUNTER`
    - `UP_DOWN_SUM_OBSERVER` => `OBSERVABLE_UP_DOWN_COUNTER`
    - `VALUE_OBSERVER` => `OBSERVABLE_GAUGE`

### 0.25.x to 1.x.y

Collector exporter packages and types are renamed:

- `@opentelemetry/exporter-collector` => `@opentelemetry/exporter-otlp-http`
  - `CollectorExporterBase` => `OTLPExporterBase`
  - `CollectorTraceExporter` => `OTLPTraceExporter`
  - `CollectorMetricExporter` => `OTLPMetricExporter`
  - `CollectorExporterBrowserBase` => `OTLPExporterBrowserBase`
  - `CollectorExporterNodeBase` => `OTLPExporterNodeBase`
  - `CollectorExporterConfigBase` => `OTLPExporterConfigBase`
  - `CollectorExporterError` => `OTLPExporterError`
  - `COLLECTOR_SPAN_KIND_MAPPING` => `OTLP_SPAN_KIND_MAPPING`
  - `collectorTypes` => `otlpTypes`
- `@opentelemetry/exporter-collector-grpc` => `@opentelemetry/exporter-otlp-grpc`
  - `CollectorTraceExporter` => `OTLPTraceExporter`
  - `CollectorMetricExporter` => `OTLPMetricExporter`
  - `CollectorExporterConfigNode` => `OTLPExporterConfigNode`
- `@opentelemetry/exporter-collector-proto` => `@opentelemetry/exporter-otlp-proto`
  - `CollectorExporterNodeBase` => `OTLPExporterNodeBase`
  - `CollectorMetricExporter` => `OTLPMetricExporter`
  - `CollectorTraceExporter` => `OTLPTraceExporter`
- W3C propagators in @opentelemetry/core were renamed
  - `HttpTraceContextPropagator` -> `W3CTraceContextPropagator`
  - `HttpBaggagePropagator` -> `W3CBaggagePropagator`

### 0.24.x to 0.25.x

- SDKs packages for trace and metrics has been renamed to have a consistent naming schema:
  - @opentelemetry/tracing -> @opentelemetry/sdk-trace-base
  - @opentelemetry/node -> @opentelemetry/sdk-trace-node
  - @opentelemetry/web -> @opentelemetry/sdk-trace-web
  - @opentelemetry/metrics -> @opentelemetry/sdk-metrics-base
  - @opentelemetry/node-sdk -> @opentelemetry/sdk-node

### 0.23.x to 0.24.x

- `ResourceAttributes` renamed to `SemanticResourceAttributes` in the `@opentelemetry/semantic-conventions` package

### 0.19.x to 0.20.0

- `HttpBaggage` renamed to `HttpBaggagePropagator`

- `HttpTraceContext` renamed to `HttpTraceContextPropagator`

- `JaegerHttpTracePropagator` renamed to `JaegerPropagator`

- `serviceName` configuration removed from Collector exporters. Use `service.name` Resource attribute instead.

- Prometheus exporter added suffix `_total` to counter metrics.

### 0.18.x to 0.19.0

- API is now a peer dependency. This means that users will need to include `@opentelemetry/api` as a dependency of their project in order to use the SDK. NPM version 7+ (Node 15+) should do this automatically.

- All plugins have been removed in favor of instrumentations.

- The `@opentelemetry/propagator-b3` package previously exported three propagators: `B3Propagator`,`B3SinglePropagator`, and `B3MultiPropagator`, but now only exports the `B3Propagator`. It extracts b3 context in single and multi-header encodings, and injects context using the single-header encoding by default, but can be configured to inject context using the multi-header endcoding during construction: `new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })`. If you were previously using the `B3SinglePropagator` or `B3MultiPropagator` directly, you should update your code to use the `B3Propagator` with the appropriate configuration. See the [readme][otel-propagator-b3] for full details and usage.

- Sampling configuration via environment variable has changed. If you were using `OTEL_SAMPLING_PROBABILITY` then you should replace it with `OTEL_TRACES_SAMPLER=parentbased_traceidratio` and `OTEL_TRACES_SAMPLER_ARG=<number>` where `<number>` is a number in the [0..1] range, e.g. "0.25". Default is 1.0 if unset.

### 0.17.0 to 0.18.0

- `diag.setLogLevel` is removed and LogLevel can be set by an optional second parameter to `setLogger`

[PR-1975](https://github.com/open-telemetry/opentelemetry-js/pull/1975)

- Breaking change - The resulting resource MUST have all attributes that are on any of the two input resources. If a key exists on both the old and updating resource, the value of the updating resource MUST be picked - previously it was opposite.

### 0.16.0 to 0.17.0

[PR-1880](https://github.com/open-telemetry/opentelemetry-js/pull/1880) feat(diag-logger): introduce a new global level api.diag for internal diagnostic logging

[PR-1925](https://github.com/open-telemetry/opentelemetry-js/pull/1925) feat(diag-logger): part 2 - breaking changes - remove api.Logger, api.NoopLogger, core.LogLevel, core.ConsoleLogger

- These PR's remove the previous ```Logger``` and ```LogLevel``` implementations and change the way you should use the replacement ```DiagLogger``` and ```DiagLogLevel```, below are simple examples of how to change your existing usages.

#### Setting the global diagnostic logger

The new global [```api.diag```](https://github.com/open-telemetry/opentelemetry-js-api/blob/main/src/api/diag.ts) provides the ability to set the global diagnostic logger ```setLogger()``` and logging level ```setLogLevel()```, it is also a ```DiagLogger``` implementation and should be directly to log diagnostic messages.

All included logger references have been removed in preference to using the global ```api.diag``` directly, so you no longer need to pass around the logger instance via function parameters or included as part of the configuration for a component.

```javascript
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
// Setting the default Global logger to use the Console
// And optionally change the logging level (Defaults to INFO)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR)
```

#### Using the logger anywhere in the code

```typescript
import { diag } from "@opentelemetry/api";

// Remove or make optional the parameter and don't use it.
export function MyFunction() {
  diag.debug("...");
  diag.info("...");
  diag.warn("...");
  diag.error("...");
  diag.verbose("..");
}

```

#### Setting the logger back to a noop

```typescript
import { diag } from "@opentelemetry/api";
diag.setLogger();

```

[PR-1855](https://github.com/open-telemetry/opentelemetry-js/pull/1855) Use instrumentation loader to load plugins and instrumentations

- Providers do no load the plugins anymore. Also PluginLoader has been removed from providers, use `registerInstrumentations` instead

```javascript
//Previously in node
const provider = new NodeTracerProvider({
  plugins: {
    '@grpc/grpc-js': {
      enabled: true,
      path: '@opentelemetry/plugin-grpc-js',
    },
  }
});

// Now
const provider = new NodeTracerProvider();
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
registerInstrumentations({
  instrumentations: [
    {
      plugins: {
        '@grpc/grpc-js': {
          enabled: true,
          path: '@opentelemetry/plugin-grpc-js',
        },
      }
    }
  ],
  tracerProvider: provider,
});

// or if you want to load only default instrumentations / plugins
registerInstrumentations({
  tracerProvider: provider,
});

//Previously in browser
const provider = new WebTracerProvider({
  plugins: [
    new DocumentLoad()
  ]
});
// Now
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const provider = new WebTracerProvider();
registerInstrumentations({
  instrumentations: [
    new DocumentLoad(),
  ],
});
```

- `registerInstrumentations` supports loading old plugins and instrumentations together. It also supports setting tracer provider and meter provider on instrumentations

[PR-1874](https://github.com/open-telemetry/opentelemetry-js/pull/1874) More specific API type names

Some types exported from `"@opentelemetry/api"` have been changed to be more specific.

- `AttributeValue` renamed to `SpanAttributeValue`
- `Attributes` renamed to `SpanAttributes`
- `EntryTtl` renamed to `BaggageEntryTtl`
- `EntryValue` renamed to `BaggageEntryValue`
- `Status` renamed to `SpanStatus`
- `StatusCode` renamed to `SpanStatusCode`

### 0.15.0 to 0.16.0

[PR-1863](https://github.com/open-telemetry/opentelemetry-js/pull/1863) removed public attributes `keepAlive` and `httpAgentOptions` from nodejs `CollectorTraceExporter` and `CollectorMetricExporter`

### 0.14.0 to 0.15.0

[PR-1764](https://github.com/open-telemetry/opentelemetry-js/pull/1764) removed some APIs from `Tracer`:

- `Tracer.getCurrentSpan()`: use `api.getSpan(api.context.active())`
- `Tracer.withSpan(span)`: use `api.context.with(api.setSpan(api.context.active(), span))`
- `Tracer.bind(target)`: use `api.context.bind(target)`

[PR-1797](https://github.com/open-telemetry/opentelemetry-js/pull/1797) chore!: split metrics into its own api package:

- Any references to `require("@opentelemetry/api").metrics` will need to be changed to `require("@opentelemetry/api-metrics").metrics`

[PR-1725](https://github.com/open-telemetry/opentelemetry-js/pull/1725) Use new gRPC default port

- The default port used by `@opentelemetry/exporter-collector-grpc` is changed from `55680` to `4317`

[PR-1749](https://github.com/open-telemetry/opentelemetry-js/pull/1749) chore: improve naming of span related context APIs

- Rename `[gs]etActiveSpan()` to `[gs]etSpan()`
- Rename `setExtractedSpanContext()` to `setSpanContext()`
- Rename `getParentSpanContext()` to `getSpanContext()`

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[up-for-grabs-issues]: https://github.com/open-telemetry/OpenTelemetry-js/issues?q=is%3Aissue+is%3Aopen+label%3Aup-for-grabs
[good-first-issues]: https://github.com/open-telemetry/OpenTelemetry-js/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

[docs]: https://open-telemetry.github.io/opentelemetry-js
[compliance-matrix]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md
[CONTRIBUTING]: https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md

[otel-metrics]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-sdk-metrics-base
[otel-node]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-node

[otel-instrumentation-fetch]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch
[otel-instrumentation-grpc]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc
[otel-instrumentation-http]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http
[otel-instrumentation-xml-http-request]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-xml-http-request

[otel-shim-opentracing]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-shim-opentracing
[otel-tracing]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base
[otel-web]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-web
[otel-api]: https://github.com/open-telemetry/opentelemetry-js-api
[otel-core]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-core
[otel-propagator-b3]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-propagator-b3
[generate-api-documentation]: https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md#generating-api-documentation

[spec-versioning]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md
