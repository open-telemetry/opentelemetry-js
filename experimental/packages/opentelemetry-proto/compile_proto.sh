#!/usr/bin/env bash

OUT_DIR="../src"
TS_OUT_DIR="../src"
IN_DIR="./opentelemetry"
PROTOC="$(npm bin)/grpc_tools_node_protoc"
PROTOC_GEN_TS_PATH="$(npm bin)/protoc-gen-ts"
PROTOC_GEN_GRPC_PATH="$(npm bin)/grpc_tools_node_protoc_plugin"

cd opentelemetry-proto

$PROTOC \
    -I="./" \
    --plugin=protoc-gen-ts=$PROTOC_GEN_TS_PATH \
    --js_out=import_style=commonjs:$OUT_DIR \
    --ts_out=$TS_OUT_DIR \
        opentelemetry/proto/collector/logs/v1/logs_service.proto \
        opentelemetry/proto/collector/metrics/v1/metrics_service.proto \
        opentelemetry/proto/collector/trace/v1/trace_service.proto
