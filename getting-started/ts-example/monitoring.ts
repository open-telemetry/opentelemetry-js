import { MeterProvider } from '@opentelemetry/metrics';
import { Metric, BoundCounter } from '@opentelemetry/api';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const exporter = new PrometheusExporter(
  {
    startServer: true,
  },
  () => {
    console.log(
      `prometheus scrape endpoint: http://localhost:${PrometheusExporter.DEFAULT_OPTIONS.port}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`,
    );
  },
);

const meter = new MeterProvider({
  exporter,
  interval: 1000,
}).getMeter('example-ts');

const requestCount: Metric<BoundCounter> = meter.createCounter("requests", {
  monotonic: true,
  description: "Count all incoming requests"
});

const handles = new Map();

export const countAllRequests = () => {
  return (req, res, next) => {
    if (!handles.has(req.path)) {
      const labels = { route: req.path };
      const handle = requestCount.bind(labels);
      handles.set(req.path, handle);
    }

    handles.get(req.path).add(1);
    next();
  };
};
