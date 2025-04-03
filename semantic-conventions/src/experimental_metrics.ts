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
 * Number of active client instances
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_AZURE_COSMOSDB_CLIENT_ACTIVE_INSTANCE_COUNT = 'azure.cosmosdb.client.active_instance.count' as const;

/**
 * [Request units](https://learn.microsoft.com/azure/cosmos-db/request-units) consumed by the operation
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_AZURE_COSMOSDB_CLIENT_OPERATION_REQUEST_CHARGE = 'azure.cosmosdb.client.operation.request_charge' as const;

/**
 * The number of pipeline runs currently active in the system by state.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CICD_PIPELINE_RUN_ACTIVE = 'cicd.pipeline.run.active' as const;

/**
 * Duration of a pipeline run grouped by pipeline, state and result.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CICD_PIPELINE_RUN_DURATION = 'cicd.pipeline.run.duration' as const;

/**
 * The number of errors encountered in pipeline runs (eg. compile, test failures).
 *
 * @note There might be errors in a pipeline run that are non fatal (eg. they are suppressed) or in a parallel stage multiple stages could have a fatal error.
 * This means that this error count might not be the same as the count of metric `cicd.pipeline.run.duration` with run result `failure`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CICD_PIPELINE_RUN_ERRORS = 'cicd.pipeline.run.errors' as const;

/**
 * The number of errors in a component of the CICD system (eg. controller, scheduler, agent).
 *
 * @note Errors in pipeline run execution are explicitly excluded. Ie a test failure is not counted in this metric.
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CICD_SYSTEM_ERRORS = 'cicd.system.errors' as const;

/**
 * The number of workers on the CICD system by state.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CICD_WORKER_COUNT = 'cicd.worker.count' as const;

/**
 * Total CPU time consumed
 *
 * @note Total CPU time consumed by the specific container on all available CPU cores
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_CPU_TIME = 'container.cpu.time' as const;

/**
 * Container's CPU usage, measured in cpus. Range from 0 to the number of allocatable CPUs
 *
 * @note CPU usage of the specific container on all available CPU cores, averaged over the sample window
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_CPU_USAGE = 'container.cpu.usage' as const;

/**
 * Disk bytes for the container.
 *
 * @note The total number of bytes read/written successfully (aggregated from all disks).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_DISK_IO = 'container.disk.io' as const;

/**
 * Memory usage of the container.
 *
 * @note Memory usage of the container.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_MEMORY_USAGE = 'container.memory.usage' as const;

/**
 * Network bytes for the container.
 *
 * @note The number of bytes sent/received on all network interfaces by the container.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_NETWORK_IO = 'container.network.io' as const;

/**
 * The time the container has been running
 *
 * @note Instrumentations **SHOULD** use a gauge with type `double` and measure uptime in seconds as a floating point number with the highest precision available.
 * The actual accuracy would depend on the instrumentation and operating system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_UPTIME = 'container.uptime' as const;

/**
 * The number of connections that are currently in state described by the `state` attribute
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_COUNT = 'db.client.connection.count' as const;

/**
 * The time it took to create a new connection
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_CREATE_TIME = 'db.client.connection.create_time' as const;

/**
 * The maximum number of idle open connections allowed
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_IDLE_MAX = 'db.client.connection.idle.max' as const;

/**
 * The minimum number of idle open connections allowed
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_IDLE_MIN = 'db.client.connection.idle.min' as const;

/**
 * The maximum number of open connections allowed
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_MAX = 'db.client.connection.max' as const;

/**
 * The number of current pending requests for an open connection
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = 'db.client.connection.pending_requests' as const;

/**
 * The number of connection timeouts that have occurred trying to obtain a connection from the pool
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_TIMEOUTS = 'db.client.connection.timeouts' as const;

/**
 * The time between borrowing a connection and returning it to the pool
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_USE_TIME = 'db.client.connection.use_time' as const;

/**
 * The time it took to obtain an open connection from the pool
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_WAIT_TIME = 'db.client.connection.wait_time' as const;

/**
 * Deprecated, use `db.client.connection.create_time` instead. Note: the unit also changed from `ms` to `s`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.create_time`. Note: the unit also changed from `ms` to `s`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_CREATE_TIME = 'db.client.connections.create_time' as const;

/**
 * Deprecated, use `db.client.connection.idle.max` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.idle.max`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_IDLE_MAX = 'db.client.connections.idle.max' as const;

/**
 * Deprecated, use `db.client.connection.idle.min` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.idle.min`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_IDLE_MIN = 'db.client.connections.idle.min' as const;

/**
 * Deprecated, use `db.client.connection.max` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.max`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_MAX = 'db.client.connections.max' as const;

/**
 * Deprecated, use `db.client.connection.pending_requests` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.pending_requests`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_PENDING_REQUESTS = 'db.client.connections.pending_requests' as const;

/**
 * Deprecated, use `db.client.connection.timeouts` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.timeouts`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_TIMEOUTS = 'db.client.connections.timeouts' as const;

/**
 * Deprecated, use `db.client.connection.count` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.count`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_USAGE = 'db.client.connections.usage' as const;

/**
 * Deprecated, use `db.client.connection.use_time` instead. Note: the unit also changed from `ms` to `s`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.use_time`. Note: the unit also changed from `ms` to `s`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_USE_TIME = 'db.client.connections.use_time' as const;

/**
 * Deprecated, use `db.client.connection.wait_time` instead. Note: the unit also changed from `ms` to `s`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.wait_time`. Note: the unit also changed from `ms` to `s`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_WAIT_TIME = 'db.client.connections.wait_time' as const;

/**
 * Deprecated, use `azure.cosmosdb.client.active_instance.count` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `azure.cosmosdb.client.active_instance.count`.
 */
