# Jaeger Remote Sampler

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. Minor releases may include breaking changes.**

The Jaeger Remote Sampler package is designed for OpenTelemetry to dynamically fetch and update sampling strategies from a Jaeger agent or collector. This enables applications to adjust their sampling strategies based on the current configuration provided by Jaeger, optimizing for both performance and observability.

## Installation

```bash
npm install --save @opentelemetry/sampler-jaeger-remote
```

## Usage

To integrate the Jaeger Remote Sampler with your application, configure it with the endpoint of your Jaeger agent or collector. The sampler can be set up as follows:

```javascript
const { JaegerRemoteSampler } = require('@opentelemetry/sampler-jaeger-remote');
const { defaultResource, resourceFromAttributes } = require('@opentelemetry/resources');
const { NodeTracerProvider } = require('@opentelemetry/node');

// Jaeger agent endpoint
const sampler = new JaegerRemoteSampler({
  endpoint: 'http://your-jaeger-agent:14268/api/sampling',
  serviceName: 'your-service-name',
  initialSampler: new AlwaysOnSampler(),
  poolingInterval: 60000  // 60 seconds
});
const provider = new NodeTracerProvider({
  resource: defaultResource().merge(resourceFromAttributes({
    'service.name': 'your-service-name'
  })),
  sampler
});

provider.register();
```

## Supported Configuration Options

The Jaeger Remote Sampler supports the following sampling strategies based on the configuration received from the remote endpoint:

1. **Per-Operation Sampling**: If the remote configuration includes `operationSampling` with `perOperationStrategies`, it creates a `PerOperationSampler`. This allows for different sampling rates for different operations.

2. **Probabilistic Sampling**: If the remote configuration specifies `StrategyType.PROBABILISTIC`, it creates a `TraceIdRatioBasedSampler`. This samples a percentage of traces based on the trace ID.

3. **Default Sampling**: If none of the above apply, it falls back to the initial sampler provided in the constructor.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sampler-jaeger-remote
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsampler-jaeger-remote.svg
