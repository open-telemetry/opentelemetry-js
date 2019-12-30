# OpenTracing shim
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

OpenTracing shim allows existing OpenTracing instrumentation to report to OpenTelemetry

Note: Baggage is currently not propagated, see [issues/329](https://github.com/open-telemetry/opentelemetry-js/issues/329).

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

See [examples/opentracing-shim](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/opentracing-shim) for a short example.


## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-tracing
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-tracing
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-tracing
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-tracing&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/shim-opentracing
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fshim-opentracing.svg
