# OpenTelemetry Datadog Trace Exporter

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

OpenTelemetry Datadog Trace Exporter allows the user to send collected traces to a Datadog Trace-Agent.

[Datadog APM](https://www.datadoghq.com), is a distributed tracing system. It is used for monitoring and troubleshooting microservices-based distributed systems.

## Prerequisites

The OpenTelemetry Datadog Trace Exporter requires a Datadog Agent that it can send exported traces to. This Agent then forwards those traces to a Datadog API intake endpoint. To get up and running with Datadog in your environment follow the Getting Started Instructions for Installing and configuring a [Datadog Agent](https://docs.datadoghq.com/tracing/#1-configure-the-datadog-agenthttps://docs.datadoghq.com/tracing/#1-configure-the-datadog-agent) which the exporter can send traces to. By Default the Agent listens for Traces at `localhost:8126`.

## Installation

```bash
npm install --save @opentelemetry/exporter-datadog
```

## Usage

Install the datadog processor and datadog exporter on your application and pass the options. It should contain a service name (default is `dd-service`).

Furthermore, the `agent_url` option (which defaults to `http://localhost:8126`), can instead be set by the
`DD_TRACE_AGENT_URL` environment variable to reduce in-code config. If both are
set, the value set by the option in code is authoritative.

```js
import { NodeTracerProvider } from '@opentelemetry/node';
import { DatadogSpanProcessor, DatadogExporter, DatadogPropagator, DatadogProbabilitySampler } from '@opentelemetry/exporter-datadog';

const provider = new NodeTracerProvider();

const exporterOptions = {
  service_name: 'my-service', // optional
  agent_url: 'http://localhost:8126' // optional
  tags: 'example_key:example_value,example_key_two:value_two', // optional
  env: 'production', // optional
  version: '1.0' // optional
}

const exporter = new DatadogExporter(exporterOptions);

//  Now, register the exporter.

provider.addSpanProcessor(new DatadogSpanProcessor(exporter));

// Next, add the Datadog Propagator for distributed tracing

provider.register({
  propagator: new DatadogPropagator(),
  // while datadog suggests the default ALWAYS_ON sampling, for probability sampling,
  // to ensure the appropriate generation of tracing metrics by the datadog-agent,
  // use the `DatadogProbabilitySampler`
  // sampler: new DatadogProbabilitySampler(0.75)  
})
```

It's recommended to use the `DatadogSpanProcessor`

- `DatadogSpanProcessor`: The implementation of `SpanProcessor` that passes ended complete traces to the configured `SpanExporter`.

## Probability Based Sampling Setup

- By default, the OpenTelemetry tracer will sample and record all spans. This default is the suggest sampling approach to take when exporting to Datadog. However, if you wish to use Probability Based sampling, we recommend that, in order for the Datadog trace-agent to collect trace related metrics effectively, to use the `DatadogProbabilitySampler`. You can enabled Datadog Probability based sampling with the  code snippet below when registering your tracer provider.

```js
provider.register({
  // while datadog suggests the default ALWAYS_ON sampling, for probability sampling,
  // to ensure the appropriate generation of tracing metrics by the datadog-agent,
  // use the `DatadogProbabilitySampler`
  sampler: new DatadogProbabilitySampler(0.75)  
})
```

## Distributed Tracing Context Propagation

- In order to connect your OpenTelemetry Instrumentation Application with other Datadog Instrumented Applications, you must propagate the distribute tracing context with Datadog specific headers. To accomplish this we recommend configuring to use `DatadogPropagator`. You can enabled Datadog Propagation with the below code snippet below when registering your tracer provider.

```js
provider.register({
  propagator: new DatadogPropagator(),
})
```

- To propagator multiple header formats to downstream application, use a `CompositePropogator`. For example, to use both B3 and Datadog formatted distributed tracing headers for Propagation, you can enable a Composite Propagator with the below code snippet when registering your tracer provider.

```js
import { CompositePropagator, B3Propagator } from '@opentelemetry/core';
import { DatadogPropagator } from '@opentelemetry/exporter-datadog';

const provider = new NodeTracerProvider();
// ... provider setup with appropriate exporter

provider.register({
  propagator: new DaCompositePropagator({
    propagators: [new B3Propagator(), new DatadogPropagator()]
  }),
});
```

## Configuration Options

### Configuration Options - Datadog Agent URL

By default the OpenTelemetry Datadog Exporter transmits traces to `http://localhost:8126`. You can configure the application to send traces to a diffent URL using the following environmennt variables:

- `DD_TRACE_AGENT_URL`: The `<host>:<port:` where you Datadog Agent is listening for traces. (e.g. `agent-host:8126`)

These values can also be overridden at the trace exporter level:

```js
// Configure the datadog trace agent url
new DatadogExporter({agent_url: 'http://dd-agent:8126'});
```

### Configuration Options - Tagging

You can configure the application to automatically tag your Datadog exported traces, using the following environment variables:

- `DD_ENV`: Your application environment (e.g. `production`, `staging`, etc.)
- `DD_SERVICE`: Your application's default service name (e.g. `billing-api`)
- `DD_VERSION`: Your application version (e.g. `2.5`, `202003181415`, `1.3-alpha`, etc.)
- `DD_TAGS`: Custom tags in value pairs separated by `,` (e.g. `layer:api,team:intake`)
- If `DD_ENV`, `DD_SERVICE` or `DD_VERSION` are set, it will override any respective `env`/`service`/`version` tag defined in `DD_TAGS`.
- If `DD_ENV`, `DD_SERVICE` or `DD_VERSION` are NOT set, tags defined in `DD_TAGS` will be used to populate `env`/`service`/`version` respectively.

These values can also be overridden at the trace exporter level:

```js

new DatadogExporter({
  service_name: 'my-service', // optional
  agent_url: 'http://localhost:8126' // optional
  tags: 'example_key:example_value,example_key_two:value_two', // optional
  env: 'production', // optional
  version: '1.0' // optional
});
```

This enables you to set this value on a per application basis, so you can have for example several applications reporting for different environments on the same host.

Tags can also be set directly on individual spans, which will supersede any conflicting tags defined at the application level.

## Useful links

- To know more about Datadog, visit: <https://www.datadoghq.com>
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-exporter-datadog
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-datadog
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-exporter-datadog
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-datadog&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-datadog
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-datadog.svg
