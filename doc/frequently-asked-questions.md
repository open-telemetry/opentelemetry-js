# Frequently Asked Questions

This FAQ has bits of advice and workarounds for common problems.

## I'm using Jest and get import errors when I run my test suite

Test suite failures of the form:

``` text
Cannot find module @opentelemetry/foo/bar from @opentelemetry/...
```

but package `@opentelemetry/foo` is installed occur with Jest < v29.4. Upgrade
to a newer version of Jest to resolve the issue. Earlier versions of
`jest-resolve` cannot find the nested module imports used by some OpenTelemetry
packages since version 0.56 and higher. [#5618](https://github.com/open-telemetry/opentelemetry-js/issues/5618)

Here is a workaround for older versions of Jest using a `moduleNameMapper` rule.
Add this line to your `jest.config.js`:

``` javascript
module.exports = {
  moduleNameMapper: {
    '^@opentelemetry/([^/]+)/(.+)$': '<rootDir>/node_modules/@opentelemetry/$1/build/src/index-$2',
  }
}
```
