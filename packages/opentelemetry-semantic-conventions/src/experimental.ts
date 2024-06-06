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
 * Total CPU time consumed.
 *
 * Note: Total CPU time consumed by the specific container on all available CPU cores.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_CPU_TIME = 'container.cpu.time' as const;

/**
 * Disk bytes for the container.
 *
 * Note: The total number of bytes read/written successfully (aggregated from all disks).
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_DISK_IO = 'container.disk.io' as const;

/**
 * Memory usage of the container.
 *
 * Note: Memory usage of the container.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_MEMORY_USAGE = 'container.memory.usage' as const;

/**
 * Network bytes for the container.
 *
 * Note: The number of bytes sent/received on all network interfaces by the container.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_NETWORK_IO = 'container.network.io' as const;

/**
 * The time it took to create a new connection.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_CREATETIME = 'db.client.connections.create_time' as const;

/**
 * The maximum number of idle open connections allowed.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_IDLE_MAX = 'db.client.connections.idle.max' as const;

/**
 * The minimum number of idle open connections allowed.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_IDLE_MIN = 'db.client.connections.idle.min' as const;

/**
 * The maximum number of open connections allowed.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_MAX = 'db.client.connections.max' as const;

/**
 * The number of pending requests for an open connection, cumulative for the entire pool.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_PENDINGREQUESTS = 'db.client.connections.pending_requests' as const;

/**
 * The number of connection timeouts that have occurred trying to obtain a connection from the pool.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_TIMEOUTS = 'db.client.connections.timeouts' as const;

/**
 * The number of connections that are currently in state described by the `state` attribute.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_USAGE = 'db.client.connections.usage' as const;

/**
 * The time between borrowing a connection and returning it to the pool.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_USETIME = 'db.client.connections.use_time' as const;

/**
 * The time it took to obtain an open connection from the pool.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_WAITTIME = 'db.client.connections.wait_time' as const;

/**
 * Measures the time taken to perform a DNS lookup.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DNS_LOOKUP_DURATION = 'dns.lookup.duration' as const;

/**
 * Number of invocation cold starts.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_COLDSTARTS = 'faas.coldstarts' as const;

/**
 * Distribution of CPU usage per invocation.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_CPUUSAGE = 'faas.cpu_usage' as const;

/**
 * Number of invocation errors.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_ERRORS = 'faas.errors' as const;

/**
 * Measures the duration of the function&#39;s initialization, such as a cold start.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INITDURATION = 'faas.init_duration' as const;

/**
 * Number of successful invocations.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INVOCATIONS = 'faas.invocations' as const;

/**
 * Measures the duration of the function&#39;s logic execution.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INVOKEDURATION = 'faas.invoke_duration' as const;

/**
 * Distribution of max memory usage per invocation.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_MEMUSAGE = 'faas.mem_usage' as const;

/**
 * Distribution of net I/O usage per invocation.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_NETIO = 'faas.net_io' as const;

/**
 * Number of invocation timeouts.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_TIMEOUTS = 'faas.timeouts' as const;

/**
 * Number of active HTTP requests.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_ACTIVEREQUESTS = 'http.client.active_requests' as const;

/**
 * The duration of the successfully established outbound HTTP connections.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_CONNECTION_DURATION = 'http.client.connection.duration' as const;

/**
 * Number of outbound HTTP connections that are currently active or idle on the client.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_OPENCONNECTIONS = 'http.client.open_connections' as const;

/**
 * Size of HTTP client request bodies.
 *
 * Note: The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_REQUEST_BODY_SIZE = 'http.client.request.body.size' as const;

/**
 * Size of HTTP client response bodies.
 *
 * Note: The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_RESPONSE_BODY_SIZE = 'http.client.response.body.size' as const;

/**
 * Number of active HTTP server requests.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_ACTIVEREQUESTS = 'http.server.active_requests' as const;

/**
 * Size of HTTP server request bodies.
 *
 * Note: The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_REQUEST_BODY_SIZE = 'http.server.request.body.size' as const;

/**
 * Size of HTTP server response bodies.
 *
 * Note: The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_RESPONSE_BODY_SIZE = 'http.server.response.body.size' as const;

/**
 * Number of buffers in the pool.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_COUNT = 'jvm.buffer.count' as const;

/**
 * Measure of total memory capacity of buffers.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_MEMORY_LIMIT = 'jvm.buffer.memory.limit' as const;

/**
 * Measure of memory used by buffers.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_MEMORY_USAGE = 'jvm.buffer.memory.usage' as const;

/**
 * Measure of initial memory requested.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_MEMORY_INIT = 'jvm.memory.init' as const;

/**
 * Average CPU load of the whole system for the last minute as reported by the JVM.
 *
 * Note: The value range is [0,n], where n is the number of CPU cores - or a negative number if the value is not available. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/java.management/java/lang/management/OperatingSystemMXBean.html#getSystemLoadAverage()).
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_SYSTEM_CPU_LOAD1M = 'jvm.system.cpu.load_1m' as const;

/**
 * Recent CPU utilization for the whole system as reported by the JVM.
 *
 * Note: The value range is [0.0,1.0]. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getCpuLoad()).
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_SYSTEM_CPU_UTILIZATION = 'jvm.system.cpu.utilization' as const;

/**
 * Measures the duration of process operation.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PROCESS_DURATION = 'messaging.process.duration' as const;

/**
 * Measures the number of processed messages.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PROCESS_MESSAGES = 'messaging.process.messages' as const;

/**
 * Measures the duration of publish operation.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PUBLISH_DURATION = 'messaging.publish.duration' as const;

/**
 * Measures the number of published messages.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PUBLISH_MESSAGES = 'messaging.publish.messages' as const;

/**
 * Measures the duration of receive operation.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_RECEIVE_DURATION = 'messaging.receive.duration' as const;

/**
 * Measures the number of received messages.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_RECEIVE_MESSAGES = 'messaging.receive.messages' as const;

/**
 * Number of times the process has been context switched.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CONTEXTSWITCHES = 'process.context_switches' as const;

/**
 * Total CPU seconds broken down by different states.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CPU_TIME = 'process.cpu.time' as const;

/**
 * Difference in process.cpu.time since the last measurement, divided by the elapsed time and number of CPUs available to the process.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CPU_UTILIZATION = 'process.cpu.utilization' as const;

/**
 * Disk bytes transferred.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_DISK_IO = 'process.disk.io' as const;

/**
 * The amount of physical memory in use.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_MEMORY_USAGE = 'process.memory.usage' as const;

/**
 * The amount of committed virtual memory.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_MEMORY_VIRTUAL = 'process.memory.virtual' as const;

/**
 * Network bytes transferred.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_NETWORK_IO = 'process.network.io' as const;

/**
 * Number of file descriptors in use by the process.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_OPENFILEDESCRIPTOR_COUNT = 'process.open_file_descriptor.count' as const;

/**
 * Number of page faults the process has made.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_PAGING_FAULTS = 'process.paging.faults' as const;

/**
 * Process threads count.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_THREAD_COUNT = 'process.thread.count' as const;

/**
 * Measures the duration of outbound RPC.
 *
 * Note: While streaming RPCs may record this metric as start-of-batch
 * to end-of-batch, it&#39;s hard to interpret in practice.
 * 
 * **Streaming**: N/A.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_DURATION = 'rpc.client.duration' as const;

/**
 * Measures the size of RPC request messages (uncompressed).
 *
 * Note: **Streaming**: Recorded per message in a streaming batch.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_REQUEST_SIZE = 'rpc.client.request.size' as const;

/**
 * Measures the number of messages received per RPC.
 *
 * Note: Should be 1 for all non-streaming RPCs.
 * 
 * **Streaming**: This metric is required for server and client streaming RPCs.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_REQUESTSPERRPC = 'rpc.client.requests_per_rpc' as const;

/**
 * Measures the size of RPC response messages (uncompressed).
 *
 * Note: **Streaming**: Recorded per response in a streaming batch.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_RESPONSE_SIZE = 'rpc.client.response.size' as const;

/**
 * Measures the number of messages sent per RPC.
 *
 * Note: Should be 1 for all non-streaming RPCs.
 * 
 * **Streaming**: This metric is required for server and client streaming RPCs.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_RESPONSESPERRPC = 'rpc.client.responses_per_rpc' as const;

/**
 * Measures the duration of inbound RPC.
 *
 * Note: While streaming RPCs may record this metric as start-of-batch
 * to end-of-batch, it&#39;s hard to interpret in practice.
 * 
 * **Streaming**: N/A.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_DURATION = 'rpc.server.duration' as const;

/**
 * Measures the size of RPC request messages (uncompressed).
 *
 * Note: **Streaming**: Recorded per message in a streaming batch.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_REQUEST_SIZE = 'rpc.server.request.size' as const;

/**
 * Measures the number of messages received per RPC.
 *
 * Note: Should be 1 for all non-streaming RPCs.
 * 
 * **Streaming** : This metric is required for server and client streaming RPCs.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_REQUESTSPERRPC = 'rpc.server.requests_per_rpc' as const;

/**
 * Measures the size of RPC response messages (uncompressed).
 *
 * Note: **Streaming**: Recorded per response in a streaming batch.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_RESPONSE_SIZE = 'rpc.server.response.size' as const;

/**
 * Measures the number of messages sent per RPC.
 *
 * Note: Should be 1 for all non-streaming RPCs.
 * 
 * **Streaming**: This metric is required for server and client streaming RPCs.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_RESPONSESPERRPC = 'rpc.server.responses_per_rpc' as const;

/**
 * Reports the current frequency of the CPU in Hz.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_FREQUENCY = 'system.cpu.frequency' as const;

/**
 * Reports the number of logical (virtual) processor cores created by the operating system to manage multitasking.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_LOGICAL_COUNT = 'system.cpu.logical.count' as const;

/**
 * Reports the number of actual physical processor cores on the hardware.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_PHYSICAL_COUNT = 'system.cpu.physical.count' as const;

/**
 * Seconds each logical CPU spent on each mode.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_TIME = 'system.cpu.time' as const;

/**
 * Difference in system.cpu.time since the last measurement, divided by the elapsed time and number of logical CPUs.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_UTILIZATION = 'system.cpu.utilization' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_IO = 'system.disk.io' as const;

/**
 * Time disk spent activated.
 *
 * Note: The real elapsed time (&#34;wall clock&#34;) used in the I/O path (time from operations running in parallel are not counted). Measured as:
 * 
 * - Linux: Field 13 from [procfs-diskstats](https://www.kernel.org/doc/Documentation/ABI/testing/procfs-diskstats)
 * - Windows: The complement of
 *   [&#34;Disk\% Idle Time&#34;](https://learn.microsoft.com/archive/blogs/askcore/windows-performance-monitor-disk-counters-explained#windows-performance-monitor-disk-counters-explained)
 *   performance counter: `uptime * (100 - &#34;Disk\% Idle Time&#34;) / 100`.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_IOTIME = 'system.disk.io_time' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_MERGED = 'system.disk.merged' as const;

/**
 * Sum of the time each operation took to complete.
 *
 * Note: Because it is the sum of time each request took, parallel-issued requests each contribute to make the count grow. Measured as:
 * 
 * - Linux: Fields 7 &amp; 11 from [procfs-diskstats](https://www.kernel.org/doc/Documentation/ABI/testing/procfs-diskstats)
 * - Windows: &#34;Avg. Disk sec/Read&#34; perf counter multiplied by &#34;Disk Reads/sec&#34; perf counter (similar for Writes).
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_OPERATIONTIME = 'system.disk.operation_time' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_OPERATIONS = 'system.disk.operations' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_FILESYSTEM_USAGE = 'system.filesystem.usage' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_FILESYSTEM_UTILIZATION = 'system.filesystem.utilization' as const;

/**
 * An estimate of how much memory is available for starting new applications, without causing swapping.
 *
 * Note: This is an alternative to `system.memory.usage` metric with `state=free`.
 * Linux starting from 3.14 exports &#34;available&#34; memory. It takes &#34;free&#34; memory as a baseline, and then factors in kernel-specific values.
 * This is supposed to be more accurate than just &#34;free&#34; memory.
 * For reference, see the calculations [here](https://superuser.com/a/980821).
 * See also `MemAvailable` in [/proc/meminfo](https://man7.org/linux/man-pages/man5/proc.5.html).
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_LINUX_MEMORY_AVAILABLE = 'system.linux.memory.available' as const;

/**
 * Total memory available in the system.
 *
 * Note: Its value SHOULD equal the sum of `system.memory.state` over all states.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_LIMIT = 'system.memory.limit' as const;

/**
 * Reports memory in use by state.
 *
 * Note: The sum over all `system.memory.state` values SHOULD equal the total memory
 * available on the system, that is `system.memory.limit`.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_USAGE = 'system.memory.usage' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_UTILIZATION = 'system.memory.utilization' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_CONNECTIONS = 'system.network.connections' as const;

/**
 * Count of packets that are dropped or discarded even though there was no error.
 *
 * Note: Measured as:
 * 
 * - Linux: the `drop` column in `/proc/dev/net` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html))
 * - Windows: [`InDiscards`/`OutDiscards`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
 *   from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2).
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_DROPPED = 'system.network.dropped' as const;

/**
 * Count of network errors detected.
 *
 * Note: Measured as:
 * 
 * - Linux: the `errs` column in `/proc/dev/net` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html)).
 * - Windows: [`InErrors`/`OutErrors`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
 *   from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2).
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_ERRORS = 'system.network.errors' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_IO = 'system.network.io' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_PACKETS = 'system.network.packets' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_FAULTS = 'system.paging.faults' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_OPERATIONS = 'system.paging.operations' as const;

/**
 * Unix swap or windows pagefile usage.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_USAGE = 'system.paging.usage' as const;

/**
 * .
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_UTILIZATION = 'system.paging.utilization' as const;

/**
 * Total number of processes in each state.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PROCESS_COUNT = 'system.process.count' as const;

/**
 * Total number of processes created over uptime of the host.
 *
 * @experimental This metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PROCESS_CREATED = 'system.process.created' as const;

/**
 * Identifies the class / type of event.
 *
 * Note: Event names are subject to the same rules as [attribute names](https://github.com/open-telemetry/opentelemetry-specification/tree/v1.31.0/specification/common/attribute-naming.md). Notably, event names are namespaced to avoid collisions and provide a clean separation of semantics for events in separate domains like browser, mobile, and kubernetes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_EVENT_NAME = 'event.name' as const;

/**
 * A unique identifier for the Log Record.
 *
 * Note: If an id is provided, other log records with the same id will be considered duplicates and can be removed safely. This means, that two distinguishable log records MUST have different values.
 * The id MAY be an [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec), but other identifiers (e.g. UUID) may be used as needed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_RECORD_UID = 'log.record.uid' as const;

/**
 * The stream associated with the log. See below for a list of well-known values.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_IOSTREAM = 'log.iostream' as const;

/**
 * The basename of the file.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_NAME = 'log.file.name' as const;

/**
 * The basename of the file, with symlinks resolved.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_NAMERESOLVED = 'log.file.name_resolved' as const;

/**
 * The full path to the file.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_PATH = 'log.file.path' as const;

/**
 * The full path to the file, with symlinks resolved.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_PATHRESOLVED = 'log.file.path_resolved' as const;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_IOS_STATE = 'ios.state' as const;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ANDROID_STATE = 'android.state' as const;

/**
 * The name of the connection pool; unique within the instrumented application. In case the connection pool implementation doesn&#39;t provide a name, instrumentation should use a combination of `server.address` and `server.port` attributes formatted as `server.address:server.port`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_POOL_NAME = 'pool.name' as const;

/**
 * The state of a connection in the pool.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_STATE = 'state' as const;

/**
 * Name of the buffer pool.
 *
 * Note: Pool names are generally obtained via [BufferPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/BufferPoolMXBean.html#getName()).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_JVM_BUFFER_POOL_NAME = 'jvm.buffer.pool.name' as const;

/**
 * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_CPU_STATE = 'process.cpu.state' as const;

/**
 * Specifies whether the context switches for this data point were voluntary or involuntary.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_CONTEXTSWITCHTYPE = 'process.context_switch_type' as const;

/**
 * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PAGING_FAULTTYPE = 'process.paging.fault_type' as const;

/**
 * The device identifier.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_DEVICE = 'system.device' as const;

/**
 * The logical CPU number [0..n-1].
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_CPU_LOGICALNUMBER = 'system.cpu.logical_number' as const;

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_CPU_STATE = 'system.cpu.state' as const;

/**
 * The memory state.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_MEMORY_STATE = 'system.memory.state' as const;

/**
 * The paging access direction.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_DIRECTION = 'system.paging.direction' as const;

/**
 * The memory paging state.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_STATE = 'system.paging.state' as const;

/**
 * The memory paging type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_TYPE = 'system.paging.type' as const;

/**
 * The filesystem mode.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_MODE = 'system.filesystem.mode' as const;

/**
 * The filesystem mount path.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_MOUNTPOINT = 'system.filesystem.mountpoint' as const;

/**
 * The filesystem state.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_STATE = 'system.filesystem.state' as const;

/**
 * The filesystem type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_TYPE = 'system.filesystem.type' as const;

/**
 * A stateless protocol MUST NOT set this attribute.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_NETWORK_STATE = 'system.network.state' as const;

/**
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PROCESS_STATUS = 'system.process.status' as const;

/**
 * Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found [here](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ANDROID_OS_APILEVEL = 'android.os.api_level' as const;

/**
 * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ATTRIBUTEDEFINITIONS = 'aws.dynamodb.attribute_definitions' as const;

/**
 * The value of the `AttributesToGet` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ATTRIBUTESTOGET = 'aws.dynamodb.attributes_to_get' as const;

/**
 * The value of the `ConsistentRead` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_CONSISTENTREAD = 'aws.dynamodb.consistent_read' as const;

/**
 * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_CONSUMEDCAPACITY = 'aws.dynamodb.consumed_capacity' as const;

/**
 * The value of the `Count` response parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_COUNT = 'aws.dynamodb.count' as const;

/**
 * The value of the `ExclusiveStartTableName` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_EXCLUSIVESTARTTABLE = 'aws.dynamodb.exclusive_start_table' as const;

/**
 * The JSON-serialized value of each item in the `GlobalSecondaryIndexUpdates` request field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_GLOBALSECONDARYINDEXUPDATES = 'aws.dynamodb.global_secondary_index_updates' as const;

/**
 * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_GLOBALSECONDARYINDEXES = 'aws.dynamodb.global_secondary_indexes' as const;

/**
 * The value of the `IndexName` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_INDEXNAME = 'aws.dynamodb.index_name' as const;

/**
 * The JSON-serialized value of the `ItemCollectionMetrics` response field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ITEMCOLLECTIONMETRICS = 'aws.dynamodb.item_collection_metrics' as const;

/**
 * The value of the `Limit` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_LIMIT = 'aws.dynamodb.limit' as const;

/**
 * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_LOCALSECONDARYINDEXES = 'aws.dynamodb.local_secondary_indexes' as const;

/**
 * The value of the `ProjectionExpression` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROJECTION = 'aws.dynamodb.projection' as const;

/**
 * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROVISIONEDREADCAPACITY = 'aws.dynamodb.provisioned_read_capacity' as const;

/**
 * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROVISIONEDWRITECAPACITY = 'aws.dynamodb.provisioned_write_capacity' as const;

/**
 * The value of the `ScanIndexForward` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SCANFORWARD = 'aws.dynamodb.scan_forward' as const;

/**
 * The value of the `ScannedCount` response parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SCANNEDCOUNT = 'aws.dynamodb.scanned_count' as const;

/**
 * The value of the `Segment` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SEGMENT = 'aws.dynamodb.segment' as const;

/**
 * The value of the `Select` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SELECT = 'aws.dynamodb.select' as const;

/**
 * The number of items in the `TableNames` response parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TABLECOUNT = 'aws.dynamodb.table_count' as const;

/**
 * The keys in the `RequestItems` object field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TABLENAMES = 'aws.dynamodb.table_names' as const;

/**
 * The value of the `TotalSegments` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TOTALSEGMENTS = 'aws.dynamodb.total_segments' as const;

/**
 * Array of brand name and version separated by a space.
 *
 * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_BRANDS = 'browser.brands' as const;

/**
 * Preferred language of the user using the browser.
 *
 * Note: This value is intended to be taken from the Navigator API `navigator.language`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_LANGUAGE = 'browser.language' as const;

/**
 * A boolean that is true if the browser is running on a mobile device.
 *
 * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute SHOULD be left unset.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_MOBILE = 'browser.mobile' as const;

/**
 * The platform on which the browser is running.
 *
 * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API SHOULD NOT be used instead and this attribute SHOULD be left unset in order for the values to be consistent.
 * The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_PLATFORM = 'browser.platform' as const;

/**
 * The cloud account ID the resource is assigned to.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_ACCOUNT_ID = 'cloud.account.id' as const;

/**
 * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
 *
 * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_AVAILABILITYZONE = 'cloud.availability_zone' as const;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_PLATFORM = 'cloud.platform' as const;

/**
 * Name of the cloud provider.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_PROVIDER = 'cloud.provider' as const;

/**
 * The geographical region the resource is running.
 *
 * Note: Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://www.tencentcloud.com/document/product/213/6091).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_REGION = 'cloud.region' as const;

/**
 * Cloud provider-specific native identifier of the monitored cloud resource (e.g. an [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) on AWS, a [fully qualified resource ID](https://learn.microsoft.com/rest/api/resources/resources/get-by-id) on Azure, a [full resource name](https://cloud.google.com/apis/design/resource_names#full_resource_name) on GCP).
 *
 * Note: On some cloud providers, it may not be possible to determine the full ID at startup,
 * so it may be necessary to set `cloud.resource_id` as a span attribute instead.
 * 
 * The exact value to use for `cloud.resource_id` depends on the cloud provider.
 * The following well-known definitions MUST be used if you set this attribute and they apply:
 * 
 * * **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
 *   Take care not to use the &#34;invoked ARN&#34; directly but replace any
 *   [alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html)
 *   with the resolved function version, as the same runtime instance may be invokable with
 *   multiple different aliases.
 * * **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
 * * **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/rest/api/resources/resources/get-by-id) of the invoked function,
 *   *not* the function app, having the form
 *   `/subscriptions/&lt;SUBSCIPTION_GUID&gt;/resourceGroups/&lt;RG&gt;/providers/Microsoft.Web/sites/&lt;FUNCAPP&gt;/functions/&lt;FUNC&gt;`.
 *   This means that a span attribute MUST be used, as an Azure function app can host multiple functions that would usually share
 *   a TracerProvider.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_RESOURCEID = 'cloud.resource_id' as const;

/**
 * The [event_id](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#id) uniquely identifies the event.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENTID = 'cloudevents.event_id' as const;

/**
 * The [source](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#source-1) identifies the context in which an event happened.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENTSOURCE = 'cloudevents.event_source' as const;

/**
 * The [version of the CloudEvents specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#specversion) which the event uses.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENTSPECVERSION = 'cloudevents.event_spec_version' as const;

/**
 * The [subject](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#subject) of the event in the context of the event producer (identified by source).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENTSUBJECT = 'cloudevents.event_subject' as const;

/**
 * The [event_type](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#type) contains a value describing the type of event related to the originating occurrence.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENTTYPE = 'cloudevents.event_type' as const;

/**
 * The column number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_COLUMN = 'code.column' as const;

/**
 * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_FILEPATH = 'code.filepath' as const;

/**
 * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_FUNCTION = 'code.function' as const;

/**
 * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_LINENO = 'code.lineno' as const;

/**
 * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_NAMESPACE = 'code.namespace' as const;

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_STACKTRACE = 'code.stacktrace' as const;

/**
 * The command used to run the container (i.e. the command name).
 *
 * Note: If using embedded credentials or sensitive data, it is recommended to remove them to prevent potential leakage.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMAND = 'container.command' as const;

/**
 * All the command arguments (including the command/executable itself) run by the container. [2].
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMANDARGS = 'container.command_args' as const;

/**
 * The full command run by the container as a single string representing the full command. [2].
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMANDLINE = 'container.command_line' as const;

/**
 * The CPU state for this data point.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_CPU_STATE = 'container.cpu.state' as const;

/**
 * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_ID = 'container.id' as const;

/**
 * Runtime specific image identifier. Usually a hash algorithm followed by a UUID.
 *
 * Note: Docker defines a sha256 of the image id; `container.image.id` corresponds to the `Image` field from the Docker container inspect [API](https://docs.docker.com/engine/api/v1.43/#tag/Container/operation/ContainerInspect) endpoint.
 * K8s defines a link to the container registry repository with digest `&#34;imageID&#34;: &#34;registry.azurecr.io /namespace/service/dockerfile@sha256:bdeabd40c3a8a492eaf9e8e44d0ebbb84bac7ee25ac0cf8a7159d25f62555625&#34;`.
 * The ID is assinged by the container runtime and can vary in different environments. Consider using `oci.manifest.digest` if it is important to identify the same image in different environments/runtimes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_ID = 'container.image.id' as const;

/**
 * Name of the image the container was built on.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_NAME = 'container.image.name' as const;

/**
 * Repo digests of the container image as provided by the container runtime.
 *
 * Note: [Docker](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect) and [CRI](https://github.com/kubernetes/cri-api/blob/c75ef5b473bbe2d0a4fc92f82235efd665ea8e9f/pkg/apis/runtime/v1/api.proto#L1237-L1238) report those under the `RepoDigests` field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_REPODIGESTS = 'container.image.repo_digests' as const;

/**
 * Container image tags. An example can be found in [Docker Image Inspect](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect). Should be only the `&lt;tag&gt;` section of the full name for example from `registry.example.com/my-org/my-image:&lt;tag&gt;`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_TAGS = 'container.image.tags' as const;

/**
 * Container name used by container runtime.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_NAME = 'container.name' as const;

/**
 * The container runtime managing this container.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_RUNTIME = 'container.runtime' as const;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_CONSISTENCYLEVEL = 'db.cassandra.consistency_level' as const;

/**
 * The data center of the coordinating node for a query.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_COORDINATOR_DC = 'db.cassandra.coordinator.dc' as const;

/**
 * The ID of the coordinating node for a query.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_COORDINATOR_ID = 'db.cassandra.coordinator.id' as const;

/**
 * Whether or not the query is idempotent.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_IDEMPOTENCE = 'db.cassandra.idempotence' as const;

/**
 * The fetch size used for paging, i.e. how many rows will be returned at once.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_PAGESIZE = 'db.cassandra.page_size' as const;

/**
 * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_SPECULATIVEEXECUTIONCOUNT = 'db.cassandra.speculative_execution_count' as const;

/**
 * The name of the primary Cassandra table that the operation is acting upon, including the keyspace name (if applicable).
 *
 * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_TABLE = 'db.cassandra.table' as const;

/**
 * Unique Cosmos client instance id.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_CLIENTID = 'db.cosmosdb.client_id' as const;

/**
 * Cosmos client connection mode.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_CONNECTIONMODE = 'db.cosmosdb.connection_mode' as const;

/**
 * Cosmos DB container name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_CONTAINER = 'db.cosmosdb.container' as const;

/**
 * CosmosDB Operation Type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_OPERATIONTYPE = 'db.cosmosdb.operation_type' as const;

/**
 * RU consumed for that operation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_REQUESTCHARGE = 'db.cosmosdb.request_charge' as const;

/**
 * Request payload size in bytes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_REQUESTCONTENTLENGTH = 'db.cosmosdb.request_content_length' as const;

/**
 * Cosmos DB status code.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_STATUSCODE = 'db.cosmosdb.status_code' as const;

/**
 * Cosmos DB sub status code.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_SUBSTATUSCODE = 'db.cosmosdb.sub_status_code' as const;

/**
 * Represents the identifier of an Elasticsearch cluster.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_ELASTICSEARCH_CLUSTER_NAME = 'db.elasticsearch.cluster.name' as const;

/**
 * An identifier (address, unique name, or any other identifier) of the database instance that is executing queries or mutations on the current connection. This is useful in cases where the database is running in a clustered environment and the instrumentation is able to record the node executing the query. The client may obtain this value in databases like MySQL using queries like `select @@hostname`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_INSTANCE_ID = 'db.instance.id' as const;

/**
 * The MongoDB collection being accessed within the database stated in `db.name`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_MONGODB_COLLECTION = 'db.mongodb.collection' as const;

/**
 * The Microsoft SQL Server [instance name](https://docs.microsoft.com/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
 *
 * Note: If setting a `db.mssql.instance_name`, `server.port` is no longer required (but still recommended if non-standard).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_MSSQL_INSTANCENAME = 'db.mssql.instance_name' as const;

/**
 * This attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
 *
 * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;. In case there are multiple layers that could be considered for database name (e.g. Oracle instance name and schema name), the database name to be used is the more specific layer (e.g. Oracle schema name).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_NAME = 'db.name' as const;

/**
 * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
 *
 * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_OPERATION = 'db.operation' as const;

/**
 * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_REDIS_DATABASEINDEX = 'db.redis.database_index' as const;

/**
 * The name of the primary table that the operation is acting upon, including the database name (if applicable).
 *
 * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_SQL_TABLE = 'db.sql.table' as const;

/**
 * The database statement being executed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_STATEMENT = 'db.statement' as const;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_SYSTEM = 'db.system' as const;

/**
 * Username for accessing the database.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_USER = 'db.user' as const;

/**
 * Name of the [deployment environment](https://wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
 *
 * Note: `deployment.environment` does not affect the uniqueness constraints defined through
 * the `service.namespace`, `service.name` and `service.instance.id` resource attributes.
 * This implies that resources carrying the following attribute combinations MUST be
 * considered to be identifying the same service:
 * 
 * * `service.name=frontend`, `deployment.environment=production`
 * * `service.name=frontend`, `deployment.environment=staging`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEPLOYMENT_ENVIRONMENT = 'deployment.environment' as const;

/**
 * Deprecated, use `server.address`, `server.port` attributes instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated "Replaced by `server.address` and `server.port`.".
 */
