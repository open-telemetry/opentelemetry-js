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
 * The authentication duration for a request.
 *
 * @note Meter name: `Microsoft.AspNetCore.Authentication`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_AUTHENTICATION_AUTHENTICATE_DURATION = 'aspnetcore.authentication.authenticate.duration' as const;

/**
 * The total number of times a scheme is challenged.
 *
 * @note Meter name: `Microsoft.AspNetCore.Authentication`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_AUTHENTICATION_CHALLENGES = 'aspnetcore.authentication.challenges' as const;

/**
 * The total number of times an authenticated user attempts to access a resource they are not permitted to access.
 *
 * @note Meter name: `Microsoft.AspNetCore.Authentication`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_AUTHENTICATION_FORBIDS = 'aspnetcore.authentication.forbids' as const;

/**
 * The total number of times a principal is signed in with a scheme.
 *
 * @note Meter name: `Microsoft.AspNetCore.Authentication`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_AUTHENTICATION_SIGN_INS = 'aspnetcore.authentication.sign_ins' as const;

/**
 * The total number of times a principal is signed out with a scheme.
 *
 * @note Meter name: `Microsoft.AspNetCore.Authentication`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_AUTHENTICATION_SIGN_OUTS = 'aspnetcore.authentication.sign_outs' as const;

/**
 * The total number of authorization attempts.
 *
 * @note Meter name: `Microsoft.AspNetCore.Authorization`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_AUTHORIZATION_ATTEMPTS = 'aspnetcore.authorization.attempts' as const;

/**
 * The duration of authenticate attempts. The authenticate metrics is recorded by sign in methods such as PasswordSignInAsync and TwoFactorSignInAsync.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_SIGN_IN_AUTHENTICATE_DURATION = 'aspnetcore.identity.sign_in.authenticate.duration' as const;

/**
 * The total number of check password attempts. Checks that the account is in a state that can log in and that the password is valid using the UserManager.CheckPasswordAsync method.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_SIGN_IN_CHECK_PASSWORD_ATTEMPTS = 'aspnetcore.identity.sign_in.check_password_attempts' as const;

/**
 * The total number of calls to sign in user principals.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_SIGN_IN_SIGN_INS = 'aspnetcore.identity.sign_in.sign_ins' as const;

/**
 * The total number of calls to sign out user principals.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_SIGN_IN_SIGN_OUTS = 'aspnetcore.identity.sign_in.sign_outs' as const;

/**
 * The total number of two factor clients forgotten.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_SIGN_IN_TWO_FACTOR_CLIENTS_FORGOTTEN = 'aspnetcore.identity.sign_in.two_factor_clients_forgotten' as const;

/**
 * The total number of two factor clients remembered.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_SIGN_IN_TWO_FACTOR_CLIENTS_REMEMBERED = 'aspnetcore.identity.sign_in.two_factor_clients_remembered' as const;

/**
 * The number of check password attempts. Only checks whether the password is valid and not whether the user account is in a state that can log in.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_USER_CHECK_PASSWORD_ATTEMPTS = 'aspnetcore.identity.user.check_password_attempts' as const;

/**
 * The duration of user creation operations.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_USER_CREATE_DURATION = 'aspnetcore.identity.user.create.duration' as const;

/**
 * The duration of user deletion operations.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_USER_DELETE_DURATION = 'aspnetcore.identity.user.delete.duration' as const;

/**
 * The total number of token generations.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_USER_GENERATED_TOKENS = 'aspnetcore.identity.user.generated_tokens' as const;

/**
 * The duration of user update operations.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_USER_UPDATE_DURATION = 'aspnetcore.identity.user.update.duration' as const;

/**
 * The total number of token verification attempts.
 *
 * @note Meter name: `Microsoft.AspNetCore.Identity`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_IDENTITY_USER_VERIFY_TOKEN_ATTEMPTS = 'aspnetcore.identity.user.verify_token_attempts' as const;

/**
 * Total number of bytes allocated by the memory pool. Allocation occurs when a memory rental request exceeds the available pooled memory.
 *
 * @note Meter name: `Microsoft.AspNetCore.MemoryPool`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_MEMORY_POOL_ALLOCATED = 'aspnetcore.memory_pool.allocated' as const;

/**
 * Total number of bytes evicted from the memory pool. Eviction occurs when idle pooled memory is reclaimed.
 *
 * @note Meter name: `Microsoft.AspNetCore.MemoryPool`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_MEMORY_POOL_EVICTED = 'aspnetcore.memory_pool.evicted' as const;

/**
 * Number of bytes currently pooled and available for reuse.
 *
 * @note Meter name: `Microsoft.AspNetCore.MemoryPool`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_MEMORY_POOL_POOLED = 'aspnetcore.memory_pool.pooled' as const;

/**
 * Total number of bytes rented from the memory pool.
 *
 * @note Meter name: `Microsoft.AspNetCore.MemoryPool`; Added in: ASP.NET Core 10.0
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_ASPNETCORE_MEMORY_POOL_RENTED = 'aspnetcore.memory_pool.rented' as const;

/**
 * Number of active client instances.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_AZURE_COSMOSDB_CLIENT_ACTIVE_INSTANCE_COUNT = 'azure.cosmosdb.client.active_instance.count' as const;

/**
 * [Request units](https://learn.microsoft.com/azure/cosmos-db/request-units) consumed by the operation.
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
 * Total CPU time consumed.
 *
 * @note Total CPU time consumed by the specific container on all available CPU cores
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_CPU_TIME = 'container.cpu.time' as const;

/**
 * Container's CPU usage, measured in cpus. Range from 0 to the number of allocatable CPUs.
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
 * Container filesystem available bytes.
 *
 * @note In K8s, this metric is derived from the
 * [FsStats.AvailableBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [ContainerStats.Rootfs](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#ContainerStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_FILESYSTEM_AVAILABLE = 'container.filesystem.available' as const;

/**
 * Container filesystem capacity.
 *
 * @note In K8s, this metric is derived from the
 * [FsStats.CapacityBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [ContainerStats.Rootfs](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#ContainerStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_FILESYSTEM_CAPACITY = 'container.filesystem.capacity' as const;

/**
 * Container filesystem usage.
 *
 * @note This may not equal capacity - available.
 *
 * In K8s, this metric is derived from the
 * [FsStats.UsedBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [ContainerStats.Rootfs](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#ContainerStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_FILESYSTEM_USAGE = 'container.filesystem.usage' as const;

/**
 * Container memory available.
 *
 * @note Available memory for use.  This is defined as the memory limit - workingSetBytes. If memory limit is undefined, the available bytes is omitted.
 * In general, this metric can be derived from [cadvisor](https://github.com/google/cadvisor/blob/v0.53.0/docs/storage/prometheus.md#prometheus-container-metrics) and by subtracting the `container_memory_working_set_bytes` metric from the `container_spec_memory_limit_bytes` metric.
 * In K8s, this metric is derived from the [MemoryStats.AvailableBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [PodStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#PodStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_MEMORY_AVAILABLE = 'container.memory.available' as const;

/**
 * Container memory paging faults.
 *
 * @note In general, this metric can be derived from [cadvisor](https://github.com/google/cadvisor/blob/v0.53.0/docs/storage/prometheus.md#prometheus-container-metrics) and specifically the `container_memory_failures_total{failure_type=pgfault, scope=container}` and `container_memory_failures_total{failure_type=pgmajfault, scope=container}`metric.
 * In K8s, this metric is derived from the [MemoryStats.PageFaults](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) and [MemoryStats.MajorPageFaults](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [PodStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#PodStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_MEMORY_PAGING_FAULTS = 'container.memory.paging.faults' as const;

/**
 * Container memory RSS.
 *
 * @note In general, this metric can be derived from [cadvisor](https://github.com/google/cadvisor/blob/v0.53.0/docs/storage/prometheus.md#prometheus-container-metrics) and specifically the `container_memory_rss` metric.
 * In K8s, this metric is derived from the [MemoryStats.RSSBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [PodStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#PodStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_MEMORY_RSS = 'container.memory.rss' as const;

/**
 * Memory usage of the container.
 *
 * @note Memory usage of the container.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_MEMORY_USAGE = 'container.memory.usage' as const;

/**
 * Container memory working set.
 *
 * @note In general, this metric can be derived from [cadvisor](https://github.com/google/cadvisor/blob/v0.53.0/docs/storage/prometheus.md#prometheus-container-metrics) and specifically the `container_memory_working_set_bytes` metric.
 * In K8s, this metric is derived from the [MemoryStats.WorkingSetBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [PodStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#PodStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_MEMORY_WORKING_SET = 'container.memory.working_set' as const;

/**
 * Network bytes for the container.
 *
 * @note The number of bytes sent/received on all network interfaces by the container.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_NETWORK_IO = 'container.network.io' as const;

/**
 * The time the container has been running.
 *
 * @note Instrumentations **SHOULD** use a gauge with type `double` and measure uptime in seconds as a floating point number with the highest precision available.
 * The actual accuracy would depend on the instrumentation and operating system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CONTAINER_UPTIME = 'container.uptime' as const;

/**
 * Deprecated. Use `system.cpu.frequency` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.cpu.frequency`.
 */
export const METRIC_CPU_FREQUENCY = 'cpu.frequency' as const;

/**
 * Deprecated. Use `system.cpu.time` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.cpu.time`.
 */
export const METRIC_CPU_TIME = 'cpu.time' as const;

/**
 * Deprecated. Use `system.cpu.utilization` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.cpu.utilization`.
 */
export const METRIC_CPU_UTILIZATION = 'cpu.utilization' as const;

