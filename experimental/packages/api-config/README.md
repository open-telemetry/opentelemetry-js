# OpenTelemetry Configuration API for JavaScript

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package provides the OpenTelemetry declarative configuration API: `ConfigProvider` and `ConfigProperties`. Instrumentations pull their configuration from a globally registered `ConfigProvider`; an SDK sets that provider from a parsed configuration file. When no provider is registered the global default is a no-op that yields empty configuration, so instrumentations fall back to their constructor defaults.

Per the [OpenTelemetry specification][spec-url], `ConfigProperties` is stable and `ConfigProvider` is in development.

## Installation

```bash
npm install --save @opentelemetry/api-config
```

## Usage

```ts
import { config } from '@opentelemetry/api-config';

const provider = config.getConfigProvider();
const httpConfig = provider.getInstrumentationConfig('@opentelemetry/instrumentation-http');
const timeout = httpConfig.getNumber('timeout');
```

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/api-config
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fapi-config.svg
[spec-url]: https://opentelemetry.io/docs/specs/otel/configuration/api/
