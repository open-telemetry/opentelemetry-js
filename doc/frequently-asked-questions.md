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
