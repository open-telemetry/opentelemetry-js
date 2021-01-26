# OpenTelemetry Context Zone

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides *Zone Context Manager with bundled [zone-js]* for Web applications.
If you have your own [zone-js] please use [@opentelemetry/context-zone-peer-dep]
If you use Angular it means you already have the [zone-js] and you should use [@opentelemetry/context-zone-peer-dep]

## Installation

```bash
npm install --save @opentelemetry/context-zone
```

## Usage

```js
import { context, getSpan, setSpan } from '@opentelemetry/api';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const providerWithZone = new WebTracerProvider();
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register({
  contextManager: new ZoneContextManager()
});

// Example how the ZoneContextManager keeps the reference to the correct context during async operations
const webTracerWithZone = providerWithZone.getTracer('default');
const span1 = webTracerWithZone.startSpan('foo1');

context.with(setSpan(context.active(), span1), () => {
  console.log('Current span is span1', getSpan(context.active()) === span1);
  setTimeout(() => {
    const span2 = webTracerWithZone.startSpan('foo2');
    console.log('Current span is span1', getSpan(context.active()) === span1);
    context.with(setSpan(context.active(), span2), () => {
      console.log('Current span is span2', getSpan(context.active()) === span2);
      setTimeout(() => {
        console.log('Current span is span2', getSpan(context.active()) === span2);
      }, 500);
    });
    // there is a timeout which still keeps span2 active
    console.log('Current span is span2', getSpan(context.active()) === span2);
  }, 500);
  console.log('Current span is span1', getSpan(context.active()) === span1);
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
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-context-zone
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-context-zone
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-context-zone
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-web&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/context-zone
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcontext-zone.svg
[zone-js]: https://www.npmjs.com/package/zone.js
[@opentelemetry/context-zone-peer-dep]: https://www.npmjs.com/package/@opentelemetry/context-zone-peer-dep
