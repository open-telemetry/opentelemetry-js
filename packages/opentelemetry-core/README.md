# OpenTelemetry Core

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This package provides default implementations of the OpenTelemetry API for trace and metrics. It's intended for use both on the server and in the browser.

## Built-in Implementations

- [OpenTelemetry Core](#opentelemetry-core)
  - [Built-in Implementations](#built-in-implementations)
    - [Built-in Propagators](#built-in-propagators)
      - [HttpTraceContext Propagator](#httptracecontext-propagator)
      - [B3 Propagator](#b3-propagator)
      - [Composite Propagator](#composite-propagator)
      - [Correlation Context Propagator](#correlation-context-propagator)
    - [Built-in Sampler](#built-in-sampler)
      - [Always Sampler](#always-sampler)
      - [Never Sampler](#never-sampler)
      - [Probability Sampler](#probability-sampler)
  - [Useful links](#useful-links)
  - [License](#license)

### Built-in Propagators

#### HttpTraceContext Propagator

OpenTelemetry provides a text-based approach to propagate context to remote services using the [W3C Trace Context](https://www.w3.org/TR/trace-context/) HTTP headers.

```js
const api = require("@opentelemetry/api");
const { HttpTraceContext } = require("@opentelemetry/core");

/* Set Global Propagator */
api.propagation.setGlobalPropagator(new HttpTraceContext());
```

#### B3 Propagator

This is propagator for the B3 HTTP header format, which sends a `SpanContext` on the wire in an HTTP request, allowing other services to create spans with the right context. Based on: <https://github.com/openzipkin/b3-propagation>

```js
const api = require("@opentelemetry/api");
const { B3Propagator } = require("@opentelemetry/core");

/* Set Global Propagator */
api.propagation.setGlobalPropagator(new B3Propagator());
```

#### Composite Propagator

Combines multiple propagators into a single propagator.

> This is used as a default Propagator

```js
const api = require("@opentelemetry/api");
const { CompositePropagator } = require("@opentelemetry/core");

/* Set Global Propagator */
api.propagation.setGlobalPropagator(new CompositePropagator());
```

#### Correlation Context Propagator

Provides a text-based approach to propagate [correlation context](https://w3c.github.io/correlation-context/) to remote services using the [OpenTelemetry CorrelationContext Propagation](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/correlationcontext/api.md#header-name) HTTP headers.

```js
const api = require("@opentelemetry/api");
const { HttpCorrelationContext } = require("@opentelemetry/core");

/* Set Global Propagator */
api.propagation.setGlobalPropagator(new HttpCorrelationContext());
```

### Built-in Sampler

Sampler is used to make decisions on `Span` sampling.

#### AlwaysOn

Samples every trace regardless of upstream sampling decisions.

> This is used as a default Sampler

```js
const { NodeTracerProvider } = require("@opentelemetry/node");
const { AlwaysOnSampler } = require("@opentelemetry/core");

const tracerProvider = new NodeTracerProvider({
  sampler: new AlwaysOnSampler()
});
```

#### AlwaysOff

Doesn't sample any trace, regardless of upstream sampling decisions.

```js
const { NodeTracerProvider } = require("@opentelemetry/node");
const { AlwaysOffSampler } = require("@opentelemetry/core");

const tracerProvider = new NodeTracerProvider({
  sampler: new AlwaysOffSampler()
});
```

#### TraceIdRatioBased

Samples some percentage of traces, calculated deterministically using the trace ID.
Any trace that would be sampled at a given percentage will also be sampled at any higher percentage.

The `TraceIDRatioSampler` may be used with the `ParentBasedSampler` to respect the sampled flag of an incoming trace.

```js
const { NodeTracerProvider } = require("@opentelemetry/node");
const { TraceIdRatioBasedSampler } = require("@opentelemetry/core");

const tracerProvider = new NodeTracerProvider({
  // See details of ParentBasedSampler below
  sampler: new ParentBasedSampler({
    // Trace ID Ratio Sampler accepts a positional argument
    // which represents the percentage of traces which should
    // be sampled.
    root: new TraceIdRatioBasedSampler(0.5)
  });
});
```

#### ParentBasedSampler

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

|Parent| parent.isRemote() | parent.isSampled()| Invoke sampler|
|--|--|--|--|
|absent| n/a | n/a |`root()`|
|present|true|true|`remoteParentSampled()`|
|present|true|false|`remoteParentNotSampled()`|
|present|false|true|`localParentSampled()`|
|present|false|false|`localParentNotSampled()`|

```js
const { NodeTracerProvider } = require("@opentelemetry/node");
const { ParentBasedSampler, AlwaysOffSampler, TraceIdRatioBasedSampler } = require("@opentelemetry/core");

const tracerProvider = new NodeTracerProvider({
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

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-core
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-core
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-core
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-core&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/core
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcore.svg
