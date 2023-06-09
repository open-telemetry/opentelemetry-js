# OpenTelemetry Semantic Conventions

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

Semantic Convention constants for use with the OpenTelemetry SDK/APIs. [This document][trace-semantic_conventions] defines standard attributes for traces.

## Installation

```bash
npm install --save @opentelemetry/semantic-conventions
```

## Usage

```ts
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

const span = tracer.startSpan().startSpan(spanName, spanOptions)
  .setAttributes({
    [SemanticAttributes.NET_PEER_NAME]: 'localhost',
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
[npm-url]: https://www.npmjs.com/package/@opentelemetry/semantic-conventions
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsemantic-conventions.svg

[trace-semantic_conventions]: https://github.com/open-telemetry/semantic-conventions/tree/main/specification/trace/semantic_conventions
