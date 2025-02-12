<!-- markdownlint-disable MD004 -->
# CHANGELOG

All notable changes to the semantic-conventions package will be documented in this file.

## Unreleased

### :boom: Breaking Changes

### :rocket: Features

### :bug: Bug Fixes

### :books: Documentation

### :house: Internal

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
