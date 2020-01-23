# Overview

OpenTelemetry IORedis Instrumentation allows the user to automatically collect trace data and export them to the backend of choice (we can use Zipkin or Jaeger for this example), to give observability to distributed systems.

## Tracing backend setup

### Zipkin

- Setup [Zipkin Tracing](https://zipkin.io/pages/quickstart.html)

- Set EXPORTER variable

  ```sh
  export EXPORTER=zipkin
  ```

### Jaeger

- Setup [Jaeger Tracing](https://www.jaegertracing.io/docs/latest/getting-started/#all-in-one)

- Set EXPORTER variable

  ```sh
  export EXPORTER=jaeger
  ```

## Installation

```sh
npm install
```

## Run the Application

- Start redis via docker

   ```sh
   npm run docker:start
   ```

- Run the main program

   ```sh
   npm start
   ```

- Cleanup docker

   ```sh
   npm run docker:stop
   ```

## LICENSE

Apache License 2.0
