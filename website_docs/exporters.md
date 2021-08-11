---
title: "Exporters"
weight: 3
---

In order to visualize and analyze your traces and metrics, you will need to export them to a  backend such as [Jaeger](https://www.jaegertracing.io/) or [Zipkin](https://zipkin.io/). OpenTelemetry JS provides exporters for some common open source backends.

Below you will find some introductions on how to setup backends and the matching exporters.

- [Jaeger](#jaeger)
- [Zipkin](#zipkin)
- [Prometheus](#prometheus)
- [OpenTelemetry Collector](#opentelemetry-collector)

## Jaeger

To set up Jaeger as quickly as possible, run it in a docker container:

```shell
$ docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 14250:14250 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

Install the exporter package as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-jaeger
```

Update your opentelemetry configuration to use the exporter and to send data to your jaeger backend:

```javascript
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { BatchSpanProcessor } = require("@opentelemetry/tracing");

provider.addSpanProcessor(new BatchSpanProcessor(new JaegerExporter()))
```

## Zipkin

To set up Zipkin as quickly as possible, run it in a docker container:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```

Install the exporter package as a dependency for your application:

```shell
npm install --save @opentelemetry/exporter-zipkin
```

Update your opentelemetry configuration to use the exporter and to send data to your zipkin backend:

```javascript
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const { BatchSpanProcessor } = require("@opentelemetry/tracing");

provider.addSpanProcessor(new BatchSpanProcessor(new ZipkinExporter()))
```

## Prometheus

To set up Prometheus as quickly as possible, run it in a docker container.
You will need a `prometheus.yml` to configure the backend, use the following example
and modify it to your needs:

```yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

With this file you can now start the docker container:

```shell
docker run \
    -p 9090:9090 \
    -v ${PWD}/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

Update your opentelemetry configuration to use the exporter and to send data to your prometheus backend:

```javascript
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider }  = require('@opentelemetry/metrics');
const meter = new MeterProvider({
  exporter: new PrometheusExporter({port: 9090}),
  interval: 1000,
}).getMeter('prometheus');
```

## OpenTelemetry Collector

If you are looking for a vendor-agnostic way to receive, process and export your
telemetry data follow the instructions to setup a [OpenTelemetry collector](https://opentelemetry.io/docs/collector/)
