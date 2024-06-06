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
 * Number of exceptions caught by exception handling middleware.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Diagnostics`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = 'aspnetcore.diagnostics.exceptions' as const;

/**
 * Number of requests that are currently active on the server that hold a rate limiting lease.
 *
 * Note: Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = 'aspnetcore.rate_limiting.active_request_leases' as const;

/**
 * Number of requests that are currently queued, waiting to acquire a rate limiting lease.
 *
 * Note: Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = 'aspnetcore.rate_limiting.queued_requests' as const;

/**
 * The time the request spent in a queue waiting to acquire a rate limiting lease.
 *
 * Note: Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = 'aspnetcore.rate_limiting.request.time_in_queue' as const;

/**
 * The duration of rate limiting lease held by requests on the server.
 *
 * Note: Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = 'aspnetcore.rate_limiting.request_lease.duration' as const;

/**
 * Number of requests that tried to acquire a rate limiting lease.
 *
 * Note: Requests could be:
 * 
 * * Rejected by global or endpoint rate limiting policies
 * * Canceled while waiting for the lease.
 * 
 * Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = 'aspnetcore.rate_limiting.requests' as const;

/**
 * Number of requests that were attempted to be matched to an endpoint.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Routing`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = 'aspnetcore.routing.match_attempts' as const;

/**
 * Duration of HTTP client requests.
 */
export const METRIC_HTTP_CLIENT_REQUEST_DURATION = 'http.client.request.duration' as const;

/**
 * Duration of HTTP server requests.
 */
export const METRIC_HTTP_SERVER_REQUEST_DURATION = 'http.server.request.duration' as const;

/**
 * Number of classes currently loaded.
 */
export const METRIC_JVM_CLASS_COUNT = 'jvm.class.count' as const;

/**
 * Number of classes loaded since JVM start.
 */
export const METRIC_JVM_CLASS_LOADED = 'jvm.class.loaded' as const;

/**
 * Number of classes unloaded since JVM start.
 */
export const METRIC_JVM_CLASS_UNLOADED = 'jvm.class.unloaded' as const;

/**
 * Number of processors available to the Java virtual machine.
 */
export const METRIC_JVM_CPU_COUNT = 'jvm.cpu.count' as const;

/**
 * Recent CPU utilization for the process as reported by the JVM.
 *
 * Note: The value range is [0.0,1.0]. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getProcessCpuLoad()).
 */
export const METRIC_JVM_CPU_RECENT_UTILIZATION = 'jvm.cpu.recent_utilization' as const;

/**
 * CPU time used by the process as reported by the JVM.
 */
export const METRIC_JVM_CPU_TIME = 'jvm.cpu.time' as const;

/**
 * Duration of JVM garbage collection actions.
 */
export const METRIC_JVM_GC_DURATION = 'jvm.gc.duration' as const;

/**
 * Measure of memory committed.
 */
export const METRIC_JVM_MEMORY_COMMITTED = 'jvm.memory.committed' as const;

/**
 * Measure of max obtainable memory.
 */
export const METRIC_JVM_MEMORY_LIMIT = 'jvm.memory.limit' as const;

/**
 * Measure of memory used.
 */
export const METRIC_JVM_MEMORY_USED = 'jvm.memory.used' as const;

/**
 * Measure of memory used, as measured after the most recent garbage collection event on this pool.
 */
export const METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = 'jvm.memory.used_after_last_gc' as const;

/**
 * Number of executing platform threads.
 */
export const METRIC_JVM_THREAD_COUNT = 'jvm.thread.count' as const;