export const METRIC_DB_CLIENT_COSMOSDB_ACTIVE_INSTANCE_COUNT = 'db.client.cosmosdb.active_instance.count' as const;

/**
 * Deprecated, use `azure.cosmosdb.client.operation.request_charge` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `azure.cosmosdb.client.operation.request_charge`.
 */
export const METRIC_DB_CLIENT_COSMOSDB_OPERATION_REQUEST_CHARGE = 'db.client.cosmosdb.operation.request_charge' as const;

/**
 * Duration of database client operations.
 *
 * @note Batch operations **SHOULD** be recorded as a single operation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_OPERATION_DURATION = 'db.client.operation.duration' as const;

/**
 * The actual number of records returned by the database operation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_RESPONSE_RETURNED_ROWS = 'db.client.response.returned_rows' as const;

/**
 * Measures the time taken to perform a DNS lookup.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DNS_LOOKUP_DURATION = 'dns.lookup.duration' as const;

/**
 * Number of invocation cold starts
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_COLDSTARTS = 'faas.coldstarts' as const;

/**
 * Distribution of CPU usage per invocation
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_CPU_USAGE = 'faas.cpu_usage' as const;

/**
 * Number of invocation errors
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_ERRORS = 'faas.errors' as const;

/**
 * Measures the duration of the function's initialization, such as a cold start
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INIT_DURATION = 'faas.init_duration' as const;

/**
 * Number of successful invocations
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INVOCATIONS = 'faas.invocations' as const;

/**
 * Measures the duration of the function's logic execution
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INVOKE_DURATION = 'faas.invoke_duration' as const;

/**
 * Distribution of max memory usage per invocation
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_MEM_USAGE = 'faas.mem_usage' as const;

/**
 * Distribution of net I/O usage per invocation
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_NET_IO = 'faas.net_io' as const;

/**
 * Number of invocation timeouts
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_TIMEOUTS = 'faas.timeouts' as const;

/**
 * GenAI operation duration
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_CLIENT_OPERATION_DURATION = 'gen_ai.client.operation.duration' as const;

/**
 * Measures number of input and output tokens used
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_CLIENT_TOKEN_USAGE = 'gen_ai.client.token.usage' as const;

/**
 * Generative AI server request duration such as time-to-last byte or last output token
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_SERVER_REQUEST_DURATION = 'gen_ai.server.request.duration' as const;

/**
 * Time per output token generated after the first token for successful responses
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_SERVER_TIME_PER_OUTPUT_TOKEN = 'gen_ai.server.time_per_output_token' as const;

/**
 * Time to generate first token for successful responses
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_SERVER_TIME_TO_FIRST_TOKEN = 'gen_ai.server.time_to_first_token' as const;

/**
 * Heap size target percentage configured by the user, otherwise 100.
 *
 * @note The value range is [0.0,100.0]. Computed from `/gc/gogc:percent`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_CONFIG_GOGC = 'go.config.gogc' as const;

/**
 * Count of live goroutines.
 *
 * @note Computed from `/sched/goroutines:goroutines`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_GOROUTINE_COUNT = 'go.goroutine.count' as const;

/**
 * Memory allocated to the heap by the application.
 *
 * @note Computed from `/gc/heap/allocs:bytes`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_MEMORY_ALLOCATED = 'go.memory.allocated' as const;

/**
 * Count of allocations to the heap by the application.
 *
 * @note Computed from `/gc/heap/allocs:objects`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_MEMORY_ALLOCATIONS = 'go.memory.allocations' as const;

/**
 * Heap size target for the end of the GC cycle.
 *
 * @note Computed from `/gc/heap/goal:bytes`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_MEMORY_GC_GOAL = 'go.memory.gc.goal' as const;

/**
 * Go runtime memory limit configured by the user, if a limit exists.
 *
 * @note Computed from `/gc/gomemlimit:bytes`. This metric is excluded if the limit obtained from the Go runtime is math.MaxInt64.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_MEMORY_LIMIT = 'go.memory.limit' as const;

/**
 * Memory used by the Go runtime.
 *
 * @note Computed from `(/memory/classes/total:bytes - /memory/classes/heap/released:bytes)`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_MEMORY_USED = 'go.memory.used' as const;

/**
 * The number of OS threads that can execute user-level Go code simultaneously.
 *
 * @note Computed from `/sched/gomaxprocs:threads`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_PROCESSOR_LIMIT = 'go.processor.limit' as const;

/**
 * The time goroutines have spent in the scheduler in a runnable state before actually running.
 *
 * @note Computed from `/sched/latencies:seconds`. Bucket boundaries are provided by the runtime, and are subject to change.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GO_SCHEDULE_DURATION = 'go.schedule.duration' as const;

/**
 * Number of active HTTP requests.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_ACTIVE_REQUESTS = 'http.client.active_requests' as const;

/**
 * The duration of the successfully established outbound HTTP connections.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_CONNECTION_DURATION = 'http.client.connection.duration' as const;

/**
 * Number of outbound HTTP connections that are currently active or idle on the client.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_OPEN_CONNECTIONS = 'http.client.open_connections' as const;

/**
 * Size of HTTP client request bodies.
 *
 * @note The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_REQUEST_BODY_SIZE = 'http.client.request.body.size' as const;

/**
 * Size of HTTP client response bodies.
 *
 * @note The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_CLIENT_RESPONSE_BODY_SIZE = 'http.client.response.body.size' as const;

/**
 * Number of active HTTP server requests.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_ACTIVE_REQUESTS = 'http.server.active_requests' as const;

/**
 * Size of HTTP server request bodies.
 *
 * @note The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_REQUEST_BODY_SIZE = 'http.server.request.body.size' as const;

/**
 * Size of HTTP server response bodies.
 *
 * @note The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HTTP_SERVER_RESPONSE_BODY_SIZE = 'http.server.response.body.size' as const;

/**
 * Energy consumed by the component
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_ENERGY = 'hw.energy' as const;

/**
 * Number of errors encountered by the component
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_ERRORS = 'hw.errors' as const;

/**
 * Instantaneous power consumed by the component
 *
 * @note It is recommended to report `hw.energy` instead of `hw.power` when possible.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_POWER = 'hw.power' as const;

/**
 * Operational status: `1` (true) or `0` (false) for each of the possible states
 *
 * @note `hw.status` is currently specified as an *UpDownCounter* but would ideally be represented using a [*StateSet* as defined in OpenMetrics](https://github.com/prometheus/OpenMetrics/blob/v1.0.0/specification/OpenMetrics.md#stateset). This semantic convention will be updated once *StateSet* is specified in OpenTelemetry. This planned change is not expected to have any consequence on the way users query their timeseries backend to retrieve the values of `hw.status` over time.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_STATUS = 'hw.status' as const;

/**
 * Number of buffers in the pool.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_COUNT = 'jvm.buffer.count' as const;

/**
 * Measure of total memory capacity of buffers.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_MEMORY_LIMIT = 'jvm.buffer.memory.limit' as const;

/**
 * Deprecated, use `jvm.buffer.memory.used` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `jvm.buffer.memory.used`.
 */
