# Multiple Metric Readers Example

This example demonstrates how to use the new `metricReaders` (plural) option in the NodeSDK configuration to register multiple metric readers simultaneously.

## Features

- **Multiple Metric Readers**: Configure multiple metric readers in a single SDK instance
- **Console Export**: Metrics are exported to the console for easy debugging
- **Prometheus Export**: Metrics are also exported to a Prometheus endpoint
- **Auto-instrumentation**: Automatic instrumentation of Node.js applications

## Usage

### Running the Example

```bash
node multiple-metric-readers.js
```

### What Happens

1. The SDK is configured with two metric readers:
   - A `ConsoleMetricExporter` that prints metrics to the console
   - A `PrometheusExporter` that exposes metrics on `http://localhost:9464/metrics`

2. A counter metric is created and incremented every second

3. Metrics are automatically exported to both destinations

### API Changes

This example demonstrates the new API that supports multiple metric readers:

```javascript
// OLD (deprecated) - single metric reader
const sdk = new opentelemetry.NodeSDK({
  metricReader: singleMetricReader, // deprecated
});

// NEW - multiple metric readers
const sdk = new opentelemetry.NodeSDK({
  metricReaders: [consoleMetricReader, prometheusMetricReader], // new
});
```

### Benefits

- **Flexibility**: Export metrics to multiple destinations simultaneously
- **Debugging**: Console export for development and debugging
- **Production**: Prometheus export for production monitoring
- **Backward Compatibility**: The old `metricReader` option still works but shows a deprecation warning

### Checking the Results

1. **Console Output**: Watch the console for metric exports every second
2. **Prometheus Endpoint**: Visit `http://localhost:9464/metrics` to see the Prometheus-formatted metrics

## Migration Guide

If you're currently using the single `metricReader` option, you can migrate to the new `metricReaders` option:

```javascript
// Before
const sdk = new opentelemetry.NodeSDK({
  metricReader: myMetricReader,
});

// After
const sdk = new opentelemetry.NodeSDK({
  metricReaders: [myMetricReader],
});
```

The old `metricReader` option will continue to work but will show a deprecation warning. It's recommended to migrate to the new `metricReaders` option for future compatibility. 