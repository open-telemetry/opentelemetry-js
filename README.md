# OpenTelemetry Propagator AWS X-Ray

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

[component owners](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/.github/component_owners.yml): @willarmiros @NathanielRN

The OpenTelemetry Propagator for AWS X-Ray provides HTTP header propagation for systems that are using AWS `X-Amzn-Trace-Id` format.
This propagator translates the OpenTelemetry SpanContext into the equivalent AWS header format, for use with the OpenTelemetry JS SDK.
`TraceState` is currently not propagated.

### Installation

```
npm install --save @opentelemetry/propagator-aws-xray
```

### Usage

In the [global tracer configuration file](https://github.com/open-telemetry/opentelemetry-js/blob/master/getting-started/README.md#initialize-a-global-tracer), configure the following:

```js
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { AWSXRayPropagator } = require('@opentelemetry/propagator-aws-xray');
// ...

const provider = new NodeTracerProvider();

// Set the global trace context propagator to use X-Ray formatted trace header
provider.register({
  propagator: new AWSXRayPropagator()
});
```

### Propagator Details

Example header:`X-Amzn-Trace-Id: Root=1-5759e988-bd862e3fe1be46a994272793;Parent=53995c3f42cd8ad8;Sampled=1`

The header consists of three parts: the root trace ID, the parent ID and the sampling decision.

#### Root - The AWS X-Ray format trace ID

* Format: (spec-version)-(timestamp)-(UUID)
    * spec_version - The version of the AWS X-Ray header format. Currently, only "1" is valid.
    * timestamp - 32-bit number in base16 format, corresponds to the first 8 characters of the OpenTelemetry trace ID. Note, while X-Ray calls this timestamp, for the purpose of propagation it is opaque and any value will work.
    * UUID - 96-bit random number in base16 format, corresponds to the last 10 characters of the OpenTelemetry trace ID.

Root is analogous to the [OpenTelemetry Trace ID](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#spancontext), with some small format changes.
For additional reading, see the [AWS X-Ray Trace ID](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-sendingdata.html#xray-api-traceids) public documentation.

#### Parent - The ID of the AWS X-Ray Segment

* 64-bit random number in base16 format. Populated from the [OpenTelemetry Span ID](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#spancontext).

#### Sampled - The sampling decision*

* Defined in the AWS X-Ray specification as a tri-state field, with "0", "1" and "?" as valid values. Only "0" and "1" are used in this propagator. If "?", a new trace will be started.
* Populated from the [OpenTelemetry trace flags](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#spancontext).

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

### License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js-contrib.svg?path=propagators%2Fopentelemetry-propagator-aws-xray
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js-contrib?path=propagators%2Fopentelemetry-propagator-aws-xray
[devDependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js-contrib.svg?path=propagators%2Fopentelemetry-propagator-aws-xray&type=dev
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js-contrib?path=propagators%2Fopentelemetry-propagator-aws-xray&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/propagator-aws-xray
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fpropagator-aws-xray.svg
