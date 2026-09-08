# Upgrade to OpenTelemetry JS SDK 3.x

This document covers **breaking changes** in each SDK 3.x package and shows how to migrate.
For background on the 3.0 release, see the [3.x announcement](announcement.md).

If you have questions, reach the OTel JS community on [#otel-js](https://cloud-native.slack.com/archives/C01NL1GRPQR) in the [CNCF Slack](https://slack.cncf.io/), [open a Discussion](https://github.com/open-telemetry/opentelemetry-js/issues/new?template=discussion.md), or join the weekly [OTel JS SIG call](https://docs.google.com/document/d/1tCyoQK49WVcE-x8oryZOTTToFm7sIeUhxFPm9g-qL1k/edit).

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
