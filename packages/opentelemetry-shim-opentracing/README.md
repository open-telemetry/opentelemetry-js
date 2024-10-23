# OpenTracing shim

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

OpenTracing shim allows existing OpenTracing instrumentation to report to OpenTelemetry

## Installation

```bash
npm install --save @opentelemetry/shim-opentracing
```

## Usage

Use the TracerShim wherever you initialize your OpenTracing tracers.

```javascript
const opentracing = require('opentracing');

// Old tracer initialization.
const tracer = myOpenTracingTracer(...);
opentracing.initGlobalTracer(tracer);

// New tracer initialization.
import { TracerShim } from '@opentelemetry/shim-opentracing';

const tracer = myOpenTelemetryTracer(...)
opentracing.initGlobalTracer(new TracerShim(tracer));

```

Optionally, you can specify propagators to be used for the OpenTracing `TextMap` and `HttpHeaders` formats:

```javascript
var b3Propagator = new B3Propagator();
new TracerShim(tracer, {
  textMapPropagator: b3Propagator,
  httpHeadersPropagator: b3Propagator
})
```

If propagators are not specified, OpenTelemetry's global propagator will be used.

See [examples/opentracing-shim](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentracing-shim) for a short example.

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

## Limitation

The OpenTracing shim does not currently include a scope manager.
This feature was never implemented in OpenTracing JS therefore the
shim does not provide that feature.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/shim-opentracing
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fshim-opentracing.svg
