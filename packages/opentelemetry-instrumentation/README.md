# OpenTelemetry Instrumentation for web and node

[![Gitter chat][gitter-image]][gitter-url]
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
  Instrumentation,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
} from '@opentelemetry/instrumentation';

import * as plugin_name_to_be_pached from 'plugin_name_to_be_pached';

export class MyPlugin extends Instrumentation {
  constructor(config: api.InstrumentationConfig = {}) {
    super('MyPlugin', VERSION, config);
  }

  // init method is default method that needs to be defined where
  // definitions for patching should be defined. It will be then called
  // before enabling the plugin and loading
  protected _init() {
    const module = new InstrumentationNodeModuleDefinition<typeof plugin_name_to_be_pached>(
      'plugin_name_to_be_pached',
      ['1.*'],
       (exports) => {
        this._wrap(
          exports,
          'mainMethodName',
          this._patchMainMethodName()
        );
       },
       () => {
        this._unwrap(exports, 'mainMethodName');
       }
    );
    // in case you need to patch additional files - this is optional
    module.files.push(this._addPatchingMethod());

    return module;
  }

  private _addPatchingMethod(): InstrumentationNodeModuleFile<typeof plugin_name_to_be_pached> {
    const file = new InstrumentationNodeModuleFile<typeof plugin_name_to_be_pached>(
      'plugin_name_to_be_pached/src/some_file.js',
      (exports: typeof plugin_name_to_be_pached) => {
        this._wrap(
          exports,
          'methodName',
          this._patchMethodName()
        );
        return exports;
      },
      () => {
        this._unwrap(exports, 'methodName');
      }
    );
    return file;
  }

  private _patchMethodName(): (original) => any {
    const plugin = this;
    return function methodName(original) {
      return function patchMethodName(this: any): PromiseOrValue<plugin_name_to_be_pached.methodName> {
        console.log('methodName', arguments);
        return original.apply(this, arguments);
      };
    };
  }

  private _patchMainMethodName(): (original) => any {
    const plugin = this;
    return function mainMethodName(original) {
      return function patchMainMethodName(this: any): PromiseOrValue<plugin_name_to_be_pached.mainMethodName> {
        console.log('mainMethodName', arguments);
        return original.apply(this, arguments);
      };
    };
  }
}

// Later

const myPLugin = new MyPlugin();
myPLugin.setTracerProvider(provider);
myPLugin.setMeterProvider(meterProvider);
myPLugin.enable();
```

## Usage in Web

```typescript
import { Instrumentation } from '@opentelemetry/instrumentation';

export class MyPlugin extends Instrumentation {
  constructor(config: api.InstrumentationConfig = {}) {
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
```

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-instrumentation
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-instrumentation
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-instrumentation
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-instrumentation&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/instrumentation
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Finstrumentation.svg
