# Overview

OpenTelemetry IORedis Instrumentation allows the user to automatically collect trace data and export them to the backend(s) of choice (Jaeger in this example).

## Tracing backend setup

### Jaeger

- Setup [Jaeger Tracing](https://www.jaegertracing.io/docs/latest/getting-started/#all-in-one)

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
   npm run start
   ```

- Cleanup docker

   ```sh
   npm run docker:stop
   ```

## LICENSE

Apache License 2.0