export const ATTR_DB_CONNECTIONSTRING = 'db.connection_string' as const;

/**
 * Deprecated, use `db.instance.id` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.instance.id`.
 */
export const ATTR_DB_ELASTICSEARCH_NODE_NAME = 'db.elasticsearch.node.name' as const;

/**
 * Removed, no replacement at this time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Removed as not used.
 */
export const ATTR_DB_JDBC_DRIVERCLASSNAME = 'db.jdbc.driver_classname' as const;

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ATTR_HTTP_FLAVOR = 'http.flavor' as const;

/**
 * Deprecated, use `http.request.method` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `http.request.method`.
 */
export const ATTR_HTTP_METHOD = 'http.method' as const;

/**
 * Deprecated, use `http.request.header.content-length` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `http.request.header.content-length`.
 */
export const ATTR_HTTP_REQUESTCONTENTLENGTH = 'http.request_content_length' as const;

/**
 * Deprecated, use `http.response.header.content-length` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `http.response.header.content-length`.
 */
export const ATTR_HTTP_RESPONSECONTENTLENGTH = 'http.response_content_length' as const;

/**
 * Deprecated, use `url.scheme` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `url.scheme` instead.
 */
export const ATTR_HTTP_SCHEME = 'http.scheme' as const;

/**
 * Deprecated, use `http.response.status_code` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `http.response.status_code`.
 */
