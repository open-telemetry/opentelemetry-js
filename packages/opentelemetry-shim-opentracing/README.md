# OpenTracing shim

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

See [examples/opentracing-shim](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/opentracing-shim) for a short example.

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-tracing
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-tracing
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-tracing
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-tracing&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/shim-opentracing
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fshim-opentracing.svg
