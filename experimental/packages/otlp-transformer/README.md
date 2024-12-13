# OpenTelemetry Protocol

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This package is intended for internal use only.**

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package provides everything needed to serialize [OpenTelemetry SDK][sdk] traces, metrics and logs into the [OpenTelemetry Protocol][otlp] format.

## Quick Start

To get started you will need to install a compatible OpenTelemetry API.

### Install Peer Dependencies

```sh
npm install @opentelemetry/api
```

### Serialize Traces/Metrics/Logs

This package exports functions to serialize traces, metrics and logs from the OpenTelemetry SDK into OTLP JSON format, which can be sent over HTTP to the OpenTelemetry collector or a compatible receiver.

```typescript
import {
  createExportTraceServiceRequest,
  createExportMetricsServiceRequest,
  createExportLogsServiceRequest,
} from '@opentelemetry/otlp-transformer';

const serializableSpans = createExportTraceServiceRequest(readableSpans);
const serializableMetrics = createExportMetricsServiceRequest(readableMetrics);
const serializableLogs = createExportLogsServiceRequest(readableLogRecords);
```

Note that these functions return JSON-serializable objects (i.e. JavaScript objects that can be passed into `JSON.stringify(...)`) adhering to the OTLP JSON format, not the serialized JSON-text payload themselves.

### Protobuf (Binary) Serializers

Additionally, this package also exports serializers to serialize traces, metrics and logs into the export requests using the OTLP binary protobuf format, as well as deserializing the corresponding binary response payloads.

```typescript
import {
  ProtobufTraceSerializer,
  ProtobufMetricsSerializer,
  ProtobufLogsSerializer,
} from '@opentelemetry/otlp-transformer/protobuf';

const serializedSpans: Uint8Array =
  ProtobufTraceSerializer.serializeRequest(readableSpans);
const serializedMetrics: Uint8Array =
  ProtobufMetricsSerializer.serializeRequest(readableMetrics);
const serializedLogs: Uint8Array =
  ProtobufLogsSerializer.serializeRequest(readableLogRecords);

// ...

const deserializedTraceResponse = ProtobufTraceSerializer.deserializeResponse(
  serializedTraceResponse /* Uint8Array */
);
const deserializedMetricsResponse =
  ProtobufMetricsSerializer.deserializeResponse(
    serializedTraceResponse /* Uint8Array */
  );
const deserializedLogsResponse = ProtobufLogsSerializer.deserializeResponse(
  serializedTraceResponse /* Uint8Array */
);
```

### JSON Serializers

For feature parity, this package also exports JSON serializers with the same interfaces:

```typescript
import {
  JsonTraceSerializer,
  JsonMetricsSerializer,
  JsonLogsSerializer,
} from '@opentelemetry/otlp-transformer/json';

const serializedSpans: Uint8Array =
  JsonTraceSerializer.serializeRequest(readableSpans);
const serializedMetrics: Uint8Array =
  JsonMetricsSerializer.serializeRequest(readableMetrics);
const serializedLogs: Uint8Array =
  JsonLogsSerializer.serializeRequest(readableLogRecords);

// ...

const deserializedTraceResponse = JsonTraceSerializer.deserializeResponse(
  serializedTraceResponse /* Uint8Array */
);
const deserializedMetricsResponse = JsonMetricsSerializer.deserializeResponse(
  serializedTraceResponse /* Uint8Array */
);
const deserializedLogsResponse = JsonLogsSerializer.deserializeResponse(
  serializedTraceResponse /* Uint8Array */
);
```

Unlike the `createExport*Request` functions (and similar to the binary protobuf serializers), these serializer methods return the _serialized_ bytes directly, skipping the need to further serialize them with `JSON.stringify(...)`.

Among other things, the `Uint8Array` can be used directly as the `body` of a `fetch()` request. Likewise, a `Uint8Array` of the response body can be obtained from `await response.bytes()`.

### Experimental Features

As we iterate towards the stabilization of this package, certain features are expected to remain in experimental status. These features are subject to changes and breakages between minor versions of the package, even after the package itself reaches version `1.0`.

These features are exported from the `@opentelemetry/otlp-transformer/experimental` entrypoint. Currently, this entrypoint is empty, as the entire package is considered experimental at the moment. It is expected to be utilized as part of upcoming stabilization efforts.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/otlp-transformer
[npm-img]: https://badge.fury.io/js/%40opentelemetry%otlp-transformer.svg

[sdk]: https://github.com/open-telemetry/opentelemetry-js
[otlp]: https://github.com/open-telemetry/opentelemetry-proto
