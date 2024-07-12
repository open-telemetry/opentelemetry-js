# OpenTelemetry HTTP and HTTPS Instrumentation for Node.js

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This module provides automatic instrumentation for [`http`](https://nodejs.org/api/http.html) and [`https`](https://nodejs.org/api/https.html).

For automatic instrumentation see the
[@opentelemetry/sdk-trace-node](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-node) package.

## Installation

```bash
npm install --save @opentelemetry/instrumentation-http
```

## Supported Versions

- Nodejs `>=14`

## Usage

OpenTelemetry HTTP Instrumentation allows the user to automatically collect trace data and export them to their backend of choice, to give observability to distributed systems.

To load a specific instrumentation (HTTP in this case), specify it in the Node Tracer's configuration.

```js
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const {
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const provider = new NodeTracerProvider();

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
});

```

See [examples/http](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/http) for a short example.

### Http instrumentation Options

Http instrumentation has few options available to choose from. You can set the following:

| Options | Type | Description |
| ------- | ---- | ----------- |
| [`applyCustomAttributesOnSpan`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L91) | `HttpCustomAttributeFunction` | Function for adding custom attributes |
| [`requestHook`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#93) | `HttpRequestCustomAttributeFunction` | Function for adding custom attributes before request is handled |
| [`responseHook`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L95) | `HttpResponseCustomAttributeFunction` | Function for adding custom attributes before response is handled |
| [`startIncomingSpanHook`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L97) | `StartIncomingSpanCustomAttributeFunction` | Function for adding custom attributes before a span is started in incomingRequest |
| [`startOutgoingSpanHook`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L99) | `StartOutgoingSpanCustomAttributeFunction` | Function for adding custom attributes before a span is started in outgoingRequest |
| `ignoreIncomingRequestHook` | `IgnoreIncomingRequestFunction` | Http instrumentation will not trace all incoming requests that matched with custom function |
| `ignoreOutgoingRequestHook` | `IgnoreOutgoingRequestFunction` | Http instrumentation will not trace all outgoing requests that matched with custom function |
| [`serverName`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L101) | `string` | The primary server name of the matched virtual host. |
| [`requireParentforOutgoingSpans`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L103) | Boolean | Require that is a parent span to create new span for outgoing requests. |
| [`requireParentforIncomingSpans`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L105) | Boolean | Require that is a parent span to create new span for incoming requests. |
| [`headersToSpanAttributes`](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L107) | `object` | List of case insensitive HTTP headers to convert to span attributes. Client (outgoing requests, incoming responses) and server (incoming requests, outgoing responses) headers will be converted to span attributes in the form of `http.{request\|response}.header.header_name`, e.g. `http.response.header.content_length` |

The following options are deprecated:

| Options | Type | Description |
| ------- | ---- | ----------- |
| `ignoreIncomingPaths` | `IgnoreMatcher[]` | Http instrumentation will not trace all incoming requests that match paths |

## Semantic Conventions

This package uses `@opentelemetry/semantic-conventions` version `1.22+`, which implements Semantic Convention [Version 1.7.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.7.0/semantic_conventions/README.md)

Attributes collected:

| Attribute                                   | Short Description                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `ip_tcp`                                    | Transport protocol used                                                        |
| `ip_udp`                                    | Transport protocol used                                                        |
| `http.client_ip`                            | The IP address of the original client behind all proxies, if known             |
| `http.flavor`                               | Kind of HTTP protocol used                                                     |
| `http.host`                                 | The value of the HTTP host header                                              |
| `http.method`                               | HTTP request method                                                            |
| `http.request_content_length`               | The size of the request payload body in bytes                                  |
| `http.request_content_length_uncompressed`  | The size of the uncompressed request payload body after transport decoding     |
| `http.response_content_length`              | The size of the response payload body in bytes                                 |
| `http.response_content_length_uncompressed` | The size of the uncompressed response payload body after transport decoding    |
| `http.route`                                | The matched route (path template).                                             |
| `http.scheme`                               | The URI scheme identifying the used protocol                                   |
| `http.server_name`                          | The primary server name of the matched virtual host                            |
| `http.status_code`                          | HTTP response status code                                                      |
| `http.target`                               | The full request target as passed in a HTTP request line or equivalent         |
| `http.url`                                  | Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]` |
| `http.user_agent`                           | Value of the HTTP User-Agent header sent by the client                         |
| `net.host.ip`                               | Like net.peer.ip but for the host IP. Useful in case of a multi-IP host        |
| `net.host.name`                             | Local hostname or similar                                                      |
| `net.host.port`                             | Like net.peer.port but for the host port                                       |
| `net.peer.ip.`                              | Remote address of the peer (dotted decimal for IPv4 or RFC5952 for IPv6)       |
| `net.peer.name`                             | Remote hostname or similar                                                     |
| `net.peer.port`                             | Remote port number                                                             |
| `net.transport`                             | Transport protocol used                                                        |

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/instrumentation-http
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Finstrumentation-http.svg
