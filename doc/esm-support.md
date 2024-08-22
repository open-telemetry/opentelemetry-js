# ECMAScript Modules vs. CommonJS

Node.js uses a different module loader for ECMAScript Modules (ESM) vs. CommonJS (CJS).
To verify whether your application is ESM or CJS, refer to [Node.js docs for Determining Module System](https://nodejs.org/api/packages.html#determining-module-system).

An `.mjs` extension or `type:module` in the built app's `package.json` indicates the app is ESM.

**Much of OpenTelemetry JS documentation is written assuming the compiled application is run as CJS.**
ESM support is ongoing; a few adjustments are needed for configuration and startup commands.

For more explanation about CJS and ESM, see the [Node.js docs](https://nodejs.org/api/modules.html#enabling).

## TypeScript

Many TypeScript projects today are written using ESM syntax, regardless of how they are compiled.
In the `tsconfig.json`, there is an option to compile to ESM or CJS.
If the compiled code is ESM, those import statements will remain the same (e.g. `import { foo } from 'bar';`).
If the compiled code is CJS, those import statements will become `require()` statements (e.g. `const { foo } = require('bar');`)

## Initializing the SDK

Instrumentation setup and configuration must be run before your application code.
If the SDK is initialized in a separate file (recommended), ensure it is imported first in application startup, or use the `--require` or `--import` flag during startup to preload the module.

For CJS, the `NODE_OPTIONS` for the startup command should include `--require ./telemetry.js`.

For ESM, minimum Node.js version of `18.19.0` is required.
The `NODE_OPTIONS` for the startup command should include `--import ./telemetry.js`.

## Instrumentation Hook Required for ESM

If your application is written in JavaScript as ESM, or compiled to ESM from TypeScript, then a loader hook is required to properly patch instrumentation.
The custom hook for ESM instrumentation is `--experimental-loader=@opentelemetry/instrumentation/hook.mjs`.
This flag must be passed to the `node` binary, which is often done as a startup command and/or in the `NODE_OPTIONS` environment variable.

### Additional Notes on Experimental Loaders

Though the OpenTelemetry loader currently relies on `import-in-the-middle`, direct usage of `import-in-the-middle/hook.mjs` may cease to work in the future.
The only currently supported loader hook is `@opentelemetry/instrumentation/hook.mjs`.

**Note:** Eventually the recommendation for how to setup OpenTelemetry for usage with ESM will change to no longer require `--experimental-loader=@opentelemetry/instrumentation/hook.mjs`.
Instead the bootstrap code (in `./telemetry.js`) will use Node.js's newer `module.register(...)`.
Refer to this [issue](https://github.com/open-telemetry/opentelemetry-js/issues/4933) for details.

Because of ongoing issues with loaders running TypeScript code as ESM in development environments, results may vary.

To use `ts-node` to run the uncompiled TypeScript code, the module must be CJS.
To use `tsx` to run the uncompiled TypeScript code as ESM, the `--import` flag must be used.

## Using the Zero Code Option with `auto-instrumentations-node`

The `auto-instrumentations-node` package contains a `register` entry-point that can be used with `--require` or `--import` to setup and start the SDK easily, without application code changes.
For ESM, the package also requires the usage of the loader hook.

Startup command for CJS:

```sh
node --require @opentelemetry/auto-instrumentations-node/register app.js
```

Startup command for ESM:

```sh
node --experimental-loader=@opentelemetry/instrumentation/hook.mjs --import @opentelemetry/auto-instrumentations-node/register app.js
```

## Examples

### Example Written in JavaScript as CJS

```javascript
/*telemetry.cjs*/
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

Startup command:

```sh
node --require ./telemetry.cjs app.js
```

### Example Written in JavaScript as ESM or TypeScript

```typescript
/*telemetry.ts | telemetry.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

Startup command for compiled CJS:

```sh
node --require ./telemetry.js app.js
```

Startup command for compiled ESM:

```sh
node --experimental-loader=@opentelemetry/instrumentation/hook.mjs --import ./telemetry.js app.js
```

### ESM Options for Different Versions of Node.js

The entire startup command should include the following `NODE_OPTIONS`:

| Node.js Version   | NODE_OPTIONS                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------- |
| 16.x              | `--require ./telemetry.cjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs` |
| >=18.1.0 <18.19.0 | `--require ./telemetry.cjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs` |
| ^18.19.0          | `--import ./telemetry.mjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs`  |
| 20.x              | `--import ./telemetry.mjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs`  |
| 22.x              | `--import ./telemetry.mjs --experimental-loader=@opentelemetry/instrumentation/hook.mjs`  |
