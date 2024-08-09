# OpenTelemetry Instrumentation for web and node

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

## Installation

```bash
npm install --save @opentelemetry/instrumentation
```

## Usage in Node

```typescript
import {
  InstrumentationBase,
  InstrumentationConfig,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
} from '@opentelemetry/instrumentation';

import type * as module_name_to_be_patched from 'module_name_to_be_patched';

export class MyInstrumentation extends InstrumentationBase {
  constructor(config: InstrumentationConfig = {}) {
    super('MyInstrumentation', VERSION, config);
  }

  /**
   * Init method will be called when the plugin is constructed.
   * It returns an `InstrumentationNodeModuleDefinition` which describes
   *   the node module to be instrumented and patched.
   * It may also return a list of `InstrumentationNodeModuleDefinition`s if
   *   the plugin should patch multiple modules or versions.
   */
  protected init() {
    const module = new InstrumentationNodeModuleDefinition(
      'module_name_to_be_patched',
      ['1.*'],
       this._onPatchMain,
       this._onUnPatchMain,
    );
    // in case you need to patch additional files - this is optional
    module.files.push(this._addPatchingMethod());

    return module;
    // you can also define more modules then just return an array of modules
    // return [module1, module2, ....]
  }

  private _onPatchMain(moduleExports: typeof module_name_to_be_patched) {
    this._wrap(
      moduleExports,
      'mainMethodName',
      this._patchMainMethodName()
    );
    return moduleExports;
  }

  private _onUnPatchMain(moduleExports: typeof module_name_to_be_patched) {
    this._unwrap(moduleExports, 'mainMethodName');
  }

  private _addPatchingMethod(): InstrumentationNodeModuleFile {
    const file = new InstrumentationNodeModuleFile(
      'module_name_to_be_patched/src/some_file.js',
      this._onPatchMethodName,
      this._onUnPatchMethodName,
    );
    return file;
  }

  private _onPatchMethodName(moduleExports: typeof module_name_to_be_patched) {
    this._wrap(
      moduleExports,
      'methodName',
      this._patchMethodName()
    );
    return moduleExports;
  }

  private _onUnPatchMethodName(moduleExports: typeof module_name_to_be_patched) {
    this._unwrap(moduleExports, 'methodName');
  }

  private _patchMethodName(): (original) => any {
    const plugin = this;
    return function methodName(original) {
      return function patchMethodName(this: any): PromiseOrValue<module_name_to_be_patched.methodName> {
        console.log('methodName', arguments);
        return original.apply(this, arguments);
      };
    };
  }

  private _patchMainMethodName(): (original) => any {
    const plugin = this;
    return function mainMethodName(original) {
      return function patchMainMethodName(this: any): PromiseOrValue<module_name_to_be_patched.mainMethodName> {
        console.log('mainMethodName', arguments);
        return original.apply(this, arguments);
      };
    };
  }
}

// Later, but before the module to instrument is required

const myInstrumentationn = new MyInstrumentation();
myInstrumentation.setTracerProvider(provider); // this is optional, only if global TracerProvider shouldn't be used
myInstrumentation.setMeterProvider(meterProvider); // this is optional
myInstrumentation.enable();
// or use Auto Loader
```

## Usage in Web

```typescript
import {
  InstrumentationBase,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';

import { Instrumentation } from '@opentelemetry/instrumentation';

export class MyInstrumentation extends InstrumentationBase {
  constructor(config: InstrumentationConfig = {}) {
    super('MyInstrumentation', VERSION, config);
  }

  private _patchOpen() {
    return (original: OpenFunction): OpenFunction => {
      const plugin = this;
      return function patchOpen(this: XMLHttpRequest, ...args): void {
        console.log('open', arguments);
        return original.apply(this, args);
      };
    };
  }

  public enable() {
    this._wrap(XMLHttpRequest.prototype, 'open', this._patchOpen());
  }
  public disable() {
    this._unwrap(XMLHttpRequest.prototype, 'open');
  }
}

// Later

const myInstrumentation = new MyInstrumentation();
myInstrumentation.setTracerProvider(provider); // this is optional, only if global TracerProvider shouldn't be used
myInstrumentation.setMeterProvider(meterProvider); // this is optional, only if global MeterProvider shouldn't be used
myInstrumentation.enable();
// or use Auto Loader
```

## AutoLoader

### NODE - Auto Loader

