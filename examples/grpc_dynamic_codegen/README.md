# Overview

Our service takes in a payload containing bytes and capitalizes them.

Using OpenTelemetry gRPC Instrumentation, we can collect traces of our system and export them to the backend of our choice (we can use Zipkin or Jaeger for this example), to give observability to our distributed systems.

> This is the dynamic code generation variant of the gRPC examples. Code in these examples is generated at runtime using Protobuf.js.

## Installation

```sh
$ # from this directory
$ npm install
```

Setup [Zipkin Tracing](https://zipkin.io/pages/quickstart.html)
or
Setup [Jaeger Tracing](https://www.jaegertracing.io/docs/latest/getting-started/#all-in-one)

## Run the Application

### Zipkin

 - Run the server

   ```sh
   $ # from this directory
   $ npm run zipkin:server
   ```

 - Run the client

   ```sh
   $ # from this directory
   $ npm run zipkin:client
   ```

### Jaeger

 - Run the server

   ```sh
   $ # from this directory
   $ npm run jaeger:server
   ```

 - Run the client

   ```sh
   $ # from this directory
   $ npm run jaeger:client
   ```

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on OpenTelemetry for Node.js, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node-sdk>

## LICENSE

Apache License 2.0
