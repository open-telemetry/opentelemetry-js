# OpenTelemetry Context Zone Peer Dependency

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides *Zone Context Manager with a peer dependency for [zone-js]* for Web applications.
If you use Angular you already have the [zone-js] and you should use this package.
If you don't have your own [zone-js] please use [@opentelemetry/context-zone]

## Installation

```bash
npm install --save @opentelemetry/context-zone-peer-dep
```

## Usage

```js
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracer } from '@opentelemetry/web';
import { ZoneContextManager } from '@opentelemetry/context-zone-peer-dep';

const webTracerWithZone = new WebTracer({
  contextManager: new ZoneContextManager()
});
webTracerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

// Example how the ZoneContextManager keeps the reference to the correct context during async operations
const span1 = webTracerWithZone.startSpan('foo1');
webTracerWithZone.withSpan(span1, () => {
  console.log('Current span is span1', webTracerWithZone.getCurrentSpan() === span1);
  setTimeout(() => {
    const span2 = webTracerWithZone.startSpan('foo2');
    console.log('Current span is span1', webTracerWithZone.getCurrentSpan() === span1);
    webTracerWithZone.withSpan(span2, () => {
      console.log('Current span is span2', webTracerWithZone.getCurrentSpan() === span2);
      setTimeout(() => {
        console.log('Current span is span2', webTracerWithZone.getCurrentSpan() === span2);
      }, 500);
    });
    // there is a timeout which still keeps span2 active
    console.log('Current span is span2', webTracerWithZone.getCurrentSpan() === span2);
  }, 500);
  console.log('Current span is span1', webTracerWithZone.getCurrentSpan() === span1);
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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-context-zone-peer-dep
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-context-zone-peer-dep
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-context-zone-peer-dep
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-web&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/context-zone-peer-dep
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcontext-zone-peer-dep.svg
[zone-js]: https://www.npmjs.com/package/zone.js
[@opentelemetry/context-zone]: https://www.npmjs.com/package/@opentelemetry/context-zone
