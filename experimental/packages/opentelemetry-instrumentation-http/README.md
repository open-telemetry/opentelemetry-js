# OpenTelemetry HTTP and HTTPS Instrumentation for Node.js

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This module provides automatic instrumentation for [`http`](https://nodejs.org/api/http.html) and [`https`](https://nodejs.org/api/https.html).

## Installation

```bash
npm install --save @opentelemetry/instrumentation-http
```

## Supported Versions

- Nodejs `>=14`

## Usage

OpenTelemetry HTTP Instrumentation allows the user to automatically collect telemetry and export it to their backend of choice, to give observability to distributed systems.

To load a specific instrumentation (HTTP in this case), specify it in the Node Tracer's configuration.

```js
const { trace } = require('@opentelemetry/api');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ConsoleSpanExporter, TracerProvider, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const tracerProvider = new TracerProvider({
  spanProcessors: [
    new SimpleSpanProcessor({ exporter: new ConsoleSpanExporter() })
  ]
});
trace.setGlobalTracerProvider(tracerProvider);
// See https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/sdk-trace/
// for a more complete example setting up a *context manager* and *propagators*.

registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
});
```

See [examples/http](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/http) for a short example.

### Http instrumentation Options

Http instrumentation has a few [configuration options](https://github.com/open-telemetry/opentelemetry-js/blob/e1ec4026edae53a2dea3a9a604d6d21bb5e8d99f/experimental/packages/opentelemetry-instrumentation-http/src/types.ts#L60-L93) available to choose from.
You can set the following:

Options                                 | Type                                       | Description
--------------------------------------- | ------------------------------------------ | -----------
`applyCustomAttributesOnSpan`           | `HttpCustomAttributeFunction`              | Function for adding custom attributes
`requestHook`                           | `HttpRequestCustomAttributeFunction`       | Function for adding custom attributes before request is handled
`responseHook`                          | `HttpResponseCustomAttributeFunction`      | Function for adding custom attributes before response is handled
`startIncomingSpanHook`                 | `StartIncomingSpanCustomAttributeFunction` | Function for adding custom attributes before a span is started in incomingRequest
`startOutgoingSpanHook`                 | `StartOutgoingSpanCustomAttributeFunction` | Function for adding custom attributes before a span is started in outgoingRequest
`ignoreIncomingRequestHook`             | `IgnoreIncomingRequestFunction`            | Function for filtering incoming requests. HTTP instrumentation will not trace incoming requests for which the function returns `true`.
`ignoreOutgoingRequestHook`             | `IgnoreOutgoingRequestFunction`            | Function for filtering outgoing requests. HTTP instrumentation will not trace outgoing requests for which the function returns `true`.
`disableOutgoingRequestInstrumentation` | `boolean`                                  | Set to true to avoid instrumenting outgoing requests at all. This can be helpful when another instrumentation handles outgoing requests.
`disableIncomingRequestInstrumentation` | `boolean`                                  | Set to true to avoid instrumenting incoming requests at all. This can be helpful when another instrumentation handles incoming requests.
`serverName`                            | `string`                                   | **Deprecated.** No longer used. Stable HTTP semantic conventions do not include the `http.server_name` attribute; this option has no effect.
`requireParentforOutgoingSpans`         | Boolean                                    | Require that is a parent span to create new span for outgoing requests.
`requireParentforIncomingSpans`         | Boolean                                    | Require that is a parent span to create new span for incoming requests.
`redactedQueryParams`                   | `string[]`                                 | **Experimental.** Query parameter names whose values are redacted on outgoing (client) spans. Replaces the built-in list. See [Query parameter redaction](#query-parameter-redaction).
`redactedQueryParamsServer`             | `string[]`                                 | **Experimental.** Query parameter names whose values are redacted on incoming (server) spans. Replaces the built-in list. See [Query parameter redaction](#query-parameter-redaction).
`headersToSpanAttributes`               | `object`                                   | Specify which HTTP headers should be captured as span attributes. This is an object of the form `{client: {requestHeaders: [...], responseHeaders: [...]}, server: {requestHeaders: [...], responseHeaders: [...]}}`, where each `[...]` is an array of HTTP header names (case-insensitive) to capture. Client (outgoing requests, incoming responses) and server (incoming requests, outgoing responses) headers will be converted to span attributes in the form of `http.{request,response}.header.$header_name`, e.g. `http.response.header.content_length`. By default hyphens in header names are converted to underscore. However, if stable semantic conventions are selected (see next section), then, hyphens in header names are not changed, e.g. `http.response.header.content-length`.
`useDiagnosticsChannel`                 | `boolean`                                  | **Experimental.** Instrument `http`/`https` through Node.js diagnostics channels instead of patching module exports. See [Diagnostics channel mode](#diagnostics-channel-mode).

#### Diagnostics channel mode

Set `useDiagnosticsChannel: true` or the `OTEL_INSTRUMENTATION_HTTP_USE_DIAGNOSTICS_CHANNEL=true` environment variable to instrument `http` and `https` through Node.js diagnostics channels. An explicit configuration value takes precedence, and the setting is read when the instrumentation is constructed.

This experimental mode requires Node.js 22.12.0 or later, except that Node.js 23 requires 23.2.0 or later. Older runtimes fall back to module patching.

Diagnostics channel mode has the following limitations:

- Propagation headers cannot be injected for requests using `Expect: 100-continue` because Node.js has already sent the headers when the diagnostics channel is published.
- Requests that do not create a real `ClientRequest`, including invalid options and requests intercepted by `nock`, are not observable.
- DNS lookups and TCP connections started while creating a request may not be parented to the client span because the socket is requested before the diagnostics channel is published.
- The `RequestOptions` passed to `ignoreOutgoingRequestHook` and `startOutgoingSpanHook` are reconstructed from the created `ClientRequest`. They may include headers generated by Node.js and omit original options not exposed on `ClientRequest`.
- A caller-provided `Authorization: Basic` header cannot be distinguished from one generated from the `auth` option. This may over-redact credentials in `url.full`, but does not expose them.

#### Query parameter redaction

Query parameters that commonly carry credentials are redacted before URLs are recorded as span attributes. On client spans the redacted URL is recorded as `url.full`; on server spans the redacted query string is recorded as `url.query`. Matching values are replaced with the literal string `REDACTED`.

By default both sides redact the following parameters:

```text
sig, Signature, AWSAccessKeyId, X-Goog-Signature,
X-Amz-Signature, X-Amz-Credential, X-Amz-Security-Token
```

`redactedQueryParams` controls the client side and `redactedQueryParamsServer` controls the server side, independently. For each option:

- Omit it to use the built-in list above.
- Supply an array to **replace** the built-in list entirely. The arrays are not merged, so include any built-in parameters you still want redacted.
- Supply an empty array to disable redaction on that side.

The two options do not fall back to each other: when `redactedQueryParamsServer` is omitted, server spans use the built-in list, *not* the value of `redactedQueryParams`. Setting `redactedQueryParams` alone therefore leaves custom parameters unredacted on server spans. To redact the same custom parameters on both sides, set both options to the same array.

Parameter names are matched exactly and are case-sensitive, which is why the built-in list contains both `sig` and `Signature`.

```js
// The built-in list plus an application-specific parameter, applied to both sides.
const redacted = [
  'sig',
  'Signature',
  'AWSAccessKeyId',
  'X-Goog-Signature',
  'X-Amz-Signature',
  'X-Amz-Credential',
  'X-Amz-Security-Token',
  'api_key',
];

new HttpInstrumentation({
  redactedQueryParams: redacted,
  redactedQueryParamsServer: redacted,
});
```

#### Hook function signatures

Hook type                                  | Parameters                                                                                                   | Return value
------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------
`IgnoreIncomingRequestFunction`            | `request: IncomingMessage`                                                                                   | `true` skips tracing the incoming request; `false` traces it
`IgnoreOutgoingRequestFunction`            | `request: RequestOptions`                                                                                    | `true` skips tracing the outgoing request; `false` traces it
`HttpRequestCustomAttributeFunction`       | `span: Span`, `request: ClientRequest` or `IncomingMessage`                                                  | `void`
`HttpResponseCustomAttributeFunction`      | `span: Span`, `response: IncomingMessage` or `ServerResponse`                                                | `void`
`StartIncomingSpanCustomAttributeFunction` | `request: IncomingMessage`                                                                                   | `Attributes` to add before the incoming request span starts
`StartOutgoingSpanCustomAttributeFunction` | `request: RequestOptions`                                                                                    | `Attributes` to add before the outgoing request span starts
`HttpCustomAttributeFunction`              | `span: Span`, `request: ClientRequest` or `IncomingMessage`, `response: IncomingMessage` or `ServerResponse` | `void`

## Semantic Conventions

**Span attributes:**

v1.23.0 semconv                     | Short Description
----------------------------------- | -----
`client.address`                    | The IP address of the original client behind all proxies, if known
`network.protocol.version`          | Kind of HTTP protocol used
`server.address`                    | The value of the HTTP host header
`http.request.method`               | HTTP request method
(opt-in, `headersToSpanAttributes`) | The size of the request payload body in bytes. For newer semconv, use the `headersToSpanAttributes` option to capture this as `http.request.header.content-length`.
(not included)                      | The size of the uncompressed request payload body after transport decoding. (In semconv v1.23.0 this is defined by `http.request.body.size`, which is experimental and opt-in.)
(opt-in, `headersToSpanAttributes`) | The size of the response payload body in bytes. For newer semconv, use the `headersToSpanAttributes` option to capture this as `http.response.header.content-length`.
(not included)                      | The size of the uncompressed response payload body after transport decoding. (In semconv v1.23.0 this is defined by `http.response.body.size`, which is experimental and opt-in.)
no change                           | The matched route (path template).
`url.scheme`                        | The URI scheme identifying the used protocol
`server.address`                    | The primary server name of the matched virtual host
`http.response.status_code`         | HTTP response status code
`url.path` and `url.query`          | The URI path and query component
`url.full`                          | Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`
`user_agent.original`               | Value of the HTTP User-Agent header sent by the client
`network.local.address`             | Like net.peer.ip but for the host IP. Useful in case of a multi-IP host
`server.address`                    | Local hostname or similar
`server.port`                       | Like net.peer.port but for the host port
`network.peer.address`              | Remote address of the peer (dotted decimal for IPv4 or RFC5952 for IPv6)
`server.address`                    | Server domain name if available without reverse DNS lookup
`server.port`                       | Server port number
`network.transport`                 | Transport protocol used

**Metrics:**

- [`http.server.request.duration`](https://github.com/open-telemetry/semantic-conventions/blob/v1.27.0/docs/http/http-metrics.md#metric-httpserverrequestduration)
- [`http.client.request.duration`](https://github.com/open-telemetry/semantic-conventions/blob/v1.27.0/docs/http/http-metrics.md#metric-httpclientrequestduration)

Versions of `@opentelemetry/instrumentation-http` to 0.221.0 used semantic conventions [v1.7.0](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.7.0/semantic_conventions/README.md) by default. Versions 0.54.0 - 0.220.0 supported [the `OTEL_SEMCONV_STABILITY_OPT_IN` environment variable for migrating from old to stable semantic conventions](https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/).

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
