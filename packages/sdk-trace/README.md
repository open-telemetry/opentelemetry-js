# OpenTelemetry Tracing SDK

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This module contains the Trace SDK of [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js).

Used standalone, this module provides methods for manual instrumentation of code, offering full control over span creation for client-side JavaScript (browser) and Node.js.

It does **not** provide automated instrumentation of known libraries, context propagation or distributed-context out-of-the-box.

## Installation

```bash
npm install --save @opentelemetry/api
npm install --save @opentelemetry/sdk-trace
```

## Usage

```js
const { trace } = require('@opentelemetry/api');
const { TracerProvider } = require('@opentelemetry/sdk-trace');

// To start a trace, you first need to initialize the Tracer provider.
// NOTE: The default OpenTelemetry tracer provider does not record any tracing information.
//       Registering a working tracer provider allows the API methods to record traces.
trace.setGlobalTracerProvider(new TracerProvider(/* ... */));

// Important: requires a context manager and propagator to be registered manually.
// propagation.setGlobalPropagator(propagator);     // replace `propagator` with your `TextMapPropagator`, for example: `W3CTraceContextPropagator` from `@openetelemetry/core`
// context.setGlobalContextManager(contextManager); // replace `contextManager` with your `ContextManager`: `AsyncLocalStorageContextManager` from `@openetelemetry/async-hooks`

// To create a span in a trace, we used the global singleton tracer to start a new span.
const span = trace.getTracer('default').startSpan('foo');

// Set a span attribute
span.setAttribute('key', 'value');

// We must end the spans so they become available for exporting.
span.end();
```

## Built-in Samplers

Sampler is used to make decisions on `Span` sampling.

### AlwaysOn Sampler

Samples every trace regardless of upstream sampling decisions.

> This is used as a default Sampler

```js
const { AlwaysOnSampler, TracerProvider } = require("@opentelemetry/sdk-trace");

const tracerProvider = new TracerProvider({
  sampler: new AlwaysOnSampler()
});
```

### AlwaysOff Sampler

Doesn't sample any trace, regardless of upstream sampling decisions.

```js
const { AlwaysOffSampler, TracerProvider } = require("@opentelemetry/sdk-trace");

const tracerProvider = new TracerProvider({
  sampler: new AlwaysOffSampler()
});
```

### TraceIdRatioBased Sampler

Samples some percentage of traces, calculated deterministically using the trace ID.
Any trace that would be sampled at a given percentage will also be sampled at any higher percentage.

The `TraceIDRatioSampler` may be used with the `ParentBasedSampler` to respect the sampled flag of an incoming trace.

```js
const {
  TracerProvider,
  TraceIdRatioBasedSampler,
} = require("@opentelemetry/sdk-trace");

const tracerProvider = new TracerProvider({
  // See details of ParentBasedSampler below
  sampler: new ParentBasedSampler({
    // Trace ID Ratio Sampler accepts a positional argument
    // which represents the percentage of traces which should
    // be sampled.
    root: new TraceIdRatioBasedSampler(0.5)
  });
});
```

### ParentBased Sampler

- This is a composite sampler. `ParentBased` helps distinguished between the
following cases:
  - No parent (root span).
  - Remote parent with `sampled` flag `true`
  - Remote parent with `sampled` flag `false`
  - Local parent with `sampled` flag `true`
  - Local parent with `sampled` flag `false`

Required parameters:

- `root(Sampler)` - Sampler called for spans with no parent (root spans)

Optional parameters:

- `remoteParentSampled(Sampler)` (default: `AlwaysOn`)
- `remoteParentNotSampled(Sampler)` (default: `AlwaysOff`)
- `localParentSampled(Sampler)` (default: `AlwaysOn`)
- `localParentNotSampled(Sampler)` (default: `AlwaysOff`)

|Parent|parent.isRemote()|parent.isSampled()|Invoke sampler|
|---|---|---|---|
|absent|n/a|n/a|`root()`|
|present|true|true|`remoteParentSampled()`|
|present|true|false|`remoteParentNotSampled()`|
|present|false|true|`localParentSampled()`|
|present|false|false|`localParentNotSampled()`|

```js
const {
  AlwaysOffSampler,
  TracerProvider,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} = require("@opentelemetry/sdk-trace");

const tracerProvider = new TracerProvider({
  sampler: new ParentBasedSampler({
    // By default, the ParentBasedSampler will respect the parent span's sampling
    // decision. This is configurable by providing a different sampler to use
    // based on the situation. See configuration details above.
    //
    // This will delegate the sampling decision of all root traces (no parent)
    // to the TraceIdRatioBasedSampler.
    // See details of TraceIdRatioBasedSampler above.
    root: new TraceIdRatioBasedSampler(0.5)
  })
});
```

