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

## `async`/`await` Limitations & Build Configuration

`ZoneContextManager` relies on [zone-js] to track asynchronous context by monkey-patching asynchronous APIs (such as `Promise`, `setTimeout`, and DOM event listeners).

In modern JavaScript runtimes (`ES2017+`), native `async`/`await` uses native engine-level microtasks that bypass the monkey-patched `Promise` implementation of `zone.js`. Consequently, the execution context is lost after `await` calls (particularly after sequential `await` expressions).

To preserve context across `await` expressions, you do not need to transpile your entire codebase down to ES2015. Instead, configure your bundler or compiler to downlevel only `async`/`await` and async generator syntax:

- **esbuild / Vite / tsup**:
  Configure `supported` in your build configuration:

  ```js
  // vite.config.js / esbuild options / tsup.config.ts
  {
    esbuild: {
      supported: {
        'async-await': false,
        'async-generator': false,
      },
    },
  }
  ```

- **TypeScript (`tsconfig.json`)**:
  Set `"target": "ES2016"` (or lower) so TypeScript transforms `async`/`await` into generator helpers while preserving other modern language features:

  ```json
  {
    "compilerOptions": {
      "target": "ES2016"
    }
  }
  ```

- **Babel**:
  Add `@babel/plugin-transform-async-to-generator` to your Babel configuration plugins.

- **Angular**:
  Angular CLI projects using `zone.js` handle async/await downleveling automatically when `zone.js` is included in your polyfills.

> [!NOTE]
> Native asynchronous context tracking in browsers without transpilation is tracked by the [TC39 AsyncContext proposal](https://github.com/tc39/proposal-async-context).

## Usage

```js
import { context, trace } from '@opentelemetry/api';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const providerWithZone = new TracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())]
});
context.setGlobalContextManager(new ZoneContextManager().enable());
trace.setGlobalTracerProvider(providerWithZone);


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
