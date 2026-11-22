# Frequently Asked Questions

This FAQ has bits of advice and workarounds for common problems.

## I'm using Jest and get import errors when I run my test suite

Test suite failures of the form:

``` text
Cannot find module @opentelemetry/foo/bar from @opentelemetry/...
```

but package `@opentelemetry/foo` is installed may occur with Jest < v29.4.
This is because older versions of `jest-resolve` cannot find the nested module
imports used by some OpenTelemetry packages since version 0.56 and higher.
See [#5618](https://github.com/open-telemetry/opentelemetry-js/issues/5618)

Either upgrade to a newer version of Jest to resolve the issue, or use this
workaround for older versions of Jest by adding a `moduleNameMapper` rule.
Add this line to your `jest.config.js`:

``` javascript
module.exports = {
  moduleNameMapper: {
    '^@opentelemetry/([^/]+)/(.+)$': '<rootDir>/node_modules/@opentelemetry/$1/build/src/index-$2',
  }
}
```

## Why is context lost after `await` in the browser when using `ZoneContextManager`?

`ZoneContextManager` in `@opentelemetry/context-zone` and `@opentelemetry/context-zone-peer-dep` relies on `zone.js` to track asynchronous context across `Promise` callbacks and browser events.

In modern JavaScript targets (`ES2017+`), native `async`/`await` executes via native microtasks that bypass the monkey-patched `Promise` implementation of `zone.js`. As a result, the active context is lost across `await` expressions.

To resolve this without transpiling your entire codebase down to ES2015, configure your build tool to downlevel only `async`/`await` and async generators:

- **esbuild / Vite / tsup**: Set `supported: { 'async-await': false, 'async-generator': false }` in your esbuild config.
- **TypeScript**: Set `"target": "ES2016"` (or lower) in your `tsconfig.json`.
- **Babel**: Use `@babel/plugin-transform-async-to-generator`.

For full setup examples, see the [`@opentelemetry/context-zone` README](../packages/opentelemetry-context-zone/README.md#asyncawait-limitations--build-configuration).
