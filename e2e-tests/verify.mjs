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

// Extract all individual telemetry items
const allSpans = [];
const allMetrics = [];
const allLogs = [];

for (const line of lines) {
  const parsed = JSON.parse(line);
  if (parsed.resourceSpans) {
    parsed.resourceSpans.forEach(rs => {
      rs.scopeSpans?.forEach(ss => {
        ss.spans?.forEach(span => allSpans.push(span));
      });
    });
  }
  if (parsed.resourceMetrics) {
    parsed.resourceMetrics.forEach(rm => {
      rm.scopeMetrics?.forEach(sm => {
        sm.metrics?.forEach(metric => allMetrics.push(metric));
      });
    });
  }
  if (parsed.resourceLogs) {
    parsed.resourceLogs.forEach(rl => {
      rl.scopeLogs?.forEach(sl => {
        sl.logRecords?.forEach(log => allLogs.push(log));
      });
    });
  }
}

if (allSpans.length > 0) {
  console.log('found spans');
  verifySpans(allSpans);
  verifiedSpan = true;
}

if (allMetrics.length > 0) {
  console.log('found metrics');
  verifyMetrics(allMetrics);
  verifiedMetric = true;
}

if (allLogs.length > 0) {
  console.log('found logs');
  verifyLogs(allLogs);
  verifiedLog = true;
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

function verifySpans(spans) {
  const expectedSpanNames = [
    'span-before-collector-start',
    'span-after-collector-start',
  ];

  if (spans.length < 2) {
    console.error(`Expected at least 2 spans, but got ${spans.length}`);
    process.exit(1);
  }

  const foundSpanNames = spans.map(s => s.name);

  expectedSpanNames.forEach(expectedName => {
    if (!foundSpanNames.includes(expectedName)) {
      console.error(`Expected span '${expectedName}' not found`);
      process.exit(1);
    }
  });
}

function verifyMetrics(metrics) {
  const testCounter = metrics.find(m => m.name === 'test_counter');
  if (!testCounter) {
    console.error("Expected metric 'test_counter' not found");
    process.exit(1);
  }

  const dataPoints = testCounter.sum?.dataPoints || [];
  if (dataPoints.length < 2) {
    console.error(
      `Expected at least 2 data points, but got ${dataPoints.length}`
    );
    process.exit(1);
  }
}

function verifyLogs(logs) {
  const expectedLogBodies = [
    'log-before-collector-start',
    'log-after-collector-start',
  ];

  if (logs.length < 2) {
    console.error(`Expected at least 2 logs, but got ${logs.length}`);
    process.exit(1);
  }

  const foundLogBodies = logs.map(l => l.body?.stringValue);

  expectedLogBodies.forEach(expectedBody => {
    if (!foundLogBodies.includes(expectedBody)) {
      console.error(`Expected log '${expectedBody}' not found`);
      process.exit(1);
    }
  });
}
