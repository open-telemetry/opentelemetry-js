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

//----------------------------------------------------------------------------------------------------------
// Constant values for SemanticAttributes
//----------------------------------------------------------------------------------------------------------
/**
 * Total CPU time consumed.
 *
 * Note: Total CPU time consumed by the specific container on all available CPU cores.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_CPU_TIME = 'container.cpu.time';
/**
 * Disk bytes for the container.
 *
 * Note: The total number of bytes read/written successfully (aggregated from all disks).
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_DISK_IO = 'container.disk.io';
/**
 * Memory usage of the container.
 *
 * Note: Memory usage of the container.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_MEMORY_USAGE = 'container.memory.usage';
/**
 * Network bytes for the container.
 *
 * Note: The number of bytes sent/received on all network interfaces by the container.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_NETWORK_IO = 'container.network.io';
/**
 * The time it took to create a new connection.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_CREATE_TIME =
  'db.client.connections.create_time';
/**
 * The maximum number of idle open connections allowed.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_IDLE_MAX =
  'db.client.connections.idle.max';
/**
 * The minimum number of idle open connections allowed.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_IDLE_MIN =
  'db.client.connections.idle.min';
/**
 * The maximum number of open connections allowed.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_MAX = 'db.client.connections.max';
/**
 * The number of pending requests for an open connection, cumulative for the entire pool.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_PENDING_REQUESTS =
  'db.client.connections.pending_requests';
/**
 * The number of connection timeouts that have occurred trying to obtain a connection from the pool.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_TIMEOUTS =
  'db.client.connections.timeouts';
/**
 * The number of connections that are currently in state described by the `state` attribute.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_USAGE = 'db.client.connections.usage';
/**
 * The time between borrowing a connection and returning it to the pool.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_USE_TIME =
  'db.client.connections.use_time';
/**
 * The time it took to obtain an open connection from the pool.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_WAIT_TIME =
  'db.client.connections.wait_time';
/**
 * Measures the time taken to perform a DNS lookup.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DNS_LOOKUP_DURATION = 'dns.lookup.duration';
/**
 * Number of invocation cold starts.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_COLDSTARTS = 'faas.coldstarts';
/**
 * Distribution of CPU usage per invocation.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_CPU_USAGE = 'faas.cpu_usage';
/**
 * Number of invocation errors.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_ERRORS = 'faas.errors';
/**
 * Measures the duration of the function&#39;s initialization, such as a cold start.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INIT_DURATION = 'faas.init_duration';
/**
 * Number of successful invocations.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INVOCATIONS = 'faas.invocations';
/**
 * Measures the duration of the function&#39;s logic execution.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INVOKE_DURATION = 'faas.invoke_duration';
/**
 * Distribution of max memory usage per invocation.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_MEM_USAGE = 'faas.mem_usage';
/**
 * Distribution of net I/O usage per invocation.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_NET_IO = 'faas.net_io';
/**
 * Number of invocation timeouts.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_TIMEOUTS = 'faas.timeouts';
/**
 * Number of active HTTP requests.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_ACTIVE_REQUESTS = 'http.client.active_requests';
/**
 * The duration of the successfully established outbound HTTP connections.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_CONNECTION_DURATION =
  'http.client.connection.duration';
/**
 * Number of outbound HTTP connections that are currently active or idle on the client.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_OPEN_CONNECTIONS =
  'http.client.open_connections';
/**
 * Size of HTTP client request bodies.
 *
 * Note: The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_REQUEST_BODY_SIZE =
  'http.client.request.body.size';
/**
 * Size of HTTP client response bodies.
 *
 * Note: The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_RESPONSE_BODY_SIZE =
  'http.client.response.body.size';
/**
 * Number of active HTTP server requests.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_ACTIVE_REQUESTS = 'http.server.active_requests';
/**
 * Size of HTTP server request bodies.
 *
 * Note: The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_REQUEST_BODY_SIZE =
  'http.server.request.body.size';
/**
 * Size of HTTP server response bodies.
 *
 * Note: The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_RESPONSE_BODY_SIZE =
  'http.server.response.body.size';
/**
 * Number of buffers in the pool.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_COUNT = 'jvm.buffer.count';
/**
 * Measure of total memory capacity of buffers.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_MEMORY_LIMIT = 'jvm.buffer.memory.limit';
/**
 * Measure of memory used by buffers.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_MEMORY_USAGE = 'jvm.buffer.memory.usage';
/**
 * Measure of initial memory requested.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_MEMORY_INIT = 'jvm.memory.init';
/**
 * Average CPU load of the whole system for the last minute as reported by the JVM.
 *
 * Note: The value range is [0,n], where n is the number of CPU cores - or a negative number if the value is not available. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/java.management/java/lang/management/OperatingSystemMXBean.html#getSystemLoadAverage()).
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_SYSTEM_CPU_LOAD_1M = 'jvm.system.cpu.load_1m';
/**
 * Recent CPU utilization for the whole system as reported by the JVM.
 *
 * Note: The value range is [0.0,1.0]. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getCpuLoad()).
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_SYSTEM_CPU_UTILIZATION = 'jvm.system.cpu.utilization';
/**
 * Measures the duration of process operation.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PROCESS_DURATION = 'messaging.process.duration';
/**
 * Measures the number of processed messages.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PROCESS_MESSAGES = 'messaging.process.messages';
/**
 * Measures the duration of publish operation.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PUBLISH_DURATION = 'messaging.publish.duration';
/**
 * Measures the number of published messages.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PUBLISH_MESSAGES = 'messaging.publish.messages';
/**
 * Measures the duration of receive operation.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_RECEIVE_DURATION = 'messaging.receive.duration';
/**
 * Measures the number of received messages.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_RECEIVE_MESSAGES = 'messaging.receive.messages';
/**
 * Number of times the process has been context switched.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CONTEXT_SWITCHES = 'process.context_switches';
/**
 * Total CPU seconds broken down by different states.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CPU_TIME = 'process.cpu.time';
/**
 * Difference in process.cpu.time since the last measurement, divided by the elapsed time and number of CPUs available to the process.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CPU_UTILIZATION = 'process.cpu.utilization';
/**
 * Disk bytes transferred.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_DISK_IO = 'process.disk.io';
/**
 * The amount of physical memory in use.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_MEMORY_USAGE = 'process.memory.usage';
/**
 * The amount of committed virtual memory.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_MEMORY_VIRTUAL = 'process.memory.virtual';
/**
 * Network bytes transferred.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_NETWORK_IO = 'process.network.io';
/**
 * Number of file descriptors in use by the process.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_OPEN_FILE_DESCRIPTOR_COUNT =
  'process.open_file_descriptor.count';
/**
 * Number of page faults the process has made.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_PAGING_FAULTS = 'process.paging.faults';
/**
 * Process threads count.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_THREAD_COUNT = 'process.thread.count';
/**
* Measures the duration of outbound RPC.
*
* Note: While streaming RPCs may record this metric as start-of-batch
to end-of-batch, it&#39;s hard to interpret in practice.

**Streaming**: N/A.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_RPC_CLIENT_DURATION = 'rpc.client.duration';
/**
 * Measures the size of RPC request messages (uncompressed).
 *
 * Note: **Streaming**: Recorded per message in a streaming batch.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_REQUEST_SIZE = 'rpc.client.request.size';
/**
* Measures the number of messages received per RPC.
*
* Note: Should be 1 for all non-streaming RPCs.

**Streaming**: This metric is required for server and client streaming RPCs.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_RPC_CLIENT_REQUESTS_PER_RPC = 'rpc.client.requests_per_rpc';
/**
 * Measures the size of RPC response messages (uncompressed).
 *
 * Note: **Streaming**: Recorded per response in a streaming batch.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_RESPONSE_SIZE = 'rpc.client.response.size';
/**
* Measures the number of messages sent per RPC.
*
* Note: Should be 1 for all non-streaming RPCs.

**Streaming**: This metric is required for server and client streaming RPCs.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_RPC_CLIENT_RESPONSES_PER_RPC =
  'rpc.client.responses_per_rpc';
/**
* Measures the duration of inbound RPC.
*
* Note: While streaming RPCs may record this metric as start-of-batch
to end-of-batch, it&#39;s hard to interpret in practice.

**Streaming**: N/A.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_RPC_SERVER_DURATION = 'rpc.server.duration';
/**
 * Measures the size of RPC request messages (uncompressed).
 *
 * Note: **Streaming**: Recorded per message in a streaming batch.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_REQUEST_SIZE = 'rpc.server.request.size';
/**
* Measures the number of messages received per RPC.
*
* Note: Should be 1 for all non-streaming RPCs.

**Streaming** : This metric is required for server and client streaming RPCs.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_RPC_SERVER_REQUESTS_PER_RPC = 'rpc.server.requests_per_rpc';
/**
 * Measures the size of RPC response messages (uncompressed).
 *
 * Note: **Streaming**: Recorded per response in a streaming batch.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_RESPONSE_SIZE = 'rpc.server.response.size';
/**
* Measures the number of messages sent per RPC.
*
* Note: Should be 1 for all non-streaming RPCs.

**Streaming**: This metric is required for server and client streaming RPCs.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_RPC_SERVER_RESPONSES_PER_RPC =
  'rpc.server.responses_per_rpc';
/**
 * Reports the current frequency of the CPU in Hz.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_FREQUENCY = 'system.cpu.frequency';
/**
 * Reports the number of logical (virtual) processor cores created by the operating system to manage multitasking.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_LOGICAL_COUNT = 'system.cpu.logical.count';
/**
 * Reports the number of actual physical processor cores on the hardware.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_PHYSICAL_COUNT = 'system.cpu.physical.count';
/**
 * Seconds each logical CPU spent on each mode.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_TIME = 'system.cpu.time';
/**
 * Difference in system.cpu.time since the last measurement, divided by the elapsed time and number of logical CPUs.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_UTILIZATION = 'system.cpu.utilization';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_IO = 'system.disk.io';
/**
* Time disk spent activated.
*
* Note: The real elapsed time (&#34;wall clock&#34;) used in the I/O path (time from operations running in parallel are not counted). Measured as:

- Linux: Field 13 from [procfs-diskstats](https://www.kernel.org/doc/Documentation/ABI/testing/procfs-diskstats)
- Windows: The complement of
  [&#34;Disk\% Idle Time&#34;](https://learn.microsoft.com/archive/blogs/askcore/windows-performance-monitor-disk-counters-explained#windows-performance-monitor-disk-counters-explained)
  performance counter: `uptime * (100 - &#34;Disk\% Idle Time&#34;) / 100`.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_SYSTEM_DISK_IO_TIME = 'system.disk.io_time';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_MERGED = 'system.disk.merged';
/**
* Sum of the time each operation took to complete.
*
* Note: Because it is the sum of time each request took, parallel-issued requests each contribute to make the count grow. Measured as:

- Linux: Fields 7 &amp; 11 from [procfs-diskstats](https://www.kernel.org/doc/Documentation/ABI/testing/procfs-diskstats)
- Windows: &#34;Avg. Disk sec/Read&#34; perf counter multiplied by &#34;Disk Reads/sec&#34; perf counter (similar for Writes).
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_SYSTEM_DISK_OPERATION_TIME = 'system.disk.operation_time';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_OPERATIONS = 'system.disk.operations';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_FILESYSTEM_USAGE = 'system.filesystem.usage';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_FILESYSTEM_UTILIZATION =
  'system.filesystem.utilization';
/**
* An estimate of how much memory is available for starting new applications, without causing swapping.
*
* Note: This is an alternative to `system.memory.usage` metric with `state=free`.
Linux starting from 3.14 exports &#34;available&#34; memory. It takes &#34;free&#34; memory as a baseline, and then factors in kernel-specific values.
This is supposed to be more accurate than just &#34;free&#34; memory.
For reference, see the calculations [here](https://superuser.com/a/980821).
See also `MemAvailable` in [/proc/meminfo](https://man7.org/linux/man-pages/man5/proc.5.html).
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_SYSTEM_LINUX_MEMORY_AVAILABLE =
  'system.linux.memory.available';
/**
 * Total memory available in the system.
 *
 * Note: Its value SHOULD equal the sum of `system.memory.state` over all states.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_LIMIT = 'system.memory.limit';
/**
* Reports memory in use by state.
*
* Note: The sum over all `system.memory.state` values SHOULD equal the total memory
available on the system, that is `system.memory.limit`.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_SYSTEM_MEMORY_USAGE = 'system.memory.usage';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_UTILIZATION = 'system.memory.utilization';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_CONNECTIONS = 'system.network.connections';
/**
* Count of packets that are dropped or discarded even though there was no error.
*
* Note: Measured as:

- Linux: the `drop` column in `/proc/dev/net` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html))
- Windows: [`InDiscards`/`OutDiscards`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
  from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2).
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_SYSTEM_NETWORK_DROPPED = 'system.network.dropped';
/**
* Count of network errors detected.
*
* Note: Measured as:

- Linux: the `errs` column in `/proc/dev/net` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html)).
- Windows: [`InErrors`/`OutErrors`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
  from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2).
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const METRIC_SYSTEM_NETWORK_ERRORS = 'system.network.errors';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_IO = 'system.network.io';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_PACKETS = 'system.network.packets';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_FAULTS = 'system.paging.faults';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_OPERATIONS = 'system.paging.operations';
/**
 * Unix swap or windows pagefile usage.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_USAGE = 'system.paging.usage';
/**
 * .
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_UTILIZATION = 'system.paging.utilization';
/**
 * Total number of processes in each state.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PROCESS_COUNT = 'system.process.count';
/**
 * Total number of processes created over uptime of the host.
 *
 * @experimental this metric is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PROCESS_CREATED = 'system.process.created';

/**
 * Identifies the class / type of event.
 *
 * Note: Event names are subject to the same rules as [attribute names](https://github.com/open-telemetry/opentelemetry-specification/tree/v1.31.0/specification/common/attribute-naming.md). Notably, event names are namespaced to avoid collisions and provide a clean separation of semantics for events in separate domains like browser, mobile, and kubernetes.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_EVENT_NAME = 'event.name';

/**
* A unique identifier for the Log Record.
*
* Note: If an id is provided, other log records with the same id will be considered duplicates and can be removed safely. This means, that two distinguishable log records MUST have different values.
The id MAY be an [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec), but other identifiers (e.g. UUID) may be used as needed.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_LOG_RECORD_UID = 'log.record.uid';

/**
 * The stream associated with the log. See below for a list of well-known values.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_IOSTREAM = 'log.iostream';

/**
 * The basename of the file.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_NAME = 'log.file.name';

/**
 * The basename of the file, with symlinks resolved.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_NAME_RESOLVED = 'log.file.name_resolved';

/**
 * The full path to the file.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_PATH = 'log.file.path';

/**
 * The full path to the file, with symlinks resolved.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_PATH_RESOLVED = 'log.file.path_resolved';

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_IOS_STATE = 'ios.state';

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ANDROID_STATE = 'android.state';

/**
 * The name of the connection pool; unique within the instrumented application. In case the connection pool implementation doesn&#39;t provide a name, instrumentation should use a combination of `server.address` and `server.port` attributes formatted as `server.address:server.port`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_POOL_NAME = 'pool.name';

/**
 * The state of a connection in the pool.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_STATE = 'state';

/**
 * Name of the buffer pool.
 *
 * Note: Pool names are generally obtained via [BufferPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/BufferPoolMXBean.html#getName()).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_JVM_BUFFER_POOL_NAME = 'jvm.buffer.pool.name';

/**
 * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_CPU_STATE = 'process.cpu.state';

/**
 * Specifies whether the context switches for this data point were voluntary or involuntary.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_CONTEXT_SWITCH_TYPE = 'process.context_switch_type';

/**
 * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PAGING_FAULT_TYPE = 'process.paging.fault_type';

/**
 * The device identifier.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_DEVICE = 'system.device';

/**
 * The logical CPU number [0..n-1].
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_CPU_LOGICAL_NUMBER = 'system.cpu.logical_number';

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_CPU_STATE = 'system.cpu.state';

/**
 * The memory state.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_MEMORY_STATE = 'system.memory.state';

/**
 * The paging access direction.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_DIRECTION = 'system.paging.direction';

/**
 * The memory paging state.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_STATE = 'system.paging.state';

/**
 * The memory paging type.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_TYPE = 'system.paging.type';

/**
 * The filesystem mode.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_MODE = 'system.filesystem.mode';

/**
 * The filesystem mount path.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_MOUNTPOINT = 'system.filesystem.mountpoint';

/**
 * The filesystem state.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_STATE = 'system.filesystem.state';

/**
 * The filesystem type.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_TYPE = 'system.filesystem.type';

/**
 * A stateless protocol MUST NOT set this attribute.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_NETWORK_STATE = 'system.network.state';

/**
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PROCESS_STATUS = 'system.process.status';

/**
 * Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found [here](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ANDROID_OS_API_LEVEL = 'android.os.api_level';

/**
 * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS =
  'aws.dynamodb.attribute_definitions';

/**
 * The value of the `AttributesToGet` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ATTRIBUTES_TO_GET =
  'aws.dynamodb.attributes_to_get';

/**
 * The value of the `ConsistentRead` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_CONSISTENT_READ = 'aws.dynamodb.consistent_read';

/**
 * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_CONSUMED_CAPACITY =
  'aws.dynamodb.consumed_capacity';

/**
 * The value of the `Count` response parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_COUNT = 'aws.dynamodb.count';

/**
 * The value of the `ExclusiveStartTableName` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_EXCLUSIVE_START_TABLE =
  'aws.dynamodb.exclusive_start_table';

/**
 * The JSON-serialized value of each item in the `GlobalSecondaryIndexUpdates` request field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES =
  'aws.dynamodb.global_secondary_index_updates';

/**
 * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES =
  'aws.dynamodb.global_secondary_indexes';

/**
 * The value of the `IndexName` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_INDEX_NAME = 'aws.dynamodb.index_name';

/**
 * The JSON-serialized value of the `ItemCollectionMetrics` response field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ITEM_COLLECTION_METRICS =
  'aws.dynamodb.item_collection_metrics';

/**
 * The value of the `Limit` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_LIMIT = 'aws.dynamodb.limit';

/**
 * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES =
  'aws.dynamodb.local_secondary_indexes';

/**
 * The value of the `ProjectionExpression` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROJECTION = 'aws.dynamodb.projection';

/**
 * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY =
  'aws.dynamodb.provisioned_read_capacity';

/**
 * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY =
  'aws.dynamodb.provisioned_write_capacity';

/**
 * The value of the `ScanIndexForward` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SCAN_FORWARD = 'aws.dynamodb.scan_forward';

/**
 * The value of the `ScannedCount` response parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SCANNED_COUNT = 'aws.dynamodb.scanned_count';

/**
 * The value of the `Segment` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SEGMENT = 'aws.dynamodb.segment';

/**
 * The value of the `Select` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SELECT = 'aws.dynamodb.select';

/**
 * The number of items in the `TableNames` response parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TABLE_COUNT = 'aws.dynamodb.table_count';

/**
 * The keys in the `RequestItems` object field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TABLE_NAMES = 'aws.dynamodb.table_names';

/**
 * The value of the `TotalSegments` request parameter.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TOTAL_SEGMENTS = 'aws.dynamodb.total_segments';

/**
 * Array of brand name and version separated by a space.
 *
 * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_BRANDS = 'browser.brands';

/**
 * Preferred language of the user using the browser.
 *
 * Note: This value is intended to be taken from the Navigator API `navigator.language`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_LANGUAGE = 'browser.language';

/**
 * A boolean that is true if the browser is running on a mobile device.
 *
 * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute SHOULD be left unset.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_MOBILE = 'browser.mobile';

/**
* The platform on which the browser is running.
*
* Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API SHOULD NOT be used instead and this attribute SHOULD be left unset in order for the values to be consistent.
The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_BROWSER_PLATFORM = 'browser.platform';

/**
 * The cloud account ID the resource is assigned to.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_ACCOUNT_ID = 'cloud.account.id';

/**
 * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
 *
 * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_AVAILABILITY_ZONE = 'cloud.availability_zone';

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_PLATFORM = 'cloud.platform';

/**
 * Name of the cloud provider.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_PROVIDER = 'cloud.provider';

/**
 * The geographical region the resource is running.
 *
 * Note: Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://www.tencentcloud.com/document/product/213/6091).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_REGION = 'cloud.region';

/**
* Cloud provider-specific native identifier of the monitored cloud resource (e.g. an [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) on AWS, a [fully qualified resource ID](https://learn.microsoft.com/rest/api/resources/resources/get-by-id) on Azure, a [full resource name](https://cloud.google.com/apis/design/resource_names#full_resource_name) on GCP).
*
* Note: On some cloud providers, it may not be possible to determine the full ID at startup,
so it may be necessary to set `cloud.resource_id` as a span attribute instead.

The exact value to use for `cloud.resource_id` depends on the cloud provider.
The following well-known definitions MUST be used if you set this attribute and they apply:

* **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
  Take care not to use the &#34;invoked ARN&#34; directly but replace any
  [alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html)
  with the resolved function version, as the same runtime instance may be invokable with
  multiple different aliases.
* **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
* **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/rest/api/resources/resources/get-by-id) of the invoked function,
  *not* the function app, having the form
  `/subscriptions/&lt;SUBSCIPTION_GUID&gt;/resourceGroups/&lt;RG&gt;/providers/Microsoft.Web/sites/&lt;FUNCAPP&gt;/functions/&lt;FUNC&gt;`.
  This means that a span attribute MUST be used, as an Azure function app can host multiple functions that would usually share
  a TracerProvider.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_CLOUD_RESOURCE_ID = 'cloud.resource_id';

/**
 * The [event_id](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#id) uniquely identifies the event.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_ID = 'cloudevents.event_id';

/**
 * The [source](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#source-1) identifies the context in which an event happened.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_SOURCE = 'cloudevents.event_source';

/**
 * The [version of the CloudEvents specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#specversion) which the event uses.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_SPEC_VERSION =
  'cloudevents.event_spec_version';

/**
 * The [subject](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#subject) of the event in the context of the event producer (identified by source).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_SUBJECT = 'cloudevents.event_subject';

/**
 * The [event_type](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#type) contains a value describing the type of event related to the originating occurrence.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_TYPE = 'cloudevents.event_type';

/**
 * The column number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_COLUMN = 'code.column';

/**
 * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_FILEPATH = 'code.filepath';

/**
 * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_FUNCTION = 'code.function';

/**
 * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_LINENO = 'code.lineno';

/**
 * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_NAMESPACE = 'code.namespace';

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_STACKTRACE = 'code.stacktrace';

/**
 * The command used to run the container (i.e. the command name).
 *
 * Note: If using embedded credentials or sensitive data, it is recommended to remove them to prevent potential leakage.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMAND = 'container.command';

/**
 * All the command arguments (including the command/executable itself) run by the container. [2].
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMAND_ARGS = 'container.command_args';

/**
 * The full command run by the container as a single string representing the full command. [2].
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMAND_LINE = 'container.command_line';

/**
 * The CPU state for this data point.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_CPU_STATE = 'container.cpu.state';

/**
 * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_ID = 'container.id';

/**
* Runtime specific image identifier. Usually a hash algorithm followed by a UUID.
*
* Note: Docker defines a sha256 of the image id; `container.image.id` corresponds to the `Image` field from the Docker container inspect [API](https://docs.docker.com/engine/api/v1.43/#tag/Container/operation/ContainerInspect) endpoint.
K8s defines a link to the container registry repository with digest `&#34;imageID&#34;: &#34;registry.azurecr.io /namespace/service/dockerfile@sha256:bdeabd40c3a8a492eaf9e8e44d0ebbb84bac7ee25ac0cf8a7159d25f62555625&#34;`.
The ID is assinged by the container runtime and can vary in different environments. Consider using `oci.manifest.digest` if it is important to identify the same image in different environments/runtimes.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_CONTAINER_IMAGE_ID = 'container.image.id';

/**
 * Name of the image the container was built on.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_NAME = 'container.image.name';

/**
 * Repo digests of the container image as provided by the container runtime.
 *
 * Note: [Docker](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect) and [CRI](https://github.com/kubernetes/cri-api/blob/c75ef5b473bbe2d0a4fc92f82235efd665ea8e9f/pkg/apis/runtime/v1/api.proto#L1237-L1238) report those under the `RepoDigests` field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_REPO_DIGESTS = 'container.image.repo_digests';

/**
 * Container image tags. An example can be found in [Docker Image Inspect](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect). Should be only the `&lt;tag&gt;` section of the full name for example from `registry.example.com/my-org/my-image:&lt;tag&gt;`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_TAGS = 'container.image.tags';

/**
 * Container name used by container runtime.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_NAME = 'container.name';

/**
 * The container runtime managing this container.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_RUNTIME = 'container.runtime';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL =
  'db.cassandra.consistency_level';

/**
 * The data center of the coordinating node for a query.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_COORDINATOR_DC = 'db.cassandra.coordinator.dc';

/**
 * The ID of the coordinating node for a query.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_COORDINATOR_ID = 'db.cassandra.coordinator.id';

/**
 * Whether or not the query is idempotent.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_IDEMPOTENCE = 'db.cassandra.idempotence';

/**
 * The fetch size used for paging, i.e. how many rows will be returned at once.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_PAGE_SIZE = 'db.cassandra.page_size';

/**
 * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT =
  'db.cassandra.speculative_execution_count';

/**
 * The name of the primary Cassandra table that the operation is acting upon, including the keyspace name (if applicable).
 *
 * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_TABLE = 'db.cassandra.table';

/**
 * Unique Cosmos client instance id.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_CLIENT_ID = 'db.cosmosdb.client_id';

/**
 * Cosmos client connection mode.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_CONNECTION_MODE = 'db.cosmosdb.connection_mode';

/**
 * Cosmos DB container name.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_CONTAINER = 'db.cosmosdb.container';

/**
 * CosmosDB Operation Type.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE = 'db.cosmosdb.operation_type';

/**
 * RU consumed for that operation.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_REQUEST_CHARGE = 'db.cosmosdb.request_charge';

/**
 * Request payload size in bytes.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_REQUEST_CONTENT_LENGTH =
  'db.cosmosdb.request_content_length';

/**
 * Cosmos DB status code.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_STATUS_CODE = 'db.cosmosdb.status_code';

/**
 * Cosmos DB sub status code.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_SUB_STATUS_CODE = 'db.cosmosdb.sub_status_code';

/**
 * Represents the identifier of an Elasticsearch cluster.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_ELASTICSEARCH_CLUSTER_NAME =
  'db.elasticsearch.cluster.name';

/**
 * An identifier (address, unique name, or any other identifier) of the database instance that is executing queries or mutations on the current connection. This is useful in cases where the database is running in a clustered environment and the instrumentation is able to record the node executing the query. The client may obtain this value in databases like MySQL using queries like `select @@hostname`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_INSTANCE_ID = 'db.instance.id';

/**
 * The MongoDB collection being accessed within the database stated in `db.name`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_MONGODB_COLLECTION = 'db.mongodb.collection';

/**
 * The Microsoft SQL Server [instance name](https://docs.microsoft.com/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
 *
 * Note: If setting a `db.mssql.instance_name`, `server.port` is no longer required (but still recommended if non-standard).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_MSSQL_INSTANCE_NAME = 'db.mssql.instance_name';

/**
 * This attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
 *
 * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;. In case there are multiple layers that could be considered for database name (e.g. Oracle instance name and schema name), the database name to be used is the more specific layer (e.g. Oracle schema name).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_NAME = 'db.name';

/**
 * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
 *
 * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_OPERATION = 'db.operation';

/**
 * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_REDIS_DATABASE_INDEX = 'db.redis.database_index';

/**
 * The name of the primary table that the operation is acting upon, including the database name (if applicable).
 *
 * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_SQL_TABLE = 'db.sql.table';

/**
 * The database statement being executed.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_STATEMENT = 'db.statement';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_SYSTEM = 'db.system';

/**
 * Username for accessing the database.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_USER = 'db.user';

/**
* Name of the [deployment environment](https://wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
*
* Note: `deployment.environment` does not affect the uniqueness constraints defined through
the `service.namespace`, `service.name` and `service.instance.id` resource attributes.
This implies that resources carrying the following attribute combinations MUST be
considered to be identifying the same service:

* `service.name=frontend`, `deployment.environment=production`
* `service.name=frontend`, `deployment.environment=staging`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';

/**
 * Deprecated, use `server.address`, `server.port` attributes instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated "Replaced by `server.address` and `server.port`.".
 */
