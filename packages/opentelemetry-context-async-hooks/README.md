# OpenTelemetry async_hooks-based Context Managers

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This package provides two [`ContextManager`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api.ContextManager.html) implementations built on APIs from Node.js's [`async_hooks`][async-hooks-doc] module. If you're looking for a `ContextManager` to use in browser environments, consider [opentelemetry-context-zone](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-context-zone) or [opentelemetry-context-zone-peer-dep](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-context-zone-peer-dep).

See [the definition of the `ContextManager` interface][def-context-manager] and the problem it solves.

## API

Two `ContextManager` implementations are exported:

- `AsyncLocalStorageContextManager`, based on [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
- `AsyncHooksContextManager`, based on [`AsyncHook`](https://nodejs.org/api/async_hooks.html#async_hooks_class_asynchook). This is **deprecated** and will be removed in v3 (planned for mid-2025. `AsyncLocalStorage` is simpler, faster, available in Node.js v14.8.0 and later, and avoids [this possible DoS vulnerability](https://nodejs.org/en/blog/vulnerability/january-2026-dos-mitigation-async-hooks).

### Using attach() and detach()

`AsyncLocalStorageContextManager` supports the optional `attach()` and `detach()` methods for imperative context management. These allow you to manually set and restore context outside of the scoped `with()` method.

**What is an "execution unit"?** In Node.js, this refers to the current asynchronous execution chain - the currently running code plus all async operations that will be spawned from it (Promises, callbacks, async/await, timers, etc.). When you `attach()` a context, it becomes active for this entire chain until you `detach()` it.

```javascript
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { ROOT_CONTEXT } from '@opentelemetry/api';

const contextManager = new AsyncLocalStorageContextManager();
contextManager.enable();

const myContext = ROOT_CONTEXT.setValue('key', 'value');

// Attach a context - it becomes active for the current async execution chain
const token = contextManager.attach(myContext);
console.log(contextManager.active()); // myContext

// Context propagates to async operations automatically
await someAsyncOperation();
console.log(contextManager.active()); // still myContext

// Restore the previous context
contextManager.detach(token);
console.log(contextManager.active()); // ROOT_CONTEXT
```

**Important:** You should ensure that every `attach()` call has a corresponding `detach()` call with the returned token to avoid context leaks. Use a try/finally block for safety:

```javascript
const token = contextManager.attach(myContext);
try {
  await doWork();
} finally {
  contextManager.detach(token); // Always restore
}
```

For most use cases, prefer using `with()` as it automatically handles context restoration.
Not restoring context properly can leat to catastrophic effects on your telemetry, even outside the bounds of your instrumentation library.

## Prior art

Context propagation is a big subject when talking about tracing in Node.js. If you want more information about it here are some resources:

- <https://www.npmjs.com/package/continuation-local-storage> (which was the old way of doing context propagation)
- [Datadog's own implementation][dd-js-tracer-scope] for their JavaScript tracer
- [OpenTracing implementation][opentracing-scope]
- [Discussion about context propagation][diag-team-scope-discussion] by the Node.js Diagnostics Working Group

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[def-context-manager]: https://opentelemetry.io/docs/instrumentation/js/api/context/#context-manager
[dd-js-tracer-scope]: https://github.com/DataDog/dd-trace-js/blob/master/packages/dd-trace/src/scope.js
[opentracing-scope]: https://github.com/opentracing/opentracing-javascript/pull/113
[diag-team-scope-discussion]: https://github.com/nodejs/diagnostics/issues/300
[npm-url]: https://www.npmjs.com/package/@opentelemetry/context-async-hooks
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcontext-async-hooks.svg
