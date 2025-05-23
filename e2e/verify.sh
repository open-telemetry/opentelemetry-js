#!/usr/bin/env bash

SPAN_NAME=$(jq -r 'select(has("resourceSpans")) | .resourceSpans[0].scopeSpans[0].spans[0].name' otel-collector-output.json)
if [ "$SPAN_NAME" != "example-span" ]; then
    echo "Expected span name 'example-span', but got '$SPAN_NAME'"
    exit 1
fi

METRIC_NAME=$(jq -r 'select(has("resourceMetrics")) | .resourceMetrics[0].scopeMetrics[0].metrics[0].name' otel-collector-output.json)
if [ "$METRIC_NAME" != "example_counter" ]; then
    echo "Expected metric name 'example_counter', but got '$METRIC_NAME'"
    exit 1
fi

METRIC_VALUE=$(jq -r 'select(has("resourceMetrics")) | .resourceMetrics[0].scopeMetrics[0].metrics[0].sum.dataPoints[0].value' otel-collector-output.json)
if [ "$METRIC_VALUE" != "1" ]; then
    echo "Expected metric value '1', but got '$METRIC_VALUE'"
    exit 1
fi

LOG_BODY=$(jq -r 'select(has("resourceLogs")) | .resourceLogs[0].scopeLogs[0].logRecords[0].body.stringValue' otel-collector-output.json)
if [ "$LOG_BODY" != "test-log-body" ]; then
    echo "Expected log body 'test-log-body', but got '$LOG_BODY'"
    exit 1
fi