export const ATTR_DB_CONNECTION_STRING = 'db.connection_string';

/**
 * Deprecated, use `db.instance.id` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.instance.id`.
 */
export const ATTR_DB_ELASTICSEARCH_NODE_NAME = 'db.elasticsearch.node.name';

/**
 * Removed, no replacement at this time.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Removed as not used.
 */
export const ATTR_DB_JDBC_DRIVER_CLASSNAME = 'db.jdbc.driver_classname';

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ATTR_HTTP_FLAVOR = 'http.flavor';

/**
 * Deprecated, use `http.request.method` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `http.request.method`.
 */
export const ATTR_HTTP_METHOD = 'http.method';

/**
 * Deprecated, use `http.request.header.content-length` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `http.request.header.content-length`.
 */
export const ATTR_HTTP_REQUEST_CONTENT_LENGTH = 'http.request_content_length';

/**
 * Deprecated, use `http.response.header.content-length` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `http.response.header.content-length`.
 */
export const ATTR_HTTP_RESPONSE_CONTENT_LENGTH = 'http.response_content_length';

/**
 * Deprecated, use `url.scheme` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `url.scheme` instead.
 */
export const ATTR_HTTP_SCHEME = 'http.scheme';

/**
 * Deprecated, use `http.response.status_code` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `http.response.status_code`.
 */
