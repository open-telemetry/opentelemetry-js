# OpenTracing shim
[![Gitter chat][gitter-image]][gitter-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

OpenTracing shim allows existing OpenTracing instrumentation to report to OpenTelemetry

Note: Baggage is currently not progagated, see [issues/329](https://github.com/open-telemetry/opentelemetry-js/issues/329).

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


## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-basic-tracer
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-basic-tracer
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-basic-tracer
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-basic-tracer&type=dev
