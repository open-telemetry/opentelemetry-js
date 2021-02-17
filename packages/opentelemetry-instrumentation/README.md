# OpenTelemetry Instrumentation for web and node

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

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

export class MyPlugin extends InstrumentationBase {
  constructor(config: InstrumentationConfig = {}) {
    super('MyPlugin', VERSION, config);
  }

  /**
   * Init method will be called when the plugin is constructed.
   * It returns an `InstrumentationNodeModuleDefinition` which describes
   *   the node module to be instrumented and patched.
   * It may also return a list of `InstrumentationNodeModuleDefinition`s if
   *   the plugin should patch multiple modules or versions.
   */
  protected init() {
    const module = new InstrumentationNodeModuleDefinition<typeof module_name_to_be_patched>(
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

  private _addPatchingMethod(): InstrumentationNodeModuleFile<typeof module_name_to_be_patched> {
    const file = new InstrumentationNodeModuleFile<typeof module_name_to_be_patched>(
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

// Later

const myPLugin = new MyPlugin();
myPLugin.setTracerProvider(provider); // this is optional
myPLugin.setMeterProvider(meterProvider); // this is optional
myPLugin.enable();
// or use Auto Loader
```

## Usage in Web

```typescript
import {
  InstrumentationBase,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';

import { Instrumentation } from '@opentelemetry/instrumentation';

export class MyPlugin extends InstrumentationBase {
  constructor(config: InstrumentationConfig = {}) {
    super('MyPlugin', VERSION, config);
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

const myPLugin = new MyPlugin();
myPLugin.setTracerProvider(provider);
myPLugin.setMeterProvider(meterProvider);
myPLugin.enable();
// or use Auto Loader
```

## AutoLoader

Successor of loading plugins through TracerProvider "plugins" option.
It also supersedes PluginLoader for node. The old configurations usually looks like

### NODE - old way using TracerProvider

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');
const { B3Propagator } = require('@opentelemetry/propagator-b3');
const provider = new NodeTracerProvider({
  plugins: {
    http: { enabled: false },
  },
});
provider.register({
  propagator: new B3Propagator(),
});
```

### WEB - old way using TracerProvider

```javascript
const { WebTracerProvider } = require('@opentelemetry/web');
const { UserInteractionPlugin } = require('@opentelemetry/plugin-user-interaction');
const { XMLHttpRequestInstrumentation } = require('@opentelemetry/instrumentation-xml-http-request');
const { B3Propagator } = require('@opentelemetry/propagator-b3');
const provider = new WebTracerProvider({
  plugins: [
    new UserInteractionPlugin(),
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost/],
      propagateTraceHeaderCorsUrls: [
        'http://localhost:8090',
      ],
    }),
  ],
});
provider.register({
  propagator: new B3Propagator(),
});
```

After change it will look like this - mixing plugins and instrumentations together
All plugins will be bound to TracerProvider as well as instrumentations

### NODE - Auto Loader

```javascript
const { B3Propagator } = require('@opentelemetry/propagator-b3');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { GraphQLInstrumentation } = require('@opentelemetry/instrumentation-graphql');
const { NodeTracerProvider } = require('@opentelemetry/node');
const tracerProvider = new NodeTracerProvider();

registerInstrumentations({
  instrumentations: [
    new UserInteractionPlugin(),
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost/],
      propagateTraceHeaderCorsUrls: [
        'http://localhost:8090',
      ],
    }),
  ],
  meterProvider: meterProvider,
  tracerProvider: tracerProvider,
});

tracerProvider.register({
  propagator: new B3Propagator(),
});

```

### WEB - Auto Loader

```javascript
const { B3Propagator } = require('@opentelemetry/propagator-b3');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
const { UserInteractionPlugin } = require('@opentelemetry/plugin-user-interaction');
const { WebTracerProvider } = require('@opentelemetry/web');
const tracerProvider = new WebTracerProvider();

registerInstrumentations({
  instrumentations: [
    new GraphQLInstrumentation(),
    {
      plugins: {
        http: { enabled: false },
      },
    }
  ],
  meterProvider: meterProvider,
  tracerProvider: tracerProvider,
});

tracerProvider.register({
  propagator: new B3Propagator(),
});

```

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-instrumentation
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-instrumentation
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-instrumentation
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-instrumentation&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/instrumentation
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Finstrumentation.svg
