# OpenTelemetry AsyncHooks-based Context Manager

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This package provides [async-hooks][async-hooks-doc] based context manager which is used internally by OpenTelemetry plugins to propagate specific context between function calls and async operations. It only targets NodeJS since async-hooks is only available there.

## What is a ContextManager

The definition and why they exist is available on [the readme of the context-base package][def-context-manager].

### Implementation in NodeJS

NodeJS has a specific API to track async context: [async-hooks][async-hooks-doc], it allows to track creation of new async operation and their respective parent.
This package only handle storing a specific object for a given async hooks context.

### Limitations

Even if the API is native to NodeJS, it doesn't cover all possible cases of context propagation but there is a big effort from the NodeJS team to fix those. That's why we generally advise to be on the latest LTS to benefit from performance and bug fixes.

There are known modules that break context propagation ([some of them are listed there][pkgs-that-break-ah]), so it's possible that the context manager doesn't work with them.

### Prior arts

Context propagation is a big subject when talking about tracing in NodeJS, if you want more information about that here are some resources:

- <https://www.npmjs.com/package/continuation-local-storage> (which was the old way of doing context propagation)
- Datadog's own implementation for their Javascript tracer: [here][dd-js-tracer-scope]
- OpenTracing implementation: [here][opentracing-scope]
- Discussion about context propagation by the NodeJS diagnostics working group: [here][diag-team-scope-discussion]

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
    [dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=packages%2Fopentelemetry-context-async-hooks
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-context-async-hooks
[devDependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=packages%2Fopentelemetry-context-async-hooks&type=dev
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-context-async-hooks&type=dev
[async-hooks-doc]: http://nodejs.org/dist/latest/docs/api/async_hooks.html
[def-context-manager]: https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-context-base/README.md
[dd-js-tracer-scope]: https://github.com/DataDog/dd-trace-js/tree/main/packages/dd-trace/src/scope
[opentracing-scope]: https://github.com/opentracing/opentracing-javascript/pull/113
[diag-team-scope-discussion]: https://github.com/nodejs/diagnostics/issues/300
[pkgs-that-break-ah]: https://github.com/nodejs/diagnostics/blob/master/tracing/AsyncHooks/problematic-modules.md
[npm-url]: https://www.npmjs.com/package/@opentelemetry/context-async-hooks
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcontext-async-hooks.svg