/**
 * Number of connections that are currently active on the server.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_KESTREL_ACTIVE_CONNECTIONS = 'kestrel.active_connections' as const;

/**
 * Number of TLS handshakes that are currently in progress on the server.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = 'kestrel.active_tls_handshakes' as const;

/**
 * The duration of connections on the server.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_KESTREL_CONNECTION_DURATION = 'kestrel.connection.duration' as const;

/**
 * Number of connections that are currently queued and are waiting to start.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_KESTREL_QUEUED_CONNECTIONS = 'kestrel.queued_connections' as const;

/**
 * Number of HTTP requests on multiplexed connections (HTTP/2 and HTTP/3) that are currently queued and are waiting to start.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_KESTREL_QUEUED_REQUESTS = 'kestrel.queued_requests' as const;

/**
 * Number of connections rejected by the server.
 *
 * Note: Connections are rejected when the currently active count exceeds the value configured with `MaxConcurrentConnections`.
 * Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_KESTREL_REJECTED_CONNECTIONS = 'kestrel.rejected_connections' as const;

/**
 * The duration of TLS handshakes on the server.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_KESTREL_TLS_HANDSHAKE_DURATION = 'kestrel.tls_handshake.duration' as const;

/**
 * Number of connections that are currently upgraded (WebSockets). .
 *
 * Note: The counter only tracks HTTP/1.1 connections.
 * 
 * Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_KESTREL_UPGRADED_CONNECTIONS = 'kestrel.upgraded_connections' as const;

/**
 * Number of connections that are currently active on the server.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = 'signalr.server.active_connections' as const;

/**
 * The duration of connections on the server.
 *
 * Note: Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0.
 */
export const METRIC_SIGNALR_SERVER_CONNECTION_DURATION = 'signalr.server.connection.duration' as const;

/**
 * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
 */
export const ATTR_ASPNETCORE_RATE_LIMITING_RESULT = 'aspnetcore.rate_limiting.result' as const;

/**
 * Full type name of the [`IExceptionHandler`](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.diagnostics.iexceptionhandler) implementation that handled the exception.
 */
export const ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = 'aspnetcore.diagnostics.handler.type' as const;

/**
 * Rate limiting policy name.
 */
export const ATTR_ASPNETCORE_RATE_LIMITING_POLICY = 'aspnetcore.rate_limiting.policy' as const;

/**
 * Flag indicating if request was handled by the application pipeline.
 */
export const ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = 'aspnetcore.request.is_unhandled' as const;

/**
 * A value that indicates whether the matched route is a fallback route.
 */
export const ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = 'aspnetcore.routing.is_fallback' as const;

/**
 * Match result - success or failure.
 */
export const ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = 'aspnetcore.routing.match_status' as const;

/**
 * ASP.NET Core exception middleware handling result.
 */
export const ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = 'aspnetcore.diagnostics.exception.result' as const;

/**
 * SignalR HTTP connection closure status.
 */
export const ATTR_SIGNALR_CONNECTION_STATUS = 'signalr.connection.status' as const;

/**
 * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
 */
export const ATTR_SIGNALR_TRANSPORT = 'signalr.transport' as const;

/**
 * Name of the memory pool.
 *
 * Note: Pool names are generally obtained via [MemoryPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/MemoryPoolMXBean.html#getName()).
 */
export const ATTR_JVM_MEMORY_POOL_NAME = 'jvm.memory.pool.name' as const;

/**
 * The type of memory.
 */
export const ATTR_JVM_MEMORY_TYPE = 'jvm.memory.type' as const;

/**
 * Name of the garbage collector action.
 *
 * Note: Garbage collector action is generally obtained via [GarbageCollectionNotificationInfo#getGcAction()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcAction()).
 */
export const ATTR_JVM_GC_ACTION = 'jvm.gc.action' as const;

/**
 * Name of the garbage collector.
 *
 * Note: Garbage collector name is generally obtained via [GarbageCollectionNotificationInfo#getGcName()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcName()).
 */
export const ATTR_JVM_GC_NAME = 'jvm.gc.name' as const;

/**
 * Whether the thread is daemon or not.
 */
export const ATTR_JVM_THREAD_DAEMON = 'jvm.thread.daemon' as const;

/**
 * State of the thread.
 */
export const ATTR_JVM_THREAD_STATE = 'jvm.thread.state' as const;

/**
 * Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the server side, and when communicating through an intermediary, `client.address` SHOULD represent the client address behind any intermediaries,  for example proxies, if it&#39;s available.
 */
export const ATTR_CLIENT_ADDRESS = 'client.address' as const;

/**
 * Client port number.
 *
 * Note: When observed from the server side, and when communicating through an intermediary, `client.port` SHOULD represent the client port behind any intermediaries,  for example proxies, if it&#39;s available.
 */
