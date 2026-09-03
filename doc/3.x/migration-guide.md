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
