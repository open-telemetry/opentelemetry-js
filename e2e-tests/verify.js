'use strict';

const fs = require('fs');
const data = fs.readFileSync('collector-output.json', 'utf8');

let verifiedSpan = false;
let verifiedMetric = false;
let verifiedLog = false;

const lines = data.split('\n').filter(Boolean);
for (const line of lines) {
  const parsed = JSON.parse(line);
  if (parsed.resourceSpans) {
    console.log('found span');
    verifySpan(parsed.resourceSpans[0].scopeSpans[0].spans[0]);
    verifiedSpan = true;
  }
  if (parsed.resourceMetrics) {
    console.log('found metric');
    verifyMetric(parsed.resourceMetrics[0].scopeMetrics[0].metrics[0]);
    verifiedMetric = true;
  }
  if (parsed.resourceLogs) {
    console.log('found log');
    verifyLog(parsed.resourceLogs[0].scopeLogs[0].logRecords[0]);
    verifiedLog = true;
  }
}

if (!verifiedSpan) {
  console.error('No spans found in the output');
  process.exit(1);
}
if (!verifiedMetric) {
  console.error('No metrics found in the output');
  process.exit(1);
}
if (!verifiedLog) {
  console.error('No logs found in the output');
  process.exit(1);
}

function verifySpan(span) {
  const expectedName = 'example-span';
  if (span.name !== expectedName) {
    console.error(`Expected span name ${expectedName}, but got '${span.name}'`);
    process.exit(1);
  }
}

function verifyMetric(metric) {
  const expectedName = 'example_counter';
  const expectedValue = 42;

  if (metric.name !== expectedName) {
    console.error(
      `Expected metric name ${expectedName}, but got '${metric.name}'`
    );
    process.exit(1);
  }
  if (
    metric.sum &&
    metric.sum.dataPoints &&
    metric.sum.dataPoints[0].asDouble !== expectedValue
  ) {
    console.error(
      `Expected metric value ${expectedValue}, but got '${metric.sum.dataPoints[0].asDouble}'`
    );
    process.exit(1);
  }
}

function verifyLog(log) {
  const expectedBody = 'test-log-body';
  if (log.body && log.body.stringValue !== expectedBody) {
    console.error(
      `Expected log body '${expectedBody}', but got '${log.body.stringValue}'`
    );
    process.exit(1);
  }
}
