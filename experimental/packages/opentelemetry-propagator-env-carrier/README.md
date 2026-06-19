# OpenTelemetry Environment Propagation Carrier

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This package provides environment variable carrier helpers for use with
OpenTelemetry `TextMapPropagator` implementations.

It follows the OpenTelemetry
[Environment Variables as Context Propagation Carriers][env-carrier-spec]
specification. The carrier helpers are format-agnostic and treat values as
opaque strings. Propagators such as W3C Trace Context and W3C Baggage remain
responsible for choosing keys, parsing values, and validating propagation
formats.

## Usage

Use `EnvironmentSetter` to inject context into an environment map owned by your
application. Pass the map to `EnvironmentSetter`, and pass `undefined` as the
carrier when injecting. The map can then be passed to a child process.
`EnvironmentSetter` writes only to the map supplied to its constructor and does
not modify `process.env`.

```javascript
const { execFileSync } = require('node:child_process');
const { ROOT_CONTEXT, trace, TraceFlags } = require('@opentelemetry/api');
const { W3CTraceContextPropagator } = require('@opentelemetry/core');
const {
  EnvironmentSetter,
} = require('@opentelemetry/propagator-env-carrier');

const ctx = trace.setSpanContext(ROOT_CONTEXT, {
  traceId: '0102030405060708090a0b0c0d0e0f10',
  spanId: '0102030405060708',
  traceFlags: TraceFlags.SAMPLED,
});
const env = { ...process.env };
const propagator = new W3CTraceContextPropagator();

propagator.inject(ctx, undefined, new EnvironmentSetter(env));

const output = execFileSync(
  process.execPath,
  ['-e', 'process.stdout.write(process.env.TRACEPARENT ?? "")'],
  { env, encoding: 'utf8' }
);

console.log(output);
// 00-0102030405060708090a0b0c0d0e0f10-0102030405060708-01
```

Use `EnvironmentGetter` during process startup to extract context that was
provided through environment variables. It reads from its own snapshot, so pass
`undefined` as the carrier when extracting.

```javascript
const { ROOT_CONTEXT, trace } = require('@opentelemetry/api');
const { W3CTraceContextPropagator } = require('@opentelemetry/core');
const {
  EnvironmentGetter,
} = require('@opentelemetry/propagator-env-carrier');

const propagator = new W3CTraceContextPropagator();
const context = propagator.extract(
  ROOT_CONTEXT,
  undefined,
  new EnvironmentGetter()
);
const spanContext = trace.getSpanContext(context);

console.log(spanContext.traceId);
// 0102030405060708090a0b0c0d0e0f10
```

`EnvironmentGetter` snapshots `process.env` when it is constructed. Later
changes to `process.env` are not reflected in that getter. Only environment
variables whose names are already normalized are included in the snapshot.

## Key Normalization

Environment variable names used for propagation are normalized by:

- replacing an empty name with a single underscore,
- uppercasing ASCII letters,
- replacing every character that is not an ASCII letter, digit, or underscore
  with an underscore,
- prefixing the name with an underscore if it would otherwise start with an
  ASCII digit.

For example, `traceparent` becomes `TRACEPARENT`, `trace-state` becomes
`TRACE_STATE`, and `1abc` becomes `_1ABC`.

`EnvironmentSetter` always writes normalized key names to its environment map.
`EnvironmentGetter` normalizes the requested propagator key and reads the
corresponding normalized environment variable name from its snapshot. Its
`keys()` method returns only environment variable names that are already
normalized. For example, a propagator request for `x-b3-traceid` matches
`X_B3_TRACEID` from `process.env`, but does not match `x-b3-traceid`.

Name collisions after normalization should be avoided. For example,
`trace-state` and `TRACE_STATE` both normalize to `TRACE_STATE`. When injecting,
later writes to the same normalized name replace earlier values in the target
map.

## Useful links

- OpenTelemetry Environment Variables as Context Propagation Carriers specification:
  <https://opentelemetry.io/docs/specs/otel/context/env-carriers/>
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[env-carrier-spec]: https://opentelemetry.io/docs/specs/otel/context/env-carriers/
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/propagator-env-carrier
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fpropagator-env-carrier.svg
