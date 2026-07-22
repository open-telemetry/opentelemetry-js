# Declarative Configuration Example

End-to-end example of configuring the Node SDK from a YAML file via
`OTEL_CONFIG_FILE` and `startNodeSDK()`. No programmatic provider construction:
the YAML drives traces, metrics, logs, resource attributes, propagators, and
the sampler.

## What this demonstrates

- A single `otel-config.yaml` covering traces, metrics, and logs over OTLP HTTP.
- Environment variable substitution (`${OTEL_EXPORTER_OTLP_ENDPOINT:-...}`,
  `${EXAMPLE_API_KEY:-}`) so secrets and per-environment values stay out of the
  YAML.
- A `parent_based` sampler config.

See [`../../packages/configuration/README.md`](../../packages/configuration/README.md)
for the full list of supported fields and current limitations.

## Run it

The example exports to any OTLP HTTP endpoint. The simplest path is the bundled
collector that prints what it receives.

```sh
# 1. Start a collector locally (OTLP HTTP receiver on :4318, debug exporter)
docker compose up -d

# 2. Install deps + start the example
npm install
npm start
```

You should see span, metric, and log entries in the collector's container logs:

```sh
docker compose logs -f otel-collector
```

To export to your own backend instead, set `OTEL_EXPORTER_OTLP_ENDPOINT` and
(optionally) `EXAMPLE_API_KEY`:

```sh
OTEL_EXPORTER_OTLP_ENDPOINT=https://vendor.endpoint \
EXAMPLE_API_KEY=$VENDOR_API_KEY \
npm start
```

Tear down the collector with `docker compose down`.
