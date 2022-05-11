# OpenTelemetry Protocol

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This package provides everything needed to serialize [OpenTelemetry SDK][sdk] traces and metrics into the [OpenTelemetry Protocol][otlp] format using [protocol buffers][protobuf] or JSON.
It also contains service clients for exporting traces and metrics to the OpenTelemetry Collector or a compatible receiver using using OTLP over [gRPC][grpc].
This module uses [`protobufjs`][protobufjs] for serialization and is compatible with [`@grpc/grpc-js`][grpc-js].

## Quick Start

To get started you will need to install a compatible OpenTelemetry API.

### Install Peer Dependencies

```sh
npm install \
    @opentelemetry/api \
    @grpc/grpc-js # only required if you are using gRPC
```

### Serialize Traces and Metrics

This module exports functions to serialize traces and metrics from the OpenTelemetry SDK into protocol buffers which can be sent over HTTP to the OpenTelemetry collector or a compatible receiver.

```typescript
import { createExportTraceServiceRequest, createExportMetricsServiceRequest } from "@opentelemetry/otlp-transformer";

const serializedSpans = createExportTraceServiceRequest(readableSpans);
const serializedMetrics = createExportMetricsServiceRequest(readableMetrics);
```

### Create gRPC Service Clients

This module also contains gRPC service clients for exporting traces and metrics to an OpenTelemetry collector or compatible receiver over gRPC.
In order to avoid bundling a gRPC module with this module, it is required to construct an RPC implementation to pass to the constructor of the service clients.
Any RPC implementation compatible with `grpc` or `@grpc/grpc-js` may be used, but `@grpc/grpc-js` is recommended.

```typescript
import type { RPCImpl } from 'protobufjs';
import { makeGenericClientConstructor, credentials } from '@gprc/grpc-js';
import { MetricServiceClient, TraceServiceClient } from "@opentelemetry/otlp-transformer";

// Construct a RPC Implementation according to protobufjs docs
const GrpcClientConstructor = makeGenericClientConstructor({});

const metricGRPCClient = new GrpcClientConstructor(
    "http://localhost:4317/v1/metrics", // default collector metrics endpoint
    credentials.createInsecure(),
);

const traceGRPCClient = new GrpcClientConstructor(
    "http://localhost:4317/v1/traces", // default collector traces endpoint
    credentials.createInsecure(),
);

const metricRpc: RPCImpl = function(method, requestData, callback) {
  metricGRPCClient.makeUnaryRequest(
    method.name,
    arg => arg,
    arg => arg,
    requestData,
    callback
  );
}

const traceRpc: RPCImpl = function(method, requestData, callback) {
  traceGRPCClient.makeUnaryRequest(
    method.name,
    arg => arg,
    arg => arg,
    requestData,
    callback
  );
}

// Construct service clients to use RPC Implementations
const metricServiceClient = new MetricServiceClient({
    rpcImpl: metricRpc,
    startTime: Date.now(), // exporter start time in milliseconds
});

const traceServiceClient = new TraceServiceClient({
    rpcImpl: traceRpc,
});

// Export ReadableSpan[] and ReadableMetric[] over gRPC
await metricServiceClient.export(readableMetrics);
await traceServiceClient.export(readableSpans);
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
[npm-url]: https://www.npmjs.com/package/@opentelemetry/otlp-transformer
[npm-img]: https://badge.fury.io/js/%40opentelemetry%otlp-transformer.svg

[sdk]: https://github.com/open-telemetry/opentelemetry-js
[otlp]: https://github.com/open-telemetry/opentelemetry-proto

[protobuf]: https://developers.google.com/protocol-buffers
[grpc]: https://grpc.io/

[protobufjs]: https://www.npmjs.com/package/protobufjs
[grpc-js]: https://www.npmjs.com/package/@grpc/grpc-js
