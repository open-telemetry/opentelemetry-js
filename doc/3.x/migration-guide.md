# Upgrade to OpenTelemetry JS SDK 3.x

This document covers **breaking changes** in each SDK 3.x package and shows how to migrate.
For background on the 3.0 release, see the [3.x announcement](announcement.md).

If you have questions, reach the OTel JS community on [#otel-js](https://cloud-native.slack.com/archives/C01NL1GRPQR) in the [CNCF Slack](https://slack.cncf.io/), [open a Discussion](https://github.com/open-telemetry/opentelemetry-js/issues/new?template=discussion.md), or join the weekly [OTel JS SIG call](https://docs.google.com/document/d/1tCyoQK49WVcE-x8oryZOTTToFm7sIeUhxFPm9g-qL1k/edit).

---

## Raised minimum Node.js version

The minimum supported Node.js version has been raised from `^18.19.0 || >=20.6.0` to `>=22.15.0` for all packages except `@opentelemetry/api`, `@opentelemetry/api-logs`, and `@opentelemetry/semantic-conventions`, which keep their existing, wider minimum versions. Node.js v18 and v20 reached end-of-life; upgrade your runtime to Node.js `>=22.15.0` before adopting SDK 3.0.

---

## `@opentelemetry/propagator-jaeger` (package removed)

The `@opentelemetry/propagator-jaeger` package has been removed. The Jaeger propagator is deprecated in favour of the W3C TraceContext propagator.

### Migrate to `W3CTraceContextPropagator`

> [!IMPORTANT]
> This migration requires updating **every service in your system** that sends or receives trace context. Switching only some services will break distributed traces — a service still emitting `uber-trace-id` headers will not be correlated with a service that only reads `traceparent`. Migrate all services together, or run both propagators in parallel using `CompositePropagator` during a transition period.
>
> If you cannot yet migrate all services, you may continue using `@opentelemetry/propagator-jaeger@^2` with SDK 3.x by registering it manually after SDK setup. However, `@opentelemetry/propagator-jaeger@^2` has a peer dependency of `@opentelemetry/api@>=1.0.0 <1.10.0`, so you will not be able to advance to `@opentelemetry/api@1.10.0` or later while it remains in use.

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

---

## `@opentelemetry/exporter-jaeger` (package removed)

The `@opentelemetry/exporter-jaeger` package has been removed. Jaeger has deprecated its custom Thrift collection protocols in favor of standard OpenTelemetry Protocol (OTLP).

### Migrate to OTLP Exporters

Jaeger natively supports receiving OpenTelemetry Protocol (OTLP) data. Replace `JaegerExporter` with `OTLPTraceExporter` using HTTP/JSON (via `@opentelemetry/exporter-trace-otlp-proto` or `@opentelemetry/exporter-trace-otlp-http`) or gRPC (via `@opentelemetry/exporter-trace-otlp-grpc`).

```ts
// before
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace';

const provider = new TracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
})));

// after (using OTLP Proto over HTTP)
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace';

const provider = new TracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
})));
```

---

## `@opentelemetry/instrumentation-http`

### Removed: `HttpInstrumentationConfig.serverName`

The `serverName` option on `HttpInstrumentationConfig` has been removed. It had no effect — stable HTTP semantic conventions do not include the `http.server_name` attribute. Remove the option from any `setConfig()` or constructor call.

```ts
// before
instrumentation.setConfig({
  serverName: 'my.server.name',
  // ... other options
});

// after
instrumentation.setConfig({
  // ... other options (serverName removed)
});
```

---

## `@opentelemetry/core`

### Removed: `getTimeOrigin()`

`getTimeOrigin()` was a thin wrapper around `performance.timeOrigin`. Use `performance.timeOrigin` directly.

```ts
// before
import { getTimeOrigin } from '@opentelemetry/core';
const origin = getTimeOrigin();

// after
const origin = performance.timeOrigin;
```

### Removed: `otperformance`

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

### Removed: `_globalThis`

`_globalThis` was a re-export of the built-in `globalThis`. Use `globalThis` directly.

```ts
// before
import { _globalThis } from '@opentelemetry/core';
const g = _globalThis;

// after
const g = globalThis;
```

### Removed: `unrefTimer()`

`unrefTimer()` was a small utility that called `.unref()` on a timer object. Call `.unref()` directly in your own code.

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

---

## `@opentelemetry/sdk-trace`

### Removed: `TracerProviderOptions.forceFlushTimeoutMillis`

`forceFlushTimeoutMillis` on `TracerProviderOptions` has been removed. Pass
instead. The default timeout is 30000ms.

```ts
// before
const provider = new TracerProvider({ forceFlushTimeoutMillis: 5000 });
await provider.forceFlush();

// after
const provider = new TracerProvider();
await provider.forceFlush({ timeoutMillis: 5000 });
```

---

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

---

## `@opentelemetry/context-async-hooks`

### Removed: `AsyncHooksContextManager` context manager

`AsyncHooksContextManager` is no longer used in the SDK and its the [recommended API](https://nodejs.org/api/async_context.html#class-asynclocalstorage) for context propagation.

```ts
// before
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

// after
import { AsynLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
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
  })
);
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
  spanProcessor: new SimpleSpanProcessor(exporter),
});

// after
const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
});
```

### Removed: `tracing` namespace re-export

The deprecated namespace re-export `tracing` (re-exporting `@opentelemetry/sdk-trace-base`) has been removed from `@opentelemetry/sdk-node`.
Import directly from the sdk-trace-base package.
<!-- TODO: replace this advice with a sdk-trace-base migration section once sdk-trace-base package is removed -->

```ts
// before
import { tracing } from '@opentelemetry/sdk-node';
const exporter = new tracing.ConsoleSpanExporter();

// after
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
const exporter = new ConsoleSpanExporter();
```

### Removed: `node` namespace re-export

The deprecated namespace re-export `node` (re-exporting `@opentelemetry/sdk-trace-node`) has been removed from `@opentelemetry/sdk-node`.
As well, the sdk-trace-node package has been *removed*, in favor of the sdk-trace package.
See the section on sdk-trace-node removal above.

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
const processor = new logs.SimpleLogRecordProcessor(exporter);

// after
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
const processor = new SimpleLogRecordProcessor(exporter);
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