/**
 * The total number of objects collected inside a generation since interpreter start.
 *
 * @note This metric reports data from [`gc.stats()`](https://docs.python.org/3/library/gc.html#gc.get_stats).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CPYTHON_GC_COLLECTED_OBJECTS = 'cpython.gc.collected_objects' as const;

/**
 * The number of times a generation was collected since interpreter start.
 *
 * @note This metric reports data from [`gc.stats()`](https://docs.python.org/3/library/gc.html#gc.get_stats).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CPYTHON_GC_COLLECTIONS = 'cpython.gc.collections' as const;

/**
 * The total number of objects which were found to be uncollectable inside a generation since interpreter start.
 *
 * @note This metric reports data from [`gc.stats()`](https://docs.python.org/3/library/gc.html#gc.get_stats).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_CPYTHON_GC_UNCOLLECTABLE_OBJECTS = 'cpython.gc.uncollectable_objects' as const;

/**
 * The number of connections that are currently in state described by the `state` attribute.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_COUNT = 'db.client.connection.count' as const;

/**
 * The time it took to create a new connection.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_CREATE_TIME = 'db.client.connection.create_time' as const;

/**
 * The maximum number of idle open connections allowed.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_IDLE_MAX = 'db.client.connection.idle.max' as const;

/**
 * The minimum number of idle open connections allowed.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_IDLE_MIN = 'db.client.connection.idle.min' as const;

/**
 * The maximum number of open connections allowed.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_MAX = 'db.client.connection.max' as const;

/**
 * The number of current pending requests for an open connection.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = 'db.client.connection.pending_requests' as const;

/**
 * The number of connection timeouts that have occurred trying to obtain a connection from the pool.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_TIMEOUTS = 'db.client.connection.timeouts' as const;

/**
 * The time between borrowing a connection and returning it to the pool.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_USE_TIME = 'db.client.connection.use_time' as const;

/**
 * The time it took to obtain an open connection from the pool.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_DB_CLIENT_CONNECTION_WAIT_TIME = 'db.client.connection.wait_time' as const;

/**
 * Deprecated, use `db.client.connection.create_time` instead. Note: the unit also changed from `ms` to `s`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.create_time` with unit `s`.
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
 * @deprecated Replaced by `db.client.connection.use_time` with unit `s`.
 */
export const METRIC_DB_CLIENT_CONNECTIONS_USE_TIME = 'db.client.connections.use_time' as const;

/**
 * Deprecated, use `db.client.connection.wait_time` instead. Note: the unit also changed from `ms` to `s`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `db.client.connection.wait_time` with unit `s`.
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
 * Number of invocation cold starts.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_COLDSTARTS = 'faas.coldstarts' as const;

/**
 * Distribution of CPU usage per invocation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_CPU_USAGE = 'faas.cpu_usage' as const;

/**
 * Number of invocation errors.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_ERRORS = 'faas.errors' as const;

/**
 * Measures the duration of the function's initialization, such as a cold start.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INIT_DURATION = 'faas.init_duration' as const;

/**
 * Number of successful invocations.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INVOCATIONS = 'faas.invocations' as const;

/**
 * Measures the duration of the function's logic execution.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_INVOKE_DURATION = 'faas.invoke_duration' as const;

/**
 * Distribution of max memory usage per invocation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_MEM_USAGE = 'faas.mem_usage' as const;

/**
 * Distribution of net I/O usage per invocation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_NET_IO = 'faas.net_io' as const;

/**
 * Number of invocation timeouts.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_FAAS_TIMEOUTS = 'faas.timeouts' as const;

/**
 * GenAI operation duration.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_CLIENT_OPERATION_DURATION = 'gen_ai.client.operation.duration' as const;

/**
 * Number of input and output tokens used.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_CLIENT_TOKEN_USAGE = 'gen_ai.client.token.usage' as const;

/**
 * Generative AI server request duration such as time-to-last byte or last output token.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_SERVER_REQUEST_DURATION = 'gen_ai.server.request.duration' as const;

/**
 * Time per output token generated after the first token for successful responses.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_GEN_AI_SERVER_TIME_PER_OUTPUT_TOKEN = 'gen_ai.server.time_per_output_token' as const;

/**
 * Time to generate first token for successful responses.
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
 * Remaining fraction of battery charge.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_BATTERY_CHARGE = 'hw.battery.charge' as const;

/**
 * Lower limit of battery charge fraction to ensure proper operation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_BATTERY_CHARGE_LIMIT = 'hw.battery.charge.limit' as const;

/**
 * Time left before battery is completely charged or discharged.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_BATTERY_TIME_LEFT = 'hw.battery.time_left' as const;

/**
 * CPU current frequency.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_CPU_SPEED = 'hw.cpu.speed' as const;

/**
 * CPU maximum frequency.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_CPU_SPEED_LIMIT = 'hw.cpu.speed.limit' as const;

/**
 * Energy consumed by the component.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_ENERGY = 'hw.energy' as const;

/**
 * Number of errors encountered by the component.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_ERRORS = 'hw.errors' as const;

/**
 * Fan speed in revolutions per minute.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_FAN_SPEED = 'hw.fan.speed' as const;

/**
 * Speed limit in rpm.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_FAN_SPEED_LIMIT = 'hw.fan.speed.limit' as const;

/**
 * Fan speed expressed as a fraction of its maximum speed.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_FAN_SPEED_RATIO = 'hw.fan.speed_ratio' as const;

/**
 * Received and transmitted bytes by the GPU.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_GPU_IO = 'hw.gpu.io' as const;

/**
 * Size of the GPU memory.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_GPU_MEMORY_LIMIT = 'hw.gpu.memory.limit' as const;

/**
 * GPU memory used.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_GPU_MEMORY_USAGE = 'hw.gpu.memory.usage' as const;

/**
 * Fraction of GPU memory used.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_GPU_MEMORY_UTILIZATION = 'hw.gpu.memory.utilization' as const;

/**
 * Fraction of time spent in a specific task.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_GPU_UTILIZATION = 'hw.gpu.utilization' as const;

/**
 * Ambient (external) temperature of the physical host.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_HOST_AMBIENT_TEMPERATURE = 'hw.host.ambient_temperature' as const;

/**
 * Total energy consumed by the entire physical host, in joules.
 *
 * @note The overall energy usage of a host **MUST** be reported using the specific `hw.host.energy` and `hw.host.power` metrics **only**, instead of the generic `hw.energy` and `hw.power` described in the previous section, to prevent summing up overlapping values.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_HOST_ENERGY = 'hw.host.energy' as const;

/**
 * By how many degrees Celsius the temperature of the physical host can be increased, before reaching a warning threshold on one of the internal sensors.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_HOST_HEATING_MARGIN = 'hw.host.heating_margin' as const;

/**
 * Instantaneous power consumed by the entire physical host in Watts (`hw.host.energy` is preferred).
 *
 * @note The overall energy usage of a host **MUST** be reported using the specific `hw.host.energy` and `hw.host.power` metrics **only**, instead of the generic `hw.energy` and `hw.power` described in the previous section, to prevent summing up overlapping values.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_HOST_POWER = 'hw.host.power' as const;

/**
 * Size of the logical disk.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_LOGICAL_DISK_LIMIT = 'hw.logical_disk.limit' as const;

/**
 * Logical disk space usage.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_LOGICAL_DISK_USAGE = 'hw.logical_disk.usage' as const;

/**
 * Logical disk space utilization as a fraction.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_LOGICAL_DISK_UTILIZATION = 'hw.logical_disk.utilization' as const;

/**
 * Size of the memory module.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_MEMORY_SIZE = 'hw.memory.size' as const;

/**
 * Link speed.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_NETWORK_BANDWIDTH_LIMIT = 'hw.network.bandwidth.limit' as const;

/**
 * Utilization of the network bandwidth as a fraction.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_NETWORK_BANDWIDTH_UTILIZATION = 'hw.network.bandwidth.utilization' as const;

/**
 * Received and transmitted network traffic in bytes.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_NETWORK_IO = 'hw.network.io' as const;

/**
 * Received and transmitted network traffic in packets (or frames).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_NETWORK_PACKETS = 'hw.network.packets' as const;

/**
 * Link status: `1` (up) or `0` (down).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_NETWORK_UP = 'hw.network.up' as const;

/**
 * Endurance remaining for this SSD disk.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_PHYSICAL_DISK_ENDURANCE_UTILIZATION = 'hw.physical_disk.endurance_utilization' as const;

/**
 * Size of the disk.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_PHYSICAL_DISK_SIZE = 'hw.physical_disk.size' as const;

/**
 * Value of the corresponding [S.M.A.R.T.](https://wikipedia.org/wiki/S.M.A.R.T.) (Self-Monitoring, Analysis, and Reporting Technology) attribute.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_PHYSICAL_DISK_SMART = 'hw.physical_disk.smart' as const;

/**
 * Instantaneous power consumed by the component.
 *
 * @note It is recommended to report `hw.energy` instead of `hw.power` when possible.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_POWER = 'hw.power' as const;

/**
 * Maximum power output of the power supply.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_POWER_SUPPLY_LIMIT = 'hw.power_supply.limit' as const;

/**
 * Current power output of the power supply.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_POWER_SUPPLY_USAGE = 'hw.power_supply.usage' as const;

/**
 * Utilization of the power supply as a fraction of its maximum output.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_POWER_SUPPLY_UTILIZATION = 'hw.power_supply.utilization' as const;

/**
 * Operational status: `1` (true) or `0` (false) for each of the possible states.
 *
 * @note `hw.status` is currently specified as an *UpDownCounter* but would ideally be represented using a [*StateSet* as defined in OpenMetrics](https://github.com/prometheus/OpenMetrics/blob/v1.0.0/specification/OpenMetrics.md#stateset). This semantic convention will be updated once *StateSet* is specified in OpenTelemetry. This planned change is not expected to have any consequence on the way users query their timeseries backend to retrieve the values of `hw.status` over time.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_STATUS = 'hw.status' as const;

/**
 * Operations performed by the tape drive.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_TAPE_DRIVE_OPERATIONS = 'hw.tape_drive.operations' as const;

/**
 * Temperature in degrees Celsius.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_TEMPERATURE = 'hw.temperature' as const;

/**
 * Temperature limit in degrees Celsius.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_TEMPERATURE_LIMIT = 'hw.temperature.limit' as const;

/**
 * Voltage measured by the sensor.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_VOLTAGE = 'hw.voltage' as const;

/**
 * Voltage limit in Volts.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_VOLTAGE_LIMIT = 'hw.voltage.limit' as const;

/**
 * Nominal (expected) voltage.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_HW_VOLTAGE_NOMINAL = 'hw.voltage.nominal' as const;

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
 * Number of open file descriptors as reported by the JVM.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_JVM_FILE_DESCRIPTOR_COUNT = 'jvm.file_descriptor.count' as const;

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
 * Maximum CPU resource limit set for the container.
 *
 * @note See https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#resourcerequirements-v1-core for details.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_CPU_LIMIT = 'k8s.container.cpu.limit' as const;

/**
 * The ratio of container CPU usage to its CPU limit.
 *
 * @note The value range is [0.0,1.0]. A value of 1.0 means the container is using 100% of its CPU limit. If the CPU limit is not set, this metric **SHOULD NOT** be emitted for that container.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_CPU_LIMIT_UTILIZATION = 'k8s.container.cpu.limit_utilization' as const;

/**
 * CPU resource requested for the container.
 *
 * @note See https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#resourcerequirements-v1-core for details.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_CPU_REQUEST = 'k8s.container.cpu.request' as const;

/**
 * The ratio of container CPU usage to its CPU request.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_CPU_REQUEST_UTILIZATION = 'k8s.container.cpu.request_utilization' as const;

/**
 * Maximum ephemeral storage resource limit set for the container.
 *
 * @note See https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#resourcerequirements-v1-core for details.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_EPHEMERAL_STORAGE_LIMIT = 'k8s.container.ephemeral_storage.limit' as const;

/**
 * Ephemeral storage resource requested for the container.
 *
 * @note See https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#resourcerequirements-v1-core for details.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_EPHEMERAL_STORAGE_REQUEST = 'k8s.container.ephemeral_storage.request' as const;

/**
 * Maximum memory resource limit set for the container.
 *
 * @note See https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#resourcerequirements-v1-core for details.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_MEMORY_LIMIT = 'k8s.container.memory.limit' as const;

/**
 * Memory resource requested for the container.
 *
 * @note See https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#resourcerequirements-v1-core for details.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_MEMORY_REQUEST = 'k8s.container.memory.request' as const;

/**
 * Indicates whether the container is currently marked as ready to accept traffic, based on its readiness probe (1 = ready, 0 = not ready).
 *
 * @note This metric **SHOULD** reflect the value of the `ready` field in the
 * [K8s ContainerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#containerstatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_READY = 'k8s.container.ready' as const;

/**
 * Describes how many times the container has restarted (since the last counter reset).
 *
 * @note This value is pulled directly from the K8s API and the value can go indefinitely high and be reset to 0
 * at any time depending on how your kubelet is configured to prune dead containers.
 * It is best to not depend too much on the exact value but rather look at it as
 * either == 0, in which case you can conclude there were no restarts in the recent past, or > 0, in which case
 * you can conclude there were restarts in the recent past, and not try and analyze the value beyond that.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_RESTART_COUNT = 'k8s.container.restart.count' as const;

/**
 * Describes the number of K8s containers that are currently in a state for a given reason.
 *
 * @note All possible container state reasons will be reported at each time interval to avoid missing metrics.
 * Only the value corresponding to the current state reason will be non-zero.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_STATUS_REASON = 'k8s.container.status.reason' as const;

/**
 * Describes the number of K8s containers that are currently in a given state.
 *
 * @note All possible container states will be reported at each time interval to avoid missing metrics.
 * Only the value corresponding to the current state will be non-zero.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_STATUS_STATE = 'k8s.container.status.state' as const;

/**
 * Maximum storage resource limit set for the container.
 *
 * @note See https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#resourcerequirements-v1-core for details.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_STORAGE_LIMIT = 'k8s.container.storage.limit' as const;

/**
 * Storage resource requested for the container.
 *
 * @note See https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#resourcerequirements-v1-core for details.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CONTAINER_STORAGE_REQUEST = 'k8s.container.storage.request' as const;

/**
 * Deprecated, use `k8s.cronjob.job.active` instead.
 *
 * @note This metric aligns with the `active` field of the
 * [K8s CronJobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#cronjobstatus-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.cronjob.job.active`.
 */
