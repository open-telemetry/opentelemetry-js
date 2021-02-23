# OpenTelemetry Propagator Jaeger

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

OpenTelemetry Jaeger propagator provides HTTP header propagation for systems that are using Jaeger HTTP header format.

Format:
{trace-id}:{span-id}:{parent-span-id}:{flags}

* {trace-id}
  * 64-bit or 128-bit random number in base16 format.
  * Can be variable length, shorter values are 0-padded on the left.
  * Value of 0 is invalid.

* {span-id}
  * 64-bit random number in base16 format.

* {parent-span-id}
  * Set to 0 because this field is deprecated.
* {flags}
  * One byte bitmap, as two hex digits.

Example of usage:

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');
const { JaegerHttpTracePropagator } = require('@opentelemetry/propagator-jaeger');

const provider = new NodeTracerProvider();
provider.register({
  // Use Jaeger propagator
  propagator: new JaegerHttpTracePropagator()
});
```

## Trace on Jaeger UI

![example image](jaeger-tracing.png)

## Useful links

* For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
* For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
* For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-propagator-jaeger
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-propagator-jaeger
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-propagator-jaeger
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-propagator-jaeger&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/propagator-jaeger
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fpropagator-jaeger.svg
