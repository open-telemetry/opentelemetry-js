# Always Record Sampler

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. Minor releases may include breaking changes.**

The Always Record Sampler package is designed for OpenTelemetry to update any sampling decision made by a root/delegate sampler to an equivalent sampling decision with a record decision. More specifically, this feature will change any sampling decisions with `DROP` to `RECORD`, while retaining the trace state and attributes in the sampling decision.

## Installation

```bash
npm install --save @opentelemetry/sampler-always-record
```

## Usage

The following is an example of the Always Record Sampler in use, where the root sampler is a Trace ID Ratio Based Sampler:

```typescript
const { AlwaysRecordSampler } = require('@opentelemetry/sampler-always-record');
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-base');

const rootSampler = new TraceIdRatioBasedSampler(0.5);
const sampler = new AlwaysRecordSampler(rootSampler);
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
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sampler-always-record
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsampler-always-record.svg