export const METRIC_K8S_CRONJOB_ACTIVE_JOBS = 'k8s.cronjob.active_jobs' as const;

/**
 * The number of actively running jobs for a cronjob.
 *
 * @note This metric aligns with the `active` field of the
 * [K8s CronJobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#cronjobstatus-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_CRONJOB_JOB_ACTIVE = 'k8s.cronjob.job.active' as const;

/**
 * Deprecated, use `k8s.daemonset.node.current_scheduled` instead.
 *
 * @note This metric aligns with the `currentNumberScheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.daemonset.node.current_scheduled`.
 */
export const METRIC_K8S_DAEMONSET_CURRENT_SCHEDULED_NODES = 'k8s.daemonset.current_scheduled_nodes' as const;

/**
 * Deprecated, use `k8s.daemonset.node.desired_scheduled` instead.
 *
 * @note This metric aligns with the `desiredNumberScheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.daemonset.node.desired_scheduled`.
 */
export const METRIC_K8S_DAEMONSET_DESIRED_SCHEDULED_NODES = 'k8s.daemonset.desired_scheduled_nodes' as const;

/**
 * Deprecated, use `k8s.daemonset.node.misscheduled` instead.
 *
 * @note This metric aligns with the `numberMisscheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.daemonset.node.misscheduled`.
 */
export const METRIC_K8S_DAEMONSET_MISSCHEDULED_NODES = 'k8s.daemonset.misscheduled_nodes' as const;

/**
 * Number of nodes that are running at least 1 daemon pod and are supposed to run the daemon pod.
 *
 * @note This metric aligns with the `currentNumberScheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DAEMONSET_NODE_CURRENT_SCHEDULED = 'k8s.daemonset.node.current_scheduled' as const;

/**
 * Number of nodes that should be running the daemon pod (including nodes currently running the daemon pod).
 *
 * @note This metric aligns with the `desiredNumberScheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DAEMONSET_NODE_DESIRED_SCHEDULED = 'k8s.daemonset.node.desired_scheduled' as const;

/**
 * Number of nodes that are running the daemon pod, but are not supposed to run the daemon pod.
 *
 * @note This metric aligns with the `numberMisscheduled` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DAEMONSET_NODE_MISSCHEDULED = 'k8s.daemonset.node.misscheduled' as const;

/**
 * Number of nodes that should be running the daemon pod and have one or more of the daemon pod running and ready.
 *
 * @note This metric aligns with the `numberReady` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DAEMONSET_NODE_READY = 'k8s.daemonset.node.ready' as const;

/**
 * Deprecated, use `k8s.daemonset.node.ready` instead.
 *
 * @note This metric aligns with the `numberReady` field of the
 * [K8s DaemonSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#daemonsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.daemonset.node.ready`.
 */
export const METRIC_K8S_DAEMONSET_READY_NODES = 'k8s.daemonset.ready_nodes' as const;

/**
 * Deprecated, use `k8s.deployment.pod.available` instead.
 *
 * @note This metric aligns with the `availableReplicas` field of the
 * [K8s DeploymentStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#deploymentstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.deployment.pod.available`.
 */
export const METRIC_K8S_DEPLOYMENT_AVAILABLE_PODS = 'k8s.deployment.available_pods' as const;

/**
 * Deprecated, use `k8s.deployment.pod.desired` instead.
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s DeploymentSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#deploymentspec-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.deployment.pod.desired`.
 */
export const METRIC_K8S_DEPLOYMENT_DESIRED_PODS = 'k8s.deployment.desired_pods' as const;

/**
 * Total number of available replica pods (ready for at least minReadySeconds) targeted by this deployment.
 *
 * @note This metric aligns with the `availableReplicas` field of the
 * [K8s DeploymentStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#deploymentstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DEPLOYMENT_POD_AVAILABLE = 'k8s.deployment.pod.available' as const;

/**
 * Number of desired replica pods in this deployment.
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s DeploymentSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#deploymentspec-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_DEPLOYMENT_POD_DESIRED = 'k8s.deployment.pod.desired' as const;

/**
 * Deprecated, use `k8s.hpa.pod.current` instead.
 *
 * @note This metric aligns with the `currentReplicas` field of the
 * [K8s HorizontalPodAutoscalerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerstatus-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.hpa.pod.current`.
 */
export const METRIC_K8S_HPA_CURRENT_PODS = 'k8s.hpa.current_pods' as const;

/**
 * Deprecated, use `k8s.hpa.pod.desired` instead.
 *
 * @note This metric aligns with the `desiredReplicas` field of the
 * [K8s HorizontalPodAutoscalerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerstatus-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.hpa.pod.desired`.
 */
export const METRIC_K8S_HPA_DESIRED_PODS = 'k8s.hpa.desired_pods' as const;

/**
 * Deprecated, use `k8s.hpa.pod.max` instead.
 *
 * @note This metric aligns with the `maxReplicas` field of the
 * [K8s HorizontalPodAutoscalerSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerspec-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.hpa.pod.max`.
 */
export const METRIC_K8S_HPA_MAX_PODS = 'k8s.hpa.max_pods' as const;

/**
 * Target average utilization, in percentage, for CPU resource in HPA config.
 *
 * @note This metric aligns with the `averageUtilization` field of the
 * [K8s HPA MetricTarget](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#metrictarget-v2-autoscaling).
 * If the type of the metric is [`ContainerResource`](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#support-for-metrics-apis),
 * the `k8s.container.name` attribute **MUST** be set to identify the specific container within the pod to which the metric applies.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_METRIC_TARGET_CPU_AVERAGE_UTILIZATION = 'k8s.hpa.metric.target.cpu.average_utilization' as const;

/**
 * Target average value for CPU resource in HPA config.
 *
 * @note This metric aligns with the `averageValue` field of the
 * [K8s HPA MetricTarget](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#metrictarget-v2-autoscaling).
 * If the type of the metric is [`ContainerResource`](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#support-for-metrics-apis),
 * the `k8s.container.name` attribute **MUST** be set to identify the specific container within the pod to which the metric applies.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_METRIC_TARGET_CPU_AVERAGE_VALUE = 'k8s.hpa.metric.target.cpu.average_value' as const;

/**
 * Target value for CPU resource in HPA config.
 *
 * @note This metric aligns with the `value` field of the
 * [K8s HPA MetricTarget](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#metrictarget-v2-autoscaling).
 * If the type of the metric is [`ContainerResource`](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#support-for-metrics-apis),
 * the `k8s.container.name` attribute **MUST** be set to identify the specific container within the pod to which the metric applies.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_METRIC_TARGET_CPU_VALUE = 'k8s.hpa.metric.target.cpu.value' as const;

/**
 * Deprecated, use `k8s.hpa.pod.min` instead.
 *
 * @note This metric aligns with the `minReplicas` field of the
 * [K8s HorizontalPodAutoscalerSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerspec-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.hpa.pod.min`.
 */