export const ATTR_CLIENT_PORT = 'client.port' as const;

/**
 * Describes a class of error the operation ended with.
 *
 * Note: The `error.type` SHOULD be predictable and SHOULD have low cardinality.
 * Instrumentations SHOULD document the list of errors they report.
 * 
 * The cardinality of `error.type` within one instrumentation library SHOULD be low.
 * Telemetry consumers that aggregate data from multiple instrumentation libraries and applications
 * should be prepared for `error.type` to have high cardinality at query time when no
 * additional filters are applied.
 * 
 * If the operation has completed successfully, instrumentations SHOULD NOT set `error.type`.
 * 
 * If a specific domain defines its own set of error identifiers (such as HTTP or gRPC status codes),
 * it&#39;s RECOMMENDED to:
 * 
 * * Use a domain-specific attribute
 * * Set `error.type` to capture all errors, regardless of whether they are defined within the domain-specific set or not.
 */
export const ATTR_ERROR_TYPE = 'error.type' as const;

/**
 * SHOULD be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
 *
 * Note: An exception is considered to have escaped (or left) the scope of a span,
 * if that span is ended while the exception is still logically &#34;in flight&#34;.
 * This may be actually &#34;in flight&#34; in some languages (e.g. if the exception
 * is passed to a Context manager&#39;s `__exit__` method in Python) but will
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
export const ATTR_EXCEPTION_ESCAPED = 'exception.escaped' as const;

/**
 * The exception message.
 */
export const ATTR_EXCEPTION_MESSAGE = 'exception.message' as const;

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 */
export const ATTR_EXCEPTION_STACKTRACE = 'exception.stacktrace' as const;

/**
 * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
 */
export const ATTR_EXCEPTION_TYPE = 'exception.type' as const;

/**
 * HTTP request method.
 *
 * Note: HTTP request method value SHOULD be &#34;known&#34; to the instrumentation.
 * By default, this convention defines &#34;known&#34; methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
 * and the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html).
 * 
 * If the HTTP request method is not known to instrumentation, it MUST set the `http.request.method` attribute to `_OTHER`.
 * 
 * If the HTTP instrumentation could end up converting valid HTTP request methods to `_OTHER`, then it MUST provide a way to override
 * the list of known HTTP methods. If this override is done via environment variable, then the environment variable MUST be named
 * OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS and support a comma-separated list of case-sensitive known HTTP methods
 * (this list MUST be a full override of the default known method, it is not a list of known methods in addition to the defaults).
 * 
 * HTTP method names are case-sensitive and `http.request.method` attribute value MUST match a known HTTP method name exactly.
 * Instrumentations for specific web frameworks that consider HTTP methods to be case insensitive, SHOULD populate a canonical equivalent.
 * Tracing instrumentations that do so, MUST also set `http.request.method_original` to the original value.
 */
export const ATTR_HTTP_REQUEST_METHOD = 'http.request.method' as const;

/**
 * Original HTTP method sent by the client in the request line.
 */
export const ATTR_HTTP_REQUEST_METHOD_ORIGINAL = 'http.request.method_original' as const;

/**
 * The ordinal number of request resending attempt (for any reason, including redirects).
 *
 * Note: The resend count SHOULD be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
 */
export const ATTR_HTTP_REQUEST_RESEND_COUNT = 'http.request.resend_count' as const;

/**
 * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
 */
export const ATTR_HTTP_RESPONSE_STATUS_CODE = 'http.response.status_code' as const;

/**
 * The matched route, that is, the path template in the format used by the respective server framework.
 *
 * Note: MUST NOT be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
 * SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
 */
export const ATTR_HTTP_ROUTE = 'http.route' as const;

/**
 * Local address of the network connection - IP address or Unix domain socket name.
 */
export const ATTR_NETWORK_LOCAL_ADDRESS = 'network.local.address' as const;

/**
 * Local port number of the network connection.
 */
export const ATTR_NETWORK_LOCAL_PORT = 'network.local.port' as const;

/**
 * Peer address of the network connection - IP address or Unix domain socket name.
 */
