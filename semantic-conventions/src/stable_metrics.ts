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
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates/register/stable/metrics.ts.j2
//----------------------------------------------------------------------------------------------------------

/**
 * Number of exceptions caught by exception handling middleware.
 *
 * @note Meter name: `Microsoft.AspNetCore.Diagnostics`; Added in: ASP.NET Core 8.0
 */
export const METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = 'aspnetcore.diagnostics.exceptions' as const;

/**
 * Number of requests that are currently active on the server that hold a rate limiting lease.
 *
 * @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = 'aspnetcore.rate_limiting.active_request_leases' as const;

/**
 * Number of requests that are currently queued, waiting to acquire a rate limiting lease.
 *
 * @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = 'aspnetcore.rate_limiting.queued_requests' as const;

/**
 * The time the request spent in a queue waiting to acquire a rate limiting lease.
 *
 * @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = 'aspnetcore.rate_limiting.request.time_in_queue' as const;

/**
 * The duration of rate limiting lease held by requests on the server.
 *
 * @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = 'aspnetcore.rate_limiting.request_lease.duration' as const;

/**
 * Number of requests that tried to acquire a rate limiting lease.
 *
 * @note Requests could be:
 * 
 * * Rejected by global or endpoint rate limiting policies
 * * Canceled while waiting for the lease.
 * 
 * Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
 */
export const METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = 'aspnetcore.rate_limiting.requests' as const;

/**
 * Number of requests that were attempted to be matched to an endpoint.
 *
 * @note Meter name: `Microsoft.AspNetCore.Routing`; Added in: ASP.NET Core 8.0
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
 * @note The value range is [0.0,1.0]. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getProcessCpuLoad()).
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
 * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
 */
export const METRIC_KESTREL_ACTIVE_CONNECTIONS = 'kestrel.active_connections' as const;

/**
 * Number of TLS handshakes that are currently in progress on the server.
 *
 * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
 */
export const METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = 'kestrel.active_tls_handshakes' as const;

/**
 * The duration of connections on the server.
 *
 * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
 */
export const METRIC_KESTREL_CONNECTION_DURATION = 'kestrel.connection.duration' as const;

/**
 * Number of connections that are currently queued and are waiting to start.
 *
 * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
 */
export const METRIC_KESTREL_QUEUED_CONNECTIONS = 'kestrel.queued_connections' as const;

/**
 * Number of HTTP requests on multiplexed connections (HTTP/2 and HTTP/3) that are currently queued and are waiting to start.
 *
 * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
 */
export const METRIC_KESTREL_QUEUED_REQUESTS = 'kestrel.queued_requests' as const;

/**
 * Number of connections rejected by the server.
 *
 * @note Connections are rejected when the currently active count exceeds the value configured with `MaxConcurrentConnections`.
 * Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
 */
export const METRIC_KESTREL_REJECTED_CONNECTIONS = 'kestrel.rejected_connections' as const;

/**
 * The duration of TLS handshakes on the server.
 *
 * @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
 */
export const METRIC_KESTREL_TLS_HANDSHAKE_DURATION = 'kestrel.tls_handshake.duration' as const;

/**
 * Number of connections that are currently upgraded (WebSockets). .
 *
 * @note The counter only tracks HTTP/1.1 connections.
 * 
 * Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
 */
export const METRIC_KESTREL_UPGRADED_CONNECTIONS = 'kestrel.upgraded_connections' as const;

/**
 * Number of connections that are currently active on the server.
 *
 * @note Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0
 */
export const METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = 'signalr.server.active_connections' as const;

/**
 * The duration of connections on the server.
 *
 * @note Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0
 */
export const METRIC_SIGNALR_SERVER_CONNECTION_DURATION = 'signalr.server.connection.duration' as const;