export const METRIC_K8S_HPA_MIN_PODS = 'k8s.hpa.min_pods' as const;

/**
 * Current number of replica pods managed by this horizontal pod autoscaler, as last seen by the autoscaler.
 *
 * @note This metric aligns with the `currentReplicas` field of the
 * [K8s HorizontalPodAutoscalerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerstatus-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_POD_CURRENT = 'k8s.hpa.pod.current' as const;

/**
 * Desired number of replica pods managed by this horizontal pod autoscaler, as last calculated by the autoscaler.
 *
 * @note This metric aligns with the `desiredReplicas` field of the
 * [K8s HorizontalPodAutoscalerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerstatus-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_POD_DESIRED = 'k8s.hpa.pod.desired' as const;

/**
 * The upper limit for the number of replica pods to which the autoscaler can scale up.
 *
 * @note This metric aligns with the `maxReplicas` field of the
 * [K8s HorizontalPodAutoscalerSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerspec-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_POD_MAX = 'k8s.hpa.pod.max' as const;

/**
 * The lower limit for the number of replica pods to which the autoscaler can scale down.
 *
 * @note This metric aligns with the `minReplicas` field of the
 * [K8s HorizontalPodAutoscalerSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#horizontalpodautoscalerspec-v2-autoscaling)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_HPA_POD_MIN = 'k8s.hpa.pod.min' as const;

/**
 * Deprecated, use `k8s.job.pod.active` instead.
 *
 * @note This metric aligns with the `active` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.job.pod.active`.
 */
export const METRIC_K8S_JOB_ACTIVE_PODS = 'k8s.job.active_pods' as const;

/**
 * Deprecated, use `k8s.job.pod.desired_successful` instead.
 *
 * @note This metric aligns with the `completions` field of the
 * [K8s JobSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobspec-v1-batch)..
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.job.pod.desired_successful`.
 */
export const METRIC_K8S_JOB_DESIRED_SUCCESSFUL_PODS = 'k8s.job.desired_successful_pods' as const;

/**
 * Deprecated, use `k8s.job.pod.failed` instead.
 *
 * @note This metric aligns with the `failed` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.job.pod.failed`.
 */
export const METRIC_K8S_JOB_FAILED_PODS = 'k8s.job.failed_pods' as const;

/**
 * Deprecated, use `k8s.job.pod.max_parallel` instead.
 *
 * @note This metric aligns with the `parallelism` field of the
 * [K8s JobSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobspec-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.job.pod.max_parallel`.
 */
export const METRIC_K8S_JOB_MAX_PARALLEL_PODS = 'k8s.job.max_parallel_pods' as const;

/**
 * The number of pending and actively running pods for a job.
 *
 * @note This metric aligns with the `active` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_POD_ACTIVE = 'k8s.job.pod.active' as const;

/**
 * The desired number of successfully finished pods the job should be run with.
 *
 * @note This metric aligns with the `completions` field of the
 * [K8s JobSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobspec-v1-batch)..
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_POD_DESIRED_SUCCESSFUL = 'k8s.job.pod.desired_successful' as const;

/**
 * The number of pods which reached phase Failed for a job.
 *
 * @note This metric aligns with the `failed` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_POD_FAILED = 'k8s.job.pod.failed' as const;

/**
 * The max desired number of pods the job should run at any given time.
 *
 * @note This metric aligns with the `parallelism` field of the
 * [K8s JobSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobspec-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_POD_MAX_PARALLEL = 'k8s.job.pod.max_parallel' as const;

/**
 * The number of pods which reached phase Succeeded for a job.
 *
 * @note This metric aligns with the `succeeded` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_JOB_POD_SUCCESSFUL = 'k8s.job.pod.successful' as const;

/**
 * Deprecated, use `k8s.job.pod.successful` instead.
 *
 * @note This metric aligns with the `succeeded` field of the
 * [K8s JobStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#jobstatus-v1-batch).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.job.pod.successful`.
 */
export const METRIC_K8S_JOB_SUCCESSFUL_PODS = 'k8s.job.successful_pods' as const;

/**
 * Describes number of K8s namespaces that are currently in a given phase.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NAMESPACE_PHASE = 'k8s.namespace.phase' as const;

/**
 * Deprecated, use `k8s.node.cpu.allocatable` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.node.cpu.allocatable`.
 */
export const METRIC_K8S_NODE_ALLOCATABLE_CPU = 'k8s.node.allocatable.cpu' as const;

/**
 * Deprecated, use `k8s.node.ephemeral_storage.allocatable` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.node.ephemeral_storage.allocatable`.
 */
export const METRIC_K8S_NODE_ALLOCATABLE_EPHEMERAL_STORAGE = 'k8s.node.allocatable.ephemeral_storage' as const;

/**
 * Deprecated, use `k8s.node.memory.allocatable` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.node.memory.allocatable`.
 */
export const METRIC_K8S_NODE_ALLOCATABLE_MEMORY = 'k8s.node.allocatable.memory' as const;

/**
 * Deprecated, use `k8s.node.pod.allocatable` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.node.pod.allocatable`.
 */
export const METRIC_K8S_NODE_ALLOCATABLE_PODS = 'k8s.node.allocatable.pods' as const;