export const ATTR_NETWORK_PEER_ADDRESS = 'network.peer.address' as const;

/**
 * Peer port number of the network connection.
 */
export const ATTR_NETWORK_PEER_PORT = 'network.peer.port' as const;

/**
 * [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
 *
 * Note: The value SHOULD be normalized to lowercase.
 */
export const ATTR_NETWORK_PROTOCOL_NAME = 'network.protocol.name' as const;

/**
 * The actual version of the protocol used for network communication.
 *
 * Note: If protocol version is subject to negotiation (for example using [ALPN](https://www.rfc-editor.org/rfc/rfc7301.html)), this attribute SHOULD be set to the negotiated version. If the actual protocol version is not known, this attribute SHOULD NOT be set.
 */
export const ATTR_NETWORK_PROTOCOL_VERSION = 'network.protocol.version' as const;

/**
 * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
 *
 * Note: The value SHOULD be normalized to lowercase.
 * 
 * Consider always setting the transport when setting a port number, since
 * a port number is ambiguous without knowing the transport. For example
 * different processes could be listening on TCP port 12345 and UDP port 12345.
 */
export const ATTR_NETWORK_TRANSPORT = 'network.transport' as const;

/**
 * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
 *
 * Note: The value SHOULD be normalized to lowercase.
 */
export const ATTR_NETWORK_TYPE = 'network.type' as const;

/**
 * Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the client side, and when communicating through an intermediary, `server.address` SHOULD represent the server address behind any intermediaries, for example proxies, if it&#39;s available.
 */
export const ATTR_SERVER_ADDRESS = 'server.address' as const;

/**
 * Server port number.
 *
 * Note: When observed from the client side, and when communicating through an intermediary, `server.port` SHOULD represent the server port behind any intermediaries, for example proxies, if it&#39;s available.
 */
export const ATTR_SERVER_PORT = 'server.port' as const;

/**
 * Logical name of the service.
 *
 * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
 */
export const ATTR_SERVICE_NAME = 'service.name' as const;

/**
 * The version string of the service API or implementation. The format is not defined by these conventions.
 */
export const ATTR_SERVICE_VERSION = 'service.version' as const;

/**
 * The language of the telemetry SDK.
 */
export const ATTR_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language' as const;

/**
 * The name of the telemetry SDK as defined above.
 *
 * Note: The OpenTelemetry SDK MUST set the `telemetry.sdk.name` attribute to `opentelemetry`.
 * If another SDK, like a fork or a vendor-provided implementation, is used, this SDK MUST set the
 * `telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK&#39;s main entry point
 * or another suitable identifier depending on the language.
 * The identifier `opentelemetry` is reserved and MUST NOT be used in this case.
 * All custom identifiers SHOULD be stable across different versions of an implementation.
 */
export const ATTR_TELEMETRY_SDK_NAME = 'telemetry.sdk.name' as const;

/**
 * The version string of the telemetry SDK.
 */
export const ATTR_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version' as const;

/**
 * The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component.
 */
export const ATTR_URL_FRAGMENT = 'url.fragment' as const;

/**
 * Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986).
 *
 * Note: For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it SHOULD be included nevertheless.
 * `url.full` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password SHOULD be redacted and attribute&#39;s value SHOULD be `https://REDACTED:REDACTED@www.example.com/`.
 * `url.full` SHOULD capture the absolute URL when it is available (or can be reconstructed). Sensitive content provided in `url.full` SHOULD be scrubbed when instrumentations can identify it.
 */
export const ATTR_URL_FULL = 'url.full' as const;

/**
 * The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component.
 *
 * Note: Sensitive content provided in `url.path` SHOULD be scrubbed when instrumentations can identify it.
 */
export const ATTR_URL_PATH = 'url.path' as const;

/**
 * The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component.
 *
 * Note: Sensitive content provided in `url.query` SHOULD be scrubbed when instrumentations can identify it.
 */
export const ATTR_URL_QUERY = 'url.query' as const;

/**
 * The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
 */
export const ATTR_URL_SCHEME = 'url.scheme' as const;

/**
 * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
 */
export const ATTR_USER_AGENT_ORIGINAL = 'user_agent.original' as const;

