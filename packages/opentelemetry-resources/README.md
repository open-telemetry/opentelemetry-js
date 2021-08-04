# OpenTelemetry Resources Util

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

The OpenTelemetry Resource is an immutable representation of the entity producing telemetry. For example, a process producing telemetry that is running in a container on Kubernetes has a Pod name, it is in a namespace and possibly is part of a Deployment which also has a name. All three of these attributes can be included in the `Resource`.

[This document][resource-semantic_conventions] defines standard attributes for resources which are accessible via [`@opentelemetry/semantic-conventions`](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-semantic-conventions).

## Installation

```bash
npm install --save @opentelemetry/resources
```

## Usage

```typescript
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Resource } from '@opentelemetry/resources';

const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'api-service',
});

const another_resource = new Resource({
    'service.version': 2.0.0,
    'service.group': 'instrumentation-group'
});
const merged_resource = resource.merge(another_resource);
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
[dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=packages%2Fopentelemetry-resources
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-resources
[devDependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=packages%2Fopentelemetry-resources&type=dev
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-resources&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/resources
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fresources.svg

[resource-semantic_conventions]: https://github.com/open-telemetry/opentelemetry-specification/tree/master/specification/resource/semantic_conventions
