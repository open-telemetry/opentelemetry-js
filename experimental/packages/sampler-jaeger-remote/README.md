# Sample Jaeger Remote Sampler

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

The Sample Jaeger Remote Sampler package is designed for OpenTelemetry to dynamically fetch and update sampling strategies from a Jaeger agent or collector. This enables applications to adjust their tracing strategies based on the current configuration provided by Jaeger, optimizing for both performance and observability.

## Installation

```bash
npm install --save @opentelemetry/sampler-jaeger-remote
```

## Usage

To integrate the Jaeger Remote Sampler with your application, configure it with the endpoint of your Jaeger agent or collector. The sampler can be set up as follows:

```javascript
const { JaegerRemoteSampler } = require('@opentelemetry/sampler-jaeger-remote');
const { Resource } = require('@opentelemetry/resources');
const { NodeTracerProvider } = require('@opentelemetry/node');

// Jaeger agent endpoint
const sampler = new JaegerRemoteSampler('http://your-jaeger-agent:14268/api/sampling');

const provider = new NodeTracerProvider({
  resource: Resource.default().merge(new Resource({
    'service.name': 'your-service-name'
  })),
  sampler
});

provider.register();