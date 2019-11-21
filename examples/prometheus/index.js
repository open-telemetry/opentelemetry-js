const {Meter} = require("@opentelemetry/metrics");
const {PrometheusExporter} = require("@opentelemetry/exporter-prometheus");

const meter = new Meter();

const exporter = new PrometheusExporter({
  startServer: true,
}, () => {
  console.log("prometheus scrape endpoint: http://localhost:9464/metrics")
})

meter.addExporter(exporter);

const monotonicCounter = meter.createCounter("monotonic_counter", {monotonic: true, description: "monotonic counter"});
const nonmonotonicCounter = meter.createCounter("non_monotonic_counter", {monotonic: false, description: "non-monotonic counter"});
const monotonicGauge = meter.createCounter("monotonic_gauge", {monotonic: true, description: "monotonic gauge"});
const nonmonotonicGauge = meter.createCounter("non_monotonic_gauge", {monotonic: false, description: "non-monotonic gauge"});

setInterval(() => {
  monotonicCounter.getHandle(meter.labels({})).add(1);
  nonmonotonicCounter.getHandle(meter.labels({})).add(Math.random() > 0.5 ? 1 : -1);
  monotonicGauge.getHandle(meter.labels({})).add(Math.random() * 10);
  nonmonotonicGauge.getHandle(meter.labels({})).add(Math.random() > 0.5 ? Math.random() * 10 : -Math.random() * 10);
}, 1000);

