<!-- markdownlint-disable MD004 -->
# CHANGELOG

All notable changes to the semantic-conventions package will be documented in this file.

## Unreleased

### :boom: Breaking Change

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

### :bug: (Bug Fix)

### :books: (Refine Doc)

* docs: Document suggested usage of unstable semconv: copy relevant definitions into your code base. [#5182](https://github.com/open-telemetry/opentelemetry-js/pull/5182) @trentm

### :house: (Internal)

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
