# Overview

This example shows how to use [@opentelemetry/tracing](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing) to instrument a simple Node.js application - e.g. a batch job.
It supports exporting spans either to [Zipkin](https://zipkin.io) or to [Jaeger](https://www.jaegertracing.io).

## Installation

```sh
$ # from this directory
$ npm install
```

## Authenticate

You will need to create a service account and save the service account key json in the root of this example named `service_account_key.json`. For more information, visit <https://cloud.google.com/docs/authentication/>.

## Run the Application

```sh
$ # from this directory
$ npm start
```

## View traces

https://console.cloud.google.com/traces/list?project=your-project-id

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracing, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing>

## LICENSE

Apache License 2.0
