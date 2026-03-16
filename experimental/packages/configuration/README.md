# OpenTelemetry SDK for Node.js

[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package provides the configuration for OpenTelemetry JavaScript SDK.

## Quick Start

**Note: Much of OpenTelemetry JS documentation is written assuming the compiled application is run as CommonJS.**
For more details on ECMAScript Modules vs CommonJS, refer to [esm-support](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/esm-support.md).

To get started you need to install `@opentelemetry/configuration`.

### Installation

```sh
# Install the package
npm install @opentelemetry/configuration
```

## Development

### Code Generation

The files in `src/generated/` are **auto-generated** — do not edit them manually. They are produced from the [opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration) JSON schema.

#### Regenerating

```sh
# From the repo root
npm run generate:config
```

This runs `scripts/config/generate-config.sh`, which:

1. Downloads the JSON schema at the version pinned in that script (currently `v1.0.0-rc.3`)
2. Runs `scripts/config/generate-config.js` to produce:
   - `src/generated/opentelemetry-configuration.ts` — Zod validation schemas
   - `src/generated/types.ts` — TypeScript interfaces and enum const objects

To target a different schema version, update the `VERSION` variable in `scripts/config/generate-config.sh`.

#### Post-processing patches

The generator applies several structural patches to the raw `json-schema-to-zod` output:

| Patch | Reason |
| --- | --- |
| `z.record(v)` → `z.record(z.string(), v)` | Zod v4 requires two arguments |
| `.array(...).min(1)` → `.array(...)` | `preprocessNullArrays` can produce empty arrays for omitted processors/readers |
| `z.number()` → `z.coerce.number()` | Env-var values arrive as strings and need coercion |
| Boolean union ordering in `AttributeNameValue.value` | Prevents `true` being coerced to `1` by `z.coerce.number()` |

#### Defaults

Spec-defined defaults (e.g. `disabled: false`, `log_level: info`, `attribute_count_limit: 128`) are **not** encoded in the Zod schema. They are applied in the factory layer after parsing:

- `FileConfigFactory` — `applyConfigDefaults()` called after `ConfigurationSchema.safeParse()`
- `EnvironmentConfigFactory` — defaults set in constructor

This matches the approach taken by the Java and Python SDK implementations.

One intentional exception: `AttributeNameValue.type` is **not** defaulted by the parser even though the spec says "if omitted, string is used". This is a semantic default for the SDK init code that interprets resource attributes — it is not a config-parser concern. SDK code reading `resource.attributes` should apply `attr.type ?? 'string'` at the point of use.

#### Enum types

Pure string enum fields (e.g. `ExporterTemporalityPreference`, `ExemplarFilter`) are generated as both a `const` object and a string union type:

```typescript
export const ExporterTemporalityPreference = {
  Cumulative: "cumulative",
  Delta: "delta",
  LowMemory: "low_memory",
} as const;
export type ExporterTemporalityPreference =
  typeof ExporterTemporalityPreference[keyof typeof ExporterTemporalityPreference];
```

This gives consumers named value references (`ExporterTemporalityPreference.Delta`) while keeping the type compatible with plain string literals.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
