# Overview

This example shows how to use [@opentelemetry/tracing](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing) to instrument a simple Node.js application - e.g. a batch job - and export spans either to [Stackdriver Trace](https://cloud.google.com/trace/).

## Installation

```sh
$ # from this directory
$ npm install
```

## Authenticate

If you are running in a GCP environment, the exporter will automatically authenticate as the service account of your environment. Please make sure that it has permission to access stackdriver trace.

If you are not running in a GCP environment you will need to create a service account and save the service account key json in the root of this example named `service_account_key.json`. For more information, visit <https://cloud.google.com/docs/authentication/>.

## Run the Application

```sh
$ # from this directory
$ npm start
```

## View traces

https://console.cloud.google.com/traces/list?project=your-project-id

<p align="center"><img src="images/trace.png?raw=true"/></p>

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracing, visit: <https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing>

## LICENSE

Apache License 2.0
