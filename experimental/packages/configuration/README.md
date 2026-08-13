# OpenTelemetry Declarative Configuration

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package implements the [OpenTelemetry declarative configuration](https://github.com/open-telemetry/opentelemetry-configuration) specification for Node.js. It parses configuration from a YAML file and produces a `ConfigurationModel` that can be used to initialize an OpenTelemetry SDK.

## Installation

```sh
npm install @opentelemetry/configuration
```

## Usage

```js
import { parseConfigFile } from '@opentelemetry/configuration';
const config = parseConfigFile('./otel-sdk-config.yaml');
```

An extremely limit example configuration file:

```yaml
file_format: "1.1"
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_ENDPOINT:-http://localhost:4318}/v1/traces
```

Environment variable substitution is supported using `${VAR_NAME}`, `${VAR_NAME:-default}`, `${env:VAR_NAME}`, and `${env:VAR_NAME:-default}` syntax. Use `$$` for a literal `$`.

See https://opentelemetry.io/docs/specs/otel/configuration/#declarative-configuration and https://github.com/open-telemetry/opentelemetry-configuration for documentation, examples, and a JSON schema for declarative configuration.

## Supported schema versions

- `1.0`
- `1.1`

For a per-field view of which schema fields the SDK currently applies, see
the JS row in the cross-SDK [language support status][lss] doc maintained in
the `opentelemetry-configuration` repo. That doc is the source of truth for
declarative-config conformance across all SDKs.

[lss]: https://github.com/open-telemetry/opentelemetry-configuration/blob/main/language-support-status.md#js-

## Exported types

Types exported from this package that model configuration data use a `ConfigModel` suffix (e.g. `SamplerConfigModel`, `SpanExporterConfigModel`) rather than their schema name (e.g. `Sampler`, `SpanExporter`). This keeps them from colliding with the SDK runtime types of the same name. The root type is `ConfigurationModel`.

Internally the package uses the schema names from `src/generated/types.ts`; the renaming happens at export time in `src/index.ts`. Follow this convention when adding new exports.

## Development

### Generated files

`src/generated/` is auto-generated — do not edit manually. It contains:

- `types.ts` — TypeScript interfaces derived from the JSON schema (via `json-schema-to-typescript`)
- `validator.js` — Pre-compiled ajv validator (ahead-of-time compiled from the schema at build time; eliminates runtime `ajv.compile()`)
- `validator.d.ts` — TypeScript declarations for `validator.js`

### Regenerating after a schema version bump

1. Update the `CONFIG_VERSION` constant in `scripts/generate-config.js`
2. Run from this package directory:

   ```sh
   npm run generate:config
   ```

3. Review the diff in `src/generated/types.ts` and `src/generated/validator.js`
4. Update `SUPPORTED_FILE_FORMAT_MAJOR` / `SUPPORTED_FILE_FORMAT_MINOR` in `src/FileConfigFactory.ts` if the new schema version is outside the currently-supported range
5. Update `EnvironmentConfigFactory.ts` and `utils.ts` if new fields need env var mapping

The generation script (`scripts/generate-config.js`) handles several post-processing steps:

- Renames the root type from `OpenTelemetryConfiguration` to `ConfigurationModel`
- Makes `file_format` optional (required at parse time but not needed when constructing the model in code)
- Removes the duplicate type declarations that `json-schema-to-typescript` emits for structurally-identical sub-schemas (e.g. the second `GrpcTls`/`HttpTls`)
- Produces a pre-compiled ajv validator (`validator.js` + `validator.d.ts`) for use at runtime

## Useful links

- [OpenTelemetry Declarative Configuration Specification](https://github.com/open-telemetry/opentelemetry-configuration)
- [OpenTelemetry for Node.js](https://github.com/open-telemetry/opentelemetry-js)
- [OpenTelemetry Community](https://opentelemetry.io/)

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[npm-url]: https://www.npmjs.com/package/@opentelemetry/configuration
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fconfiguration.svg
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
