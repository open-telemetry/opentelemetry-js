# OpenTelemetry Propagator B3

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devdependencies-image]][devdependencies-url]
[![Apache License][license-image]][license-image]

The OpenTelemetry b3 propagator package provides multiple propagator
implementations for systems using the b3 context format. See the
[b3 specification][b3-spec] for complete details.

## B3 Formats

Single-Header Format:

```bash
b3: {TraceId}-{SpanId}-{SamplingState}-{ParentSpanId}
```

Multi-Header Format:

```bash
X-B3-TraceId: {TraceId}
X-B3-SpanId: {SpanId}
X-B3-ParentSpanId: {ParentSpanId}
X-B3-Sampled: {SamplingState}
```

- {TraceId}

  - Required
  - Encoded as 32 or 16 lower-hex characters
  - 16 character traceIds will be converted to 32 characters by left-padding
    with 0s to conform with the [OpenTelemetry specification][otel-spec-id-format]

- {SpanId}

  - Required
  - Encoded as 16 lower-hex characters

- {ParentSpanId}

  - Optional
  - Used to support the Zipkin functionality where the client and server spans
    that make up an HTTP request share the same id
  - Not propagated by this library

- {SamplingState} - Single-header

  - Optional
  - Valid values
    - 1 - Accept
    - 0 - Deny
    - d - Debug
    - Absent - Defer sampling decision

- {SamplingState} - Multi-header

  - Optional
  - Valid values
    - 1 - Accept
    - 0 - Deny

- {Flags} - Multi-header
  - Optional
  - Debug is encoded as `X-B3-Flags`: 1. Absent or any other value can be ignored. Debug implies an accept decision, so don't also send the `X-B3-Sampled` header.

## Propagator Implementations

### B3Propagator

The default `B3Propagator` implements b3 propagation according to the
[OpenTelemetry specification][otel-b3-requirements]. It extracts b3 context
from multi and single header encodings and injects context using the
single-header b3 encoding. The inject encoding can be changed to multi-header
via configuration.

Example usage (default):

```javascript
const api = require('@opentelemetry/api');
const { B3Propagator } = require('@opentelemetry/propagator-b3');

api.propagation.setGlobalPropagator(new B3Propagator());
```

Example usage (specify inject encoding):

```javascript
const api = require('@opentelemetry/api');
const { B3Propagator } = require('@opentelemetry/propagator-b3');

api.propagation.setGlobalPropagator(
  new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })
);
```

### B3SinglePropagator

If a distributed system only needs support for the b3 single-header
encoding it can use the `B3SinglePropagator` directly.

Example usage:

```javascript
const api = require('@opentelemetry/api');
const { B3SinglePropagator } = require('@opentelemetry/propagator-b3');

api.propagation.setGlobalPropagator(new B3SinglePropagator());
```

### B3MultiPropagator

If a distributed system only needs support for the b3 multi-header
encoding it can use the `B3MultiPropagator` directly.

Example usage:

```javascript
const api = require('@opentelemetry/api');
const { B3MultiPropagator } = require('@opentelemetry/propagator-b3');

api.propagation.setGlobalPropagator(new B3MultiPropagator());
```

### CompositePropagator

If a distributed system needs to support both single and multiple header
encodings for inject and extract the `B3SinglePropagator` and
`B3MultiPropagator` can be used in conjunction with a `CompositePropagator`.

Example usage:

```javascript
const api = require('@opentelemetry/api');
const { CompositePropagator } = require('@opentelemetry/core');
const {
  B3SinglePropagator,
  B3MultiPropagator,
} = require('@opentelemetry/propagator-b3');

api.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new B3SinglePropagator(), new B3MultiPropagator()],
  })
);
```

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js-contrib/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-propagator-jaeger
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-propagator-jaeger
[devdependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-propagator-jaeger
[devdependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-propagator-jaeger&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/propagator-jaeger
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fpropagator-jaeger.svg
[b3-spec]: https://github.com/openzipkin/b3-propagation
[otel-b3-requirements]: https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/context/api-propagators.md#b3-requirements
[otel-spec-id-format]: https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/api.md#retrieving-the-traceid-and-spanid
