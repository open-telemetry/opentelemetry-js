# OpenTelemetry Resource Detector for GitHub Actions

Resource detector for GitHub Actions.

Detects `GITHUB_*` environment variables [specified here](https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables) and adds as attributes on a resource.

This is useful for collecting telemetry in GitHub Actions-powered CI/CD workflows.

The OpenTelemetry Resource is an immutable representation of the entity producing telemetry. For example, a process producing telemetry that is running in a container on Kubernetes has a Pod name, it is in a namespace and possibly is part of a Deployment which also has a name. All three of these attributes can be included in the `Resource`.

## Installation

```bash
npm install --save @opentelemetry/resource-detector-github
```

## Usage

```js

const { gitHubDetector } = require('@opentelemetry/opentelemetry-resource-detector-github')

async function run() {
  // Initialize GitHub Resource Detector
  const resource = await gitHubDetector.detect();
};

run()
```

## Useful links

* [GitHub Action Enviornment Variables](https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables)
