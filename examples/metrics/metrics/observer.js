'use strict';

const { MeterProvider } = require('@opentelemetry/metrics');
const { ConsoleLogger, LogLevel } = require('@opentelemetry/core');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const exporter = new PrometheusExporter(
  {
    startServer: true,
  },
  () => {
    console.log('prometheus scrape endpoint: http://localhost:9464/metrics');
  },
);

const meter = new MeterProvider({
  exporter,
  interval: 3000,
}).getMeter('example-observer');

meter.createObserver('cpu_core_usage', {
  monotonic: false,
  labelKeys: ['core'],
  description: 'Example of a sync observer with callback',
}, (observerResult) => {
  observerResult.observe(getRandomValue(), { core: '1' });
  observerResult.observe(getRandomValue(), { core: '2' });
});

const tempMetric = meter.createObserver('cpu_temp_per_app', {
  monotonic: false,
  labelKeys: ['app', 'core'],
  description: 'Example of batch observer',
});

const cpuUsageMetric = meter.createObserver('cpu_usage_per_app', {
  monotonic: false,
  labelKeys: ['app', 'core'],
  description: 'Example of batch observer',
});

meter.createBatchObserver('metric_batch_observer', (observerBatchResult) => {
    function someAsyncMetrics() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const stats = [
            {
              name: 'app1',
              core1: { usage: getRandomValue(), temp: getRandomValue() * 100 },
              core2: { usage: getRandomValue(), temp: getRandomValue() * 100 },
            },
            {
              name: 'app2',
              core1: { usage: getRandomValue(), temp: getRandomValue() * 100 },
              core2: { usage: getRandomValue(), temp: getRandomValue() * 100 },
            },
          ];
          resolve(stats);
        }, 200);
      });
    }

    Promise.all([
      someAsyncMetrics(),
      // simulate waiting
      new Promise((resolve, reject) => {
        setTimeout(resolve, 300);
      }),
    ]).then(([apps, waiting]) => {
      apps.forEach(app => {
        observerBatchResult.observe({ app: app.name, core: '1' }, [
          tempMetric.observation(app.core1.temp),
          cpuUsageMetric.observation(app.core1.usage),
        ]);
        observerBatchResult.observe({ app: app.name, core: '2' }, [
          tempMetric.observation(app.core2.temp),
          cpuUsageMetric.observation(app.core2.usage),
        ]);
      });
    });
  }, {
    maxTimeoutUpdateMS: 500,
    logger: new ConsoleLogger(LogLevel.DEBUG)
  },
);

function getRandomValue() {
  return Math.random();
}