export const ATTR_HTTP_STATUS_CODE = 'http.status_code';

/**
 * Deprecated, use `url.path` and `url.query` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `url.path` and `url.query.
 */
export const ATTR_HTTP_TARGET = 'http.target';

/**
 * Deprecated, use `url.full` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `url.full`.
 */
export const ATTR_HTTP_URL = 'http.url';

/**
 * Deprecated, use `user_agent.original` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `user_agent.original`.
 */
export const ATTR_HTTP_USER_AGENT = 'http.user_agent';

/**
 * &#34;Deprecated, use `messaging.destination.partition.id` instead.&#34;.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.destination.partition.id`.
 */
export const ATTR_MESSAGING_KAFKA_DESTINATION_PARTITION =
  'messaging.kafka.destination.partition';

/**
 * Deprecated, use `server.address`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `server.address`.
 */
export const ATTR_NET_HOST_NAME = 'net.host.name';

/**
 * Deprecated, use `server.port`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `server.port`.
 */
export const ATTR_NET_HOST_PORT = 'net.host.port';

/**
 * Deprecated, use `server.address` on client spans and `client.address` on server spans.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `server.address` on client spans and `client.address` on server spans.
 */
export const ATTR_NET_PEER_NAME = 'net.peer.name';

/**
 * Deprecated, use `server.port` on client spans and `client.port` on server spans.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `server.port` on client spans and `client.port` on server spans.
 */
export const ATTR_NET_PEER_PORT = 'net.peer.port';

/**
 * Deprecated, use `network.protocol.name`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const ATTR_NET_PROTOCOL_NAME = 'net.protocol.name';

/**
 * Deprecated, use `network.protocol.version`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.version`.
 */
export const ATTR_NET_PROTOCOL_VERSION = 'net.protocol.version';

/**
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const ATTR_NET_SOCK_FAMILY = 'net.sock.family';

/**
 * Deprecated, use `network.local.address`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.local.address`.
 */
export const ATTR_NET_SOCK_HOST_ADDR = 'net.sock.host.addr';

/**
 * Deprecated, use `network.local.port`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.local.port`.
 */
export const ATTR_NET_SOCK_HOST_PORT = 'net.sock.host.port';

/**
 * Deprecated, use `network.peer.address`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.peer.address`.
 */
export const ATTR_NET_SOCK_PEER_ADDR = 'net.sock.peer.addr';

/**
 * Deprecated, no replacement at this time.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Removed.
 */
export const ATTR_NET_SOCK_PEER_NAME = 'net.sock.peer.name';

/**
 * Deprecated, use `network.peer.port`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.peer.port`.
 */
export const ATTR_NET_SOCK_PEER_PORT = 'net.sock.peer.port';

