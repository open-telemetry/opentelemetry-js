# OpenTelemetry Generative AI Semantic Conventions

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

Generative AI (GenAI) Semantic Convention constants for use with the OpenTelemetry SDK/APIs. [These conventions][genai-semconv-docs] define standard attributes, metrics, and events for instrumenting GenAI systems — models, agents, frameworks, and the providers they call.

The GenAI conventions are developed in the [open-telemetry/semantic-conventions-genai][genai-semconv-repo] repository, separate from the [core semantic conventions][semconv-repo], so that they can evolve on their own schedule. This package mirrors that split: it is versioned to match the GenAI schema version and is released independently of `@opentelemetry/semantic-conventions`.

## Installation

```bash
npm install --save @opentelemetry/semantic-conventions-genai
```

## Import Structure

This package has 2 separate entry-points, matching [`@opentelemetry/semantic-conventions`][semconv-pkg]:

- The main entry-point, `@opentelemetry/semantic-conventions-genai`, includes only stable semantic conventions.
  This entry-point follows semantic versioning 2.0: it will not include breaking changes except with a change in the major version number.
- The "incubating" entry-point, `@opentelemetry/semantic-conventions-genai/incubating`, contains unstable semantic conventions (sometimes called "experimental") and, for convenience, a re-export of the stable semantic conventions.
  This entry-point is _NOT_ subject to the restrictions of semantic versioning and _MAY_ contain breaking changes in minor releases. See below for suggested usage of this entry-point.

Note that **every GenAI semantic convention is currently in development**, so the main entry-point exports nothing yet. All constants are available from the "incubating" entry-point. As conventions stabilize they will begin to appear in the main entry-point as well.

Exported constants follow this naming scheme:

- `ATTR_${attributeName}` for attributes
- `${attributeName}_VALUE_{$enumValue}` for enumerations of attribute values
- `METRIC_${metricName}` for metric names
- `EVENT_${eventName}` for event names

The `ATTR`, `METRIC`, `EVENT`, and `VALUE` static strings were used to facilitate readability and filtering in auto-complete lists in IDEs.

## Relationship to `@opentelemetry/semantic-conventions`

GenAI instrumentation almost always needs conventions from both registries: GenAI-specific ones such as `gen_ai.provider.name` from this package, and general-purpose ones such as `error.type` and `server.address` from `@opentelemetry/semantic-conventions`. The GenAI registry references those core attributes rather than redefining them, so this package does **not** re-export them — install and import both packages.

```ts
import { ATTR_SERVER_ADDRESS } from '@opentelemetry/semantic-conventions';
import { ATTR_GEN_AI_PROVIDER_NAME } from './semconv'; // see below
```

## Usage

### Unstable SemConv

<!-- Dev Note: ^^ This '#unstable-semconv' anchor is being used in jsdoc links in the code. -->

Because the "incubating" entry-point may include breaking changes in minor versions, it is recommended that instrumentation libraries **not** import `@opentelemetry/semantic-conventions-genai/incubating` in runtime code, but instead **copy relevant definitions into their own code base**. (This is the same [recommendation](https://opentelemetry.io/docs/specs/semconv/non-normative/code-generation/#stability-and-versioning) as for other languages.)

For example, create a "src/semconv.ts" (or "lib/semconv.js" if implementing in JavaScript) file that copies from [experimental_attributes.ts](./src/experimental_attributes.ts) or [experimental_metrics.ts](./src/experimental_metrics.ts):

```ts
// src/semconv.ts
export const ATTR_GEN_AI_PROVIDER_NAME = 'gen_ai.provider.name';
export const ATTR_GEN_AI_OPERATION_NAME = 'gen_ai.operation.name';
```

```ts
// src/instrumentation.ts
import { ATTR_SERVER_ADDRESS } from '@opentelemetry/semantic-conventions';
import {
  ATTR_GEN_AI_PROVIDER_NAME,
  ATTR_GEN_AI_OPERATION_NAME,
} from './semconv';

span.setAttributes({
  [ATTR_GEN_AI_PROVIDER_NAME]: ...,
  [ATTR_GEN_AI_OPERATION_NAME]: ...,
  [ATTR_SERVER_ADDRESS]: ...,
})
```

Occasionally, one should review changes to `@opentelemetry/semantic-conventions-genai` to see if any used unstable conventions have changed or been stabilized. However, an update to a newer minor version of the package will never be breaking.

#### Why not pin the version?

A considered alternative for using unstable exports is to **pin** the version. I.e., depend on an exact version, rather than on a version range.

```bash
npm install --save-exact @opentelemetry/semantic-conventions-genai  # Don't do this.
```

Then, import directly from `@opentelemetry/semantic-conventions-genai/incubating`.
This is **not** recommended.

In some languages having multiple versions of a package in a single application is not possible. This _is_ possible in JavaScript. The primary argument against pinning this package is that it can easily lead to many copies being installed in an application's `node_modules/...`, which can cause significant disk usage. In a disk-constrained environment, such as AWS Lambda Layers, that can be a blocker.

## Versioning

This package's version tracks the schema version of the GenAI semantic conventions registry it was generated from, in the same way `@opentelemetry/semantic-conventions` tracks the core semantic conventions version. Because the two registries are versioned independently, the version numbers of the two packages are not expected to match.

## Regenerating

The `src/{stable,experimental}_{attributes,metrics,events}.ts` files are generated from the GenAI semantic conventions registry with [OTel Weaver][weaver-repo]. To regenerate them, run:

```bash
./scripts/semconv-genai/generate.sh
```

from the root of this repository. The registry commit and Weaver version are pinned at the top of that script.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/semantic-conventions-genai
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsemantic-conventions-genai.svg
[genai-semconv-docs]: https://opentelemetry.io/docs/specs/semconv/gen-ai/
[genai-semconv-repo]: https://github.com/open-telemetry/semantic-conventions-genai
[semconv-repo]: https://github.com/open-telemetry/semantic-conventions
[semconv-pkg]: https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions
[weaver-repo]: https://github.com/open-telemetry/weaver