/**
 * Describes the condition of a particular Node.
 *
 * @note All possible node condition pairs (type and status) will be reported at each time interval to avoid missing metrics. Condition pairs corresponding to the current conditions' statuses will be non-zero.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_CONDITION_STATUS = 'k8s.node.condition.status' as const;

/**
 * Amount of cpu allocatable on the node.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_CPU_ALLOCATABLE = 'k8s.node.cpu.allocatable' as const;

/**
 * Total CPU time consumed.
 *
 * @note Total CPU time consumed by the specific Node on all available CPU cores
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_CPU_TIME = 'k8s.node.cpu.time' as const;

/**
 * Node's CPU usage, measured in cpus. Range from 0 to the number of allocatable CPUs.
 *
 * @note CPU usage of the specific Node on all available CPU cores, averaged over the sample window
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_CPU_USAGE = 'k8s.node.cpu.usage' as const;

/**
 * Amount of ephemeral-storage allocatable on the node.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_EPHEMERAL_STORAGE_ALLOCATABLE = 'k8s.node.ephemeral_storage.allocatable' as const;

/**
 * Node filesystem available bytes.
 *
 * @note This metric is derived from the
 * [FsStats.AvailableBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [NodeStats.Fs](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#NodeStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_FILESYSTEM_AVAILABLE = 'k8s.node.filesystem.available' as const;

/**
 * Node filesystem capacity.
 *
 * @note This metric is derived from the
 * [FsStats.CapacityBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [NodeStats.Fs](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#NodeStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_FILESYSTEM_CAPACITY = 'k8s.node.filesystem.capacity' as const;

/**
 * Node filesystem usage.
 *
 * @note This may not equal capacity - available.
 *
 * This metric is derived from the
 * [FsStats.UsedBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [NodeStats.Fs](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#NodeStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_FILESYSTEM_USAGE = 'k8s.node.filesystem.usage' as const;

/**
 * Amount of memory allocatable on the node.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_MEMORY_ALLOCATABLE = 'k8s.node.memory.allocatable' as const;

/**
 * Node memory available.
 *
 * @note Available memory for use.  This is defined as the memory limit - workingSetBytes. If memory limit is undefined, the available bytes is omitted.
 * This metric is derived from the [MemoryStats.AvailableBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [NodeStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#NodeStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_MEMORY_AVAILABLE = 'k8s.node.memory.available' as const;

/**
 * Node memory paging faults.
 *
 * @note Cumulative number of major/minor page faults.
 * This metric is derived from the [MemoryStats.PageFaults](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) and [MemoryStats.MajorPageFaults](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) fields of the [NodeStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#NodeStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_MEMORY_PAGING_FAULTS = 'k8s.node.memory.paging.faults' as const;

/**
 * Node memory RSS.
 *
 * @note The amount of anonymous and swap cache memory (includes transparent hugepages).
 * This metric is derived from the [MemoryStats.RSSBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [NodeStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#NodeStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_MEMORY_RSS = 'k8s.node.memory.rss' as const;

/**
 * Memory usage of the Node.
 *
 * @note Total memory usage of the Node
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_MEMORY_USAGE = 'k8s.node.memory.usage' as const;

/**
 * Node memory working set.
 *
 * @note The amount of working set memory. This includes recently accessed memory, dirty memory, and kernel memory. WorkingSetBytes is <= UsageBytes.
 * This metric is derived from the [MemoryStats.WorkingSetBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [NodeStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#NodeStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_MEMORY_WORKING_SET = 'k8s.node.memory.working_set' as const;

/**
 * Node network errors.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_NETWORK_ERRORS = 'k8s.node.network.errors' as const;

/**
 * Network bytes for the Node.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_NETWORK_IO = 'k8s.node.network.io' as const;

/**
 * Amount of pods allocatable on the node.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_POD_ALLOCATABLE = 'k8s.node.pod.allocatable' as const;

/**
 * The time the Node has been running.
 *
 * @note Instrumentations **SHOULD** use a gauge with type `double` and measure uptime in seconds as a floating point number with the highest precision available.
 * The actual accuracy would depend on the instrumentation and operating system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_NODE_UPTIME = 'k8s.node.uptime' as const;

/**
 * Total CPU time consumed.
 *
 * @note Total CPU time consumed by the specific Pod on all available CPU cores
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_CPU_TIME = 'k8s.pod.cpu.time' as const;

/**
 * Pod's CPU usage, measured in cpus. Range from 0 to the number of allocatable CPUs.
 *
 * @note CPU usage of the specific Pod on all available CPU cores, averaged over the sample window
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_CPU_USAGE = 'k8s.pod.cpu.usage' as const;

/**
 * Pod filesystem available bytes.
 *
 * @note This metric is derived from the
 * [FsStats.AvailableBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [PodStats.EphemeralStorage](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_FILESYSTEM_AVAILABLE = 'k8s.pod.filesystem.available' as const;

/**
 * Pod filesystem capacity.
 *
 * @note This metric is derived from the
 * [FsStats.CapacityBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [PodStats.EphemeralStorage](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_FILESYSTEM_CAPACITY = 'k8s.pod.filesystem.capacity' as const;

/**
 * Pod filesystem usage.
 *
 * @note This may not equal capacity - available.
 *
 * This metric is derived from the
 * [FsStats.UsedBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#FsStats) field
 * of the [PodStats.EphemeralStorage](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats)
 * of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_FILESYSTEM_USAGE = 'k8s.pod.filesystem.usage' as const;

/**
 * Pod memory available.
 *
 * @note Available memory for use.  This is defined as the memory limit - workingSetBytes. If memory limit is undefined, the available bytes is omitted.
 * This metric is derived from the [MemoryStats.AvailableBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [PodStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#PodStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_MEMORY_AVAILABLE = 'k8s.pod.memory.available' as const;

/**
 * Pod memory paging faults.
 *
 * @note Cumulative number of major/minor page faults.
 * This metric is derived from the [MemoryStats.PageFaults](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) and [MemoryStats.MajorPageFaults](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [PodStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#PodStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_MEMORY_PAGING_FAULTS = 'k8s.pod.memory.paging.faults' as const;

/**
 * Pod memory RSS.
 *
 * @note The amount of anonymous and swap cache memory (includes transparent hugepages).
 * This metric is derived from the [MemoryStats.RSSBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [PodStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#PodStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_MEMORY_RSS = 'k8s.pod.memory.rss' as const;

/**
 * Memory usage of the Pod.
 *
 * @note Total memory usage of the Pod
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_MEMORY_USAGE = 'k8s.pod.memory.usage' as const;

/**
 * Pod memory working set.
 *
 * @note The amount of working set memory. This includes recently accessed memory, dirty memory, and kernel memory. WorkingSetBytes is <= UsageBytes.
 * This metric is derived from the [MemoryStats.WorkingSetBytes](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#MemoryStats) field of the [PodStats.Memory](https://pkg.go.dev/k8s.io/kubelet@v0.34.0/pkg/apis/stats/v1alpha1#PodStats) of the Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_MEMORY_WORKING_SET = 'k8s.pod.memory.working_set' as const;

/**
 * Pod network errors.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_NETWORK_ERRORS = 'k8s.pod.network.errors' as const;

/**
 * Network bytes for the Pod.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_NETWORK_IO = 'k8s.pod.network.io' as const;

/**
 * Describes number of K8s Pods that are currently in a given phase.
 *
 * @note All possible pod phases will be reported at each time interval to avoid missing metrics.
 * Only the value corresponding to the current phase will be non-zero.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_STATUS_PHASE = 'k8s.pod.status.phase' as const;

/**
 * Describes the number of K8s Pods that are currently in a state for a given reason.
 *
 * @note All possible pod status reasons will be reported at each time interval to avoid missing metrics.
 * Only the value corresponding to the current reason will be non-zero.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_STATUS_REASON = 'k8s.pod.status.reason' as const;

/**
 * The time the Pod has been running.
 *
 * @note Instrumentations **SHOULD** use a gauge with type `double` and measure uptime in seconds as a floating point number with the highest precision available.
 * The actual accuracy would depend on the instrumentation and operating system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_UPTIME = 'k8s.pod.uptime' as const;

/**
 * Pod volume storage space available.
 *
 * @note This metric is derived from the
 * [VolumeStats.AvailableBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#VolumeStats) field
 * of the [PodStats](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats) of the
 * Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_VOLUME_AVAILABLE = 'k8s.pod.volume.available' as const;

/**
 * Pod volume total capacity.
 *
 * @note This metric is derived from the
 * [VolumeStats.CapacityBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#VolumeStats) field
 * of the [PodStats](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats) of the
 * Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_VOLUME_CAPACITY = 'k8s.pod.volume.capacity' as const;

/**
 * The total inodes in the filesystem of the Pod's volume.
 *
 * @note This metric is derived from the
 * [VolumeStats.Inodes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#VolumeStats) field
 * of the [PodStats](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats) of the
 * Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_VOLUME_INODE_COUNT = 'k8s.pod.volume.inode.count' as const;

/**
 * The free inodes in the filesystem of the Pod's volume.
 *
 * @note This metric is derived from the
 * [VolumeStats.InodesFree](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#VolumeStats) field
 * of the [PodStats](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats) of the
 * Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_VOLUME_INODE_FREE = 'k8s.pod.volume.inode.free' as const;

/**
 * The inodes used by the filesystem of the Pod's volume.
 *
 * @note This metric is derived from the
 * [VolumeStats.InodesUsed](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#VolumeStats) field
 * of the [PodStats](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats) of the
 * Kubelet's stats API.
 *
 * This may not be equal to `inodes - free` because filesystem may share inodes with other filesystems.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_VOLUME_INODE_USED = 'k8s.pod.volume.inode.used' as const;

/**
 * Pod volume usage.
 *
 * @note This may not equal capacity - available.
 *
 * This metric is derived from the
 * [VolumeStats.UsedBytes](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#VolumeStats) field
 * of the [PodStats](https://pkg.go.dev/k8s.io/kubelet@v0.33.0/pkg/apis/stats/v1alpha1#PodStats) of the
 * Kubelet's stats API.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_POD_VOLUME_USAGE = 'k8s.pod.volume.usage' as const;

/**
 * Deprecated, use `k8s.replicaset.pod.available` instead.
 *
 * @note This metric aligns with the `availableReplicas` field of the
 * [K8s ReplicaSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicasetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.replicaset.pod.available`.
 */
export const METRIC_K8S_REPLICASET_AVAILABLE_PODS = 'k8s.replicaset.available_pods' as const;

/**
 * Deprecated, use `k8s.replicaset.pod.desired` instead.
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s ReplicaSetSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicasetspec-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.replicaset.pod.desired`.
 */
export const METRIC_K8S_REPLICASET_DESIRED_PODS = 'k8s.replicaset.desired_pods' as const;

/**
 * Total number of available replica pods (ready for at least minReadySeconds) targeted by this replicaset.
 *
 * @note This metric aligns with the `availableReplicas` field of the
 * [K8s ReplicaSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicasetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_REPLICASET_POD_AVAILABLE = 'k8s.replicaset.pod.available' as const;

/**
 * Number of desired replica pods in this replicaset.
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s ReplicaSetSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicasetspec-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_REPLICASET_POD_DESIRED = 'k8s.replicaset.pod.desired' as const;

/**
 * Deprecated, use `k8s.replicationcontroller.pod.available` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.replicationcontroller.pod.available`.
 */
export const METRIC_K8S_REPLICATION_CONTROLLER_AVAILABLE_PODS = 'k8s.replication_controller.available_pods' as const;

/**
 * Deprecated, use `k8s.replicationcontroller.pod.desired` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.replicationcontroller.pod.desired`.
 */
export const METRIC_K8S_REPLICATION_CONTROLLER_DESIRED_PODS = 'k8s.replication_controller.desired_pods' as const;

/**
 * Deprecated, use `k8s.replicationcontroller.pod.available` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.replicationcontroller.pod.available`.
 */
export const METRIC_K8S_REPLICATIONCONTROLLER_AVAILABLE_PODS = 'k8s.replicationcontroller.available_pods' as const;

/**
 * Deprecated, use `k8s.replicationcontroller.pod.desired` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.replicationcontroller.pod.desired`.
 */
export const METRIC_K8S_REPLICATIONCONTROLLER_DESIRED_PODS = 'k8s.replicationcontroller.desired_pods' as const;

/**
 * Total number of available replica pods (ready for at least minReadySeconds) targeted by this replication controller.
 *
 * @note This metric aligns with the `availableReplicas` field of the
 * [K8s ReplicationControllerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicationcontrollerstatus-v1-core)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_REPLICATIONCONTROLLER_POD_AVAILABLE = 'k8s.replicationcontroller.pod.available' as const;

/**
 * Number of desired replica pods in this replication controller.
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s ReplicationControllerSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#replicationcontrollerspec-v1-core)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_REPLICATIONCONTROLLER_POD_DESIRED = 'k8s.replicationcontroller.pod.desired' as const;

/**
 * The CPU limits in a specific namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_CPU_LIMIT_HARD = 'k8s.resourcequota.cpu.limit.hard' as const;

/**
 * The CPU limits in a specific namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_CPU_LIMIT_USED = 'k8s.resourcequota.cpu.limit.used' as const;

/**
 * The CPU requests in a specific namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_CPU_REQUEST_HARD = 'k8s.resourcequota.cpu.request.hard' as const;

/**
 * The CPU requests in a specific namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_CPU_REQUEST_USED = 'k8s.resourcequota.cpu.request.used' as const;

/**
 * The sum of local ephemeral storage limits in the namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_EPHEMERAL_STORAGE_LIMIT_HARD = 'k8s.resourcequota.ephemeral_storage.limit.hard' as const;

/**
 * The sum of local ephemeral storage limits in the namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_EPHEMERAL_STORAGE_LIMIT_USED = 'k8s.resourcequota.ephemeral_storage.limit.used' as const;

/**
 * The sum of local ephemeral storage requests in the namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_EPHEMERAL_STORAGE_REQUEST_HARD = 'k8s.resourcequota.ephemeral_storage.request.hard' as const;

/**
 * The sum of local ephemeral storage requests in the namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_EPHEMERAL_STORAGE_REQUEST_USED = 'k8s.resourcequota.ephemeral_storage.request.used' as const;

/**
 * The huge page requests in a specific namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_HUGEPAGE_COUNT_REQUEST_HARD = 'k8s.resourcequota.hugepage_count.request.hard' as const;

/**
 * The huge page requests in a specific namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_HUGEPAGE_COUNT_REQUEST_USED = 'k8s.resourcequota.hugepage_count.request.used' as const;

/**
 * The memory limits in a specific namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_MEMORY_LIMIT_HARD = 'k8s.resourcequota.memory.limit.hard' as const;

/**
 * The memory limits in a specific namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_MEMORY_LIMIT_USED = 'k8s.resourcequota.memory.limit.used' as const;

/**
 * The memory requests in a specific namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_MEMORY_REQUEST_HARD = 'k8s.resourcequota.memory.request.hard' as const;

/**
 * The memory requests in a specific namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_MEMORY_REQUEST_USED = 'k8s.resourcequota.memory.request.used' as const;

/**
 * The object count limits in a specific namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_OBJECT_COUNT_HARD = 'k8s.resourcequota.object_count.hard' as const;

/**
 * The object count limits in a specific namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_OBJECT_COUNT_USED = 'k8s.resourcequota.object_count.used' as const;

/**
 * The total number of PersistentVolumeClaims that can exist in the namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * The `k8s.storageclass.name` should be required when a resource quota is defined for a specific
 * storage class.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_PERSISTENTVOLUMECLAIM_COUNT_HARD = 'k8s.resourcequota.persistentvolumeclaim_count.hard' as const;

/**
 * The total number of PersistentVolumeClaims that can exist in the namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * The `k8s.storageclass.name` should be required when a resource quota is defined for a specific
 * storage class.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_PERSISTENTVOLUMECLAIM_COUNT_USED = 'k8s.resourcequota.persistentvolumeclaim_count.used' as const;

/**
 * The storage requests in a specific namespace.
 * The value represents the configured quota limit of the resource in the namespace.
 *
 * @note This metric is retrieved from the `hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * The `k8s.storageclass.name` should be required when a resource quota is defined for a specific
 * storage class.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_STORAGE_REQUEST_HARD = 'k8s.resourcequota.storage.request.hard' as const;

/**
 * The storage requests in a specific namespace.
 * The value represents the current observed total usage of the resource in the namespace.
 *
 * @note This metric is retrieved from the `used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core).
 *
 * The `k8s.storageclass.name` should be required when a resource quota is defined for a specific
 * storage class.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_RESOURCEQUOTA_STORAGE_REQUEST_USED = 'k8s.resourcequota.storage.request.used' as const;

/**
 * Deprecated, use `k8s.statefulset.pod.current` instead.
 *
 * @note This metric aligns with the `currentReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.statefulset.pod.current`.
 */
