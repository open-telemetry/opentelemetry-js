# OpenTelemetry Declarative Configuration

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package implements the [OpenTelemetry declarative configuration](https://github.com/open-telemetry/opentelemetry-configuration) specification for Node.js. It parses configuration from a YAML file or environment variables and produces a `ConfigurationModel` that the OpenTelemetry SDK uses to initialize providers.

## Installation

```sh
npm install @opentelemetry/configuration
```

## Usage

`createConfigFactory()` selects the configuration source automatically:

- If `OTEL_CONFIG_FILE` points to a valid `.yaml`/`.yml` file, configuration is read from that file.
- Otherwise, configuration is assembled from standard OpenTelemetry environment variables.

```typescript
import { createConfigFactory } from '@opentelemetry/configuration';

const factory = createConfigFactory();
const config = factory.getConfigModel();
```

### YAML file configuration

Set `OTEL_CONFIG_FILE` to the path of your configuration file:

```sh
OTEL_CONFIG_FILE=./otel-config.yaml node app.js
```

Example:

```yaml
file_format: "1.0"
resource:
  attributes:
    - name: service.name
      value: my-service
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/traces
```

Environment variable substitution is supported using `${VAR_NAME}`, `${VAR_NAME:-default}`, `${env:VAR_NAME}`, and `${env:VAR_NAME:-default}` syntax. Use `$$` for a literal `$`.

```yaml
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_ENDPOINT:-http://localhost:4318}/v1/traces
```

### Environment variable configuration

When no config file is set, the factory reads from the standard OpenTelemetry SDK environment variables:

| Variable | Description |
| --- | --- |
| `OTEL_SDK_DISABLED` | Disable the SDK entirely |
| `OTEL_LOG_LEVEL` | Internal SDK log level |
| `OTEL_SERVICE_NAME` | Service name resource attribute |
| `OTEL_RESOURCE_ATTRIBUTES` | Comma-separated resource attributes |
| `OTEL_TRACES_EXPORTER` | Traces exporter(s): `otlp`, `console`, `none` |
| `OTEL_METRICS_EXPORTER` | Metrics exporter(s): `otlp`, `prometheus`, `console`, `none` |
| `OTEL_LOGS_EXPORTER` | Logs exporter(s): `otlp`, `console`, `none` |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | OTLP protocol: `grpc`, `http/protobuf`, `http/json` |
| `OTEL_PROPAGATORS` | Propagators: `tracecontext`, `baggage`, `b3`, `b3multi` |

## Development

### Generated files

`src/generated/` is auto-generated — do not edit manually. It contains:

- `types.ts` — TypeScript interfaces derived from the JSON schema (via `json-schema-to-typescript`)
- `schema.ts` — The raw JSON schema exported as a constant (retained for reference; not used at runtime)
- `validator.js` — Pre-compiled ajv validator (ahead-of-time compiled from the schema at build time; eliminates runtime `ajv.compile()`)
- `validator.d.ts` — TypeScript declarations for `validator.js`

### Regenerating after a schema version bump

1. Update the `CONFIG_VERSION` variable in `scripts/config/generate-config.sh`
2. Run from this package directory:

   ```sh
   npm run generate:config
   ```

3. Review the diff in `src/generated/types.ts`, `src/generated/schema.ts`, and `src/generated/validator.js`
4. Update `supportedFileVersionPattern` in `src/FileConfigFactory.ts` if the new version falls outside the current regex
5. Update `EnvironmentConfigFactory.ts` and `utils.ts` if new fields need env var mapping

The generation script (`scripts/config/generate-config.js`) handles several post-processing steps:

- Renames the root type from `OpenTelemetryConfiguration` to `ConfigurationModel`
- Makes `file_format` optional (required at parse time but not needed when constructing the model in code)
- Replaces narrow index signatures (`[k: string]: {} | null`) with `[k: string]: unknown`
- Deduplicates structurally-identical TLS types (`GrpcTls1`/`HttpTls1` → `GrpcTls`/`HttpTls`)
- Produces a pre-compiled ajv validator (`validator.js` + `validator.d.ts`) for use at runtime

### Defaults

Both config paths apply the same spec-defined defaults so consumers see consistent behaviour regardless of config source:

| Field | Default |
| --- | --- |
| `disabled` | `false` |
| `log_level` | `info` |
| `attribute_limits.attribute_count_limit` | `128` |

`FileConfigFactory` applies these via `applyConfigDefaults()` after schema validation. `EnvironmentConfigFactory` applies them via `initializeDefaultConfiguration()` in the constructor, then overlays env var values on top.

One intentional exception in both paths: `AttributeNameValue.type` is **not** defaulted even though the spec says "if omitted, string is used". This is a semantic default for SDK code interpreting resource attributes, not a config-parser concern. SDK code reading `resource.attributes` should apply `attr.type ?? 'string'` at the point of use.

## Supported schema versions

- `1.0`

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
