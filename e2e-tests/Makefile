COLLECTOR_IMAGE=otel/opentelemetry-collector-contrib:latest
COLLECTOR_CONFIG=collector-config.yaml
TEST_SCRIPT=test.mjs
COLLECTOR_CONTAINER=otelcol-e2e

.PHONY: all create-output-json run-collector test stop-collector verify

all: create-output-json run-collector test stop-collector verify
create-output-json:
	@> collector-output.json

run-collector: create-output-json
	@echo "Starting OpenTelemetry Collector in Docker..."
	docker run -d --rm --name $(COLLECTOR_CONTAINER) \
		-v $(PWD)/$(COLLECTOR_CONFIG):/etc/otelcol/config.yaml \
		-v $(PWD)/collector-output.json:/tmp/collector-output.json \
		-p 4317:4317 -p 4318:4318 \
		-w /tmp \
		$(COLLECTOR_IMAGE) --config /etc/otelcol/config.yaml
	@sleep 5

test:
	@echo "Running tests..."
	node $(TEST_SCRIPT)

stop-collector:
	@echo "Stopping OpenTelemetry Collector Docker container..."
	@docker stop $(COLLECTOR_CONTAINER) || true


verify:
	@echo "Verifying output..."
	@node verify.js