export const ATTR_HTTP_STATUSCODE = 'http.status_code' as const;

/**
 * Deprecated, use `url.path` and `url.query` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `url.path` and `url.query.
 */
export const ATTR_HTTP_TARGET = 'http.target' as const;

/**
 * Deprecated, use `url.full` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `url.full`.
 */
export const ATTR_HTTP_URL = 'http.url' as const;

/**
 * Deprecated, use `user_agent.original` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `user_agent.original`.
 */
export const ATTR_HTTP_USERAGENT = 'http.user_agent' as const;

/**
 * &#34;Deprecated, use `messaging.destination.partition.id` instead.&#34;.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.destination.partition.id`.
 */
export const ATTR_MESSAGING_KAFKA_DESTINATION_PARTITION = 'messaging.kafka.destination.partition' as const;

/**
 * Deprecated, use `server.address`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `server.address`.
 */
export const ATTR_NET_HOST_NAME = 'net.host.name' as const;

/**
 * Deprecated, use `server.port`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `server.port`.
 */
export const ATTR_NET_HOST_PORT = 'net.host.port' as const;

/**
 * Deprecated, use `server.address` on client spans and `client.address` on server spans.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `server.address` on client spans and `client.address` on server spans.
 */
export const ATTR_NET_PEER_NAME = 'net.peer.name' as const;

/**
 * Deprecated, use `server.port` on client spans and `client.port` on server spans.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `server.port` on client spans and `client.port` on server spans.
 */
export const ATTR_NET_PEER_PORT = 'net.peer.port' as const;

/**
 * Deprecated, use `network.protocol.name`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ATTR_NET_PROTOCOL_NAME = 'net.protocol.name' as const;

/**
 * Deprecated, use `network.protocol.version`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.version`.
 */
export const ATTR_NET_PROTOCOL_VERSION = 'net.protocol.version' as const;

/**
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const ATTR_NET_SOCK_FAMILY = 'net.sock.family' as const;

/**
 * Deprecated, use `network.local.address`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.local.address`.
 */
export const ATTR_NET_SOCK_HOST_ADDR = 'net.sock.host.addr' as const;

/**
 * Deprecated, use `network.local.port`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.local.port`.
 */
export const ATTR_NET_SOCK_HOST_PORT = 'net.sock.host.port' as const;

/**
 * Deprecated, use `network.peer.address`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.peer.address`.
 */
export const ATTR_NET_SOCK_PEER_ADDR = 'net.sock.peer.addr' as const;

/**
 * Deprecated, no replacement at this time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Removed.
 */
export const ATTR_NET_SOCK_PEER_NAME = 'net.sock.peer.name' as const;

/**
 * Deprecated, use `network.peer.port`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.peer.port`.
 */
export const ATTR_NET_SOCK_PEER_PORT = 'net.sock.peer.port' as const;

