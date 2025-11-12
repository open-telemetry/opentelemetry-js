<!-- markdownlint-disable MD004 -->
# CHANGELOG

All notable changes to the semantic-conventions package will be documented in this file.

## Unreleased

### :boom: Breaking Changes

### :rocket: Features

### :bug: Bug Fixes

### :books: Documentation

### :house: Internal

## 1.38.0

### :rocket: Features

* feat: update semantic conventions to v1.38.0 [#6090](https://github.com/open-telemetry/opentelemetry-js/pull/6090) @trentm
  * Semantic Conventions v1.38.0: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1380) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *none*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *1 exported value changed, 40 newly deprecated exports, 1 newly undeprecated export, 157 added exports*

#### Unstable changes in v1.38.0

<details>
<summary>1 exported value changed</summary>

```js
ATTR_PROCESS_CONTEXT_SWITCH_TYPE // process.context_switch_type -> process.context_switch.type
```

</details>

<details>
<summary>40 newly deprecated exports</summary>

```js
METRIC_K8S_CRONJOB_ACTIVE_JOBS                  // k8s.cronjob.active_jobs: Replaced by `k8s.cronjob.job.active`.
METRIC_K8S_DAEMONSET_CURRENT_SCHEDULED_NODES    // k8s.daemonset.current_scheduled_nodes: Replaced by `k8s.daemonset.node.current_scheduled`.
METRIC_K8S_DAEMONSET_DESIRED_SCHEDULED_NODES    // k8s.daemonset.desired_scheduled_nodes: Replaced by `k8s.daemonset.node.desired_scheduled`.
METRIC_K8S_DAEMONSET_MISSCHEDULED_NODES         // k8s.daemonset.misscheduled_nodes: Replaced by `k8s.daemonset.node.misscheduled`.
METRIC_K8S_DAEMONSET_READY_NODES                // k8s.daemonset.ready_nodes: Replaced by `k8s.daemonset.node.ready`.
METRIC_K8S_DEPLOYMENT_AVAILABLE_PODS            // k8s.deployment.available_pods: Replaced by `k8s.deployment.pod.available`.
METRIC_K8S_DEPLOYMENT_DESIRED_PODS              // k8s.deployment.desired_pods: Replaced by `k8s.deployment.pod.desired`.
METRIC_K8S_HPA_CURRENT_PODS                     // k8s.hpa.current_pods: Replaced by `k8s.hpa.pod.current`.
METRIC_K8S_HPA_DESIRED_PODS                     // k8s.hpa.desired_pods: Replaced by `k8s.hpa.pod.desired`.
METRIC_K8S_HPA_MAX_PODS                         // k8s.hpa.max_pods: Replaced by `k8s.hpa.pod.max`.
METRIC_K8S_HPA_MIN_PODS                         // k8s.hpa.min_pods: Replaced by `k8s.hpa.pod.min`.
METRIC_K8S_JOB_ACTIVE_PODS                      // k8s.job.active_pods: Replaced by `k8s.job.pod.active`.
METRIC_K8S_JOB_DESIRED_SUCCESSFUL_PODS          // k8s.job.desired_successful_pods: Replaced by `k8s.job.pod.desired_successful`.
METRIC_K8S_JOB_FAILED_PODS                      // k8s.job.failed_pods: Replaced by `k8s.job.pod.failed`.
METRIC_K8S_JOB_MAX_PARALLEL_PODS                // k8s.job.max_parallel_pods: Replaced by `k8s.job.pod.max_parallel`.
METRIC_K8S_JOB_SUCCESSFUL_PODS                  // k8s.job.successful_pods: Replaced by `k8s.job.pod.successful`.
METRIC_K8S_NODE_ALLOCATABLE_CPU                 // k8s.node.allocatable.cpu: Replaced by `k8s.node.cpu.allocatable`.
METRIC_K8S_NODE_ALLOCATABLE_EPHEMERAL_STORAGE   // k8s.node.allocatable.ephemeral_storage: Replaced by `k8s.node.ephemeral_storage.allocatable`.
METRIC_K8S_NODE_ALLOCATABLE_MEMORY              // k8s.node.allocatable.memory: Replaced by `k8s.node.memory.allocatable`.
METRIC_K8S_NODE_ALLOCATABLE_PODS                // k8s.node.allocatable.pods: Replaced by `k8s.node.pod.allocatable`.
METRIC_K8S_REPLICASET_AVAILABLE_PODS            // k8s.replicaset.available_pods: Replaced by `k8s.replicaset.pod.available`.
METRIC_K8S_REPLICASET_DESIRED_PODS              // k8s.replicaset.desired_pods: Replaced by `k8s.replicaset.pod.desired`.
METRIC_K8S_REPLICATIONCONTROLLER_AVAILABLE_PODS // k8s.replicationcontroller.available_pods: Replaced by `k8s.replicationcontroller.pod.available`.
METRIC_K8S_REPLICATIONCONTROLLER_DESIRED_PODS   // k8s.replicationcontroller.desired_pods: Replaced by `k8s.replicationcontroller.pod.desired`.
METRIC_K8S_STATEFULSET_CURRENT_PODS             // k8s.statefulset.current_pods: Replaced by `k8s.statefulset.pod.current`.
METRIC_K8S_STATEFULSET_DESIRED_PODS             // k8s.statefulset.desired_pods: Replaced by `k8s.statefulset.pod.desired`.
METRIC_K8S_STATEFULSET_READY_PODS               // k8s.statefulset.ready_pods: Replaced by `k8s.statefulset.pod.ready`.
METRIC_K8S_STATEFULSET_UPDATED_PODS             // k8s.statefulset.updated_pods: Replaced by `k8s.statefulset.pod.updated`.
METRIC_RPC_CLIENT_REQUESTS_PER_RPC              // rpc.client.requests_per_rpc: Removed, no replacement at this time.
METRIC_RPC_CLIENT_RESPONSES_PER_RPC             // rpc.client.responses_per_rpc: Removed, no replacement at this time.
METRIC_RPC_SERVER_REQUESTS_PER_RPC              // rpc.server.requests_per_rpc: Removed, no replacement at this time.
METRIC_RPC_SERVER_RESPONSES_PER_RPC             // rpc.server.responses_per_rpc: Removed, no replacement at this time.
METRIC_V8JS_HEAP_SPACE_AVAILABLE_SIZE           // v8js.heap.space.available_size: Replaced by `v8js.memory.heap.space.available_size`.
METRIC_V8JS_HEAP_SPACE_PHYSICAL_SIZE            // v8js.heap.space.physical_size: Replaced by `v8js.memory.heap.space.physical_size`.
GEN_AI_SYSTEM_VALUE_AZ_AI_INFERENCE             // az.ai.inference: Replaced by `azure.ai.inference`.
GEN_AI_SYSTEM_VALUE_AZ_AI_OPENAI                // az.ai.openai: Replaced by `azure.ai.openai`.
ATTR_PROCESS_PAGING_FAULT_TYPE                  // process.paging.fault_type: Replaced by `system.paging.fault.type`.
ATTR_SYSTEM_CPU_LOGICAL_NUMBER                  // system.cpu.logical_number: Replaced by `cpu.logical_number`.
ATTR_SYSTEM_PAGING_TYPE                         // system.paging.type: Replaced by `system.paging.fault.type`.
ATTR_SYSTEM_PROCESS_STATUS                      // system.process.status: Replaced by `process.state`.
```

</details>

<details>
<summary>1 newly undeprecated export</summary>

```js
GEN_AI_SYSTEM_VALUE_XAI // xai
```

</details>

<details>
<summary>157 added exports</summary>

```js
METRIC_CONTAINER_MEMORY_AVAILABLE                                       // container.memory.available
METRIC_CONTAINER_MEMORY_PAGING_FAULTS                                   // container.memory.paging.faults
METRIC_CONTAINER_MEMORY_RSS                                             // container.memory.rss
METRIC_CONTAINER_MEMORY_WORKING_SET                                     // container.memory.working_set

METRIC_K8S_CONTAINER_CPU_LIMIT_UTILIZATION                              // k8s.container.cpu.limit_utilization
METRIC_K8S_CONTAINER_CPU_REQUEST_UTILIZATION                            // k8s.container.cpu.request_utilization
METRIC_K8S_CRONJOB_JOB_ACTIVE                                           // k8s.cronjob.job.active
METRIC_K8S_DAEMONSET_NODE_CURRENT_SCHEDULED                             // k8s.daemonset.node.current_scheduled
METRIC_K8S_DAEMONSET_NODE_DESIRED_SCHEDULED                             // k8s.daemonset.node.desired_scheduled
METRIC_K8S_DAEMONSET_NODE_MISSCHEDULED                                  // k8s.daemonset.node.misscheduled
METRIC_K8S_DAEMONSET_NODE_READY                                         // k8s.daemonset.node.ready
METRIC_K8S_DEPLOYMENT_POD_AVAILABLE                                     // k8s.deployment.pod.available
METRIC_K8S_DEPLOYMENT_POD_DESIRED                                       // k8s.deployment.pod.desired
METRIC_K8S_HPA_POD_CURRENT                                              // k8s.hpa.pod.current
METRIC_K8S_HPA_POD_DESIRED                                              // k8s.hpa.pod.desired
METRIC_K8S_HPA_POD_MAX                                                  // k8s.hpa.pod.max
METRIC_K8S_HPA_POD_MIN                                                  // k8s.hpa.pod.min
METRIC_K8S_JOB_POD_ACTIVE                                               // k8s.job.pod.active
METRIC_K8S_JOB_POD_DESIRED_SUCCESSFUL                                   // k8s.job.pod.desired_successful
METRIC_K8S_JOB_POD_FAILED                                               // k8s.job.pod.failed
METRIC_K8S_JOB_POD_MAX_PARALLEL                                         // k8s.job.pod.max_parallel
METRIC_K8S_JOB_POD_SUCCESSFUL                                           // k8s.job.pod.successful
METRIC_K8S_NODE_CPU_ALLOCATABLE                                         // k8s.node.cpu.allocatable
METRIC_K8S_NODE_EPHEMERAL_STORAGE_ALLOCATABLE                           // k8s.node.ephemeral_storage.allocatable
METRIC_K8S_NODE_MEMORY_ALLOCATABLE                                      // k8s.node.memory.allocatable
METRIC_K8S_NODE_MEMORY_AVAILABLE                                        // k8s.node.memory.available
METRIC_K8S_NODE_MEMORY_PAGING_FAULTS                                    // k8s.node.memory.paging.faults
METRIC_K8S_NODE_MEMORY_RSS                                              // k8s.node.memory.rss
METRIC_K8S_NODE_MEMORY_WORKING_SET                                      // k8s.node.memory.working_set
METRIC_K8S_NODE_POD_ALLOCATABLE                                         // k8s.node.pod.allocatable
METRIC_K8S_POD_MEMORY_AVAILABLE                                         // k8s.pod.memory.available
METRIC_K8S_POD_MEMORY_PAGING_FAULTS                                     // k8s.pod.memory.paging.faults
METRIC_K8S_POD_MEMORY_RSS                                               // k8s.pod.memory.rss
METRIC_K8S_POD_MEMORY_WORKING_SET                                       // k8s.pod.memory.working_set
METRIC_K8S_POD_STATUS_PHASE                                             // k8s.pod.status.phase
METRIC_K8S_POD_STATUS_REASON                                            // k8s.pod.status.reason
METRIC_K8S_REPLICASET_POD_AVAILABLE                                     // k8s.replicaset.pod.available
METRIC_K8S_REPLICASET_POD_DESIRED                                       // k8s.replicaset.pod.desired
METRIC_K8S_REPLICATIONCONTROLLER_POD_AVAILABLE                          // k8s.replicationcontroller.pod.available
METRIC_K8S_REPLICATIONCONTROLLER_POD_DESIRED                            // k8s.replicationcontroller.pod.desired
METRIC_K8S_STATEFULSET_POD_CURRENT                                      // k8s.statefulset.pod.current
METRIC_K8S_STATEFULSET_POD_DESIRED                                      // k8s.statefulset.pod.desired
METRIC_K8S_STATEFULSET_POD_READY                                        // k8s.statefulset.pod.ready
METRIC_K8S_STATEFULSET_POD_UPDATED                                      // k8s.statefulset.pod.updated

METRIC_NFS_CLIENT_NET_COUNT                                             // nfs.client.net.count
METRIC_NFS_CLIENT_NET_TCP_CONNECTION_ACCEPTED                           // nfs.client.net.tcp.connection.accepted
METRIC_NFS_CLIENT_OPERATION_COUNT                                       // nfs.client.operation.count
METRIC_NFS_CLIENT_PROCEDURE_COUNT                                       // nfs.client.procedure.count
METRIC_NFS_CLIENT_RPC_AUTHREFRESH_COUNT                                 // nfs.client.rpc.authrefresh.count
METRIC_NFS_CLIENT_RPC_COUNT                                             // nfs.client.rpc.count
METRIC_NFS_CLIENT_RPC_RETRANSMIT_COUNT                                  // nfs.client.rpc.retransmit.count
METRIC_NFS_SERVER_FH_STALE_COUNT                                        // nfs.server.fh.stale.count
METRIC_NFS_SERVER_IO                                                    // nfs.server.io
METRIC_NFS_SERVER_NET_COUNT                                             // nfs.server.net.count
METRIC_NFS_SERVER_NET_TCP_CONNECTION_ACCEPTED                           // nfs.server.net.tcp.connection.accepted
METRIC_NFS_SERVER_OPERATION_COUNT                                       // nfs.server.operation.count
METRIC_NFS_SERVER_PROCEDURE_COUNT                                       // nfs.server.procedure.count
METRIC_NFS_SERVER_REPCACHE_REQUESTS                                     // nfs.server.repcache.requests
METRIC_NFS_SERVER_RPC_COUNT                                             // nfs.server.rpc.count
METRIC_NFS_SERVER_THREAD_COUNT                                          // nfs.server.thread.count

METRIC_OPENSHIFT_CLUSTERQUOTA_CPU_LIMIT_HARD                            // openshift.clusterquota.cpu.limit.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_CPU_LIMIT_USED                            // openshift.clusterquota.cpu.limit.used
METRIC_OPENSHIFT_CLUSTERQUOTA_CPU_REQUEST_HARD                          // openshift.clusterquota.cpu.request.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_CPU_REQUEST_USED                          // openshift.clusterquota.cpu.request.used
METRIC_OPENSHIFT_CLUSTERQUOTA_EPHEMERAL_STORAGE_LIMIT_HARD              // openshift.clusterquota.ephemeral_storage.limit.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_EPHEMERAL_STORAGE_LIMIT_USED              // openshift.clusterquota.ephemeral_storage.limit.used
METRIC_OPENSHIFT_CLUSTERQUOTA_EPHEMERAL_STORAGE_REQUEST_HARD            // openshift.clusterquota.ephemeral_storage.request.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_EPHEMERAL_STORAGE_REQUEST_USED            // openshift.clusterquota.ephemeral_storage.request.used
METRIC_OPENSHIFT_CLUSTERQUOTA_HUGEPAGE_COUNT_REQUEST_HARD               // openshift.clusterquota.hugepage_count.request.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_HUGEPAGE_COUNT_REQUEST_USED               // openshift.clusterquota.hugepage_count.request.used
METRIC_OPENSHIFT_CLUSTERQUOTA_MEMORY_LIMIT_HARD                         // openshift.clusterquota.memory.limit.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_MEMORY_LIMIT_USED                         // openshift.clusterquota.memory.limit.used
METRIC_OPENSHIFT_CLUSTERQUOTA_MEMORY_REQUEST_HARD                       // openshift.clusterquota.memory.request.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_MEMORY_REQUEST_USED                       // openshift.clusterquota.memory.request.used
METRIC_OPENSHIFT_CLUSTERQUOTA_OBJECT_COUNT_HARD                         // openshift.clusterquota.object_count.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_OBJECT_COUNT_USED                         // openshift.clusterquota.object_count.used
METRIC_OPENSHIFT_CLUSTERQUOTA_PERSISTENTVOLUMECLAIM_COUNT_HARD          // openshift.clusterquota.persistentvolumeclaim_count.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_PERSISTENTVOLUMECLAIM_COUNT_USED          // openshift.clusterquota.persistentvolumeclaim_count.used
METRIC_OPENSHIFT_CLUSTERQUOTA_STORAGE_REQUEST_HARD                      // openshift.clusterquota.storage.request.hard
METRIC_OPENSHIFT_CLUSTERQUOTA_STORAGE_REQUEST_USED                      // openshift.clusterquota.storage.request.used

METRIC_SYSTEM_NETWORK_DROPPED                                           // system.network.dropped
METRIC_SYSTEM_NETWORK_PACKETS                                           // system.network.packets

METRIC_V8JS_MEMORY_HEAP_SPACE_AVAILABLE_SIZE                            // v8js.memory.heap.space.available_size
METRIC_V8JS_MEMORY_HEAP_SPACE_PHYSICAL_SIZE                             // v8js.memory.heap.space.physical_size

EVENT_GEN_AI_EVALUATION_RESULT                                          // gen_ai.evaluation.result

ATTR_APP_SCREEN_ID                                                      // app.screen.id
ATTR_APP_SCREEN_NAME                                                    // app.screen.name

ATTR_GCP_APPHUB_DESTINATION_APPLICATION_CONTAINER                       // gcp.apphub_destination.application.container
ATTR_GCP_APPHUB_DESTINATION_APPLICATION_ID                              // gcp.apphub_destination.application.id
ATTR_GCP_APPHUB_DESTINATION_APPLICATION_LOCATION                        // gcp.apphub_destination.application.location
ATTR_GCP_APPHUB_DESTINATION_SERVICE_CRITICALITY_TYPE                    // gcp.apphub_destination.service.criticality_type
  GCP_APPHUB_DESTINATION_SERVICE_CRITICALITY_TYPE_VALUE_HIGH              // "HIGH"
  GCP_APPHUB_DESTINATION_SERVICE_CRITICALITY_TYPE_VALUE_LOW               // "LOW"
  GCP_APPHUB_DESTINATION_SERVICE_CRITICALITY_TYPE_VALUE_MEDIUM            // "MEDIUM"
  GCP_APPHUB_DESTINATION_SERVICE_CRITICALITY_TYPE_VALUE_MISSION_CRITICAL  // "MISSION_CRITICAL"
ATTR_GCP_APPHUB_DESTINATION_SERVICE_ENVIRONMENT_TYPE                    // gcp.apphub_destination.service.environment_type
  GCP_APPHUB_DESTINATION_SERVICE_ENVIRONMENT_TYPE_VALUE_DEVELOPMENT       // "DEVELOPMENT"
  GCP_APPHUB_DESTINATION_SERVICE_ENVIRONMENT_TYPE_VALUE_PRODUCTION        // "PRODUCTION"
  GCP_APPHUB_DESTINATION_SERVICE_ENVIRONMENT_TYPE_VALUE_STAGING           // "STAGING"
  GCP_APPHUB_DESTINATION_SERVICE_ENVIRONMENT_TYPE_VALUE_TEST              // "TEST"
ATTR_GCP_APPHUB_DESTINATION_SERVICE_ID                                  // gcp.apphub_destination.service.id
ATTR_GCP_APPHUB_DESTINATION_WORKLOAD_CRITICALITY_TYPE                   // gcp.apphub_destination.workload.criticality_type
  GCP_APPHUB_DESTINATION_WORKLOAD_CRITICALITY_TYPE_VALUE_HIGH             // "HIGH"
  GCP_APPHUB_DESTINATION_WORKLOAD_CRITICALITY_TYPE_VALUE_LOW              // "LOW"
  GCP_APPHUB_DESTINATION_WORKLOAD_CRITICALITY_TYPE_VALUE_MEDIUM           // "MEDIUM"
  GCP_APPHUB_DESTINATION_WORKLOAD_CRITICALITY_TYPE_VALUE_MISSION_CRITICAL // "MISSION_CRITICAL"
ATTR_GCP_APPHUB_DESTINATION_WORKLOAD_ENVIRONMENT_TYPE                   // gcp.apphub_destination.workload.environment_type
  GCP_APPHUB_DESTINATION_WORKLOAD_ENVIRONMENT_TYPE_VALUE_DEVELOPMENT      // "DEVELOPMENT"
  GCP_APPHUB_DESTINATION_WORKLOAD_ENVIRONMENT_TYPE_VALUE_PRODUCTION       // "PRODUCTION"
  GCP_APPHUB_DESTINATION_WORKLOAD_ENVIRONMENT_TYPE_VALUE_STAGING          // "STAGING"
  GCP_APPHUB_DESTINATION_WORKLOAD_ENVIRONMENT_TYPE_VALUE_TEST             // "TEST"
ATTR_GCP_APPHUB_DESTINATION_WORKLOAD_ID                                 // gcp.apphub_destination.workload.id

ATTR_GEN_AI_EMBEDDINGS_DIMENSION_COUNT                                  // gen_ai.embeddings.dimension.count
ATTR_GEN_AI_EVALUATION_EXPLANATION                                      // gen_ai.evaluation.explanation
ATTR_GEN_AI_EVALUATION_NAME                                             // gen_ai.evaluation.name
ATTR_GEN_AI_EVALUATION_SCORE_LABEL                                      // gen_ai.evaluation.score.label
ATTR_GEN_AI_EVALUATION_SCORE_VALUE                                      // gen_ai.evaluation.score.value
ATTR_GEN_AI_TOOL_CALL_ARGUMENTS                                         // gen_ai.tool.call.arguments
ATTR_GEN_AI_TOOL_CALL_RESULT                                            // gen_ai.tool.call.result
ATTR_GEN_AI_TOOL_DEFINITIONS                                            // gen_ai.tool.definitions

HTTP_REQUEST_METHOD_VALUE_QUERY                                         // "QUERY"

ATTR_K8S_POD_STATUS_PHASE                                               // k8s.pod.status.phase
  K8S_POD_STATUS_PHASE_VALUE_FAILED                                       // "Failed"
  K8S_POD_STATUS_PHASE_VALUE_PENDING                                      // "Pending"
  K8S_POD_STATUS_PHASE_VALUE_RUNNING                                      // "Running"
  K8S_POD_STATUS_PHASE_VALUE_SUCCEEDED                                    // "Succeeded"
  K8S_POD_STATUS_PHASE_VALUE_UNKNOWN                                      // "Unknown"
ATTR_K8S_POD_STATUS_REASON                                              // k8s.pod.status.reason
  K8S_POD_STATUS_REASON_VALUE_EVICTED                                     // "Evicted"
  K8S_POD_STATUS_REASON_VALUE_NODE_AFFINITY                               // "NodeAffinity"
  K8S_POD_STATUS_REASON_VALUE_NODE_LOST                                   // "NodeLost"
  K8S_POD_STATUS_REASON_VALUE_SHUTDOWN                                    // "Shutdown"
  K8S_POD_STATUS_REASON_VALUE_UNEXPECTED_ADMISSION_ERROR                  // "UnexpectedAdmissionError"

ATTR_NFS_OPERATION_NAME                                                 // nfs.operation.name
ATTR_NFS_SERVER_REPCACHE_STATUS                                         // nfs.server.repcache.status

ATTR_ONC_RPC_PROCEDURE_NAME                                             // onc_rpc.procedure.name
ATTR_ONC_RPC_PROCEDURE_NUMBER                                           // onc_rpc.procedure.number
ATTR_ONC_RPC_PROGRAM_NAME                                               // onc_rpc.program.name
ATTR_ONC_RPC_VERSION                                                    // onc_rpc.version

ATTR_OPENSHIFT_CLUSTERQUOTA_NAME                                        // openshift.clusterquota.name
ATTR_OPENSHIFT_CLUSTERQUOTA_UID                                         // openshift.clusterquota.uid

ATTR_PPROF_LOCATION_IS_FOLDED                                           // pprof.location.is_folded
ATTR_PPROF_MAPPING_HAS_FILENAMES                                        // pprof.mapping.has_filenames
ATTR_PPROF_MAPPING_HAS_FUNCTIONS                                        // pprof.mapping.has_functions
ATTR_PPROF_MAPPING_HAS_INLINE_FRAMES                                    // pprof.mapping.has_inline_frames
ATTR_PPROF_MAPPING_HAS_LINE_NUMBERS                                     // pprof.mapping.has_line_numbers
ATTR_PPROF_PROFILE_COMMENT                                              // pprof.profile.comment

ATTR_PROCESS_STATE                                                      // process.state
  PROCESS_STATE_VALUE_DEFUNCT                                             // "defunct"
  PROCESS_STATE_VALUE_RUNNING                                             // "running"
  PROCESS_STATE_VALUE_SLEEPING                                            // "sleeping"
  PROCESS_STATE_VALUE_STOPPED                                             // "stopped"

RPC_SYSTEM_VALUE_JSONRPC                                                // "jsonrpc"
RPC_SYSTEM_VALUE_ONC_RPC                                                // "onc_rpc"

ATTR_SYSTEM_PAGING_FAULT_TYPE                                           // system.paging.fault.type
  SYSTEM_PAGING_FAULT_TYPE_VALUE_MAJOR                                    // "major"
  SYSTEM_PAGING_FAULT_TYPE_VALUE_MINOR                                    // "minor"
```