/**
 * The name of the instrumentation scope - (`InstrumentationScope.Name` in OTLP).
 */
export const ATTR_OTEL_SCOPE_NAME = 'otel.scope.name' as const;

/**
 * The version of the instrumentation scope - (`InstrumentationScope.Version` in OTLP).
 */
export const ATTR_OTEL_SCOPE_VERSION = 'otel.scope.version' as const;

/**
 * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
 */
export const ATTR_OTEL_STATUS_CODE = 'otel.status_code' as const;

/**
 * Description of the Status if it has a value, otherwise not set.
 */
export const ATTR_OTEL_STATUS_DESCRIPTION = 'otel.status_description' as const;

/**
 * Enum value 'acquired' for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
 */
export const ENUM_ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = 'acquired' as const;

/**
 * Enum value 'endpoint_limiter' for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
 */
export const ENUM_ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = 'endpoint_limiter' as const;

/**
 * Enum value 'global_limiter' for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
 */
export const ENUM_ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = 'global_limiter' as const;

/**
 * Enum value 'request_canceled' for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
 */
export const ENUM_ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = 'request_canceled' as const;

/**
 * Enum value 'success' for attribute {@link ATTR_ASPNETCORE_ROUTING_MATCH_STATUS}.
 */
export const ENUM_ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = 'success' as const;

/**
 * Enum value 'failure' for attribute {@link ATTR_ASPNETCORE_ROUTING_MATCH_STATUS}.
 */
export const ENUM_ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = 'failure' as const;

/**
 * Enum value 'handled' for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
 */
export const ENUM_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = 'handled' as const;

/**
 * Enum value 'unhandled' for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
 */
export const ENUM_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = 'unhandled' as const;

/**
 * Enum value 'skipped' for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
 */
export const ENUM_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = 'skipped' as const;

/**
 * Enum value 'aborted' for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
 */
export const ENUM_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = 'aborted' as const;

/**
 * Enum value 'normal_closure' for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
 */
export const ENUM_SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = 'normal_closure' as const;

/**
 * Enum value 'timeout' for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
 */
export const ENUM_SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = 'timeout' as const;

/**
 * Enum value 'app_shutdown' for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
 */
export const ENUM_SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = 'app_shutdown' as const;

/**
 * Enum value 'server_sent_events' for attribute {@link ATTR_SIGNALR_TRANSPORT}.
 */
export const ENUM_SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = 'server_sent_events' as const;

/**
 * Enum value 'long_polling' for attribute {@link ATTR_SIGNALR_TRANSPORT}.
 */
export const ENUM_SIGNALR_TRANSPORT_VALUE_LONG_POLLING = 'long_polling' as const;

/**
 * Enum value 'web_sockets' for attribute {@link ATTR_SIGNALR_TRANSPORT}.
 */
export const ENUM_SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = 'web_sockets' as const;

/**
 * Enum value 'heap' for attribute {@link ATTR_JVM_MEMORY_TYPE}.
 */
export const ENUM_JVM_MEMORY_TYPE_VALUE_HEAP = 'heap' as const;

/**
 * Enum value 'non_heap' for attribute {@link ATTR_JVM_MEMORY_TYPE}.
 */
export const ENUM_JVM_MEMORY_TYPE_VALUE_NON_HEAP = 'non_heap' as const;

/**
 * Enum value 'new' for attribute {@link ATTR_JVM_THREAD_STATE}.
 */
export const ENUM_JVM_THREAD_STATE_VALUE_NEW = 'new' as const;

/**
 * Enum value 'runnable' for attribute {@link ATTR_JVM_THREAD_STATE}.
 */
export const ENUM_JVM_THREAD_STATE_VALUE_RUNNABLE = 'runnable' as const;

/**
 * Enum value 'blocked' for attribute {@link ATTR_JVM_THREAD_STATE}.
 */
export const ENUM_JVM_THREAD_STATE_VALUE_BLOCKED = 'blocked' as const;

/**
 * Enum value 'waiting' for attribute {@link ATTR_JVM_THREAD_STATE}.
 */
export const ENUM_JVM_THREAD_STATE_VALUE_WAITING = 'waiting' as const;

