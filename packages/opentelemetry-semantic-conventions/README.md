# OpenTelemetry Semantic Conventions

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

Semantic Convention constants for use with the OpenTelemetry SDK/APIs. [This document][trace-semantic_conventions] defines standard attributes for traces.

## Installation

```bash
npm install --save @opentelemetry/semantic-conventions
```

## Usage

```ts
import { GeneralAttribute } from '@opentelemetry/semantic-conventions';

const span = tracer.startSpan().startSpan(spanName, spanOptions)
  .setAttributes({
    [GeneralAttribute.NET_PEER_HOSTNAME]: 'localhost',
  });
```

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=packages%2Fopentelemetry-semantic-conventions
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-semantic-conventions
[devDependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=packages%2Fopentelemetry-semantic-conventions&type=dev
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-semantic-conventions&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/semantic-conventions
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsemantic-conventions.svg

[trace-semantic_conventions]: https://github.com/open-telemetry/opentelemetry-specification/tree/master/specification/trace/semantic_conventions
