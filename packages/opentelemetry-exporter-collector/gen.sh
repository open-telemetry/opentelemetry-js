clear
git submodule sync --recursive
git submodule update --init --recursive

OUT_DIR="./generated"

protoc \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --proto_path="src/platform/node/protos/" \
    opentelemetry/proto/common/v1/common.proto \
    opentelemetry/proto/resource/v1/resource.proto \
    opentelemetry/proto/trace/v1/trace.proto \
    opentelemetry/proto/collector/trace/v1/trace_service.proto \
