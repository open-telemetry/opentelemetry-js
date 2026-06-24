# Declarative Configuration Spec Conformance

This document tracks which fields of the [OpenTelemetry declarative configuration schema](https://github.com/open-telemetry/opentelemetry-configuration) the JS implementation (`@opentelemetry/configuration` + `@opentelemetry/sdk-node`) currently applies at runtime.

Schema version: **`1.1`**. The configuration package parses and validates the full schema; this doc only covers whether the SDK acts on each field.

| Status | Meaning |
| --- | --- |
| ✅ Supported | Parsed and applied to the SDK |
| ⚠️ Partial | Parsed and partially applied (see Notes) |
| ❌ Unsupported | Parsed and validated but ignored by the SDK |

## Top-level

| Field | Status | Notes |
| --- | --- | --- |
| `file_format` | ✅ | Major version `1` required; newer minor versions warn; other majors rejected. |
| `disabled` | ✅ | Returns a no-op SDK when `true`. |
| `log_level` | ✅ | Sets the `DiagConsoleLogger` level. |
| `attribute_limits.attribute_count_limit` | ✅ | Applied as the general `attributeCountLimit` on providers; default `128`. |
| `attribute_limits.attribute_value_length_limit` | ✅ | Applied as the general `attributeValueLengthLimit` on providers. |
| `disabled` (via `OTEL_SDK_DISABLED`) | ✅ | Env-var path mirrors file path. |

## `resource`

| Field | Status | Notes |
| --- | --- | --- |
| `attributes` | ✅ | Typed entries (`string`, `bool`, `int`, `double`, `*_array`). |
| `attributes_list` | ✅ | Comma-separated `key=value` form, percent-decoded per spec. |
| `schema_url` | ✅ | Applied to the produced `Resource`. |
| `detection/development.detectors.host` | ✅ | |
| `detection/development.detectors.os` | ✅ | |
| `detection/development.detectors.process` | ✅ | |
| `detection/development.detectors.service` | ✅ | Maps to `serviceInstanceIdDetector`. |
| `detection/development.detectors.env` | ✅ | |
| `detection/development.detectors.container` | ❌ | No `containerDetector` in JS today. |
| `detection/development.attributes` (include/exclude filters) | ❌ | Not yet wired. |

## `propagator`

| Field | Status | Notes |
| --- | --- | --- |
| `composite` | ✅ | Supports `tracecontext`, `baggage`, `b3`, `b3multi`, `jaeger`. Unknown names warn. |
| `composite_list` | ✅ | Comma-separated fallback; same supported set as `composite`. |
| Third-party / custom propagator names | ❌ | Awaiting component provider extensibility ([#5824](https://github.com/open-telemetry/opentelemetry-js/issues/5824), [#5825](https://github.com/open-telemetry/opentelemetry-js/issues/5825)). |

## `tracer_provider`

### Span processors and exporters

| Field | Status | Notes |
| --- | --- | --- |
| `processors[].batch` | ✅ | `schedule_delay`, `export_timeout`, `max_queue_size`, `max_export_batch_size` all applied. |
| `processors[].simple` | ✅ | |
| `processors[].batch.exporter.otlp_http` | ✅ | `endpoint`, `headers`, `headers_list`, `tls`, `compression`, `timeout`, `encoding` (`protobuf` / `json`). |
| `processors[].batch.exporter.otlp_grpc` | ✅ | `endpoint`, `headers`, `headers_list`, `tls` (with `insecure`), `compression`, `timeout`. |
| `processors[].batch.exporter.console` | ✅ | |
| `processors[].batch.exporter.zipkin` | ✅ | `endpoint`, `timeout`. |
| `processors[].batch.exporter.otlp_file/development` | ❌ | No file exporter in JS. |
| Third-party exporter types | ❌ | Awaiting component provider extensibility. |

### Limits

| Field | Status | Notes |
| --- | --- | --- |
| `limits.attribute_count_limit` | ✅ | |
| `limits.attribute_value_length_limit` | ✅ | |
| `limits.event_count_limit` | ✅ | |
| `limits.link_count_limit` | ✅ | |
| `limits.event_attribute_count_limit` | ✅ | |
| `limits.link_attribute_count_limit` | ✅ | |

### Sampler

| Field | Status | Notes |
| --- | --- | --- |
| `sampler.*` (all variants) | ❌ | Parsed and validated, but `tracer_provider.sampler` is **not** applied to the tracer provider. Tracked in [#6506](https://github.com/open-telemetry/opentelemetry-js/issues/6506). The SDK falls back to its default sampler. |

### Id generator

| Field | Status | Notes |
| --- | --- | --- |
| `id_generator.random` | ✅ | Uses the SDK's `RandomIdGenerator`. |
| `id_generator.*` (other) | ❌ | Unknown keys warn and fall back to the default. Awaiting component provider extensibility. |

## `meter_provider`

| Field | Status | Notes |
| --- | --- | --- |
| `readers[].periodic` | ✅ | `interval`, `timeout`, `producers` applied. |
| `readers[].periodic.exporter.otlp_http` | ✅ | `endpoint`, `headers`, `headers_list`, `tls`, `compression`, `timeout`, `encoding`, plus `temporality_preference` and `default_histogram_aggregation`. |
| `readers[].periodic.exporter.otlp_grpc` | ✅ | As above, with gRPC credentials. |
| `readers[].periodic.exporter.console` | ✅ | |
| `readers[].periodic.exporter.otlp_file/development` | ❌ | No file exporter in JS. |
| `readers[].pull` (Prometheus) | ❌ | Tracked in [#6063](https://github.com/open-telemetry/opentelemetry-js/issues/6063), [#6426](https://github.com/open-telemetry/opentelemetry-js/issues/6426). |
| `views[]` | ✅ | Instrument selection (`name`, `type`, `unit`, `meter_name`, `meter_version`, `meter_schema_url`) and stream config (`name`, `description`, `attribute_keys`, `aggregation`). |
| `exemplar_filter` | ❌ | Schema field exists, never passed to `MeterProvider`. |
| `cardinality_limits` | ❌ | Tracked in [#6425](https://github.com/open-telemetry/opentelemetry-js/issues/6425). |
| `meter_configurator/development` | ❌ | Per-meter enable / severity not implemented. |

## `logger_provider`

| Field | Status | Notes |
| --- | --- | --- |
| `processors[].batch` | ✅ | `schedule_delay`, `export_timeout`, `max_queue_size`, `max_export_batch_size` applied. |
| `processors[].simple` | ✅ | |
| `processors[].batch.exporter.otlp_http` | ✅ | Full property set as for traces. |
| `processors[].batch.exporter.otlp_grpc` | ✅ | |
| `processors[].batch.exporter.console` | ✅ | |
| `processors[].batch.exporter.otlp_file/development` | ❌ | No file exporter in JS. |
| `limits.attribute_count_limit` | ✅ | |
| `limits.attribute_value_length_limit` | ✅ | |
| `logger_configurator/development` | ❌ | Per-logger enable / severity not implemented. |

## Cross-cutting

| Topic | Status | Notes |
| --- | --- | --- |
| Environment variable substitution (`${VAR}`, `${VAR:-default}`, `${env:VAR}`, `$$`) | ✅ | |
| Warnings on invalid / unrecognized scalar values | ⚠️ | Some paths warn (propagators, id_generator); broader coverage tracked in [#6107](https://github.com/open-telemetry/opentelemetry-js/issues/6107). |
| Component provider registration (third-party samplers / exporters / propagators) | ❌ | Tracked in [#5824](https://github.com/open-telemetry/opentelemetry-js/issues/5824), [#5825](https://github.com/open-telemetry/opentelemetry-js/issues/5825). |
| Honoring `OTEL_*` env vars when no config file is set | ✅ | `EnvironmentConfigFactory` builds an equivalent model from the standard SDK env vars. |

## Keeping this doc current

When a PR adds, removes, or changes wiring for a configuration field, update the matching row here. The [JavaScript Declarative Configuration project board](https://github.com/orgs/open-telemetry/projects/157) tracks in-flight work.