</details>

## 1.37.0

### :rocket: Features

* feat: add `EVENT_*` exports for event names in Semantic Conventions [#5832](https://github.com/open-telemetry/opentelemetry-js/pull/5832) @trentm

* feat: update semantic conventions to v1.37.0 [#5879](https://github.com/open-telemetry/opentelemetry-js/pull/5879) @trentm
  * Semantic Conventions v1.37.0: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1370) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *2 added exports*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *1 exported value changed, 6 newly deprecated exports, 1 newly undeprecated export, 246 added exports*

#### Stable changes in v1.37.0

<details open>
<summary>2 added exports</summary>

```js
EVENT_EXCEPTION                       // exception

ATTR_ASPNETCORE_USER_IS_AUTHENTICATED // aspnetcore.user.is_authenticated
```

</details>

#### Unstable changes in v1.37.0

<details>
<summary>1 exported value changed</summary>

```js
GEN_AI_SYSTEM_VALUE_AZ_AI_OPENAI // "azure.ai.openai" -> "az.ai.openai"
```

</details>

<details>
<summary>6 newly deprecated exports</summary>

```js
ATTR_CONTAINER_RUNTIME                         // container.runtime: Replaced by `container.runtime.name`.
ATTR_GEN_AI_OPENAI_REQUEST_SERVICE_TIER        // gen_ai.openai.request.service_tier: Replaced by `openai.request.service_tier`.
ATTR_GEN_AI_OPENAI_RESPONSE_SERVICE_TIER       // gen_ai.openai.response.service_tier: Replaced by `openai.response.service_tier`.
ATTR_GEN_AI_OPENAI_RESPONSE_SYSTEM_FINGERPRINT // gen_ai.openai.response.system_fingerprint: Replaced by `openai.response.system_fingerprint`.
ATTR_GEN_AI_SYSTEM                             // gen_ai.system: Replaced by `gen_ai.provider.name`.
GEN_AI_SYSTEM_VALUE_XAI                        // xai: Replaced by `x_ai`.
```

</details>

<details>
<summary>1 newly undeprecated export</summary>

```js
GEN_AI_SYSTEM_VALUE_AZ_AI_INFERENCE // az.ai.inference
```

</details>

<details>
<summary>246 added exports</summary>

```js
METRIC_ASPNETCORE_AUTHENTICATION_AUTHENTICATE_DURATION                            // aspnetcore.authentication.authenticate.duration
METRIC_ASPNETCORE_AUTHENTICATION_CHALLENGES                                       // aspnetcore.authentication.challenges
METRIC_ASPNETCORE_AUTHENTICATION_FORBIDS                                          // aspnetcore.authentication.forbids
METRIC_ASPNETCORE_AUTHENTICATION_SIGN_INS                                         // aspnetcore.authentication.sign_ins
METRIC_ASPNETCORE_AUTHENTICATION_SIGN_OUTS                                        // aspnetcore.authentication.sign_outs
METRIC_ASPNETCORE_AUTHORIZATION_ATTEMPTS                                          // aspnetcore.authorization.attempts
METRIC_ASPNETCORE_IDENTITY_SIGN_IN_AUTHENTICATE_DURATION                          // aspnetcore.identity.sign_in.authenticate.duration
METRIC_ASPNETCORE_IDENTITY_SIGN_IN_CHECK_PASSWORD_ATTEMPTS                        // aspnetcore.identity.sign_in.check_password_attempts
METRIC_ASPNETCORE_IDENTITY_SIGN_IN_SIGN_INS                                       // aspnetcore.identity.sign_in.sign_ins
METRIC_ASPNETCORE_IDENTITY_SIGN_IN_SIGN_OUTS                                      // aspnetcore.identity.sign_in.sign_outs
METRIC_ASPNETCORE_IDENTITY_SIGN_IN_TWO_FACTOR_CLIENTS_FORGOTTEN                   // aspnetcore.identity.sign_in.two_factor_clients_forgotten
METRIC_ASPNETCORE_IDENTITY_SIGN_IN_TWO_FACTOR_CLIENTS_REMEMBERED                  // aspnetcore.identity.sign_in.two_factor_clients_remembered
METRIC_ASPNETCORE_IDENTITY_USER_CHECK_PASSWORD_ATTEMPTS                           // aspnetcore.identity.user.check_password_attempts
METRIC_ASPNETCORE_IDENTITY_USER_CREATE_DURATION                                   // aspnetcore.identity.user.create.duration
METRIC_ASPNETCORE_IDENTITY_USER_DELETE_DURATION                                   // aspnetcore.identity.user.delete.duration
METRIC_ASPNETCORE_IDENTITY_USER_GENERATED_TOKENS                                  // aspnetcore.identity.user.generated_tokens
METRIC_ASPNETCORE_IDENTITY_USER_UPDATE_DURATION                                   // aspnetcore.identity.user.update.duration
METRIC_ASPNETCORE_IDENTITY_USER_VERIFY_TOKEN_ATTEMPTS                             // aspnetcore.identity.user.verify_token_attempts
METRIC_ASPNETCORE_MEMORY_POOL_ALLOCATED                                           // aspnetcore.memory_pool.allocated
METRIC_ASPNETCORE_MEMORY_POOL_EVICTED                                             // aspnetcore.memory_pool.evicted
METRIC_ASPNETCORE_MEMORY_POOL_POOLED                                              // aspnetcore.memory_pool.pooled
METRIC_ASPNETCORE_MEMORY_POOL_RENTED                                              // aspnetcore.memory_pool.rented

METRIC_CONTAINER_FILESYSTEM_AVAILABLE                                             // container.filesystem.available
METRIC_CONTAINER_FILESYSTEM_CAPACITY                                              // container.filesystem.capacity
METRIC_CONTAINER_FILESYSTEM_USAGE                                                 // container.filesystem.usage

METRIC_HW_BATTERY_CHARGE                                                          // hw.battery.charge
METRIC_HW_BATTERY_CHARGE_LIMIT                                                    // hw.battery.charge.limit
METRIC_HW_BATTERY_TIME_LEFT                                                       // hw.battery.time_left
METRIC_HW_CPU_SPEED                                                               // hw.cpu.speed
METRIC_HW_CPU_SPEED_LIMIT                                                         // hw.cpu.speed.limit
METRIC_HW_FAN_SPEED                                                               // hw.fan.speed
METRIC_HW_FAN_SPEED_LIMIT                                                         // hw.fan.speed.limit
METRIC_HW_FAN_SPEED_RATIO                                                         // hw.fan.speed_ratio
METRIC_HW_GPU_IO                                                                  // hw.gpu.io
METRIC_HW_GPU_MEMORY_LIMIT                                                        // hw.gpu.memory.limit
METRIC_HW_GPU_MEMORY_USAGE                                                        // hw.gpu.memory.usage
METRIC_HW_GPU_MEMORY_UTILIZATION                                                  // hw.gpu.memory.utilization
METRIC_HW_GPU_UTILIZATION                                                         // hw.gpu.utilization
METRIC_HW_LOGICAL_DISK_LIMIT                                                      // hw.logical_disk.limit
METRIC_HW_LOGICAL_DISK_USAGE                                                      // hw.logical_disk.usage
METRIC_HW_LOGICAL_DISK_UTILIZATION                                                // hw.logical_disk.utilization
METRIC_HW_MEMORY_SIZE                                                             // hw.memory.size
METRIC_HW_NETWORK_BANDWIDTH_LIMIT                                                 // hw.network.bandwidth.limit
METRIC_HW_NETWORK_BANDWIDTH_UTILIZATION                                           // hw.network.bandwidth.utilization
METRIC_HW_NETWORK_IO                                                              // hw.network.io
METRIC_HW_NETWORK_PACKETS                                                         // hw.network.packets
METRIC_HW_NETWORK_UP                                                              // hw.network.up
METRIC_HW_PHYSICAL_DISK_ENDURANCE_UTILIZATION                                     // hw.physical_disk.endurance_utilization
METRIC_HW_PHYSICAL_DISK_SIZE                                                      // hw.physical_disk.size
METRIC_HW_PHYSICAL_DISK_SMART                                                     // hw.physical_disk.smart
METRIC_HW_POWER_SUPPLY_LIMIT                                                      // hw.power_supply.limit
METRIC_HW_POWER_SUPPLY_USAGE                                                      // hw.power_supply.usage
METRIC_HW_POWER_SUPPLY_UTILIZATION                                                // hw.power_supply.utilization
METRIC_HW_TAPE_DRIVE_OPERATIONS                                                   // hw.tape_drive.operations
METRIC_HW_TEMPERATURE                                                             // hw.temperature
METRIC_HW_TEMPERATURE_LIMIT                                                       // hw.temperature.limit
METRIC_HW_VOLTAGE                                                                 // hw.voltage
METRIC_HW_VOLTAGE_LIMIT                                                           // hw.voltage.limit
METRIC_HW_VOLTAGE_NOMINAL                                                         // hw.voltage.nominal

METRIC_K8S_NODE_FILESYSTEM_AVAILABLE                                              // k8s.node.filesystem.available
METRIC_K8S_NODE_FILESYSTEM_CAPACITY                                               // k8s.node.filesystem.capacity
METRIC_K8S_NODE_FILESYSTEM_USAGE                                                  // k8s.node.filesystem.usage
METRIC_K8S_POD_FILESYSTEM_AVAILABLE                                               // k8s.pod.filesystem.available
METRIC_K8S_POD_FILESYSTEM_CAPACITY                                                // k8s.pod.filesystem.capacity
METRIC_K8S_POD_FILESYSTEM_USAGE                                                   // k8s.pod.filesystem.usage
METRIC_K8S_POD_VOLUME_AVAILABLE                                                   // k8s.pod.volume.available
METRIC_K8S_POD_VOLUME_CAPACITY                                                    // k8s.pod.volume.capacity
METRIC_K8S_POD_VOLUME_INODE_COUNT                                                 // k8s.pod.volume.inode.count
METRIC_K8S_POD_VOLUME_INODE_FREE                                                  // k8s.pod.volume.inode.free
METRIC_K8S_POD_VOLUME_INODE_USED                                                  // k8s.pod.volume.inode.used
METRIC_K8S_POD_VOLUME_USAGE                                                       // k8s.pod.volume.usage

METRIC_SYSTEM_NETWORK_PACKET_COUNT                                                // system.network.packet.count
METRIC_SYSTEM_NETWORK_PACKET_DROPPED                                              // system.network.packet.dropped

EVENT_APP_JANK                                                                    // app.jank
EVENT_APP_SCREEN_CLICK                                                            // app.screen.click
EVENT_APP_WIDGET_CLICK                                                            // app.widget.click
EVENT_AZ_RESOURCE_LOG                                                             // az.resource.log
EVENT_AZURE_RESOURCE_LOG                                                          // azure.resource.log
EVENT_BROWSER_WEB_VITAL                                                           // browser.web_vital
EVENT_DEVICE_APP_LIFECYCLE                                                        // device.app.lifecycle
EVENT_FEATURE_FLAG_EVALUATION                                                     // feature_flag.evaluation
EVENT_GEN_AI_ASSISTANT_MESSAGE                                                    // gen_ai.assistant.message
EVENT_GEN_AI_CHOICE                                                               // gen_ai.choice
EVENT_GEN_AI_CLIENT_INFERENCE_OPERATION_DETAILS                                   // gen_ai.client.inference.operation.details
EVENT_GEN_AI_SYSTEM_MESSAGE                                                       // gen_ai.system.message
EVENT_GEN_AI_TOOL_MESSAGE                                                         // gen_ai.tool.message
EVENT_GEN_AI_USER_MESSAGE                                                         // gen_ai.user.message
EVENT_RPC_MESSAGE                                                                 // rpc.message
EVENT_SESSION_END                                                                 // session.end
EVENT_SESSION_START                                                               // session.start

ATTR_APP_BUILD_ID                                                                 // app.build_id
ATTR_APP_JANK_FRAME_COUNT                                                         // app.jank.frame_count
ATTR_APP_JANK_PERIOD                                                              // app.jank.period
ATTR_APP_JANK_THRESHOLD                                                           // app.jank.threshold

ATTR_ASPNETCORE_AUTHENTICATION_RESULT                                             // aspnetcore.authentication.result
  ASPNETCORE_AUTHENTICATION_RESULT_VALUE_FAILURE                                    // "failure"
  ASPNETCORE_AUTHENTICATION_RESULT_VALUE_NONE                                       // "none"
  ASPNETCORE_AUTHENTICATION_RESULT_VALUE_SUCCESS                                    // "success"
ATTR_ASPNETCORE_AUTHENTICATION_SCHEME                                             // aspnetcore.authentication.scheme
ATTR_ASPNETCORE_AUTHORIZATION_POLICY                                              // aspnetcore.authorization.policy
ATTR_ASPNETCORE_AUTHORIZATION_RESULT                                              // aspnetcore.authorization.result
  ASPNETCORE_AUTHORIZATION_RESULT_VALUE_FAILURE                                     // "failure"
  ASPNETCORE_AUTHORIZATION_RESULT_VALUE_SUCCESS                                     // "success"
ATTR_ASPNETCORE_IDENTITY_ERROR_CODE                                               // aspnetcore.identity.error_code
ATTR_ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT                                    // aspnetcore.identity.password_check_result
  ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_FAILURE                           // "failure"
  ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_PASSWORD_MISSING                  // "password_missing"
  ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_SUCCESS                           // "success"
  ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_SUCCESS_REHASH_NEEDED             // "success_rehash_needed"
  ASPNETCORE_IDENTITY_PASSWORD_CHECK_RESULT_VALUE_USER_MISSING                      // "user_missing"
ATTR_ASPNETCORE_IDENTITY_RESULT                                                   // aspnetcore.identity.result
  ASPNETCORE_IDENTITY_RESULT_VALUE_FAILURE                                          // "failure"
  ASPNETCORE_IDENTITY_RESULT_VALUE_SUCCESS                                          // "success"
ATTR_ASPNETCORE_IDENTITY_SIGN_IN_RESULT                                           // aspnetcore.identity.sign_in.result
  ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_FAILURE                                  // "failure"
  ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_LOCKED_OUT                               // "locked_out"
  ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_NOT_ALLOWED                              // "not_allowed"
  ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_REQUIRES_TWO_FACTOR                      // "requires_two_factor"
  ASPNETCORE_IDENTITY_SIGN_IN_RESULT_VALUE_SUCCESS                                  // "success"
ATTR_ASPNETCORE_IDENTITY_SIGN_IN_TYPE                                             // aspnetcore.identity.sign_in.type
  ASPNETCORE_IDENTITY_SIGN_IN_TYPE_VALUE_EXTERNAL                                   // "external"
  ASPNETCORE_IDENTITY_SIGN_IN_TYPE_VALUE_PASSKEY                                    // "passkey"
  ASPNETCORE_IDENTITY_SIGN_IN_TYPE_VALUE_PASSWORD                                   // "password"
  ASPNETCORE_IDENTITY_SIGN_IN_TYPE_VALUE_TWO_FACTOR                                 // "two_factor"
  ASPNETCORE_IDENTITY_SIGN_IN_TYPE_VALUE_TWO_FACTOR_AUTHENTICATOR                   // "two_factor_authenticator"
  ASPNETCORE_IDENTITY_SIGN_IN_TYPE_VALUE_TWO_FACTOR_RECOVERY_CODE                   // "two_factor_recovery_code"
ATTR_ASPNETCORE_IDENTITY_TOKEN_PURPOSE                                            // aspnetcore.identity.token_purpose
  ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_OTHER                                     // "_OTHER"
  ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_CHANGE_EMAIL                              // "change_email"
  ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_CHANGE_PHONE_NUMBER                       // "change_phone_number"
  ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_EMAIL_CONFIRMATION                        // "email_confirmation"
  ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_RESET_PASSWORD                            // "reset_password"
  ASPNETCORE_IDENTITY_TOKEN_PURPOSE_VALUE_TWO_FACTOR                                // "two_factor"
ATTR_ASPNETCORE_IDENTITY_TOKEN_VERIFIED                                           // aspnetcore.identity.token_verified
  ASPNETCORE_IDENTITY_TOKEN_VERIFIED_VALUE_FAILURE                                  // "failure"
  ASPNETCORE_IDENTITY_TOKEN_VERIFIED_VALUE_SUCCESS                                  // "success"
ATTR_ASPNETCORE_IDENTITY_USER_UPDATE_TYPE                                         // aspnetcore.identity.user.update_type
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_OTHER                                  // "_OTHER"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ACCESS_FAILED                          // "access_failed"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ADD_CLAIMS                             // "add_claims"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ADD_LOGIN                              // "add_login"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ADD_PASSWORD                           // "add_password"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_ADD_TO_ROLES                           // "add_to_roles"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_CHANGE_EMAIL                           // "change_email"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_CHANGE_PASSWORD                        // "change_password"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_CHANGE_PHONE_NUMBER                    // "change_phone_number"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_CONFIRM_EMAIL                          // "confirm_email"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_GENERATE_NEW_TWO_FACTOR_RECOVERY_CODES // "generate_new_two_factor_recovery_codes"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_PASSWORD_REHASH                        // "password_rehash"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REDEEM_TWO_FACTOR_RECOVERY_CODE        // "redeem_two_factor_recovery_code"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_AUTHENTICATION_TOKEN            // "remove_authentication_token"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_CLAIMS                          // "remove_claims"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_FROM_ROLES                      // "remove_from_roles"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_LOGIN                           // "remove_login"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_PASSKEY                         // "remove_passkey"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REMOVE_PASSWORD                        // "remove_password"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_REPLACE_CLAIM                          // "replace_claim"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_RESET_ACCESS_FAILED_COUNT              // "reset_access_failed_count"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_RESET_AUTHENTICATOR_KEY                // "reset_authenticator_key"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_RESET_PASSWORD                         // "reset_password"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SECURITY_STAMP                         // "security_stamp"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_AUTHENTICATION_TOKEN               // "set_authentication_token"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_EMAIL                              // "set_email"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_LOCKOUT_ENABLED                    // "set_lockout_enabled"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_LOCKOUT_END_DATE                   // "set_lockout_end_date"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_PASSKEY                            // "set_passkey"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_PHONE_NUMBER                       // "set_phone_number"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_SET_TWO_FACTOR_ENABLED                 // "set_two_factor_enabled"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_UPDATE                                 // "update"
  ASPNETCORE_IDENTITY_USER_UPDATE_TYPE_VALUE_USER_NAME                              // "user_name"
ATTR_ASPNETCORE_IDENTITY_USER_TYPE                                                // aspnetcore.identity.user_type
ATTR_ASPNETCORE_MEMORY_POOL_OWNER                                                 // aspnetcore.memory_pool.owner
ATTR_ASPNETCORE_SIGN_IN_IS_PERSISTENT                                             // aspnetcore.sign_in.is_persistent

ATTR_CONTAINER_RUNTIME_DESCRIPTION                                                // container.runtime.description
ATTR_CONTAINER_RUNTIME_NAME                                                       // container.runtime.name
ATTR_CONTAINER_RUNTIME_VERSION                                                    // container.runtime.version

ATTR_GEN_AI_INPUT_MESSAGES                                                        // gen_ai.input.messages
ATTR_GEN_AI_OUTPUT_MESSAGES                                                       // gen_ai.output.messages
ATTR_GEN_AI_PROVIDER_NAME                                                         // gen_ai.provider.name
  GEN_AI_PROVIDER_NAME_VALUE_ANTHROPIC                                              // "anthropic"
  GEN_AI_PROVIDER_NAME_VALUE_AWS_BEDROCK                                            // "aws.bedrock"
  GEN_AI_PROVIDER_NAME_VALUE_AZURE_AI_INFERENCE                                     // "azure.ai.inference"
  GEN_AI_PROVIDER_NAME_VALUE_AZURE_AI_OPENAI                                        // "azure.ai.openai"
  GEN_AI_PROVIDER_NAME_VALUE_COHERE                                                 // "cohere"
  GEN_AI_PROVIDER_NAME_VALUE_DEEPSEEK                                               // "deepseek"
  GEN_AI_PROVIDER_NAME_VALUE_GCP_GEMINI                                             // "gcp.gemini"
  GEN_AI_PROVIDER_NAME_VALUE_GCP_GEN_AI                                             // "gcp.gen_ai"
  GEN_AI_PROVIDER_NAME_VALUE_GCP_VERTEX_AI                                          // "gcp.vertex_ai"
  GEN_AI_PROVIDER_NAME_VALUE_GROQ                                                   // "groq"
  GEN_AI_PROVIDER_NAME_VALUE_IBM_WATSONX_AI                                         // "ibm.watsonx.ai"
  GEN_AI_PROVIDER_NAME_VALUE_MISTRAL_AI                                             // "mistral_ai"
  GEN_AI_PROVIDER_NAME_VALUE_OPENAI                                                 // "openai"
  GEN_AI_PROVIDER_NAME_VALUE_PERPLEXITY                                             // "perplexity"
  GEN_AI_PROVIDER_NAME_VALUE_X_AI                                                   // "x_ai"
ATTR_GEN_AI_SYSTEM_INSTRUCTIONS                                                   // gen_ai.system_instructions

ATTR_HW_BATTERY_CAPACITY                                                          // hw.battery.capacity
ATTR_HW_BATTERY_CHEMISTRY                                                         // hw.battery.chemistry
ATTR_HW_BATTERY_STATE                                                             // hw.battery.state
  HW_BATTERY_STATE_VALUE_CHARGING                                                   // "charging"
  HW_BATTERY_STATE_VALUE_DISCHARGING                                                // "discharging"
ATTR_HW_BIOS_VERSION                                                              // hw.bios_version
ATTR_HW_DRIVER_VERSION                                                            // hw.driver_version
ATTR_HW_ENCLOSURE_TYPE                                                            // hw.enclosure.type
ATTR_HW_FIRMWARE_VERSION                                                          // hw.firmware_version
ATTR_HW_GPU_TASK                                                                  // hw.gpu.task
  HW_GPU_TASK_VALUE_DECODER                                                         // "decoder"
  HW_GPU_TASK_VALUE_ENCODER                                                         // "encoder"
  HW_GPU_TASK_VALUE_GENERAL                                                         // "general"
ATTR_HW_LIMIT_TYPE                                                                // hw.limit_type
  HW_LIMIT_TYPE_VALUE_CRITICAL                                                      // "critical"
  HW_LIMIT_TYPE_VALUE_DEGRADED                                                      // "degraded"
  HW_LIMIT_TYPE_VALUE_HIGH_CRITICAL                                                 // "high.critical"
  HW_LIMIT_TYPE_VALUE_HIGH_DEGRADED                                                 // "high.degraded"
  HW_LIMIT_TYPE_VALUE_LOW_CRITICAL                                                  // "low.critical"
  HW_LIMIT_TYPE_VALUE_LOW_DEGRADED                                                  // "low.degraded"
  HW_LIMIT_TYPE_VALUE_MAX                                                           // "max"
  HW_LIMIT_TYPE_VALUE_THROTTLED                                                     // "throttled"
  HW_LIMIT_TYPE_VALUE_TURBO                                                         // "turbo"
ATTR_HW_LOGICAL_DISK_RAID_LEVEL                                                   // hw.logical_disk.raid_level
ATTR_HW_LOGICAL_DISK_STATE                                                        // hw.logical_disk.state
  HW_LOGICAL_DISK_STATE_VALUE_FREE                                                  // "free"
  HW_LOGICAL_DISK_STATE_VALUE_USED                                                  // "used"
ATTR_HW_MEMORY_TYPE                                                               // hw.memory.type
ATTR_HW_MODEL                                                                     // hw.model
ATTR_HW_NETWORK_LOGICAL_ADDRESSES                                                 // hw.network.logical_addresses
ATTR_HW_NETWORK_PHYSICAL_ADDRESS                                                  // hw.network.physical_address
ATTR_HW_PHYSICAL_DISK_SMART_ATTRIBUTE                                             // hw.physical_disk.smart_attribute
ATTR_HW_PHYSICAL_DISK_STATE                                                       // hw.physical_disk.state
  HW_PHYSICAL_DISK_STATE_VALUE_REMAINING                                            // "remaining"
ATTR_HW_PHYSICAL_DISK_TYPE                                                        // hw.physical_disk.type
ATTR_HW_SENSOR_LOCATION                                                           // hw.sensor_location
ATTR_HW_SERIAL_NUMBER                                                             // hw.serial_number
HW_STATE_VALUE_NEEDS_CLEANING                                                     // "needs_cleaning"
HW_STATE_VALUE_PREDICTED_FAILURE                                                  // "predicted_failure"
ATTR_HW_TAPE_DRIVE_OPERATION_TYPE                                                 // hw.tape_drive.operation_type
  HW_TAPE_DRIVE_OPERATION_TYPE_VALUE_CLEAN                                          // "clean"
  HW_TAPE_DRIVE_OPERATION_TYPE_VALUE_MOUNT                                          // "mount"
  HW_TAPE_DRIVE_OPERATION_TYPE_VALUE_UNMOUNT                                        // "unmount"
ATTR_HW_VENDOR                                                                    // hw.vendor

MESSAGING_SYSTEM_VALUE_AWS_SNS                                                    // "aws.sns"

ATTR_OPENAI_REQUEST_SERVICE_TIER                                                  // openai.request.service_tier
  OPENAI_REQUEST_SERVICE_TIER_VALUE_AUTO                                            // "auto"
  OPENAI_REQUEST_SERVICE_TIER_VALUE_DEFAULT                                         // "default"
ATTR_OPENAI_RESPONSE_SERVICE_TIER                                                 // openai.response.service_tier
ATTR_OPENAI_RESPONSE_SYSTEM_FINGERPRINT                                           // openai.response.system_fingerprint

ATTR_OTEL_SCOPE_SCHEMA_URL                                                        // otel.scope.schema_url
```

</details>

### :bug: Bug Fixes

* fix: prioritize `esnext` export condition as it is more specific [#5458](https://github.com/open-telemetry/opentelemetry-js/pull/5458)

## 1.36.0

### :rocket: Features

* feat: update semantic conventions to v1.36.0 [#5779](https://github.com/open-telemetry/opentelemetry-js/pull/5779) @trentm
  * Semantic Conventions v1.36.0: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1360) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *none*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *8 exported values changed, 7 newly deprecated exports, 3 newly undeprecated exports, 88 added exports*

#### Unstable changes in v1.36.0

<details>
<summary>8 exported values changed</summary>

```js
CLOUD_PLATFORM_VALUE_AZURE_AKS                 // "azure_aks" -> "azure.aks"
CLOUD_PLATFORM_VALUE_AZURE_APP_SERVICE         // "azure_app_service" -> "azure.app_service"
CLOUD_PLATFORM_VALUE_AZURE_CONTAINER_APPS      // "azure_container_apps" -> "azure.container_apps"
CLOUD_PLATFORM_VALUE_AZURE_CONTAINER_INSTANCES // "azure_container_instances" -> "azure.container_instances"
CLOUD_PLATFORM_VALUE_AZURE_FUNCTIONS           // "azure_functions" -> "azure.functions"
CLOUD_PLATFORM_VALUE_AZURE_OPENSHIFT           // "azure_openshift" -> "azure.openshift"
CLOUD_PLATFORM_VALUE_AZURE_VM                  // "azure_vm" -> "azure.vm"
GEN_AI_SYSTEM_VALUE_AZ_AI_OPENAI               // "az.ai.openai" -> "azure.ai.openai"
```

</details>

<details>
<summary>7 newly deprecated exports</summary>

```js
METRIC_CPU_FREQUENCY              // cpu.frequency: Replaced by `system.cpu.frequency`.
METRIC_CPU_TIME                   // cpu.time: Replaced by `system.cpu.time`.
METRIC_CPU_UTILIZATION            // cpu.utilization: Replaced by `system.cpu.utilization`.
METRIC_OTEL_SDK_SPAN_ENDED        // otel.sdk.span.ended: Obsoleted.
METRIC_SYSTEM_NETWORK_CONNECTIONS // system.network.connections: Replaced by `system.network.connection.count`.
ATTR_AZ_NAMESPACE                 // az.namespace: Replaced by `azure.resource_provider.namespace`.
ATTR_AZ_SERVICE_REQUEST_ID        // az.service_request_id: Replaced by `azure.service.request.id`.
```

</details>

<details>
<summary>3 newly undeprecated exports</summary>

```js
METRIC_SYSTEM_CPU_FREQUENCY   // system.cpu.frequency
METRIC_SYSTEM_CPU_TIME        // system.cpu.time
METRIC_SYSTEM_CPU_UTILIZATION // system.cpu.utilization
```

</details>

<details>
<summary>88 added exports</summary>

```js
METRIC_K8S_CONTAINER_CPU_LIMIT                                  // k8s.container.cpu.limit
METRIC_K8S_CONTAINER_CPU_REQUEST                                // k8s.container.cpu.request
METRIC_K8S_CONTAINER_EPHEMERAL_STORAGE_LIMIT                    // k8s.container.ephemeral_storage.limit
METRIC_K8S_CONTAINER_EPHEMERAL_STORAGE_REQUEST                  // k8s.container.ephemeral_storage.request
METRIC_K8S_CONTAINER_MEMORY_LIMIT                               // k8s.container.memory.limit
METRIC_K8S_CONTAINER_MEMORY_REQUEST                             // k8s.container.memory.request
METRIC_K8S_CONTAINER_READY                                      // k8s.container.ready
METRIC_K8S_CONTAINER_RESTART_COUNT                              // k8s.container.restart.count
METRIC_K8S_CONTAINER_STATUS_REASON                              // k8s.container.status.reason
METRIC_K8S_CONTAINER_STATUS_STATE                               // k8s.container.status.state
METRIC_K8S_CONTAINER_STORAGE_LIMIT                              // k8s.container.storage.limit
METRIC_K8S_CONTAINER_STORAGE_REQUEST                            // k8s.container.storage.request
METRIC_K8S_HPA_METRIC_TARGET_CPU_AVERAGE_UTILIZATION            // k8s.hpa.metric.target.cpu.average_utilization
METRIC_K8S_HPA_METRIC_TARGET_CPU_AVERAGE_VALUE                  // k8s.hpa.metric.target.cpu.average_value
METRIC_K8S_HPA_METRIC_TARGET_CPU_VALUE                          // k8s.hpa.metric.target.cpu.value
METRIC_K8S_NODE_ALLOCATABLE_CPU                                 // k8s.node.allocatable.cpu
METRIC_K8S_NODE_ALLOCATABLE_EPHEMERAL_STORAGE                   // k8s.node.allocatable.ephemeral_storage
METRIC_K8S_NODE_ALLOCATABLE_MEMORY                              // k8s.node.allocatable.memory
METRIC_K8S_NODE_ALLOCATABLE_PODS                                // k8s.node.allocatable.pods
METRIC_K8S_NODE_CONDITION_STATUS                                // k8s.node.condition.status
METRIC_K8S_RESOURCEQUOTA_CPU_LIMIT_HARD                         // k8s.resourcequota.cpu.limit.hard
METRIC_K8S_RESOURCEQUOTA_CPU_LIMIT_USED                         // k8s.resourcequota.cpu.limit.used
METRIC_K8S_RESOURCEQUOTA_CPU_REQUEST_HARD                       // k8s.resourcequota.cpu.request.hard
METRIC_K8S_RESOURCEQUOTA_CPU_REQUEST_USED                       // k8s.resourcequota.cpu.request.used
METRIC_K8S_RESOURCEQUOTA_EPHEMERAL_STORAGE_LIMIT_HARD           // k8s.resourcequota.ephemeral_storage.limit.hard
METRIC_K8S_RESOURCEQUOTA_EPHEMERAL_STORAGE_LIMIT_USED           // k8s.resourcequota.ephemeral_storage.limit.used
METRIC_K8S_RESOURCEQUOTA_EPHEMERAL_STORAGE_REQUEST_HARD         // k8s.resourcequota.ephemeral_storage.request.hard
METRIC_K8S_RESOURCEQUOTA_EPHEMERAL_STORAGE_REQUEST_USED         // k8s.resourcequota.ephemeral_storage.request.used
METRIC_K8S_RESOURCEQUOTA_HUGEPAGE_COUNT_REQUEST_HARD            // k8s.resourcequota.hugepage_count.request.hard
METRIC_K8S_RESOURCEQUOTA_HUGEPAGE_COUNT_REQUEST_USED            // k8s.resourcequota.hugepage_count.request.used
METRIC_K8S_RESOURCEQUOTA_MEMORY_LIMIT_HARD                      // k8s.resourcequota.memory.limit.hard
METRIC_K8S_RESOURCEQUOTA_MEMORY_LIMIT_USED                      // k8s.resourcequota.memory.limit.used
METRIC_K8S_RESOURCEQUOTA_MEMORY_REQUEST_HARD                    // k8s.resourcequota.memory.request.hard
METRIC_K8S_RESOURCEQUOTA_MEMORY_REQUEST_USED                    // k8s.resourcequota.memory.request.used
METRIC_K8S_RESOURCEQUOTA_OBJECT_COUNT_HARD                      // k8s.resourcequota.object_count.hard
METRIC_K8S_RESOURCEQUOTA_OBJECT_COUNT_USED                      // k8s.resourcequota.object_count.used
METRIC_K8S_RESOURCEQUOTA_PERSISTENTVOLUMECLAIM_COUNT_HARD       // k8s.resourcequota.persistentvolumeclaim_count.hard
METRIC_K8S_RESOURCEQUOTA_PERSISTENTVOLUMECLAIM_COUNT_USED       // k8s.resourcequota.persistentvolumeclaim_count.used
METRIC_K8S_RESOURCEQUOTA_STORAGE_REQUEST_HARD                   // k8s.resourcequota.storage.request.hard
METRIC_K8S_RESOURCEQUOTA_STORAGE_REQUEST_USED                   // k8s.resourcequota.storage.request.used

METRIC_OTEL_SDK_SPAN_STARTED                                    // otel.sdk.span.started

METRIC_SYSTEM_NETWORK_CONNECTION_COUNT                          // system.network.connection.count

ATTR_AZURE_RESOURCE_PROVIDER_NAMESPACE                          // azure.resource_provider.namespace
ATTR_AZURE_SERVICE_REQUEST_ID                                   // azure.service.request.id

ATTR_DNS_ANSWERS                                                // dns.answers

GEN_AI_SYSTEM_VALUE_AZURE_AI_INFERENCE                          // "azure.ai.inference"
GEN_AI_SYSTEM_VALUE_AZURE_AI_OPENAI                             // "azure.ai.openai"

ATTR_K8S_CONTAINER_STATUS_REASON                                // k8s.container.status.reason
  K8S_CONTAINER_STATUS_REASON_VALUE_COMPLETED                     // "Completed"
  K8S_CONTAINER_STATUS_REASON_VALUE_CONTAINER_CANNOT_RUN          // "ContainerCannotRun"
  K8S_CONTAINER_STATUS_REASON_VALUE_CONTAINER_CREATING            // "ContainerCreating"
  K8S_CONTAINER_STATUS_REASON_VALUE_CRASH_LOOP_BACK_OFF           // "CrashLoopBackOff"
  K8S_CONTAINER_STATUS_REASON_VALUE_CREATE_CONTAINER_CONFIG_ERROR // "CreateContainerConfigError"
  K8S_CONTAINER_STATUS_REASON_VALUE_ERR_IMAGE_PULL                // "ErrImagePull"
  K8S_CONTAINER_STATUS_REASON_VALUE_ERROR                         // "Error"
  K8S_CONTAINER_STATUS_REASON_VALUE_IMAGE_PULL_BACK_OFF           // "ImagePullBackOff"
  K8S_CONTAINER_STATUS_REASON_VALUE_OOM_KILLED                    // "OOMKilled"
ATTR_K8S_CONTAINER_STATUS_STATE                                 // k8s.container.status.state
  K8S_CONTAINER_STATUS_STATE_VALUE_RUNNING                        // "running"
  K8S_CONTAINER_STATUS_STATE_VALUE_TERMINATED                     // "terminated"
  K8S_CONTAINER_STATUS_STATE_VALUE_WAITING                        // "waiting"
ATTR_K8S_HPA_METRIC_TYPE                                        // k8s.hpa.metric.type
ATTR_K8S_HPA_SCALETARGETREF_API_VERSION                         // k8s.hpa.scaletargetref.api_version
ATTR_K8S_HPA_SCALETARGETREF_KIND                                // k8s.hpa.scaletargetref.kind
ATTR_K8S_HPA_SCALETARGETREF_NAME                                // k8s.hpa.scaletargetref.name
ATTR_K8S_HUGEPAGE_SIZE                                          // k8s.hugepage.size
ATTR_K8S_NODE_CONDITION_STATUS                                  // k8s.node.condition.status
  K8S_NODE_CONDITION_STATUS_VALUE_CONDITION_FALSE                 // "false"
  K8S_NODE_CONDITION_STATUS_VALUE_CONDITION_TRUE                  // "true"
  K8S_NODE_CONDITION_STATUS_VALUE_CONDITION_UNKNOWN               // "unknown"
ATTR_K8S_NODE_CONDITION_TYPE                                    // k8s.node.condition.type
  K8S_NODE_CONDITION_TYPE_VALUE_DISK_PRESSURE                     // "DiskPressure"
  K8S_NODE_CONDITION_TYPE_VALUE_MEMORY_PRESSURE                   // "MemoryPressure"
  K8S_NODE_CONDITION_TYPE_VALUE_NETWORK_UNAVAILABLE               // "NetworkUnavailable"
  K8S_NODE_CONDITION_TYPE_VALUE_PID_PRESSURE                      // "PIDPressure"
  K8S_NODE_CONDITION_TYPE_VALUE_READY                             // "Ready"
ATTR_K8S_RESOURCEQUOTA_RESOURCE_NAME                            // k8s.resourcequota.resource_name
ATTR_K8S_STORAGECLASS_NAME                                      // k8s.storageclass.name

ATTR_MAINFRAME_LPAR_NAME                                        // mainframe.lpar.name

OS_TYPE_VALUE_ZOS                                               // "zos"

OTEL_COMPONENT_TYPE_VALUE_PROMETHEUS_HTTP_TEXT_METRIC_EXPORTER  // "prometheus_http_text_metric_exporter"
OTEL_COMPONENT_TYPE_VALUE_ZIPKIN_HTTP_SPAN_EXPORTER             // "zipkin_http_span_exporter"
ATTR_OTEL_SPAN_PARENT_ORIGIN                                    // otel.span.parent.origin
  OTEL_SPAN_PARENT_ORIGIN_VALUE_LOCAL                             // "local"
  OTEL_SPAN_PARENT_ORIGIN_VALUE_NONE                              // "none"
  OTEL_SPAN_PARENT_ORIGIN_VALUE_REMOTE                            // "remote"

ATTR_ZOS_SMF_ID                                                 // zos.smf.id
ATTR_ZOS_SYSPLEX_NAME                                           // zos.sysplex.name
```

</details>

## 1.35.0

**Known issue:** Changes from semantic conventions **v1.36.0** where accidentally released in this JS package with version **1.35.0**. Please use `@opentelemetry/semantic-conventions@1.36.0`.

### :rocket: Features

* feat: update semantic conventions to v1.36.0 [#5779](https://github.com/open-telemetry/opentelemetry-js/pull/5779) @trentm
  * Changes from semantic conventions **v1.36.0** were incorrectly included in this release. See note above.

* feat: improve the jsdoc comment on exported constants for enum values [#5784](https://github.com/open-telemetry/opentelemetry-js/pull/5784) @trentm
  * The jsdoc comment for enum values now includes the 'brief', an
    `@experimental` tag, and a `@deprecated` tag if the corresponding fields
    exist on the semconv definition.

## 1.34.0

### :rocket: Features

* feat: update semantic conventions to v1.34.0 [#5703](https://github.com/open-telemetry/opentelemetry-js/pull/5703) @trentm
  * Semantic Conventions v1.34.0: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1340) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *none*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *12 added exports*

#### Unstable changes in v1.34.0

<details>
<summary>12 added exports</summary>

```js
ATTR_AWS_BEDROCK_GUARDRAIL_ID             // aws.bedrock.guardrail.id
ATTR_AWS_BEDROCK_KNOWLEDGE_BASE_ID        // aws.bedrock.knowledge_base.id
ATTR_AWS_KINESIS_STREAM_NAME              // aws.kinesis.stream_name
ATTR_AWS_LAMBDA_RESOURCE_MAPPING_ID       // aws.lambda.resource_mapping.id
ATTR_AWS_SECRETSMANAGER_SECRET_ARN        // aws.secretsmanager.secret.arn
ATTR_AWS_SNS_TOPIC_ARN                    // aws.sns.topic.arn
ATTR_AWS_SQS_QUEUE_URL                    // aws.sqs.queue.url
ATTR_AWS_STEP_FUNCTIONS_ACTIVITY_ARN      // aws.step_functions.activity.arn
ATTR_AWS_STEP_FUNCTIONS_STATE_MACHINE_ARN // aws.step_functions.state_machine.arn

ATTR_FEATURE_FLAG_RESULT_VALUE            // feature_flag.result.value

ATTR_GEN_AI_CONVERSATION_ID               // gen_ai.conversation.id
ATTR_GEN_AI_DATA_SOURCE_ID                // gen_ai.data_source.id
```

</details>

## 1.33.1

### :boom: Breaking Changes

* fix: Remove the subset of `DB_SYSTEM_NAME_VALUE_*` exports that are unstable from the `@opentelemetry/semantic-conventions` entry point. [#5690](https://github.com/open-telemetry/opentelemetry-js/pull/5690)
  * Version 1.33.0 erroneously included all `DB_SYSTEM_NAME_VALUE_*` constants in the stable entry point. Some of those enum values are not yet stable. They have been moved back to the unstable `@opentelemetry/semantic-conventions/incubating` entry point. See the PR description for a full list.

## 1.33.0

### :rocket: Features

* feat: update semantic conventions to v1.33.0 [#5654](https://github.com/open-telemetry/opentelemetry-js/pull/5654) @trentm
  * Semantic Conventions v1.33.0: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1330) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *56 added exports*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *1 exported value changed, 6 newly deprecated exports, 1 newly undeprecated export, 57 added exports*

#### Stable changes in v1.33.0

<details open>
<summary>56 added exports</summary>

```js
METRIC_DB_CLIENT_OPERATION_DURATION       // db.client.operation.duration

ATTR_CODE_COLUMN_NUMBER                   // code.column.number
ATTR_CODE_FILE_PATH                       // code.file.path
ATTR_CODE_FUNCTION_NAME                   // code.function.name
ATTR_CODE_LINE_NUMBER                     // code.line.number
ATTR_CODE_STACKTRACE                      // code.stacktrace

ATTR_DB_COLLECTION_NAME                   // db.collection.name
ATTR_DB_NAMESPACE                         // db.namespace
ATTR_DB_OPERATION_BATCH_SIZE              // db.operation.batch.size
ATTR_DB_OPERATION_NAME                    // db.operation.name
ATTR_DB_QUERY_SUMMARY                     // db.query.summary
ATTR_DB_QUERY_TEXT                        // db.query.text
ATTR_DB_RESPONSE_STATUS_CODE              // db.response.status_code
ATTR_DB_STORED_PROCEDURE_NAME             // db.stored_procedure.name
ATTR_DB_SYSTEM_NAME                       // db.system.name
  DB_SYSTEM_NAME_VALUE_ACTIAN_INGRES        // "actian.ingres"
  DB_SYSTEM_NAME_VALUE_AWS_DYNAMODB         // "aws.dynamodb"
  DB_SYSTEM_NAME_VALUE_AWS_REDSHIFT         // "aws.redshift"
  DB_SYSTEM_NAME_VALUE_AZURE_COSMOSDB       // "azure.cosmosdb"
  DB_SYSTEM_NAME_VALUE_CASSANDRA            // "cassandra"
  DB_SYSTEM_NAME_VALUE_CLICKHOUSE           // "clickhouse"
  DB_SYSTEM_NAME_VALUE_COCKROACHDB          // "cockroachdb"
  DB_SYSTEM_NAME_VALUE_COUCHBASE            // "couchbase"
  DB_SYSTEM_NAME_VALUE_COUCHDB              // "couchdb"
  DB_SYSTEM_NAME_VALUE_DERBY                // "derby"
  DB_SYSTEM_NAME_VALUE_ELASTICSEARCH        // "elasticsearch"
  DB_SYSTEM_NAME_VALUE_FIREBIRDSQL          // "firebirdsql"
  DB_SYSTEM_NAME_VALUE_GCP_SPANNER          // "gcp.spanner"
  DB_SYSTEM_NAME_VALUE_GEODE                // "geode"
  DB_SYSTEM_NAME_VALUE_H2DATABASE           // "h2database"
  DB_SYSTEM_NAME_VALUE_HBASE                // "hbase"
  DB_SYSTEM_NAME_VALUE_HIVE                 // "hive"
  DB_SYSTEM_NAME_VALUE_HSQLDB               // "hsqldb"
  DB_SYSTEM_NAME_VALUE_IBM_DB2              // "ibm.db2"
  DB_SYSTEM_NAME_VALUE_IBM_INFORMIX         // "ibm.informix"
  DB_SYSTEM_NAME_VALUE_IBM_NETEZZA          // "ibm.netezza"
  DB_SYSTEM_NAME_VALUE_INFLUXDB             // "influxdb"
  DB_SYSTEM_NAME_VALUE_INSTANTDB            // "instantdb"
  DB_SYSTEM_NAME_VALUE_INTERSYSTEMS_CACHE   // "intersystems.cache"
  DB_SYSTEM_NAME_VALUE_MARIADB              // "mariadb"
  DB_SYSTEM_NAME_VALUE_MEMCACHED            // "memcached"
  DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER // "microsoft.sql_server"
  DB_SYSTEM_NAME_VALUE_MONGODB              // "mongodb"
  DB_SYSTEM_NAME_VALUE_MYSQL                // "mysql"
  DB_SYSTEM_NAME_VALUE_NEO4J                // "neo4j"
  DB_SYSTEM_NAME_VALUE_OPENSEARCH           // "opensearch"
  DB_SYSTEM_NAME_VALUE_ORACLE_DB            // "oracle.db"
  DB_SYSTEM_NAME_VALUE_OTHER_SQL            // "other_sql"
  DB_SYSTEM_NAME_VALUE_POSTGRESQL           // "postgresql"
  DB_SYSTEM_NAME_VALUE_REDIS                // "redis"
  DB_SYSTEM_NAME_VALUE_SAP_HANA             // "sap.hana"
  DB_SYSTEM_NAME_VALUE_SAP_MAXDB            // "sap.maxdb"
  DB_SYSTEM_NAME_VALUE_SOFTWAREAG_ADABAS    // "softwareag.adabas"
  DB_SYSTEM_NAME_VALUE_SQLITE               // "sqlite"
  DB_SYSTEM_NAME_VALUE_TERADATA             // "teradata"
  DB_SYSTEM_NAME_VALUE_TRINO                // "trino"
```

</details>

#### Unstable changes in v1.33.0

<details>
<summary>1 exported value changed</summary>

```js
ATTR_FEATURE_FLAG_PROVIDER_NAME // feature_flag.provider_name -> feature_flag.provider.name
```

</details>

<details>
<summary>6 newly deprecated exports</summary>

```js
METRIC_OTEL_SDK_EXPORTER_SPAN_EXPORTED_COUNT   // otel.sdk.exporter.span.exported.count: Renamed to `otel.sdk.exporter.span.exported`.
METRIC_OTEL_SDK_EXPORTER_SPAN_INFLIGHT_COUNT   // otel.sdk.exporter.span.inflight.count: Renamed to `otel.sdk.exporter.span.inflight`.
METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED_COUNT // otel.sdk.processor.span.processed.count: Renamed to `otel.sdk.processor.span.processed`.
METRIC_OTEL_SDK_SPAN_ENDED_COUNT               // otel.sdk.span.ended.count: Renamed to `otel.sdk.span.ended`.
METRIC_OTEL_SDK_SPAN_LIVE_COUNT                // otel.sdk.span.live.count: Renamed to `otel.sdk.span.live`.
ATTR_FEATURE_FLAG_EVALUATION_ERROR_MESSAGE     // feature_flag.evaluation.error.message: Replaced by `error.message`.
```

</details>

<details>
<summary>1 newly undeprecated export</summary>

```js
ATTR_DB_QUERY_PARAMETER // (key) => `db.query.parameter.${key}`
```

</details>

<details>
<summary>57 added exports</summary>

```js
METRIC_JVM_FILE_DESCRIPTOR_COUNT                         // jvm.file_descriptor.count

METRIC_OTEL_SDK_EXPORTER_METRIC_DATA_POINT_EXPORTED      // otel.sdk.exporter.metric_data_point.exported
METRIC_OTEL_SDK_EXPORTER_METRIC_DATA_POINT_INFLIGHT      // otel.sdk.exporter.metric_data_point.inflight
METRIC_OTEL_SDK_EXPORTER_OPERATION_DURATION              // otel.sdk.exporter.operation.duration
METRIC_OTEL_SDK_EXPORTER_SPAN_EXPORTED                   // otel.sdk.exporter.span.exported
METRIC_OTEL_SDK_EXPORTER_SPAN_INFLIGHT                   // otel.sdk.exporter.span.inflight
METRIC_OTEL_SDK_METRIC_READER_COLLECTION_DURATION        // otel.sdk.metric_reader.collection.duration
METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED                 // otel.sdk.processor.span.processed
METRIC_OTEL_SDK_SPAN_ENDED                               // otel.sdk.span.ended
METRIC_OTEL_SDK_SPAN_LIVE                                // otel.sdk.span.live

ATTR_APP_SCREEN_COORDINATE_X                             // app.screen.coordinate.x
ATTR_APP_SCREEN_COORDINATE_Y                             // app.screen.coordinate.y
ATTR_APP_WIDGET_ID                                       // app.widget.id
ATTR_APP_WIDGET_NAME                                     // app.widget.name

ATTR_CICD_PIPELINE_ACTION_NAME                           // cicd.pipeline.action.name
  CICD_PIPELINE_ACTION_NAME_VALUE_BUILD                    // "BUILD"
  CICD_PIPELINE_ACTION_NAME_VALUE_RUN                      // "RUN"
  CICD_PIPELINE_ACTION_NAME_VALUE_SYNC                     // "SYNC"
ATTR_CICD_PIPELINE_TASK_RUN_RESULT                       // cicd.pipeline.task.run.result
  CICD_PIPELINE_TASK_RUN_RESULT_VALUE_CANCELLATION         // "cancellation"
  CICD_PIPELINE_TASK_RUN_RESULT_VALUE_ERROR                // "error"
  CICD_PIPELINE_TASK_RUN_RESULT_VALUE_FAILURE              // "failure"
  CICD_PIPELINE_TASK_RUN_RESULT_VALUE_SKIP                 // "skip"
  CICD_PIPELINE_TASK_RUN_RESULT_VALUE_SUCCESS              // "success"
  CICD_PIPELINE_TASK_RUN_RESULT_VALUE_TIMEOUT              // "timeout"
ATTR_CICD_WORKER_ID                                      // cicd.worker.id
ATTR_CICD_WORKER_NAME                                    // cicd.worker.name
ATTR_CICD_WORKER_URL_FULL                                // cicd.worker.url.full

GEN_AI_OPERATION_NAME_VALUE_GENERATE_CONTENT             // "generate_content"
GEN_AI_OPERATION_NAME_VALUE_INVOKE_AGENT                 // "invoke_agent"
GEN_AI_SYSTEM_VALUE_GCP_GEMINI                           // "gcp.gemini"
GEN_AI_SYSTEM_VALUE_GCP_GEN_AI                           // "gcp.gen_ai"
GEN_AI_SYSTEM_VALUE_GCP_VERTEX_AI                        // "gcp.vertex_ai"
ATTR_GEN_AI_TOOL_DESCRIPTION                             // gen_ai.tool.description

ATTR_JVM_GC_CAUSE                                        // jvm.gc.cause

ATTR_K8S_CRONJOB_ANNOTATION                              // (key) => `k8s.cronjob.annotation.${key}`
ATTR_K8S_CRONJOB_LABEL                                   // (key) => `k8s.cronjob.label.${key}`
ATTR_K8S_DAEMONSET_ANNOTATION                            // (key) => `k8s.daemonset.annotation.${key}`
ATTR_K8S_DAEMONSET_LABEL                                 // (key) => `k8s.daemonset.label.${key}`
ATTR_K8S_DEPLOYMENT_ANNOTATION                           // (key) => `k8s.deployment.annotation.${key}`
ATTR_K8S_DEPLOYMENT_LABEL                                // (key) => `k8s.deployment.label.${key}`
ATTR_K8S_JOB_ANNOTATION                                  // (key) => `k8s.job.annotation.${key}`
ATTR_K8S_JOB_LABEL                                       // (key) => `k8s.job.label.${key}`
ATTR_K8S_NAMESPACE_ANNOTATION                            // (key) => `k8s.namespace.annotation.${key}`
ATTR_K8S_NAMESPACE_LABEL                                 // (key) => `k8s.namespace.label.${key}`
ATTR_K8S_NODE_ANNOTATION                                 // (key) => `k8s.node.annotation.${key}`
ATTR_K8S_NODE_LABEL                                      // (key) => `k8s.node.label.${key}`
ATTR_K8S_REPLICASET_ANNOTATION                           // (key) => `k8s.replicaset.annotation.${key}`
ATTR_K8S_REPLICASET_LABEL                                // (key) => `k8s.replicaset.label.${key}`
ATTR_K8S_STATEFULSET_ANNOTATION                          // (key) => `k8s.statefulset.annotation.${key}`
ATTR_K8S_STATEFULSET_LABEL                               // (key) => `k8s.statefulset.label.${key}`

OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_METRIC_EXPORTER      // "otlp_grpc_metric_exporter"
OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_JSON_METRIC_EXPORTER // "otlp_http_json_metric_exporter"
OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER      // "otlp_http_metric_exporter"
OTEL_COMPONENT_TYPE_VALUE_PERIODIC_METRIC_READER         // "periodic_metric_reader"

ATTR_PROCESS_ENVIRONMENT_VARIABLE                        // (key) => `process.environment_variable.${key}`

VCS_PROVIDER_NAME_VALUE_GITEA                            // "gitea"
```

</details>

## 1.32.0

### :rocket: Features

* feat: update semantic conventions to v1.32.0 [#5603](https://github.com/open-telemetry/opentelemetry-js/pull/5603) @trentm
  * Semantic Conventions v1.32.0: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1320) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *none*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *2 newly deprecated exports, 65 added exports*

#### Unstable changes in v1.32.0

<details>
<summary>2 newly deprecated exports</summary>

```js
ATTR_FEATURE_FLAG_EVALUATION_REASON // feature_flag.evaluation.reason: Replaced by `feature_flag.result.reason`.
ATTR_FEATURE_FLAG_VARIANT           // feature_flag.variant: Replaced by `feature_flag.result.variant`.
```

</details>

<details>
<summary>65 added exports</summary>

```js
METRIC_CPYTHON_GC_COLLECTED_OBJECTS                         // cpython.gc.collected_objects
METRIC_CPYTHON_GC_COLLECTIONS                               // cpython.gc.collections
METRIC_CPYTHON_GC_UNCOLLECTABLE_OBJECTS                     // cpython.gc.uncollectable_objects

METRIC_OTEL_SDK_EXPORTER_LOG_EXPORTED                       // otel.sdk.exporter.log.exported
METRIC_OTEL_SDK_EXPORTER_LOG_INFLIGHT                       // otel.sdk.exporter.log.inflight
METRIC_OTEL_SDK_LOG_CREATED                                 // otel.sdk.log.created
METRIC_OTEL_SDK_PROCESSOR_LOG_PROCESSED                     // otel.sdk.processor.log.processed
METRIC_OTEL_SDK_PROCESSOR_LOG_QUEUE_CAPACITY                // otel.sdk.processor.log.queue.capacity
METRIC_OTEL_SDK_PROCESSOR_LOG_QUEUE_SIZE                    // otel.sdk.processor.log.queue.size

ATTR_APP_INSTALLATION_ID                                    // app.installation.id

ATTR_CPYTHON_GC_GENERATION                                  // cpython.gc.generation
  CPYTHON_GC_GENERATION_VALUE_GENERATION_0                    // 0
  CPYTHON_GC_GENERATION_VALUE_GENERATION_1                    // 1
  CPYTHON_GC_GENERATION_VALUE_GENERATION_2                    // 2

ATTR_DB_STORED_PROCEDURE_NAME                               // db.stored_procedure.name

ATTR_ERROR_MESSAGE                                          // error.message

ATTR_FEATURE_FLAG_RESULT_REASON                             // feature_flag.result.reason
  FEATURE_FLAG_RESULT_REASON_VALUE_CACHED                     // "cached"
  FEATURE_FLAG_RESULT_REASON_VALUE_DEFAULT                    // "default"
  FEATURE_FLAG_RESULT_REASON_VALUE_DISABLED                   // "disabled"
  FEATURE_FLAG_RESULT_REASON_VALUE_ERROR                      // "error"
  FEATURE_FLAG_RESULT_REASON_VALUE_SPLIT                      // "split"
  FEATURE_FLAG_RESULT_REASON_VALUE_STALE                      // "stale"
  FEATURE_FLAG_RESULT_REASON_VALUE_STATIC                     // "static"
  FEATURE_FLAG_RESULT_REASON_VALUE_TARGETING_MATCH            // "targeting_match"
  FEATURE_FLAG_RESULT_REASON_VALUE_UNKNOWN                    // "unknown"
ATTR_FEATURE_FLAG_RESULT_VARIANT                            // feature_flag.result.variant

ATTR_GCP_APPHUB_APPLICATION_CONTAINER                       // gcp.apphub.application.container
ATTR_GCP_APPHUB_APPLICATION_ID                              // gcp.apphub.application.id
ATTR_GCP_APPHUB_APPLICATION_LOCATION                        // gcp.apphub.application.location
ATTR_GCP_APPHUB_SERVICE_CRITICALITY_TYPE                    // gcp.apphub.service.criticality_type
  GCP_APPHUB_SERVICE_CRITICALITY_TYPE_VALUE_HIGH              // "HIGH"
  GCP_APPHUB_SERVICE_CRITICALITY_TYPE_VALUE_LOW               // "LOW"
  GCP_APPHUB_SERVICE_CRITICALITY_TYPE_VALUE_MEDIUM            // "MEDIUM"
  GCP_APPHUB_SERVICE_CRITICALITY_TYPE_VALUE_MISSION_CRITICAL  // "MISSION_CRITICAL"
ATTR_GCP_APPHUB_SERVICE_ENVIRONMENT_TYPE                    // gcp.apphub.service.environment_type
  GCP_APPHUB_SERVICE_ENVIRONMENT_TYPE_VALUE_DEVELOPMENT       // "DEVELOPMENT"
  GCP_APPHUB_SERVICE_ENVIRONMENT_TYPE_VALUE_PRODUCTION        // "PRODUCTION"
  GCP_APPHUB_SERVICE_ENVIRONMENT_TYPE_VALUE_STAGING           // "STAGING"
  GCP_APPHUB_SERVICE_ENVIRONMENT_TYPE_VALUE_TEST              // "TEST"
ATTR_GCP_APPHUB_SERVICE_ID                                  // gcp.apphub.service.id
ATTR_GCP_APPHUB_WORKLOAD_CRITICALITY_TYPE                   // gcp.apphub.workload.criticality_type
  GCP_APPHUB_WORKLOAD_CRITICALITY_TYPE_VALUE_HIGH             // "HIGH"
  GCP_APPHUB_WORKLOAD_CRITICALITY_TYPE_VALUE_LOW              // "LOW"
  GCP_APPHUB_WORKLOAD_CRITICALITY_TYPE_VALUE_MEDIUM           // "MEDIUM"
  GCP_APPHUB_WORKLOAD_CRITICALITY_TYPE_VALUE_MISSION_CRITICAL // "MISSION_CRITICAL"
ATTR_GCP_APPHUB_WORKLOAD_ENVIRONMENT_TYPE                   // gcp.apphub.workload.environment_type
  GCP_APPHUB_WORKLOAD_ENVIRONMENT_TYPE_VALUE_DEVELOPMENT      // "DEVELOPMENT"
  GCP_APPHUB_WORKLOAD_ENVIRONMENT_TYPE_VALUE_PRODUCTION       // "PRODUCTION"
  GCP_APPHUB_WORKLOAD_ENVIRONMENT_TYPE_VALUE_STAGING          // "STAGING"
  GCP_APPHUB_WORKLOAD_ENVIRONMENT_TYPE_VALUE_TEST             // "TEST"
ATTR_GCP_APPHUB_WORKLOAD_ID                                 // gcp.apphub.workload.id

OTEL_COMPONENT_TYPE_VALUE_BATCHING_LOG_PROCESSOR            // "batching_log_processor"
OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_LOG_EXPORTER            // "otlp_grpc_log_exporter"
OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_JSON_LOG_EXPORTER       // "otlp_http_json_log_exporter"
OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER            // "otlp_http_log_exporter"
OTEL_COMPONENT_TYPE_VALUE_SIMPLE_LOG_PROCESSOR              // "simple_log_processor"

PROFILE_FRAME_TYPE_VALUE_GO                                 // "go"
PROFILE_FRAME_TYPE_VALUE_RUST                               // "rust"

ATTR_VCS_OWNER_NAME                                         // vcs.owner.name
ATTR_VCS_PROVIDER_NAME                                      // vcs.provider.name
  VCS_PROVIDER_NAME_VALUE_BITBUCKET                           // "bitbucket"
  VCS_PROVIDER_NAME_VALUE_GITHUB                              // "github"
  VCS_PROVIDER_NAME_VALUE_GITLAB                              // "gitlab"
  VCS_PROVIDER_NAME_VALUE_GITTEA                              // "gittea"
```

</details>

## 1.31.0

### :rocket: Features

* feat: update semantic conventions to v1.31.0 [#5589](https://github.com/open-telemetry/opentelemetry-js/pull/5589) @trentm
  * Semantic Conventions v1.31.0: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1310) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *none*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *8 newly deprecated exports, 1 newly undeprecated export, 63 added exports*

#### Unstable changes in v1.31.0

<details>
<summary>8 newly deprecated exports</summary>

```js
METRIC_K8S_REPLICATION_CONTROLLER_AVAILABLE_PODS // k8s.replication_controller.available_pods: Replaced by `k8s.replicationcontroller.available_pods`.
METRIC_K8S_REPLICATION_CONTROLLER_DESIRED_PODS   // k8s.replication_controller.desired_pods: Replaced by `k8s.replicationcontroller.desired_pods`.
METRIC_SYSTEM_CPU_FREQUENCY                      // system.cpu.frequency: Replaced by `cpu.frequency`.
METRIC_SYSTEM_CPU_TIME                           // system.cpu.time: Replaced by `cpu.time`.
METRIC_SYSTEM_CPU_UTILIZATION                    // system.cpu.utilization: Replaced by `cpu.utilization`.
ATTR_CODE_FILEPATH                               // code.filepath: Replaced by `code.file.path`
ATTR_CODE_NAMESPACE                              // code.namespace: Value should be included in `code.function.name` which is expected to be a fully-qualified name.
ATTR_GEN_AI_OPENAI_REQUEST_RESPONSE_FORMAT       // gen_ai.openai.request.response_format: Replaced by `gen_ai.output.type`.
```

</details>

<details>
<summary>1 newly undeprecated export</summary>

```js
ATTR_ENDUSER_ID // enduser.id
```

</details>

<details>
<summary>63 added exports</summary>

```js
METRIC_CPU_FREQUENCY                                   // cpu.frequency
METRIC_CPU_TIME                                        // cpu.time
METRIC_CPU_UTILIZATION                                 // cpu.utilization

METRIC_HW_HOST_AMBIENT_TEMPERATURE                     // hw.host.ambient_temperature
METRIC_HW_HOST_ENERGY                                  // hw.host.energy
METRIC_HW_HOST_HEATING_MARGIN                          // hw.host.heating_margin
METRIC_HW_HOST_POWER                                   // hw.host.power

METRIC_K8S_REPLICATIONCONTROLLER_AVAILABLE_PODS        // k8s.replicationcontroller.available_pods
METRIC_K8S_REPLICATIONCONTROLLER_DESIRED_PODS          // k8s.replicationcontroller.desired_pods

METRIC_OTEL_SDK_EXPORTER_SPAN_EXPORTED_COUNT           // otel.sdk.exporter.span.exported.count
METRIC_OTEL_SDK_EXPORTER_SPAN_INFLIGHT_COUNT           // otel.sdk.exporter.span.inflight.count
METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED_COUNT         // otel.sdk.processor.span.processed.count
METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_CAPACITY          // otel.sdk.processor.span.queue.capacity
METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_SIZE              // otel.sdk.processor.span.queue.size
METRIC_OTEL_SDK_SPAN_ENDED_COUNT                       // otel.sdk.span.ended.count
METRIC_OTEL_SDK_SPAN_LIVE_COUNT                        // otel.sdk.span.live.count

ATTR_ANDROID_APP_STATE                                 // android.app.state
  ANDROID_APP_STATE_VALUE_BACKGROUND                     // "background"
  ANDROID_APP_STATE_VALUE_CREATED                        // "created"
  ANDROID_APP_STATE_VALUE_FOREGROUND                     // "foreground"

ATTR_CICD_PIPELINE_RUN_URL_FULL                        // cicd.pipeline.run.url.full

ATTR_CPU_LOGICAL_NUMBER                                // cpu.logical_number

ATTR_ENDUSER_PSEUDO_ID                                 // enduser.pseudo.id

ATTR_GEN_AI_AGENT_DESCRIPTION                          // gen_ai.agent.description
ATTR_GEN_AI_AGENT_ID                                   // gen_ai.agent.id
ATTR_GEN_AI_AGENT_NAME                                 // gen_ai.agent.name
GEN_AI_OPERATION_NAME_VALUE_CREATE_AGENT               // "create_agent"
GEN_AI_OPERATION_NAME_VALUE_EXECUTE_TOOL               // "execute_tool"
ATTR_GEN_AI_OUTPUT_TYPE                                // gen_ai.output.type
  GEN_AI_OUTPUT_TYPE_VALUE_IMAGE                         // "image"
  GEN_AI_OUTPUT_TYPE_VALUE_JSON                          // "json"
  GEN_AI_OUTPUT_TYPE_VALUE_SPEECH                        // "speech"
  GEN_AI_OUTPUT_TYPE_VALUE_TEXT                          // "text"
ATTR_GEN_AI_REQUEST_CHOICE_COUNT                       // gen_ai.request.choice.count
GEN_AI_TOKEN_TYPE_VALUE_OUTPUT                         // "output"
ATTR_GEN_AI_TOOL_CALL_ID                               // gen_ai.tool.call.id
ATTR_GEN_AI_TOOL_NAME                                  // gen_ai.tool.name
ATTR_GEN_AI_TOOL_TYPE                                  // gen_ai.tool.type

ATTR_IOS_APP_STATE                                     // ios.app.state
  IOS_APP_STATE_VALUE_ACTIVE                             // "active"
  IOS_APP_STATE_VALUE_BACKGROUND                         // "background"
  IOS_APP_STATE_VALUE_FOREGROUND                         // "foreground"
  IOS_APP_STATE_VALUE_INACTIVE                           // "inactive"
  IOS_APP_STATE_VALUE_TERMINATE                          // "terminate"

ATTR_K8S_HPA_NAME                                      // k8s.hpa.name
ATTR_K8S_HPA_UID                                       // k8s.hpa.uid
ATTR_K8S_REPLICATIONCONTROLLER_NAME                    // k8s.replicationcontroller.name
ATTR_K8S_REPLICATIONCONTROLLER_UID                     // k8s.replicationcontroller.uid
ATTR_K8S_RESOURCEQUOTA_NAME                            // k8s.resourcequota.name
ATTR_K8S_RESOURCEQUOTA_UID                             // k8s.resourcequota.uid

ATTR_OTEL_COMPONENT_NAME                               // otel.component.name
ATTR_OTEL_COMPONENT_TYPE                               // otel.component.type
  OTEL_COMPONENT_TYPE_VALUE_BATCHING_SPAN_PROCESSOR      // "batching_span_processor"
  OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_SPAN_EXPORTER      // "otlp_grpc_span_exporter"
  OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_JSON_SPAN_EXPORTER // "otlp_http_json_span_exporter"
  OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER      // "otlp_http_span_exporter"
  OTEL_COMPONENT_TYPE_VALUE_SIMPLE_SPAN_PROCESSOR        // "simple_span_processor"
ATTR_OTEL_SPAN_SAMPLING_RESULT                         // otel.span.sampling_result
  OTEL_SPAN_SAMPLING_RESULT_VALUE_DROP                   // "DROP"
  OTEL_SPAN_SAMPLING_RESULT_VALUE_RECORD_AND_SAMPLE      // "RECORD_AND_SAMPLE"
  OTEL_SPAN_SAMPLING_RESULT_VALUE_RECORD_ONLY            // "RECORD_ONLY"

ATTR_USER_AGENT_OS_NAME                                // user_agent.os.name
ATTR_USER_AGENT_OS_VERSION                             // user_agent.os.version
```

</details>

## 1.30.0

### :rocket: (Enhancement)

* feat: update semantic conventions to v1.30.0 [#5433](https://github.com/open-telemetry/opentelemetry-js/pull/5433) @trentm
  * Semantic Conventions v1.30.0: [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1300) | [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *1 newly deprecated exports, 25 added exports*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *24 newly deprecated exports, 165 added exports*

#### Stable changes in v1.30.0

<details open>
<summary>1 newly deprecated exports</summary>

```js
ATTR_EXCEPTION_ESCAPED // exception.escaped: It's no longer recommended to record exceptions that are handled and do not escape the scope of a span.
```

</details>

<details open>
<summary>25 added exports</summary>

```js
METRIC_DOTNET_ASSEMBLY_COUNT                             // dotnet.assembly.count
METRIC_DOTNET_EXCEPTIONS                                 // dotnet.exceptions
METRIC_DOTNET_GC_COLLECTIONS                             // dotnet.gc.collections
METRIC_DOTNET_GC_HEAP_TOTAL_ALLOCATED                    // dotnet.gc.heap.total_allocated
METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_FRAGMENTATION_SIZE // dotnet.gc.last_collection.heap.fragmentation.size
METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_SIZE               // dotnet.gc.last_collection.heap.size
METRIC_DOTNET_GC_LAST_COLLECTION_MEMORY_COMMITTED_SIZE   // dotnet.gc.last_collection.memory.committed_size
METRIC_DOTNET_GC_PAUSE_TIME                              // dotnet.gc.pause.time
METRIC_DOTNET_JIT_COMPILATION_TIME                       // dotnet.jit.compilation.time
METRIC_DOTNET_JIT_COMPILED_IL_SIZE                       // dotnet.jit.compiled_il.size
METRIC_DOTNET_JIT_COMPILED_METHODS                       // dotnet.jit.compiled_methods
METRIC_DOTNET_MONITOR_LOCK_CONTENTIONS                   // dotnet.monitor.lock_contentions
METRIC_DOTNET_PROCESS_CPU_COUNT                          // dotnet.process.cpu.count
METRIC_DOTNET_PROCESS_CPU_TIME                           // dotnet.process.cpu.time
METRIC_DOTNET_PROCESS_MEMORY_WORKING_SET                 // dotnet.process.memory.working_set
METRIC_DOTNET_THREAD_POOL_QUEUE_LENGTH                   // dotnet.thread_pool.queue.length
METRIC_DOTNET_THREAD_POOL_THREAD_COUNT                   // dotnet.thread_pool.thread.count
METRIC_DOTNET_THREAD_POOL_WORK_ITEM_COUNT                // dotnet.thread_pool.work_item.count
METRIC_DOTNET_TIMER_COUNT                                // dotnet.timer.count
ATTR_DOTNET_GC_HEAP_GENERATION                           // dotnet.gc.heap.generation
  DOTNET_GC_HEAP_GENERATION_VALUE_GEN0                     // "gen0"
  DOTNET_GC_HEAP_GENERATION_VALUE_GEN1                     // "gen1"
  DOTNET_GC_HEAP_GENERATION_VALUE_GEN2                     // "gen2"
  DOTNET_GC_HEAP_GENERATION_VALUE_LOH                      // "loh"
  DOTNET_GC_HEAP_GENERATION_VALUE_POH                      // "poh"
```

</details>

#### Unstable changes in v1.30.0

<details>
<summary>24 newly deprecated exports</summary>

```js
METRIC_DB_CLIENT_COSMOSDB_ACTIVE_INSTANCE_COUNT    // db.client.cosmosdb.active_instance.count: Replaced by `azure.cosmosdb.client.active_instance.count`.
METRIC_DB_CLIENT_COSMOSDB_OPERATION_REQUEST_CHARGE // db.client.cosmosdb.operation.request_charge: Replaced by `azure.cosmosdb.client.operation.request_charge`.
ATTR_CODE_COLUMN                                   // code.column: Replaced by `code.column.number`
ATTR_CODE_FUNCTION                                 // code.function: Replaced by `code.function.name`
ATTR_CODE_LINENO                                   // code.lineno: Replaced by `code.line.number`
ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL                // db.cassandra.consistency_level: Replaced by `cassandra.consistency.level`.
ATTR_DB_CASSANDRA_COORDINATOR_DC                   // db.cassandra.coordinator.dc: Replaced by `cassandra.coordinator.dc`.
ATTR_DB_CASSANDRA_COORDINATOR_ID                   // db.cassandra.coordinator.id: Replaced by `cassandra.coordinator.id`.
ATTR_DB_CASSANDRA_IDEMPOTENCE                      // db.cassandra.idempotence: Replaced by `cassandra.query.idempotent`.
ATTR_DB_CASSANDRA_PAGE_SIZE                        // db.cassandra.page_size: Replaced by `cassandra.page.size`.
ATTR_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT      // db.cassandra.speculative_execution_count: Replaced by `cassandra.speculative_execution.count`.
ATTR_DB_COSMOSDB_CLIENT_ID                         // db.cosmosdb.client_id: Replaced by `azure.client.id`.
ATTR_DB_COSMOSDB_CONNECTION_MODE                   // db.cosmosdb.connection_mode: Replaced by `azure.cosmosdb.connection.mode`.
ATTR_DB_COSMOSDB_CONSISTENCY_LEVEL                 // db.cosmosdb.consistency_level: Replaced by `azure.cosmosdb.consistency.level`.
ATTR_DB_COSMOSDB_REGIONS_CONTACTED                 // db.cosmosdb.regions_contacted: Replaced by `azure.cosmosdb.operation.contacted_regions`.
ATTR_DB_COSMOSDB_REQUEST_CHARGE                    // db.cosmosdb.request_charge: Replaced by `azure.cosmosdb.operation.request_charge`.
ATTR_DB_COSMOSDB_REQUEST_CONTENT_LENGTH            // db.cosmosdb.request_content_length: Replaced by `azure.cosmosdb.request.body.size`.
ATTR_DB_COSMOSDB_SUB_STATUS_CODE                   // db.cosmosdb.sub_status_code: Replaced by `azure.cosmosdb.response.sub_status_code`.
ATTR_DB_ELASTICSEARCH_NODE_NAME                    // db.elasticsearch.node.name: Replaced by `elasticsearch.node.name`.
ATTR_DB_ELASTICSEARCH_PATH_PARTS                   // (key) => `db.elasticsearch.path_parts.${key}`: Replaced by `db.operation.parameter`.
ATTR_DB_SYSTEM                                     // db.system: Replaced by `db.system.name`.
ATTR_EVENT_NAME                                    // event.name: Replaced by EventName top-level field on the LogRecord
ATTR_GEN_AI_OPENAI_REQUEST_SEED                    // gen_ai.openai.request.seed: Replaced by `gen_ai.request.seed` attribute.
ATTR_SYSTEM_NETWORK_STATE                          // system.network.state: Removed, report network connection state with `network.connection.state` attribute
```

</details>

<details>
<summary>165 added exports</summary>

```js
METRIC_AZURE_COSMOSDB_CLIENT_ACTIVE_INSTANCE_COUNT       // azure.cosmosdb.client.active_instance.count
METRIC_AZURE_COSMOSDB_CLIENT_OPERATION_REQUEST_CHARGE    // azure.cosmosdb.client.operation.request_charge

METRIC_CICD_PIPELINE_RUN_ACTIVE                          // cicd.pipeline.run.active
METRIC_CICD_PIPELINE_RUN_DURATION                        // cicd.pipeline.run.duration
METRIC_CICD_PIPELINE_RUN_ERRORS                          // cicd.pipeline.run.errors
METRIC_CICD_SYSTEM_ERRORS                                // cicd.system.errors
METRIC_CICD_WORKER_COUNT                                 // cicd.worker.count

METRIC_K8S_CRONJOB_ACTIVE_JOBS                           // k8s.cronjob.active_jobs
METRIC_K8S_DAEMONSET_CURRENT_SCHEDULED_NODES             // k8s.daemonset.current_scheduled_nodes
METRIC_K8S_DAEMONSET_DESIRED_SCHEDULED_NODES             // k8s.daemonset.desired_scheduled_nodes
METRIC_K8S_DAEMONSET_MISSCHEDULED_NODES                  // k8s.daemonset.misscheduled_nodes
METRIC_K8S_DAEMONSET_READY_NODES                         // k8s.daemonset.ready_nodes
METRIC_K8S_DEPLOYMENT_AVAILABLE_PODS                     // k8s.deployment.available_pods
METRIC_K8S_DEPLOYMENT_DESIRED_PODS                       // k8s.deployment.desired_pods
METRIC_K8S_HPA_CURRENT_PODS                              // k8s.hpa.current_pods
METRIC_K8S_HPA_DESIRED_PODS                              // k8s.hpa.desired_pods
METRIC_K8S_HPA_MAX_PODS                                  // k8s.hpa.max_pods
METRIC_K8S_HPA_MIN_PODS                                  // k8s.hpa.min_pods
METRIC_K8S_JOB_ACTIVE_PODS                               // k8s.job.active_pods
METRIC_K8S_JOB_DESIRED_SUCCESSFUL_PODS                   // k8s.job.desired_successful_pods
METRIC_K8S_JOB_FAILED_PODS                               // k8s.job.failed_pods
METRIC_K8S_JOB_MAX_PARALLEL_PODS                         // k8s.job.max_parallel_pods
METRIC_K8S_JOB_SUCCESSFUL_PODS                           // k8s.job.successful_pods
METRIC_K8S_NAMESPACE_PHASE                               // k8s.namespace.phase
METRIC_K8S_REPLICASET_AVAILABLE_PODS                     // k8s.replicaset.available_pods
METRIC_K8S_REPLICASET_DESIRED_PODS                       // k8s.replicaset.desired_pods
METRIC_K8S_REPLICATION_CONTROLLER_AVAILABLE_PODS         // k8s.replication_controller.available_pods
METRIC_K8S_REPLICATION_CONTROLLER_DESIRED_PODS           // k8s.replication_controller.desired_pods
METRIC_K8S_STATEFULSET_CURRENT_PODS                      // k8s.statefulset.current_pods
METRIC_K8S_STATEFULSET_DESIRED_PODS                      // k8s.statefulset.desired_pods
METRIC_K8S_STATEFULSET_READY_PODS                        // k8s.statefulset.ready_pods
METRIC_K8S_STATEFULSET_UPDATED_PODS                      // k8s.statefulset.updated_pods

METRIC_VCS_CHANGE_TIME_TO_MERGE                          // vcs.change.time_to_merge

ATTR_AWS_EXTENDED_REQUEST_ID                             // aws.extended_request_id

ATTR_AZURE_CLIENT_ID                                     // azure.client.id
ATTR_AZURE_COSMOSDB_CONNECTION_MODE                      // azure.cosmosdb.connection.mode
  AZURE_COSMOSDB_CONNECTION_MODE_VALUE_DIRECT              // "direct"
  AZURE_COSMOSDB_CONNECTION_MODE_VALUE_GATEWAY             // "gateway"
ATTR_AZURE_COSMOSDB_CONSISTENCY_LEVEL                    // azure.cosmosdb.consistency.level
  AZURE_COSMOSDB_CONSISTENCY_LEVEL_VALUE_BOUNDED_STALENESS // "BoundedStaleness"
  AZURE_COSMOSDB_CONSISTENCY_LEVEL_VALUE_CONSISTENT_PREFIX // "ConsistentPrefix"
  AZURE_COSMOSDB_CONSISTENCY_LEVEL_VALUE_EVENTUAL          // "Eventual"
  AZURE_COSMOSDB_CONSISTENCY_LEVEL_VALUE_SESSION           // "Session"
  AZURE_COSMOSDB_CONSISTENCY_LEVEL_VALUE_STRONG            // "Strong"
ATTR_AZURE_COSMOSDB_OPERATION_CONTACTED_REGIONS          // azure.cosmosdb.operation.contacted_regions
ATTR_AZURE_COSMOSDB_OPERATION_REQUEST_CHARGE             // azure.cosmosdb.operation.request_charge
ATTR_AZURE_COSMOSDB_REQUEST_BODY_SIZE                    // azure.cosmosdb.request.body.size
ATTR_AZURE_COSMOSDB_RESPONSE_SUB_STATUS_CODE             // azure.cosmosdb.response.sub_status_code

ATTR_CASSANDRA_CONSISTENCY_LEVEL                         // cassandra.consistency.level
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_ALL                    // "all"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_ANY                    // "any"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_EACH_QUORUM            // "each_quorum"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_ONE              // "local_one"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_QUORUM           // "local_quorum"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_SERIAL           // "local_serial"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_ONE                    // "one"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_QUORUM                 // "quorum"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_SERIAL                 // "serial"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_THREE                  // "three"
  CASSANDRA_CONSISTENCY_LEVEL_VALUE_TWO                    // "two"
ATTR_CASSANDRA_COORDINATOR_DC                            // cassandra.coordinator.dc
ATTR_CASSANDRA_COORDINATOR_ID                            // cassandra.coordinator.id
ATTR_CASSANDRA_PAGE_SIZE                                 // cassandra.page.size
ATTR_CASSANDRA_QUERY_IDEMPOTENT                          // cassandra.query.idempotent
ATTR_CASSANDRA_SPECULATIVE_EXECUTION_COUNT               // cassandra.speculative_execution.count

ATTR_CICD_PIPELINE_RESULT                                // cicd.pipeline.result
  CICD_PIPELINE_RESULT_VALUE_CANCELLATION                  // "cancellation"
  CICD_PIPELINE_RESULT_VALUE_ERROR                         // "error"
  CICD_PIPELINE_RESULT_VALUE_FAILURE                       // "failure"
  CICD_PIPELINE_RESULT_VALUE_SKIP                          // "skip"
  CICD_PIPELINE_RESULT_VALUE_SUCCESS                       // "success"
  CICD_PIPELINE_RESULT_VALUE_TIMEOUT                       // "timeout"
ATTR_CICD_PIPELINE_RUN_STATE                             // cicd.pipeline.run.state
  CICD_PIPELINE_RUN_STATE_VALUE_EXECUTING                  // "executing"
  CICD_PIPELINE_RUN_STATE_VALUE_FINALIZING                 // "finalizing"
  CICD_PIPELINE_RUN_STATE_VALUE_PENDING                    // "pending"
ATTR_CICD_SYSTEM_COMPONENT                               // cicd.system.component
ATTR_CICD_WORKER_STATE                                   // cicd.worker.state
  CICD_WORKER_STATE_VALUE_AVAILABLE                        // "available"
  CICD_WORKER_STATE_VALUE_BUSY                             // "busy"
  CICD_WORKER_STATE_VALUE_OFFLINE                          // "offline"

CLOUD_PLATFORM_VALUE_ORACLE_CLOUD_COMPUTE                // "oracle_cloud_compute"
CLOUD_PLATFORM_VALUE_ORACLE_CLOUD_OKE                    // "oracle_cloud_oke"
CLOUD_PROVIDER_VALUE_ORACLE_CLOUD                        // "oracle_cloud"

ATTR_CODE_COLUMN_NUMBER                                  // code.column.number
ATTR_CODE_FILE_PATH                                      // code.file.path
ATTR_CODE_FUNCTION_NAME                                  // code.function.name
ATTR_CODE_LINE_NUMBER                                    // code.line.number

ATTR_DB_SYSTEM_NAME                                      // db.system.name
  DB_SYSTEM_NAME_VALUE_ACTIAN_INGRES                       // "actian.ingres"
  DB_SYSTEM_NAME_VALUE_AWS_DYNAMODB                        // "aws.dynamodb"
  DB_SYSTEM_NAME_VALUE_AWS_REDSHIFT                        // "aws.redshift"
  DB_SYSTEM_NAME_VALUE_AZURE_COSMOSDB                      // "azure.cosmosdb"
  DB_SYSTEM_NAME_VALUE_CASSANDRA                           // "cassandra"
  DB_SYSTEM_NAME_VALUE_CLICKHOUSE                          // "clickhouse"
  DB_SYSTEM_NAME_VALUE_COCKROACHDB                         // "cockroachdb"
  DB_SYSTEM_NAME_VALUE_COUCHBASE                           // "couchbase"
  DB_SYSTEM_NAME_VALUE_COUCHDB                             // "couchdb"
  DB_SYSTEM_NAME_VALUE_DERBY                               // "derby"
  DB_SYSTEM_NAME_VALUE_ELASTICSEARCH                       // "elasticsearch"
  DB_SYSTEM_NAME_VALUE_FIREBIRDSQL                         // "firebirdsql"
  DB_SYSTEM_NAME_VALUE_GCP_SPANNER                         // "gcp.spanner"
  DB_SYSTEM_NAME_VALUE_GEODE                               // "geode"
  DB_SYSTEM_NAME_VALUE_H2DATABASE                          // "h2database"
  DB_SYSTEM_NAME_VALUE_HBASE                               // "hbase"
  DB_SYSTEM_NAME_VALUE_HIVE                                // "hive"
  DB_SYSTEM_NAME_VALUE_HSQLDB                              // "hsqldb"
  DB_SYSTEM_NAME_VALUE_IBM_DB2                             // "ibm.db2"
  DB_SYSTEM_NAME_VALUE_IBM_INFORMIX                        // "ibm.informix"
  DB_SYSTEM_NAME_VALUE_IBM_NETEZZA                         // "ibm.netezza"
  DB_SYSTEM_NAME_VALUE_INFLUXDB                            // "influxdb"
  DB_SYSTEM_NAME_VALUE_INSTANTDB                           // "instantdb"
  DB_SYSTEM_NAME_VALUE_INTERSYSTEMS_CACHE                  // "intersystems.cache"
  DB_SYSTEM_NAME_VALUE_MARIADB                             // "mariadb"
  DB_SYSTEM_NAME_VALUE_MEMCACHED                           // "memcached"
  DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER                // "microsoft.sql_server"
  DB_SYSTEM_NAME_VALUE_MONGODB                             // "mongodb"
  DB_SYSTEM_NAME_VALUE_MYSQL                               // "mysql"
  DB_SYSTEM_NAME_VALUE_NEO4J                               // "neo4j"
  DB_SYSTEM_NAME_VALUE_OPENSEARCH                          // "opensearch"
  DB_SYSTEM_NAME_VALUE_ORACLE_DB                           // "oracle.db"
  DB_SYSTEM_NAME_VALUE_OTHER_SQL                           // "other_sql"
  DB_SYSTEM_NAME_VALUE_POSTGRESQL                          // "postgresql"
  DB_SYSTEM_NAME_VALUE_REDIS                               // "redis"
  DB_SYSTEM_NAME_VALUE_SAP_HANA                            // "sap.hana"
  DB_SYSTEM_NAME_VALUE_SAP_MAXDB                           // "sap.maxdb"
  DB_SYSTEM_NAME_VALUE_SOFTWAREAG_ADABAS                   // "softwareag.adabas"
  DB_SYSTEM_NAME_VALUE_SQLITE                              // "sqlite"
  DB_SYSTEM_NAME_VALUE_TERADATA                            // "teradata"
  DB_SYSTEM_NAME_VALUE_TRINO                               // "trino"

ATTR_ELASTICSEARCH_NODE_NAME                             // elasticsearch.node.name

ATTR_GEN_AI_REQUEST_SEED                                 // gen_ai.request.seed
GEN_AI_SYSTEM_VALUE_AZ_AI_OPENAI                         // "az.ai.openai"
GEN_AI_SYSTEM_VALUE_DEEPSEEK                             // "deepseek"
GEN_AI_SYSTEM_VALUE_GEMINI                               // "gemini"
GEN_AI_SYSTEM_VALUE_GROQ                                 // "groq"
GEN_AI_SYSTEM_VALUE_MISTRAL_AI                           // "mistral_ai"
GEN_AI_SYSTEM_VALUE_PERPLEXITY                           // "perplexity"
GEN_AI_SYSTEM_VALUE_XAI                                  // "xai"

ATTR_K8S_NAMESPACE_PHASE                                 // k8s.namespace.phase
  K8S_NAMESPACE_PHASE_VALUE_ACTIVE                         // "active"
  K8S_NAMESPACE_PHASE_VALUE_TERMINATING                    // "terminating"

ATTR_NETWORK_CONNECTION_STATE                            // network.connection.state
  NETWORK_CONNECTION_STATE_VALUE_CLOSE_WAIT                // "close_wait"
  NETWORK_CONNECTION_STATE_VALUE_CLOSED                    // "closed"
  NETWORK_CONNECTION_STATE_VALUE_CLOSING                   // "closing"
  NETWORK_CONNECTION_STATE_VALUE_ESTABLISHED               // "established"
  NETWORK_CONNECTION_STATE_VALUE_FIN_WAIT_1                // "fin_wait_1"
  NETWORK_CONNECTION_STATE_VALUE_FIN_WAIT_2                // "fin_wait_2"
  NETWORK_CONNECTION_STATE_VALUE_LAST_ACK                  // "last_ack"
  NETWORK_CONNECTION_STATE_VALUE_LISTEN                    // "listen"
  NETWORK_CONNECTION_STATE_VALUE_SYN_RECEIVED              // "syn_received"
  NETWORK_CONNECTION_STATE_VALUE_SYN_SENT                  // "syn_sent"
  NETWORK_CONNECTION_STATE_VALUE_TIME_WAIT                 // "time_wait"
ATTR_NETWORK_INTERFACE_NAME                              // network.interface.name

PROFILE_FRAME_TYPE_VALUE_BEAM                            // "beam"

ATTR_SECURITY_RULE_CATEGORY                              // security_rule.category
ATTR_SECURITY_RULE_DESCRIPTION                           // security_rule.description
ATTR_SECURITY_RULE_LICENSE                               // security_rule.license
ATTR_SECURITY_RULE_NAME                                  // security_rule.name
ATTR_SECURITY_RULE_REFERENCE                             // security_rule.reference
ATTR_SECURITY_RULE_RULESET_NAME                          // security_rule.ruleset.name
ATTR_SECURITY_RULE_UUID                                  // security_rule.uuid
ATTR_SECURITY_RULE_VERSION                               // security_rule.version

ATTR_VCS_REPOSITORY_NAME                                 // vcs.repository.name
```

</details>

## 1.29.0

### :rocket: (Enhancement)

* feat: update semantic conventions to v1.29.0 [#5356](https://github.com/open-telemetry/opentelemetry-js/pull/5356) @trentm
  * Semantic Conventions v1.29.0:
    [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1290) |
    [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *none*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *8 newly deprecated exports, 95 added exports*

#### Unstable changes in v1.29.0

<details>
<summary>8 newly deprecated exports</summary>

```js
ATTR_DB_COSMOSDB_OPERATION_TYPE            // db.cosmosdb.operation_type: No replacement at this time.
ATTR_DB_QUERY_PARAMETER                    // (key) => `db.query.parameter.${key}`: Replaced by `db.operation.parameter`.
ATTR_PROCESS_EXECUTABLE_BUILD_ID_PROFILING // process.executable.build_id.profiling: Replaced by `process.executable.build_id.htlhash`
ATTR_VCS_REPOSITORY_CHANGE_ID              // vcs.repository.change.id: Deprecated, use `vcs.change.id` instead.
ATTR_VCS_REPOSITORY_CHANGE_TITLE           // vcs.repository.change.title: Deprecated, use `vcs.change.title` instead.
ATTR_VCS_REPOSITORY_REF_NAME               // vcs.repository.ref.name: Deprecated, use `vcs.ref.head.name` instead.
ATTR_VCS_REPOSITORY_REF_REVISION           // vcs.repository.ref.revision: Deprecated, use `vcs.ref.head.revision` instead.
ATTR_VCS_REPOSITORY_REF_TYPE               // vcs.repository.ref.type: Deprecated, use `vcs.ref.head.type` instead.
```

</details>

<details>
<summary>95 added exports</summary>

```js
METRIC_CONTAINER_UPTIME                               // container.uptime

METRIC_DB_CLIENT_COSMOSDB_ACTIVE_INSTANCE_COUNT       // db.client.cosmosdb.active_instance.count
METRIC_DB_CLIENT_COSMOSDB_OPERATION_REQUEST_CHARGE    // db.client.cosmosdb.operation.request_charge
METRIC_DB_CLIENT_RESPONSE_RETURNED_ROWS               // db.client.response.returned_rows

METRIC_K8S_NODE_NETWORK_ERRORS                        // k8s.node.network.errors
METRIC_K8S_NODE_NETWORK_IO                            // k8s.node.network.io
METRIC_K8S_NODE_UPTIME                                // k8s.node.uptime
METRIC_K8S_POD_NETWORK_ERRORS                         // k8s.pod.network.errors
METRIC_K8S_POD_NETWORK_IO                             // k8s.pod.network.io
METRIC_K8S_POD_UPTIME                                 // k8s.pod.uptime

METRIC_SYSTEM_UPTIME                                  // system.uptime

METRIC_VCS_CHANGE_COUNT                               // vcs.change.count
METRIC_VCS_CHANGE_DURATION                            // vcs.change.duration
METRIC_VCS_CHANGE_TIME_TO_APPROVAL                    // vcs.change.time_to_approval
METRIC_VCS_CONTRIBUTOR_COUNT                          // vcs.contributor.count
METRIC_VCS_REF_COUNT                                  // vcs.ref.count
METRIC_VCS_REF_LINES_DELTA                            // vcs.ref.lines_delta
METRIC_VCS_REF_REVISIONS_DELTA                        // vcs.ref.revisions_delta
METRIC_VCS_REF_TIME                                   // vcs.ref.time
METRIC_VCS_REPOSITORY_COUNT                           // vcs.repository.count

ATTR_DB_COSMOSDB_CONSISTENCY_LEVEL                    // db.cosmosdb.consistency_level
  DB_COSMOSDB_CONSISTENCY_LEVEL_VALUE_BOUNDED_STALENESS // "BoundedStaleness"
  DB_COSMOSDB_CONSISTENCY_LEVEL_VALUE_CONSISTENT_PREFIX // "ConsistentPrefix"
  DB_COSMOSDB_CONSISTENCY_LEVEL_VALUE_EVENTUAL          // "Eventual"
  DB_COSMOSDB_CONSISTENCY_LEVEL_VALUE_SESSION           // "Session"
  DB_COSMOSDB_CONSISTENCY_LEVEL_VALUE_STRONG            // "Strong"
ATTR_DB_COSMOSDB_REGIONS_CONTACTED                    // db.cosmosdb.regions_contacted
ATTR_DB_OPERATION_PARAMETER                           // (key) => `db.operation.parameter.${key}`
ATTR_DB_QUERY_SUMMARY                                 // db.query.summary
ATTR_DB_RESPONSE_RETURNED_ROWS                        // db.response.returned_rows

ATTR_FEATURE_FLAG_CONTEXT_ID                          // feature_flag.context.id
ATTR_FEATURE_FLAG_EVALUATION_ERROR_MESSAGE            // feature_flag.evaluation.error.message
ATTR_FEATURE_FLAG_EVALUATION_REASON                   // feature_flag.evaluation.reason
  FEATURE_FLAG_EVALUATION_REASON_VALUE_CACHED           // "cached"
  FEATURE_FLAG_EVALUATION_REASON_VALUE_DEFAULT          // "default"
  FEATURE_FLAG_EVALUATION_REASON_VALUE_DISABLED         // "disabled"
  FEATURE_FLAG_EVALUATION_REASON_VALUE_ERROR            // "error"
  FEATURE_FLAG_EVALUATION_REASON_VALUE_SPLIT            // "split"
  FEATURE_FLAG_EVALUATION_REASON_VALUE_STALE            // "stale"
  FEATURE_FLAG_EVALUATION_REASON_VALUE_STATIC           // "static"
  FEATURE_FLAG_EVALUATION_REASON_VALUE_TARGETING_MATCH  // "targeting_match"
  FEATURE_FLAG_EVALUATION_REASON_VALUE_UNKNOWN          // "unknown"
ATTR_FEATURE_FLAG_SET_ID                              // feature_flag.set.id
ATTR_FEATURE_FLAG_VERSION                             // feature_flag.version

ATTR_GEN_AI_OPENAI_RESPONSE_SYSTEM_FINGERPRINT        // gen_ai.openai.response.system_fingerprint
GEN_AI_OPERATION_NAME_VALUE_EMBEDDINGS                // "embeddings"
ATTR_GEN_AI_REQUEST_ENCODING_FORMATS                  // gen_ai.request.encoding_formats
GEN_AI_SYSTEM_VALUE_AWS_BEDROCK                       // "aws.bedrock"
GEN_AI_SYSTEM_VALUE_AZ_AI_INFERENCE                   // "az.ai.inference"
GEN_AI_SYSTEM_VALUE_IBM_WATSONX_AI                    // "ibm.watsonx.ai"

ATTR_GEO_CONTINENT_CODE                               // geo.continent.code
  GEO_CONTINENT_CODE_VALUE_AF                           // "AF"
  GEO_CONTINENT_CODE_VALUE_AN                           // "AN"
  GEO_CONTINENT_CODE_VALUE_AS                           // "AS"
  GEO_CONTINENT_CODE_VALUE_EU                           // "EU"
  GEO_CONTINENT_CODE_VALUE_NA                           // "NA"
  GEO_CONTINENT_CODE_VALUE_OC                           // "OC"
  GEO_CONTINENT_CODE_VALUE_SA                           // "SA"
ATTR_GEO_COUNTRY_ISO_CODE                             // geo.country.iso_code
ATTR_GEO_LOCALITY_NAME                                // geo.locality.name
ATTR_GEO_LOCATION_LAT                                 // geo.location.lat
ATTR_GEO_LOCATION_LON                                 // geo.location.lon
ATTR_GEO_POSTAL_CODE                                  // geo.postal_code
ATTR_GEO_REGION_ISO_CODE                              // geo.region.iso_code

ATTR_PROCESS_EXECUTABLE_BUILD_ID_HTLHASH              // process.executable.build_id.htlhash
ATTR_PROCESS_LINUX_CGROUP                             // process.linux.cgroup

ATTR_USER_AGENT_SYNTHETIC_TYPE                        // user_agent.synthetic.type
  USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT                   // "bot"
  USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST                  // "test"

ATTR_VCS_CHANGE_ID                                    // vcs.change.id
ATTR_VCS_CHANGE_STATE                                 // vcs.change.state
  VCS_CHANGE_STATE_VALUE_CLOSED                         // "closed"
  VCS_CHANGE_STATE_VALUE_MERGED                         // "merged"
  VCS_CHANGE_STATE_VALUE_OPEN                           // "open"
  VCS_CHANGE_STATE_VALUE_WIP                            // "wip"
ATTR_VCS_CHANGE_TITLE                                 // vcs.change.title
ATTR_VCS_LINE_CHANGE_TYPE                             // vcs.line_change.type
  VCS_LINE_CHANGE_TYPE_VALUE_ADDED                      // "added"
  VCS_LINE_CHANGE_TYPE_VALUE_REMOVED                    // "removed"
ATTR_VCS_REF_BASE_NAME                                // vcs.ref.base.name
ATTR_VCS_REF_BASE_REVISION                            // vcs.ref.base.revision
ATTR_VCS_REF_BASE_TYPE                                // vcs.ref.base.type
  VCS_REF_BASE_TYPE_VALUE_BRANCH                        // "branch"
  VCS_REF_BASE_TYPE_VALUE_TAG                           // "tag"
ATTR_VCS_REF_HEAD_NAME                                // vcs.ref.head.name
ATTR_VCS_REF_HEAD_REVISION                            // vcs.ref.head.revision
ATTR_VCS_REF_HEAD_TYPE                                // vcs.ref.head.type
  VCS_REF_HEAD_TYPE_VALUE_BRANCH                        // "branch"
  VCS_REF_HEAD_TYPE_VALUE_TAG                           // "tag"
ATTR_VCS_REF_TYPE                                     // vcs.ref.type
  VCS_REF_TYPE_VALUE_BRANCH                             // "branch"
  VCS_REF_TYPE_VALUE_TAG                                // "tag"
ATTR_VCS_REVISION_DELTA_DIRECTION                     // vcs.revision_delta.direction
  VCS_REVISION_DELTA_DIRECTION_VALUE_AHEAD              // "ahead"
  VCS_REVISION_DELTA_DIRECTION_VALUE_BEHIND             // "behind"
```

</details>

### :books: (Refine Doc)

* docs: Document suggested usage of unstable semconv: copy relevant definitions into your code base. [#5182](https://github.com/open-telemetry/opentelemetry-js/pull/5182) @trentm

## 1.28.0

### :rocket: (Enhancement)

* feat: update semantic conventions to v1.28.0 [#5181](https://github.com/open-telemetry/opentelemetry-js/pull/5181) @trentm
  * Semantic Conventions v1.28.0:
    [changelog](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1280) |
    [latest docs](https://opentelemetry.io/docs/specs/semconv/)
  * `@opentelemetry/semantic-conventions` (stable) changes: *none*
  * `@opentelemetry/semantic-conventions/incubating` (unstable) changes: *15 exported values changed, 5 newly deprecated exports, 128 added exports*

#### Unstable changes in v1.28.0

<details>
<summary>15 exported values changed</summary>

```js
DB_COSMOSDB_OPERATION_TYPE_VALUE_BATCH              // "Batch" -> "batch"
DB_COSMOSDB_OPERATION_TYPE_VALUE_CREATE             // "Create" -> "create"
DB_COSMOSDB_OPERATION_TYPE_VALUE_DELETE             // "Delete" -> "delete"
DB_COSMOSDB_OPERATION_TYPE_VALUE_EXECUTE            // "Execute" -> "execute"
DB_COSMOSDB_OPERATION_TYPE_VALUE_EXECUTE_JAVASCRIPT // "ExecuteJavaScript" -> "execute_javascript"
DB_COSMOSDB_OPERATION_TYPE_VALUE_HEAD               // "Head" -> "head"
DB_COSMOSDB_OPERATION_TYPE_VALUE_HEAD_FEED          // "HeadFeed" -> "head_feed"
DB_COSMOSDB_OPERATION_TYPE_VALUE_INVALID            // "Invalid" -> "invalid"
DB_COSMOSDB_OPERATION_TYPE_VALUE_PATCH              // "Patch" -> "patch"
DB_COSMOSDB_OPERATION_TYPE_VALUE_QUERY              // "Query" -> "query"
DB_COSMOSDB_OPERATION_TYPE_VALUE_QUERY_PLAN         // "QueryPlan" -> "query_plan"
DB_COSMOSDB_OPERATION_TYPE_VALUE_READ               // "Read" -> "read"
DB_COSMOSDB_OPERATION_TYPE_VALUE_READ_FEED          // "ReadFeed" -> "read_feed"
DB_COSMOSDB_OPERATION_TYPE_VALUE_REPLACE            // "Replace" -> "replace"
DB_COSMOSDB_OPERATION_TYPE_VALUE_UPSERT             // "Upsert" -> "upsert"
```

</details>

<details>
<summary>5 newly deprecated exports</summary>

```js
METRIC_MESSAGING_CLIENT_PUBLISHED_MESSAGES // messaging.client.published.messages: Replaced by `messaging.client.sent.messages`.
ATTR_ANDROID_STATE                         // android.state: Replaced by `device.app.lifecycle`.
ATTR_DB_COSMOSDB_STATUS_CODE               // db.cosmosdb.status_code: Replaced by `db.response.status_code`.
ATTR_GEN_AI_COMPLETION                     // gen_ai.completion: Removed, no replacement at this time.
ATTR_GEN_AI_PROMPT                         // gen_ai.prompt: Removed, no replacement at this time.
```

</details>

<details>
<summary>128 added exports</summary>

```js
METRIC_CONTAINER_CPU_USAGE                               // container.cpu.usage

METRIC_DOTNET_ASSEMBLY_COUNT                             // dotnet.assembly.count
METRIC_DOTNET_EXCEPTIONS                                 // dotnet.exceptions
METRIC_DOTNET_GC_COLLECTIONS                             // dotnet.gc.collections
METRIC_DOTNET_GC_HEAP_TOTAL_ALLOCATED                    // dotnet.gc.heap.total_allocated
METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_FRAGMENTATION_SIZE // dotnet.gc.last_collection.heap.fragmentation.size
METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_SIZE               // dotnet.gc.last_collection.heap.size
METRIC_DOTNET_GC_LAST_COLLECTION_MEMORY_COMMITTED_SIZE   // dotnet.gc.last_collection.memory.committed_size
METRIC_DOTNET_GC_PAUSE_TIME                              // dotnet.gc.pause.time
METRIC_DOTNET_JIT_COMPILATION_TIME                       // dotnet.jit.compilation.time
METRIC_DOTNET_JIT_COMPILED_IL_SIZE                       // dotnet.jit.compiled_il.size
METRIC_DOTNET_JIT_COMPILED_METHODS                       // dotnet.jit.compiled_methods
METRIC_DOTNET_MONITOR_LOCK_CONTENTIONS                   // dotnet.monitor.lock_contentions
METRIC_DOTNET_PROCESS_CPU_COUNT                          // dotnet.process.cpu.count
METRIC_DOTNET_PROCESS_CPU_TIME                           // dotnet.process.cpu.time
METRIC_DOTNET_PROCESS_MEMORY_WORKING_SET                 // dotnet.process.memory.working_set
METRIC_DOTNET_THREAD_POOL_QUEUE_LENGTH                   // dotnet.thread_pool.queue.length
METRIC_DOTNET_THREAD_POOL_THREAD_COUNT                   // dotnet.thread_pool.thread.count
METRIC_DOTNET_THREAD_POOL_WORK_ITEM_COUNT                // dotnet.thread_pool.work_item.count
METRIC_DOTNET_TIMER_COUNT                                // dotnet.timer.count

METRIC_HW_ENERGY                                         // hw.energy
METRIC_HW_ERRORS                                         // hw.errors
METRIC_HW_POWER                                          // hw.power
METRIC_HW_STATUS                                         // hw.status

METRIC_K8S_NODE_CPU_TIME                                 // k8s.node.cpu.time
METRIC_K8S_NODE_CPU_USAGE                                // k8s.node.cpu.usage
METRIC_K8S_NODE_MEMORY_USAGE                             // k8s.node.memory.usage
METRIC_K8S_POD_CPU_TIME                                  // k8s.pod.cpu.time
METRIC_K8S_POD_CPU_USAGE                                 // k8s.pod.cpu.usage
METRIC_K8S_POD_MEMORY_USAGE                              // k8s.pod.memory.usage

METRIC_MESSAGING_CLIENT_SENT_MESSAGES                    // messaging.client.sent.messages

METRIC_NODEJS_EVENTLOOP_TIME                             // nodejs.eventloop.time

METRIC_PROCESS_UPTIME                                    // process.uptime

METRIC_SYSTEM_DISK_LIMIT                                 // system.disk.limit
METRIC_SYSTEM_FILESYSTEM_LIMIT                           // system.filesystem.limit

ATTR_AZ_NAMESPACE                                        // az.namespace

ATTR_CLOUDFOUNDRY_APP_ID                                 // cloudfoundry.app.id
ATTR_CLOUDFOUNDRY_APP_INSTANCE_ID                        // cloudfoundry.app.instance.id
ATTR_CLOUDFOUNDRY_APP_NAME                               // cloudfoundry.app.name
ATTR_CLOUDFOUNDRY_ORG_ID                                 // cloudfoundry.org.id
ATTR_CLOUDFOUNDRY_ORG_NAME                               // cloudfoundry.org.name
ATTR_CLOUDFOUNDRY_PROCESS_ID                             // cloudfoundry.process.id
ATTR_CLOUDFOUNDRY_PROCESS_TYPE                           // cloudfoundry.process.type
ATTR_CLOUDFOUNDRY_SPACE_ID                               // cloudfoundry.space.id
ATTR_CLOUDFOUNDRY_SPACE_NAME                             // cloudfoundry.space.name
ATTR_CLOUDFOUNDRY_SYSTEM_ID                              // cloudfoundry.system.id
ATTR_CLOUDFOUNDRY_SYSTEM_INSTANCE_ID                     // cloudfoundry.system.instance.id

ATTR_CONTAINER_CSI_PLUGIN_NAME                           // container.csi.plugin.name
ATTR_CONTAINER_CSI_VOLUME_ID                             // container.csi.volume.id

ATTR_DB_RESPONSE_STATUS_CODE                             // db.response.status_code

ATTR_DOTNET_GC_HEAP_GENERATION                           // dotnet.gc.heap.generation
  DOTNET_GC_HEAP_GENERATION_VALUE_GEN0                     // "gen0"
  DOTNET_GC_HEAP_GENERATION_VALUE_GEN1                     // "gen1"
  DOTNET_GC_HEAP_GENERATION_VALUE_GEN2                     // "gen2"
  DOTNET_GC_HEAP_GENERATION_VALUE_LOH                      // "loh"
  DOTNET_GC_HEAP_GENERATION_VALUE_POH                      // "poh"

ATTR_FILE_ACCESSED                                       // file.accessed
ATTR_FILE_ATTRIBUTES                                     // file.attributes
ATTR_FILE_CHANGED                                        // file.changed
ATTR_FILE_CREATED                                        // file.created
ATTR_FILE_FORK_NAME                                      // file.fork_name
ATTR_FILE_GROUP_ID                                       // file.group.id
ATTR_FILE_GROUP_NAME                                     // file.group.name
ATTR_FILE_INODE                                          // file.inode
ATTR_FILE_MODE                                           // file.mode
ATTR_FILE_MODIFIED                                       // file.modified
ATTR_FILE_OWNER_ID                                       // file.owner.id
ATTR_FILE_OWNER_NAME                                     // file.owner.name
ATTR_FILE_SYMBOLIC_LINK_TARGET_PATH                      // file.symbolic_link.target_path

ATTR_GEN_AI_OPENAI_REQUEST_RESPONSE_FORMAT               // gen_ai.openai.request.response_format
  GEN_AI_OPENAI_REQUEST_RESPONSE_FORMAT_VALUE_JSON_OBJECT  // "json_object"
  GEN_AI_OPENAI_REQUEST_RESPONSE_FORMAT_VALUE_JSON_SCHEMA  // "json_schema"
  GEN_AI_OPENAI_REQUEST_RESPONSE_FORMAT_VALUE_TEXT         // "text"
ATTR_GEN_AI_OPENAI_REQUEST_SEED                          // gen_ai.openai.request.seed
ATTR_GEN_AI_OPENAI_REQUEST_SERVICE_TIER                  // gen_ai.openai.request.service_tier
  GEN_AI_OPENAI_REQUEST_SERVICE_TIER_VALUE_AUTO            // "auto"
  GEN_AI_OPENAI_REQUEST_SERVICE_TIER_VALUE_DEFAULT         // "default"
ATTR_GEN_AI_OPENAI_RESPONSE_SERVICE_TIER                 // gen_ai.openai.response.service_tier

ATTR_HW_ID                                               // hw.id
ATTR_HW_NAME                                             // hw.name
ATTR_HW_PARENT                                           // hw.parent
ATTR_HW_STATE                                            // hw.state
  HW_STATE_VALUE_DEGRADED                                  // "degraded"
  HW_STATE_VALUE_FAILED                                    // "failed"
  HW_STATE_VALUE_OK                                        // "ok"
ATTR_HW_TYPE                                             // hw.type
  HW_TYPE_VALUE_BATTERY                                    // "battery"
  HW_TYPE_VALUE_CPU                                        // "cpu"
  HW_TYPE_VALUE_DISK_CONTROLLER                            // "disk_controller"
  HW_TYPE_VALUE_ENCLOSURE                                  // "enclosure"
  HW_TYPE_VALUE_FAN                                        // "fan"
  HW_TYPE_VALUE_GPU                                        // "gpu"
  HW_TYPE_VALUE_LOGICAL_DISK                               // "logical_disk"
  HW_TYPE_VALUE_MEMORY                                     // "memory"
  HW_TYPE_VALUE_NETWORK                                    // "network"
  HW_TYPE_VALUE_PHYSICAL_DISK                              // "physical_disk"
  HW_TYPE_VALUE_POWER_SUPPLY                               // "power_supply"
  HW_TYPE_VALUE_TAPE_DRIVE                                 // "tape_drive"
  HW_TYPE_VALUE_TEMPERATURE                                // "temperature"
  HW_TYPE_VALUE_VOLTAGE                                    // "voltage"

ATTR_K8S_VOLUME_NAME                                     // k8s.volume.name
ATTR_K8S_VOLUME_TYPE                                     // k8s.volume.type
  K8S_VOLUME_TYPE_VALUE_CONFIG_MAP                         // "configMap"
  K8S_VOLUME_TYPE_VALUE_DOWNWARD_API                       // "downwardAPI"
  K8S_VOLUME_TYPE_VALUE_EMPTY_DIR                          // "emptyDir"
  K8S_VOLUME_TYPE_VALUE_LOCAL                              // "local"
  K8S_VOLUME_TYPE_VALUE_PERSISTENT_VOLUME_CLAIM            // "persistentVolumeClaim"
  K8S_VOLUME_TYPE_VALUE_SECRET                             // "secret"

MESSAGING_OPERATION_TYPE_VALUE_SEND                      // "send"

ATTR_NODEJS_EVENTLOOP_STATE                              // nodejs.eventloop.state
  NODEJS_EVENTLOOP_STATE_VALUE_ACTIVE                      // "active"
  NODEJS_EVENTLOOP_STATE_VALUE_IDLE                        // "idle"

ATTR_PROCESS_ARGS_COUNT                                  // process.args_count
ATTR_PROCESS_EXECUTABLE_BUILD_ID_GNU                     // process.executable.build_id.gnu
ATTR_PROCESS_EXECUTABLE_BUILD_ID_GO                      // process.executable.build_id.go
ATTR_PROCESS_EXECUTABLE_BUILD_ID_PROFILING               // process.executable.build_id.profiling
ATTR_PROCESS_TITLE                                       // process.title
ATTR_PROCESS_WORKING_DIRECTORY                           // process.working_directory

ATTR_PROFILE_FRAME_TYPE                                  // profile.frame.type
  PROFILE_FRAME_TYPE_VALUE_CPYTHON                         // "cpython"
  PROFILE_FRAME_TYPE_VALUE_DOTNET                          // "dotnet"
  PROFILE_FRAME_TYPE_VALUE_JVM                             // "jvm"
  PROFILE_FRAME_TYPE_VALUE_KERNEL                          // "kernel"
  PROFILE_FRAME_TYPE_VALUE_NATIVE                          // "native"
  PROFILE_FRAME_TYPE_VALUE_PERL                            // "perl"
  PROFILE_FRAME_TYPE_VALUE_PHP                             // "php"
  PROFILE_FRAME_TYPE_VALUE_RUBY                            // "ruby"
  PROFILE_FRAME_TYPE_VALUE_V8JS                            // "v8js"
```

</details>

### :books: (Refine Doc)

* chore: Improve documentation on entry-points (top-level and "incubating") and on deprecations. [#5025](https://github.com/open-telemetry/opentelemetry-js/issues/5025) @trentm

### :house: (Internal)

* chore: Update the comments of some deprecated constants to point to the currently relevant replacement constant, if any. [#5160](https://github.com/open-telemetry/opentelemetry-js/pull/5160) @trentm
* chore: Minor improvements to formatting of comments. [#5100](https://github.com/open-telemetry/opentelemetry-js/pull/5100) @trentm

## 1.27.0

* Version bump only
* Note: This package will now be versioned according to the version of semantic conventions being provided.

## 1.26.0

Note: This package will now be versioned according to the version of semantic conventions being provided.

### :rocket: (Enhancement)

* feat(semconv): update semantic conventions to 1.27 (from 1.7.0) [#4690](https://github.com/open-telemetry/opentelemetry-js/pull/4690) @dyladan
  * Exported names have changed to `ATTR_{name}` for attributes (e.g. `ATTR_HTTP_REQUEST_METHOD`), `{name}_VALUE_{value}` for enumeration values (e.g. `HTTP_REQUEST_METHOD_VALUE_POST`), and `METRIC_{name}` for metrics. Exported names from previous versions are deprecated.
  * Import `@opentelemetry/semantic-conventions` for *stable* semantic conventions. Import `@opentelemetry/semantic-conventions/incubating` for all semantic conventions, stable and unstable.

### :house: (Internal)
