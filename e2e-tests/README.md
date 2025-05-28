# OpenTelemetry JS End-to-End Tests

This directory contains end-to-end (E2E) tests for the OpenTelemetry JavaScript project. These tests verify the integration of OpenTelemetry components with a real OpenTelemetry Collector.

## Prerequisites

- [Node.js](https://nodejs.org/) (version as required by the root project)
- [Docker](https://www.docker.com/) (for running the OpenTelemetry Collector)

## Installation

Install dependencies:

```sh
npm install
```

## Running Tests

The default Make target runs the collector in docker, executes the tests, and verifies the results:

```sh
make
```

### Additional Make Targets

Each step of the tests can also be run separately:


#### `make all`

Runs the full E2E test workflow in sequence: prepares the output file, starts the Collector, runs the tests, stops the Collector, and verifies the results.

#### `make create-output-json`

Creates or truncates collector-output.json to ensure it’s empty before the test run.

#### `make run-collector`

Starts the OpenTelemetry Collector in a Docker container using the specified config and mounts the output file for results. Waits 5 seconds for the Collector to be ready.

#### `make test`

Runs the main E2E test script (test.mjs) using Node.js, which sends telemetry data to the Collector.

#### `make stop-collector`

Stops the Docker container running the Collector if it’s running.

#### `make verify`

Runs the verification script (verify.mjs) to check the contents of collector-output.json for expected results.
