# Upgrade to OpenTelemetry JS SDK 3.x

This document covers **breaking changes** in each SDK 3.x package and shows how to migrate.
For background on the 3.0 release, see the [3.x announcement](announcement.md).

If you have questions, reach the OTel JS community on [#otel-js](https://cloud-native.slack.com/archives/C01NL1GRPQR) in the [CNCF Slack](https://slack.cncf.io/), [open a Discussion](https://github.com/open-telemetry/opentelemetry-js/issues/new?template=discussion.md), or join the weekly [OTel JS SIG call](https://docs.google.com/document/d/1tCyoQK49WVcE-x8oryZOTTToFm7sIeUhxFPm9g-qL1k/edit).

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

## `@opentelemetry/propagator-jaeger` (package removed)

The `@opentelemetry/propagator-jaeger` package has been removed. The Jaeger propagator is [deprecated by the OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/context/api-propagators/#propagators-distribution) in favour of the W3C TraceContext propagator.

### Migrate to `W3CTraceContextPropagator`

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

### `OTEL_PROPAGATORS=jaeger` env var

The `"jaeger"` value is no longer recognised by `@opentelemetry/sdk-node`. Replace it with `"tracecontext"`:

```sh
# before
OTEL_PROPAGATORS=tracecontext,baggage,jaeger

# after
OTEL_PROPAGATORS=tracecontext,baggage
```

### `@opentelemetry/sdk-node` configuration object

If you used the `jaeger` key in the `propagator.composite` configuration array, replace it with `tracecontext`:

```ts
// before
const sdk = new NodeSDK({
  textMapPropagator: createPropagatorFromConfig({
    composite: [{ tracecontext: null }, { baggage: null }, { jaeger: null }],
  }),
});

// after
const sdk = new NodeSDK({
  textMapPropagator: createPropagatorFromConfig({
    composite: [{ tracecontext: null }, { baggage: null }],
  }),
});
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
