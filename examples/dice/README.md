# Dice Example

This is the Node.js implementation of the OpenTelemetry [Getting Started][]
reference application, extended with patterns from the [Instrumentation][] guide.
It shows how to instrument a Node.js application with OpenTelemetry, adding
distributed tracing, metrics, and log collection to a dice-rolling service.
It demonstrates instrumentation with existing frameworks (Express, HTTP,
Winston) and manual instrumentation of application logic.

[Getting Started]: https://opentelemetry.io/docs/languages/js/getting-started/nodejs/
[Instrumentation]: https://opentelemetry.io/docs/languages/js/instrumentation/

There are two versions:

- **uninstrumented/** — the plain application with no OpenTelemetry
- **instrumented/** — the same application with OpenTelemetry added via `--import ./instrumentation.ts`

## Installation

```sh
# from the uninstrumented or instrumented directory
npm install
```

## Run the Application

### Uninstrumented

```sh
cd uninstrumented
npm start
```

### Instrumented

By default, the OpenTelemetry Node SDK uses the OTLP exporter for traces,
metrics, and logs. Set the exporters to `console` to print telemetry locally
while trying the example:

```sh
cd instrumented
OTEL_SERVICE_NAME=dice-server \
OTEL_TRACES_EXPORTER=console \
OTEL_METRICS_EXPORTER=console \
OTEL_LOGS_EXPORTER=console \
npm start
```

Spans, metrics, and logs will be printed to the console. To send telemetry to an
OTLP collector:

```sh
OTEL_SERVICE_NAME=dice-server \
OTEL_TRACES_EXPORTER=otlp \
OTEL_METRICS_EXPORTER=otlp \
OTEL_LOGS_EXPORTER=otlp \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
npm start
```

You can also export telemetry to more than one destination:

```sh
OTEL_SERVICE_NAME=dice-server \
OTEL_TRACES_EXPORTER=otlp,console \
OTEL_METRICS_EXPORTER=otlp,console \
OTEL_LOGS_EXPORTER=otlp,console \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
npm start
```

To enable OpenTelemetry diagnostic logging, set `OTEL_LOG_LEVEL=debug`.

### Docker

Build and run the uninstrumented version:

```sh
docker build -t otel-js-dice-uninstrumented ./uninstrumented
docker run --rm -p 8080:8080 otel-js-dice-uninstrumented
```

Build and run the instrumented version with console exporters:

```sh
docker build -t otel-js-dice-instrumented ./instrumented
docker run --rm -p 8080:8080 \
  -e OTEL_SERVICE_NAME=dice-server \
  -e OTEL_TRACES_EXPORTER=console \
  -e OTEL_METRICS_EXPORTER=console \
  -e OTEL_LOGS_EXPORTER=console \
  otel-js-dice-instrumented
```

### Test the endpoint

```sh
curl http://localhost:8080/rolldice
curl "http://localhost:8080/rolldice?rolls=3"
curl "http://localhost:8080/rolldice?rolls=2&player=Alice"
```

## API

### `GET /rolldice`

Roll one or more six-sided dice.

| Query parameter | Type    | Required | Description                                                      |
|-----------------|---------|----------|------------------------------------------------------------------|
| `rolls`         | integer | No       | Number of dice to roll. Defaults to `1`. Must be positive.       |
| `player`        | string  | No       | Player name used in debug log output.                            |

### Responses

| Condition                                 | Status | Body                                                                        |
|-------------------------------------------|--------|-----------------------------------------------------------------------------|
| `rolls` not set or valid positive integer | `200`  | Single integer or JSON array of integers from `1` to `6`                    |
| `rolls` is not a number                   | `400`  | `{"status":"error","message":"Parameter rolls must be a positive integer"}` |
| `rolls` is `0` or negative                | `500`  | Empty body                                                                  |

## OpenTelemetry Signals

The instrumented version emits the following signals.

### Resources

The SDK detects common resource attributes, including SDK, process, and host
attributes. Set `OTEL_SERVICE_NAME` and `OTEL_RESOURCE_ATTRIBUTES` to add
service-specific resource attributes.

### Traces

| Span name                     | Kind       | Attributes                          |
|-------------------------------|------------|-------------------------------------|
| `GET /rolldice`               | `SERVER`   | HTTP semantic convention attributes |
| `request handler - /rolldice` | `INTERNAL` | Express instrumentation attributes  |
| `rollTheDice`                 | `INTERNAL` | `code.function`, `dice.rolls`       |
| `rollOnce`                    | `INTERNAL` | `code.function`, `dice.value`       |

### Metrics

| Metric name             | Type      | Description                                      |
|-------------------------|-----------|--------------------------------------------------|
| `dice.rolls`            | Counter   | Number of times `rollTheDice` is called          |
| `dice.value`            | Histogram | Distribution of dice roll outcomes from `1`-`6`  |
| `dice.rolls_last_value` | Gauge     | Last value of the `rolls` parameter              |

### Logs

Winston log records are bridged to OpenTelemetry by
`@opentelemetry/instrumentation-winston`.

| Level   | Condition                              |
|---------|----------------------------------------|
| `INFO`  | Server startup and successful requests |
| `WARN`  | Invalid `rolls` parameter              |
| `ERROR` | Failed dice roll                       |
| `DEBUG` | Player name and rolled value           |

## Environment Variables

This example uses standard OpenTelemetry SDK environment variables. The table
below lists the variables used by this example; see the [NodeSDK environment
configuration][] docs for the full list.

| Variable                      | Default | Description                                                             |
|-------------------------------|---------|-------------------------------------------------------------------------|
| `APPLICATION_PORT`            | `8080`  | Port the server listens on                                              |
| `OTEL_SERVICE_NAME`           | unset   | Service name reported in telemetry                                      |
| `OTEL_RESOURCE_ATTRIBUTES`    | unset   | Additional resource attributes                                          |
| `OTEL_TRACES_EXPORTER`        | `otlp`  | Trace exporters. Values include `otlp`, `console`, and `none`           |
| `OTEL_METRICS_EXPORTER`       | `otlp`  | Metric exporter. Values include `otlp`, `console`, and `none`           |
| `OTEL_LOGS_EXPORTER`          | `otlp`  | Log exporters. Values include `otlp`, `console`, and `none`             |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | unset   | OTLP endpoint, for example `http://localhost:4318`                      |
| `OTEL_LOG_LEVEL`              | `INFO`  | OpenTelemetry internal log level                                        |

[NodeSDK environment configuration]: ../../experimental/packages/opentelemetry-sdk-node/README.md#configure-exporters-from-environment

## LICENSE

Apache License 2.0
