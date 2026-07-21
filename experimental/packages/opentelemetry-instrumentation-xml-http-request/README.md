# OpenTelemetry XMLHttpRequest Instrumentation for web

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package. New releases may include breaking changes.**

This module provides auto instrumentation for web using XMLHttpRequest.

## Installation

```bash
npm install --save @opentelemetry/instrumentation-xml-http-request
```

## Usage

```js
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const providerWithZone = new WebTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())]
});

providerWithZone.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: ['http://localhost:8090']
    }),
  ],
});


const webTracerWithZone = providerWithZone.getTracer('default');

/////////////////////////////////////////

// or plugin can be also initialised separately and then set the tracer provider or meter provider
const xmlHttpRequestInstrumentation = new XMLHttpRequestInstrumentation({
  propagateTraceHeaderCorsUrls: ['http://localhost:8090']
});
const providerWithZone = new WebTracerProvider();
providerWithZone.register({
  contextManager: new ZoneContextManager(),
});
xmlHttpRequestInstrumentation.setTracerProvider(providerWithZone);
/////////////////////////////////////////


// and some test
const req = new XMLHttpRequest();
req.open('GET', 'http://localhost:8090/xml-http-request.js', true);
req.send();
```

### XHR Instrumentation options

XHR instrumentation plugin has few options available to choose from. You can set the following:

| Options                       | Type                         | Description                                                                                                                                                                                                                                                                                           |
| ----------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applyCustomAttributesOnSpan` | `XHRCustomAttributeFunction` | Function for adding custom attributes                                                                                                                                                                                                                                                                 |
| `ignoreNetworkEvents`         | boolean                      | Disable network events being added as span events (network events are added by default)                                                                                                                                                                                                               |
| `measureRequestSize`          | boolean                      | Measure outgoing request length (outgoing request length is not measured by default)                                                                                                                                                                                                                  |

## Semantic Conventions

The `instrumentation-xml-http-request` versions v0.220.0 and later emit the stable v1.23.0+ semantic conventions.

**Span attributes:**

| v1.23.0 semconv                    | Notes                                                                                                                                                                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http.request.method`              | HTTP request method. With v1.23.0 semconv [`http.request.method_original` may also be included](https://github.com/open-telemetry/semantic-conventions/blob/v1.23.1/docs/http/http-spans.md#common-attributes).                                                                             |
| `url.full`                         | Full HTTP request URL                                                                                                                                                                                                                                                                       |
| `server.address` and `server.port` | The hostname and port of the request URL                                                                                                                                                                                                                                                    |
| `http.response.status_code`        | HTTP response status code                                                                                                                                                                                                                                                                   |
| `http.request.body.size`           | This is only added if `measureRequestSize` is `true`.                                                                                                                                                                                                                                       |
| `error.type`                       | The response status (as a string), if the response status was `>=400`, or one of these possible request errors: 'timeout' and 'error'.                                                                                                                                                      |

## Example Screenshots

![Screenshot of the running example](images/main.jpg)
![Screenshot of the running example](images/request.jpg)
![Screenshot of the running example](images/cors.jpg)

See [examples/tracer-web](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/tracer-web) for a short example.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/instrumentation-xml-http-request
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Finstrumentation-xml-http-request.svg
