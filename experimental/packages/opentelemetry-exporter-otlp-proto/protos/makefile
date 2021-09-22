GOPATH_DIR := $(GOPATH)/src/github.com/open-telemetry/opentelemetry-proto
GENDIR := gen
GOPATH_GENDIR := $(GOPATH_DIR)/$(GENDIR)

# Find all .proto files.
PROTO_FILES := $(wildcard opentelemetry/proto/*/*/*.proto opentelemetry/proto/*/*/*/*.proto)

# Function to execute a command. Note the empty line before endef to make sure each command
# gets executed separately instead of concatenated with previous one.
# Accepts command to execute as first parameter.
define exec-command
$(1)

endef

# CI build
.PHONY: ci
ci: gen-go gen-java gen-python gen-swagger

OTEL_DOCKER_PROTOBUF ?= otel/build-protobuf:latest
PROTOC := docker run --rm -u ${shell id -u} -v${PWD}:${PWD} -w${PWD} ${OTEL_DOCKER_PROTOBUF} --proto_path=${PWD}
PROTO_INCLUDES := -I/usr/include/github.com/gogo/protobuf

PROTO_GEN_GO_DIR ?= $(GENDIR)/go
PROTO_GEN_JAVA_DIR ?= $(GENDIR)/java
PROTO_GEN_PYTHON_DIR ?= $(GENDIR)/python
PROTO_GEN_SWAGGER_OUTDIR ?= $(GENDIR)/openapi

# Generate ProtoBuf implementation for Go.
.PHONY: gen-go
gen-go:
	rm -rf ./$(PROTO_GEN_GO_DIR)
	mkdir -p ./$(PROTO_GEN_GO_DIR)
	$(foreach file,$(PROTO_FILES),$(call exec-command,$(PROTOC) $(PROTO_INCLUDES) --gogo_out=plugins=grpc:./$(PROTO_GEN_GO_DIR) $(file)))
	$(PROTOC) --grpc-gateway_out=logtostderr=true,grpc_api_configuration=opentelemetry/proto/collector/trace/v1/trace_service_http.yaml:./$(PROTO_GEN_GO_DIR) opentelemetry/proto/collector/trace/v1/trace_service.proto
	$(PROTOC) --grpc-gateway_out=logtostderr=true,grpc_api_configuration=opentelemetry/proto/collector/metrics/v1/metrics_service_http.yaml:./$(PROTO_GEN_GO_DIR) opentelemetry/proto/collector/metrics/v1/metrics_service.proto
	$(PROTOC) --grpc-gateway_out=logtostderr=true,grpc_api_configuration=opentelemetry/proto/collector/logs/v1/logs_service_http.yaml:./$(PROTO_GEN_GO_DIR) opentelemetry/proto/collector/logs/v1/logs_service.proto

# Generate ProtoBuf implementation for Java.
.PHONY: gen-java
gen-java:
	rm -rf ./$(PROTO_GEN_JAVA_DIR)
	mkdir -p ./$(PROTO_GEN_JAVA_DIR)
	$(foreach file,$(PROTO_FILES),$(call exec-command, $(PROTOC) --java_out=./$(PROTO_GEN_JAVA_DIR) $(file)))

# Generate ProtoBuf implementation for Python.
.PHONY: gen-python
gen-python:
	rm -rf ./$(PROTO_GEN_PYTHON_DIR)
	mkdir -p ./$(PROTO_GEN_PYTHON_DIR)
	$(foreach file,$(PROTO_FILES),$(call exec-command, $(PROTOC) --python_out=./$(PROTO_GEN_PYTHON_DIR) $(file)))
	$(PROTOC) --python_out=./$(PROTO_GEN_PYTHON_DIR) --grpc-python_out=./$(PROTO_GEN_PYTHON_DIR) opentelemetry/proto/collector/trace/v1/trace_service.proto
	$(PROTOC) --python_out=./$(PROTO_GEN_PYTHON_DIR) --grpc-python_out=./$(PROTO_GEN_PYTHON_DIR) opentelemetry/proto/collector/metrics/v1/metrics_service.proto
	$(PROTOC) --python_out=./$(PROTO_GEN_PYTHON_DIR) --grpc-python_out=./$(PROTO_GEN_PYTHON_DIR) opentelemetry/proto/collector/logs/v1/logs_service.proto

# Generate Swagger
.PHONY: gen-swagger
gen-swagger:
	mkdir -p $(PROTO_GEN_SWAGGER_OUTDIR)
	$(PROTOC) --swagger_out=logtostderr=true,grpc_api_configuration=opentelemetry/proto/collector/trace/v1/trace_service_http.yaml:$(PROTO_GEN_SWAGGER_OUTDIR) opentelemetry/proto/collector/trace/v1/trace_service.proto
	$(PROTOC) --swagger_out=logtostderr=true,grpc_api_configuration=opentelemetry/proto/collector/metrics/v1/metrics_service_http.yaml:$(PROTO_GEN_SWAGGER_OUTDIR) opentelemetry/proto/collector/metrics/v1/metrics_service.proto
	$(PROTOC) --swagger_out=logtostderr=true,grpc_api_configuration=opentelemetry/proto/collector/logs/v1/logs_service_http.yaml:$(PROTO_GEN_SWAGGER_OUTDIR) opentelemetry/proto/collector/logs/v1/logs_service.proto