/**
 * Deprecated, use `network.transport`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const ATTR_NET_TRANSPORT = 'net.transport';

/**
 * Deprecated, use `system.process.status` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const ATTR_SYSTEM_PROCESSES_STATUS = 'system.processes.status';

/**
 * Destination address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the source side, and when communicating through an intermediary, `destination.address` SHOULD represent the destination address behind any intermediaries, for example proxies, if it&#39;s available.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DESTINATION_ADDRESS = 'destination.address';

/**
 * Destination port number.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DESTINATION_PORT = 'destination.port';

/**
 * A unique identifier representing the device.
 *
 * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_ID = 'device.id';

/**
 * The name of the device manufacturer.
 *
 * Note: The Android OS provides this field via [Build](https://developer.android.com/reference/android/os/Build#MANUFACTURER). iOS apps SHOULD hardcode the value `Apple`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MANUFACTURER = 'device.manufacturer';

/**
 * The model identifier for the device.
 *
 * Note: It&#39;s recommended this value represents a machine-readable version of the model identifier rather than the market or consumer-friendly name of the device.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MODEL_IDENTIFIER = 'device.model.identifier';

/**
 * The marketing name for the device model.
 *
 * Note: It&#39;s recommended this value represents a human-readable version of the device model rather than a machine-readable alternative.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MODEL_NAME = 'device.model.name';

/**
 * The disk IO operation direction.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DISK_IO_DIRECTION = 'disk.io.direction';

/**
 * The name being queried.
 *
 * Note: If the name field contains non-printable characters (below 32 or above 126), those characters should be represented as escaped base 10 integers (\DDD). Back slashes and quotes should be escaped. Tabs, carriage returns, and line feeds should be converted to \t, \r, and \n respectively.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DNS_QUESTION_NAME = 'dns.question.name';

/**
 * Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ENDUSER_ID = 'enduser.id';

/**
 * Actual/assumed role the client is making the request under extracted from token or application security context.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ENDUSER_ROLE = 'enduser.role';

/**
 * Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ENDUSER_SCOPE = 'enduser.scope';

/**
 * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_COLDSTART = 'faas.coldstart';

/**
 * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_CRON = 'faas.cron';

/**
 * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_COLLECTION = 'faas.document.collection';

/**
 * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_NAME = 'faas.document.name';

/**
 * Describes the type of the operation that was performed on the data.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_OPERATION = 'faas.document.operation';

/**
 * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_TIME = 'faas.document.time';

/**
 * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
 *
 * Note: * **AWS Lambda:** Use the (full) log stream name.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INSTANCE = 'faas.instance';

/**
 * The invocation ID of the current function invocation.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOCATION_ID = 'faas.invocation_id';

/**
 * The name of the invoked function.
 *
 * Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKED_NAME = 'faas.invoked_name';

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKED_PROVIDER = 'faas.invoked_provider';

/**
 * The cloud region of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKED_REGION = 'faas.invoked_region';

/**
 * The amount of memory available to the serverless function converted to Bytes.
 *
 * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information (which must be multiplied by 1,048,576).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_MAX_MEMORY = 'faas.max_memory';

/**
* The name of the single function that this runtime instance executes.
*
* Note: This is the name of the function as configured/deployed on the FaaS
platform and is usually different from the name of the callback
function (which may be stored in the
[`code.namespace`/`code.function`](/docs/general/attributes.md#source-code-attributes)
span attributes).

For some cloud providers, the above definition is ambiguous. The following
definition of function name MUST be used for this attribute
(and consequently the span name) for the listed cloud providers/products:

* **Azure:**  The full name `&lt;FUNCAPP&gt;/&lt;FUNC&gt;`, i.e., function app name
  followed by a forward slash followed by the function name (this form
  can also be seen in the resource JSON for the function).
  This means that a span attribute MUST be used, as an Azure function
  app can host multiple functions that would usually share
  a TracerProvider (see also the `cloud.resource_id` attribute).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_FAAS_NAME = 'faas.name';

/**
 * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_TIME = 'faas.time';

/**
 * Type of the trigger which caused this function invocation.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_TRIGGER = 'faas.trigger';

/**
* The immutable version of the function being executed.
*
* Note: Depending on the cloud provider and platform, use:

* **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
  (an integer represented as a decimal string).
* **Google Cloud Run (Services):** The [revision](https://cloud.google.com/run/docs/managing/revisions)
  (i.e., the function name plus the revision suffix).
* **Google Cloud Functions:** The value of the
  [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
* **Azure Functions:** Not applicable. Do not set this attribute.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_FAAS_VERSION = 'faas.version';

/**
 * The unique identifier of the feature flag.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FEATURE_FLAG_KEY = 'feature_flag.key';

/**
 * The name of the service provider that performs the flag evaluation.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FEATURE_FLAG_PROVIDER_NAME = 'feature_flag.provider_name';

/**
* SHOULD be a semantic identifier for a value. If one is unavailable, a stringified version of the value can be used.
*
* Note: A semantic identifier, commonly referred to as a variant, provides a means
for referring to a value without including the value itself. This can
provide additional context for understanding the meaning behind a value.
For example, the variant `red` maybe be used for the value `#c05543`.

A stringified version of the value can be used in situations where a
semantic identifier is unavailable. String representation of the value
should be determined by the implementer.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_FEATURE_FLAG_VARIANT = 'feature_flag.variant';

/**
 * Directory where the file is located. It should include the drive letter, when appropriate.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_DIRECTORY = 'file.directory';

/**
 * File extension, excluding the leading dot.
 *
 * Note: When the file name has multiple extensions (example.tar.gz), only the last one should be captured (&#34;gz&#34;, not &#34;tar.gz&#34;).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_EXTENSION = 'file.extension';

/**
 * Name of the file including the extension, without the directory.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_NAME = 'file.name';

/**
 * Full path to the file, including the file name. It should include the drive letter, when appropriate.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_PATH = 'file.path';

/**
 * File size in bytes.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_SIZE = 'file.size';

/**
 * The name of the Cloud Run [execution](https://cloud.google.com/run/docs/managing/job-executions) being run for the Job, as set by the [`CLOUD_RUN_EXECUTION`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_CLOUD_RUN_JOB_EXECUTION = 'gcp.cloud_run.job.execution';

/**
 * The index for a task within an execution as provided by the [`CLOUD_RUN_TASK_INDEX`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_CLOUD_RUN_JOB_TASK_INDEX = 'gcp.cloud_run.job.task_index';

/**
 * The hostname of a GCE instance. This is the full value of the default or [custom hostname](https://cloud.google.com/compute/docs/instances/custom-hostname-vm).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_GCE_INSTANCE_HOSTNAME = 'gcp.gce.instance.hostname';

/**
 * The instance name of a GCE instance. This is the value provided by `host.name`, the visible name of the instance in the Cloud Console UI, and the prefix for the default hostname of the instance as defined by the [default internal DNS name](https://cloud.google.com/compute/docs/internal-dns#instance-fully-qualified-domain-names).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_GCE_INSTANCE_NAME = 'gcp.gce.instance.name';

/**
 * The CPU architecture the host system is running on.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_ARCH = 'host.arch';

/**
 * The amount of level 2 memory cache available to the processor (in Bytes).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_CACHE_L2_SIZE = 'host.cpu.cache.l2.size';

/**
 * Family or generation of the CPU.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_FAMILY = 'host.cpu.family';

/**
 * Model identifier. It provides more granular information about the CPU, distinguishing it from other CPUs within the same family.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_MODEL_ID = 'host.cpu.model.id';

/**
 * Model designation of the processor.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_MODEL_NAME = 'host.cpu.model.name';

/**
 * Stepping or core revisions.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_STEPPING = 'host.cpu.stepping';

/**
 * Processor manufacturer identifier. A maximum 12-character string.
 *
 * Note: [CPUID](https://wiki.osdev.org/CPUID) command returns the vendor ID string in EBX, EDX and ECX registers. Writing these to memory in this order results in a 12-character string.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_VENDOR_ID = 'host.cpu.vendor.id';

/**
 * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized systems, this should be the `machine-id`. See the table below for the sources to use to determine the `machine-id` based on operating system.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_ID = 'host.id';

/**
 * VM image ID or host OS image ID. For Cloud, this value is from the provider.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_ID = 'host.image.id';

/**
 * Name of the VM image or OS install the host was instantiated from.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_NAME = 'host.image.name';

/**
 * The version string of the VM image or host OS as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_VERSION = 'host.image.version';

/**
 * Available IP addresses of the host, excluding loopback interfaces.
 *
 * Note: IPv4 Addresses MUST be specified in dotted-quad notation. IPv6 addresses MUST be specified in the [RFC 5952](https://www.rfc-editor.org/rfc/rfc5952.html) format.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IP = 'host.ip';

/**
 * Available MAC addresses of the host, excluding loopback interfaces.
 *
 * Note: MAC Addresses MUST be represented in [IEEE RA hexadecimal form](https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf): as hyphen-separated octets in uppercase hexadecimal form from most to least significant.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_MAC = 'host.mac';

/**
 * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_NAME = 'host.name';

/**
 * Type of host. For Cloud, this must be the machine type.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_TYPE = 'host.type';

/**
 * State of the HTTP connection in the HTTP connection pool.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_CONNECTION_STATE = 'http.connection.state';

/**
 * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_REQUEST_BODY_SIZE = 'http.request.body.size';

/**
 * The total size of the request in bytes. This should be the total number of bytes sent over the wire, including the request line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and request body if any.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_REQUEST_SIZE = 'http.request.size';

/**
 * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_RESPONSE_BODY_SIZE = 'http.response.body.size';

/**
 * The total size of the response in bytes. This should be the total number of bytes sent over the wire, including the status line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and response body and trailers if any.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_RESPONSE_SIZE = 'http.response.size';

/**
 * The name of the cluster.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CLUSTER_NAME = 'k8s.cluster.name';

/**
* A pseudo-ID for the cluster, set to the UID of the `kube-system` namespace.
*
* Note: K8s doesn&#39;t have support for obtaining a cluster ID. If this is ever
added, we will recommend collecting the `k8s.cluster.uid` through the
official APIs. In the meantime, we are able to use the `uid` of the
`kube-system` namespace as a proxy for cluster ID. Read on for the
rationale.

Every object created in a K8s cluster is assigned a distinct UID. The
`kube-system` namespace is used by Kubernetes itself and will exist
for the lifetime of the cluster. Using the `uid` of the `kube-system`
namespace is a reasonable proxy for the K8s ClusterID as it will only
change if the cluster is rebuilt. Furthermore, Kubernetes UIDs are
UUIDs as standardized by
[ISO/IEC 9834-8 and ITU-T X.667](https://www.itu.int/ITU-T/studygroups/com17/oid.html).
Which states:

&gt; If generated according to one of the mechanisms defined in Rec.
  ITU-T X.667 | ISO/IEC 9834-8, a UUID is either guaranteed to be
  different from all other UUIDs generated before 3603 A.D., or is
  extremely likely to be different (depending on the mechanism chosen).

Therefore, UIDs between clusters should be extremely unlikely to
conflict.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_K8S_CLUSTER_UID = 'k8s.cluster.uid';

/**
 * The name of the Container from Pod specification, must be unique within a Pod. Container runtime usually uses different globally unique name (`container.name`).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CONTAINER_NAME = 'k8s.container.name';

/**
 * Number of times the container was restarted. This attribute can be used to identify a particular container (running or stopped) within a container spec.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CONTAINER_RESTART_COUNT = 'k8s.container.restart_count';

/**
 * The name of the CronJob.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CRONJOB_NAME = 'k8s.cronjob.name';

/**
 * The UID of the CronJob.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CRONJOB_UID = 'k8s.cronjob.uid';

/**
 * The name of the DaemonSet.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DAEMONSET_NAME = 'k8s.daemonset.name';

/**
 * The UID of the DaemonSet.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DAEMONSET_UID = 'k8s.daemonset.uid';

/**
 * The name of the Deployment.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DEPLOYMENT_NAME = 'k8s.deployment.name';

/**
 * The UID of the Deployment.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DEPLOYMENT_UID = 'k8s.deployment.uid';

/**
 * The name of the Job.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_JOB_NAME = 'k8s.job.name';

/**
 * The UID of the Job.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_JOB_UID = 'k8s.job.uid';

/**
 * The name of the namespace that the pod is running in.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NAMESPACE_NAME = 'k8s.namespace.name';

/**
 * The name of the Node.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NODE_NAME = 'k8s.node.name';

/**
 * The UID of the Node.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NODE_UID = 'k8s.node.uid';

/**
 * The name of the Pod.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_POD_NAME = 'k8s.pod.name';

/**
 * The UID of the Pod.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_POD_UID = 'k8s.pod.uid';

/**
 * The name of the ReplicaSet.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_REPLICASET_NAME = 'k8s.replicaset.name';

/**
 * The UID of the ReplicaSet.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_REPLICASET_UID = 'k8s.replicaset.uid';

/**
 * The name of the StatefulSet.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_STATEFULSET_NAME = 'k8s.statefulset.name';

/**
 * The UID of the StatefulSet.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_STATEFULSET_UID = 'k8s.statefulset.uid';

/**
 * The number of messages sent, received, or processed in the scope of the batching operation.
 *
 * Note: Instrumentations SHOULD NOT set `messaging.batch.message_count` on spans that operate with a single message. When a messaging client library supports both batch and single-message API for the same operation, instrumentations SHOULD use `messaging.batch.message_count` for batching APIs and SHOULD NOT use it for single-message APIs.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_BATCH_MESSAGE_COUNT =
  'messaging.batch.message_count';

/**
 * A unique identifier for the client that consumes or produces a message.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_CLIENT_ID = 'messaging.client_id';

/**
 * A boolean that is true if the message destination is anonymous (could be unnamed or have auto-generated name).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_ANONYMOUS =
  'messaging.destination.anonymous';

/**
* The message destination name.
*
* Note: Destination name SHOULD uniquely identify a specific queue, topic or other entity within the broker. If
the broker doesn&#39;t have such notion, the destination name SHOULD uniquely identify the broker.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_MESSAGING_DESTINATION_NAME = 'messaging.destination.name';

/**
 * The identifier of the partition messages are sent to or received from, unique within the `messaging.destination.name`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_PARTITION_ID =
  'messaging.destination.partition.id';

/**
 * Low cardinality representation of the messaging destination name.
 *
 * Note: Destination names could be constructed from templates. An example would be a destination name involving a user name or product id. Although the destination name in this case is of high cardinality, the underlying template is of low cardinality and can be effectively used for grouping and aggregation.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_TEMPLATE =
  'messaging.destination.template';

/**
 * A boolean that is true if the message destination is temporary and might not exist anymore after messages are processed.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_TEMPORARY =
  'messaging.destination.temporary';

/**
 * A boolean that is true if the publish message destination is anonymous (could be unnamed or have auto-generated name).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_PUBLISH_ANONYMOUS =
  'messaging.destination_publish.anonymous';

/**
* The name of the original destination the message was published to.
*
* Note: The name SHOULD uniquely identify a specific queue, topic, or other entity within the broker. If
the broker doesn&#39;t have such notion, the original destination name SHOULD uniquely identify the broker.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_MESSAGING_DESTINATION_PUBLISH_NAME =
  'messaging.destination_publish.name';

/**
 * The name of the consumer group the event consumer is associated with.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_EVENTHUBS_CONSUMER_GROUP =
  'messaging.eventhubs.consumer.group';

/**
 * The UTC epoch seconds at which the message has been accepted and stored in the entity.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_EVENTHUBS_MESSAGE_ENQUEUED_TIME =
  'messaging.eventhubs.message.enqueued_time';

/**
 * The ordering key for a given message. If the attribute is not present, the message does not have an ordering key.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_GCP_PUBSUB_MESSAGE_ORDERING_KEY =
  'messaging.gcp_pubsub.message.ordering_key';

/**
 * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_CONSUMER_GROUP =
  'messaging.kafka.consumer.group';

/**
 * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message.id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
 *
 * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_KEY = 'messaging.kafka.message.key';

/**
 * The offset of a record in the corresponding Kafka partition.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_OFFSET =
  'messaging.kafka.message.offset';

/**
 * A boolean that is true if the message is a tombstone.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE =
  'messaging.kafka.message.tombstone';

/**
* The size of the message body in bytes.
*
* Note: This can refer to both the compressed or uncompressed body size. If both sizes are known, the uncompressed
body size should be used.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_MESSAGING_MESSAGE_BODY_SIZE = 'messaging.message.body.size';

/**
 * The conversation ID identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_CONVERSATION_ID =
  'messaging.message.conversation_id';

/**
* The size of the message body and metadata in bytes.
*
* Note: This can refer to both the compressed or uncompressed size. If both sizes are known, the uncompressed
size should be used.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_MESSAGING_MESSAGE_ENVELOPE_SIZE =
  'messaging.message.envelope.size';

/**
 * A value used by the messaging system as an identifier for the message, represented as a string.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_ID = 'messaging.message.id';

/**
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_OPERATION = 'messaging.operation';

/**
 * RabbitMQ message routing key.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY =
  'messaging.rabbitmq.destination.routing_key';

/**
 * RabbitMQ message delivery tag.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_RABBITMQ_MESSAGE_DELIVERY_TAG =
  'messaging.rabbitmq.message.delivery_tag';

/**
 * Name of the RocketMQ producer/consumer group that is handling the message. The client type is identified by the SpanKind.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_CLIENT_GROUP =
  'messaging.rocketmq.client_group';

/**
 * Model of message consumption. This only applies to consumer spans.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL =
  'messaging.rocketmq.consumption_model';

/**
 * The delay time level for delay message, which determines the message delay time.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL =
  'messaging.rocketmq.message.delay_time_level';

/**
 * The timestamp in milliseconds that the delay message is expected to be delivered to consumer.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP =
  'messaging.rocketmq.message.delivery_timestamp';

/**
 * It is essential for FIFO message. Messages that belong to the same message group are always processed one by one within the same consumer group.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_GROUP =
  'messaging.rocketmq.message.group';

/**
 * Key(s) of message, another way to mark message besides message id.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_KEYS =
  'messaging.rocketmq.message.keys';

/**
 * The secondary classifier of message besides topic.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TAG =
  'messaging.rocketmq.message.tag';

/**
 * Type of message.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE =
  'messaging.rocketmq.message.type';

/**
 * Namespace of RocketMQ resources, resources in different namespaces are individual.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_NAMESPACE = 'messaging.rocketmq.namespace';

/**
 * The name of the subscription in the topic messages are received from.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_DESTINATION_SUBSCRIPTION_NAME =
  'messaging.servicebus.destination.subscription_name';

/**
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS =
  'messaging.servicebus.disposition_status';

/**
 * Number of deliveries that have been attempted for this message.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_MESSAGE_DELIVERY_COUNT =
  'messaging.servicebus.message.delivery_count';

/**
 * The UTC epoch seconds at which the message has been accepted and stored in the entity.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_MESSAGE_ENQUEUED_TIME =
  'messaging.servicebus.message.enqueued_time';

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SYSTEM = 'messaging.system';

/**
 * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_ICC = 'network.carrier.icc';

/**
 * The mobile carrier country code.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_MCC = 'network.carrier.mcc';

/**
 * The mobile carrier network code.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_MNC = 'network.carrier.mnc';

/**
 * The name of the mobile carrier.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_NAME = 'network.carrier.name';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CONNECTION_SUBTYPE = 'network.connection.subtype';

/**
 * The internet connection type.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CONNECTION_TYPE = 'network.connection.type';

/**
 * The network IO operation direction.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_IO_DIRECTION = 'network.io.direction';

/**
* The digest of the OCI image manifest. For container images specifically is the digest by which the container image is known.
*
* Note: Follows [OCI Image Manifest Specification](https://github.com/opencontainers/image-spec/blob/main/manifest.md), and specifically the [Digest property](https://github.com/opencontainers/image-spec/blob/main/descriptor.md#digests).
An example can be found in [Example Image Manifest](https://docs.docker.com/registry/spec/manifest-v2-2/#example-image-manifest).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_OCI_MANIFEST_DIGEST = 'oci.manifest.digest';

/**
 * Unique identifier for a particular build or compilation of the operating system.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_BUILD_ID = 'os.build_id';

/**
 * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_DESCRIPTION = 'os.description';

/**
 * Human readable operating system name.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_NAME = 'os.name';

/**
 * The operating system type.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_TYPE = 'os.type';

/**
 * The version string of the operating system as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_VERSION = 'os.version';

/**
 * The [`service.name`](/docs/resource/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PEER_SERVICE = 'peer.service';

/**
 * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMAND = 'process.command';

/**
 * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMAND_ARGS = 'process.command_args';

/**
 * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMAND_LINE = 'process.command_line';

/**
 * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_EXECUTABLE_NAME = 'process.executable.name';

/**
 * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_EXECUTABLE_PATH = 'process.executable.path';

/**
 * The username of the user that owns the process.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_OWNER = 'process.owner';

/**
 * Parent Process identifier (PPID).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PARENT_PID = 'process.parent_pid';

/**
 * Process identifier (PID).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PID = 'process.pid';

/**
 * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_DESCRIPTION = 'process.runtime.description';

/**
 * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_NAME = 'process.runtime.name';

/**
 * The version of the runtime of this process, as returned by the runtime without modification.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_VERSION = 'process.runtime.version';

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE = 'rpc.connect_rpc.error_code';

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_GRPC_STATUS_CODE = 'rpc.grpc.status_code';

/**
 * `error.code` property of response if it is an error response.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_ERROR_CODE = 'rpc.jsonrpc.error_code';

/**
 * `error.message` property of response if it is an error response.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_ERROR_MESSAGE = 'rpc.jsonrpc.error_message';

/**
 * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_REQUEST_ID = 'rpc.jsonrpc.request_id';

/**
 * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 doesn&#39;t specify this, the value can be omitted.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_VERSION = 'rpc.jsonrpc.version';

/**
 * The name of the (logical) method being called, must be equal to the $method part in the span name.
 *
 * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_METHOD = 'rpc.method';

/**
 * The full (logical) name of the service being called, including its package name, if applicable.
 *
 * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_SERVICE = 'rpc.service';

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_SYSTEM = 'rpc.system';

/**
* The string ID of the service instance.
*
* Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words
`service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to
distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled
service).

Implementations, such as SDKs, are recommended to generate a random Version 1 or Version 4 [RFC
4122](https://www.ietf.org/rfc/rfc4122.txt) UUID, but are free to use an inherent unique ID as the source of
this value if stability is desirable. In that case, the ID SHOULD be used as source of a UUID Version 5 and
SHOULD use the following UUID as the namespace: `4d63009a-8d0f-11ee-aad7-4c796ed8e320`.

UUIDs are typically recommended, as only an opaque value for the purposes of identifying a service instance is
needed. Similar to what can be seen in the man page for the
[`/etc/machine-id`](https://www.freedesktop.org/software/systemd/man/machine-id.html) file, the underlying
data, such as pod name and namespace should be treated as confidential, being the user&#39;s choice to expose it
or not via another resource attribute.

For applications running behind an application server (like unicorn), we do not recommend using one identifier
for all processes participating in the application. Instead, it&#39;s recommended each division (e.g. a worker
thread in unicorn) to have its own instance.id.

It&#39;s not recommended for a Collector to set `service.instance.id` if it can&#39;t unambiguously determine the
service instance that is generating that telemetry. For instance, creating an UUID based on `pod.name` will
likely be wrong, as the Collector might not know from which container within that pod the telemetry originated.
However, Collectors can set the `service.instance.id` if they can unambiguously determine the service instance
for that telemetry. This is typically the case for scraping receivers, as they know the target address and
port.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_SERVICE_INSTANCE_ID = 'service.instance.id';

/**
 * A namespace for `service.name`.
 *
 * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SERVICE_NAMESPACE = 'service.namespace';

/**
 * A unique id to identify a session.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SESSION_ID = 'session.id';

/**
 * The previous `session.id` for this user, when known.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SESSION_PREVIOUS_ID = 'session.previous_id';

/**
 * Source address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the destination side, and when communicating through an intermediary, `source.address` SHOULD represent the source address behind any intermediaries, for example proxies, if it&#39;s available.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SOURCE_ADDRESS = 'source.address';

/**
 * Source port number.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SOURCE_PORT = 'source.port';

/**
* The name of the auto instrumentation agent or distribution, if used.
*
* Note: Official auto instrumentation agents and distributions SHOULD set the `telemetry.distro.name` attribute to
a string starting with `opentelemetry-`, e.g. `opentelemetry-java-instrumentation`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_TELEMETRY_DISTRO_NAME = 'telemetry.distro.name';

/**
 * The version string of the auto instrumentation agent or distribution, if used.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TELEMETRY_DISTRO_VERSION = 'telemetry.distro.version';

/**
 * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_THREAD_ID = 'thread.id';

/**
 * Current thread name.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_THREAD_NAME = 'thread.name';

/**
 * String indicating the [cipher](https://datatracker.ietf.org/doc/html/rfc5246#appendix-A.5) used during the current connection.
 *
 * Note: The values allowed for `tls.cipher` MUST be one of the `Descriptions` of the [registered TLS Cipher Suits](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#table-tls-parameters-4).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CIPHER = 'tls.cipher';

/**
 * PEM-encoded stand-alone certificate offered by the client. This is usually mutually-exclusive of `client.certificate_chain` since this value also exists in that list.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_CERTIFICATE = 'tls.client.certificate';

/**
 * Array of PEM-encoded certificates that make up the certificate chain offered by the client. This is usually mutually-exclusive of `client.certificate` since that value should be the first certificate in the chain.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_CERTIFICATE_CHAIN = 'tls.client.certificate_chain';

/**
 * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_MD5 = 'tls.client.hash.md5';

/**
 * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_SHA1 = 'tls.client.hash.sha1';

/**
 * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_SHA256 = 'tls.client.hash.sha256';

/**
 * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_ISSUER = 'tls.client.issuer';

/**
 * A hash that identifies clients based on how they perform an SSL/TLS handshake.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_JA3 = 'tls.client.ja3';

/**
 * Date/Time indicating when client certificate is no longer considered valid.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_NOT_AFTER = 'tls.client.not_after';

/**
 * Date/Time indicating when client certificate is first considered valid.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_NOT_BEFORE = 'tls.client.not_before';

/**
 * Also called an SNI, this tells the server which hostname to which the client is attempting to connect to.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_SERVER_NAME = 'tls.client.server_name';

/**
 * Distinguished name of subject of the x.509 certificate presented by the client.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_SUBJECT = 'tls.client.subject';

/**
 * Array of ciphers offered by the client during the client hello.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_SUPPORTED_CIPHERS = 'tls.client.supported_ciphers';

/**
 * String indicating the curve used for the given cipher, when applicable.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CURVE = 'tls.curve';

/**
 * Boolean flag indicating if the TLS negotiation was successful and transitioned to an encrypted tunnel.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_ESTABLISHED = 'tls.established';

/**
 * String indicating the protocol being tunneled. Per the values in the [IANA registry](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids), this string should be lower case.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_NEXT_PROTOCOL = 'tls.next_protocol';

/**
 * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_PROTOCOL_NAME = 'tls.protocol.name';

/**
 * Numeric part of the version parsed from the original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_PROTOCOL_VERSION = 'tls.protocol.version';

/**
 * Boolean flag indicating if this TLS connection was resumed from an existing TLS negotiation.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_RESUMED = 'tls.resumed';

/**
 * PEM-encoded stand-alone certificate offered by the server. This is usually mutually-exclusive of `server.certificate_chain` since this value also exists in that list.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_CERTIFICATE = 'tls.server.certificate';

/**
 * Array of PEM-encoded certificates that make up the certificate chain offered by the server. This is usually mutually-exclusive of `server.certificate` since that value should be the first certificate in the chain.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_CERTIFICATE_CHAIN = 'tls.server.certificate_chain';

/**
 * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_MD5 = 'tls.server.hash.md5';

/**
 * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_SHA1 = 'tls.server.hash.sha1';

/**
 * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_SHA256 = 'tls.server.hash.sha256';

/**
 * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_ISSUER = 'tls.server.issuer';

/**
 * A hash that identifies servers based on how they perform an SSL/TLS handshake.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_JA3S = 'tls.server.ja3s';

/**
 * Date/Time indicating when server certificate is no longer considered valid.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_NOT_AFTER = 'tls.server.not_after';

/**
 * Date/Time indicating when server certificate is first considered valid.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_NOT_BEFORE = 'tls.server.not_before';

/**
 * Distinguished name of subject of the x.509 certificate presented by the server.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_SUBJECT = 'tls.server.subject';

/**
 * Domain extracted from the `url.full`, such as &#34;opentelemetry.io&#34;.
 *
 * Note: In some cases a URL may refer to an IP and/or port directly, without a domain name. In this case, the IP address would go to the domain field. If the URL contains a [literal IPv6 address](https://www.rfc-editor.org/rfc/rfc2732#section-2) enclosed by `[` and `]`, the `[` and `]` characters should also be captured in the domain field.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_DOMAIN = 'url.domain';

/**
 * The file extension extracted from the `url.full`, excluding the leading dot.
 *
 * Note: The file extension is only set if it exists, as not every url has a file extension. When the file name has multiple extensions `example.tar.gz`, only the last one should be captured `gz`, not `tar.gz`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_EXTENSION = 'url.extension';

/**
* Unmodified original URL as seen in the event source.
*
* Note: In network monitoring, the observed URL may be a full URL, whereas in access logs, the URL is often just represented as a path. This field is meant to represent the URL as it was observed, complete or not.
`url.original` might contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case password and username SHOULD NOT be redacted and attribute&#39;s value SHOULD remain the same.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_URL_ORIGINAL = 'url.original';

/**
 * Port extracted from the `url.full`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_PORT = 'url.port';

/**
 * The highest registered url domain, stripped of the subdomain.
 *
 * Note: This value can be determined precisely with the [public suffix list](http://publicsuffix.org). For example, the registered domain for `foo.example.com` is `example.com`. Trying to approximate this by simply taking the last two labels will not work well for TLDs such as `co.uk`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_REGISTERED_DOMAIN = 'url.registered_domain';

/**
 * The subdomain portion of a fully qualified domain name includes all of the names except the host name under the registered_domain. In a partially qualified domain, or if the qualification level of the full name cannot be determined, subdomain contains all of the names below the registered domain.
 *
 * Note: The subdomain portion of `www.east.mydomain.co.uk` is `east`. If the domain has multiple levels of subdomain, such as `sub2.sub1.example.com`, the subdomain field should contain `sub2.sub1`, with no trailing period.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_SUBDOMAIN = 'url.subdomain';

/**
 * The effective top level domain (eTLD), also known as the domain suffix, is the last part of the domain name. For example, the top level domain for example.com is `com`.
 *
 * Note: This value can be determined precisely with the [public suffix list](http://publicsuffix.org).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_TOP_LEVEL_DOMAIN = 'url.top_level_domain';

/**
 * Name of the user-agent extracted from original. Usually refers to the browser&#39;s name.
 *
 * Note: [Example](https://www.whatsmyua.info) of extracting browser&#39;s name from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant name SHOULD be selected. In such a scenario it should align with `user_agent.version`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_AGENT_NAME = 'user_agent.name';

/**
 * Version of the user-agent extracted from original. Usually refers to the browser&#39;s version.
 *
 * Note: [Example](https://www.whatsmyua.info) of extracting browser&#39;s version from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant version SHOULD be selected. In such a scenario it should align with `user_agent.name`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_AGENT_VERSION = 'user_agent.version';

/**
 * The ID of a running ECS task. The ID MUST be extracted from `task.arn`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_ID = 'aws.ecs.task.id';

/**
 * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_CLUSTER_ARN = 'aws.ecs.cluster.arn';

/**
 * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_CONTAINER_ARN = 'aws.ecs.container.arn';

/**
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_LAUNCHTYPE = 'aws.ecs.launchtype';

/**
 * The ARN of a running [ECS task](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-account-settings.html#ecs-resource-ids).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_ARN = 'aws.ecs.task.arn';

/**
 * The family name of the [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html) used to create the ECS task.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_FAMILY = 'aws.ecs.task.family';

/**
 * The revision for the task definition used to create the ECS task.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_REVISION = 'aws.ecs.task.revision';

/**
 * The ARN of an EKS cluster.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_EKS_CLUSTER_ARN = 'aws.eks.cluster.arn';

/**
 * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
 *
 * Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_GROUP_ARNS = 'aws.log.group.arns';

/**
 * The name(s) of the AWS log group(s) an application is writing to.
 *
 * Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_GROUP_NAMES = 'aws.log.group.names';

/**
 * The ARN(s) of the AWS log stream(s).
 *
 * Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_STREAM_ARNS = 'aws.log.stream.arns';

/**
 * The name(s) of the AWS log stream(s) an application is writing to.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_STREAM_NAMES = 'aws.log.stream.names';

/**
 * Unique identifier for the application.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_APP_ID = 'heroku.app.id';

/**
 * Commit hash for the current release.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_RELEASE_COMMIT = 'heroku.release.commit';

/**
 * Time and date the release was created.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_RELEASE_CREATION_TIMESTAMP =
  'heroku.release.creation_timestamp';

/**
 * The name of the web engine.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_NAME = 'webengine.name';

/**
 * Additional description of the web engine (e.g. detailed version and edition information).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_DESCRIPTION = 'webengine.description';

/**
 * The version of the web engine.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_VERSION = 'webengine.version';

/**
 * None.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated use the `otel.scope.name` attribute.
 */
