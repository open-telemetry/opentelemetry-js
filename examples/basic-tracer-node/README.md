# Overview

This example shows how to use [@opentelemetry/tracer-basic](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracer-basic) to instrument a simple Node.js application - e.g. a batch job.
It supports exporting spans either to [Zipkin](https://zipkin.io) or to [Jaeger](https://www.jaegertracing.io).

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

 - Run the sample

   ```sh
   $ # from this directory
   $ npm run zipkin:basic
   ```

#### Zipkin UI
Open the Zipkin UI in your browser [http://localhost:9411/zipkin](http://localhost:9411/zipkin)

<p align="center"><img src="./images/zipkin-ui-list.png?raw=true"/></p>

Select `basic-service` under *Service Name* and click on *Find Traces*.

Click on the trace to view its details.

<p align="center"><img src="./images/zipkin-ui-detail.png?raw=true"/></p>

### Jaeger

 - Run the sample

   ```sh
   $ # from this directory
   $ npm run jaeger:basic
   ```

#### Jaeger UI

Open the Jaeger UI in your browser [http://localhost:16686](http://localhost:16686)

<p align="center"><img src="images/jaeger-ui-list.png?raw=true"/></p>

Select `basic-service` under *Service Name* and click on *Find Traces*.

Click on the trace to view its details.

<p align="center"><img src="./images/jaeger-ui-detail.png?raw=true"/></p>

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracer-basic, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracer-basic>

## LICENSE

Apache License 2.0
