/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import fs from 'fs';

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
    const scopeMetrics = parsed.resourceMetrics[0].scopeMetrics.find(
      sm => sm.scope.name === 'example-meter'
    );
    if (scopeMetrics) {
      console.log('found metric');
      verifyMetric(scopeMetrics.metrics[0]);
      verifiedMetric = true;
    }
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

  if (log.eventName !== 'test-log-event') {
    console.error(
      `Expected log event name 'test-log-event', but got '${log.eventName}'`
    );
    process.exit(1);
  }
}