export const ATTR_OTEL_LIBRARY_NAME = 'otel.library.name';

/**
 * None.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated use the `otel.scope.version` attribute.
 */
export const ATTR_OTEL_LIBRARY_VERSION = 'otel.library.version';

/**
 * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
 *
 * Note: This may be different from `cloud.resource_id` if an alias is involved.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LAMBDA_INVOKED_ARN = 'aws.lambda.invoked_arn';

/**
 * Parent-child Reference type.
 *
 * Note: The causal relationship between a child Span and a parent Span.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OPENTRACING_REF_TYPE = 'opentracing.ref_type';

/**
 * The AWS request ID as returned in the response headers `x-amz-request-id` or `x-amz-requestid`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_REQUEST_ID = 'aws.request_id';

/**
* The S3 bucket name the request refers to. Corresponds to the `--bucket` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
*
* Note: The `bucket` attribute is applicable to all S3 operations that reference a bucket, i.e. that require the bucket name as a mandatory parameter.
This applies to almost all S3 operations except `list-buckets`.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_AWS_S3_BUCKET = 'aws.s3.bucket';

/**
* The source object (in the form `bucket`/`key`) for the copy operation.
*
* Note: The `copy_source` attribute applies to S3 copy operations and corresponds to the `--copy-source` parameter
of the [copy-object operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html).
This applies in particular to the following operations:

- [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
- [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_AWS_S3_COPY_SOURCE = 'aws.s3.copy_source';

/**
* The delete request container that specifies the objects to be deleted.
*
* Note: The `delete` attribute is only applicable to the [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html) operation.
The `delete` attribute corresponds to the `--delete` parameter of the
[delete-objects operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-objects.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_AWS_S3_DELETE = 'aws.s3.delete';

/**
* The S3 object key the request refers to. Corresponds to the `--key` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
*
* Note: The `key` attribute is applicable to all object-related S3 operations, i.e. that require the object key as a mandatory parameter.
This applies in particular to the following operations:

- [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
- [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html)
- [get-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/get-object.html)
- [head-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/head-object.html)
- [put-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/put-object.html)
- [restore-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/restore-object.html)
- [select-object-content](https://docs.aws.amazon.com/cli/latest/reference/s3api/select-object-content.html)
- [abort-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/abort-multipart-upload.html)
- [complete-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/complete-multipart-upload.html)
- [create-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/create-multipart-upload.html)
- [list-parts](https://docs.aws.amazon.com/cli/latest/reference/s3api/list-parts.html)
- [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
- [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_AWS_S3_KEY = 'aws.s3.key';

/**
* The part number of the part being uploaded in a multipart-upload operation. This is a positive integer between 1 and 10,000.
*
* Note: The `part_number` attribute is only applicable to the [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
and [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html) operations.
The `part_number` attribute corresponds to the `--part-number` parameter of the
[upload-part operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_AWS_S3_PART_NUMBER = 'aws.s3.part_number';

/**
* Upload ID that identifies the multipart upload.
*
* Note: The `upload_id` attribute applies to S3 multipart-upload operations and corresponds to the `--upload-id` parameter
of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) multipart operations.
This applies in particular to the following operations:

- [abort-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/abort-multipart-upload.html)
- [complete-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/complete-multipart-upload.html)
- [list-parts](https://docs.aws.amazon.com/cli/latest/reference/s3api/list-parts.html)
- [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
- [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
*/
export const ATTR_AWS_S3_UPLOAD_ID = 'aws.s3.upload_id';

