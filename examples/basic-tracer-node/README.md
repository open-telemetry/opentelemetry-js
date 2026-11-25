# Overview

This example shows how to use [@opentelemetry/sdk-trace](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/sdk-trace) to instrument a simple Node.js application - e.g. a batch job.

Our example will export spans data simultaneously on the `Console` and to an OTLP-compatible receiver (like Jaeger or an OpenTelemetry Collector) using [@opentelemetry/exporter-trace-otlp-proto](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/exporter-trace-otlp-proto).

## Installation

```sh
# from this directory
npm install
```

(Optional) Setup the OpenTelemetry Collector and Jaeger using Docker:

```sh
docker compose -f docker/ot/docker-compose.yaml up -d
```

## Run the Application

```sh
# from this directory
npm start
```

### Jaeger UI

Open the Jaeger UI in your browser [http://localhost:16686](http://localhost:16686)

Select `basic-service` under *Service* and click on *Find Traces*.

Click on the trace to view its details.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracing, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/sdk-trace>

## LICENSE

Apache License 2.0
