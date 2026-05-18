/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { BasicTracerProvider } = require('@opentelemetry/sdk-trace-base');
const {
  ProtobufTraceSerializer,
  JsonTraceSerializer,
  ProtobufLogsSerializer,
  JsonLogsSerializer,
  ProtobufMetricsSerializer,
  JsonMetricsSerializer,
} = require('../../../dist/index.cjs');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { TraceFlags } = require('@opentelemetry/api');
const { SeverityNumber } = require('@opentelemetry/api-logs');

// shared concepts
const resource = resourceFromAttributes({
  'service.name': 'benchmark-service',
  'service.version': '1.0.0',
});

const instrumentationScope = {
  name: 'benchmark-otlp-transformer',
  version: '1.0.0',
  schemaUrl: 'https://opentelemetry.io/schemas/1.24.0',
};

const attributes = {
  'attribute.string': 'some string value',
  'attribute.number': 12345,
  'attribute.boolean': true,
  'attribute.array': ['value1', 'value2', 'value3'],
  'http.method': 'GET',
  'http.url': 'https://example.com/api/endpoint',
  'http.status_code': 200,
  'user.id': 'user-12345',
  'request.id': 'req-67890',
  'session.id': 'sess-abcdef',
};

// setup traces
const tracerProvider = new BasicTracerProvider({
  resource,
});
const tracer = tracerProvider.getTracer(
  instrumentationScope.name,
  instrumentationScope.version,
  {
    schemaUrl: 'https://opentelemetry.io/schemas/1.24.0',
  }
);

function createSpan() {
  const span = tracer.startSpan('span');
  span.setAttributes(attributes);
  span.end();
  return span;
}

const spans = [];
for (let i = 0; i < 512; i++) {
  spans.push(createSpan());
}

// setup logs
function createLogRecord() {
  const now = Date.now();
  const seconds = Math.floor(now / 1000);
  const nanos = (now % 1000) * 1000000;

  return {
    hrTime: [seconds, nanos],
    hrTimeObserved: [seconds, nanos],
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
    body: 'This is a log message with some content for benchmarking purposes',
    attributes,
    droppedAttributesCount: 0,
    resource: resource,
    instrumentationScope: instrumentationScope,
    spanContext: {
      traceId: '00000000000000000000000000000001',
      spanId: '0000000000000002',
      traceFlags: TraceFlags.SAMPLED,
    },
  };
}

const logs = [];
for (let i = 0; i < 512; i++) {
  logs.push(createLogRecord());
}

function generateMetrics() {
  const metrics = [];

  // gauges
  for (let i = 0; i < 128; i++) {
    metrics.push({
      descriptor: {
        name: 'gauge-' + i,
        type: 'GAUGE',
        description: 'benchmark gauge',
        unit: '%',
        valueType: 1,
        advice: {},
      },
      aggregationTemporality: 1,
      dataPointType: 2,
      dataPoints: [
        {
          attributes,
          startTime: [1777020243, 762000000],
          endTime: [1777020243, 767000000],
          value: i * 0.73 + 0.1,
        },
      ],
    });
  }

  // counters
  for (let i = 0; i < 128; i++) {
    metrics.push({
      descriptor: {
        name: 'counter-' + i,
        type: 'COUNTER',
        description: 'benchmark counter',
        unit: '{counts}',
        valueType: 0,
        advice: {},
      },
      aggregationTemporality: 1,
      dataPointType: 3,
      dataPoints: [
        {
          attributes,
          startTime: [1777020243, 764000000],
          endTime: [1777020243, 767000000],
          value: i,
        },
      ],
      isMonotonic: true,
    });
  }

  // histograms
  for (let i = 0; i < 128; i++) {
    metrics.push({
      descriptor: {
        name: 'histogram-' + i,
        type: 'HISTOGRAM',
        description: 'benchmark histogram',
        unit: 's',
        valueType: 0,
        advice: {},
      },
      aggregationTemporality: 1,
      dataPointType: 0,
      dataPoints: [
        {
          attributes,
          startTime: [1777020243, 765000000],
          endTime: [1777020243, 767000000],
          value: {
            min: 1,
            max: 8500,
            sum: 3200 + i * 10,
            buckets: {
              boundaries: [
                0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                7500, 10000,
              ],
              counts: [0, 2, 3, 8, 12, 15, 20, 25, 10, 7, 5, 3, 2, 1, i, 0],
            },
            count: 113 + i,
          },
        },
      ],
    });
  }

  // up-down-counters
  for (let i = 0; i < 128; i++) {
    metrics.push({
      descriptor: {
        name: 'updowncounter-' + i,
        type: 'UP_DOWN_COUNTER',
        description: 'benchmark up-down counter',
        unit: '1',
        valueType: 0,
        advice: {},
      },
      aggregationTemporality: 1,
      dataPointType: 3,
      dataPoints: [
        {
          attributes,
          startTime: [1777020243, 766000000],
          endTime: [1777020243, 767000000],
          value: i,
        },
      ],
      isMonotonic: false,
    });
  }
  return metrics;
}

const metrics = {
  resource,
  scopeMetrics: [
    {
      scope: {
        name: 'benchmark-otlp-transformer',
        version: '1.0.0',
        schemaUrl: 'https://opentelemetry.io/schemas/1.24.0',
      },
      metrics: generateMetrics(),
    },
  ],
};

// setup benchmark suite
const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('transform 512 spans (protobuf)', function () {
  ProtobufTraceSerializer.serializeRequest(spans);
});

suite.add('transform 512 spans (json)', function () {
  JsonTraceSerializer.serializeRequest(spans);
});

suite.add('transform 512 logs (protobuf)', function () {
  ProtobufLogsSerializer.serializeRequest(logs);
});

suite.add('transform 512 logs (json)', function () {
  JsonLogsSerializer.serializeRequest(logs);
});

suite.add('transform 512 metrics (protobuf)', function () {
  ProtobufMetricsSerializer.serializeRequest(metrics);
});

suite.add('transform 512 metrics (json)', function () {
  JsonMetricsSerializer.serializeRequest(metrics);
});

suite.run();