/**
 * The GraphQL document being executed.
 *
 * Note: The value may be sanitized to exclude sensitive information.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_DOCUMENT = 'graphql.document';

/**
 * The name of the operation being executed.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_OPERATION_NAME = 'graphql.operation.name';

/**
 * The type of the operation being executed.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_OPERATION_TYPE = 'graphql.operation.type';

/**
 * Compressed size of the message in bytes.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGE_COMPRESSED_SIZE = 'message.compressed_size';

/**
 * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
 *
 * Note: This way we guarantee that the values will be consistent between different implementations.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGE_ID = 'message.id';

/**
 * Whether this is a received or sent message.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGE_TYPE = 'message.type';

/**
 * Uncompressed size of the message in bytes.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGE_UNCOMPRESSED_SIZE = 'message.uncompressed_size';

/**
 * Enum value 'stdout' for attribute {@link ATTR_LOG_IOSTREAM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const LOG_IOSTREAM_VALUES_STDOUT = 'stdout';

/**
 * Enum value 'stderr' for attribute {@link ATTR_LOG_IOSTREAM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const LOG_IOSTREAM_VALUES_STDERR = 'stderr';

/**
 * Enum value 'active' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const IOS_STATE_VALUES_ACTIVE = 'active';

/**
 * Enum value 'inactive' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const IOS_STATE_VALUES_INACTIVE = 'inactive';

/**
 * Enum value 'background' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const IOS_STATE_VALUES_BACKGROUND = 'background';

/**
 * Enum value 'foreground' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const IOS_STATE_VALUES_FOREGROUND = 'foreground';

/**
 * Enum value 'terminate' for attribute {@link ATTR_IOS_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const IOS_STATE_VALUES_TERMINATE = 'terminate';

/**
 * Enum value 'created' for attribute {@link ATTR_ANDROID_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_STATE_VALUES_CREATED = 'created';

/**
 * Enum value 'background' for attribute {@link ATTR_ANDROID_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_STATE_VALUES_BACKGROUND = 'background';

/**
 * Enum value 'foreground' for attribute {@link ATTR_ANDROID_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ANDROID_STATE_VALUES_FOREGROUND = 'foreground';

/**
 * Enum value 'idle' for attribute {@link ATTR_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const STATE_VALUES_IDLE = 'idle';

/**
 * Enum value 'used' for attribute {@link ATTR_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const STATE_VALUES_USED = 'used';

/**
 * Enum value 'system' for attribute {@link ATTR_PROCESS_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const PROCESS_CPU_STATE_VALUES_SYSTEM = 'system';

/**
 * Enum value 'user' for attribute {@link ATTR_PROCESS_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const PROCESS_CPU_STATE_VALUES_USER = 'user';

/**
 * Enum value 'wait' for attribute {@link ATTR_PROCESS_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const PROCESS_CPU_STATE_VALUES_WAIT = 'wait';

/**
 * Enum value 'voluntary' for attribute {@link ATTR_PROCESS_CONTEXT_SWITCH_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const PROCESS_CONTEXT_SWITCH_TYPE_VALUES_VOLUNTARY = 'voluntary';

/**
 * Enum value 'involuntary' for attribute {@link ATTR_PROCESS_CONTEXT_SWITCH_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const PROCESS_CONTEXT_SWITCH_TYPE_VALUES_INVOLUNTARY = 'involuntary';

/**
 * Enum value 'major' for attribute {@link ATTR_PROCESS_PAGING_FAULT_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const PROCESS_PAGING_FAULT_TYPE_VALUES_MAJOR = 'major';

/**
 * Enum value 'minor' for attribute {@link ATTR_PROCESS_PAGING_FAULT_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const PROCESS_PAGING_FAULT_TYPE_VALUES_MINOR = 'minor';

/**
 * Enum value 'user' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_CPU_STATE_VALUES_USER = 'user';

/**
 * Enum value 'system' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_CPU_STATE_VALUES_SYSTEM = 'system';

/**
 * Enum value 'nice' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_CPU_STATE_VALUES_NICE = 'nice';

/**
 * Enum value 'idle' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_CPU_STATE_VALUES_IDLE = 'idle';

/**
 * Enum value 'iowait' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_CPU_STATE_VALUES_IOWAIT = 'iowait';

/**
 * Enum value 'interrupt' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_CPU_STATE_VALUES_INTERRUPT = 'interrupt';

/**
 * Enum value 'steal' for attribute {@link ATTR_SYSTEM_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_CPU_STATE_VALUES_STEAL = 'steal';

/**
 * Enum value 'used' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_MEMORY_STATE_VALUES_USED = 'used';

/**
 * Enum value 'free' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_MEMORY_STATE_VALUES_FREE = 'free';

/**
 * Enum value 'shared' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_MEMORY_STATE_VALUES_SHARED = 'shared';

/**
 * Enum value 'buffers' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_MEMORY_STATE_VALUES_BUFFERS = 'buffers';

/**
 * Enum value 'cached' for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_MEMORY_STATE_VALUES_CACHED = 'cached';

/**
 * Enum value 'in' for attribute {@link ATTR_SYSTEM_PAGING_DIRECTION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PAGING_DIRECTION_VALUES_IN = 'in';

/**
 * Enum value 'out' for attribute {@link ATTR_SYSTEM_PAGING_DIRECTION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PAGING_DIRECTION_VALUES_OUT = 'out';

/**
 * Enum value 'used' for attribute {@link ATTR_SYSTEM_PAGING_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PAGING_STATE_VALUES_USED = 'used';

/**
 * Enum value 'free' for attribute {@link ATTR_SYSTEM_PAGING_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PAGING_STATE_VALUES_FREE = 'free';

/**
 * Enum value 'major' for attribute {@link ATTR_SYSTEM_PAGING_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PAGING_TYPE_VALUES_MAJOR = 'major';

/**
 * Enum value 'minor' for attribute {@link ATTR_SYSTEM_PAGING_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PAGING_TYPE_VALUES_MINOR = 'minor';

/**
 * Enum value 'used' for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_STATE_VALUES_USED = 'used';

/**
 * Enum value 'free' for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_STATE_VALUES_FREE = 'free';

/**
 * Enum value 'reserved' for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_STATE_VALUES_RESERVED = 'reserved';

/**
 * Enum value 'fat32' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_TYPE_VALUES_FAT32 = 'fat32';

/**
 * Enum value 'exfat' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_TYPE_VALUES_EXFAT = 'exfat';

/**
 * Enum value 'ntfs' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_TYPE_VALUES_NTFS = 'ntfs';

/**
 * Enum value 'refs' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_TYPE_VALUES_REFS = 'refs';

/**
 * Enum value 'hfsplus' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_TYPE_VALUES_HFSPLUS = 'hfsplus';

/**
 * Enum value 'ext4' for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_FILESYSTEM_TYPE_VALUES_EXT4 = 'ext4';

/**
 * Enum value 'close' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_CLOSE = 'close';

/**
 * Enum value 'close_wait' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_CLOSE_WAIT = 'close_wait';

/**
 * Enum value 'closing' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_CLOSING = 'closing';

/**
 * Enum value 'delete' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_DELETE = 'delete';

/**
 * Enum value 'established' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_ESTABLISHED = 'established';

/**
 * Enum value 'fin_wait_1' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_FIN_WAIT_1 = 'fin_wait_1';

/**
 * Enum value 'fin_wait_2' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_FIN_WAIT_2 = 'fin_wait_2';

/**
 * Enum value 'last_ack' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_LAST_ACK = 'last_ack';

/**
 * Enum value 'listen' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_LISTEN = 'listen';

/**
 * Enum value 'syn_recv' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_SYN_RECV = 'syn_recv';

/**
 * Enum value 'syn_sent' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_SYN_SENT = 'syn_sent';

/**
 * Enum value 'time_wait' for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_NETWORK_STATE_VALUES_TIME_WAIT = 'time_wait';

/**
 * Enum value 'running' for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PROCESS_STATUS_VALUES_RUNNING = 'running';

/**
 * Enum value 'sleeping' for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PROCESS_STATUS_VALUES_SLEEPING = 'sleeping';

/**
 * Enum value 'stopped' for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PROCESS_STATUS_VALUES_STOPPED = 'stopped';

/**
 * Enum value 'defunct' for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const SYSTEM_PROCESS_STATUS_VALUES_DEFUNCT = 'defunct';

/**
 * Enum value 'alibaba_cloud_ecs' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_ALIBABA_CLOUD_ECS = 'alibaba_cloud_ecs';

/**
 * Enum value 'alibaba_cloud_fc' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_ALIBABA_CLOUD_FC = 'alibaba_cloud_fc';

/**
 * Enum value 'alibaba_cloud_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_ALIBABA_CLOUD_OPENSHIFT =
  'alibaba_cloud_openshift';

/**
 * Enum value 'aws_ec2' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AWS_EC2 = 'aws_ec2';

/**
 * Enum value 'aws_ecs' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AWS_ECS = 'aws_ecs';

/**
 * Enum value 'aws_eks' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AWS_EKS = 'aws_eks';

/**
 * Enum value 'aws_lambda' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AWS_LAMBDA = 'aws_lambda';

/**
 * Enum value 'aws_elastic_beanstalk' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AWS_ELASTIC_BEANSTALK =
  'aws_elastic_beanstalk';

/**
 * Enum value 'aws_app_runner' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AWS_APP_RUNNER = 'aws_app_runner';

/**
 * Enum value 'aws_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AWS_OPENSHIFT = 'aws_openshift';

/**
 * Enum value 'azure_vm' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AZURE_VM = 'azure_vm';

/**
 * Enum value 'azure_container_apps' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AZURE_CONTAINER_APPS =
  'azure_container_apps';

/**
 * Enum value 'azure_container_instances' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AZURE_CONTAINER_INSTANCES =
  'azure_container_instances';

/**
 * Enum value 'azure_aks' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AZURE_AKS = 'azure_aks';

/**
 * Enum value 'azure_functions' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AZURE_FUNCTIONS = 'azure_functions';

/**
 * Enum value 'azure_app_service' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AZURE_APP_SERVICE = 'azure_app_service';

/**
 * Enum value 'azure_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_AZURE_OPENSHIFT = 'azure_openshift';

/**
 * Enum value 'gcp_bare_metal_solution' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_GCP_BARE_METAL_SOLUTION =
  'gcp_bare_metal_solution';

/**
 * Enum value 'gcp_compute_engine' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_GCP_COMPUTE_ENGINE = 'gcp_compute_engine';

/**
 * Enum value 'gcp_cloud_run' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_GCP_CLOUD_RUN = 'gcp_cloud_run';

/**
 * Enum value 'gcp_kubernetes_engine' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_GCP_KUBERNETES_ENGINE =
  'gcp_kubernetes_engine';

/**
 * Enum value 'gcp_cloud_functions' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_GCP_CLOUD_FUNCTIONS = 'gcp_cloud_functions';

/**
 * Enum value 'gcp_app_engine' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_GCP_APP_ENGINE = 'gcp_app_engine';

/**
 * Enum value 'gcp_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_GCP_OPENSHIFT = 'gcp_openshift';

/**
 * Enum value 'ibm_cloud_openshift' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_IBM_CLOUD_OPENSHIFT = 'ibm_cloud_openshift';

/**
 * Enum value 'tencent_cloud_cvm' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_TENCENT_CLOUD_CVM = 'tencent_cloud_cvm';

/**
 * Enum value 'tencent_cloud_eks' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_TENCENT_CLOUD_EKS = 'tencent_cloud_eks';

/**
 * Enum value 'tencent_cloud_scf' for attribute {@link ATTR_CLOUD_PLATFORM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PLATFORM_VALUES_TENCENT_CLOUD_SCF = 'tencent_cloud_scf';

/**
 * Enum value 'alibaba_cloud' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PROVIDER_VALUES_ALIBABA_CLOUD = 'alibaba_cloud';

/**
 * Enum value 'aws' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PROVIDER_VALUES_AWS = 'aws';

/**
 * Enum value 'azure' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PROVIDER_VALUES_AZURE = 'azure';

/**
 * Enum value 'gcp' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PROVIDER_VALUES_GCP = 'gcp';

/**
 * Enum value 'heroku' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PROVIDER_VALUES_HEROKU = 'heroku';

/**
 * Enum value 'ibm_cloud' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PROVIDER_VALUES_IBM_CLOUD = 'ibm_cloud';

/**
 * Enum value 'tencent_cloud' for attribute {@link ATTR_CLOUD_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CLOUD_PROVIDER_VALUES_TENCENT_CLOUD = 'tencent_cloud';

/**
 * Enum value 'user' for attribute {@link ATTR_CONTAINER_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CONTAINER_CPU_STATE_VALUES_USER = 'user';

/**
 * Enum value 'system' for attribute {@link ATTR_CONTAINER_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CONTAINER_CPU_STATE_VALUES_SYSTEM = 'system';

/**
 * Enum value 'kernel' for attribute {@link ATTR_CONTAINER_CPU_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const CONTAINER_CPU_STATE_VALUES_KERNEL = 'kernel';

/**
 * Enum value 'all' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_ALL = 'all';

/**
 * Enum value 'each_quorum' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_EACH_QUORUM = 'each_quorum';

/**
 * Enum value 'quorum' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_QUORUM = 'quorum';

/**
 * Enum value 'local_quorum' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_LOCAL_QUORUM =
  'local_quorum';

/**
 * Enum value 'one' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_ONE = 'one';

/**
 * Enum value 'two' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_TWO = 'two';

/**
 * Enum value 'three' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_THREE = 'three';

/**
 * Enum value 'local_one' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_LOCAL_ONE = 'local_one';

/**
 * Enum value 'any' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_ANY = 'any';

/**
 * Enum value 'serial' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_SERIAL = 'serial';

/**
 * Enum value 'local_serial' for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_CASSANDRA_CONSISTENCY_LEVEL_VALUES_LOCAL_SERIAL =
  'local_serial';

/**
 * Enum value 'gateway' for attribute {@link ATTR_DB_COSMOSDB_CONNECTION_MODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_CONNECTION_MODE_VALUES_GATEWAY = 'gateway';

/**
 * Enum value 'direct' for attribute {@link ATTR_DB_COSMOSDB_CONNECTION_MODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_CONNECTION_MODE_VALUES_DIRECT = 'direct';

/**
 * Enum value 'Invalid' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_INVALID = 'Invalid';

/**
 * Enum value 'Create' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_CREATE = 'Create';

/**
 * Enum value 'Patch' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_PATCH = 'Patch';

/**
 * Enum value 'Read' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_READ = 'Read';

/**
 * Enum value 'ReadFeed' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_READ_FEED = 'ReadFeed';

/**
 * Enum value 'Delete' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_DELETE = 'Delete';

/**
 * Enum value 'Replace' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_REPLACE = 'Replace';

/**
 * Enum value 'Execute' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_EXECUTE = 'Execute';

/**
 * Enum value 'Query' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_QUERY = 'Query';

/**
 * Enum value 'Head' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_HEAD = 'Head';

/**
 * Enum value 'HeadFeed' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_HEAD_FEED = 'HeadFeed';

/**
 * Enum value 'Upsert' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_UPSERT = 'Upsert';

/**
 * Enum value 'Batch' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_BATCH = 'Batch';

/**
 * Enum value 'QueryPlan' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_QUERY_PLAN = 'QueryPlan';

/**
 * Enum value 'ExecuteJavaScript' for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_COSMOSDB_OPERATION_TYPE_VALUES_EXECUTE_JAVASCRIPT =
  'ExecuteJavaScript';

/**
 * Enum value 'other_sql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_OTHER_SQL = 'other_sql';

/**
 * Enum value 'mssql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_MSSQL = 'mssql';

/**
 * Enum value 'mssqlcompact' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_MSSQLCOMPACT = 'mssqlcompact';

/**
 * Enum value 'mysql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_MYSQL = 'mysql';

/**
 * Enum value 'oracle' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_ORACLE = 'oracle';

/**
 * Enum value 'db2' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_DB2 = 'db2';

/**
 * Enum value 'postgresql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_POSTGRESQL = 'postgresql';

/**
 * Enum value 'redshift' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_REDSHIFT = 'redshift';

/**
 * Enum value 'hive' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_HIVE = 'hive';

/**
 * Enum value 'cloudscape' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_CLOUDSCAPE = 'cloudscape';

/**
 * Enum value 'hsqldb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_HSQLDB = 'hsqldb';

/**
 * Enum value 'progress' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_PROGRESS = 'progress';

/**
 * Enum value 'maxdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_MAXDB = 'maxdb';

/**
 * Enum value 'hanadb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_HANADB = 'hanadb';

/**
 * Enum value 'ingres' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_INGRES = 'ingres';

/**
 * Enum value 'firstsql' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_FIRSTSQL = 'firstsql';

/**
 * Enum value 'edb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_EDB = 'edb';

/**
 * Enum value 'cache' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_CACHE = 'cache';

/**
 * Enum value 'adabas' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_ADABAS = 'adabas';

/**
 * Enum value 'firebird' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_FIREBIRD = 'firebird';

/**
 * Enum value 'derby' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_DERBY = 'derby';

/**
 * Enum value 'filemaker' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_FILEMAKER = 'filemaker';

/**
 * Enum value 'informix' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_INFORMIX = 'informix';

/**
 * Enum value 'instantdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_INSTANTDB = 'instantdb';

/**
 * Enum value 'interbase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_INTERBASE = 'interbase';

/**
 * Enum value 'mariadb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_MARIADB = 'mariadb';

/**
 * Enum value 'netezza' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_NETEZZA = 'netezza';

/**
 * Enum value 'pervasive' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_PERVASIVE = 'pervasive';

/**
 * Enum value 'pointbase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_POINTBASE = 'pointbase';

/**
 * Enum value 'sqlite' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_SQLITE = 'sqlite';

/**
 * Enum value 'sybase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_SYBASE = 'sybase';

/**
 * Enum value 'teradata' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_TERADATA = 'teradata';

/**
 * Enum value 'vertica' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_VERTICA = 'vertica';

/**
 * Enum value 'h2' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_H2 = 'h2';

/**
 * Enum value 'coldfusion' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_COLDFUSION = 'coldfusion';

/**
 * Enum value 'cassandra' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_CASSANDRA = 'cassandra';

/**
 * Enum value 'hbase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_HBASE = 'hbase';

/**
 * Enum value 'mongodb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_MONGODB = 'mongodb';

/**
 * Enum value 'redis' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_REDIS = 'redis';

/**
 * Enum value 'couchbase' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_COUCHBASE = 'couchbase';

/**
 * Enum value 'couchdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_COUCHDB = 'couchdb';

/**
 * Enum value 'cosmosdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_COSMOSDB = 'cosmosdb';

/**
 * Enum value 'dynamodb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_DYNAMODB = 'dynamodb';

/**
 * Enum value 'neo4j' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_NEO4J = 'neo4j';

/**
 * Enum value 'geode' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_GEODE = 'geode';

/**
 * Enum value 'elasticsearch' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_ELASTICSEARCH = 'elasticsearch';

/**
 * Enum value 'memcached' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_MEMCACHED = 'memcached';

/**
 * Enum value 'cockroachdb' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_COCKROACHDB = 'cockroachdb';

/**
 * Enum value 'opensearch' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_OPENSEARCH = 'opensearch';

/**
 * Enum value 'clickhouse' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_CLICKHOUSE = 'clickhouse';

/**
 * Enum value 'spanner' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_SPANNER = 'spanner';

/**
 * Enum value 'trino' for attribute {@link ATTR_DB_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DB_SYSTEM_VALUES_TRINO = 'trino';

/**
 * Enum value '1.0' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTP_FLAVOR_VALUES_HTTP_1_0 = '1.0';

/**
 * Enum value '1.1' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTP_FLAVOR_VALUES_HTTP_1_1 = '1.1';

/**
 * Enum value '2.0' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTP_FLAVOR_VALUES_HTTP_2_0 = '2.0';

/**
 * Enum value '3.0' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTP_FLAVOR_VALUES_HTTP_3_0 = '3.0';

/**
 * Enum value 'SPDY' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTP_FLAVOR_VALUES_SPDY = 'SPDY';

/**
 * Enum value 'QUIC' for attribute {@link ATTR_HTTP_FLAVOR}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTP_FLAVOR_VALUES_QUIC = 'QUIC';

/**
 * Enum value 'inet' for attribute {@link ATTR_NET_SOCK_FAMILY}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const NET_SOCK_FAMILY_VALUES_INET = 'inet';

/**
 * Enum value 'inet6' for attribute {@link ATTR_NET_SOCK_FAMILY}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const NET_SOCK_FAMILY_VALUES_INET6 = 'inet6';

/**
 * Enum value 'unix' for attribute {@link ATTR_NET_SOCK_FAMILY}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const NET_SOCK_FAMILY_VALUES_UNIX = 'unix';

/**
 * Enum value 'ip_tcp' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NET_TRANSPORT_VALUES_IP_TCP = 'ip_tcp';

/**
 * Enum value 'ip_udp' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NET_TRANSPORT_VALUES_IP_UDP = 'ip_udp';

/**
 * Enum value 'pipe' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NET_TRANSPORT_VALUES_PIPE = 'pipe';

/**
 * Enum value 'inproc' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NET_TRANSPORT_VALUES_INPROC = 'inproc';

/**
 * Enum value 'other' for attribute {@link ATTR_NET_TRANSPORT}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NET_TRANSPORT_VALUES_OTHER = 'other';

/**
 * Enum value 'running' for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SYSTEM_PROCESSES_STATUS_VALUES_RUNNING = 'running';

/**
 * Enum value 'sleeping' for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SYSTEM_PROCESSES_STATUS_VALUES_SLEEPING = 'sleeping';

/**
 * Enum value 'stopped' for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SYSTEM_PROCESSES_STATUS_VALUES_STOPPED = 'stopped';

/**
 * Enum value 'defunct' for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SYSTEM_PROCESSES_STATUS_VALUES_DEFUNCT = 'defunct';

/**
 * Enum value 'read' for attribute {@link ATTR_DISK_IO_DIRECTION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DISK_IO_DIRECTION_VALUES_READ = 'read';

/**
 * Enum value 'write' for attribute {@link ATTR_DISK_IO_DIRECTION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const DISK_IO_DIRECTION_VALUES_WRITE = 'write';

/**
 * Enum value 'insert' for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_DOCUMENT_OPERATION_VALUES_INSERT = 'insert';

/**
 * Enum value 'edit' for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_DOCUMENT_OPERATION_VALUES_EDIT = 'edit';

/**
 * Enum value 'delete' for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_DOCUMENT_OPERATION_VALUES_DELETE = 'delete';

/**
 * Enum value 'alibaba_cloud' for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_INVOKED_PROVIDER_VALUES_ALIBABA_CLOUD = 'alibaba_cloud';

/**
 * Enum value 'aws' for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_INVOKED_PROVIDER_VALUES_AWS = 'aws';

/**
 * Enum value 'azure' for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_INVOKED_PROVIDER_VALUES_AZURE = 'azure';

/**
 * Enum value 'gcp' for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_INVOKED_PROVIDER_VALUES_GCP = 'gcp';

/**
 * Enum value 'tencent_cloud' for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_INVOKED_PROVIDER_VALUES_TENCENT_CLOUD = 'tencent_cloud';

/**
 * Enum value 'datasource' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_TRIGGER_VALUES_DATASOURCE = 'datasource';

/**
 * Enum value 'http' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_TRIGGER_VALUES_HTTP = 'http';

/**
 * Enum value 'pubsub' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_TRIGGER_VALUES_PUBSUB = 'pubsub';

/**
 * Enum value 'timer' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_TRIGGER_VALUES_TIMER = 'timer';

/**
 * Enum value 'other' for attribute {@link ATTR_FAAS_TRIGGER}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const FAAS_TRIGGER_VALUES_OTHER = 'other';

/**
 * Enum value 'amd64' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HOST_ARCH_VALUES_AMD64 = 'amd64';

/**
 * Enum value 'arm32' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HOST_ARCH_VALUES_ARM32 = 'arm32';

/**
 * Enum value 'arm64' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HOST_ARCH_VALUES_ARM64 = 'arm64';

/**
 * Enum value 'ia64' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HOST_ARCH_VALUES_IA64 = 'ia64';

/**
 * Enum value 'ppc32' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HOST_ARCH_VALUES_PPC32 = 'ppc32';

/**
 * Enum value 'ppc64' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HOST_ARCH_VALUES_PPC64 = 'ppc64';

/**
 * Enum value 's390x' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HOST_ARCH_VALUES_S390X = 's390x';

/**
 * Enum value 'x86' for attribute {@link ATTR_HOST_ARCH}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HOST_ARCH_VALUES_X86 = 'x86';

/**
 * Enum value 'active' for attribute {@link ATTR_HTTP_CONNECTION_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HTTP_CONNECTION_STATE_VALUES_ACTIVE = 'active';

/**
 * Enum value 'idle' for attribute {@link ATTR_HTTP_CONNECTION_STATE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const HTTP_CONNECTION_STATE_VALUES_IDLE = 'idle';

/**
 * Enum value 'publish' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_OPERATION_VALUES_PUBLISH = 'publish';

/**
 * Enum value 'create' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_OPERATION_VALUES_CREATE = 'create';

/**
 * Enum value 'receive' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_OPERATION_VALUES_RECEIVE = 'receive';

/**
 * Enum value 'process' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_OPERATION_VALUES_DELIVER = 'process';

/**
 * Enum value 'settle' for attribute {@link ATTR_MESSAGING_OPERATION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_OPERATION_VALUES_SETTLE = 'settle';

/**
 * Enum value 'clustering' for attribute {@link ATTR_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_ROCKETMQ_CONSUMPTION_MODEL_VALUES_CLUSTERING =
  'clustering';

/**
 * Enum value 'broadcasting' for attribute {@link ATTR_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_ROCKETMQ_CONSUMPTION_MODEL_VALUES_BROADCASTING =
  'broadcasting';

/**
 * Enum value 'normal' for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUES_NORMAL = 'normal';

/**
 * Enum value 'fifo' for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUES_FIFO = 'fifo';

/**
 * Enum value 'delay' for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUES_DELAY = 'delay';

/**
 * Enum value 'transaction' for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUES_TRANSACTION = 'transaction';

/**
 * Enum value 'complete' for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SERVICEBUS_DISPOSITION_STATUS_VALUES_COMPLETE =
  'complete';

/**
 * Enum value 'abandon' for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SERVICEBUS_DISPOSITION_STATUS_VALUES_ABANDON = 'abandon';

/**
 * Enum value 'dead_letter' for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SERVICEBUS_DISPOSITION_STATUS_VALUES_DEAD_LETTER =
  'dead_letter';

/**
 * Enum value 'defer' for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SERVICEBUS_DISPOSITION_STATUS_VALUES_DEFER = 'defer';

/**
 * Enum value 'activemq' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_ACTIVEMQ = 'activemq';

/**
 * Enum value 'aws_sqs' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_AWS_SQS = 'aws_sqs';

/**
 * Enum value 'eventgrid' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_EVENTGRID = 'eventgrid';

/**
 * Enum value 'eventhubs' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_EVENTHUBS = 'eventhubs';

/**
 * Enum value 'servicebus' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_SERVICEBUS = 'servicebus';

/**
 * Enum value 'gcp_pubsub' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_GCP_PUBSUB = 'gcp_pubsub';

/**
 * Enum value 'jms' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_JMS = 'jms';

/**
 * Enum value 'kafka' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_KAFKA = 'kafka';

/**
 * Enum value 'rabbitmq' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_RABBITMQ = 'rabbitmq';

/**
 * Enum value 'rocketmq' for attribute {@link ATTR_MESSAGING_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGING_SYSTEM_VALUES_ROCKETMQ = 'rocketmq';

/**
 * Enum value 'gprs' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_GPRS = 'gprs';

/**
 * Enum value 'edge' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_EDGE = 'edge';

/**
 * Enum value 'umts' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_UMTS = 'umts';

/**
 * Enum value 'cdma' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_CDMA = 'cdma';

/**
 * Enum value 'evdo_0' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_EVDO_0 = 'evdo_0';

/**
 * Enum value 'evdo_a' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_EVDO_A = 'evdo_a';

/**
 * Enum value 'cdma2000_1xrtt' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_CDMA2000_1XRTT =
  'cdma2000_1xrtt';

/**
 * Enum value 'hsdpa' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_HSDPA = 'hsdpa';

/**
 * Enum value 'hsupa' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_HSUPA = 'hsupa';

/**
 * Enum value 'hspa' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_HSPA = 'hspa';

/**
 * Enum value 'iden' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_IDEN = 'iden';

/**
 * Enum value 'evdo_b' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_EVDO_B = 'evdo_b';

/**
 * Enum value 'lte' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_LTE = 'lte';

/**
 * Enum value 'ehrpd' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_EHRPD = 'ehrpd';

/**
 * Enum value 'hspap' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_HSPAP = 'hspap';

/**
 * Enum value 'gsm' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_GSM = 'gsm';

/**
 * Enum value 'td_scdma' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_TD_SCDMA = 'td_scdma';

/**
 * Enum value 'iwlan' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_IWLAN = 'iwlan';

/**
 * Enum value 'nr' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_NR = 'nr';

/**
 * Enum value 'nrnsa' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_NRNSA = 'nrnsa';

/**
 * Enum value 'lte_ca' for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_SUBTYPE_VALUES_LTE_CA = 'lte_ca';

/**
 * Enum value 'wifi' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_TYPE_VALUES_WIFI = 'wifi';

/**
 * Enum value 'wired' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_TYPE_VALUES_WIRED = 'wired';

/**
 * Enum value 'cell' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_TYPE_VALUES_CELL = 'cell';

/**
 * Enum value 'unavailable' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_TYPE_VALUES_UNAVAILABLE = 'unavailable';

/**
 * Enum value 'unknown' for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_CONNECTION_TYPE_VALUES_UNKNOWN = 'unknown';

/**
 * Enum value 'transmit' for attribute {@link ATTR_NETWORK_IO_DIRECTION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_IO_DIRECTION_VALUES_TRANSMIT = 'transmit';

/**
 * Enum value 'receive' for attribute {@link ATTR_NETWORK_IO_DIRECTION}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const NETWORK_IO_DIRECTION_VALUES_RECEIVE = 'receive';

/**
 * Enum value 'windows' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_WINDOWS = 'windows';

/**
 * Enum value 'linux' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_LINUX = 'linux';

/**
 * Enum value 'darwin' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_DARWIN = 'darwin';

/**
 * Enum value 'freebsd' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_FREEBSD = 'freebsd';

/**
 * Enum value 'netbsd' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_NETBSD = 'netbsd';

/**
 * Enum value 'openbsd' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_OPENBSD = 'openbsd';

/**
 * Enum value 'dragonflybsd' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_DRAGONFLYBSD = 'dragonflybsd';

/**
 * Enum value 'hpux' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_HPUX = 'hpux';

/**
 * Enum value 'aix' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_AIX = 'aix';

/**
 * Enum value 'solaris' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_SOLARIS = 'solaris';

/**
 * Enum value 'z_os' for attribute {@link ATTR_OS_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OS_TYPE_VALUES_Z_OS = 'z_os';

/**
 * Enum value 'cancelled' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_CANCELLED = 'cancelled';

/**
 * Enum value 'unknown' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_UNKNOWN = 'unknown';

/**
 * Enum value 'invalid_argument' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_INVALID_ARGUMENT =
  'invalid_argument';

/**
 * Enum value 'deadline_exceeded' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_DEADLINE_EXCEEDED =
  'deadline_exceeded';

/**
 * Enum value 'not_found' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_NOT_FOUND = 'not_found';

/**
 * Enum value 'already_exists' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_ALREADY_EXISTS =
  'already_exists';

/**
 * Enum value 'permission_denied' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_PERMISSION_DENIED =
  'permission_denied';

/**
 * Enum value 'resource_exhausted' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_RESOURCE_EXHAUSTED =
  'resource_exhausted';

/**
 * Enum value 'failed_precondition' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_FAILED_PRECONDITION =
  'failed_precondition';

/**
 * Enum value 'aborted' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_ABORTED = 'aborted';

/**
 * Enum value 'out_of_range' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_OUT_OF_RANGE = 'out_of_range';

/**
 * Enum value 'unimplemented' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_UNIMPLEMENTED = 'unimplemented';

/**
 * Enum value 'internal' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_INTERNAL = 'internal';

/**
 * Enum value 'unavailable' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_UNAVAILABLE = 'unavailable';

/**
 * Enum value 'data_loss' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_DATA_LOSS = 'data_loss';

/**
 * Enum value 'unauthenticated' for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_CONNECT_RPC_ERROR_CODE_VALUES_UNAUTHENTICATED =
  'unauthenticated';

/**
 * Enum value 0 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_OK = 0;

/**
 * Enum value 1 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_CANCELLED = 1;

/**
 * Enum value 2 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_UNKNOWN = 2;

/**
 * Enum value 3 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_INVALID_ARGUMENT = 3;

/**
 * Enum value 4 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_DEADLINE_EXCEEDED = 4;

/**
 * Enum value 5 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_NOT_FOUND = 5;

/**
 * Enum value 6 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_ALREADY_EXISTS = 6;

/**
 * Enum value 7 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_PERMISSION_DENIED = 7;

/**
 * Enum value 8 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_RESOURCE_EXHAUSTED = 8;

/**
 * Enum value 9 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_FAILED_PRECONDITION = 9;

/**
 * Enum value 10 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_ABORTED = 10;

/**
 * Enum value 11 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_OUT_OF_RANGE = 11;

/**
 * Enum value 12 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_UNIMPLEMENTED = 12;

/**
 * Enum value 13 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_INTERNAL = 13;

/**
 * Enum value 14 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_UNAVAILABLE = 14;

/**
 * Enum value 15 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_DATA_LOSS = 15;

/**
 * Enum value 16 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_GRPC_STATUS_CODE_VALUES_UNAUTHENTICATED = 16;

/**
 * Enum value 'grpc' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_SYSTEM_VALUES_GRPC = 'grpc';

/**
 * Enum value 'java_rmi' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_SYSTEM_VALUES_JAVA_RMI = 'java_rmi';

/**
 * Enum value 'dotnet_wcf' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_SYSTEM_VALUES_DOTNET_WCF = 'dotnet_wcf';

/**
 * Enum value 'apache_dubbo' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_SYSTEM_VALUES_APACHE_DUBBO = 'apache_dubbo';

/**
 * Enum value 'connect_rpc' for attribute {@link ATTR_RPC_SYSTEM}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const RPC_SYSTEM_VALUES_CONNECT_RPC = 'connect_rpc';

/**
 * Enum value 'ssl' for attribute {@link ATTR_TLS_PROTOCOL_NAME}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const TLS_PROTOCOL_NAME_VALUES_SSL = 'ssl';

/**
 * Enum value 'tls' for attribute {@link ATTR_TLS_PROTOCOL_NAME}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const TLS_PROTOCOL_NAME_VALUES_TLS = 'tls';

/**
 * Enum value 'ec2' for attribute {@link ATTR_AWS_ECS_LAUNCHTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const AWS_ECS_LAUNCHTYPE_VALUES_EC2 = 'ec2';

/**
 * Enum value 'fargate' for attribute {@link ATTR_AWS_ECS_LAUNCHTYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const AWS_ECS_LAUNCHTYPE_VALUES_FARGATE = 'fargate';

/**
 * Enum value 'child_of' for attribute {@link ATTR_OPENTRACING_REF_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OPENTRACING_REF_TYPE_VALUES_CHILD_OF = 'child_of';

/**
 * Enum value 'follows_from' for attribute {@link ATTR_OPENTRACING_REF_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OPENTRACING_REF_TYPE_VALUES_FOLLOWS_FROM = 'follows_from';

/**
 * Enum value 'query' for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const GRAPHQL_OPERATION_TYPE_VALUES_QUERY = 'query';

/**
 * Enum value 'mutation' for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const GRAPHQL_OPERATION_TYPE_VALUES_MUTATION = 'mutation';

/**
 * Enum value 'subscription' for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const GRAPHQL_OPERATION_TYPE_VALUES_SUBSCRIPTION = 'subscription';

/**
 * Enum value 'SENT' for attribute {@link ATTR_MESSAGE_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGE_TYPE_VALUES_SENT = 'SENT';

/**
 * Enum value 'RECEIVED' for attribute {@link ATTR_MESSAGE_TYPE}.
 *
 * @experimental this attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const MESSAGE_TYPE_VALUES_RECEIVED = 'RECEIVED';
