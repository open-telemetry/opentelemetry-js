# OpenTelemetry OTLP-JSON File and Standard Output Exporter

[![NPM Published Version](https://img.shields.io/npm/v/@opentelemetry/exporter-otlp-json-file.svg)](https://www.npmjs.com/package/@opentelemetry/exporter-otlp-json-file)
[![Apache License](https://img.shields.io/badge/license-Apache_2.0-green.svg)](#license)

This package provides OpenTelemetry span, metric, and log exporters that write standard OTLP-JSON payloads to `process.stdout` (or any custom `Writable` stream) as [JSON Lines](https://jsonlines.org/) (`.jsonl`), with one complete `Export*ServiceRequest` per line.

This follows the [OpenTelemetry Protocol File Exporter specification](https://opentelemetry.io/docs/specs/otel/protocol/file-exporter/).

## Why use this exporter?

- **Production-ready OTLP output:** Unlike `ConsoleSpanExporter` / `ConsoleMetricExporter` / `ConsoleLogRecordExporter` which emit human-readable debug dumps, this exporter produces valid OTLP envelopes (`ExportTraceServiceRequest`, `ExportMetricsServiceRequest`, `ExportLogsServiceRequest`) using `@opentelemetry/otlp-transformer`.
- **Zero-sidecar / Serverless environments:** In AWS Lambda, Google Cloud Run, Kubernetes pods, or short-lived jobs, running an OpenTelemetry Collector sidecar or performing in-request network I/O adds latency and cold-start overhead. Emitting OTLP-JSON to stdout allows log collectors (e.g. FluentBit, Vector, Datadog Agent, CloudWatch) to scrape and forward telemetry asynchronously out of band.
- **Stream & File flexibility:** By default, output writes to `process.stdout`. You can also supply any Node.js `stream.Writable`, such as an `fs.createWriteStream()` file stream.

## Installation

```bash
npm install --save @opentelemetry/exporter-otlp-json-file
```

## Usage

### 1. Manual SDK Usage

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  OtlpJsonFileSpanExporter,
  OtlpJsonFileMetricExporter,
  OtlpJsonFileLogExporter,
} from '@opentelemetry/exporter-otlp-json-file';

// Default: emits compact JSON Lines to process.stdout
const sdk = new NodeSDK({
  spanProcessors: [new BatchSpanProcessor(new OtlpJsonFileSpanExporter())],
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OtlpJsonFileMetricExporter(),
  }),
  logRecordProcessors: [new BatchLogRecordProcessor(new OtlpJsonFileLogExporter())],
});

sdk.start();
```

### 2. Exporting to a File Stream

You can direct output to a local file stream using the `out` configuration option:

```typescript
import * as fs from 'fs';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OtlpJsonFileSpanExporter } from '@opentelemetry/exporter-otlp-json-file';

const fileStream = fs.createWriteStream('./traces.jsonl', { flags: 'a' });

const spanProcessor = new BatchSpanProcessor(
  new OtlpJsonFileSpanExporter({ out: fileStream })
);
```

### 3. Metric Aggregation Temporality

`OtlpJsonFileMetricExporter` defaults to `AggregationTemporality.CUMULATIVE`. You can configure a delta or low-memory preference via `temporalityPreference`:

```typescript
import {
  OtlpJsonFileMetricExporter,
  AggregationTemporalityPreference,
} from '@opentelemetry/exporter-otlp-json-file';

const metricExporter = new OtlpJsonFileMetricExporter({
  temporalityPreference: AggregationTemporalityPreference.DELTA,
});
```

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `out` | `stream.Writable` | `process.stdout` | Destination stream where newline-delimited OTLP JSON lines are written. |
| `temporalityPreference` *(metrics only)* | `AggregationTemporalityPreference \| AggregationTemporality` | `CUMULATIVE` | Preferred aggregation temporality for metric instruments. |
| `aggregationPreference` *(metrics only)* | `AggregationSelector` | `undefined` | Custom aggregation selector function. |

## Stream Ownership and Lifecycle

- **Stdout:** `shutdown()` flushes all pending writes but never closes or ends `process.stdout`.
- **Custom Streams:** `shutdown()` flushes all pending writes to the provided stream. The exporter does not destroy or close caller-provided streams, leaving stream lifecycle ownership with the caller.

## Useful Links

- [OpenTelemetry Protocol File Exporter Specification](https://opentelemetry.io/docs/specs/otel/protocol/file-exporter/)
- [OpenTelemetry Website](https://opentelemetry.io/)

## License

Apache 2.0 - See [LICENSE](./LICENSE) for more information.
