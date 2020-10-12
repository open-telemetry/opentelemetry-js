# OpenTelemetry Propagator B3

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devdependencies-image]][devdependencies-url]
[![Apache License][license-image]][license-image]

OpenTelemetry B3 propagator provides HTTP header propagation for systems that are using B3 HTTP header format. See the [B3 specification][b3-spec] for complete details.

Single-Header Format:

```
b3: {TraceId}-{SpanId}-{SamplingState}-{ParentSpanId}
```

Multi-Header Format:

```
X-B3-TraceId: {TraceId}
X-B3-SpanId: {SpanId}
X-B3-ParentSpanId: {ParentSpanId}
X-B3-Sampled: {SamplingState}
```

- {TraceId}

  - Required
  - Encoded as 32 or 16 lower-hex characters

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

Example of usage:

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');
const { B3Propagator } = require('@opentelemetry/propagator-b3');

const provider = new NodeTracerProvider();
provider.register({
  // Use B3 propagator
  propagator: new B3Propagator(),
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
[license-url]: https://github.com/open-telemetry/opentelemetry-js-contrib/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-propagator-jaeger
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-propagator-jaeger
[devdependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-propagator-jaeger
[devdependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-propagator-jaeger&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/propagator-jaeger
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fpropagator-jaeger.svg
[b3-spec]: https://github.com/openzipkin/b3-propagation
