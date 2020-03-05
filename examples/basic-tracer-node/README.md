# Overview

This example shows how to use [@opentelemetry/tracing](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing) to instrument a simple Node.js application - e.g. a batch job.
It supports exporting spans either to `Console` and to [Jaeger](https://www.jaegertracing.io).

## Installation

```sh
$ # from this directory
$ npm install
```

(Optional) Setup [Jaeger Tracing](https://www.jaegertracing.io/docs/latest/getting-started/#all-in-one)


## Run the Application

```sh
$ # from this directory
$ npm start
```

#### Jaeger UI

Open the Jaeger UI in your browser [http://localhost:16686](http://localhost:16686)

<p align="center"><img src="images/jaeger-ui-list.png?raw=true"/></p>

Select `basic-service` under *Service Name* and click on *Find Traces*.

Click on the trace to view its details.

<p align="center"><img src="./images/jaeger-ui-detail.png?raw=true"/></p>

### Collector Exporter
You can use the [opentelemetry-collector][opentelemetry-collector-url] docker container.
For that please make sure you have [docker](https://docs.docker.com/) installed
 - Run the docker container
   ```sh
   $ # from this directory
   $ # open telemetry
   $ npm run collector:docker:ot
   $ # at any time you can stop it
   $ npm run collector:docker:stop
   ```

### Export to multiple exporters

 - Run the sample

   ```sh
   $ # from this directory
   $ npm run multi_exporter
   ```

   This will export the spans data simultaneously on `Zipkin` and `Jaeger` backend. This is handy if transitioning from one vendor/OSS project to another for the tracing backend. You might want to export to both during the transitional phase.

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracing, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing>

## LICENSE

Apache License 2.0

[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-exporter-collector
