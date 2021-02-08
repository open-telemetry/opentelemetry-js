# OpenTelemetry Base Context Manager

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This package provides the ContextManager interface (which is used by concrete implementations) and a no-op implementation (which is used internally when no context propagation is defined). It's intended for use both on the server and in the browser.

## What is a Context Manager

To understand why they exists, we'll need to understand how Javascript works: when you make native function call (networks, setInterval etc) you generally call C++ code that will later callback your own code.

A common issue when tracing a request in javascript is to link the function that have made the native call to the callback that the native code called when the response is there. Imagine you want to track for which user you made the request, you need some sort of "context/context aware storage".

ContextManager's aim to offer exactly that, it's API offer to store an object in the current context (`with()`) and if needed, `bind()` to a specific function call to find it back when the callback fire, which can later get retrieved using `active()`.

This package only include the interface and a Noop implementation, for more information please see the [async-hooks based ContextManager][ah-context-manager] for NodeJS.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-context-base
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-context-base
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-context-base
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-context-base&type=dev
[ah-context-manager]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-context-async-hooks
[npm-url]: https://www.npmjs.com/package/@opentelemetry/context-base
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fcontext-base.svg
