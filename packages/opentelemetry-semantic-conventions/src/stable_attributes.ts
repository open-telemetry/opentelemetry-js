/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//----------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
//----------------------------------------------------------------------------------------------------------

/**
 * The language of the telemetry SDK.
 */
export const ATTR_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';

/**
 * The name of the telemetry SDK as defined above.
 *
 * @note The OpenTelemetry SDK **MUST** set the `telemetry.sdk.name` attribute to `opentelemetry`.
 * If another SDK, like a fork or a vendor-provided implementation, is used, this SDK **MUST** set the
 * `telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK's main entry point
 * or another suitable identifier depending on the language.
 * The identifier `opentelemetry` is reserved and **MUST** **NOT** be used in this case.
 * All custom identifiers **SHOULD** be stable across different versions of an implementation.
 */
export const ATTR_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';

/**
 * The version string of the telemetry SDK.
 */
export const ATTR_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';

/**
 * Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * @note When observed from the server side, and when communicating through an intermediary, `client.address` **SHOULD** represent the client address behind any intermediaries,  for example proxies, if it's available.
 */
export const ATTR_CLIENT_ADDRESS = 'client.address';

/**
 * Client port number.
 *
 * @note When observed from the server side, and when communicating through an intermediary, `client.port` **SHOULD** represent the client port behind any intermediaries,  for example proxies, if it's available.
 */
export const ATTR_CLIENT_PORT = 'client.port';

/**
 * Describes a class of error the operation ended with.
 *
 * @note The `error.type` **SHOULD** be predictable and **SHOULD** have low cardinality.
 * Instrumentations **SHOULD** document the list of errors they report.
 * 
 * The cardinality of `error.type` within one instrumentation library **SHOULD** be low.
 * Telemetry consumers that aggregate data from multiple instrumentation libraries and applications
 * should be prepared for `error.type` to have high cardinality at query time when no
 * additional filters are applied.
 * 
 * If the operation has completed successfully, instrumentations **SHOULD** **NOT** set `error.type`.
 * 
 * If a specific domain defines its own set of error identifiers (such as HTTP or gRPC status codes),
 * it's RECOMMENDED to:
 * 
 * * Use a domain-specific attribute
 * * Set `error.type` to capture all errors, regardless of whether they are defined within the domain-specific set or not.
 */
export const ATTR_ERROR_TYPE = 'error.type';

/**
 * **SHOULD** be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
 *
 * @note An exception is considered to have escaped (or left) the scope of a span,
 * if that span is ended while the exception is still logically "in flight".
 * This may be actually "in flight" in some languages (e.g. if the exception
 * is passed to a Context manager's `__exit__` method in Python) but will
 * usually be caught at the point of recording the exception in most languages.
 * 
 * It is usually not possible to determine at the point where an exception is thrown
 * whether it will escape the scope of a span.
 * However, it is trivial to know that an exception
 * will escape, if one checks for an active exception just before ending the span,
 * as done in the [example for recording span exceptions](#recording-an-exception).
 * 
 * It follows that an exception may still escape the scope of the span
 * even if the `exception.escaped` attribute was not set or set to false,
 * since the event might have been recorded at a time where it was not
 * clear whether the exception will escape.
 */
export const ATTR_EXCEPTION_ESCAPED = 'exception.escaped';

/**
 * The exception message.
 */
export const ATTR_EXCEPTION_MESSAGE = 'exception.message';

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 */
export const ATTR_EXCEPTION_STACKTRACE = 'exception.stacktrace';

/**
 * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
 */
export const ATTR_EXCEPTION_TYPE = 'exception.type';

/**
 * HTTP request headers, `<key>` being the normalized HTTP Header name (lowercase), the value being the header values.
 *
 * @note Instrumentations **SHOULD** require an explicit configuration of which headers are to be captured. Including all request headers can be a security risk - explicit configuration helps avoid leaking sensitive information.
 * The `User-Agent` header is already captured in the `user_agent.original` attribute. Users **MAY** explicitly configure instrumentations to capture them even though it is not recommended.
 * The attribute value **MUST** consist of either multiple header values as an array of strings or a single-item array containing a possibly comma-concatenated string, depending on the way the HTTP library provides access to headers.
 */
export const ATTR_HTTP_REQUEST_HEADER = 'http.request.header';

/**
 * HTTP request method.
 *
 * @note HTTP request method value **SHOULD** be "known" to the instrumentation.
 * By default, this convention defines "known" methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
 * and the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html).
 * 
 * If the HTTP request method is not known to instrumentation, it **MUST** set the `http.request.method` attribute to `_OTHER`.
 * 
 * If the HTTP instrumentation could end up converting valid HTTP request methods to `_OTHER`, then it **MUST** provide a way to override
 * the list of known HTTP methods. If this override is done via environment variable, then the environment variable **MUST** be named
 * OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS and support a comma-separated list of case-sensitive known HTTP methods
 * (this list **MUST** be a full override of the default known method, it is not a list of known methods in addition to the defaults).
 * 
 * HTTP method names are case-sensitive and `http.request.method` attribute value **MUST** match a known HTTP method name exactly.
 * Instrumentations for specific web frameworks that consider HTTP methods to be case insensitive, **SHOULD** populate a canonical equivalent.
 * Tracing instrumentations that do so, **MUST** also set `http.request.method_original` to the original value.
 */