export const METRIC_JVM_BUFFER_MEMORY_USAGE = 'jvm.buffer.memory.usage' as const;

/**
 * Measure of memory used by buffers.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_BUFFER_MEMORY_USED = 'jvm.buffer.memory.used' as const;

/**
 * Measure of initial memory requested.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_MEMORY_INIT = 'jvm.memory.init' as const;

/**
 * Average CPU load of the whole system for the last minute as reported by the JVM.
 *
 * @note The value range is [0,n], where n is the number of CPU cores - or a negative number if the value is not available. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/java.management/java/lang/management/OperatingSystemMXBean.html#getSystemLoadAverage()).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_SYSTEM_CPU_LOAD_1M = 'jvm.system.cpu.load_1m' as const;

/**
 * Recent CPU utilization for the whole system as reported by the JVM.
 *
 * @note The value range is [0.0,1.0]. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getCpuLoad()).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_SYSTEM_CPU_UTILIZATION = 'jvm.system.cpu.utilization' as const;

/**
 * The number of actively running jobs for a cronjob
 *
 * @note This metric aligns with the `active` field of the
 * [K8s CronJobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#cronjobstatus-v1-batch).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.cronjob`](../resource/k8s.md#cronjob) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CRONJOB_ACTIVE_JOBS = 'k8s.cronjob.active_jobs' as const;

/**
 * Number of nodes that are running at least 1 daemon pod and are supposed to run the daemon pod
 *
 * @note This metric aligns with the `currentNumberScheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.daemonset`](../resource/k8s.md#daemonset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DAEMONSET_CURRENT_SCHEDULED_NODES = 'k8s.daemonset.current_scheduled_nodes' as const;

/**
 * Number of nodes that should be running the daemon pod (including nodes currently running the daemon pod)
 *
 * @note This metric aligns with the `desiredNumberScheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.daemonset`](../resource/k8s.md#daemonset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DAEMONSET_DESIRED_SCHEDULED_NODES = 'k8s.daemonset.desired_scheduled_nodes' as const;

/**
 * Number of nodes that are running the daemon pod, but are not supposed to run the daemon pod
 *
 * @note This metric aligns with the `numberMisscheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.daemonset`](../resource/k8s.md#daemonset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DAEMONSET_MISSCHEDULED_NODES = 'k8s.daemonset.misscheduled_nodes' as const;

/**
 * Number of nodes that should be running the daemon pod and have one or more of the daemon pod running and ready
 *
 * @note This metric aligns with the `numberReady` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.daemonset`](../resource/k8s.md#daemonset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DAEMONSET_READY_NODES = 'k8s.daemonset.ready_nodes' as const;

/**
 * Total number of available replica pods (ready for at least minReadySeconds) targeted by this deployment
 *
 * @note This metric aligns with the `availableReplicas` field of the
 * [K8s DeploymentStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#deploymentstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.deployment`](../resource/k8s.md#deployment) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DEPLOYMENT_AVAILABLE_PODS = 'k8s.deployment.available_pods' as const;

/**
 * Number of desired replica pods in this deployment
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s DeploymentSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#deploymentspec-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.deployment`](../resource/k8s.md#deployment) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DEPLOYMENT_DESIRED_PODS = 'k8s.deployment.desired_pods' as const;

/**
 * Current number of replica pods managed by this horizontal pod autoscaler, as last seen by the autoscaler
 *
 * @note This metric aligns with the `currentReplicas` field of the
 * [K8s HorizontalPodAutoscalerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerstatus-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_CURRENT_PODS = 'k8s.hpa.current_pods' as const;

/**
 * Desired number of replica pods managed by this horizontal pod autoscaler, as last calculated by the autoscaler
 *
 * @note This metric aligns with the `desiredReplicas` field of the
 * [K8s HorizontalPodAutoscalerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerstatus-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_DESIRED_PODS = 'k8s.hpa.desired_pods' as const;

/**
 * The upper limit for the number of replica pods to which the autoscaler can scale up
 *
 * @note This metric aligns with the `maxReplicas` field of the
 * [K8s HorizontalPodAutoscalerSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerspec-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_MAX_PODS = 'k8s.hpa.max_pods' as const;

/**
 * The lower limit for the number of replica pods to which the autoscaler can scale down
 *
 * @note This metric aligns with the `minReplicas` field of the
 * [K8s HorizontalPodAutoscalerSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerspec-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_MIN_PODS = 'k8s.hpa.min_pods' as const;

/**
 * The number of pending and actively running pods for a job
 *
 * @note This metric aligns with the `active` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.job`](../resource/k8s.md#job) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_ACTIVE_PODS = 'k8s.job.active_pods' as const;

/**
 * The desired number of successfully finished pods the job should be run with
 *
 * @note This metric aligns with the `completions` field of the
 * [K8s JobSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobspec-v1-batch).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.job`](../resource/k8s.md#job) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_DESIRED_SUCCESSFUL_PODS = 'k8s.job.desired_successful_pods' as const;

/**
 * The number of pods which reached phase Failed for a job
 *
 * @note This metric aligns with the `failed` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.job`](../resource/k8s.md#job) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_FAILED_PODS = 'k8s.job.failed_pods' as const;

/**
 * The max desired number of pods the job should run at any given time
 *
 * @note This metric aligns with the `parallelism` field of the
 * [K8s JobSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobspec-v1-batch.
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.job`](../resource/k8s.md#job) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_MAX_PARALLEL_PODS = 'k8s.job.max_parallel_pods' as const;

/**
 * The number of pods which reached phase Succeeded for a job
 *
 * @note This metric aligns with the `succeeded` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.job`](../resource/k8s.md#job) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_SUCCESSFUL_PODS = 'k8s.job.successful_pods' as const;

/**
 * Describes number of K8s namespaces that are currently in a given phase.
 *
 * @note This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.namespace`](../resource/k8s.md#namespace) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NAMESPACE_PHASE = 'k8s.namespace.phase' as const;

/**
 * Total CPU time consumed
 *
 * @note Total CPU time consumed by the specific Node on all available CPU cores
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_CPU_TIME = 'k8s.node.cpu.time' as const;

/**
 * Node's CPU usage, measured in cpus. Range from 0 to the number of allocatable CPUs
 *
 * @note CPU usage of the specific Node on all available CPU cores, averaged over the sample window
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_CPU_USAGE = 'k8s.node.cpu.usage' as const;

/**
 * Memory usage of the Node
 *
 * @note Total memory usage of the Node
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_MEMORY_USAGE = 'k8s.node.memory.usage' as const;

/**
 * Node network errors
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_NETWORK_ERRORS = 'k8s.node.network.errors' as const;

/**
 * Network bytes for the Node
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_NETWORK_IO = 'k8s.node.network.io' as const;

/**
 * The time the Node has been running
 *
 * @note Instrumentations **SHOULD** use a gauge with type `double` and measure uptime in seconds as a floating point number with the highest precision available.
 * The actual accuracy would depend on the instrumentation and operating system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_UPTIME = 'k8s.node.uptime' as const;

/**
 * Total CPU time consumed
 *
 * @note Total CPU time consumed by the specific Pod on all available CPU cores
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_CPU_TIME = 'k8s.pod.cpu.time' as const;

/**
 * Pod's CPU usage, measured in cpus. Range from 0 to the number of allocatable CPUs
 *
 * @note CPU usage of the specific Pod on all available CPU cores, averaged over the sample window
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_CPU_USAGE = 'k8s.pod.cpu.usage' as const;

/**
 * Memory usage of the Pod
 *
 * @note Total memory usage of the Pod
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_MEMORY_USAGE = 'k8s.pod.memory.usage' as const;

/**
 * Pod network errors
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_NETWORK_ERRORS = 'k8s.pod.network.errors' as const;

/**
 * Network bytes for the Pod
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_NETWORK_IO = 'k8s.pod.network.io' as const;

/**
 * The time the Pod has been running
 *
 * @note Instrumentations **SHOULD** use a gauge with type `double` and measure uptime in seconds as a floating point number with the highest precision available.
 * The actual accuracy would depend on the instrumentation and operating system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_UPTIME = 'k8s.pod.uptime' as const;

/**
 * Total number of available replica pods (ready for at least minReadySeconds) targeted by this replicaset
 *
 * @note This metric aligns with the `availableReplicas` field of the
 * [K8s ReplicaSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicasetstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.replicaset`](../resource/k8s.md#replicaset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_REPLICASET_AVAILABLE_PODS = 'k8s.replicaset.available_pods' as const;

/**
 * Number of desired replica pods in this replicaset
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s ReplicaSetSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicasetspec-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.replicaset`](../resource/k8s.md#replicaset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_REPLICASET_DESIRED_PODS = 'k8s.replicaset.desired_pods' as const;

/**
 * Total number of available replica pods (ready for at least minReadySeconds) targeted by this replication controller
 *
 * @note This metric aligns with the `availableReplicas` field of the
 * [K8s ReplicationControllerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicationcontrollerstatus-v1-core)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_REPLICATION_CONTROLLER_AVAILABLE_PODS = 'k8s.replication_controller.available_pods' as const;

/**
 * Number of desired replica pods in this replication controller
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s ReplicationControllerSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicationcontrollerspec-v1-core)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_REPLICATION_CONTROLLER_DESIRED_PODS = 'k8s.replication_controller.desired_pods' as const;

/**
 * The number of replica pods created by the statefulset controller from the statefulset version indicated by currentRevision
 *
 * @note This metric aligns with the `currentReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.statefulset`](../resource/k8s.md#statefulset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_STATEFULSET_CURRENT_PODS = 'k8s.statefulset.current_pods' as const;

/**
 * Number of desired replica pods in this statefulset
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s StatefulSetSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetspec-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.statefulset`](../resource/k8s.md#statefulset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_STATEFULSET_DESIRED_PODS = 'k8s.statefulset.desired_pods' as const;

/**
 * The number of replica pods created for this statefulset with a Ready Condition
 *
 * @note This metric aligns with the `readyReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.statefulset`](../resource/k8s.md#statefulset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_STATEFULSET_READY_PODS = 'k8s.statefulset.ready_pods' as const;

/**
 * Number of replica pods created by the statefulset controller from the statefulset version indicated by updateRevision
 *
 * @note This metric aligns with the `updatedReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * This metric **SHOULD**, at a minimum, be reported against a
 * [`k8s.statefulset`](../resource/k8s.md#statefulset) resource.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_STATEFULSET_UPDATED_PODS = 'k8s.statefulset.updated_pods' as const;

/**
 * Number of messages that were delivered to the application.
 *
 * @note Records the number of messages pulled from the broker or number of messages dispatched to the application in push-based scenarios.
 * The metric **SHOULD** be reported once per message delivery. For example, if receiving and processing operations are both instrumented for a single message delivery, this counter is incremented when the message is received and not reported when it is processed.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES = 'messaging.client.consumed.messages' as const;

/**
 * Duration of messaging operation initiated by a producer or consumer client.
 *
 * @note This metric **SHOULD NOT** be used to report processing duration - processing duration is reported in `messaging.process.duration` metric.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_CLIENT_OPERATION_DURATION = 'messaging.client.operation.duration' as const;

/**
 * Deprecated. Use `messaging.client.sent.messages` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.client.sent.messages`.
 */
