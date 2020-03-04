# OpenTelemetry Plugin Document Load
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides *automated instrumentation for document load* for Web applications.

## Installation

```bash
npm install --save @opentelemetry/plugin-document-load
```

## Usage

```js
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';

const provider = new WebTracerProvider({
  plugins: [
    new DocumentLoad()
  ]
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
```

## Optional: Send a trace parent from your server
This plugin supports connecting the server side spans for the initial HTML load with the client side span for the load from the browser's timing API. This works by having the server send its parent trace context (trace ID, span ID and trace sampling decision) to the client.

Because the browser does not send a trace context header for the initial page navigation, the server needs to fake a trace context header in a middleware and then send that trace context header back to the client as a meta tag *traceparent* . The *traceparent* meta tag should be in the [trace context W3C draft format][trace-context-url] . For example:

```html
  ...
<head>
  <!--
    https://www.w3.org/TR/trace-context/
    Set the `traceparent` in the server's HTML template code. It should be
    dynamically generated server side to have the server's request trace Id,
    a parent span Id that was set on the server's request span, and the trace
    flags to indicate the server's sampling decision
    (01 = sampled, 00 = notsampled).
    '{version}-{traceId}-{spanId}-{sampleDecision}'
  -->
  <meta name="traceparent" content="00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01">
</head>
<body>
  ...
  <script>
    // and then initialise the WebTracer
    // var webTracer = new WebTracer({ .......
  </script>
</body>
```

See [examples/tracer-web](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/tracer-web) for a short example.

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-plugin-document-load
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-document-load
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-plugin-document-load
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-document-load&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/plugin-document-load
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fplugin-document-load.svg
[trace-context-url]: https://www.w3.org/TR/trace-context
