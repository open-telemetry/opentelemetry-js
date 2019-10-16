# OpenTelemetry Base Scope Manager
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This package provides the ScopeManager interface (which is used by concrete implementations) and a no-op implementation (which is used internally when no scope propagation is defined). It's intended for use both on the server and in the browser.

## What is a Scope Manager ?

To understand why they exists, we'll need to understand how Javascript works: when you make native function call (networks, setInterval etc) you generally call C++ code that will later callback your own code.

A common issue when tracing a request in javascript is to link the function that have made the native call to the callback that the native code called when the response is there. Imagine you want to track for which user you made the request, you need some sort of "context/scope aware storage".

ScopeManager's aim to offer exactly that, it's API offer to store an object in the current scope (`with()`) and if needed, `bind()` to a specific function call to find it back when the callback fire, which can later get retrieved using `active()`.

This package only include the interface and a Noop implementation, for more information please see the [async-hooks based ScopeManager][ah-scope-manager] for NodeJS.

Note: You will sometimes read about **context** management, which is sometimes also used for talking about **scope** management. However in OpenTelemetry, **context** was already heavily used as a concept in the Trace API so we named this package with **scope** to avoid confusion.

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-scope-base
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-scope-base
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-scope-base
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-scope-base&type=dev
[ah-scope-manager]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-scope-async-hooks
[npm-url]: https://www.npmjs.com/package/@opentelemetry/scope-base
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fscope-base.svg