export const METRIC_MESSAGING_CLIENT_PUBLISHED_MESSAGES = 'messaging.client.published.messages' as const;

/**
 * Number of messages producer attempted to send to the broker.
 *
 * @note This metric **MUST NOT** count messages that were created but haven't yet been sent.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_CLIENT_SENT_MESSAGES = 'messaging.client.sent.messages' as const;

/**
 * Duration of processing operation.
 *
 * @note This metric **MUST** be reported for operations with `messaging.operation.type` that matches `process`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MESSAGING_PROCESS_DURATION = 'messaging.process.duration' as const;

/**
 * Deprecated. Use `messaging.client.consumed.messages` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.client.consumed.messages`.
 */
export const METRIC_MESSAGING_PROCESS_MESSAGES = 'messaging.process.messages' as const;

/**
 * Deprecated. Use `messaging.client.operation.duration` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.client.operation.duration`.
 */
export const METRIC_MESSAGING_PUBLISH_DURATION = 'messaging.publish.duration' as const;

/**
 * Deprecated. Use `messaging.client.produced.messages` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.client.produced.messages`.
 */
export const METRIC_MESSAGING_PUBLISH_MESSAGES = 'messaging.publish.messages' as const;

/**
 * Deprecated. Use `messaging.client.operation.duration` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.client.operation.duration`.
 */
