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

Tests can be run completely or each step can be run separately.

### `npm run test:e2e`

Runs the full E2E test workflow in sequence: prepares the output file, starts the Collector, runs the tests, stops the Collector, and verifies the results.

### `npm run run-collector`

Starts the OpenTelemetry Collector in a Docker container and mounts the output file for results. Waits 5 seconds for the Collector to be ready.

### `npm run stop-collector`

Stops the Docker container running the Collector if it’s running.

### `npm run verify`

Runs the verification script (`verify.mjs`) to check the contents of `collector-output.json` for expected results.