export const METRIC_K8S_STATEFULSET_CURRENT_PODS = 'k8s.statefulset.current_pods' as const;

/**
 * Deprecated, use `k8s.statefulset.pod.desired` instead.
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s StatefulSetSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetspec-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.statefulset.pod.desired`.
 */
export const METRIC_K8S_STATEFULSET_DESIRED_PODS = 'k8s.statefulset.desired_pods' as const;

/**
 * The number of replica pods created by the statefulset controller from the statefulset version indicated by currentRevision.
 *
 * @note This metric aligns with the `currentReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_STATEFULSET_POD_CURRENT = 'k8s.statefulset.pod.current' as const;

/**
 * Number of desired replica pods in this statefulset.
 *
 * @note This metric aligns with the `replicas` field of the
 * [K8s StatefulSetSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetspec-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_STATEFULSET_POD_DESIRED = 'k8s.statefulset.pod.desired' as const;

/**
 * The number of replica pods created for this statefulset with a Ready Condition.
 *
 * @note This metric aligns with the `readyReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_STATEFULSET_POD_READY = 'k8s.statefulset.pod.ready' as const;

/**
 * Number of replica pods created by the statefulset controller from the statefulset version indicated by updateRevision.
 *
 * @note This metric aligns with the `updatedReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_K8S_STATEFULSET_POD_UPDATED = 'k8s.statefulset.pod.updated' as const;

/**
 * Deprecated, use `k8s.statefulset.pod.ready` instead.
 *
 * @note This metric aligns with the `readyReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.statefulset.pod.ready`.
 */
export const METRIC_K8S_STATEFULSET_READY_PODS = 'k8s.statefulset.ready_pods' as const;

/**
 * Deprecated, use `k8s.statefulset.pod.updated` instead.
 *
 * @note This metric aligns with the `updatedReplicas` field of the
 * [K8s StatefulSetStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.30/#statefulsetstatus-v1-apps).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `k8s.statefulset.pod.updated`.
 */
export const METRIC_K8S_STATEFULSET_UPDATED_PODS = 'k8s.statefulset.updated_pods' as const;

/**
 * The duration of the MCP request or notification as observed on the sender from the time it was sent until the response or ack is received.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MCP_CLIENT_OPERATION_DURATION = 'mcp.client.operation.duration' as const;

/**
 * The duration of the MCP session as observed on the MCP client.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MCP_CLIENT_SESSION_DURATION = 'mcp.client.session.duration' as const;

/**
 * MCP request or notification duration as observed on the receiver from the time it was received until the result or ack is sent.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MCP_SERVER_OPERATION_DURATION = 'mcp.server.operation.duration' as const;

/**
 * The duration of the MCP session as observed on the MCP server.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_MCP_SERVER_SESSION_DURATION = 'mcp.server.session.duration' as const;

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
 * Deprecated. Use `messaging.client.sent.messages` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `messaging.client.sent.messages`.
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
 * Reports the count of kernel NFS client TCP segments and UDP datagrams handled.
 *
 * @note Linux: this metric is taken from the Linux kernel's svc_stat.netudpcnt and svc_stat.nettcpcnt
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_CLIENT_NET_COUNT = 'nfs.client.net.count' as const;

/**
 * Reports the count of kernel NFS client TCP connections accepted.
 *
 * @note Linux: this metric is taken from the Linux kernel's svc_stat.nettcpconn
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_CLIENT_NET_TCP_CONNECTION_ACCEPTED = 'nfs.client.net.tcp.connection.accepted' as const;

/**
 * Reports the count of kernel NFSv4+ client operations.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_CLIENT_OPERATION_COUNT = 'nfs.client.operation.count' as const;

/**
 * Reports the count of kernel NFS client procedures.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_CLIENT_PROCEDURE_COUNT = 'nfs.client.procedure.count' as const;

/**
 * Reports the count of kernel NFS client RPC authentication refreshes.
 *
 * @note Linux: this metric is taken from the Linux kernel's svc_stat.rpcauthrefresh
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_CLIENT_RPC_AUTHREFRESH_COUNT = 'nfs.client.rpc.authrefresh.count' as const;

/**
 * Reports the count of kernel NFS client RPCs sent, regardless of whether they're accepted/rejected by the server.
 *
 * @note Linux: this metric is taken from the Linux kernel's svc_stat.rpccnt
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_CLIENT_RPC_COUNT = 'nfs.client.rpc.count' as const;

/**
 * Reports the count of kernel NFS client RPC retransmits.
 *
 * @note Linux: this metric is taken from the Linux kernel's svc_stat.rpcretrans
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_CLIENT_RPC_RETRANSMIT_COUNT = 'nfs.client.rpc.retransmit.count' as const;

/**
 * Reports the count of kernel NFS server stale file handles.
 *
 * @note Linux: this metric is taken from the Linux kernel NFSD_STATS_FH_STALE counter in the nfsd_net struct
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_FH_STALE_COUNT = 'nfs.server.fh.stale.count' as const;

/**
 * Reports the count of kernel NFS server bytes returned to receive and transmit (read and write) requests.
 *
 * @note Linux: this metric is taken from the Linux kernel NFSD_STATS_IO_READ and NFSD_STATS_IO_WRITE counters in the nfsd_net struct
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_IO = 'nfs.server.io' as const;

/**
 * Reports the count of kernel NFS server TCP segments and UDP datagrams handled.
 *
 * @note Linux: this metric is taken from the Linux kernel's svc_stat.nettcpcnt and svc_stat.netudpcnt
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_NET_COUNT = 'nfs.server.net.count' as const;

/**
 * Reports the count of kernel NFS server TCP connections accepted.
 *
 * @note Linux: this metric is taken from the Linux kernel's svc_stat.nettcpconn
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_NET_TCP_CONNECTION_ACCEPTED = 'nfs.server.net.tcp.connection.accepted' as const;

/**
 * Reports the count of kernel NFSv4+ server operations.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_OPERATION_COUNT = 'nfs.server.operation.count' as const;

/**
 * Reports the count of kernel NFS server procedures.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_PROCEDURE_COUNT = 'nfs.server.procedure.count' as const;

/**
 * Reports the kernel NFS server reply cache request count by cache hit status.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_REPCACHE_REQUESTS = 'nfs.server.repcache.requests' as const;

/**
 * Reports the count of kernel NFS server RPCs handled.
 *
 * @note Linux: this metric is taken from the Linux kernel's svc_stat.rpccnt, the count of good RPCs. This metric can have
 * an error.type of "format", "auth", or "client" for svc_stat.badfmt, svc_stat.badauth, and svc_stat.badclnt.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_RPC_COUNT = 'nfs.server.rpc.count' as const;

/**
 * Reports the count of kernel NFS server available threads.
 *
 * @note Linux: this metric is taken from the Linux kernel nfsd_th_cnt variable
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_NFS_SERVER_THREAD_COUNT = 'nfs.server.thread.count' as const;

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
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_CPU_LIMIT_HARD = 'openshift.clusterquota.cpu.limit.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_CPU_LIMIT_USED = 'openshift.clusterquota.cpu.limit.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_CPU_REQUEST_HARD = 'openshift.clusterquota.cpu.request.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_CPU_REQUEST_USED = 'openshift.clusterquota.cpu.request.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_EPHEMERAL_STORAGE_LIMIT_HARD = 'openshift.clusterquota.ephemeral_storage.limit.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_EPHEMERAL_STORAGE_LIMIT_USED = 'openshift.clusterquota.ephemeral_storage.limit.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_EPHEMERAL_STORAGE_REQUEST_HARD = 'openshift.clusterquota.ephemeral_storage.request.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_EPHEMERAL_STORAGE_REQUEST_USED = 'openshift.clusterquota.ephemeral_storage.request.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_HUGEPAGE_COUNT_REQUEST_HARD = 'openshift.clusterquota.hugepage_count.request.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_HUGEPAGE_COUNT_REQUEST_USED = 'openshift.clusterquota.hugepage_count.request.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_MEMORY_LIMIT_HARD = 'openshift.clusterquota.memory.limit.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_MEMORY_LIMIT_USED = 'openshift.clusterquota.memory.limit.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_MEMORY_REQUEST_HARD = 'openshift.clusterquota.memory.request.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_MEMORY_REQUEST_USED = 'openshift.clusterquota.memory.request.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_OBJECT_COUNT_HARD = 'openshift.clusterquota.object_count.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_OBJECT_COUNT_USED = 'openshift.clusterquota.object_count.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * The `k8s.storageclass.name` should be required when a resource quota is defined for a specific
 * storage class.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_PERSISTENTVOLUMECLAIM_COUNT_HARD = 'openshift.clusterquota.persistentvolumeclaim_count.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * The `k8s.storageclass.name` should be required when a resource quota is defined for a specific
 * storage class.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_PERSISTENTVOLUMECLAIM_COUNT_USED = 'openshift.clusterquota.persistentvolumeclaim_count.used' as const;

/**
 * The enforced hard limit of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Hard` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * The `k8s.storageclass.name` should be required when a resource quota is defined for a specific
 * storage class.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_STORAGE_REQUEST_HARD = 'openshift.clusterquota.storage.request.hard' as const;

/**
 * The current observed total usage of the resource across all projects.
 *
 * @note This metric is retrieved from the `Status.Total.Used` field of the
 * [K8s ResourceQuotaStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.32/#resourcequotastatus-v1-core)
 * of the
 * [ClusterResourceQuota](https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/schedule_and_quota_apis/clusterresourcequota-quota-openshift-io-v1#status-total).
 *
 * The `k8s.storageclass.name` should be required when a resource quota is defined for a specific
 * storage class.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OPENSHIFT_CLUSTERQUOTA_STORAGE_REQUEST_USED = 'openshift.clusterquota.storage.request.used' as const;

/**
 * The number of log records for which the export has finished, either successful or failed.
 *
 * @note For successful exports, `error.type` **MUST NOT** be set. For failed exports, `error.type` **MUST** contain the failure cause.
 * For exporters with partial success semantics (e.g. OTLP with `rejected_log_records`), rejected log records **MUST** count as failed and only non-rejected log records count as success.
 * If no rejection reason is available, `rejected` **SHOULD** be used as value for `error.type`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_EXPORTER_LOG_EXPORTED = 'otel.sdk.exporter.log.exported' as const;

/**
 * The number of log records which were passed to the exporter, but that have not been exported yet (neither successful, nor failed).
 *
 * @note For successful exports, `error.type` **MUST NOT** be set. For failed exports, `error.type` **MUST** contain the failure cause.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_EXPORTER_LOG_INFLIGHT = 'otel.sdk.exporter.log.inflight' as const;

/**
 * The number of metric data points for which the export has finished, either successful or failed.
 *
 * @note For successful exports, `error.type` **MUST NOT** be set. For failed exports, `error.type` **MUST** contain the failure cause.
 * For exporters with partial success semantics (e.g. OTLP with `rejected_data_points`), rejected data points **MUST** count as failed and only non-rejected data points count as success.
 * If no rejection reason is available, `rejected` **SHOULD** be used as value for `error.type`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_EXPORTER_METRIC_DATA_POINT_EXPORTED = 'otel.sdk.exporter.metric_data_point.exported' as const;

/**
 * The number of metric data points which were passed to the exporter, but that have not been exported yet (neither successful, nor failed).
 *
 * @note For successful exports, `error.type` **MUST NOT** be set. For failed exports, `error.type` **MUST** contain the failure cause.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_EXPORTER_METRIC_DATA_POINT_INFLIGHT = 'otel.sdk.exporter.metric_data_point.inflight' as const;

/**
 * The duration of exporting a batch of telemetry records.
 *
 * @note This metric defines successful operations using the full success definitions for [http](https://github.com/open-telemetry/opentelemetry-proto/blob/v1.5.0/docs/specification.md#full-success-1)
 * and [grpc](https://github.com/open-telemetry/opentelemetry-proto/blob/v1.5.0/docs/specification.md#full-success). Anything else is defined as an unsuccessful operation. For successful
 * operations, `error.type` **MUST NOT** be set. For unsuccessful export operations, `error.type` **MUST** contain a relevant failure cause.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_EXPORTER_OPERATION_DURATION = 'otel.sdk.exporter.operation.duration' as const;

/**
 * The number of spans for which the export has finished, either successful or failed.
 *
 * @note For successful exports, `error.type` **MUST NOT** be set. For failed exports, `error.type` **MUST** contain the failure cause.
 * For exporters with partial success semantics (e.g. OTLP with `rejected_spans`), rejected spans **MUST** count as failed and only non-rejected spans count as success.
 * If no rejection reason is available, `rejected` **SHOULD** be used as value for `error.type`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_EXPORTER_SPAN_EXPORTED = 'otel.sdk.exporter.span.exported' as const;

/**
 * Deprecated, use `otel.sdk.exporter.span.exported` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `otel.sdk.exporter.span.exported`.
 */