export const METRIC_MESSAGING_RECEIVE_DURATION = 'messaging.receive.duration' as const;

/**
 * Deprecated. Use `messaging.client.consumed.messages` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.client.consumed.messages`.
 */
export const METRIC_MESSAGING_RECEIVE_MESSAGES = 'messaging.receive.messages' as const;

/**
 * Event loop maximum delay.
 *
 * @note Value can be retrieved from value `histogram.max` of [`perf_hooks.monitorEventLoopDelay([options])`](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_DELAY_MAX = 'nodejs.eventloop.delay.max' as const;

/**
 * Event loop mean delay.
 *
 * @note Value can be retrieved from value `histogram.mean` of [`perf_hooks.monitorEventLoopDelay([options])`](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_DELAY_MEAN = 'nodejs.eventloop.delay.mean' as const;

/**
 * Event loop minimum delay.
 *
 * @note Value can be retrieved from value `histogram.min` of [`perf_hooks.monitorEventLoopDelay([options])`](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_DELAY_MIN = 'nodejs.eventloop.delay.min' as const;

/**
 * Event loop 50 percentile delay.
 *
 * @note Value can be retrieved from value `histogram.percentile(50)` of [`perf_hooks.monitorEventLoopDelay([options])`](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_DELAY_P50 = 'nodejs.eventloop.delay.p50' as const;

/**
 * Event loop 90 percentile delay.
 *
 * @note Value can be retrieved from value `histogram.percentile(90)` of [`perf_hooks.monitorEventLoopDelay([options])`](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_DELAY_P90 = 'nodejs.eventloop.delay.p90' as const;

/**
 * Event loop 99 percentile delay.
 *
 * @note Value can be retrieved from value `histogram.percentile(99)` of [`perf_hooks.monitorEventLoopDelay([options])`](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_DELAY_P99 = 'nodejs.eventloop.delay.p99' as const;

/**
 * Event loop standard deviation delay.
 *
 * @note Value can be retrieved from value `histogram.stddev` of [`perf_hooks.monitorEventLoopDelay([options])`](https://nodejs.org/api/perf_hooks.html#perf_hooksmonitoreventloopdelayoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_DELAY_STDDEV = 'nodejs.eventloop.delay.stddev' as const;

/**
 * Cumulative duration of time the event loop has been in each state.
 *
 * @note Value can be retrieved from [`performance.eventLoopUtilization([utilization1[, utilization2]])`](https://nodejs.org/api/perf_hooks.html#performanceeventlooputilizationutilization1-utilization2)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_TIME = 'nodejs.eventloop.time' as const;

/**
 * Event loop utilization.
 *
 * @note The value range is [0.0, 1.0] and can be retrieved from [`performance.eventLoopUtilization([utilization1[, utilization2]])`](https://nodejs.org/api/perf_hooks.html#performanceeventlooputilizationutilization1-utilization2)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NODEJS_EVENTLOOP_UTILIZATION = 'nodejs.eventloop.utilization' as const;

/**
 * Number of times the process has been context switched.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CONTEXT_SWITCHES = 'process.context_switches' as const;

/**
 * Total CPU seconds broken down by different states.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CPU_TIME = 'process.cpu.time' as const;

/**
 * Difference in process.cpu.time since the last measurement, divided by the elapsed time and number of CPUs available to the process.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_CPU_UTILIZATION = 'process.cpu.utilization' as const;

/**
 * Disk bytes transferred.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_DISK_IO = 'process.disk.io' as const;

/**
 * The amount of physical memory in use.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_MEMORY_USAGE = 'process.memory.usage' as const;

/**
 * The amount of committed virtual memory.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_MEMORY_VIRTUAL = 'process.memory.virtual' as const;

/**
 * Network bytes transferred.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_NETWORK_IO = 'process.network.io' as const;

/**
 * Number of file descriptors in use by the process.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_OPEN_FILE_DESCRIPTOR_COUNT = 'process.open_file_descriptor.count' as const;

/**
 * Number of page faults the process has made.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_PAGING_FAULTS = 'process.paging.faults' as const;

/**
 * Process threads count.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_THREAD_COUNT = 'process.thread.count' as const;

/**
 * The time the process has been running.
 *
 * @note Instrumentations **SHOULD** use a gauge with type `double` and measure uptime in seconds as a floating point number with the highest precision available.
 * The actual accuracy would depend on the instrumentation and operating system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_UPTIME = 'process.uptime' as const;

/**
 * Measures the duration of outbound RPC.
 *
 * @note While streaming RPCs may record this metric as start-of-batch
 * to end-of-batch, it's hard to interpret in practice.
 *
 * **Streaming**: N/A.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_DURATION = 'rpc.client.duration' as const;

/**
 * Measures the size of RPC request messages (uncompressed).
 *
 * @note **Streaming**: Recorded per message in a streaming batch
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_REQUEST_SIZE = 'rpc.client.request.size' as const;

/**
 * Measures the number of messages received per RPC.
 *
 * @note Should be 1 for all non-streaming RPCs.
 *
 * **Streaming**: This metric is required for server and client streaming RPCs
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_REQUESTS_PER_RPC = 'rpc.client.requests_per_rpc' as const;

/**
 * Measures the size of RPC response messages (uncompressed).
 *
 * @note **Streaming**: Recorded per response in a streaming batch
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_RESPONSE_SIZE = 'rpc.client.response.size' as const;

/**
 * Measures the number of messages sent per RPC.
 *
 * @note Should be 1 for all non-streaming RPCs.
 *
 * **Streaming**: This metric is required for server and client streaming RPCs
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_RESPONSES_PER_RPC = 'rpc.client.responses_per_rpc' as const;

/**
 * Measures the duration of inbound RPC.
 *
 * @note While streaming RPCs may record this metric as start-of-batch
 * to end-of-batch, it's hard to interpret in practice.
 *
 * **Streaming**: N/A.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_DURATION = 'rpc.server.duration' as const;

/**
 * Measures the size of RPC request messages (uncompressed).
 *
 * @note **Streaming**: Recorded per message in a streaming batch
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_REQUEST_SIZE = 'rpc.server.request.size' as const;

/**
 * Measures the number of messages received per RPC.
 *
 * @note Should be 1 for all non-streaming RPCs.
 *
 * **Streaming** : This metric is required for server and client streaming RPCs
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_REQUESTS_PER_RPC = 'rpc.server.requests_per_rpc' as const;

/**
 * Measures the size of RPC response messages (uncompressed).
 *
 * @note **Streaming**: Recorded per response in a streaming batch
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_RESPONSE_SIZE = 'rpc.server.response.size' as const;

/**
 * Measures the number of messages sent per RPC.
 *
 * @note Should be 1 for all non-streaming RPCs.
 *
 * **Streaming**: This metric is required for server and client streaming RPCs
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_RESPONSES_PER_RPC = 'rpc.server.responses_per_rpc' as const;

/**
 * Reports the current frequency of the CPU in Hz
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_FREQUENCY = 'system.cpu.frequency' as const;

/**
 * Reports the number of logical (virtual) processor cores created by the operating system to manage multitasking
 *
 * @note Calculated by multiplying the number of sockets by the number of cores per socket, and then by the number of threads per core
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_LOGICAL_COUNT = 'system.cpu.logical.count' as const;

/**
 * Reports the number of actual physical processor cores on the hardware
 *
 * @note Calculated by multiplying the number of sockets by the number of cores per socket
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_PHYSICAL_COUNT = 'system.cpu.physical.count' as const;

/**
 * Seconds each logical CPU spent on each mode
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_TIME = 'system.cpu.time' as const;

/**
 * Difference in system.cpu.time since the last measurement, divided by the elapsed time and number of logical CPUs
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_UTILIZATION = 'system.cpu.utilization' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_IO = 'system.disk.io' as const;

/**
 * Time disk spent activated
 *
 * @note The real elapsed time ("wall clock") used in the I/O path (time from operations running in parallel are not counted). Measured as:
 *
 *   - Linux: Field 13 from [procfs-diskstats](https://www.kernel.org/doc/Documentation/ABI/testing/procfs-diskstats)
 *   - Windows: The complement of
 *     ["Disk% Idle Time"](https://learn.microsoft.com/archive/blogs/askcore/windows-performance-monitor-disk-counters-explained#windows-performance-monitor-disk-counters-explained)
 *     performance counter: `uptime * (100 - "Disk\% Idle Time") / 100`
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_IO_TIME = 'system.disk.io_time' as const;

/**
 * The total storage capacity of the disk
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_LIMIT = 'system.disk.limit' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_MERGED = 'system.disk.merged' as const;

/**
 * Sum of the time each operation took to complete
 *
 * @note Because it is the sum of time each request took, parallel-issued requests each contribute to make the count grow. Measured as:
 *
 *   - Linux: Fields 7 & 11 from [procfs-diskstats](https://www.kernel.org/doc/Documentation/ABI/testing/procfs-diskstats)
 *   - Windows: "Avg. Disk sec/Read" perf counter multiplied by "Disk Reads/sec" perf counter (similar for Writes)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_OPERATION_TIME = 'system.disk.operation_time' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_OPERATIONS = 'system.disk.operations' as const;

/**
 * The total storage capacity of the filesystem
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_FILESYSTEM_LIMIT = 'system.filesystem.limit' as const;

/**
 * Reports a filesystem's space usage across different states.
 *
 * @note The sum of all `system.filesystem.usage` values over the different `system.filesystem.state` attributes
 * **SHOULD** equal the total storage capacity of the filesystem, that is `system.filesystem.limit`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_FILESYSTEM_USAGE = 'system.filesystem.usage' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_FILESYSTEM_UTILIZATION = 'system.filesystem.utilization' as const;

/**
 * An estimate of how much memory is available for starting new applications, without causing swapping
 *
 * @note This is an alternative to `system.memory.usage` metric with `state=free`.
 * Linux starting from 3.14 exports "available" memory. It takes "free" memory as a baseline, and then factors in kernel-specific values.
 * This is supposed to be more accurate than just "free" memory.
 * For reference, see the calculations [here](https://superuser.com/a/980821).
 * See also `MemAvailable` in [/proc/meminfo](https://man7.org/linux/man-pages/man5/proc.5.html).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_LINUX_MEMORY_AVAILABLE = 'system.linux.memory.available' as const;

/**
 * Reports the memory used by the Linux kernel for managing caches of frequently used objects.
 *
 * @note The sum over the `reclaimable` and `unreclaimable` state values in `linux.memory.slab.usage` **SHOULD** be equal to the total slab memory available on the system.
 * Note that the total slab memory is not constant and may vary over time.
 * See also the [Slab allocator](https://blogs.oracle.com/linux/post/understanding-linux-kernel-memory-statistics) and `Slab` in [/proc/meminfo](https://man7.org/linux/man-pages/man5/proc.5.html).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_LINUX_MEMORY_SLAB_USAGE = 'system.linux.memory.slab.usage' as const;

/**
 * Total memory available in the system.
 *
 * @note Its value **SHOULD** equal the sum of `system.memory.state` over all states.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_LIMIT = 'system.memory.limit' as const;

/**
 * Shared memory used (mostly by tmpfs).
 *
 * @note Equivalent of `shared` from [`free` command](https://man7.org/linux/man-pages/man1/free.1.html) or
 * `Shmem` from [`/proc/meminfo`](https://man7.org/linux/man-pages/man5/proc.5.html)"
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_SHARED = 'system.memory.shared' as const;

/**
 * Reports memory in use by state.
 *
 * @note The sum over all `system.memory.state` values **SHOULD** equal the total memory
 * available on the system, that is `system.memory.limit`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_USAGE = 'system.memory.usage' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_UTILIZATION = 'system.memory.utilization' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_CONNECTIONS = 'system.network.connections' as const;

/**
 * Count of packets that are dropped or discarded even though there was no error
 *
 * @note Measured as:
 *
 *   - Linux: the `drop` column in `/proc/dev/net` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html))
 *   - Windows: [`InDiscards`/`OutDiscards`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
 *     from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_DROPPED = 'system.network.dropped' as const;

/**
 * Count of network errors detected
 *
 * @note Measured as:
 *
 *   - Linux: the `errs` column in `/proc/dev/net` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html)).
 *   - Windows: [`InErrors`/`OutErrors`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
 *     from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_ERRORS = 'system.network.errors' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_IO = 'system.network.io' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_PACKETS = 'system.network.packets' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_FAULTS = 'system.paging.faults' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_OPERATIONS = 'system.paging.operations' as const;

/**
 * Unix swap or windows pagefile usage
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_USAGE = 'system.paging.usage' as const;

/**
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_UTILIZATION = 'system.paging.utilization' as const;

/**
 * Total number of processes in each state
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PROCESS_COUNT = 'system.process.count' as const;

/**
 * Total number of processes created over uptime of the host
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PROCESS_CREATED = 'system.process.created' as const;

/**
 * The time the system has been running
 *
 * @note Instrumentations **SHOULD** use a gauge with type `double` and measure uptime in seconds as a floating point number with the highest precision available.
 * The actual accuracy would depend on the instrumentation and operating system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_UPTIME = 'system.uptime' as const;

/**
 * Garbage collection duration.
 *
 * @note The values can be retrieve from [`perf_hooks.PerformanceObserver(...).observe({ entryTypes: ['gc'] })`](https://nodejs.org/api/perf_hooks.html#performanceobserverobserveoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_GC_DURATION = 'v8js.gc.duration' as const;

/**
 * Heap space available size.
 *
 * @note Value can be retrieved from value `space_available_size` of [`v8.getHeapSpaceStatistics()`](https://nodejs.org/api/v8.html#v8getheapspacestatistics)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_HEAP_SPACE_AVAILABLE_SIZE = 'v8js.heap.space.available_size' as const;

/**
 * Committed size of a heap space.
 *
 * @note Value can be retrieved from value `physical_space_size` of [`v8.getHeapSpaceStatistics()`](https://nodejs.org/api/v8.html#v8getheapspacestatistics)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_HEAP_SPACE_PHYSICAL_SIZE = 'v8js.heap.space.physical_size' as const;

/**
 * Total heap memory size pre-allocated.
 *
 * @note The value can be retrieved from value `space_size` of [`v8.getHeapSpaceStatistics()`](https://nodejs.org/api/v8.html#v8getheapspacestatistics)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_MEMORY_HEAP_LIMIT = 'v8js.memory.heap.limit' as const;

/**
 * Heap Memory size allocated.
 *
 * @note The value can be retrieved from value `space_used_size` of [`v8.getHeapSpaceStatistics()`](https://nodejs.org/api/v8.html#v8getheapspacestatistics)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_MEMORY_HEAP_USED = 'v8js.memory.heap.used' as const;

/**
 * The number of changes (pull requests/merge requests/changelists) in a repository, categorized by their state (e.g. open or merged)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_CHANGE_COUNT = 'vcs.change.count' as const;

/**
 * The time duration a change (pull request/merge request/changelist) has been in a given state.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_CHANGE_DURATION = 'vcs.change.duration' as const;

/**
 * The amount of time since its creation it took a change (pull request/merge request/changelist) to get the first approval.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_CHANGE_TIME_TO_APPROVAL = 'vcs.change.time_to_approval' as const;

/**
 * The amount of time since its creation it took a change (pull request/merge request/changelist) to get merged into the target(base) ref.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_CHANGE_TIME_TO_MERGE = 'vcs.change.time_to_merge' as const;

/**
 * The number of unique contributors to a repository
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_CONTRIBUTOR_COUNT = 'vcs.contributor.count' as const;

/**
 * The number of refs of type branch or tag in a repository.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_REF_COUNT = 'vcs.ref.count' as const;

/**
 * The number of lines added/removed in a ref (branch) relative to the ref from the `vcs.ref.base.name` attribute.
 *
 * @note This metric should be reported for each `vcs.line_change.type` value. For example if a ref added 3 lines and removed 2 lines,
 * instrumentation **SHOULD** report two measurements: 3 and 2 (both positive numbers).
 * If number of lines added/removed should be calculated from the start of time, then `vcs.ref.base.name` **SHOULD** be set to an empty string.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_REF_LINES_DELTA = 'vcs.ref.lines_delta' as const;

/**
 * The number of revisions (commits) a ref (branch) is ahead/behind the branch from the `vcs.ref.base.name` attribute
 *
 * @note This metric should be reported for each `vcs.revision_delta.direction` value. For example if branch `a` is 3 commits behind and 2 commits ahead of `trunk`,
 * instrumentation **SHOULD** report two measurements: 3 and 2 (both positive numbers) and `vcs.ref.base.name` is set to `trunk`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_REF_REVISIONS_DELTA = 'vcs.ref.revisions_delta' as const;

/**
 * Time a ref (branch) created from the default branch (trunk) has existed. The `ref.type` attribute will always be `branch`
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_REF_TIME = 'vcs.ref.time' as const;

/**
 * The number of repositories in an organization.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_REPOSITORY_COUNT = 'vcs.repository.count' as const;

