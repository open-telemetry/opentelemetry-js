# OpenTelemetry Collector Exporter for web and node

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides exporter for web and node to be used with [opentelemetry-collector][opentelemetry-collector-url].

## Installation

```bash
npm install --save @opentelemetry/exporter-collector
```

## Usage in Web

The CollectorTraceExporter in Web expects the endpoint to end in `/v1/trace`.

```js
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';

const collectorOptions = {
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:55680/v1/trace
  headers: {}, //an optional object containing custom headers to be sent with each request
};

const provider = new WebTracerProvider();
const exporter = new CollectorTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

```

## Usage in Node - GRPC

The CollectorTraceExporter in Node expects the URL to only be the hostname. It will not work with `/v1/trace`.

```js
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorTraceExporter } =  require('@opentelemetry/exporter-collector');

const collectorOptions = {
  serviceName: 'basic-service',
  url: '<opentelemetry-collector-url>' // url is optional and can be omitted - default is localhost:55680
};

const provider = new BasicTracerProvider();
const exporter = new CollectorTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

```

By default, plaintext connection is used. In order to use TLS in Node.js, provide `credentials` option like so:

```js
const fs = require('fs');
const grpc = require('grpc');
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorTraceExporter } =  require('@opentelemetry/exporter-collector');

const collectorOptions = {
  serviceName: 'basic-service',
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is localhost:55680
  credentials: grpc.credentials.createSsl(
    fs.readFileSync('./ca.crt'),
    fs.readFileSync('./client.key'),
    fs.readFileSync('./client.crt')
  )
};

const provider = new BasicTracerProvider();
const exporter = new CollectorTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();
```

To see how to generate credentials, you can refer to the script used to generate certificates for tests [here](./test/certs/regenerate.sh)

The exporter can be configured to send custom metadata with each request as in the example below:

```js
const grpc = require('grpc');
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorTraceExporter } =  require('@opentelemetry/exporter-collector');

const metadata = new grpc.Metadata();
metadata.set('k', 'v');

const collectorOptions = {
  serviceName: 'basic-service',
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is localhost:55680
  metadata, // // an optional grpc.Metadata object to be sent with each request
};

const provider = new BasicTracerProvider();
const exporter = new CollectorTraceExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();
```

Note, that this will only work if TLS is also configured on the server.

## Usage in Node - JSON over http

```js
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorExporter, CollectorTransportNode } =  require('@opentelemetry/exporter-collector');

const collectorOptions = {
  protocolNode: CollectorTransportNode.HTTP_JSON,
  serviceName: 'basic-service',
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:55680/v1/trace
  headers: {
    foo: 'bar'
  }, //an optional object containing custom headers to be sent with each request will only work with json over http
};

const provider = new BasicTracerProvider();
const exporter = new CollectorExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

```

## Usage in Node - PROTO over http

```js
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorExporter, CollectorTransportNode } =  require('@opentelemetry/exporter-collector');

const collectorOptions = {
  protocolNode: CollectorTransportNode.HTTP_PROTO,
  serviceName: 'basic-service',
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:55680/v1/trace
  headers: {
    foo: 'bar'
  }, //an optional object containing custom headers to be sent with each request will only work with json over http
};

const provider = new BasicTracerProvider();
const exporter = new CollectorExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

```

## Running opentelemetry-collector locally to see the traces

1. Go to examples/collector-exporter-node
2. run `npm run docker:start`
3. Open page at `http://localhost:9411/zipkin/` to observe the traces

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-exporter-collector
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-collector
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-exporter-collector
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-collector&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-collector
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-collector.svg
[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-collector
