import { Meter } from "@opentelemetry/metrics";
import { Metric, BoundCounter } from "@opentelemetry/types";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";

const meter = new Meter();

meter.addExporter(
  new PrometheusExporter({ startServer: true }, () => {
    console.log("prometheus scrape endpoint: http://localhost:9464/metrics");
  })
);

const requestCount: Metric<BoundCounter> = meter.createCounter("requests", {
  monotonic: true,
  labelKeys: ["route"],
  description: "Count all incoming requests"
});

const handles = new Map();

export const countAllRequests = () => {
  return (req, res, next) => {
    if (!handles.has(req.path)) {
      const labelSet = meter.labels({ route: req.path });
      const handle = requestCount.bind(labelSet);
      handles.set(req.path, handle);
    }

    handles.get(req.path).add(1);
    next();
  };
};