export const ATTR_HTTP_REQUEST_METHOD = 'http.request.method';

/**
 * Original HTTP method sent by the client in the request line.
 */
export const ATTR_HTTP_REQUEST_METHODORIGINAL = 'http.request.method_original';

/**
 * The ordinal number of request resending attempt (for any reason, including redirects).
 *
 * @note The resend count **SHOULD** be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
 */
export const ATTR_HTTP_REQUEST_RESENDCOUNT = 'http.request.resend_count';

/**
 * HTTP response headers, `<key>` being the normalized HTTP Header name (lowercase), the value being the header values.
 *
 * @note Instrumentations **SHOULD** require an explicit configuration of which headers are to be captured. Including all response headers can be a security risk - explicit configuration helps avoid leaking sensitive information.
 * Users **MAY** explicitly configure instrumentations to capture them even though it is not recommended.
 * The attribute value **MUST** consist of either multiple header values as an array of strings or a single-item array containing a possibly comma-concatenated string, depending on the way the HTTP library provides access to headers.
 */
export const ATTR_HTTP_RESPONSE_HEADER = 'http.response.header';

/**
 * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
 */
export const ATTR_HTTP_RESPONSE_STATUSCODE = 'http.response.status_code';

/**
 * The matched route, that is, the path template in the format used by the respective server framework.
 *
 * @note MUST **NOT** be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can **NOT** substitute it.
 * SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
 */
export const ATTR_HTTP_ROUTE = 'http.route';

/**
 * Local address of the network connection - IP address or Unix domain socket name.
 */
export const ATTR_NETWORK_LOCAL_ADDRESS = 'network.local.address';

/**
 * Local port number of the network connection.
 */
export const ATTR_NETWORK_LOCAL_PORT = 'network.local.port';

/**
 * Peer address of the network connection - IP address or Unix domain socket name.
 */
export const ATTR_NETWORK_PEER_ADDRESS = 'network.peer.address';

/**
 * Peer port number of the network connection.
 */
export const ATTR_NETWORK_PEER_PORT = 'network.peer.port';

/**
 * [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
 *
 * @note The value **SHOULD** be normalized to lowercase.
 */
export const ATTR_NETWORK_PROTOCOL_NAME = 'network.protocol.name';

/**
 * The actual version of the protocol used for network communication.
 *
 * @note If protocol version is subject to negotiation (for example using [ALPN](https://www.rfc-editor.org/rfc/rfc7301.html)), this attribute **SHOULD** be set to the negotiated version. If the actual protocol version is not known, this attribute **SHOULD** **NOT** be set.
 */
export const ATTR_NETWORK_PROTOCOL_VERSION = 'network.protocol.version';

/**
 * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
 *
 * @note The value **SHOULD** be normalized to lowercase.
 * 
 * Consider always setting the transport when setting a port number, since
 * a port number is ambiguous without knowing the transport. For example
 * different processes could be listening on TCP port 12345 and UDP port 12345.
 */
export const ATTR_NETWORK_TRANSPORT = 'network.transport';

/**
 * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
 *
 * @note The value **SHOULD** be normalized to lowercase.
 */
export const ATTR_NETWORK_TYPE = 'network.type';

/**
 * Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * @note When observed from the client side, and when communicating through an intermediary, `server.address` **SHOULD** represent the server address behind any intermediaries, for example proxies, if it's available.
 */
export const ATTR_SERVER_ADDRESS = 'server.address';

/**
 * Server port number.
 *
 * @note When observed from the client side, and when communicating through an intermediary, `server.port` **SHOULD** represent the server port behind any intermediaries, for example proxies, if it's available.
 */
export const ATTR_SERVER_PORT = 'server.port';

/**
 * Logical name of the service.
 *
 * @note MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs **MUST** fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value **MUST** be set to `unknown_service`.
 */
export const ATTR_SERVICE_NAME = 'service.name';

/**
 * The version string of the service API or implementation. The format is not defined by these conventions.
 */
export const ATTR_SERVICE_VERSION = 'service.version';

/**
 * The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component
 */
export const ATTR_URL_FRAGMENT = 'url.fragment';

/**
 * Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986)
 *
 * @note For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it **SHOULD** be included nevertheless.
 * `url.full` **MUST** **NOT** contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password **SHOULD** be redacted and attribute's value **SHOULD** be `https://REDACTED:REDACTED@www.example.com/`.
 * `url.full` **SHOULD** capture the absolute URL when it is available (or can be reconstructed). Sensitive content provided in `url.full` **SHOULD** be scrubbed when instrumentations can identify it.
 */
export const ATTR_URL_FULL = 'url.full';

/**
 * The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component
 *
 * @note Sensitive content provided in `url.path` **SHOULD** be scrubbed when instrumentations can identify it.
 */
export const ATTR_URL_PATH = 'url.path';

/**
 * The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component
 *
 * @note Sensitive content provided in `url.query` **SHOULD** be scrubbed when instrumentations can identify it.
 */
export const ATTR_URL_QUERY = 'url.query';

/**
 * The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
 */
export const ATTR_URL_SCHEME = 'url.scheme';

/**
 * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
 */
export const ATTR_USERAGENT_ORIGINAL = 'user_agent.original';
