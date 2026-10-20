# Upgrade to OpenTelemetry JS SDK 3.x

In October 2026, the OpenTelemetry JavaScript project released the first versions of "OTel JS SDK 3.x" packages, which include a number of *breaking changes*. This document shows how to migrate to the new 3.x.
For the most part, this document *only covers breaking changes* (sections marked with a 💥).

The October 2026 releases also include a new *minor* version of the API package (`@opentelemetry/api` v1.10.0), with some significant changes. This document will also cover some of these changes.

Refer to the changelogs for full details:

- [CHANGELOG for stable SDK packages](https://github.com/open-telemetry/opentelemetry-js/blob/main/CHANGELOG.md)
- [CHANGELOG for experimental SDK packages](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/CHANGELOG.md)
- [CHANGELOG for the API package](https://github.com/open-telemetry/opentelemetry-js/blob/main/api/CHANGELOG.md)

For background on the 3.0 release, see the [3.x announcement](announcement.md).

Per [OpenTelemetry guidelines](https://opentelemetry.io/docs/specs/otel/versioning-and-stability/#sdk-support), the 2.x versions of stable SDK packages will be supported for one year from the 3.0.0 release.

If you have questions, reach the OTel JS community on [#otel-js](https://cloud-native.slack.com/archives/C01NL1GRPQR) in the [CNCF Slack](https://slack.cncf.io/), [open a Discussion](https://github.com/open-telemetry/opentelemetry-js/discussions), or join the weekly [OTel JS SIG call](https://docs.google.com/document/d/1tCyoQK49WVcE-x8oryZOTTToFm7sIeUhxFPm9g-qL1k/edit).

## What is OTel JS SDK 3.x?

"OTel JS SDK 3.x" encompasses new releases of the `@opentelemetry/*` JavaScript packages published from the [opentelemetry-js.git](https://github.com/open-telemetry/opentelemetry-js) repository, except the API and semantic-conventions packages. The SDK packages are categories 3 and 4 in the groupings below. The package versions for this new major will be `>=3.0.0` for the stable and `>=0.300.0` for the unstable packages. (The jump to `0.300.x` was intentional, to help signal that these packages are in the "3.x generation".)

If your usage of OpenTelemetry does not *directly* use these packages -- for example if you only use `@opentelemetry/auto-instrumentations-node` -- then you most likely will *not* need to change your code to migrate. You still need to be aware of the new minimum version of Node.js that is supported.

<details>
<summary>Categories of OpenTelemetry JS packages</summary>

The OpenTelemetry JS SIG is responsible for numerous packages, all published to npm under the `@opentelemetry/` org, and developed in two git repositories: [opentelemetry-js.git](https://github.com/open-telemetry/opentelemetry-js) (sometimes called the "core" repo) and [opentelemetry-js-contrib.git](https://github.com/open-telemetry/opentelemetry-js-contrib) (the "contrib" repo). For the sake of this document, these packages can be grouped into these categories:

1. The [API](../../api/) package (`@opentelemetry/api`). The API is versioned independently of all other packages. The API package is *not* part of "the SDK", but it is getting a new *minor* release at the same time.
2. The [Semantic Conventions](../../semantic-conventions/) package (`@opentelemetry/semantic-conventions`). This package follows the [versioning](https://github.com/open-telemetry/semantic-conventions/releases) of the language-independent Semantic Conventions. It is *not* being changed as part of "JS SDK 3.x".
3. [Stable packages from opentelemetry-js.git](../../packages/). These are packages that have reached "1.x". These packages are all versioned together, and are at version "2.12.0" at the time of writing.
4. [Unstable packages from opentelemetry-js.git](../../experimental/packages/). These are packages deemed still experimental. They are all at "0.x" versions. These packages are all versioned together, and are at version "0.223.0" at the time of writing.
5. All packages from opentelemetry-js-contrib.git. These packages are all versioned independently. These packages are not considered part of the "JS SDK 3.0" release. However, soon they will update to use JS SDK 3.x releases.
6. Packages from [opentelemetry-browser.git](https://github.com/open-telemetry/opentelemetry-browser), owned by the OTel Browser SIG, also publish to npm under the `@opentelemetry/` org. These packages are not considered part of this "JS SDK 3.0". However, they will update to JS SDK 3.x releases soon.

"JS SDK 3.x" refers to categories 3 and 4.

</details>

<details>
<summary>The full set of "JS SDK 3.x" packages</summary>

| Package | Version |
| ------- | ------- |
| @opentelemetry/context-async-hooks | 3.0.0 |
| @opentelemetry/context-zone | 3.0.0 |
| @opentelemetry/context-zone-peer-dep | 3.0.0 |
| @opentelemetry/core | 3.0.0 |
| @opentelemetry/exporter-zipkin | 3.0.0 |
| @opentelemetry/propagator-b3 | 3.0.0 |
| @opentelemetry/resources | 3.0.0 |
| @opentelemetry/sdk-logs | 3.0.0 |
| @opentelemetry/sdk-metrics | 3.0.0 |
| @opentelemetry/sdk-trace | 3.0.0 |
| @opentelemetry/configuration | 0.300.0 |
| @opentelemetry/exporter-logs-otlp-grpc | 0.300.0 |
| @opentelemetry/exporter-logs-otlp-http | 0.300.0 |
| @opentelemetry/exporter-logs-otlp-proto | 0.300.0 |
| @opentelemetry/exporter-metrics-otlp-grpc | 0.300.0 |
| @opentelemetry/exporter-metrics-otlp-http | 0.300.0 |
| @opentelemetry/exporter-metrics-otlp-proto | 0.300.0 |
| @opentelemetry/exporter-prometheus | 0.300.0 |
| @opentelemetry/exporter-trace-otlp-grpc | 0.300.0 |
| @opentelemetry/exporter-trace-otlp-http | 0.300.0 |
| @opentelemetry/exporter-trace-otlp-proto | 0.300.0 |
| @opentelemetry/instrumentation | 0.300.0 |
| @opentelemetry/instrumentation-fetch | 0.300.0 |
| @opentelemetry/instrumentation-grpc | 0.300.0 |
| @opentelemetry/instrumentation-http | 0.300.0 |
| @opentelemetry/instrumentation-xml-http-request | 0.300.0 |
| @opentelemetry/opentelemetry-browser-detector | 0.300.0 |
| @opentelemetry/otlp-exporter-base | 0.300.0 |
| @opentelemetry/otlp-grpc-exporter-base | 0.300.0 |
| @opentelemetry/otlp-transformer | 0.300.0 |
| @opentelemetry/propagator-env-carrier | 0.300.0 |
| @opentelemetry/sampler-composite | 0.300.0 |
| @opentelemetry/sampler-jaeger-remote | 0.300.0 |
| @opentelemetry/sdk-node | 0.300.0 |
| @opentelemetry/web-common | 0.300.0 |

</details>

## 💥 Node.js supported versions

The **minimum supported Node.js version has been raised to `>=22.15.0`** for all packages except `@opentelemetry/api` and `@opentelemetry/semantic-conventions`, which keep their existing, wider minimum versions.
Node.js v18 and v20 reached [end-of-life](https://github.com/nodejs/release#readme).

> [!NOTE]
> Related issues and PRs:
> [#6420](https://github.com/open-telemetry/opentelemetry-js/issues/6420)

## Dual CJS/ESM exports

Packages now ship proper ES Module (ESM) and CommonJS (CJS) exports. The result should be much more friendly to ESM and bundler users.

This is **not** expected to be a breaking change. However, the internal paths in packages have changed, and all packages now define [entry points via "exports" in package.json](https://nodejs.org/api/packages.html#exports). This will break any users doing deep imports into these packages. Deep imports were not considered supported. `<package>/package.json` is also no longer importable; use `SDK_INFO` from `@opentelemetry/core` for the SDK version.

> [!NOTE]
> Related issues and PRs:
> [#6293](https://github.com/open-telemetry/opentelemetry-js/pull/6293)

## 💥 `@opentelemetry/api-logs` package removed

OTel JS has stabilized the Logs signal!
That means that the APIs from `@opentelemetry/api-logs` have been folded into `@opentelemetry/api`, and the `api-logs` package has been removed. It also means the `@opentelemetry/sdk-logs` package is now stable (version 3.x).

- Remove the standalone package (`npm uninstall @opentelemetry/api-logs`) and update imports.

```js
// before
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

// after
import { logs, SeverityNumber } from '@opentelemetry/api';
```

- `logs.setGlobalLoggerProvider(provider)` now returns a boolean indicating whether registration succeeded. The standalone `@opentelemetry/api-logs` implementation returned the registered `LoggerProvider`. Use `logs.getLoggerProvider()` when the provider instance is needed.

- The `AnyValue`, `AnyValueMap`, `LogBody`, and `LogAttributes` types from `@opentelemetry/api-logs` were not carried over. Replace `AnyValue` and `LogBody` with `AnyValue`, and `AnyValueMap` and `LogAttributes` with `Attributes`, from `@opentelemetry/api`.

```ts
// before
import type { AnyValue, AnyValueMap, LogAttributes, LogBody } from '@opentelemetry/api-logs';

// after
import type { AnyValue, Attributes } from '@opentelemetry/api';
```

## Bundler requirements for packages with platform-specific code

Some JS SDK packages include separate Node.js and browser implementations of some code. These packages no longer ship a top-level `browser` field in `package.json`. Instead they resolve the appropriate implementation with [`package.json` conditions](https://nodejs.org/api/packages.html#conditional-exports) using the "exports" and "imports" fields. They select the Node.js implementation with the `node` condition on the `#platform` subpath under `imports`, and every other environment gets the browser implementation from the `require` and `default` branches.

The SDK packages with platform-specific code are: `@opentelemetry/core`, `@opentelemetry/resources`, `@opentelemetry/sdk-trace`, `@opentelemetry/sdk-logs`, `@opentelemetry/instrumentation`, `@opentelemetry/exporter-zipkin`, `@opentelemetry/otlp-transformer` and the OTLP HTTP and protobuf exporters.

**Your bundler must support the `imports` and `exports` fields**; one without `imports` support fails to resolve `#platform`. Webpack 5 needs `enhanced-resolve` 5.8.2 or later, which webpack 5.54 and later require. Jest needs 29.4 or later. React Native needs Metro 0.81.3 or later: React Native 0.79 and later, or 0.76 to 0.78 with an updated Metro.

This is **not** expected to be a breaking change, as all supported bundler versions support `imports` and `exports`.

<details>
<summary>Platform and bundler details</summary>

Node.js always applies the `node` condition. These bundler setups also resolve the Node.js implementation; all other setups, including browsers, web workers, edge runtimes and React Native, resolve the browser implementation:

| Tool | Node.js implementation when |
| --- | --- |
| webpack | [`target`](https://webpack.js.org/configuration/target/) is a Node.js target, such as `'node'` or `'electron-main'`, or [`resolve.conditionNames`](https://webpack.js.org/configuration/resolve/#resolveconditionnames) includes `'node'` |
| esbuild | [`platform`](https://esbuild.github.io/api/#platform) is `'node'`, or [`conditions`](https://esbuild.github.io/api/#conditions) includes `'node'` |
| Vite | SSR, unless the package is bundled with [`ssr.noExternal`](https://vite.dev/config/ssr-options#ssr-noexternal) and [`ssr.target`](https://vite.dev/config/ssr-options#ssr-target) is `'webworker'` |
| Rollup with `@rollup/plugin-node-resolve` | [`exportConditions`](https://github.com/rollup/plugins/tree/master/packages/node-resolve#exportconditions) includes `'node'` |
| Parcel | the target [`context`](https://parceljs.org/features/targets/#context) is `node`, `electron-main` or `electron-renderer` (see below) |
| Jest | [`testEnvironment`](https://jestjs.io/docs/configuration#testenvironment-node--jsdom--string) is `node`, or on Jest 30, the tests do not run as native ESM (see below) |

A bundle that runs on Node.js but is built without the `node` condition contains the browser implementation. This happens with esbuild `platform: 'neutral'`, Rollup's default `exportConditions`, a webpack `target` that mixes browsers and Node.js (such as `['web', 'node']` or `'universal'`), and a webpack `resolve.conditionNames` or Vite [`ssr.resolve.conditions`](https://vite.dev/config/ssr-options#ssr-resolve-conditions) list that leaves out the defaults (`'...'` in webpack, `...defaultServerConditions` in Vite). Add `node` to that bundler's conditions.

Parcel resolves `#platform` only when [package exports are enabled](https://parceljs.org/features/dependency-resolution/#enabling-package-exports), and only from ESM `import`. Enable them in the app's `package.json`:

```json
{
  "@parcel/resolver-default": {
    "packageExports": true
  }
}
```

Under Parcel, CommonJS code that calls `require()` on these packages, including CommonJS dependencies, fails with `Failed to resolve '#platform'`.

Jest 30's CommonJS runtime always applies the `node` condition, including in the `jsdom` environment ([jestjs/jest#16476](https://github.com/jestjs/jest/issues/16476)), and [`customExportConditions`](https://jestjs.io/docs/configuration#custom-export-conditions) does not change that. To load the browser implementations under `jsdom`, run the tests as native ESM, or set a custom [`resolver`](https://jestjs.io/docs/configuration#resolver-string) that drops `node` when `browser` is present:

```js
module.exports = (request, options) =>
  options.defaultResolver(request, {
    ...options,
    conditions: options.conditions?.includes('browser')
      ? options.conditions.filter(c => c !== 'node')
      : options.conditions,
  });
```

</details>

## 💥 `@opentelemetry/propagator-jaeger` package removed

The `@opentelemetry/propagator-jaeger` package has been removed. The Jaeger propagator is deprecated in favor of the W3C TraceContext propagator.

- Migrate to `W3CTraceContextPropagator` from `@opentelemetry/core`

Replace any direct use of `JaegerPropagator` with `W3CTraceContextPropagator` from `@opentelemetry/core`:

```ts
// before
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { propagation } from '@opentelemetry/api';
propagation.setGlobalPropagator(new JaegerPropagator());

// after
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { propagation } from '@opentelemetry/api';
propagation.setGlobalPropagator(new W3CTraceContextPropagator());
```

> [!IMPORTANT]
> This migration requires updating **every service in your system** that sends or receives trace context. Switching only some services will break distributed traces — a service still emitting `uber-trace-id` headers will not be correlated with a service that only reads `traceparent`. Migrate all services together, or run both propagators in parallel using `CompositePropagator` during a transition period.
>
> If you cannot yet migrate all services, run that transition period on SDK 2.x before upgrading. `@opentelemetry/propagator-jaeger@^2` declares a peer dependency of `@opentelemetry/api@>=1.0.0 <1.10.0`, while `@opentelemetry/core@3` and the other core SDK packages require `@opentelemetry/api@>=1.10.0`, so the two cannot be installed together.

## 💥 `@opentelemetry/exporter-jaeger` package removed

The `@opentelemetry/exporter-jaeger` package has been removed. Jaeger has deprecated its custom Thrift collection protocols in favor of standard OpenTelemetry Protocol (OTLP). Jaeger natively supports receiving OpenTelemetry Protocol (OTLP) data.  Migrate to OTLP Exporters:

- Replace `JaegerExporter` with `OTLPTraceExporter` from one of `@opentelemetry/exporter-trace-otlp-proto` (http/protobuf), `@opentelemetry/exporter-trace-otlp-http` (http/json), or `@opentelemetry/exporter-trace-otlp-grpc` (gRPC).

```ts
// before
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { BatchSpanProcessor, TracerProvider } from '@opentelemetry/sdk-trace';
const provider = new TracerProvider({
  spanProcessors: [
    new BatchSpanProcessor({ exporter: new JaegerExporter({
      endpoint: 'https://collector.example.com:14268/api/traces',
    })})
  ]
});

// after (using OTLP Proto over HTTP)
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor, TracerProvider } from '@opentelemetry/sdk-trace';
const provider = new TracerProvider({
  spanProcessors: [
    new BatchSpanProcessor({exporter: new OTLPTraceExporter({
      url: 'https://collector.example.com:4318/v1/traces',
    })})
  ]
});
```

## `@opentelemetry/instrumentation-http` API changes

- Removed: `HttpInstrumentationConfig.serverName`
  The `serverName` option on `HttpInstrumentationConfig` has been removed. It had no effect — stable HTTP semantic conventions do not include the `http.server_name` attribute. Remove the option from any `setConfig()` or constructor call.

```ts
// before
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
const instrumentations = [
  new HttpInstrumentation({
    serverName: 'my.server.name',
    // ... other options
  }),
];

// after
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
const instrumentations = [
  new HttpInstrumentation({
    // ... other options (serverName removed)
  }),
];
```

## `@opentelemetry/core` API changes

- `getTimeOrigin()` -> `performance.timeOrigin`
  `getTimeOrigin()` was a thin wrapper around `performance.timeOrigin`. Use `performance.timeOrigin` directly.

    ```ts
    // before
    import { getTimeOrigin } from '@opentelemetry/core';
    const origin = getTimeOrigin();

    // after
    const origin = performance.timeOrigin;
    ```

- `otperformance` -> `performance`
  `otperformance` was a re-export of the global `performance` object. Use `performance` directly.

    ```ts
    // before
    import { otperformance } from '@opentelemetry/core';
    const now = otperformance.now();
    const origin = otperformance.timeOrigin;

    // after
    const now = performance.now();
    const origin = performance.timeOrigin;
    ```

- `_globalThis` -> `globalThis`
  `_globalThis` was a re-export of the built-in `globalThis`. Use `globalThis` directly.

    ```ts
    // before
    import { _globalThis } from '@opentelemetry/core';
    _globalThis.<something>;

    // after
    globalThis.<something>;
    ```

- `unrefTimer()` -> timer.unref() in Node.js
  `unrefTimer()` was a small utility that called `.unref()` on a timer object. Call `.unref()` directly in your own code.
  In Browser code this isn't relevant.

    ```ts
    // before
    import { unrefTimer } from '@opentelemetry/core';
    const timer = setTimeout(() => {}, 1000);
    unrefTimer(timer);

    // after
    const timer = setTimeout(() => {}, 1000);
    if (typeof timer !== 'number') {
      timer.unref();
    }
    ```

## `@opentelemetry/sdk-trace`

### Removed: `TracerProviderOptions.forceFlushTimeoutMillis`

`forceFlushTimeoutMillis` on `TracerProviderOptions` has been removed. Pass `{ timeoutMillis }` to `forceFlush()` instead. The default timeout is 30000ms.

```ts
// before
const provider = new TracerProvider({ forceFlushTimeoutMillis: 5000 });
await provider.forceFlush();

// after
const provider = new TracerProvider();
await provider.forceFlush({ timeoutMillis: 5000 });
```

## `@opentelemetry/sdk-logs`

### Removed: `SdkLogRecord` type alias

`SdkLogRecord` was a type alias for `ReadWriteLogRecord`. Use `ReadWriteLogRecord` directly.

```ts
// before
import type { SdkLogRecord } from '@opentelemetry/sdk-logs';

// after
import type { ReadWriteLogRecord } from '@opentelemetry/sdk-logs';
```

### Removed: `LoggerProviderConfig` type alias

`LoggerProviderConfig` was a type alias for `LoggerProviderOptions`. Use `LoggerProviderOptions` directly.

```ts
// before
import type { LoggerProviderConfig } from '@opentelemetry/sdk-logs';

// after
import type { LoggerProviderOptions } from '@opentelemetry/sdk-logs';
```

## `@opentelemetry/context-async-hooks`

### Removed: `AsyncHooksContextManager` context manager

`AsyncHooksContextManager` has been removed. Use `AsyncLocalStorageContextManager`, which is built on [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage), the recommended Node.js API for context propagation.

```ts
// before
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

// after
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
```

## `@opentelemetry/sdk-trace-base` (package removed)

Starting in Jun 2026, the `@opentelemetry/sdk-trace` package was created to replace the `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-trace-node`, and `@opentelemetry/sdk-trace-web` packages.
With the SDK 3.0 release, the `@opentelemetry/sdk-trace-base` package has been removed in favor of the `@opentelemetry/sdk-trace` package.

Roughly speaking `sdk-trace` is the same as `sdk-trace-base`, but with any reading of environment variables *removed*.

The specific API changes are as follows:

- **BasicTracerProvider -> TracerProvider** class name change.
  - The `generalLimits` constructor option is no longer supported.
    The caller must merge those limits into the `spanLimits` argument.
  - The following environment variables are no longer read for fallback values:
    - `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT`
    - `OTEL_ATTRIBUTE_COUNT_LIMIT`
    - `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT`
    - `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT`
    - `OTEL_SPAN_LINK_COUNT_LIMIT`
    - `OTEL_SPAN_EVENT_COUNT_LIMIT`
    - `OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT`
    - `OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT`
    - `OTEL_TRACES_SAMPLER`
    - `OTEL_TRACES_SAMPLER_ARG`
- **BatchSpanProcessor** no longer reads the following environment variables for fallback values:
  - `OTEL_BSP_MAX_EXPORT_BATCH_SIZE`
  - `OTEL_BSP_MAX_QUEUE_SIZE`
  - `OTEL_BSP_SCHEDULE_DELAY`
  - `OTEL_BSP_EXPORT_TIMEOUT`
- **BatchSpanProcessor** constructor signature has changed.
  - Before: `new BatchSpanProcessor(anExporter, otherOptions)`
  - After: `new BatchSpanProcessor({ exporter: anExporter, ...otherOptions })`
- **SimpleSpanProcessor** constructor signature has changed.
  - Before: `new SimpleSpanProcessor(anExporter)`
  - After: `new SimpleSpanProcessor({ exporter: anExporter, ...otherOptions })`

For [SDK environment variable support](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/) it is recommended that users use the [sdk-node package](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-sdk-node/).

> [!NOTE]
> Related issues and PRs:
> [#6775](https://github.com/open-telemetry/opentelemetry-js/pull/6775)
> [#6817](https://github.com/open-telemetry/opentelemetry-js/pull/6817)
> [#6504](https://github.com/open-telemetry/opentelemetry-js/pull/6504)

## `@opentelemetry/sdk-trace-node` (package removed)

Starting in Jun 2026, the `@opentelemetry/sdk-trace` package was created to replace the `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-trace-node`, and `@opentelemetry/sdk-trace-web` packages.
With the SDK 3.0 release, the `@opentelemetry/sdk-trace-node` package has been removed in favor of the `@opentelemetry/sdk-trace` package.

The sdk-trace-node package provided two primary features:

1. A `NodeTracerProvider#register(...)` method to register a context-manager and propagators.
   It is recommended that user code do this manually now.
2. Reading environment variables for some tracer provider defaults.
   It is recommended that user code use the [sdk-node](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-sdk-node/) package for environment variable-based or file-based SDK configuration.

```ts
// before
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
const tracerProvider = new NodeTracerProvider(/* ... */);
tracerProvider.register(/* ... */);

// after
import { context, propagation, trace } from '@opentelemetry/api';
import { TracerProvider } from '@opentelemetry/sdk-trace';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';

// Manually handle `OTEL_` envvars as necessary, or use the "sdk-node" package.
const tracerProvider = new TracerProvider(/* ... */);
trace.setGlobalTracerProvider(tracerProvider);
context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
propagation.setGlobalPropagator(new CompositePropagator({
  propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
}));
```

- sdk-trace-node [re-exported much of `sdk-trace-base`](https://github.com/open-telemetry/opentelemetry-js/blob/v2.11.0/packages/opentelemetry-sdk-trace-node/src/index.ts#L8-L37).
  See the [sdk-trace-base migration section above](#opentelemetrysdk-trace-base-package-removed).

> [!NOTE]
> Related issues and PRs:
> [#6775](https://github.com/open-telemetry/opentelemetry-js/pull/6775)
> [#6851](https://github.com/open-telemetry/opentelemetry-js/pull/6851)

## `@opentelemetry/sdk-trace-web` (package removed)

Starting in Jun 2026, the `@opentelemetry/sdk-trace` package was created to replace the `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-trace-node`, and `@opentelemetry/sdk-trace-web` packages.
With the SDK 3.0 release, the `@opentelemetry/sdk-trace-web` package has been removed in favor of the `@opentelemetry/sdk-trace` package.

- `WebTracerProvider` -> `TracerProvider`
  The WebTracerProvider added a single `.register(...)` method to register a context manager and propagators.  It is recommended that user code do this manually now.

```ts
// before
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
const tracerProvider = new WebTracerProvider(/* ... */);
tracerProvider.register(/* ... */);

// after
import { context, propagation, trace } from '@opentelemetry/api';
import { TracerProvider, StackContextManager } from '@opentelemetry/sdk-trace';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';

const tracerProvider = new TracerProvider(/* ... */);
trace.setGlobalTracerProvider(tracerProvider);

context.setGlobalContextManager(new StackContextManager().enable());

const propagator = new CompositePropagator({
  propagators: [
    new W3CTraceContextPropagator(),
    new W3CBaggagePropagator(),
  ],
});
propagation.setGlobalPropagator(propagator);
```

- sdk-trace-web also included [a number of instrumentation-related utilities](https://github.com/open-telemetry/opentelemetry-js/blob/v2.11.0/packages/opentelemetry-sdk-trace-web/src/index.ts#L9-L27).
  These have all been moved to the [web-common package](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/web-common).
  Those utilities have also *been deprecated*.
  It is recommended that web-related instrumentations avoid these implementations and, if needed, *copy* them.

- sdk-trace-web [re-exported much of `sdk-trace-base`](https://github.com/open-telemetry/opentelemetry-js/blob/v2.11.0/packages/opentelemetry-sdk-trace-web/src/index.ts#L28-L57).
  See the [sdk-trace-base migration section above](#opentelemetrysdk-trace-base-package-removed).

> [!NOTE]
> Related issues and PRs:
> [#6775](https://github.com/open-telemetry/opentelemetry-js/pull/6775)
> [#7058](https://github.com/open-telemetry/opentelemetry-js/pull/7058)

## `@opentelemetry/sdk-node`

### Removed: `NodeSDKConfiguration.logRecordProcessor`

The singular `logRecordProcessor` option on `NodeSDKConfiguration` has been removed. Use `logRecordProcessors` (array) instead.

```ts
// before
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

const sdk = new NodeSDK({
  logRecordProcessor: new SimpleLogRecordProcessor({ exporter }),
});

// after
const sdk = new NodeSDK({
  logRecordProcessors: [new SimpleLogRecordProcessor({ exporter })],
});
```

### Removed: `NodeSDKConfiguration.metricReader`

The singular `metricReader` option on `NodeSDKConfiguration` has been removed. Use `metricReaders` (array) instead.

```ts
// before
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  metricReader: new PeriodicExportingMetricReader({ exporter }),
});

// after
const sdk = new NodeSDK({
  metricReaders: [new PeriodicExportingMetricReader({ exporter })],
});
```

### Removed: `NodeSDKConfiguration.spanProcessor`

The singular `spanProcessor` option on `NodeSDKConfiguration` has been removed. Use `spanProcessors` (array) instead.

```ts
// before
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace';

const sdk = new NodeSDK({
  spanProcessor: new SimpleSpanProcessor({ exporter }),
});

// after
const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor({ exporter })],
});
```

### Removed: `tracing` namespace re-export

The deprecated namespace re-export `tracing` (re-exporting `@opentelemetry/sdk-trace-base`) has been removed from `@opentelemetry/sdk-node`.
As well, the sdk-trace-base package has been *removed*, in favor of the sdk-trace package.
See the [sdk-trace-base migration section above](#opentelemetrysdk-trace-base-package-removed).

```ts
// before
import { tracing } from '@opentelemetry/sdk-node';
const exporter = new tracing.ConsoleSpanExporter();

// after
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace';
const exporter = new ConsoleSpanExporter();
```

### Removed: `node` namespace re-export

The deprecated namespace re-export `node` (re-exporting `@opentelemetry/sdk-trace-node`) has been removed from `@opentelemetry/sdk-node`.
As well, the sdk-trace-node package has been *removed*, in favor of the sdk-trace package.
See the [sdk-trace-node migration section above](#-opentelemetrysdk-trace-node-package-removed).

```ts
// before
import { node } from '@opentelemetry/sdk-node';
const provider = new node.NodeTracerProvider();

// after
import { TracerProvider } from '@opentelemetry/sdk-trace';
// See sdk-trace-node section above for migration to sdk-trace.
```

### Removed: `api` and `contextBase` namespace re-exports

The namespace re-exports `api` and `contextBase` (both re-exporting `@opentelemetry/api`) have been removed from `@opentelemetry/sdk-node`. Import directly from `@opentelemetry/api`.

```ts
// before
import { api } from '@opentelemetry/sdk-node';
const tracer = api.trace.getTracer('my-lib');

import { contextBase } from '@opentelemetry/sdk-node';
const ctx = contextBase.context.active();

// after
import { trace, context } from '@opentelemetry/api';
const tracer = trace.getTracer('my-lib');
const ctx = context.active();
```

### Removed: `core` namespace re-export

The namespace re-export `core` (re-exporting `@opentelemetry/core`) has been removed from `@opentelemetry/sdk-node`. Import directly from `@opentelemetry/core`.

```ts
// before
import { core } from '@opentelemetry/sdk-node';
const propagator = new core.W3CTraceContextPropagator();

// after
import { W3CTraceContextPropagator } from '@opentelemetry/core';
const propagator = new W3CTraceContextPropagator();
```

### Removed: `logs` namespace re-export

The namespace re-export `logs` (re-exporting `@opentelemetry/sdk-logs`) has been removed from `@opentelemetry/sdk-node`. Import directly from `@opentelemetry/sdk-logs`.

```ts
// before
import { logs } from '@opentelemetry/sdk-node';
const processor = new logs.SimpleLogRecordProcessor({ exporter });

// after
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
const processor = new SimpleLogRecordProcessor({ exporter });
```

### Removed: `metrics` namespace re-export

The namespace re-export `metrics` (re-exporting `@opentelemetry/sdk-metrics`) has been removed from `@opentelemetry/sdk-node`. Import directly from `@opentelemetry/sdk-metrics`.

```ts
// before
import { metrics } from '@opentelemetry/sdk-node';
const reader = new metrics.PeriodicExportingMetricReader({ exporter });

// after
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
const reader = new PeriodicExportingMetricReader({ exporter });
```

### Removed: `resources` namespace re-export

The namespace re-export `resources` (re-exporting `@opentelemetry/resources`) has been removed from `@opentelemetry/sdk-node`. Import directly from `@opentelemetry/resources`.

```ts
// before
import { resources } from '@opentelemetry/sdk-node';
const resource = resources.resourceFromAttributes({ 'service.name': 'my-service' });

// after
import { resourceFromAttributes } from '@opentelemetry/resources';
const resource = resourceFromAttributes({ 'service.name': 'my-service' });
```
