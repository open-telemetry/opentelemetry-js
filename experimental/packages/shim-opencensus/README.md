# OpenCensus shim

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

OpenCensus shim allows existing OpenCensus instrumentation to report to OpenTelemetry. This
allows you to incrementally migrate your existing OpenCensus instrumentation to OpenTelemetry.
More details are available in the [OpenCensus Compatibility Specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/compatibility/opencensus.md).

## Installation

```bash
npm install --save @opentelemetry/shim-opencensus
```

## Tracing usage

### Installing the shim's require-in-the-middle hook

This is the recommended way to use the shim for tracing.

This package provides a `require-in-the-middle` hook which replaces OpenCensus's `CoreTracer`
class with a shim implementation that writes to the OpenTelemetry API. This will cause all
usage of OpenCensus's tracing methods (in OpenCensus instrumentation or your own custom
instrumentation) to be reported to OpenTelemetry.

There are two options for installing the hook:

1. Using Node's `--require` flag to load the register module:

   ```sh
   node --require @opentelemetry/shim-opencensus/register ./app.js
   ```

2. Programmatically:

   ```js
   // Early in your application startup
   require('@opentelemetry/shim-opencensus').installShim();
   ```

   Note that this has to be run before any OpenCensus tracers have been created.

### Replace OpenCensus tracer with the `ShimTracer` in your code

Alternatively, you can replace any usage of OpenCensus tracers in your code with the `ShimTracer` directly.

Before:

```js
const tracing = require('@opencensus/nodejs');
const tracer = tracing.start({samplingRate: 1}).tracer;

// ...

tracer.startRootSpan({name: 'main'}, rootSpan => {
  rootSpan.end();
});
```

After:

```js
const { trace } = require('@opentelemetry/api');
const { ShimTracer } = require('@opentelemetry/shim-opencensus');
const tracer = new ShimTracer(trace.getTracer('my-module'));  

// ...

tracer.startRootSpan({name: 'main'}, rootSpan => {
  rootSpan.end();
});
```

## Metrics usage

OpenCensus metrics can be collected and sent to an OpenTelemetry exporter by providing the
`OpenCensusMetricProducer` to your `MetricReader`. For example, to export OpenCensus metrics
through the OpenTelemetry Prometheus exporter:

```js
new MeterProvider({
  readers: [
    new PrometheusExporter({
      metricProducers: [
        new OpenCensusMetricProducer({
          openCensusMetricProducerManager:
            oc.Metrics.getMetricProducerManager(),
        }),
      ],
    }),
  ],
});
```

## Example

See [examples/opencensus-shim](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/examples/opencensus-shim) for a short example.

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/shim-opencensus
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fshim-opencensus.svg
