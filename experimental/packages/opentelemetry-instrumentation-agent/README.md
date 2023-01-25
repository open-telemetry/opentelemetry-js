# <img src="https://opentelemetry.io/img/logos/opentelemetry-logo-nav.png" alt="OpenTelemetry Icon" width="45" height=""> OpenTelemetry Instrumentation Agent

## About

This project provides a Javascript agent that can be injected to any Javascript application to capture telemetry from a number of popular libraries and frameworks.
You can export the telemetry data in a variety of formats.
You can configure the agent and exporter via environment variables.
The net result is the ability to gather telemetry data from a Javascript application without any code changes.

## Quick Start

Install the package:

```shell
npm install @opentelemetry/instrumentation-agent
```

This package includes the instrumentation agent as well as instrumentation for all supported libraries and all available data exporters.
The package provides a completely automatic, out-of-the-box experience.

Enable the instrumentation agent by requiring this package using the `--require` flag:

```shell
node --require '@opentelemetry/instrumentation-agent' app.js
```

If your `node` is encapsulated in a complex run script, you can also set it via an environment variable before running `node`.

```shell
env NODE_OPTIONS="--require @opentelemetry/instrumentation-agent"
```

## Configuration

The agent is highly configurable using environment variables. Many aspects of the agent's behavior can be configured for your needs, such as exporter choice, exporter configuration, trace context propagation headers, and much more.

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_COMPRESSION="gzip"
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://your-endpoint"
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=your-api-key"
export OTEL_EXPORTER_OTLP_TRACES_HEADERS="x-api-key=your-api-key"
export OTEL_RESOURCE_ATTRIBUTES="service.namespace=my-namespace"
export OTEL_SERVICE_NAME="client"
export NODE_OPTIONS="--require @opentelemetry/instrumentation-agent"
node app.js
```

[Click here to see the detailed list of configuration environment variables and system properties.](https://opentelemetry.io/docs/instrumentation/java/automatic/agent-config/)

## Troubleshooting

To turn on the agent's internal debug logging, set the following environment variable:

`export OTEL_LOG_LEVEL=debug`

**Note**: These logs are extremely verbose. Enable debug logging only when needed.
Debug logging negatively impacts the performance of your application.
