COLLECTOR_IMAGE=otel/opentelemetry-collector-contrib:latest
COLLECTOR_CONFIG=docker-collector-config.yaml
TEST_SCRIPT=test.mjs
COLLECTOR_CONTAINER=otelcol-e2e

.PHONY: all run-collector test stop-collector

all: run-collector test stop-collector
create-output-json:
	@> otel-collector-output.json

run-collector: create-output-json
	@echo "Starting OpenTelemetry Collector in Docker..."
	docker run -d --rm --name $(COLLECTOR_CONTAINER) \
		-v $(PWD)/$(COLLECTOR_CONFIG):/etc/otelcol/config.yaml \
		-v $(PWD)/otel-collector-output.json:/tmp/otel-collector-output.json \
		-p 4317:4317 -p 4318:4318 \
		$(COLLECTOR_IMAGE) --config /etc/otelcol/config.yaml
	@sleep 5

test:
	@echo "Running tests..."
	node $(TEST_SCRIPT)

stop-collector:
	@echo "Stopping OpenTelemetry Collector Docker container..."
	@docker stop $(COLLECTOR_CONTAINER) || true