```javascript
const { B3Propagator } = require('@opentelemetry/propagator-b3');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');

const tracerProvider = new NodeTracerProvider();

tracerProvider.register({
  propagator: new B3Propagator(),
});

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
  ],
  //tracerProvider: tracerProvider, // optional, only if global TracerProvider shouldn't be used
  //meterProvider: meterProvider, // optional, only if global MeterProvider shouldn't be used
});

```

### WEB - Auto Loader

```javascript
const { B3Propagator } = require('@opentelemetry/propagator-b3');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { XMLHttpRequestInstrumentation } = require('@opentelemetry/instrumentation-xml-http-request');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');

const tracerProvider = new WebTracerProvider();

tracerProvider.register({
  propagator: new B3Propagator(),
});

registerInstrumentations({
  instrumentations: [
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost/],
      propagateTraceHeaderCorsUrls: [
        'http://localhost:8090',
      ],
    }),
  ],
  //tracerProvider: tracerProvider, // optional, only if global TracerProvider shouldn't be used
  //meterProvider: meterProvider, // optional, only if global MeterProvider shouldn't be used
});
```

## Selection of the used TracerProvider/MeterProvider

The `registerInstrumentations()` API allows to specify which `TracerProvider` and/or `MeterProvider` to use by the given options object.
If nothing is specified the global registered provider is used. Usually this is what most users want therefore it's recommended to keep this default.

There might be use case where someone has the need for more providers within an application. Please note that special care must be takes in such setups
to avoid leaking information from one provider to the other because there are a lot places where e.g. the global `ContextManager` or `Propagator` is used.

## Instrumentation for ECMAScript Modules (ESM) in Node.js (experimental)

Node.js uses a different module loader for ECMAScript Modules (ESM) vs. CommonJS (CJS).
A `require()` statement will cause Node.js to use the CommonJS module loader.
An `import()` statement will cause Node.js to use the ECMAScript module loader.

### TypeScript

Many TypeScript projects today are written using ESM syntax, regardless of how they are compiled.
In the `tsconfig.json`, there is an option to compile to ESM or CJS.
If the compiled code is ESM, those import statements will remain the same (e.g. `import { foo } from 'bar';`).
If the compiled code is CJS, those import statements will become `require()` statements (e.g. `const { foo } = require('bar');`)

For more explanation about CJS and ESM, see the [Node.js docs](https://nodejs.org/dist/latest-v18.x/docs/api/modules.html#enabling).

### Initializing the SDK

Instrumentation setup and configuration must be run before your application code.
If the SDK is initialized in a separate file (recommended), ensure it is imported first in application startup, or use the `--require` or `--import` flag during startup to preload the module.

For CJS, the `NODE_OPTIONS` for the startup command should include `--require ./instrumentation.js`.
For ESM, replace `--require` with `--import`.

### Instrumentation Hook

If your application is written in JavaScript as ESM, or it must compile to ESM from TypeScript, then a loader hook is required to properly patch instrumentation.
The custom hook for ESM instrumentation is `--experimental-loader=@opentelemetry/instrumentation/hook.mjs`.
This flag must be passed to the `node` binary, which is often done as a startup command and/or in the `NODE_OPTIONS` environment variable.

For SDK initialization and instrumentation hooking, the entire startup command should include the following `NODE_OPTIONS`:

| Node.js Version   | NODE_OPTIONS                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| >=16.0.0          | `--require ./instrumentation.cjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs` |
| 18.0.0            | ?                                                                                               |
| >=18.1.0 <18.19.0 | `--require ./instrumentation.cjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs` |
| >=18.19.0         | `--import ./instrumentation.mjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs`  |
| 20.x              | `--import ./instrumentation.mjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs`  |
| 22.x              | `--import ./instrumentation.mjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs`  |

A note on `--experimental-loader` per [Node.js docs](https://nodejs.org/api/cli.html#--experimental-loadermodule):

> This flag is discouraged and may be removed in a future version of Node.js. Please use `--import` with `register()` instead.

Experimental loader is intended to be deprecated, and will be replaced with something like `--import=@opentelemetry/instrumentation/hook.mjs`

<!--
TODO
import * as module from 'module'

module.register('import-in-the-middle/hook.mjs', import.meta.url)
 -->

## Limitations

Instrumentations for external modules (e.g. express, mongodb,...) hooks the `require` call or `import` statement. Therefore following conditions need to be met that this mechanism can work:

- Instrumentations are registered **before** the module to instrument is `require`ed (CJS only)
- modules are not included in a bundle. Tools like `esbuild`, `webpack`, ... usually have some mechanism to exclude specific modules from bundling

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/instrumentation
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Finstrumentation.svg
