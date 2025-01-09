# OpenTelemetry Async Local Storage-based Context Manager

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This package provides a [`ContextManager`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api.ContextManager.html) implementation built on APIs from Node.js's [`async_hooks`][async-hooks-doc] module. If you're looking for a `ContextManager` to use in browser environments, consider [opentelemetry-context-zone](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-context-zone) or [opentelemetry-context-zone-peer-dep](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-context-zone-peer-dep).

The definition of the `ContextManager` interface and the problem it solves can be found [here][def-context-manager].

## Limitations

It's possible that this package won't track context perfectly when used with certain packages. In particular, it inherits any bugs present in async_hooks. See [here][pkgs-that-break-ah] for known issues.

async_hooks is still seeing significant correctness and performance fixes, it's recommended to run the latest Node.js LTS release to benefit from said fixes.

## Prior art

Context propagation is a big subject when talking about tracing in Node.js. If you want more information about it here are some resources:

- <https://www.npmjs.com/package/continuation-local-storage> (which was the old way of doing context propagation)
- Datadog's own implementation for their JavaScript tracer: [here][dd-js-tracer-scope]
- OpenTracing implementation: [here][opentracing-scope]
- Discussion about context propagation by the Node.js Diagnostics Working Group: [here][diag-team-scope-discussion]

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[async-hooks-doc]: http://nodejs.org/dist/latest/docs/api/async_hooks.html
[def-context-manager]: https://opentelemetry.io/docs/instrumentation/js/api/context/#context-manager
[dd-js-tracer-scope]: https://github.com/DataDog/dd-trace-js/blob/master/packages/dd-trace/src/scope.js
[opentracing-scope]: https://github.com/opentracing/opentracing-javascript/pull/113
[diag-team-scope-discussion]: https://github.com/nodejs/diagnostics/issues/300
[pkgs-that-break-ah]: https://github.com/nodejs/diagnostics/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aasync-continuity
[npm-url]: https://www.npmjs.com/package/@opentelemetry/context-async-hooks
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcontext-async-hooks.svg
