# OpenTelemetry Generative AI Semantic Conventions

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This package provides Generative AI (GenAI) semantic convention constants for the OpenTelemetry SDK and API. [The GenAI semantic conventions][genai-semconv-docs] define attributes, metrics, and events for GenAI systems: models, agents, frameworks, and providers.

The [open-telemetry/semantic-conventions-genai][genai-semconv-repo] repository defines the GenAI conventions. This repository is separate from [open-telemetry/semantic-conventions][semconv-repo]. This package tracks the version of the GenAI registry. See [Versioning](#versioning).

## Installation

```bash
npm install --save @opentelemetry/semantic-conventions-genai
```

## Import Structure

This package has two entry points:

- `@opentelemetry/semantic-conventions-genai` exports stable conventions. This entry point follows semantic versioning. A breaking change requires a major version change.
- `@opentelemetry/semantic-conventions-genai/incubating` exports unstable conventions and all stable conventions. This entry point does not follow semantic versioning. A minor release can include a breaking change. See [Usage](#usage) for the recommended pattern.

Exported constants follow this naming scheme:

- `ATTR_${attributeName}` for attributes
- `${attributeName}_VALUE_{$enumValue}` for enumerations of attribute values
- `METRIC_${metricName}` for metric names
- `EVENT_${eventName}` for event names

## Relationship to `@opentelemetry/semantic-conventions`

This package does not re-export core attributes. GenAI instrumentation uses conventions from both registries. GenAI attributes, such as `gen_ai.provider.name`, come from this package. Core attributes, such as `error.type` and `server.address`, come from `@opentelemetry/semantic-conventions`.

```ts
import { ATTR_SERVER_ADDRESS } from '@opentelemetry/semantic-conventions';
import { ATTR_GEN_AI_PROVIDER_NAME } from './semconv'; // see Usage below
```

## Usage

### Unstable SemConv

<!-- Dev Note: ^^ This '#unstable-semconv' anchor is being used in jsdoc links in the code. -->

The incubating entry point can include breaking changes in a minor release. Do not import `@opentelemetry/semantic-conventions-genai/incubating` in runtime code. Copy the definitions you need into your own code base. This method matches the [recommendation for other languages][stability-versioning-doc].

Create a `src/semconv.ts` file (or `lib/semconv.js` in JavaScript). Copy definitions from [experimental_attributes.ts](./src/experimental_attributes.ts) or [experimental_metrics.ts](./src/experimental_metrics.ts):

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

Read the [CHANGELOG](./CHANGELOG.md) for `@opentelemetry/semantic-conventions-genai` to find changes to the definitions you copied.

## Versioning

The [`@opentelemetry/semantic-conventions`][semconv-pkg] and [GenAI semantic conventions registry][genai-semconv-repo] are versioned independently. This package's version tracks the schema version.

## Regenerating

[OTel Weaver][weaver-repo] generates the `src/{stable,experimental}_{attributes,metrics,events}.ts` files from the GenAI semantic conventions registry.

Run this command from the root of the repository to regenerate the files:

```bash
./semantic-conventions-genai/scripts/generate.sh
```

The script pins the registry commit in [`SPEC_VERSION`][generate-script-spec-version] and the Weaver version in [`GENERATOR_VERSION`][generate-script-weaver-version].

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
[generate-script-spec-version]: https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions-genai/scripts/generate.sh#L12
[generate-script-weaver-version]: https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions-genai/scripts/generate.sh#L17
[semconv-repo]: https://github.com/open-telemetry/semantic-conventions
[semconv-pkg]: https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions
[stability-versioning-doc]: https://opentelemetry.io/docs/specs/semconv/non-normative/code-generation/#stability-and-versioning
[weaver-repo]: https://github.com/open-telemetry/weaver