export const METRIC_OTEL_SDK_EXPORTER_SPAN_EXPORTED_COUNT = 'otel.sdk.exporter.span.exported.count' as const;

/**
 * The number of spans which were passed to the exporter, but that have not been exported yet (neither successful, nor failed).
 *
 * @note For successful exports, `error.type` **MUST NOT** be set. For failed exports, `error.type` **MUST** contain the failure cause.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_EXPORTER_SPAN_INFLIGHT = 'otel.sdk.exporter.span.inflight' as const;

/**
 * Deprecated, use `otel.sdk.exporter.span.inflight` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `otel.sdk.exporter.span.inflight`.
 */
export const METRIC_OTEL_SDK_EXPORTER_SPAN_INFLIGHT_COUNT = 'otel.sdk.exporter.span.inflight.count' as const;

/**
 * The number of logs submitted to enabled SDK Loggers.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_LOG_CREATED = 'otel.sdk.log.created' as const;

/**
 * The duration of the collect operation of the metric reader.
 *
 * @note For successful collections, `error.type` **MUST NOT** be set. For failed collections, `error.type` **SHOULD** contain the failure cause.
 * It can happen that metrics collection is successful for some MetricProducers, while others fail. In that case `error.type` **SHOULD** be set to any of the failure causes.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_METRIC_READER_COLLECTION_DURATION = 'otel.sdk.metric_reader.collection.duration' as const;

/**
 * The number of log records for which the processing has finished, either successful or failed.
 *
 * @note For successful processing, `error.type` **MUST NOT** be set. For failed processing, `error.type` **MUST** contain the failure cause.
 * For the SDK Simple and Batching Log Record Processor a log record is considered to be processed already when it has been submitted to the exporter,
 * not when the corresponding export call has finished.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_PROCESSOR_LOG_PROCESSED = 'otel.sdk.processor.log.processed' as const;

/**
 * The maximum number of log records the queue of a given instance of an SDK Log Record processor can hold.
 *
 * @note Only applies to Log Record processors which use a queue, e.g. the SDK Batching Log Record Processor.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_PROCESSOR_LOG_QUEUE_CAPACITY = 'otel.sdk.processor.log.queue.capacity' as const;

/**
 * The number of log records in the queue of a given instance of an SDK log processor.
 *
 * @note Only applies to log record processors which use a queue, e.g. the SDK Batching Log Record Processor.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_PROCESSOR_LOG_QUEUE_SIZE = 'otel.sdk.processor.log.queue.size' as const;

/**
 * The number of spans for which the processing has finished, either successful or failed.
 *
 * @note For successful processing, `error.type` **MUST NOT** be set. For failed processing, `error.type` **MUST** contain the failure cause.
 * For the SDK Simple and Batching Span Processor a span is considered to be processed already when it has been submitted to the exporter, not when the corresponding export call has finished.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED = 'otel.sdk.processor.span.processed' as const;

/**
 * Deprecated, use `otel.sdk.processor.span.processed` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `otel.sdk.processor.span.processed`.
 */
export const METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED_COUNT = 'otel.sdk.processor.span.processed.count' as const;

/**
 * The maximum number of spans the queue of a given instance of an SDK span processor can hold.
 *
 * @note Only applies to span processors which use a queue, e.g. the SDK Batching Span Processor.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_CAPACITY = 'otel.sdk.processor.span.queue.capacity' as const;

/**
 * The number of spans in the queue of a given instance of an SDK span processor.
 *
 * @note Only applies to span processors which use a queue, e.g. the SDK Batching Span Processor.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_SIZE = 'otel.sdk.processor.span.queue.size' as const;

/**
 * Use `otel.sdk.span.started` minus `otel.sdk.span.live` to derive this value.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Obsoleted.
 */
export const METRIC_OTEL_SDK_SPAN_ENDED = 'otel.sdk.span.ended' as const;

/**
 * Use `otel.sdk.span.started` minus `otel.sdk.span.live` to derive this value.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Obsoleted.
 */
export const METRIC_OTEL_SDK_SPAN_ENDED_COUNT = 'otel.sdk.span.ended.count' as const;

/**
 * The number of created spans with `recording=true` for which the end operation has not been called yet.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_SPAN_LIVE = 'otel.sdk.span.live' as const;

/**
 * Deprecated, use `otel.sdk.span.live` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `otel.sdk.span.live`.
 */
export const METRIC_OTEL_SDK_SPAN_LIVE_COUNT = 'otel.sdk.span.live.count' as const;

/**
 * The number of created spans.
 *
 * @note Implementations **MUST** record this metric for all spans, even for non-recording ones.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_OTEL_SDK_SPAN_STARTED = 'otel.sdk.span.started' as const;

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
 * Deprecated, use `process.unix.file_descriptor.count` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `process.unix.file_descriptor.count`.
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
 * Number of unix file descriptors in use by the process.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_UNIX_FILE_DESCRIPTOR_COUNT = 'process.unix.file_descriptor.count' as const;

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
 * Number of handles held by the process.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_PROCESS_WINDOWS_HANDLE_COUNT = 'process.windows.handle.count' as const;

/**
 * Measures the duration of outbound remote procedure calls (RPC).
 *
 * @note When this metric is reported alongside an RPC client span, the metric value
 * **SHOULD** be the same as the RPC client span duration.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_CLIENT_CALL_DURATION = 'rpc.client.call.duration' as const;

/**
 * Deprecated, use `rpc.client.call.duration` instead. Note: the unit also changed from `ms` to `s`.
 *
 * @note While streaming RPCs may record this metric as start-of-batch
 * to end-of-batch, it's hard to interpret in practice.
 *
 * **Streaming**: N/A.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `rpc.client.call.duration` with unit `s`.
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
 *
 * @deprecated Removed, no replacement at this time.
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
 *
 * @deprecated Removed, no replacement at this time.
 */
