# OpenTelemetry Resources Util

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This package provides support for working with [OpenTelemetry Resource objects](https://opentelemetry.io/docs/specs/otel/resource/), e.g. `resourceFromAttributes(), and includes a number of *resource detectors* which gather resource attributes from the environment. (Other resource detectors, e.g. for cloud providers, are available in ["resource-detector-\*" packages in the opentelemetry-js-contrib.git repository](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages).

[This document][resource-semantic_conventions] defines standard attributes for resources which are accessible via [`@opentelemetry/semantic-conventions`](https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions).

## Installation

```bash
npm install --save @opentelemetry/resources
```

## Usage

```typescript
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { resourceFromAttributes } from '@opentelemetry/resources';

const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'api-service',
});

const anotherResource = resourceFromAttributes({
    'service.version': '2.0.0',
    'service.group': 'instrumentation-group'
});
const mergedResource = resource.merge(anotherResource);
```

## Resource detectors

```ts
import { detectResources, processDetector, hostDetector } from '@opentelemetry/resources';

const resource = detectResources({
  detectors: [ processDetector, hostDetector ],
});
```

Included resource detectors:

- `hostDetector`: Detect `host.*` attributes per <https://opentelemetry.io/docs/specs/semconv/resource/host/>.
- `osDetector`: Detect `os.*` attributes per <https://opentelemetry.io/docs/specs/semconv/resource/os/>.
- `processDetector`: Detect `process.*` attributes per <https://opentelemetry.io/docs/specs/semconv/resource/process/>.
- `resourceAttributesEnvDetector`: Detect attributes from the `OTEL_RESOURCE_ATTRIBUTES` environment variable per <https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration>.
- `serviceInstanceIdDetector`: Detect `service.instance.id` per <https://opentelemetry.io/docs/specs/semconv/resource/service/#service-instance>.
- `serviceNameEnvDetector`: Detect `service.name` from the `OTEL_SERVICE_NAME` environment variable per <https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration>.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/resources
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fresources.svg

[resource-semantic_conventions]: https://github.com/open-telemetry/opentelemetry-specification/tree/master/specification/resource/semantic_conventions
