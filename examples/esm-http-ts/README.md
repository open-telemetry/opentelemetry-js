# Overview

This is a simple example that demonstrates tracing HTTP request, with an app written in TypeScript and transpiled to ES Modules.

## Installation

```sh
# from this directory
npm install
npm run build
npm start
```

In a separate terminal, `curl localhost:3000`.

See two spans in the console (one manual, one for http instrumentation)

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on OpenTelemetry for Node.js, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-node>

## LICENSE

Apache License 2.0
