# Overview

OpenTelemetry HTTP Instrumentation allows the user to automatically collect trace data and export them to the backend of choice (we can use Zipkin for this example), to give observability to distributed systems.

This is a simple example that demonstrates tracing HTTP request from client to server. The example
shows key aspects of tracing such as

- Root Span (on Client)
- Child Span (on Client)
- Child Span from a Remote Parent (on Server)
- SpanContext Propagation (from Client to Server)
- Span Events
- Span Attributes

## Installation

```sh
git clone https://github.com/open-telemetry/opentelemetry-js.git
cd examples/http
npm install
```

Setup [Zipkin Tracing](https://zipkin.io/pages/quickstart.html), for example:

```sh
docker run -d -p 9411:9411 openzipkin/zipkin
```

## Run the Application

Run the server:

```sh
npm run server
```

Run the client

```sh
npm run client
```

#### Zipkin UI

`npm run server` should output the trace ID in the terminal (e.g `traceId: 4815c3d576d930189725f1f1d1bdfcc6`).
- Go to Zipkin at <http://localhost:9411/zipkin>
- Enter the trace ID in the "Search by trace ID" form (top right).

<p align="center"><img alt="Zipkin UI showing a trace" src="./images/zipkin-ui.png?raw=true"/></p>

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on OpenTelemetry for Node.js, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-sdk-node>

## LICENSE

Apache License 2.0