export const METRIC_RPC_CLIENT_RESPONSES_PER_RPC = 'rpc.client.responses_per_rpc' as const;

/**
 * Measures the duration of inbound remote procedure calls (RPC).
 *
 * @note When this metric is reported alongside an RPC server span, the metric value
 * **SHOULD** be the same as the RPC server span duration.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_RPC_SERVER_CALL_DURATION = 'rpc.server.call.duration' as const;

/**
 * Deprecated, use `rpc.server.call.duration` instead. Note: the unit also changed from `ms` to `s`.
 *
 * @note While streaming RPCs may record this metric as start-of-batch
 * to end-of-batch, it's hard to interpret in practice.
 *
 * **Streaming**: N/A.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `rpc.server.call.duration` with unit `s`.
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
 *
 * @deprecated Removed, no replacement at this time.
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
 *
 * @deprecated Removed, no replacement at this time.
 */
export const METRIC_RPC_SERVER_RESPONSES_PER_RPC = 'rpc.server.responses_per_rpc' as const;

/**
 * Operating frequency of the logical CPU in Hertz.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_FREQUENCY = 'system.cpu.frequency' as const;

/**
 * Reports the number of logical (virtual) processor cores created by the operating system to manage multitasking.
 *
 * @note Calculated by multiplying the number of sockets by the number of cores per socket, and then by the number of threads per core
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_LOGICAL_COUNT = 'system.cpu.logical.count' as const;

/**
 * Reports the number of actual physical processor cores on the hardware.
 *
 * @note Calculated by multiplying the number of sockets by the number of cores per socket
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_PHYSICAL_COUNT = 'system.cpu.physical.count' as const;

/**
 * Seconds each logical CPU spent on each mode.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_TIME = 'system.cpu.time' as const;

/**
 * For each logical CPU, the utilization is calculated as the change in cumulative CPU time (cpu.time) over a measurement interval, divided by the elapsed time.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_CPU_UTILIZATION = 'system.cpu.utilization' as const;

/**
 * Disk bytes transferred.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_IO = 'system.disk.io' as const;

/**
 * Time disk spent activated.
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
 * The total storage capacity of the disk.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_LIMIT = 'system.disk.limit' as const;

/**
 * The number of disk reads/writes merged into single physical disk access operations.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_MERGED = 'system.disk.merged' as const;

/**
 * Sum of the time each operation took to complete.
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
 * Disk operations count.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_DISK_OPERATIONS = 'system.disk.operations' as const;

/**
 * The total storage capacity of the filesystem.
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
 * Fraction of filesystem bytes used.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_FILESYSTEM_UTILIZATION = 'system.filesystem.utilization' as const;

/**
 * The number of packets transferred.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.memory.linux.available`.
 */
export const METRIC_SYSTEM_LINUX_MEMORY_AVAILABLE = 'system.linux.memory.available' as const;

/**
 * The number of packets transferred.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.memory.linux.slab.usage`.
 */
export const METRIC_SYSTEM_LINUX_MEMORY_SLAB_USAGE = 'system.linux.memory.slab.usage' as const;

/**
 * Total virtual memory available in the system.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_LIMIT = 'system.memory.limit' as const;

/**
 * An estimate of how much memory is available for starting new applications, without causing swapping.
 *
 * @note This is an alternative to `system.memory.usage` metric with `state=free`.
 * Linux starting from 3.14 exports "available" memory. It takes "free" memory as a baseline, and then factors in kernel-specific values.
 * This is supposed to be more accurate than just "free" memory.
 * For reference, see the calculations [here](https://superuser.com/a/980821).
 * See also `MemAvailable` in [/proc/meminfo](https://man7.org/linux/man-pages/man5/proc.5.html).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_LINUX_AVAILABLE = 'system.memory.linux.available' as const;

/**
 * Reports the memory used by the Linux kernel for managing caches of frequently used objects.
 *
 * @note The sum over the `reclaimable` and `unreclaimable` state values in `memory.linux.slab.usage` **SHOULD** be equal to the total slab memory available on the system.
 * Note that the total slab memory is not constant and may vary over time.
 * See also the [Slab allocator](https://blogs.oracle.com/linux/post/understanding-linux-kernel-memory-statistics) and `Slab` in [/proc/meminfo](https://man7.org/linux/man-pages/man5/proc.5.html).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_LINUX_SLAB_USAGE = 'system.memory.linux.slab.usage' as const;

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
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_USAGE = 'system.memory.usage' as const;

/**
 * Percentage of memory bytes in use.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_MEMORY_UTILIZATION = 'system.memory.utilization' as const;

/**
 * The number of connections.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_CONNECTION_COUNT = 'system.network.connection.count' as const;

/**
 * Deprecated, use `system.network.connection.count` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.network.connection.count`.
 */
export const METRIC_SYSTEM_NETWORK_CONNECTIONS = 'system.network.connections' as const;

/**
 * Count of packets that are dropped or discarded even though there was no error.
 *
 * @note Measured as:
 *
 *   - Linux: the `drop` column in `/proc/dev/net` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html))
 *   - Windows: [`InDiscards`/`OutDiscards`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
 *     from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.network.packet.dropped`.
 */
export const METRIC_SYSTEM_NETWORK_DROPPED = 'system.network.dropped' as const;

/**
 * Count of network errors detected.
 *
 * @note Measured as:
 *
 *   - Linux: the `errs` column in `/proc/net/dev` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html)).
 *   - Windows: [`InErrors`/`OutErrors`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
 *     from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2).
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_ERRORS = 'system.network.errors' as const;

/**
 * The number of bytes transmitted and received.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_IO = 'system.network.io' as const;

/**
 * The number of packets transferred.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_PACKET_COUNT = 'system.network.packet.count' as const;

/**
 * Count of packets that are dropped or discarded even though there was no error.
 *
 * @note Measured as:
 *
 *   - Linux: the `drop` column in `/proc/net/dev` ([source](https://web.archive.org/web/20180321091318/http://www.onlamp.com/pub/a/linux/2000/11/16/LinuxAdmin.html))
 *   - Windows: [`InDiscards`/`OutDiscards`](https://docs.microsoft.com/windows/win32/api/netioapi/ns-netioapi-mib_if_row2)
 *     from [`GetIfEntry2`](https://docs.microsoft.com/windows/win32/api/netioapi/nf-netioapi-getifentry2)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_NETWORK_PACKET_DROPPED = 'system.network.packet.dropped' as const;

/**
 * The number of packets transferred.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `system.network.packet.count`.
 */
export const METRIC_SYSTEM_NETWORK_PACKETS = 'system.network.packets' as const;

/**
 * The number of page faults.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_FAULTS = 'system.paging.faults' as const;

/**
 * The number of paging operations.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_OPERATIONS = 'system.paging.operations' as const;

/**
 * Unix swap or windows pagefile usage.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_USAGE = 'system.paging.usage' as const;

/**
 * Swap (unix) or pagefile (windows) utilization.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PAGING_UTILIZATION = 'system.paging.utilization' as const;

/**
 * Total number of processes in each state.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PROCESS_COUNT = 'system.process.count' as const;

/**
 * Total number of processes created over uptime of the host.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_SYSTEM_PROCESS_CREATED = 'system.process.created' as const;

/**
 * The time the system has been running.
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
 * @note The values can be retrieved from [`perf_hooks.PerformanceObserver(...).observe({ entryTypes: ['gc'] })`](https://nodejs.org/api/perf_hooks.html#performanceobserverobserveoptions)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_GC_DURATION = 'v8js.gc.duration' as const;

/**
 * Deprecated, use `v8js.memory.heap.space.available_size` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `v8js.memory.heap.space.available_size`.
 */
export const METRIC_V8JS_HEAP_SPACE_AVAILABLE_SIZE = 'v8js.heap.space.available_size' as const;

/**
 * Deprecated, use `v8js.memory.heap.space.physical_size` instead.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated Replaced by `v8js.memory.heap.space.physical_size`.
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
 * Heap space available size.
 *
 * @note Value can be retrieved from value `space_available_size` of [`v8.getHeapSpaceStatistics()`](https://nodejs.org/api/v8.html#v8getheapspacestatistics)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_MEMORY_HEAP_SPACE_AVAILABLE_SIZE = 'v8js.memory.heap.space.available_size' as const;

/**
 * Committed size of a heap space.
 *
 * @note Value can be retrieved from value `physical_space_size` of [`v8.getHeapSpaceStatistics()`](https://nodejs.org/api/v8.html#v8getheapspacestatistics)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_MEMORY_HEAP_SPACE_PHYSICAL_SIZE = 'v8js.memory.heap.space.physical_size' as const;

/**
 * Heap Memory size allocated.
 *
 * @note The value can be retrieved from value `space_used_size` of [`v8.getHeapSpaceStatistics()`](https://nodejs.org/api/v8.html#v8getheapspacestatistics)
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_V8JS_MEMORY_HEAP_USED = 'v8js.memory.heap.used' as const;

/**
 * The number of changes (pull requests/merge requests/changelists) in a repository, categorized by their state (e.g. open or merged).
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
 * The number of unique contributors to a repository.
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
 * The number of revisions (commits) a ref (branch) is ahead/behind the branch from the `vcs.ref.base.name` attribute.
 *
 * @note This metric should be reported for each `vcs.revision_delta.direction` value. For example if branch `a` is 3 commits behind and 2 commits ahead of `trunk`,
 * instrumentation **SHOULD** report two measurements: 3 and 2 (both positive numbers) and `vcs.ref.base.name` is set to `trunk`.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const METRIC_VCS_REF_REVISIONS_DELTA = 'vcs.ref.revisions_delta' as const;

/**
 * Time a ref (branch) created from the default branch (trunk) has existed. The `ref.type` attribute will always be `branch`.
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