/**
 * Enum value 'timed_waiting' for attribute {@link ATTR_JVM_THREAD_STATE}.
 */
export const ENUM_JVM_THREAD_STATE_VALUE_TIMED_WAITING = 'timed_waiting' as const;

/**
 * Enum value 'terminated' for attribute {@link ATTR_JVM_THREAD_STATE}.
 */
export const ENUM_JVM_THREAD_STATE_VALUE_TERMINATED = 'terminated' as const;

/**
 * Enum value '_OTHER' for attribute {@link ATTR_ERROR_TYPE}.
 */
export const ENUM_ERROR_TYPE_VALUE_OTHER = '_OTHER' as const;

/**
 * Enum value 'CONNECT' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_CONNECT = 'CONNECT' as const;

/**
 * Enum value 'DELETE' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_DELETE = 'DELETE' as const;

/**
 * Enum value 'GET' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_GET = 'GET' as const;

/**
 * Enum value 'HEAD' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_HEAD = 'HEAD' as const;

/**
 * Enum value 'OPTIONS' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_OPTIONS = 'OPTIONS' as const;

/**
 * Enum value 'PATCH' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_PATCH = 'PATCH' as const;

/**
 * Enum value 'POST' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_POST = 'POST' as const;

/**
 * Enum value 'PUT' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_PUT = 'PUT' as const;

/**
 * Enum value 'TRACE' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_TRACE = 'TRACE' as const;

/**
 * Enum value '_OTHER' for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
 */
export const ENUM_HTTP_REQUEST_METHOD_VALUE_OTHER = '_OTHER' as const;

/**
 * Enum value 'tcp' for attribute {@link ATTR_NETWORK_TRANSPORT}.
 */
export const ENUM_NETWORK_TRANSPORT_VALUE_TCP = 'tcp' as const;

/**
 * Enum value 'udp' for attribute {@link ATTR_NETWORK_TRANSPORT}.
 */
export const ENUM_NETWORK_TRANSPORT_VALUE_UDP = 'udp' as const;

/**
 * Enum value 'pipe' for attribute {@link ATTR_NETWORK_TRANSPORT}.
 */
export const ENUM_NETWORK_TRANSPORT_VALUE_PIPE = 'pipe' as const;

/**
 * Enum value 'unix' for attribute {@link ATTR_NETWORK_TRANSPORT}.
 */
export const ENUM_NETWORK_TRANSPORT_VALUE_UNIX = 'unix' as const;

/**
 * Enum value 'ipv4' for attribute {@link ATTR_NETWORK_TYPE}.
 */
export const ENUM_NETWORK_TYPE_VALUE_IPV4 = 'ipv4' as const;

/**
 * Enum value 'ipv6' for attribute {@link ATTR_NETWORK_TYPE}.
 */
export const ENUM_NETWORK_TYPE_VALUE_IPV6 = 'ipv6' as const;

/**
 * Enum value 'cpp' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_CPP = 'cpp' as const;

/**
 * Enum value 'dotnet' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = 'dotnet' as const;

/**
 * Enum value 'erlang' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = 'erlang' as const;

/**
 * Enum value 'go' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_GO = 'go' as const;

/**
 * Enum value 'java' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = 'java' as const;

/**
 * Enum value 'nodejs' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = 'nodejs' as const;

/**
 * Enum value 'php' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_PHP = 'php' as const;

/**
 * Enum value 'python' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = 'python' as const;

/**
 * Enum value 'ruby' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = 'ruby' as const;

/**
 * Enum value 'rust' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_RUST = 'rust' as const;

/**
 * Enum value 'swift' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = 'swift' as const;

/**
 * Enum value 'webjs' for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
 */
export const ENUM_TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = 'webjs' as const;

/**
 * Enum value 'OK' for attribute {@link ATTR_OTEL_STATUS_CODE}.
 */
export const ENUM_OTEL_STATUS_CODE_VALUE_OK = 'OK' as const;

/**
 * Enum value 'ERROR' for attribute {@link ATTR_OTEL_STATUS_CODE}.
 */
export const ENUM_OTEL_STATUS_CODE_VALUE_ERROR = 'ERROR' as const;
