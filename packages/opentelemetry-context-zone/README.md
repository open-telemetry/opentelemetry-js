# OpenTelemetry Context Zone

[![NPM Published Version][npm-img]][npm-url]
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
import { context, trace } from '@opentelemetry/api';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const providerWithZone = new WebTracerProvider();
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
providerWithZone.register({
  contextManager: new ZoneContextManager()
});

// Example how the ZoneContextManager keeps the reference to the correct context during async operations
const webTracerWithZone = providerWithZone.getTracer('default');
const span1 = webTracerWithZone.startSpan('foo1');

context.with(trace.setSpan(context.active(), span1), () => {
  console.log('Current span is span1', trace.getSpan(context.active()) === span1);
  setTimeout(() => {
    const span2 = webTracerWithZone.startSpan('foo2');
    console.log('Current span is span1', trace.getSpan(context.active()) === span1);
    context.with(trace.setSpan(context.active(), span2), () => {
      console.log('Current span is span2', trace.getSpan(context.active()) === span2);
      setTimeout(() => {
        console.log('Current span is span2', trace.getSpan(context.active()) === span2);
      }, 500);
    });
    // there is a timeout which still keeps span2 active
    console.log('Current span is span2', trace.getSpan(context.active()) === span2);
  }, 500);
  console.log('Current span is span1', trace.getSpan(context.active()) === span1);
});

```

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/context-zone
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcontext-zone.svg
[zone-js]: https://www.npmjs.com/package/zone.js
[@opentelemetry/context-zone-peer-dep]: https://www.npmjs.com/package/@opentelemetry/context-zone-peer-dep
