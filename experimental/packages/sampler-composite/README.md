# OpenTelemetry Composite Sampling

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package provides implementations of composite samplers that propagate sampling information across a trace.
This implements the [experimental specification][probability-sampling].

Currently `ComposableRuleBased` an `ComposableAnnotating` are not implemented.

## Quick Start

To get started you will need to install a compatible OpenTelemetry SDK.

### Samplers

This module exports samplers that follow the general behavior of the standard SDK samplers, but ensuring
it is consistent across a trace by using the tracestate header. Notably, the tracestate can be examined
in exported spans to reconstruct population metrics.

```typescript
import {
  CompositeSampler,
  ComposableAlwaysOffSampler,
  ComposableAlwaysOnSampler,
  ComposableParentThresholdSampler,
  ComposableTraceIDRatioBasedSampler,
} from '@opentelemetry/sampler-composite';

// never sample
const sampler = new CompositeSampler(new ComposableAlwaysOffSampler());
// always sample
const sampler = new CompositeSampler(new ComposableAlwaysOnSampler());
// follow the parent, or otherwise sample with a probability if root
const sampler = new CompositeSampler(
    new ComposableParentThresholdSampler(new ComposableTraceIDRatioBasedSampler(0.3)));
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
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sampler-composite
[npm-img]: https://badge.fury.io/js/%40opentelemetry%sampler-composite.svg

[probability-sampling]: https://opentelemetry.io/docs/specs/otel/trace/tracestate-probability-sampling/
