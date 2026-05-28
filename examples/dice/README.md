# Overview

This is the Node.js implementation of the OpenTelemetry [Getting Started][] reference application,
extended with patterns from the [Instrumentation][] guide.
It shows how to instrument a Node.js application with OpenTelemetry,
adding distributed tracing, metrics, and log collection to a dice-rolling service.
It demonstrates auto-instrumentation with existing frameworks (Express,
HTTP, Winston) and manual instrumentation of application logic.

[Getting Started]: https://opentelemetry.io/docs/languages/js/getting-started/nodejs/
[Instrumentation]: https://opentelemetry.io/docs/languages/js/instrumentation/

There are two versions:

- **uninstrumented/** — the plain application with no OpenTelemetry
- **instrumented/** — the same application with OpenTelemetry added via `--import ./instrumentation.mjs`

## Installation

```sh
# from the uninstrumented or instrumented directory
npm install
```

## Run the Application

### Uninstrumented

```sh
cd uninstrumented
node app.js
```

### Instrumented

```sh
cd instrumented
OTEL_SERVICE_NAME=dice-server node --import ./instrumentation.mjs app.js
```

Spans, metrics, and logs will be printed to the console. To send telemetry to an OTLP collector:

```sh
OTEL_SERVICE_NAME=dice-server OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
  node --import ./instrumentation.mjs app.js
```

To enable OpenTelemetry diagnostic logging, set `OTEL_LOG_LEVEL=debug`.

### Docker

```sh
docker build -t otel-js-dice-uninstrumented ./uninstrumented
docker run --rm -p 8080:8080 otel-js-dice-uninstrumented
```

```sh
docker build -t otel-js-dice-instrumented ./instrumented
docker run --rm -p 8080:8080 \
  -e OTEL_SERVICE_NAME=dice-server \
  otel-js-dice-instrumented
```

### Test the endpoint

```sh
curl http://localhost:8080/rolldice
curl "http://localhost:8080/rolldice?rolls=3"
curl "http://localhost:8080/rolldice?rolls=2&player=Alice"
```

## LICENSE

Apache License 2.0