/**
 * Deprecated, use `network.transport`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const ATTR_NET_TRANSPORT = 'net.transport' as const;

/**
 * Deprecated, use `system.process.status` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const ATTR_SYSTEM_PROCESSES_STATUS = 'system.processes.status' as const;

/**
 * Destination address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the source side, and when communicating through an intermediary, `destination.address` SHOULD represent the destination address behind any intermediaries, for example proxies, if it&#39;s available.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DESTINATION_ADDRESS = 'destination.address' as const;

/**
 * Destination port number.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DESTINATION_PORT = 'destination.port' as const;

/**
 * A unique identifier representing the device.
 *
 * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_ID = 'device.id' as const;

/**
 * The name of the device manufacturer.
 *
 * Note: The Android OS provides this field via [Build](https://developer.android.com/reference/android/os/Build#MANUFACTURER). iOS apps SHOULD hardcode the value `Apple`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MANUFACTURER = 'device.manufacturer' as const;

/**
 * The model identifier for the device.
 *
 * Note: It&#39;s recommended this value represents a machine-readable version of the model identifier rather than the market or consumer-friendly name of the device.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MODEL_IDENTIFIER = 'device.model.identifier' as const;

/**
 * The marketing name for the device model.
 *
 * Note: It&#39;s recommended this value represents a human-readable version of the device model rather than a machine-readable alternative.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MODEL_NAME = 'device.model.name' as const;

/**
 * The disk IO operation direction.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DISK_IO_DIRECTION = 'disk.io.direction' as const;

/**
 * The name being queried.
 *
 * Note: If the name field contains non-printable characters (below 32 or above 126), those characters should be represented as escaped base 10 integers (\DDD). Back slashes and quotes should be escaped. Tabs, carriage returns, and line feeds should be converted to \t, \r, and \n respectively.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DNS_QUESTION_NAME = 'dns.question.name' as const;

/**
 * Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ENDUSER_ID = 'enduser.id' as const;

/**
 * Actual/assumed role the client is making the request under extracted from token or application security context.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ENDUSER_ROLE = 'enduser.role' as const;

/**
 * Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ENDUSER_SCOPE = 'enduser.scope' as const;

/**
 * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_COLDSTART = 'faas.coldstart' as const;

/**
 * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_CRON = 'faas.cron' as const;

/**
 * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_COLLECTION = 'faas.document.collection' as const;

/**
 * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_NAME = 'faas.document.name' as const;

/**
 * Describes the type of the operation that was performed on the data.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_OPERATION = 'faas.document.operation' as const;

/**
 * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_TIME = 'faas.document.time' as const;

/**
 * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
 *
 * Note: * **AWS Lambda:** Use the (full) log stream name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INSTANCE = 'faas.instance' as const;

/**
 * The invocation ID of the current function invocation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOCATIONID = 'faas.invocation_id' as const;

/**
 * The name of the invoked function.
 *
 * Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKEDNAME = 'faas.invoked_name' as const;

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKEDPROVIDER = 'faas.invoked_provider' as const;

/**
 * The cloud region of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKEDREGION = 'faas.invoked_region' as const;

/**
 * The amount of memory available to the serverless function converted to Bytes.
 *
 * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information (which must be multiplied by 1,048,576).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_MAXMEMORY = 'faas.max_memory' as const;

/**
 * The name of the single function that this runtime instance executes.
 *
 * Note: This is the name of the function as configured/deployed on the FaaS
 * platform and is usually different from the name of the callback
 * function (which may be stored in the
 * [`code.namespace`/`code.function`](/docs/general/attributes.md#source-code-attributes)
 * span attributes).
 * 
 * For some cloud providers, the above definition is ambiguous. The following
 * definition of function name MUST be used for this attribute
 * (and consequently the span name) for the listed cloud providers/products:
 * 
 * * **Azure:**  The full name `&lt;FUNCAPP&gt;/&lt;FUNC&gt;`, i.e., function app name
 *   followed by a forward slash followed by the function name (this form
 *   can also be seen in the resource JSON for the function).
 *   This means that a span attribute MUST be used, as an Azure function
 *   app can host multiple functions that would usually share
 *   a TracerProvider (see also the `cloud.resource_id` attribute).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_NAME = 'faas.name' as const;

/**
 * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_TIME = 'faas.time' as const;

/**
 * Type of the trigger which caused this function invocation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_TRIGGER = 'faas.trigger' as const;

/**
 * The immutable version of the function being executed.
 *
 * Note: Depending on the cloud provider and platform, use:
 * 
 * * **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
 *   (an integer represented as a decimal string).
 * * **Google Cloud Run (Services):** The [revision](https://cloud.google.com/run/docs/managing/revisions)
 *   (i.e., the function name plus the revision suffix).
 * * **Google Cloud Functions:** The value of the
 *   [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
 * * **Azure Functions:** Not applicable. Do not set this attribute.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_VERSION = 'faas.version' as const;

/**
 * The unique identifier of the feature flag.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FEATUREFLAG_KEY = 'feature_flag.key' as const;

/**
 * The name of the service provider that performs the flag evaluation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FEATUREFLAG_PROVIDERNAME = 'feature_flag.provider_name' as const;

/**
 * SHOULD be a semantic identifier for a value. If one is unavailable, a stringified version of the value can be used.
 *
 * Note: A semantic identifier, commonly referred to as a variant, provides a means
 * for referring to a value without including the value itself. This can
 * provide additional context for understanding the meaning behind a value.
 * For example, the variant `red` maybe be used for the value `#c05543`.
 * 
 * A stringified version of the value can be used in situations where a
 * semantic identifier is unavailable. String representation of the value
 * should be determined by the implementer.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FEATUREFLAG_VARIANT = 'feature_flag.variant' as const;

/**
 * Directory where the file is located. It should include the drive letter, when appropriate.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_DIRECTORY = 'file.directory' as const;

/**
 * File extension, excluding the leading dot.
 *
 * Note: When the file name has multiple extensions (example.tar.gz), only the last one should be captured (&#34;gz&#34;, not &#34;tar.gz&#34;).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_EXTENSION = 'file.extension' as const;

/**
 * Name of the file including the extension, without the directory.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_NAME = 'file.name' as const;

/**
 * Full path to the file, including the file name. It should include the drive letter, when appropriate.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_PATH = 'file.path' as const;

/**
 * File size in bytes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_SIZE = 'file.size' as const;

/**
 * The name of the Cloud Run [execution](https://cloud.google.com/run/docs/managing/job-executions) being run for the Job, as set by the [`CLOUD_RUN_EXECUTION`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_CLOUDRUN_JOB_EXECUTION = 'gcp.cloud_run.job.execution' as const;

/**
 * The index for a task within an execution as provided by the [`CLOUD_RUN_TASK_INDEX`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_CLOUDRUN_JOB_TASKINDEX = 'gcp.cloud_run.job.task_index' as const;

/**
 * The hostname of a GCE instance. This is the full value of the default or [custom hostname](https://cloud.google.com/compute/docs/instances/custom-hostname-vm).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_GCE_INSTANCE_HOSTNAME = 'gcp.gce.instance.hostname' as const;

/**
 * The instance name of a GCE instance. This is the value provided by `host.name`, the visible name of the instance in the Cloud Console UI, and the prefix for the default hostname of the instance as defined by the [default internal DNS name](https://cloud.google.com/compute/docs/internal-dns#instance-fully-qualified-domain-names).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_GCE_INSTANCE_NAME = 'gcp.gce.instance.name' as const;

/**
 * The CPU architecture the host system is running on.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_ARCH = 'host.arch' as const;

/**
 * The amount of level 2 memory cache available to the processor (in Bytes).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_CACHE_L2_SIZE = 'host.cpu.cache.l2.size' as const;

/**
 * Family or generation of the CPU.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_FAMILY = 'host.cpu.family' as const;

/**
 * Model identifier. It provides more granular information about the CPU, distinguishing it from other CPUs within the same family.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_MODEL_ID = 'host.cpu.model.id' as const;

/**
 * Model designation of the processor.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_MODEL_NAME = 'host.cpu.model.name' as const;

/**
 * Stepping or core revisions.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_STEPPING = 'host.cpu.stepping' as const;

/**
 * Processor manufacturer identifier. A maximum 12-character string.
 *
 * Note: [CPUID](https://wiki.osdev.org/CPUID) command returns the vendor ID string in EBX, EDX and ECX registers. Writing these to memory in this order results in a 12-character string.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_VENDOR_ID = 'host.cpu.vendor.id' as const;

/**
 * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized systems, this should be the `machine-id`. See the table below for the sources to use to determine the `machine-id` based on operating system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_ID = 'host.id' as const;

/**
 * VM image ID or host OS image ID. For Cloud, this value is from the provider.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_ID = 'host.image.id' as const;

/**
 * Name of the VM image or OS install the host was instantiated from.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_NAME = 'host.image.name' as const;

/**
 * The version string of the VM image or host OS as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_VERSION = 'host.image.version' as const;

/**
 * Available IP addresses of the host, excluding loopback interfaces.
 *
 * Note: IPv4 Addresses MUST be specified in dotted-quad notation. IPv6 addresses MUST be specified in the [RFC 5952](https://www.rfc-editor.org/rfc/rfc5952.html) format.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IP = 'host.ip' as const;

/**
 * Available MAC addresses of the host, excluding loopback interfaces.
 *
 * Note: MAC Addresses MUST be represented in [IEEE RA hexadecimal form](https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf): as hyphen-separated octets in uppercase hexadecimal form from most to least significant.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_MAC = 'host.mac' as const;

/**
 * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_NAME = 'host.name' as const;

/**
 * Type of host. For Cloud, this must be the machine type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_TYPE = 'host.type' as const;

/**
 * State of the HTTP connection in the HTTP connection pool.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_CONNECTION_STATE = 'http.connection.state' as const;

/**
 * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_REQUEST_BODY_SIZE = 'http.request.body.size' as const;

/**
 * The total size of the request in bytes. This should be the total number of bytes sent over the wire, including the request line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and request body if any.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_REQUEST_SIZE = 'http.request.size' as const;

/**
 * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_RESPONSE_BODY_SIZE = 'http.response.body.size' as const;

/**
 * The total size of the response in bytes. This should be the total number of bytes sent over the wire, including the status line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and response body and trailers if any.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_RESPONSE_SIZE = 'http.response.size' as const;

/**
 * The name of the cluster.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CLUSTER_NAME = 'k8s.cluster.name' as const;

/**
 * A pseudo-ID for the cluster, set to the UID of the `kube-system` namespace.
 *
 * Note: K8s doesn&#39;t have support for obtaining a cluster ID. If this is ever
 * added, we will recommend collecting the `k8s.cluster.uid` through the
 * official APIs. In the meantime, we are able to use the `uid` of the
 * `kube-system` namespace as a proxy for cluster ID. Read on for the
 * rationale.
 * 
 * Every object created in a K8s cluster is assigned a distinct UID. The
 * `kube-system` namespace is used by Kubernetes itself and will exist
 * for the lifetime of the cluster. Using the `uid` of the `kube-system`
 * namespace is a reasonable proxy for the K8s ClusterID as it will only
 * change if the cluster is rebuilt. Furthermore, Kubernetes UIDs are
 * UUIDs as standardized by
 * [ISO/IEC 9834-8 and ITU-T X.667](https://www.itu.int/ITU-T/studygroups/com17/oid.html).
 * Which states:
 * 
 * &gt; If generated according to one of the mechanisms defined in Rec.
 *   ITU-T X.667 | ISO/IEC 9834-8, a UUID is either guaranteed to be
 *   different from all other UUIDs generated before 3603 A.D., or is
 *   extremely likely to be different (depending on the mechanism chosen).
 * 
 * Therefore, UIDs between clusters should be extremely unlikely to
 * conflict.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CLUSTER_UID = 'k8s.cluster.uid' as const;

/**
 * The name of the Container from Pod specification, must be unique within a Pod. Container runtime usually uses different globally unique name (`container.name`).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CONTAINER_NAME = 'k8s.container.name' as const;

/**
 * Number of times the container was restarted. This attribute can be used to identify a particular container (running or stopped) within a container spec.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CONTAINER_RESTARTCOUNT = 'k8s.container.restart_count' as const;

/**
 * The name of the CronJob.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CRONJOB_NAME = 'k8s.cronjob.name' as const;

/**
 * The UID of the CronJob.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CRONJOB_UID = 'k8s.cronjob.uid' as const;

/**
 * The name of the DaemonSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DAEMONSET_NAME = 'k8s.daemonset.name' as const;

/**
 * The UID of the DaemonSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DAEMONSET_UID = 'k8s.daemonset.uid' as const;

/**
 * The name of the Deployment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DEPLOYMENT_NAME = 'k8s.deployment.name' as const;

/**
 * The UID of the Deployment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DEPLOYMENT_UID = 'k8s.deployment.uid' as const;

/**
 * The name of the Job.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_JOB_NAME = 'k8s.job.name' as const;

/**
 * The UID of the Job.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_JOB_UID = 'k8s.job.uid' as const;

/**
 * The name of the namespace that the pod is running in.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NAMESPACE_NAME = 'k8s.namespace.name' as const;

/**
 * The name of the Node.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NODE_NAME = 'k8s.node.name' as const;

/**
 * The UID of the Node.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NODE_UID = 'k8s.node.uid' as const;

/**
 * The name of the Pod.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_POD_NAME = 'k8s.pod.name' as const;

/**
 * The UID of the Pod.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_POD_UID = 'k8s.pod.uid' as const;

/**
 * The name of the ReplicaSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_REPLICASET_NAME = 'k8s.replicaset.name' as const;

/**
 * The UID of the ReplicaSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_REPLICASET_UID = 'k8s.replicaset.uid' as const;

/**
 * The name of the StatefulSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_STATEFULSET_NAME = 'k8s.statefulset.name' as const;

/**
 * The UID of the StatefulSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_STATEFULSET_UID = 'k8s.statefulset.uid' as const;

/**
 * The number of messages sent, received, or processed in the scope of the batching operation.
 *
 * Note: Instrumentations SHOULD NOT set `messaging.batch.message_count` on spans that operate with a single message. When a messaging client library supports both batch and single-message API for the same operation, instrumentations SHOULD use `messaging.batch.message_count` for batching APIs and SHOULD NOT use it for single-message APIs.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_BATCH_MESSAGECOUNT = 'messaging.batch.message_count' as const;

/**
 * A unique identifier for the client that consumes or produces a message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_CLIENTID = 'messaging.client_id' as const;

/**
 * A boolean that is true if the message destination is anonymous (could be unnamed or have auto-generated name).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_ANONYMOUS = 'messaging.destination.anonymous' as const;

/**
 * The message destination name.
 *
 * Note: Destination name SHOULD uniquely identify a specific queue, topic or other entity within the broker. If
 * the broker doesn&#39;t have such notion, the destination name SHOULD uniquely identify the broker.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_NAME = 'messaging.destination.name' as const;

/**
 * The identifier of the partition messages are sent to or received from, unique within the `messaging.destination.name`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_PARTITION_ID = 'messaging.destination.partition.id' as const;

/**
 * Low cardinality representation of the messaging destination name.
 *
 * Note: Destination names could be constructed from templates. An example would be a destination name involving a user name or product id. Although the destination name in this case is of high cardinality, the underlying template is of low cardinality and can be effectively used for grouping and aggregation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_TEMPLATE = 'messaging.destination.template' as const;

/**
 * A boolean that is true if the message destination is temporary and might not exist anymore after messages are processed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_TEMPORARY = 'messaging.destination.temporary' as const;

/**
 * A boolean that is true if the publish message destination is anonymous (could be unnamed or have auto-generated name).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATIONPUBLISH_ANONYMOUS = 'messaging.destination_publish.anonymous' as const;

/**
 * The name of the original destination the message was published to.
 *
 * Note: The name SHOULD uniquely identify a specific queue, topic, or other entity within the broker. If
 * the broker doesn&#39;t have such notion, the original destination name SHOULD uniquely identify the broker.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATIONPUBLISH_NAME = 'messaging.destination_publish.name' as const;

/**
 * The name of the consumer group the event consumer is associated with.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_EVENTHUBS_CONSUMER_GROUP = 'messaging.eventhubs.consumer.group' as const;

/**
 * The UTC epoch seconds at which the message has been accepted and stored in the entity.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_EVENTHUBS_MESSAGE_ENQUEUEDTIME = 'messaging.eventhubs.message.enqueued_time' as const;

/**
 * The ordering key for a given message. If the attribute is not present, the message does not have an ordering key.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_GCPPUBSUB_MESSAGE_ORDERINGKEY = 'messaging.gcp_pubsub.message.ordering_key' as const;

/**
 * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_CONSUMER_GROUP = 'messaging.kafka.consumer.group' as const;

/**
 * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message.id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
 *
 * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_KEY = 'messaging.kafka.message.key' as const;

/**
 * The offset of a record in the corresponding Kafka partition.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_OFFSET = 'messaging.kafka.message.offset' as const;

/**
 * A boolean that is true if the message is a tombstone.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = 'messaging.kafka.message.tombstone' as const;

/**
 * The size of the message body in bytes.
 *
 * Note: This can refer to both the compressed or uncompressed body size. If both sizes are known, the uncompressed
 * body size should be used.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_BODY_SIZE = 'messaging.message.body.size' as const;

/**
 * The conversation ID identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_CONVERSATIONID = 'messaging.message.conversation_id' as const;

/**
 * The size of the message body and metadata in bytes.
 *
 * Note: This can refer to both the compressed or uncompressed size. If both sizes are known, the uncompressed
 * size should be used.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_ENVELOPE_SIZE = 'messaging.message.envelope.size' as const;

/**
 * A value used by the messaging system as an identifier for the message, represented as a string.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_ID = 'messaging.message.id' as const;

/**
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_OPERATION = 'messaging.operation' as const;

/**
 * RabbitMQ message routing key.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_RABBITMQ_DESTINATION_ROUTINGKEY = 'messaging.rabbitmq.destination.routing_key' as const;

/**
 * RabbitMQ message delivery tag.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_RABBITMQ_MESSAGE_DELIVERYTAG = 'messaging.rabbitmq.message.delivery_tag' as const;

/**
 * Name of the RocketMQ producer/consumer group that is handling the message. The client type is identified by the SpanKind.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_CLIENTGROUP = 'messaging.rocketmq.client_group' as const;

/**
 * Model of message consumption. This only applies to consumer spans.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_CONSUMPTIONMODEL = 'messaging.rocketmq.consumption_model' as const;

/**
 * The delay time level for delay message, which determines the message delay time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_DELAYTIMELEVEL = 'messaging.rocketmq.message.delay_time_level' as const;

/**
 * The timestamp in milliseconds that the delay message is expected to be delivered to consumer.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_DELIVERYTIMESTAMP = 'messaging.rocketmq.message.delivery_timestamp' as const;

/**
 * It is essential for FIFO message. Messages that belong to the same message group are always processed one by one within the same consumer group.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_GROUP = 'messaging.rocketmq.message.group' as const;

/**
 * Key(s) of message, another way to mark message besides message id.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_KEYS = 'messaging.rocketmq.message.keys' as const;

/**
 * The secondary classifier of message besides topic.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TAG = 'messaging.rocketmq.message.tag' as const;

/**
 * Type of message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE = 'messaging.rocketmq.message.type' as const;

/**
 * Namespace of RocketMQ resources, resources in different namespaces are individual.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_NAMESPACE = 'messaging.rocketmq.namespace' as const;

/**
 * The name of the subscription in the topic messages are received from.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_DESTINATION_SUBSCRIPTIONNAME = 'messaging.servicebus.destination.subscription_name' as const;

/**
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS = 'messaging.servicebus.disposition_status' as const;

/**
 * Number of deliveries that have been attempted for this message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_MESSAGE_DELIVERYCOUNT = 'messaging.servicebus.message.delivery_count' as const;

/**
 * The UTC epoch seconds at which the message has been accepted and stored in the entity.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_MESSAGE_ENQUEUEDTIME = 'messaging.servicebus.message.enqueued_time' as const;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SYSTEM = 'messaging.system' as const;

/**
 * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_ICC = 'network.carrier.icc' as const;

/**
 * The mobile carrier country code.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_MCC = 'network.carrier.mcc' as const;

/**
 * The mobile carrier network code.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_MNC = 'network.carrier.mnc' as const;

/**
 * The name of the mobile carrier.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_NAME = 'network.carrier.name' as const;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CONNECTION_SUBTYPE = 'network.connection.subtype' as const;

/**
 * The internet connection type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CONNECTION_TYPE = 'network.connection.type' as const;

/**
 * The network IO operation direction.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_IO_DIRECTION = 'network.io.direction' as const;

/**
 * The digest of the OCI image manifest. For container images specifically is the digest by which the container image is known.
 *
 * Note: Follows [OCI Image Manifest Specification](https://github.com/opencontainers/image-spec/blob/main/manifest.md), and specifically the [Digest property](https://github.com/opencontainers/image-spec/blob/main/descriptor.md#digests).
 * An example can be found in [Example Image Manifest](https://docs.docker.com/registry/spec/manifest-v2-2/#example-image-manifest).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OCI_MANIFEST_DIGEST = 'oci.manifest.digest' as const;

/**
 * Unique identifier for a particular build or compilation of the operating system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_BUILDID = 'os.build_id' as const;

/**
 * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_DESCRIPTION = 'os.description' as const;

/**
 * Human readable operating system name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_NAME = 'os.name' as const;

/**
 * The operating system type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_TYPE = 'os.type' as const;

/**
 * The version string of the operating system as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_VERSION = 'os.version' as const;

/**
 * The [`service.name`](/docs/resource/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PEER_SERVICE = 'peer.service' as const;

/**
 * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMAND = 'process.command' as const;

/**
 * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMANDARGS = 'process.command_args' as const;

/**
 * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMANDLINE = 'process.command_line' as const;

/**
 * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_EXECUTABLE_NAME = 'process.executable.name' as const;

/**
 * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_EXECUTABLE_PATH = 'process.executable.path' as const;

/**
 * The username of the user that owns the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_OWNER = 'process.owner' as const;

/**
 * Parent Process identifier (PPID).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PARENTPID = 'process.parent_pid' as const;

/**
 * Process identifier (PID).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PID = 'process.pid' as const;

/**
 * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_DESCRIPTION = 'process.runtime.description' as const;

/**
 * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_NAME = 'process.runtime.name' as const;

/**
 * The version of the runtime of this process, as returned by the runtime without modification.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_VERSION = 'process.runtime.version' as const;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_CONNECTRPC_ERRORCODE = 'rpc.connect_rpc.error_code' as const;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_GRPC_STATUSCODE = 'rpc.grpc.status_code' as const;

/**
 * `error.code` property of response if it is an error response.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_ERRORCODE = 'rpc.jsonrpc.error_code' as const;

/**
 * `error.message` property of response if it is an error response.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_ERRORMESSAGE = 'rpc.jsonrpc.error_message' as const;

/**
 * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_REQUESTID = 'rpc.jsonrpc.request_id' as const;

/**
 * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 doesn&#39;t specify this, the value can be omitted.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_VERSION = 'rpc.jsonrpc.version' as const;

/**
 * The name of the (logical) method being called, must be equal to the $method part in the span name.
 *
 * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_METHOD = 'rpc.method' as const;

/**
 * The full (logical) name of the service being called, including its package name, if applicable.
 *
 * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_SERVICE = 'rpc.service' as const;

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_SYSTEM = 'rpc.system' as const;

/**
 * The string ID of the service instance.
 *
 * Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words
 * `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to
 * distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled
 * service).
 * 
 * Implementations, such as SDKs, are recommended to generate a random Version 1 or Version 4 [RFC
 * 4122](https://www.ietf.org/rfc/rfc4122.txt) UUID, but are free to use an inherent unique ID as the source of
 * this value if stability is desirable. In that case, the ID SHOULD be used as source of a UUID Version 5 and
 * SHOULD use the following UUID as the namespace: `4d63009a-8d0f-11ee-aad7-4c796ed8e320`.
 * 
 * UUIDs are typically recommended, as only an opaque value for the purposes of identifying a service instance is
 * needed. Similar to what can be seen in the man page for the
 * [`/etc/machine-id`](https://www.freedesktop.org/software/systemd/man/machine-id.html) file, the underlying
 * data, such as pod name and namespace should be treated as confidential, being the user&#39;s choice to expose it
 * or not via another resource attribute.
 * 
 * For applications running behind an application server (like unicorn), we do not recommend using one identifier
 * for all processes participating in the application. Instead, it&#39;s recommended each division (e.g. a worker
 * thread in unicorn) to have its own instance.id.
 * 
 * It&#39;s not recommended for a Collector to set `service.instance.id` if it can&#39;t unambiguously determine the
 * service instance that is generating that telemetry. For instance, creating an UUID based on `pod.name` will
 * likely be wrong, as the Collector might not know from which container within that pod the telemetry originated.
 * However, Collectors can set the `service.instance.id` if they can unambiguously determine the service instance
 * for that telemetry. This is typically the case for scraping receivers, as they know the target address and
 * port.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SERVICE_INSTANCE_ID = 'service.instance.id' as const;

/**
 * A namespace for `service.name`.
 *
 * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SERVICE_NAMESPACE = 'service.namespace' as const;

/**
 * A unique id to identify a session.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SESSION_ID = 'session.id' as const;

/**
 * The previous `session.id` for this user, when known.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SESSION_PREVIOUSID = 'session.previous_id' as const;

/**
 * Source address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the destination side, and when communicating through an intermediary, `source.address` SHOULD represent the source address behind any intermediaries, for example proxies, if it&#39;s available.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SOURCE_ADDRESS = 'source.address' as const;

/**
 * Source port number.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SOURCE_PORT = 'source.port' as const;

/**
 * The name of the auto instrumentation agent or distribution, if used.
 *
 * Note: Official auto instrumentation agents and distributions SHOULD set the `telemetry.distro.name` attribute to
 * a string starting with `opentelemetry-`, e.g. `opentelemetry-java-instrumentation`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TELEMETRY_DISTRO_NAME = 'telemetry.distro.name' as const;

/**
 * The version string of the auto instrumentation agent or distribution, if used.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TELEMETRY_DISTRO_VERSION = 'telemetry.distro.version' as const;

/**
 * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_THREAD_ID = 'thread.id' as const;

/**
 * Current thread name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_THREAD_NAME = 'thread.name' as const;

/**
 * String indicating the [cipher](https://datatracker.ietf.org/doc/html/rfc5246#appendix-A.5) used during the current connection.
 *
 * Note: The values allowed for `tls.cipher` MUST be one of the `Descriptions` of the [registered TLS Cipher Suits](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#table-tls-parameters-4).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CIPHER = 'tls.cipher' as const;

/**
 * PEM-encoded stand-alone certificate offered by the client. This is usually mutually-exclusive of `client.certificate_chain` since this value also exists in that list.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_CERTIFICATE = 'tls.client.certificate' as const;

/**
 * Array of PEM-encoded certificates that make up the certificate chain offered by the client. This is usually mutually-exclusive of `client.certificate` since that value should be the first certificate in the chain.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_CERTIFICATECHAIN = 'tls.client.certificate_chain' as const;

/**
 * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_MD5 = 'tls.client.hash.md5' as const;

/**
 * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_SHA1 = 'tls.client.hash.sha1' as const;

/**
 * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_SHA256 = 'tls.client.hash.sha256' as const;

/**
 * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_ISSUER = 'tls.client.issuer' as const;

/**
 * A hash that identifies clients based on how they perform an SSL/TLS handshake.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_JA3 = 'tls.client.ja3' as const;

/**
 * Date/Time indicating when client certificate is no longer considered valid.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_NOTAFTER = 'tls.client.not_after' as const;

/**
 * Date/Time indicating when client certificate is first considered valid.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_NOTBEFORE = 'tls.client.not_before' as const;

/**
 * Also called an SNI, this tells the server which hostname to which the client is attempting to connect to.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_SERVERNAME = 'tls.client.server_name' as const;

/**
 * Distinguished name of subject of the x.509 certificate presented by the client.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_SUBJECT = 'tls.client.subject' as const;

/**
 * Array of ciphers offered by the client during the client hello.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_SUPPORTEDCIPHERS = 'tls.client.supported_ciphers' as const;

/**
 * String indicating the curve used for the given cipher, when applicable.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CURVE = 'tls.curve' as const;

/**
 * Boolean flag indicating if the TLS negotiation was successful and transitioned to an encrypted tunnel.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_ESTABLISHED = 'tls.established' as const;

/**
 * String indicating the protocol being tunneled. Per the values in the [IANA registry](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids), this string should be lower case.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_NEXTPROTOCOL = 'tls.next_protocol' as const;

/**
 * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_PROTOCOL_NAME = 'tls.protocol.name' as const;

/**
 * Numeric part of the version parsed from the original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_PROTOCOL_VERSION = 'tls.protocol.version' as const;

/**
 * Boolean flag indicating if this TLS connection was resumed from an existing TLS negotiation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_RESUMED = 'tls.resumed' as const;

/**
 * PEM-encoded stand-alone certificate offered by the server. This is usually mutually-exclusive of `server.certificate_chain` since this value also exists in that list.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_CERTIFICATE = 'tls.server.certificate' as const;

/**
 * Array of PEM-encoded certificates that make up the certificate chain offered by the server. This is usually mutually-exclusive of `server.certificate` since that value should be the first certificate in the chain.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_CERTIFICATECHAIN = 'tls.server.certificate_chain' as const;

/**
 * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_MD5 = 'tls.server.hash.md5' as const;

/**
 * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_SHA1 = 'tls.server.hash.sha1' as const;

/**
 * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_SHA256 = 'tls.server.hash.sha256' as const;

/**
 * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_ISSUER = 'tls.server.issuer' as const;

/**
 * A hash that identifies servers based on how they perform an SSL/TLS handshake.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_JA3S = 'tls.server.ja3s' as const;

/**
 * Date/Time indicating when server certificate is no longer considered valid.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_NOTAFTER = 'tls.server.not_after' as const;

/**
 * Date/Time indicating when server certificate is first considered valid.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_NOTBEFORE = 'tls.server.not_before' as const;

/**
 * Distinguished name of subject of the x.509 certificate presented by the server.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_SUBJECT = 'tls.server.subject' as const;

/**
 * Domain extracted from the `url.full`, such as &#34;opentelemetry.io&#34;.
 *
 * Note: In some cases a URL may refer to an IP and/or port directly, without a domain name. In this case, the IP address would go to the domain field. If the URL contains a [literal IPv6 address](https://www.rfc-editor.org/rfc/rfc2732#section-2) enclosed by `[` and `]`, the `[` and `]` characters should also be captured in the domain field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_DOMAIN = 'url.domain' as const;

/**
 * The file extension extracted from the `url.full`, excluding the leading dot.
 *
 * Note: The file extension is only set if it exists, as not every url has a file extension. When the file name has multiple extensions `example.tar.gz`, only the last one should be captured `gz`, not `tar.gz`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_EXTENSION = 'url.extension' as const;

/**
 * Unmodified original URL as seen in the event source.
 *
 * Note: In network monitoring, the observed URL may be a full URL, whereas in access logs, the URL is often just represented as a path. This field is meant to represent the URL as it was observed, complete or not.
 * `url.original` might contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case password and username SHOULD NOT be redacted and attribute&#39;s value SHOULD remain the same.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_ORIGINAL = 'url.original' as const;

/**
 * Port extracted from the `url.full`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_PORT = 'url.port' as const;

/**
 * The highest registered url domain, stripped of the subdomain.
 *
 * Note: This value can be determined precisely with the [public suffix list](http://publicsuffix.org). For example, the registered domain for `foo.example.com` is `example.com`. Trying to approximate this by simply taking the last two labels will not work well for TLDs such as `co.uk`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_REGISTEREDDOMAIN = 'url.registered_domain' as const;

/**
 * The subdomain portion of a fully qualified domain name includes all of the names except the host name under the registered_domain. In a partially qualified domain, or if the qualification level of the full name cannot be determined, subdomain contains all of the names below the registered domain.
 *
 * Note: The subdomain portion of `www.east.mydomain.co.uk` is `east`. If the domain has multiple levels of subdomain, such as `sub2.sub1.example.com`, the subdomain field should contain `sub2.sub1`, with no trailing period.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_SUBDOMAIN = 'url.subdomain' as const;

/**
 * The effective top level domain (eTLD), also known as the domain suffix, is the last part of the domain name. For example, the top level domain for example.com is `com`.
 *
 * Note: This value can be determined precisely with the [public suffix list](http://publicsuffix.org).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_TOPLEVELDOMAIN = 'url.top_level_domain' as const;

/**
 * Name of the user-agent extracted from original. Usually refers to the browser&#39;s name.
 *
 * Note: [Example](https://www.whatsmyua.info) of extracting browser&#39;s name from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant name SHOULD be selected. In such a scenario it should align with `user_agent.version`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USERAGENT_NAME = 'user_agent.name' as const;

/**
 * Version of the user-agent extracted from original. Usually refers to the browser&#39;s version.
 *
 * Note: [Example](https://www.whatsmyua.info) of extracting browser&#39;s version from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant version SHOULD be selected. In such a scenario it should align with `user_agent.name`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USERAGENT_VERSION = 'user_agent.version' as const;

/**
 * The ID of a running ECS task. The ID MUST be extracted from `task.arn`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_ID = 'aws.ecs.task.id' as const;

/**
 * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_CLUSTER_ARN = 'aws.ecs.cluster.arn' as const;

/**
 * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_CONTAINER_ARN = 'aws.ecs.container.arn' as const;

/**
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_LAUNCHTYPE = 'aws.ecs.launchtype' as const;

/**
 * The ARN of a running [ECS task](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-account-settings.html#ecs-resource-ids).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_ARN = 'aws.ecs.task.arn' as const;

/**
 * The family name of the [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html) used to create the ECS task.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_FAMILY = 'aws.ecs.task.family' as const;

/**
 * The revision for the task definition used to create the ECS task.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_REVISION = 'aws.ecs.task.revision' as const;

/**
 * The ARN of an EKS cluster.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_EKS_CLUSTER_ARN = 'aws.eks.cluster.arn' as const;

/**
 * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
 *
 * Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_GROUP_ARNS = 'aws.log.group.arns' as const;

/**
 * The name(s) of the AWS log group(s) an application is writing to.
 *
 * Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_GROUP_NAMES = 'aws.log.group.names' as const;

/**
 * The ARN(s) of the AWS log stream(s).
 *
 * Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_STREAM_ARNS = 'aws.log.stream.arns' as const;

/**
 * The name(s) of the AWS log stream(s) an application is writing to.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_STREAM_NAMES = 'aws.log.stream.names' as const;

/**
 * Unique identifier for the application.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_APP_ID = 'heroku.app.id' as const;

/**
 * Commit hash for the current release.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_RELEASE_COMMIT = 'heroku.release.commit' as const;

/**
 * Time and date the release was created.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_RELEASE_CREATIONTIMESTAMP = 'heroku.release.creation_timestamp' as const;

/**
 * The name of the web engine.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_NAME = 'webengine.name' as const;

/**
 * Additional description of the web engine (e.g. detailed version and edition information).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_DESCRIPTION = 'webengine.description' as const;

/**
 * The version of the web engine.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_VERSION = 'webengine.version' as const;

/**
 * None.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated use the `otel.scope.name` attribute.
 */
