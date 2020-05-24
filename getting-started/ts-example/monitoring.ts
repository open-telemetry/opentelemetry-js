import { metrics, Metric, BoundCounter } from '@opentelemetry/api';
import { installExportPipeline } from '@opentelemetry/exporter-prometheus';

installExportPipeline({
  startServer: true,
}, () => {
  console.log('prometheus scrape endpoint: http://localhost:9464/metrics');
});

const meter = metrics.getMeter('example-ts');

const requestCount: Metric<BoundCounter> = meter.createCounter("requests", {
  monotonic: true,
  labelKeys: ["route"],
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