## Example

See [examples/basic-tracer-node](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/basic-tracer-node) for an end-to-end example, including exporting created spans.

## Migrating from `sdk-trace-*` packages

This `sdk-trace` package is intended as the replacement for the `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-trace-node`, and `@opentelemetry/sdk-trace-web`.
It *removes* some functionality from those packages that better live elsewhere.

### Migrating from sdk-trace-web

**`WebTracerProvider` -> `TracerProvider`.**
The WebTracerProvider added a single `.register(...)` method to register a context manager and propagators.
It is recommended that user code do this manually now.

```ts
// -- Before
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
const tracerProvider = new WebTracerProvider(/* ... */);
tracerProvider.register(/* ... */);

// -- After
import { context, propagation, trace } from '@opentelemetry/api';
import { TracerProvider } from '@opentelemetry/sdk-trace';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';

const tracerProvider = new TracerProvider(/* ... */);
trace.setGlobalTracerProvider(tracerProvider);

// Whether and which context manager to use in the browser is out of scope
// for this doc.
const contextManager = ...;
context.setGlobalContextManager(contextManager);

const propagator = new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
    ],
  })
);
propagation.setGlobalPropagator(propagator);
```

See "Migrating from sdk-trace-base" below for some changes to the `TracerProvider` constructor options.

**Additional utilities in sdk-trace-web -> ???.**
There are a number of additional [utilities in sdk-trace-web](https://github.com/open-telemetry/opentelemetry-js/blob/v2.7.1/packages/opentelemetry-sdk-trace-web/src/index.ts#L8-L27).
It has generally been agreed that these better belong elsewhere,
perhaps in [`@opentelemetry/browser-instrumentation`](https://github.com/open-telemetry/opentelemetry-browser/tree/main/packages/instrumentation/src/utils).
However, [many utilities have not yet been migrated](https://github.com/open-telemetry/opentelemetry-js/issues/6591).

### Migrating from sdk-trace-node

**`NodeTracerProvider` -> `BasicTracerProvider` -> `TracerProvider`.**
NodeTracerProvider added a single `.register(...)` method to register a context manager and propagators.
It is recommended that user code do this manually now.
BasicTracerProvider (in sdk-trace-base) reads environment variables for some tracer provider defaults.
It is recommended that user code use the [sdk-node](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-sdk-node/) or [configuration](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/configuration/) packages for environment variable-based or file-based SDK configuration.

```ts
// -- Before
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
const tracerProvider = new NodeTracerProvider(/* ... */);
tracerProvider.register(/* ... */);

// -- After (using low-level primitives)
import { context, propagation, trace } from '@opentelemetry/api';
import { TracerProvider } from '@opentelemetry/sdk-trace';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';

// Manually handle `OTEL_` envvars as necessary, or see "sdk-node" package docs.
const tracerProvider = new TracerProvider(/* ... */);
trace.setGlobalTracerProvider(tracerProvider);

import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
context.setGlobalContextManager(new AsyncLocalStorageContextManager());

const propagator = new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
    ],
  })
);
propagation.setGlobalPropagator(propagator);
```

See "Migrating from sdk-trace-base" below for some changes to the `TracerProvider` constructor options.

### Migrating from sdk-trace-base

Roughly speaking `sdk-trace` is `sdk-trace-base` with any reading of environment variables *removed*.

The specific API changes are as follows:

- **BasicTracerProvider -> TracerProvider** class name change
  - The `generalLimits` constructor option is no longer supported.
    The caller must merge those limits into the `spanLimits` argument.
  - The following environment variables are no longer read for fallback values:
    - OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT
    - OTEL_ATTRIBUTE_COUNT_LIMIT
    - OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT
    - OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT
    - OTEL_SPAN_LINK_COUNT_LIMIT
    - OTEL_SPAN_EVENT_COUNT_LIMIT
    - OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT
    - OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT
    - OTEL_TRACES_SAMPLER
    - OTEL_TRACES_SAMPLER_ARG
- **BatchSpanProcessor** no longer reads the following environment variables for fallback values:
  - OTEL_BSP_MAX_EXPORT_BATCH_SIZE
  - OTEL_BSP_MAX_QUEUE_SIZE
  - OTEL_BSP_SCHEDULE_DELAY
  - OTEL_BSP_EXPORT_TIMEOUT

For [SDK environment variable support](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/) it is recommended that users use the [sdk-node package](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-sdk-node/).

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sdk-trace
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsdk-trace.svg