export const ATTR_OTEL_LIBRARY_NAME = 'otel.library.name' as const;

/**
 * None.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated use the `otel.scope.version` attribute.
 */
export const ATTR_OTEL_LIBRARY_VERSION = 'otel.library.version' as const;

/**
 * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
 *
 * Note: This may be different from `cloud.resource_id` if an alias is involved.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LAMBDA_INVOKEDARN = 'aws.lambda.invoked_arn' as const;

/**
 * Parent-child Reference type.
 *
 * Note: The causal relationship between a child Span and a parent Span.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OPENTRACING_REFTYPE = 'opentracing.ref_type' as const;

/**
 * The AWS request ID as returned in the response headers `x-amz-request-id` or `x-amz-requestid`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_REQUESTID = 'aws.request_id' as const;

/**
 * The S3 bucket name the request refers to. Corresponds to the `--bucket` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
 *
 * Note: The `bucket` attribute is applicable to all S3 operations that reference a bucket, i.e. that require the bucket name as a mandatory parameter.
 * This applies to almost all S3 operations except `list-buckets`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_BUCKET = 'aws.s3.bucket' as const;

/**
 * The source object (in the form `bucket`/`key`) for the copy operation.
 *
 * Note: The `copy_source` attribute applies to S3 copy operations and corresponds to the `--copy-source` parameter
 * of the [copy-object operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html).
 * This applies in particular to the following operations:
 * 
 * - [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
 * - [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_COPYSOURCE = 'aws.s3.copy_source' as const;

/**
 * The delete request container that specifies the objects to be deleted.
 *
 * Note: The `delete` attribute is only applicable to the [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html) operation.
 * The `delete` attribute corresponds to the `--delete` parameter of the
 * [delete-objects operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-objects.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_DELETE = 'aws.s3.delete' as const;

/**
 * The S3 object key the request refers to. Corresponds to the `--key` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
 *
 * Note: The `key` attribute is applicable to all object-related S3 operations, i.e. that require the object key as a mandatory parameter.
 * This applies in particular to the following operations:
 * 
 * - [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
 * - [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html)
 * - [get-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/get-object.html)
 * - [head-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/head-object.html)
 * - [put-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/put-object.html)
 * - [restore-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/restore-object.html)
 * - [select-object-content](https://docs.aws.amazon.com/cli/latest/reference/s3api/select-object-content.html)
 * - [abort-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/abort-multipart-upload.html)
 * - [complete-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/complete-multipart-upload.html)
 * - [create-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/create-multipart-upload.html)
 * - [list-parts](https://docs.aws.amazon.com/cli/latest/reference/s3api/list-parts.html)
 * - [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
 * - [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_KEY = 'aws.s3.key' as const;

/**
 * The part number of the part being uploaded in a multipart-upload operation. This is a positive integer between 1 and 10,000.
 *
 * Note: The `part_number` attribute is only applicable to the [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
 * and [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html) operations.
 * The `part_number` attribute corresponds to the `--part-number` parameter of the
 * [upload-part operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_PARTNUMBER = 'aws.s3.part_number' as const;

/**
 * Upload ID that identifies the multipart upload.
 *
 * Note: The `upload_id` attribute applies to S3 multipart-upload operations and corresponds to the `--upload-id` parameter
 * of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) multipart operations.
 * This applies in particular to the following operations:
 * 
 * - [abort-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/abort-multipart-upload.html)
 * - [complete-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/complete-multipart-upload.html)
 * - [list-parts](https://docs.aws.amazon.com/cli/latest/reference/s3api/list-parts.html)
 * - [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
 * - [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_UPLOADID = 'aws.s3.upload_id' as const;

/**
 * The GraphQL document being executed.
 *
 * Note: The value may be sanitized to exclude sensitive information.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_DOCUMENT = 'graphql.document' as const;

/**
 * The name of the operation being executed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_OPERATION_NAME = 'graphql.operation.name' as const;

/**
 * The type of the operation being executed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_OPERATION_TYPE = 'graphql.operation.type' as const;

/**
 * Compressed size of the message in bytes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGE_COMPRESSEDSIZE = 'message.compressed_size' as const;

/**
 * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
 *
 * Note: This way we guarantee that the values will be consistent between different implementations.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGE_ID = 'message.id' as const;

/**
 * Whether this is a received or sent message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGE_TYPE = 'message.type' as const;

/**
 * Uncompressed size of the message in bytes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGE_UNCOMPRESSEDSIZE = 'message.uncompressed_size' as const;

/**
 * Enum value 'stdout' for attribute {@link ATTR_LOG_IOSTREAM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_LOG_IOSTREAM_VALUE_STDOUT = 'stdout' as const;

/**
 * Enum value 'stderr' for attribute {@link ATTR_LOG_IOSTREAM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_LOG_IOSTREAM_VALUE_STDERR = 'stderr' as const;

/**
 * Enum value 'active' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_IOS_STATE_VALUE_ACTIVE = 'active' as const;

/**
 * Enum value 'inactive' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_IOS_STATE_VALUE_INACTIVE = 'inactive' as const;

/**
 * Enum value 'background' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_IOS_STATE_VALUE_BACKGROUND = 'background' as const;

/**
 * Enum value 'foreground' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_IOS_STATE_VALUE_FOREGROUND = 'foreground' as const;

/**
 * Enum value 'terminate' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_IOS_STATE_VALUE_TERMINATE = 'terminate' as const;

/**
 * Enum value 'created' for attribute {@link ATTR_ANDROID_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_ANDROID_STATE_VALUE_CREATED = 'created' as const;

/**
 * Enum value 'background' for attribute {@link ATTR_ANDROID_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_ANDROID_STATE_VALUE_BACKGROUND = 'background' as const;

/**
 * Enum value 'foreground' for attribute {@link ATTR_ANDROID_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_ANDROID_STATE_VALUE_FOREGROUND = 'foreground' as const;

/**
 * Enum value 'idle' for attribute {@link ATTR_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_STATE_VALUE_IDLE = 'idle' as const;

/**
 * Enum value 'used' for attribute {@link ATTR_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_STATE_VALUE_USED = 'used' as const;

/**
 * Enum value 'system' for attribute {@link ATTR_PROCESS_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_PROCESS_CPU_STATE_VALUE_SYSTEM = 'system' as const;

/**
 * Enum value 'user' for attribute {@link ATTR_PROCESS_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_PROCESS_CPU_STATE_VALUE_USER = 'user' as const;

/**
 * Enum value 'wait' for attribute {@link ATTR_PROCESS_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_PROCESS_CPU_STATE_VALUE_WAIT = 'wait' as const;

/**
 * Enum value 'voluntary' for attribute {@link ATTR_PROCESS_CONTEXTSWITCHTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_PROCESS_CONTEXTSWITCHTYPE_VALUE_VOLUNTARY = 'voluntary' as const;

/**
 * Enum value 'involuntary' for attribute {@link ATTR_PROCESS_CONTEXTSWITCHTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_PROCESS_CONTEXTSWITCHTYPE_VALUE_INVOLUNTARY = 'involuntary' as const;

/**
 * Enum value 'major' for attribute {@link ATTR_PROCESS_PAGING_FAULTTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_PROCESS_PAGING_FAULTTYPE_VALUE_MAJOR = 'major' as const;

/**
 * Enum value 'minor' for attribute {@link ATTR_PROCESS_PAGING_FAULTTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_PROCESS_PAGING_FAULTTYPE_VALUE_MINOR = 'minor' as const;

/**
 * Enum value 'user' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_CPU_STATE_VALUE_USER = 'user' as const;

/**
 * Enum value 'system' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_CPU_STATE_VALUE_SYSTEM = 'system' as const;

/**
 * Enum value 'nice' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_CPU_STATE_VALUE_NICE = 'nice' as const;

/**
 * Enum value 'idle' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_CPU_STATE_VALUE_IDLE = 'idle' as const;

/**
 * Enum value 'iowait' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_CPU_STATE_VALUE_IOWAIT = 'iowait' as const;

/**
 * Enum value 'interrupt' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_CPU_STATE_VALUE_INTERRUPT = 'interrupt' as const;

/**
 * Enum value 'steal' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_CPU_STATE_VALUE_STEAL = 'steal' as const;

/**
 * Enum value 'used' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_MEMORY_STATE_VALUE_USED = 'used' as const;

/**
 * Enum value 'free' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_MEMORY_STATE_VALUE_FREE = 'free' as const;

/**
 * Enum value 'shared' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_MEMORY_STATE_VALUE_SHARED = 'shared' as const;

/**
 * Enum value 'buffers' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_MEMORY_STATE_VALUE_BUFFERS = 'buffers' as const;

/**
 * Enum value 'cached' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_MEMORY_STATE_VALUE_CACHED = 'cached' as const;

/**
 * Enum value 'in' for attribute {@link ATTR_SYSTEM_PAGING_DIRECTION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PAGING_DIRECTION_VALUE_IN = 'in' as const;

/**
 * Enum value 'out' for attribute {@link ATTR_SYSTEM_PAGING_DIRECTION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PAGING_DIRECTION_VALUE_OUT = 'out' as const;

/**
 * Enum value 'used' for attribute {@link ATTR_SYSTEM_PAGING_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PAGING_STATE_VALUE_USED = 'used' as const;

/**
 * Enum value 'free' for attribute {@link ATTR_SYSTEM_PAGING_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PAGING_STATE_VALUE_FREE = 'free' as const;

/**
 * Enum value 'major' for attribute {@link ATTR_SYSTEM_PAGING_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PAGING_TYPE_VALUE_MAJOR = 'major' as const;

/**
 * Enum value 'minor' for attribute {@link ATTR_SYSTEM_PAGING_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PAGING_TYPE_VALUE_MINOR = 'minor' as const;

/**
 * Enum value 'used' for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_STATE_VALUE_USED = 'used' as const;

/**
 * Enum value 'free' for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_STATE_VALUE_FREE = 'free' as const;

/**
 * Enum value 'reserved' for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_STATE_VALUE_RESERVED = 'reserved' as const;

/**
 * Enum value 'fat32' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_TYPE_VALUE_FAT32 = 'fat32' as const;

/**
 * Enum value 'exfat' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_TYPE_VALUE_EXFAT = 'exfat' as const;

/**
 * Enum value 'ntfs' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_TYPE_VALUE_NTFS = 'ntfs' as const;

/**
 * Enum value 'refs' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_TYPE_VALUE_REFS = 'refs' as const;

/**
 * Enum value 'hfsplus' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_TYPE_VALUE_HFSPLUS = 'hfsplus' as const;

/**
 * Enum value 'ext4' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_FILESYSTEM_TYPE_VALUE_EXT4 = 'ext4' as const;

/**
 * Enum value 'close' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_CLOSE = 'close' as const;

/**
 * Enum value 'close_wait' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_CLOSEWAIT = 'close_wait' as const;

/**
 * Enum value 'closing' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_CLOSING = 'closing' as const;

/**
 * Enum value 'delete' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_DELETE = 'delete' as const;

/**
 * Enum value 'established' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_ESTABLISHED = 'established' as const;

/**
 * Enum value 'fin_wait_1' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_FINWAIT1 = 'fin_wait_1' as const;

/**
 * Enum value 'fin_wait_2' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_FINWAIT2 = 'fin_wait_2' as const;

/**
 * Enum value 'last_ack' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_LASTACK = 'last_ack' as const;

/**
 * Enum value 'listen' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_LISTEN = 'listen' as const;

/**
 * Enum value 'syn_recv' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_SYNRECV = 'syn_recv' as const;

/**
 * Enum value 'syn_sent' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_SYNSENT = 'syn_sent' as const;

/**
 * Enum value 'time_wait' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_NETWORK_STATE_VALUE_TIMEWAIT = 'time_wait' as const;

/**
 * Enum value 'running' for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PROCESS_STATUS_VALUE_RUNNING = 'running' as const;

/**
 * Enum value 'sleeping' for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PROCESS_STATUS_VALUE_SLEEPING = 'sleeping' as const;

/**
 * Enum value 'stopped' for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PROCESS_STATUS_VALUE_STOPPED = 'stopped' as const;

/**
 * Enum value 'defunct' for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_SYSTEM_PROCESS_STATUS_VALUE_DEFUNCT = 'defunct' as const;

/**
 * Enum value 'alibaba_cloud_ecs' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_ALIBABACLOUDECS = 'alibaba_cloud_ecs' as const;

/**
 * Enum value 'alibaba_cloud_fc' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_ALIBABACLOUDFC = 'alibaba_cloud_fc' as const;

/**
 * Enum value 'alibaba_cloud_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_ALIBABACLOUDOPENSHIFT = 'alibaba_cloud_openshift' as const;

/**
 * Enum value 'aws_ec2' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AWSEC2 = 'aws_ec2' as const;

/**
 * Enum value 'aws_ecs' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AWSECS = 'aws_ecs' as const;

/**
 * Enum value 'aws_eks' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AWSEKS = 'aws_eks' as const;

/**
 * Enum value 'aws_lambda' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AWSLAMBDA = 'aws_lambda' as const;

/**
 * Enum value 'aws_elastic_beanstalk' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AWSELASTICBEANSTALK = 'aws_elastic_beanstalk' as const;

/**
 * Enum value 'aws_app_runner' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AWSAPPRUNNER = 'aws_app_runner' as const;

/**
 * Enum value 'aws_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AWSOPENSHIFT = 'aws_openshift' as const;

/**
 * Enum value 'azure_vm' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AZUREVM = 'azure_vm' as const;

/**
 * Enum value 'azure_container_apps' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AZURECONTAINERAPPS = 'azure_container_apps' as const;

/**
 * Enum value 'azure_container_instances' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AZURECONTAINERINSTANCES = 'azure_container_instances' as const;

/**
 * Enum value 'azure_aks' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AZUREAKS = 'azure_aks' as const;

/**
 * Enum value 'azure_functions' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AZUREFUNCTIONS = 'azure_functions' as const;

/**
 * Enum value 'azure_app_service' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AZUREAPPSERVICE = 'azure_app_service' as const;

/**
 * Enum value 'azure_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_AZUREOPENSHIFT = 'azure_openshift' as const;

/**
 * Enum value 'gcp_bare_metal_solution' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_GCPBAREMETALSOLUTION = 'gcp_bare_metal_solution' as const;

/**
 * Enum value 'gcp_compute_engine' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_GCPCOMPUTEENGINE = 'gcp_compute_engine' as const;

/**
 * Enum value 'gcp_cloud_run' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_GCPCLOUDRUN = 'gcp_cloud_run' as const;

/**
 * Enum value 'gcp_kubernetes_engine' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_GCPKUBERNETESENGINE = 'gcp_kubernetes_engine' as const;

/**
 * Enum value 'gcp_cloud_functions' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_GCPCLOUDFUNCTIONS = 'gcp_cloud_functions' as const;

/**
 * Enum value 'gcp_app_engine' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_GCPAPPENGINE = 'gcp_app_engine' as const;

/**
 * Enum value 'gcp_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_GCPOPENSHIFT = 'gcp_openshift' as const;

/**
 * Enum value 'ibm_cloud_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_IBMCLOUDOPENSHIFT = 'ibm_cloud_openshift' as const;

/**
 * Enum value 'tencent_cloud_cvm' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_TENCENTCLOUDCVM = 'tencent_cloud_cvm' as const;

/**
 * Enum value 'tencent_cloud_eks' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_TENCENTCLOUDEKS = 'tencent_cloud_eks' as const;

/**
 * Enum value 'tencent_cloud_scf' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PLATFORM_VALUE_TENCENTCLOUDSCF = 'tencent_cloud_scf' as const;

/**
 * Enum value 'alibaba_cloud' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PROVIDER_VALUE_ALIBABACLOUD = 'alibaba_cloud' as const;

/**
 * Enum value 'aws' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PROVIDER_VALUE_AWS = 'aws' as const;

/**
 * Enum value 'azure' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PROVIDER_VALUE_AZURE = 'azure' as const;

/**
 * Enum value 'gcp' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PROVIDER_VALUE_GCP = 'gcp' as const;

/**
 * Enum value 'heroku' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PROVIDER_VALUE_HEROKU = 'heroku' as const;

/**
 * Enum value 'ibm_cloud' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PROVIDER_VALUE_IBMCLOUD = 'ibm_cloud' as const;

/**
 * Enum value 'tencent_cloud' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CLOUD_PROVIDER_VALUE_TENCENTCLOUD = 'tencent_cloud' as const;

/**
 * Enum value 'user' for attribute {@link ATTR_CONTAINER_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CONTAINER_CPU_STATE_VALUE_USER = 'user' as const;

/**
 * Enum value 'system' for attribute {@link ATTR_CONTAINER_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CONTAINER_CPU_STATE_VALUE_SYSTEM = 'system' as const;

/**
 * Enum value 'kernel' for attribute {@link ATTR_CONTAINER_CPU_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_CONTAINER_CPU_STATE_VALUE_KERNEL = 'kernel' as const;

/**
 * Enum value 'all' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_ALL = 'all' as const;

/**
 * Enum value 'each_quorum' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_EACHQUORUM = 'each_quorum' as const;

/**
 * Enum value 'quorum' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_QUORUM = 'quorum' as const;

/**
 * Enum value 'local_quorum' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_LOCALQUORUM = 'local_quorum' as const;

/**
 * Enum value 'one' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_ONE = 'one' as const;

/**
 * Enum value 'two' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_TWO = 'two' as const;

/**
 * Enum value 'three' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_THREE = 'three' as const;

/**
 * Enum value 'local_one' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_LOCALONE = 'local_one' as const;

/**
 * Enum value 'any' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_ANY = 'any' as const;

/**
 * Enum value 'serial' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_SERIAL = 'serial' as const;

/**
 * Enum value 'local_serial' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCYLEVEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_CASSANDRA_CONSISTENCYLEVEL_VALUE_LOCALSERIAL = 'local_serial' as const;

/**
 * Enum value 'gateway' for attribute {@link ATTR_DB_COSMOSDB_CONNECTIONMODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_CONNECTIONMODE_VALUE_GATEWAY = 'gateway' as const;

/**
 * Enum value 'direct' for attribute {@link ATTR_DB_COSMOSDB_CONNECTIONMODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_CONNECTIONMODE_VALUE_DIRECT = 'direct' as const;

/**
 * Enum value 'Invalid' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_INVALID = 'Invalid' as const;

/**
 * Enum value 'Create' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_CREATE = 'Create' as const;

/**
 * Enum value 'Patch' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_PATCH = 'Patch' as const;

/**
 * Enum value 'Read' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_READ = 'Read' as const;

/**
 * Enum value 'ReadFeed' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_READFEED = 'ReadFeed' as const;

/**
 * Enum value 'Delete' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_DELETE = 'Delete' as const;

/**
 * Enum value 'Replace' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_REPLACE = 'Replace' as const;

/**
 * Enum value 'Execute' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_EXECUTE = 'Execute' as const;

/**
 * Enum value 'Query' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_QUERY = 'Query' as const;

/**
 * Enum value 'Head' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_HEAD = 'Head' as const;

/**
 * Enum value 'HeadFeed' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_HEADFEED = 'HeadFeed' as const;

/**
 * Enum value 'Upsert' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_UPSERT = 'Upsert' as const;

/**
 * Enum value 'Batch' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_BATCH = 'Batch' as const;

/**
 * Enum value 'QueryPlan' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_QUERYPLAN = 'QueryPlan' as const;

/**
 * Enum value 'ExecuteJavaScript' for attribute {@link ATTR_DB_COSMOSDB_OPERATIONTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_COSMOSDB_OPERATIONTYPE_VALUE_EXECUTEJAVASCRIPT = 'ExecuteJavaScript' as const;

/**
 * Enum value 'other_sql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_OTHERSQL = 'other_sql' as const;

/**
 * Enum value 'mssql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_MSSQL = 'mssql' as const;

/**
 * Enum value 'mssqlcompact' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_MSSQLCOMPACT = 'mssqlcompact' as const;

/**
 * Enum value 'mysql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_MYSQL = 'mysql' as const;

/**
 * Enum value 'oracle' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_ORACLE = 'oracle' as const;

/**
 * Enum value 'db2' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_DB2 = 'db2' as const;

/**
 * Enum value 'postgresql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_POSTGRESQL = 'postgresql' as const;

/**
 * Enum value 'redshift' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_REDSHIFT = 'redshift' as const;

/**
 * Enum value 'hive' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_HIVE = 'hive' as const;

/**
 * Enum value 'cloudscape' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_CLOUDSCAPE = 'cloudscape' as const;

/**
 * Enum value 'hsqldb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_HSQLDB = 'hsqldb' as const;

/**
 * Enum value 'progress' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_PROGRESS = 'progress' as const;

/**
 * Enum value 'maxdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_MAXDB = 'maxdb' as const;

/**
 * Enum value 'hanadb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_HANADB = 'hanadb' as const;

/**
 * Enum value 'ingres' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_INGRES = 'ingres' as const;

/**
 * Enum value 'firstsql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_FIRSTSQL = 'firstsql' as const;

/**
 * Enum value 'edb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_EDB = 'edb' as const;

/**
 * Enum value 'cache' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_CACHE = 'cache' as const;

/**
 * Enum value 'adabas' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_ADABAS = 'adabas' as const;

/**
 * Enum value 'firebird' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_FIREBIRD = 'firebird' as const;

/**
 * Enum value 'derby' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_DERBY = 'derby' as const;

/**
 * Enum value 'filemaker' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_FILEMAKER = 'filemaker' as const;

/**
 * Enum value 'informix' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_INFORMIX = 'informix' as const;

/**
 * Enum value 'instantdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_INSTANTDB = 'instantdb' as const;

/**
 * Enum value 'interbase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_INTERBASE = 'interbase' as const;

/**
 * Enum value 'mariadb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_MARIADB = 'mariadb' as const;

/**
 * Enum value 'netezza' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_NETEZZA = 'netezza' as const;

/**
 * Enum value 'pervasive' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_PERVASIVE = 'pervasive' as const;

/**
 * Enum value 'pointbase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_POINTBASE = 'pointbase' as const;

/**
 * Enum value 'sqlite' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_SQLITE = 'sqlite' as const;

/**
 * Enum value 'sybase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_SYBASE = 'sybase' as const;

/**
 * Enum value 'teradata' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_TERADATA = 'teradata' as const;

/**
 * Enum value 'vertica' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_VERTICA = 'vertica' as const;

/**
 * Enum value 'h2' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_H2 = 'h2' as const;

/**
 * Enum value 'coldfusion' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_COLDFUSION = 'coldfusion' as const;

/**
 * Enum value 'cassandra' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_CASSANDRA = 'cassandra' as const;

/**
 * Enum value 'hbase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_HBASE = 'hbase' as const;

/**
 * Enum value 'mongodb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_MONGODB = 'mongodb' as const;

/**
 * Enum value 'redis' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_REDIS = 'redis' as const;

/**
 * Enum value 'couchbase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_COUCHBASE = 'couchbase' as const;

/**
 * Enum value 'couchdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_COUCHDB = 'couchdb' as const;

/**
 * Enum value 'cosmosdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_COSMOSDB = 'cosmosdb' as const;

/**
 * Enum value 'dynamodb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_DYNAMODB = 'dynamodb' as const;

/**
 * Enum value 'neo4j' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_NEO4J = 'neo4j' as const;

/**
 * Enum value 'geode' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_GEODE = 'geode' as const;

/**
 * Enum value 'elasticsearch' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_ELASTICSEARCH = 'elasticsearch' as const;

/**
 * Enum value 'memcached' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_MEMCACHED = 'memcached' as const;

/**
 * Enum value 'cockroachdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_COCKROACHDB = 'cockroachdb' as const;

/**
 * Enum value 'opensearch' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_OPENSEARCH = 'opensearch' as const;

/**
 * Enum value 'clickhouse' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_CLICKHOUSE = 'clickhouse' as const;

/**
 * Enum value 'spanner' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_SPANNER = 'spanner' as const;

/**
 * Enum value 'trino' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DB_SYSTEM_VALUE_TRINO = 'trino' as const;

/**
 * Enum value '1.0' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ENUM_HTTP_FLAVOR_VALUE_HTTP10 = '1.0' as const;

/**
 * Enum value '1.1' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ENUM_HTTP_FLAVOR_VALUE_HTTP11 = '1.1' as const;

/**
 * Enum value '2.0' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ENUM_HTTP_FLAVOR_VALUE_HTTP20 = '2.0' as const;

/**
 * Enum value '3.0' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ENUM_HTTP_FLAVOR_VALUE_HTTP30 = '3.0' as const;

/**
 * Enum value 'SPDY' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ENUM_HTTP_FLAVOR_VALUE_SPDY = 'SPDY' as const;

/**
 * Enum value 'QUIC' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ENUM_HTTP_FLAVOR_VALUE_QUIC = 'QUIC' as const;

/**
 * Enum value 'inet' for attribute {@link ATTR_NET_SOCK_FAMILY}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const ENUM_NET_SOCK_FAMILY_VALUE_INET = 'inet' as const;

/**
 * Enum value 'inet6' for attribute {@link ATTR_NET_SOCK_FAMILY}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const ENUM_NET_SOCK_FAMILY_VALUE_INET6 = 'inet6' as const;

/**
 * Enum value 'unix' for attribute {@link ATTR_NET_SOCK_FAMILY}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const ENUM_NET_SOCK_FAMILY_VALUE_UNIX = 'unix' as const;

/**
 * Enum value 'ip_tcp' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const ENUM_NET_TRANSPORT_VALUE_IPTCP = 'ip_tcp' as const;

/**
 * Enum value 'ip_udp' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const ENUM_NET_TRANSPORT_VALUE_IPUDP = 'ip_udp' as const;

/**
 * Enum value 'pipe' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const ENUM_NET_TRANSPORT_VALUE_PIPE = 'pipe' as const;

/**
 * Enum value 'inproc' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const ENUM_NET_TRANSPORT_VALUE_INPROC = 'inproc' as const;

/**
 * Enum value 'other' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const ENUM_NET_TRANSPORT_VALUE_OTHER = 'other' as const;

/**
 * Enum value 'running' for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const ENUM_SYSTEM_PROCESSES_STATUS_VALUE_RUNNING = 'running' as const;

/**
 * Enum value 'sleeping' for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const ENUM_SYSTEM_PROCESSES_STATUS_VALUE_SLEEPING = 'sleeping' as const;

/**
 * Enum value 'stopped' for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const ENUM_SYSTEM_PROCESSES_STATUS_VALUE_STOPPED = 'stopped' as const;

/**
 * Enum value 'defunct' for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const ENUM_SYSTEM_PROCESSES_STATUS_VALUE_DEFUNCT = 'defunct' as const;

/**
 * Enum value 'read' for attribute {@link ATTR_DISK_IO_DIRECTION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DISK_IO_DIRECTION_VALUE_READ = 'read' as const;

/**
 * Enum value 'write' for attribute {@link ATTR_DISK_IO_DIRECTION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_DISK_IO_DIRECTION_VALUE_WRITE = 'write' as const;

/**
 * Enum value 'insert' for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_DOCUMENT_OPERATION_VALUE_INSERT = 'insert' as const;

/**
 * Enum value 'edit' for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_DOCUMENT_OPERATION_VALUE_EDIT = 'edit' as const;

/**
 * Enum value 'delete' for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_DOCUMENT_OPERATION_VALUE_DELETE = 'delete' as const;

/**
 * Enum value 'alibaba_cloud' for attribute {@link ATTR_FAAS_INVOKEDPROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_INVOKEDPROVIDER_VALUE_ALIBABACLOUD = 'alibaba_cloud' as const;

/**
 * Enum value 'aws' for attribute {@link ATTR_FAAS_INVOKEDPROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_INVOKEDPROVIDER_VALUE_AWS = 'aws' as const;

/**
 * Enum value 'azure' for attribute {@link ATTR_FAAS_INVOKEDPROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_INVOKEDPROVIDER_VALUE_AZURE = 'azure' as const;

/**
 * Enum value 'gcp' for attribute {@link ATTR_FAAS_INVOKEDPROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_INVOKEDPROVIDER_VALUE_GCP = 'gcp' as const;

/**
 * Enum value 'tencent_cloud' for attribute {@link ATTR_FAAS_INVOKEDPROVIDER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_INVOKEDPROVIDER_VALUE_TENCENTCLOUD = 'tencent_cloud' as const;

/**
 * Enum value 'datasource' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_TRIGGER_VALUE_DATASOURCE = 'datasource' as const;

/**
 * Enum value 'http' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_TRIGGER_VALUE_HTTP = 'http' as const;

/**
 * Enum value 'pubsub' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_TRIGGER_VALUE_PUBSUB = 'pubsub' as const;

/**
 * Enum value 'timer' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_TRIGGER_VALUE_TIMER = 'timer' as const;

/**
 * Enum value 'other' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_FAAS_TRIGGER_VALUE_OTHER = 'other' as const;

/**
 * Enum value 'amd64' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HOST_ARCH_VALUE_AMD64 = 'amd64' as const;

/**
 * Enum value 'arm32' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HOST_ARCH_VALUE_ARM32 = 'arm32' as const;

/**
 * Enum value 'arm64' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HOST_ARCH_VALUE_ARM64 = 'arm64' as const;

/**
 * Enum value 'ia64' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HOST_ARCH_VALUE_IA64 = 'ia64' as const;

/**
 * Enum value 'ppc32' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HOST_ARCH_VALUE_PPC32 = 'ppc32' as const;

/**
 * Enum value 'ppc64' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HOST_ARCH_VALUE_PPC64 = 'ppc64' as const;

/**
 * Enum value 's390x' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HOST_ARCH_VALUE_S390X = 's390x' as const;

/**
 * Enum value 'x86' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HOST_ARCH_VALUE_X86 = 'x86' as const;

/**
 * Enum value 'active' for attribute {@link ATTR_HTTP_CONNECTION_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HTTP_CONNECTION_STATE_VALUE_ACTIVE = 'active' as const;

/**
 * Enum value 'idle' for attribute {@link ATTR_HTTP_CONNECTION_STATE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_HTTP_CONNECTION_STATE_VALUE_IDLE = 'idle' as const;

/**
 * Enum value 'publish' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_OPERATION_VALUE_PUBLISH = 'publish' as const;

/**
 * Enum value 'create' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_OPERATION_VALUE_CREATE = 'create' as const;

/**
 * Enum value 'receive' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_OPERATION_VALUE_RECEIVE = 'receive' as const;

/**
 * Enum value 'process' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_OPERATION_VALUE_DELIVER = 'process' as const;

/**
 * Enum value 'settle' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_OPERATION_VALUE_SETTLE = 'settle' as const;

/**
 * Enum value 'clustering' for attribute {@link ATTR_MESSAGING_ROCKETMQ_CONSUMPTIONMODEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_ROCKETMQ_CONSUMPTIONMODEL_VALUE_CLUSTERING = 'clustering' as const;

/**
 * Enum value 'broadcasting' for attribute {@link ATTR_MESSAGING_ROCKETMQ_CONSUMPTIONMODEL}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_ROCKETMQ_CONSUMPTIONMODEL_VALUE_BROADCASTING = 'broadcasting' as const;

/**
 * Enum value 'normal' for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_NORMAL = 'normal' as const;

/**
 * Enum value 'fifo' for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_FIFO = 'fifo' as const;

/**
 * Enum value 'delay' for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_DELAY = 'delay' as const;

/**
 * Enum value 'transaction' for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_TRANSACTION = 'transaction' as const;

/**
 * Enum value 'complete' for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS_VALUE_COMPLETE = 'complete' as const;

/**
 * Enum value 'abandon' for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS_VALUE_ABANDON = 'abandon' as const;

/**
 * Enum value 'dead_letter' for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS_VALUE_DEADLETTER = 'dead_letter' as const;

/**
 * Enum value 'defer' for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SERVICEBUS_DISPOSITIONSTATUS_VALUE_DEFER = 'defer' as const;

/**
 * Enum value 'activemq' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_ACTIVEMQ = 'activemq' as const;

/**
 * Enum value 'aws_sqs' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_AWSSQS = 'aws_sqs' as const;

/**
 * Enum value 'eventgrid' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_EVENTGRID = 'eventgrid' as const;

/**
 * Enum value 'eventhubs' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_EVENTHUBS = 'eventhubs' as const;

/**
 * Enum value 'servicebus' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_SERVICEBUS = 'servicebus' as const;

/**
 * Enum value 'gcp_pubsub' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_GCPPUBSUB = 'gcp_pubsub' as const;

/**
 * Enum value 'jms' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_JMS = 'jms' as const;

/**
 * Enum value 'kafka' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_KAFKA = 'kafka' as const;

/**
 * Enum value 'rabbitmq' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_RABBITMQ = 'rabbitmq' as const;

/**
 * Enum value 'rocketmq' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGING_SYSTEM_VALUE_ROCKETMQ = 'rocketmq' as const;

/**
 * Enum value 'gprs' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_GPRS = 'gprs' as const;

/**
 * Enum value 'edge' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_EDGE = 'edge' as const;

/**
 * Enum value 'umts' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_UMTS = 'umts' as const;

/**
 * Enum value 'cdma' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_CDMA = 'cdma' as const;

/**
 * Enum value 'evdo_0' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO0 = 'evdo_0' as const;

/**
 * Enum value 'evdo_a' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_EVDOA = 'evdo_a' as const;

/**
 * Enum value 'cdma2000_1xrtt' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_CDMA20001XRTT = 'cdma2000_1xrtt' as const;

/**
 * Enum value 'hsdpa' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_HSDPA = 'hsdpa' as const;

/**
 * Enum value 'hsupa' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_HSUPA = 'hsupa' as const;

/**
 * Enum value 'hspa' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_HSPA = 'hspa' as const;

/**
 * Enum value 'iden' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_IDEN = 'iden' as const;

/**
 * Enum value 'evdo_b' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_EVDOB = 'evdo_b' as const;

/**
 * Enum value 'lte' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_LTE = 'lte' as const;

/**
 * Enum value 'ehrpd' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_EHRPD = 'ehrpd' as const;

/**
 * Enum value 'hspap' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_HSPAP = 'hspap' as const;

/**
 * Enum value 'gsm' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_GSM = 'gsm' as const;

/**
 * Enum value 'td_scdma' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_TDSCDMA = 'td_scdma' as const;

/**
 * Enum value 'iwlan' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_IWLAN = 'iwlan' as const;

/**
 * Enum value 'nr' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_NR = 'nr' as const;

/**
 * Enum value 'nrnsa' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_NRNSA = 'nrnsa' as const;

/**
 * Enum value 'lte_ca' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_SUBTYPE_VALUE_LTECA = 'lte_ca' as const;

/**
 * Enum value 'wifi' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_TYPE_VALUE_WIFI = 'wifi' as const;

/**
 * Enum value 'wired' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_TYPE_VALUE_WIRED = 'wired' as const;

/**
 * Enum value 'cell' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_TYPE_VALUE_CELL = 'cell' as const;

/**
 * Enum value 'unavailable' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_TYPE_VALUE_UNAVAILABLE = 'unavailable' as const;

/**
 * Enum value 'unknown' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_CONNECTION_TYPE_VALUE_UNKNOWN = 'unknown' as const;

/**
 * Enum value 'transmit' for attribute {@link ATTR_NETWORK_IO_DIRECTION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_IO_DIRECTION_VALUE_TRANSMIT = 'transmit' as const;

/**
 * Enum value 'receive' for attribute {@link ATTR_NETWORK_IO_DIRECTION}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_NETWORK_IO_DIRECTION_VALUE_RECEIVE = 'receive' as const;

/**
 * Enum value 'windows' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_WINDOWS = 'windows' as const;

/**
 * Enum value 'linux' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_LINUX = 'linux' as const;

/**
 * Enum value 'darwin' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_DARWIN = 'darwin' as const;

/**
 * Enum value 'freebsd' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_FREEBSD = 'freebsd' as const;

/**
 * Enum value 'netbsd' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_NETBSD = 'netbsd' as const;

/**
 * Enum value 'openbsd' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_OPENBSD = 'openbsd' as const;

/**
 * Enum value 'dragonflybsd' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_DRAGONFLYBSD = 'dragonflybsd' as const;

/**
 * Enum value 'hpux' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_HPUX = 'hpux' as const;

/**
 * Enum value 'aix' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_AIX = 'aix' as const;

/**
 * Enum value 'solaris' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_SOLARIS = 'solaris' as const;

/**
 * Enum value 'z_os' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OS_TYPE_VALUE_ZOS = 'z_os' as const;

/**
 * Enum value 'cancelled' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_CANCELLED = 'cancelled' as const;

/**
 * Enum value 'unknown' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_UNKNOWN = 'unknown' as const;

/**
 * Enum value 'invalid_argument' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_INVALIDARGUMENT = 'invalid_argument' as const;

/**
 * Enum value 'deadline_exceeded' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_DEADLINEEXCEEDED = 'deadline_exceeded' as const;

/**
 * Enum value 'not_found' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_NOTFOUND = 'not_found' as const;

/**
 * Enum value 'already_exists' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_ALREADYEXISTS = 'already_exists' as const;

/**
 * Enum value 'permission_denied' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_PERMISSIONDENIED = 'permission_denied' as const;

/**
 * Enum value 'resource_exhausted' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_RESOURCEEXHAUSTED = 'resource_exhausted' as const;

/**
 * Enum value 'failed_precondition' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_FAILEDPRECONDITION = 'failed_precondition' as const;

/**
 * Enum value 'aborted' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_ABORTED = 'aborted' as const;

/**
 * Enum value 'out_of_range' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_OUTOFRANGE = 'out_of_range' as const;

/**
 * Enum value 'unimplemented' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_UNIMPLEMENTED = 'unimplemented' as const;

/**
 * Enum value 'internal' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_INTERNAL = 'internal' as const;

/**
 * Enum value 'unavailable' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_UNAVAILABLE = 'unavailable' as const;

/**
 * Enum value 'data_loss' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_DATALOSS = 'data_loss' as const;

/**
 * Enum value 'unauthenticated' for attribute {@link ATTR_RPC_CONNECTRPC_ERRORCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_CONNECTRPC_ERRORCODE_VALUE_UNAUTHENTICATED = 'unauthenticated' as const;

/**
 * Enum value 0 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_OK = 0 as const;

/**
 * Enum value 1 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_CANCELLED = 1 as const;

/**
 * Enum value 2 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_UNKNOWN = 2 as const;

/**
 * Enum value 3 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_INVALIDARGUMENT = 3 as const;

/**
 * Enum value 4 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_DEADLINEEXCEEDED = 4 as const;

/**
 * Enum value 5 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_NOTFOUND = 5 as const;

/**
 * Enum value 6 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_ALREADYEXISTS = 6 as const;

/**
 * Enum value 7 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_PERMISSIONDENIED = 7 as const;

/**
 * Enum value 8 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_RESOURCEEXHAUSTED = 8 as const;

/**
 * Enum value 9 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_FAILEDPRECONDITION = 9 as const;

/**
 * Enum value 10 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_ABORTED = 10 as const;

/**
 * Enum value 11 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_OUTOFRANGE = 11 as const;

/**
 * Enum value 12 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_UNIMPLEMENTED = 12 as const;

/**
 * Enum value 13 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_INTERNAL = 13 as const;

/**
 * Enum value 14 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_UNAVAILABLE = 14 as const;

/**
 * Enum value 15 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_DATALOSS = 15 as const;

/**
 * Enum value 16 for attribute {@link ATTR_RPC_GRPC_STATUSCODE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_GRPC_STATUSCODE_VALUE_UNAUTHENTICATED = 16 as const;

/**
 * Enum value 'grpc' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_SYSTEM_VALUE_GRPC = 'grpc' as const;

/**
 * Enum value 'java_rmi' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_SYSTEM_VALUE_JAVARMI = 'java_rmi' as const;

/**
 * Enum value 'dotnet_wcf' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_SYSTEM_VALUE_DOTNETWCF = 'dotnet_wcf' as const;

/**
 * Enum value 'apache_dubbo' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_SYSTEM_VALUE_APACHEDUBBO = 'apache_dubbo' as const;

/**
 * Enum value 'connect_rpc' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_RPC_SYSTEM_VALUE_CONNECTRPC = 'connect_rpc' as const;

/**
 * Enum value 'ssl' for attribute {@link ATTR_TLS_PROTOCOL_NAME}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_TLS_PROTOCOL_NAME_VALUE_SSL = 'ssl' as const;

/**
 * Enum value 'tls' for attribute {@link ATTR_TLS_PROTOCOL_NAME}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_TLS_PROTOCOL_NAME_VALUE_TLS = 'tls' as const;

/**
 * Enum value 'ec2' for attribute {@link ATTR_AWS_ECS_LAUNCHTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_AWS_ECS_LAUNCHTYPE_VALUE_EC2 = 'ec2' as const;

/**
 * Enum value 'fargate' for attribute {@link ATTR_AWS_ECS_LAUNCHTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_AWS_ECS_LAUNCHTYPE_VALUE_FARGATE = 'fargate' as const;

/**
 * Enum value 'child_of' for attribute {@link ATTR_OPENTRACING_REFTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OPENTRACING_REFTYPE_VALUE_CHILDOF = 'child_of' as const;

/**
 * Enum value 'follows_from' for attribute {@link ATTR_OPENTRACING_REFTYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_OPENTRACING_REFTYPE_VALUE_FOLLOWSFROM = 'follows_from' as const;

/**
 * Enum value 'query' for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_GRAPHQL_OPERATION_TYPE_VALUE_QUERY = 'query' as const;

/**
 * Enum value 'mutation' for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_GRAPHQL_OPERATION_TYPE_VALUE_MUTATION = 'mutation' as const;

/**
 * Enum value 'subscription' for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_GRAPHQL_OPERATION_TYPE_VALUE_SUBSCRIPTION = 'subscription' as const;

/**
 * Enum value 'SENT' for attribute {@link ATTR_MESSAGE_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGE_TYPE_VALUE_SENT = 'SENT' as const;

/**
 * Enum value 'RECEIVED' for attribute {@link ATTR_MESSAGE_TYPE}.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ENUM_MESSAGE_TYPE_VALUE_RECEIVED = 'RECEIVED' as const;
