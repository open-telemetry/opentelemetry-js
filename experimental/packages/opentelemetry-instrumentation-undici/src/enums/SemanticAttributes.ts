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

// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
export const SemanticAttributes = {

  /**
  * The name of the invoked function.
  *
  * Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
  */
  FAAS_INVOKED_NAME: 'faas.invoked_name',

  /**
  * The cloud provider of the invoked function.
  *
  * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
  */
  FAAS_INVOKED_PROVIDER: 'faas.invoked_provider',

  /**
  * The cloud region of the invoked function.
  *
  * Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
  */
  FAAS_INVOKED_REGION: 'faas.invoked_region',

  /**
  * Type of the trigger which caused this function invocation.
  */
  FAAS_TRIGGER: 'faas.trigger',

  /**
  * The [`service.name`](/docs/resource/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
  */
  PEER_SERVICE: 'peer.service',

  /**
  * Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
  */
  ENDUSER_ID: 'enduser.id',

  /**
  * Actual/assumed role the client is making the request under extracted from token or application security context.
  */
  ENDUSER_ROLE: 'enduser.role',

  /**
  * Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
  */
  ENDUSER_SCOPE: 'enduser.scope',

  /**
  * Identifies the class / type of event.
  *
  * Note: Event names are subject to the same rules as [attribute names](https://github.com/open-telemetry/opentelemetry-specification/tree/v1.26.0/specification/common/attribute-naming.md). Notably, event names are namespaced to avoid collisions and provide a clean separation of semantics for events in separate domains like browser, mobile, and kubernetes.
  */
  EVENT_NAME: 'event.name',

  /**
  * A unique identifier for the Log Record.
  *
  * Note: If an id is provided, other log records with the same id will be considered duplicates and can be removed safely. This means, that two distinguishable log records MUST have different values.
The id MAY be an [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec), but other identifiers (e.g. UUID) may be used as needed.
  */
  LOG_RECORD_UID: 'log.record.uid',

  /**
  * The stream associated with the log. See below for a list of well-known values.
  */
  LOG_IOSTREAM: 'log.iostream',

  /**
  * The basename of the file.
  */
  LOG_FILE_NAME: 'log.file.name',

  /**
  * The basename of the file, with symlinks resolved.
  */
  LOG_FILE_NAME_RESOLVED: 'log.file.name_resolved',

  /**
  * The full path to the file.
  */
  LOG_FILE_PATH: 'log.file.path',

  /**
  * The full path to the file, with symlinks resolved.
  */
  LOG_FILE_PATH_RESOLVED: 'log.file.path_resolved',

  /**
  * This attribute represents the state the application has transitioned into at the occurrence of the event.
  *
  * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
  */
  IOS_STATE: 'ios.state',

  /**
  * This attribute represents the state the application has transitioned into at the occurrence of the event.
  *
  * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
  */
  ANDROID_STATE: 'android.state',

  /**
  * The name of the connection pool; unique within the instrumented application. In case the connection pool implementation doesn&#39;t provide a name, then the [db.connection_string](/docs/database/database-spans.md#connection-level-attributes) should be used.
  */
  POOL_NAME: 'pool.name',

  /**
  * The state of a connection in the pool.
  */
  STATE: 'state',

  /**
  * Full type name of the [`IExceptionHandler`](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.diagnostics.iexceptionhandler) implementation that handled the exception.
  */
  ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE: 'aspnetcore.diagnostics.handler.type',

  /**
  * Rate limiting policy name.
  */
  ASPNETCORE_RATE_LIMITING_POLICY: 'aspnetcore.rate_limiting.policy',

  /**
  * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
  */
  ASPNETCORE_RATE_LIMITING_RESULT: 'aspnetcore.rate_limiting.result',

  /**
  * Flag indicating if request was handled by the application pipeline.
  */
  ASPNETCORE_REQUEST_IS_UNHANDLED: 'aspnetcore.request.is_unhandled',

  /**
  * A value that indicates whether the matched route is a fallback route.
  */
  ASPNETCORE_ROUTING_IS_FALLBACK: 'aspnetcore.routing.is_fallback',

  /**
  * Match result - success or failure.
  */
  ASPNETCORE_ROUTING_MATCH_STATUS: 'aspnetcore.routing.match_status',

  /**
  * ASP.NET Core exception middleware handling result.
  */
  ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT: 'aspnetcore.diagnostics.exception.result',

  /**
  * The name being queried.
  *
  * Note: The name being queried.
If the name field contains non-printable characters (below 32 or above 126), those characters should be represented as escaped base 10 integers (\DDD). Back slashes and quotes should be escaped. Tabs, carriage returns, and line feeds should be converted to \t, \r, and \n respectively.
  */
  DNS_QUESTION_NAME: 'dns.question.name',

  /**
  * State of the HTTP connection in the HTTP connection pool.
  */
  HTTP_CONNECTION_STATE: 'http.connection.state',

  /**
  * SignalR HTTP connection closure status.
  */
  SIGNALR_CONNECTION_STATUS: 'signalr.connection.status',

  /**
  * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
  */
  SIGNALR_TRANSPORT: 'signalr.transport',

  /**
  * Name of the buffer pool.
  *
  * Note: Pool names are generally obtained via [BufferPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/BufferPoolMXBean.html#getName()).
  */
  JVM_BUFFER_POOL_NAME: 'jvm.buffer.pool.name',

  /**
  * Name of the memory pool.
  *
  * Note: Pool names are generally obtained via [MemoryPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/MemoryPoolMXBean.html#getName()).
  */
  JVM_MEMORY_POOL_NAME: 'jvm.memory.pool.name',

  /**
  * The type of memory.
  */
  JVM_MEMORY_TYPE: 'jvm.memory.type',

  /**
  * Name of the garbage collector action.
  *
  * Note: Garbage collector action is generally obtained via [GarbageCollectionNotificationInfo#getGcAction()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcAction()).
  */
  JVM_GC_ACTION: 'jvm.gc.action',

  /**
  * Name of the garbage collector.
  *
  * Note: Garbage collector name is generally obtained via [GarbageCollectionNotificationInfo#getGcName()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcName()).
  */
  JVM_GC_NAME: 'jvm.gc.name',

  /**
  * Whether the thread is daemon or not.
  */
  JVM_THREAD_DAEMON: 'jvm.thread.daemon',

  /**
  * State of the thread.
  */
  JVM_THREAD_STATE: 'jvm.thread.state',

  /**
  * The device identifier.
  */
  SYSTEM_DEVICE: 'system.device',

  /**
  * The logical CPU number [0..n-1].
  */
  SYSTEM_CPU_LOGICAL_NUMBER: 'system.cpu.logical_number',

  /**
  * The state of the CPU.
  */
  SYSTEM_CPU_STATE: 'system.cpu.state',

  /**
  * The memory state.
  */
  SYSTEM_MEMORY_STATE: 'system.memory.state',

  /**
  * The paging access direction.
  */
  SYSTEM_PAGING_DIRECTION: 'system.paging.direction',

  /**
  * The memory paging state.
  */
  SYSTEM_PAGING_STATE: 'system.paging.state',

  /**
  * The memory paging type.
  */
  SYSTEM_PAGING_TYPE: 'system.paging.type',

  /**
  * The filesystem mode.
  */
  SYSTEM_FILESYSTEM_MODE: 'system.filesystem.mode',

  /**
  * The filesystem mount path.
  */
  SYSTEM_FILESYSTEM_MOUNTPOINT: 'system.filesystem.mountpoint',

  /**
  * The filesystem state.
  */
  SYSTEM_FILESYSTEM_STATE: 'system.filesystem.state',

  /**
  * The filesystem type.
  */
  SYSTEM_FILESYSTEM_TYPE: 'system.filesystem.type',

  /**
  * A stateless protocol MUST NOT set this attribute.
  */
  SYSTEM_NETWORK_STATE: 'system.network.state',

  /**
  * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
  */
  SYSTEM_PROCESSES_STATUS: 'system.processes.status',

  /**
  * Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
  *
  * Note: When observed from the server side, and when communicating through an intermediary, `client.address` SHOULD represent the client address behind any intermediaries,  for example proxies, if it&#39;s available.
  */
  CLIENT_ADDRESS: 'client.address',

  /**
  * Client port number.
  *
  * Note: When observed from the server side, and when communicating through an intermediary, `client.port` SHOULD represent the client port behind any intermediaries,  for example proxies, if it&#39;s available.
  */
  CLIENT_PORT: 'client.port',

  /**
  * The column number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
  */
  CODE_COLUMN: 'code.column',

  /**
  * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
  */
  CODE_FILEPATH: 'code.filepath',

  /**
  * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
  */
  CODE_FUNCTION: 'code.function',

  /**
  * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
  */
  CODE_LINENO: 'code.lineno',

  /**
  * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
  */
  CODE_NAMESPACE: 'code.namespace',

  /**
  * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
  */
  CODE_STACKTRACE: 'code.stacktrace',

  /**
  * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
  */
  DB_CASSANDRA_CONSISTENCY_LEVEL: 'db.cassandra.consistency_level',

  /**
  * The data center of the coordinating node for a query.
  */
  DB_CASSANDRA_COORDINATOR_DC: 'db.cassandra.coordinator.dc',

  /**
  * The ID of the coordinating node for a query.
  */
  DB_CASSANDRA_COORDINATOR_ID: 'db.cassandra.coordinator.id',

  /**
  * Whether or not the query is idempotent.
  */
  DB_CASSANDRA_IDEMPOTENCE: 'db.cassandra.idempotence',

  /**
  * The fetch size used for paging, i.e. how many rows will be returned at once.
  */
  DB_CASSANDRA_PAGE_SIZE: 'db.cassandra.page_size',

  /**
  * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
  */
  DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT: 'db.cassandra.speculative_execution_count',

  /**
  * The name of the primary Cassandra table that the operation is acting upon, including the keyspace name (if applicable).
  *
  * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
  */
  DB_CASSANDRA_TABLE: 'db.cassandra.table',

  /**
  * The connection string used to connect to the database. It is recommended to remove embedded credentials.
  */
  DB_CONNECTION_STRING: 'db.connection_string',

  /**
  * Unique Cosmos client instance id.
  */
  DB_COSMOSDB_CLIENT_ID: 'db.cosmosdb.client_id',

  /**
  * Cosmos client connection mode.
  */
  DB_COSMOSDB_CONNECTION_MODE: 'db.cosmosdb.connection_mode',

  /**
  * Cosmos DB container name.
  */
  DB_COSMOSDB_CONTAINER: 'db.cosmosdb.container',

  /**
  * CosmosDB Operation Type.
  */
  DB_COSMOSDB_OPERATION_TYPE: 'db.cosmosdb.operation_type',

  /**
  * RU consumed for that operation.
  */
  DB_COSMOSDB_REQUEST_CHARGE: 'db.cosmosdb.request_charge',

  /**
  * Request payload size in bytes.
  */
  DB_COSMOSDB_REQUEST_CONTENT_LENGTH: 'db.cosmosdb.request_content_length',

  /**
  * Cosmos DB status code.
  */
  DB_COSMOSDB_STATUS_CODE: 'db.cosmosdb.status_code',

  /**
  * Cosmos DB sub status code.
  */
  DB_COSMOSDB_SUB_STATUS_CODE: 'db.cosmosdb.sub_status_code',

  /**
  * Represents the identifier of an Elasticsearch cluster.
  */
  DB_ELASTICSEARCH_CLUSTER_NAME: 'db.elasticsearch.cluster.name',

  /**
  * Represents the human-readable identifier of the node/instance to which a request was routed.
  */
  DB_ELASTICSEARCH_NODE_NAME: 'db.elasticsearch.node.name',

  /**
  * An identifier (address, unique name, or any other identifier) of the database instance that is executing queries or mutations on the current connection. This is useful in cases where the database is running in a clustered environment and the instrumentation is able to record the node executing the query. The client may obtain this value in databases like MySQL using queries like `select @@hostname`.
  */
  DB_INSTANCE_ID: 'db.instance.id',

  /**
  * The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
  */
  DB_JDBC_DRIVER_CLASSNAME: 'db.jdbc.driver_classname',

  /**
  * The MongoDB collection being accessed within the database stated in `db.name`.
  */
  DB_MONGODB_COLLECTION: 'db.mongodb.collection',

  /**
  * The Microsoft SQL Server [instance name](https://docs.microsoft.com/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
  *
  * Note: If setting a `db.mssql.instance_name`, `server.port` is no longer required (but still recommended if non-standard).
  */
  DB_MSSQL_INSTANCE_NAME: 'db.mssql.instance_name',

  /**
  * This attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
  *
  * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;. In case there are multiple layers that could be considered for database name (e.g. Oracle instance name and schema name), the database name to be used is the more specific layer (e.g. Oracle schema name).
  */
  DB_NAME: 'db.name',

  /**
  * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
  *
  * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
  */
  DB_OPERATION: 'db.operation',

  /**
  * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
  */
  DB_REDIS_DATABASE_INDEX: 'db.redis.database_index',

  /**
  * The name of the primary table that the operation is acting upon, including the database name (if applicable).
  *
  * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
  */
  DB_SQL_TABLE: 'db.sql.table',

  /**
  * The database statement being executed.
  */
  DB_STATEMENT: 'db.statement',

  /**
  * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
  */
  DB_SYSTEM: 'db.system',

  /**
  * Username for accessing the database.
  */
  DB_USER: 'db.user',

  /**
  * Deprecated, use `network.protocol.name` instead.
  *
  * @deprecated Replaced by `network.protocol.name`.
  */
  HTTP_FLAVOR: 'http.flavor',

  /**
  * Deprecated, use `http.request.method` instead.
  *
  * @deprecated Replaced by `http.request.method`.
  */
  HTTP_METHOD: 'http.method',

  /**
  * Deprecated, use `http.request.header.content-length` instead.
  *
  * @deprecated Replaced by `http.request.header.content-length`.
  */
  HTTP_REQUEST_CONTENT_LENGTH: 'http.request_content_length',

  /**
  * Deprecated, use `http.response.header.content-length` instead.
  *
  * @deprecated Replaced by `http.response.header.content-length`.
  */
  HTTP_RESPONSE_CONTENT_LENGTH: 'http.response_content_length',

  /**
  * Deprecated, use `url.scheme` instead.
  *
  * @deprecated Replaced by `url.scheme` instead.
  */
  HTTP_SCHEME: 'http.scheme',

  /**
  * Deprecated, use `http.response.status_code` instead.
  *
  * @deprecated Replaced by `http.response.status_code`.
  */
  HTTP_STATUS_CODE: 'http.status_code',

  /**
  * Deprecated, use `url.path` and `url.query` instead.
  *
  * @deprecated Split to `url.path` and `url.query.
  */
  HTTP_TARGET: 'http.target',

  /**
  * Deprecated, use `url.full` instead.
  *
  * @deprecated Replaced by `url.full`.
  */
  HTTP_URL: 'http.url',

  /**
  * Deprecated, use `user_agent.original` instead.
  *
  * @deprecated Replaced by `user_agent.original`.
  */
  HTTP_USER_AGENT: 'http.user_agent',

  /**
  * Deprecated, use `server.address`.
  *
  * @deprecated Replaced by `server.address`.
  */
  NET_HOST_NAME: 'net.host.name',

  /**
  * Deprecated, use `server.port`.
  *
  * @deprecated Replaced by `server.port`.
  */
  NET_HOST_PORT: 'net.host.port',

  /**
  * Deprecated, use `server.address` on client spans and `client.address` on server spans.
  *
  * @deprecated Replaced by `server.address` on client spans and `client.address` on server spans.
  */
  NET_PEER_NAME: 'net.peer.name',

  /**
  * Deprecated, use `server.port` on client spans and `client.port` on server spans.
  *
  * @deprecated Replaced by `server.port` on client spans and `client.port` on server spans.
  */
  NET_PEER_PORT: 'net.peer.port',

  /**
  * Deprecated, use `network.protocol.name`.
  *
  * @deprecated Replaced by `network.protocol.name`.
  */
  NET_PROTOCOL_NAME: 'net.protocol.name',

  /**
  * Deprecated, use `network.protocol.version`.
  *
  * @deprecated Replaced by `network.protocol.version`.
  */
  NET_PROTOCOL_VERSION: 'net.protocol.version',

  /**
  * Deprecated, use `network.transport` and `network.type`.
  *
  * @deprecated Split to `network.transport` and `network.type`.
  */
  NET_SOCK_FAMILY: 'net.sock.family',

  /**
  * Deprecated, use `network.local.address`.
  *
  * @deprecated Replaced by `network.local.address`.
  */
  NET_SOCK_HOST_ADDR: 'net.sock.host.addr',

  /**
  * Deprecated, use `network.local.port`.
  *
  * @deprecated Replaced by `network.local.port`.
  */
  NET_SOCK_HOST_PORT: 'net.sock.host.port',

  /**
  * Deprecated, use `network.peer.address`.
  *
  * @deprecated Replaced by `network.peer.address`.
  */
  NET_SOCK_PEER_ADDR: 'net.sock.peer.addr',

  /**
  * Deprecated, no replacement at this time.
  *
  * @deprecated Removed.
  */
  NET_SOCK_PEER_NAME: 'net.sock.peer.name',

  /**
  * Deprecated, use `network.peer.port`.
  *
  * @deprecated Replaced by `network.peer.port`.
  */
  NET_SOCK_PEER_PORT: 'net.sock.peer.port',

  /**
  * Deprecated, use `network.transport`.
  *
  * @deprecated Replaced by `network.transport`.
  */
  NET_TRANSPORT: 'net.transport',

  /**
  * Destination address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
  *
  * Note: When observed from the source side, and when communicating through an intermediary, `destination.address` SHOULD represent the destination address behind any intermediaries, for example proxies, if it&#39;s available.
  */
  DESTINATION_ADDRESS: 'destination.address',

  /**
  * Destination port number.
  */
  DESTINATION_PORT: 'destination.port',

  /**
  * The disk IO operation direction.
  */
  DISK_IO_DIRECTION: 'disk.io.direction',

  /**
  * Describes a class of error the operation ended with.
  *
  * Note: The `error.type` SHOULD be predictable and SHOULD have low cardinality.
Instrumentations SHOULD document the list of errors they report.

The cardinality of `error.type` within one instrumentation library SHOULD be low.
Telemetry consumers that aggregate data from multiple instrumentation libraries and applications
should be prepared for `error.type` to have high cardinality at query time when no
additional filters are applied.

If the operation has completed successfully, instrumentations SHOULD NOT set `error.type`.

If a specific domain defines its own set of error identifiers (such as HTTP or gRPC status codes),
it&#39;s RECOMMENDED to:

* Use a domain-specific attribute
* Set `error.type` to capture all errors, regardless of whether they are defined within the domain-specific set or not.
  */
  ERROR_TYPE: 'error.type',

  /**
  * SHOULD be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
  *
  * Note: An exception is considered to have escaped (or left) the scope of a span,
if that span is ended while the exception is still logically &#34;in flight&#34;.
This may be actually &#34;in flight&#34; in some languages (e.g. if the exception
is passed to a Context manager&#39;s `__exit__` method in Python) but will
usually be caught at the point of recording the exception in most languages.

It is usually not possible to determine at the point where an exception is thrown
whether it will escape the scope of a span.
However, it is trivial to know that an exception
will escape, if one checks for an active exception just before ending the span,
as done in the [example for recording span exceptions](#recording-an-exception).

It follows that an exception may still escape the scope of the span
even if the `exception.escaped` attribute was not set or set to false,
since the event might have been recorded at a time where it was not
clear whether the exception will escape.
  */
  EXCEPTION_ESCAPED: 'exception.escaped',

  /**
  * The exception message.
  */
  EXCEPTION_MESSAGE: 'exception.message',

  /**
  * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
  */
  EXCEPTION_STACKTRACE: 'exception.stacktrace',

  /**
  * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
  */
  EXCEPTION_TYPE: 'exception.type',

  /**
  * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
  */
  HTTP_REQUEST_BODY_SIZE: 'http.request.body.size',

  /**
  * HTTP request method.
  *
  * Note: HTTP request method value SHOULD be &#34;known&#34; to the instrumentation.
By default, this convention defines &#34;known&#34; methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
and the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html).

If the HTTP request method is not known to instrumentation, it MUST set the `http.request.method` attribute to `_OTHER`.

If the HTTP instrumentation could end up converting valid HTTP request methods to `_OTHER`, then it MUST provide a way to override
the list of known HTTP methods. If this override is done via environment variable, then the environment variable MUST be named
OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS and support a comma-separated list of case-sensitive known HTTP methods
(this list MUST be a full override of the default known method, it is not a list of known methods in addition to the defaults).

HTTP method names are case-sensitive and `http.request.method` attribute value MUST match a known HTTP method name exactly.
Instrumentations for specific web frameworks that consider HTTP methods to be case insensitive, SHOULD populate a canonical equivalent.
Tracing instrumentations that do so, MUST also set `http.request.method_original` to the original value.
  */
  HTTP_REQUEST_METHOD: 'http.request.method',

  /**
  * Original HTTP method sent by the client in the request line.
  */
  HTTP_REQUEST_METHOD_ORIGINAL: 'http.request.method_original',

  /**
  * The ordinal number of request resending attempt (for any reason, including redirects).
  *
  * Note: The resend count SHOULD be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
  */
  HTTP_REQUEST_RESEND_COUNT: 'http.request.resend_count',

  /**
  * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
  */
  HTTP_RESPONSE_BODY_SIZE: 'http.response.body.size',

  /**
  * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
  */
  HTTP_RESPONSE_STATUS_CODE: 'http.response.status_code',

  /**
  * The matched route, that is, the path template in the format used by the respective server framework.
  *
  * Note: MUST NOT be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
  */
  HTTP_ROUTE: 'http.route',

  /**
  * The number of messages sent, received, or processed in the scope of the batching operation.
  *
  * Note: Instrumentations SHOULD NOT set `messaging.batch.message_count` on spans that operate with a single message. When a messaging client library supports both batch and single-message API for the same operation, instrumentations SHOULD use `messaging.batch.message_count` for batching APIs and SHOULD NOT use it for single-message APIs.
  */
  MESSAGING_BATCH_MESSAGE_COUNT: 'messaging.batch.message_count',

  /**
  * A unique identifier for the client that consumes or produces a message.
  */
  MESSAGING_CLIENT_ID: 'messaging.client_id',

  /**
  * A boolean that is true if the message destination is anonymous (could be unnamed or have auto-generated name).
  */
  MESSAGING_DESTINATION_ANONYMOUS: 'messaging.destination.anonymous',

  /**
  * The message destination name.
  *
  * Note: Destination name SHOULD uniquely identify a specific queue, topic or other entity within the broker. If
the broker doesn&#39;t have such notion, the destination name SHOULD uniquely identify the broker.
  */
  MESSAGING_DESTINATION_NAME: 'messaging.destination.name',

  /**
  * Low cardinality representation of the messaging destination name.
  *
  * Note: Destination names could be constructed from templates. An example would be a destination name involving a user name or product id. Although the destination name in this case is of high cardinality, the underlying template is of low cardinality and can be effectively used for grouping and aggregation.
  */
  MESSAGING_DESTINATION_TEMPLATE: 'messaging.destination.template',

  /**
  * A boolean that is true if the message destination is temporary and might not exist anymore after messages are processed.
  */
  MESSAGING_DESTINATION_TEMPORARY: 'messaging.destination.temporary',

  /**
  * A boolean that is true if the publish message destination is anonymous (could be unnamed or have auto-generated name).
  */
  MESSAGING_DESTINATION_PUBLISH_ANONYMOUS: 'messaging.destination_publish.anonymous',

  /**
  * The name of the original destination the message was published to.
  *
  * Note: The name SHOULD uniquely identify a specific queue, topic, or other entity within the broker. If
the broker doesn&#39;t have such notion, the original destination name SHOULD uniquely identify the broker.
  */
  MESSAGING_DESTINATION_PUBLISH_NAME: 'messaging.destination_publish.name',

  /**
  * The ordering key for a given message. If the attribute is not present, the message does not have an ordering key.
  */
  MESSAGING_GCP_PUBSUB_MESSAGE_ORDERING_KEY: 'messaging.gcp_pubsub.message.ordering_key',

  /**
  * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
  */
  MESSAGING_KAFKA_CONSUMER_GROUP: 'messaging.kafka.consumer.group',

  /**
  * Partition the message is sent to.
  */
  MESSAGING_KAFKA_DESTINATION_PARTITION: 'messaging.kafka.destination.partition',

  /**
  * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message.id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
  *
  * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
  */
  MESSAGING_KAFKA_MESSAGE_KEY: 'messaging.kafka.message.key',

  /**
  * The offset of a record in the corresponding Kafka partition.
  */
  MESSAGING_KAFKA_MESSAGE_OFFSET: 'messaging.kafka.message.offset',

  /**
  * A boolean that is true if the message is a tombstone.
  */
  MESSAGING_KAFKA_MESSAGE_TOMBSTONE: 'messaging.kafka.message.tombstone',

  /**
  * The size of the message body in bytes.
  *
  * Note: This can refer to both the compressed or uncompressed body size. If both sizes are known, the uncompressed
body size should be used.
  */
  MESSAGING_MESSAGE_BODY_SIZE: 'messaging.message.body.size',

  /**
  * The conversation ID identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
  */
  MESSAGING_MESSAGE_CONVERSATION_ID: 'messaging.message.conversation_id',

  /**
  * The size of the message body and metadata in bytes.
  *
  * Note: This can refer to both the compressed or uncompressed size. If both sizes are known, the uncompressed
size should be used.
  */
  MESSAGING_MESSAGE_ENVELOPE_SIZE: 'messaging.message.envelope.size',

  /**
  * A value used by the messaging system as an identifier for the message, represented as a string.
  */
  MESSAGING_MESSAGE_ID: 'messaging.message.id',

  /**
  * A string identifying the kind of messaging operation.
  *
  * Note: If a custom value is used, it MUST be of low cardinality.
  */
  MESSAGING_OPERATION: 'messaging.operation',

  /**
  * RabbitMQ message routing key.
  */
  MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY: 'messaging.rabbitmq.destination.routing_key',

  /**
  * Name of the RocketMQ producer/consumer group that is handling the message. The client type is identified by the SpanKind.
  */
  MESSAGING_ROCKETMQ_CLIENT_GROUP: 'messaging.rocketmq.client_group',

  /**
  * Model of message consumption. This only applies to consumer spans.
  */
  MESSAGING_ROCKETMQ_CONSUMPTION_MODEL: 'messaging.rocketmq.consumption_model',

  /**
  * The delay time level for delay message, which determines the message delay time.
  */
  MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL: 'messaging.rocketmq.message.delay_time_level',

  /**
  * The timestamp in milliseconds that the delay message is expected to be delivered to consumer.
  */
  MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP: 'messaging.rocketmq.message.delivery_timestamp',

  /**
  * It is essential for FIFO message. Messages that belong to the same message group are always processed one by one within the same consumer group.
  */
  MESSAGING_ROCKETMQ_MESSAGE_GROUP: 'messaging.rocketmq.message.group',

  /**
  * Key(s) of message, another way to mark message besides message id.
  */
  MESSAGING_ROCKETMQ_MESSAGE_KEYS: 'messaging.rocketmq.message.keys',

  /**
  * The secondary classifier of message besides topic.
  */
  MESSAGING_ROCKETMQ_MESSAGE_TAG: 'messaging.rocketmq.message.tag',

  /**
  * Type of message.
  */
  MESSAGING_ROCKETMQ_MESSAGE_TYPE: 'messaging.rocketmq.message.type',

  /**
  * Namespace of RocketMQ resources, resources in different namespaces are individual.
  */
  MESSAGING_ROCKETMQ_NAMESPACE: 'messaging.rocketmq.namespace',

  /**
  * An identifier for the messaging system being used. See below for a list of well-known identifiers.
  */
  MESSAGING_SYSTEM: 'messaging.system',

  /**
  * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
  */
  NETWORK_CARRIER_ICC: 'network.carrier.icc',

  /**
  * The mobile carrier country code.
  */
  NETWORK_CARRIER_MCC: 'network.carrier.mcc',

  /**
  * The mobile carrier network code.
  */
  NETWORK_CARRIER_MNC: 'network.carrier.mnc',

  /**
  * The name of the mobile carrier.
  */
  NETWORK_CARRIER_NAME: 'network.carrier.name',

  /**
  * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
  */
  NETWORK_CONNECTION_SUBTYPE: 'network.connection.subtype',

  /**
  * The internet connection type.
  */
  NETWORK_CONNECTION_TYPE: 'network.connection.type',

  /**
  * The network IO operation direction.
  */
  NETWORK_IO_DIRECTION: 'network.io.direction',

  /**
  * Local address of the network connection - IP address or Unix domain socket name.
  */
  NETWORK_LOCAL_ADDRESS: 'network.local.address',

  /**
  * Local port number of the network connection.
  */
  NETWORK_LOCAL_PORT: 'network.local.port',

  /**
  * Peer address of the network connection - IP address or Unix domain socket name.
  */
  NETWORK_PEER_ADDRESS: 'network.peer.address',

  /**
  * Peer port number of the network connection.
  */
  NETWORK_PEER_PORT: 'network.peer.port',

  /**
  * [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
  *
  * Note: The value SHOULD be normalized to lowercase.
  */
  NETWORK_PROTOCOL_NAME: 'network.protocol.name',

  /**
  * Version of the protocol specified in `network.protocol.name`.
  *
  * Note: `network.protocol.version` refers to the version of the protocol used and might be different from the protocol client&#39;s version. If the HTTP client has a version of `0.27.2`, but sends HTTP version `1.1`, this attribute should be set to `1.1`.
  */
  NETWORK_PROTOCOL_VERSION: 'network.protocol.version',

  /**
  * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
  *
  * Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
  */
  NETWORK_TRANSPORT: 'network.transport',

  /**
  * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
  *
  * Note: The value SHOULD be normalized to lowercase.
  */
  NETWORK_TYPE: 'network.type',

  /**
  * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
  */
  RPC_CONNECT_RPC_ERROR_CODE: 'rpc.connect_rpc.error_code',

  /**
  * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
  */
  RPC_GRPC_STATUS_CODE: 'rpc.grpc.status_code',

  /**
  * `error.code` property of response if it is an error response.
  */
  RPC_JSONRPC_ERROR_CODE: 'rpc.jsonrpc.error_code',

  /**
  * `error.message` property of response if it is an error response.
  */
  RPC_JSONRPC_ERROR_MESSAGE: 'rpc.jsonrpc.error_message',

  /**
  * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
  */
  RPC_JSONRPC_REQUEST_ID: 'rpc.jsonrpc.request_id',

  /**
  * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 doesn&#39;t specify this, the value can be omitted.
  */
  RPC_JSONRPC_VERSION: 'rpc.jsonrpc.version',

  /**
  * The name of the (logical) method being called, must be equal to the $method part in the span name.
  *
  * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
  */
  RPC_METHOD: 'rpc.method',

  /**
  * The full (logical) name of the service being called, including its package name, if applicable.
  *
  * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
  */
  RPC_SERVICE: 'rpc.service',

  /**
  * A string identifying the remoting system. See below for a list of well-known identifiers.
  */
  RPC_SYSTEM: 'rpc.system',

  /**
  * Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
  *
  * Note: When observed from the client side, and when communicating through an intermediary, `server.address` SHOULD represent the server address behind any intermediaries, for example proxies, if it&#39;s available.
  */
  SERVER_ADDRESS: 'server.address',

  /**
  * Server port number.
  *
  * Note: When observed from the client side, and when communicating through an intermediary, `server.port` SHOULD represent the server port behind any intermediaries, for example proxies, if it&#39;s available.
  */
  SERVER_PORT: 'server.port',

  /**
  * Source address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
  *
  * Note: When observed from the destination side, and when communicating through an intermediary, `source.address` SHOULD represent the source address behind any intermediaries, for example proxies, if it&#39;s available.
  */
  SOURCE_ADDRESS: 'source.address',

  /**
  * Source port number.
  */
  SOURCE_PORT: 'source.port',

  /**
  * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
  */
  THREAD_ID: 'thread.id',

  /**
  * Current thread name.
  */
  THREAD_NAME: 'thread.name',

  /**
  * String indicating the [cipher](https://datatracker.ietf.org/doc/html/rfc5246#appendix-A.5) used during the current connection.
  *
  * Note: The values allowed for `tls.cipher` MUST be one of the `Descriptions` of the [registered TLS Cipher Suits](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#table-tls-parameters-4).
  */
  TLS_CIPHER: 'tls.cipher',

  /**
  * PEM-encoded stand-alone certificate offered by the client. This is usually mutually-exclusive of `client.certificate_chain` since this value also exists in that list.
  */
  TLS_CLIENT_CERTIFICATE: 'tls.client.certificate',

  /**
  * Array of PEM-encoded certificates that make up the certificate chain offered by the client. This is usually mutually-exclusive of `client.certificate` since that value should be the first certificate in the chain.
  */
  TLS_CLIENT_CERTIFICATE_CHAIN: 'tls.client.certificate_chain',

  /**
  * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
  */
  TLS_CLIENT_HASH_MD5: 'tls.client.hash.md5',

  /**
  * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
  */
  TLS_CLIENT_HASH_SHA1: 'tls.client.hash.sha1',

  /**
  * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
  */
  TLS_CLIENT_HASH_SHA256: 'tls.client.hash.sha256',

  /**
  * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
  */
  TLS_CLIENT_ISSUER: 'tls.client.issuer',

  /**
  * A hash that identifies clients based on how they perform an SSL/TLS handshake.
  */
  TLS_CLIENT_JA3: 'tls.client.ja3',

  /**
  * Date/Time indicating when client certificate is no longer considered valid.
  */
  TLS_CLIENT_NOT_AFTER: 'tls.client.not_after',

  /**
  * Date/Time indicating when client certificate is first considered valid.
  */
  TLS_CLIENT_NOT_BEFORE: 'tls.client.not_before',

  /**
  * Also called an SNI, this tells the server which hostname to which the client is attempting to connect to.
  */
  TLS_CLIENT_SERVER_NAME: 'tls.client.server_name',

  /**
  * Distinguished name of subject of the x.509 certificate presented by the client.
  */
  TLS_CLIENT_SUBJECT: 'tls.client.subject',

  /**
  * Array of ciphers offered by the client during the client hello.
  */
  TLS_CLIENT_SUPPORTED_CIPHERS: 'tls.client.supported_ciphers',

  /**
  * String indicating the curve used for the given cipher, when applicable.
  */
  TLS_CURVE: 'tls.curve',

  /**
  * Boolean flag indicating if the TLS negotiation was successful and transitioned to an encrypted tunnel.
  */
  TLS_ESTABLISHED: 'tls.established',

  /**
  * String indicating the protocol being tunneled. Per the values in the [IANA registry](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids), this string should be lower case.
  */
  TLS_NEXT_PROTOCOL: 'tls.next_protocol',

  /**
  * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
  */
  TLS_PROTOCOL_NAME: 'tls.protocol.name',

  /**
  * Numeric part of the version parsed from the original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
  */
  TLS_PROTOCOL_VERSION: 'tls.protocol.version',

  /**
  * Boolean flag indicating if this TLS connection was resumed from an existing TLS negotiation.
  */
  TLS_RESUMED: 'tls.resumed',

  /**
  * PEM-encoded stand-alone certificate offered by the server. This is usually mutually-exclusive of `server.certificate_chain` since this value also exists in that list.
  */
  TLS_SERVER_CERTIFICATE: 'tls.server.certificate',

  /**
  * Array of PEM-encoded certificates that make up the certificate chain offered by the server. This is usually mutually-exclusive of `server.certificate` since that value should be the first certificate in the chain.
  */
  TLS_SERVER_CERTIFICATE_CHAIN: 'tls.server.certificate_chain',

  /**
  * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
  */
  TLS_SERVER_HASH_MD5: 'tls.server.hash.md5',

  /**
  * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
  */
  TLS_SERVER_HASH_SHA1: 'tls.server.hash.sha1',

  /**
  * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
  */
  TLS_SERVER_HASH_SHA256: 'tls.server.hash.sha256',

  /**
  * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
  */
  TLS_SERVER_ISSUER: 'tls.server.issuer',

  /**
  * A hash that identifies servers based on how they perform an SSL/TLS handshake.
  */
  TLS_SERVER_JA3S: 'tls.server.ja3s',

  /**
  * Date/Time indicating when server certificate is no longer considered valid.
  */
  TLS_SERVER_NOT_AFTER: 'tls.server.not_after',

  /**
  * Date/Time indicating when server certificate is first considered valid.
  */
  TLS_SERVER_NOT_BEFORE: 'tls.server.not_before',

  /**
  * Distinguished name of subject of the x.509 certificate presented by the server.
  */
  TLS_SERVER_SUBJECT: 'tls.server.subject',

  /**
  * The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component.
  */
  URL_FRAGMENT: 'url.fragment',

  /**
  * Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986).
  *
  * Note: For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it SHOULD be included nevertheless.
`url.full` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password SHOULD be redacted and attribute&#39;s value SHOULD be `https://REDACTED:REDACTED@www.example.com/`.
`url.full` SHOULD capture the absolute URL when it is available (or can be reconstructed) and SHOULD NOT be validated or modified except for sanitizing purposes.
  */
  URL_FULL: 'url.full',

  /**
  * The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component.
  */
  URL_PATH: 'url.path',

  /**
  * The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component.
  *
  * Note: Sensitive content provided in query string SHOULD be scrubbed when instrumentations can identify it.
  */
  URL_QUERY: 'url.query',

  /**
  * The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
  */
  URL_SCHEME: 'url.scheme',

  /**
  * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
  */
  USER_AGENT_ORIGINAL: 'user_agent.original',

  /**
  * A unique id to identify a session.
  */
  SESSION_ID: 'session.id',

  /**
  * The previous `session.id` for this user, when known.
  */
  SESSION_PREVIOUS_ID: 'session.previous_id',

  /**
  * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
  *
  * Note: This may be different from `cloud.resource_id` if an alias is involved.
  */
  AWS_LAMBDA_INVOKED_ARN: 'aws.lambda.invoked_arn',

  /**
  * The [event_id](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#id) uniquely identifies the event.
  */
  CLOUDEVENTS_EVENT_ID: 'cloudevents.event_id',

  /**
  * The [source](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#source-1) identifies the context in which an event happened.
  */
  CLOUDEVENTS_EVENT_SOURCE: 'cloudevents.event_source',

  /**
  * The [version of the CloudEvents specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#specversion) which the event uses.
  */
  CLOUDEVENTS_EVENT_SPEC_VERSION: 'cloudevents.event_spec_version',

  /**
  * The [subject](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#subject) of the event in the context of the event producer (identified by source).
  */
  CLOUDEVENTS_EVENT_SUBJECT: 'cloudevents.event_subject',

  /**
  * The [event_type](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#type) contains a value describing the type of event related to the originating occurrence.
  */
  CLOUDEVENTS_EVENT_TYPE: 'cloudevents.event_type',

  /**
  * Parent-child Reference type.
  *
  * Note: The causal relationship between a child Span and a parent Span.
  */
  OPENTRACING_REF_TYPE: 'opentracing.ref_type',

  /**
  * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
  */
  OTEL_STATUS_CODE: 'otel.status_code',

  /**
  * Description of the Status if it has a value, otherwise not set.
  */
  OTEL_STATUS_DESCRIPTION: 'otel.status_description',

  /**
  * The invocation ID of the current function invocation.
  */
  FAAS_INVOCATION_ID: 'faas.invocation_id',

  /**
  * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
  */
  FAAS_DOCUMENT_COLLECTION: 'faas.document.collection',

  /**
  * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
  */
  FAAS_DOCUMENT_NAME: 'faas.document.name',

  /**
  * Describes the type of the operation that was performed on the data.
  */
  FAAS_DOCUMENT_OPERATION: 'faas.document.operation',

  /**
  * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
  */
  FAAS_DOCUMENT_TIME: 'faas.document.time',

  /**
  * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
  */
  FAAS_CRON: 'faas.cron',

  /**
  * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
  */
  FAAS_TIME: 'faas.time',

  /**
  * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
  */
  FAAS_COLDSTART: 'faas.coldstart',

  /**
  * The unique identifier of the feature flag.
  */
  FEATURE_FLAG_KEY: 'feature_flag.key',

  /**
  * The name of the service provider that performs the flag evaluation.
  */
  FEATURE_FLAG_PROVIDER_NAME: 'feature_flag.provider_name',

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
  */
  FEATURE_FLAG_VARIANT: 'feature_flag.variant',

  /**
  * The AWS request ID as returned in the response headers `x-amz-request-id` or `x-amz-requestid`.
  */
  AWS_REQUEST_ID: 'aws.request_id',

  /**
  * The value of the `AttributesToGet` request parameter.
  */
  AWS_DYNAMODB_ATTRIBUTES_TO_GET: 'aws.dynamodb.attributes_to_get',

  /**
  * The value of the `ConsistentRead` request parameter.
  */
  AWS_DYNAMODB_CONSISTENT_READ: 'aws.dynamodb.consistent_read',

  /**
  * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
  */
  AWS_DYNAMODB_CONSUMED_CAPACITY: 'aws.dynamodb.consumed_capacity',

  /**
  * The value of the `IndexName` request parameter.
  */
  AWS_DYNAMODB_INDEX_NAME: 'aws.dynamodb.index_name',

  /**
  * The JSON-serialized value of the `ItemCollectionMetrics` response field.
  */
  AWS_DYNAMODB_ITEM_COLLECTION_METRICS: 'aws.dynamodb.item_collection_metrics',

  /**
  * The value of the `Limit` request parameter.
  */
  AWS_DYNAMODB_LIMIT: 'aws.dynamodb.limit',

  /**
  * The value of the `ProjectionExpression` request parameter.
  */
  AWS_DYNAMODB_PROJECTION: 'aws.dynamodb.projection',

  /**
  * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
  */
  AWS_DYNAMODB_PROVISIONED_READ_CAPACITY: 'aws.dynamodb.provisioned_read_capacity',

  /**
  * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
  */
  AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY: 'aws.dynamodb.provisioned_write_capacity',

  /**
  * The value of the `Select` request parameter.
  */
  AWS_DYNAMODB_SELECT: 'aws.dynamodb.select',

  /**
  * The keys in the `RequestItems` object field.
  */
  AWS_DYNAMODB_TABLE_NAMES: 'aws.dynamodb.table_names',

  /**
  * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
  */
  AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES: 'aws.dynamodb.global_secondary_indexes',

  /**
  * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
  */
  AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES: 'aws.dynamodb.local_secondary_indexes',

  /**
  * The value of the `ExclusiveStartTableName` request parameter.
  */
  AWS_DYNAMODB_EXCLUSIVE_START_TABLE: 'aws.dynamodb.exclusive_start_table',

  /**
  * The the number of items in the `TableNames` response parameter.
  */
  AWS_DYNAMODB_TABLE_COUNT: 'aws.dynamodb.table_count',

  /**
  * The value of the `ScanIndexForward` request parameter.
  */
  AWS_DYNAMODB_SCAN_FORWARD: 'aws.dynamodb.scan_forward',

  /**
  * The value of the `Count` response parameter.
  */
  AWS_DYNAMODB_COUNT: 'aws.dynamodb.count',

  /**
  * The value of the `ScannedCount` response parameter.
  */
  AWS_DYNAMODB_SCANNED_COUNT: 'aws.dynamodb.scanned_count',

  /**
  * The value of the `Segment` request parameter.
  */
  AWS_DYNAMODB_SEGMENT: 'aws.dynamodb.segment',

  /**
  * The value of the `TotalSegments` request parameter.
  */
  AWS_DYNAMODB_TOTAL_SEGMENTS: 'aws.dynamodb.total_segments',

  /**
  * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
  */
  AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS: 'aws.dynamodb.attribute_definitions',

  /**
  * The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
  */
  AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES: 'aws.dynamodb.global_secondary_index_updates',

  /**
  * The S3 bucket name the request refers to. Corresponds to the `--bucket` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
  *
  * Note: The `bucket` attribute is applicable to all S3 operations that reference a bucket, i.e. that require the bucket name as a mandatory parameter.
This applies to almost all S3 operations except `list-buckets`.
  */
  AWS_S3_BUCKET: 'aws.s3.bucket',

  /**
  * The source object (in the form `bucket`/`key`) for the copy operation.
  *
  * Note: The `copy_source` attribute applies to S3 copy operations and corresponds to the `--copy-source` parameter
of the [copy-object operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html).
This applies in particular to the following operations:

- [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
- [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
  */
  AWS_S3_COPY_SOURCE: 'aws.s3.copy_source',

  /**
  * The delete request container that specifies the objects to be deleted.
  *
  * Note: The `delete` attribute is only applicable to the [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html) operation.
The `delete` attribute corresponds to the `--delete` parameter of the
[delete-objects operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-objects.html).
  */
  AWS_S3_DELETE: 'aws.s3.delete',

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
  */
  AWS_S3_KEY: 'aws.s3.key',

  /**
  * The part number of the part being uploaded in a multipart-upload operation. This is a positive integer between 1 and 10,000.
  *
  * Note: The `part_number` attribute is only applicable to the [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
and [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html) operations.
The `part_number` attribute corresponds to the `--part-number` parameter of the
[upload-part operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html).
  */
  AWS_S3_PART_NUMBER: 'aws.s3.part_number',

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
  */
  AWS_S3_UPLOAD_ID: 'aws.s3.upload_id',

  /**
  * The GraphQL document being executed.
  *
  * Note: The value may be sanitized to exclude sensitive information.
  */
  GRAPHQL_DOCUMENT: 'graphql.document',

  /**
  * The name of the operation being executed.
  */
  GRAPHQL_OPERATION_NAME: 'graphql.operation.name',

  /**
  * The type of the operation being executed.
  */
  GRAPHQL_OPERATION_TYPE: 'graphql.operation.type',

  /**
  * Compressed size of the message in bytes.
  */
  MESSAGE_COMPRESSED_SIZE: 'message.compressed_size',

  /**
  * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
  *
  * Note: This way we guarantee that the values will be consistent between different implementations.
  */
  MESSAGE_ID: 'message.id',

  /**
  * Whether this is a received or sent message.
  */
  MESSAGE_TYPE: 'message.type',

  /**
  * Uncompressed size of the message in bytes.
  */
  MESSAGE_UNCOMPRESSED_SIZE: 'message.uncompressed_size',
}


export const FaasInvokedProviderValues = {
  /** Alibaba Cloud. */
  ALIBABA_CLOUD: 'alibaba_cloud',
  /** Amazon Web Services. */
  AWS: 'aws',
  /** Microsoft Azure. */
  AZURE: 'azure',
  /** Google Cloud Platform. */
  GCP: 'gcp',
  /** Tencent Cloud. */
  TENCENT_CLOUD: 'tencent_cloud',
} as const
export type FaasInvokedProviderValues = typeof FaasInvokedProviderValues[keyof typeof FaasInvokedProviderValues]




export const FaasTriggerValues = {
  /** A response to some data source operation such as a database or filesystem read/write. */
  DATASOURCE: 'datasource',
  /** To provide an answer to an inbound HTTP request. */
  HTTP: 'http',
  /** A function is set to be executed when messages are sent to a messaging system. */
  PUBSUB: 'pubsub',
  /** A function is scheduled to be executed regularly. */
  TIMER: 'timer',
  /** If none of the others apply. */
  OTHER: 'other',
} as const
export type FaasTriggerValues = typeof FaasTriggerValues[keyof typeof FaasTriggerValues]




export const LogIostreamValues = {
  /** Logs from stdout stream. */
  STDOUT: 'stdout',
  /** Events from stderr stream. */
  STDERR: 'stderr',
} as const
export type LogIostreamValues = typeof LogIostreamValues[keyof typeof LogIostreamValues]




export const IosStateValues = {
  /** The app has become `active`. Associated with UIKit notification `applicationDidBecomeActive`. */
  ACTIVE: 'active',
  /** The app is now `inactive`. Associated with UIKit notification `applicationWillResignActive`. */
  INACTIVE: 'inactive',
  /** The app is now in the background. This value is associated with UIKit notification `applicationDidEnterBackground`. */
  BACKGROUND: 'background',
  /** The app is now in the foreground. This value is associated with UIKit notification `applicationWillEnterForeground`. */
  FOREGROUND: 'foreground',
  /** The app is about to terminate. Associated with UIKit notification `applicationWillTerminate`. */
  TERMINATE: 'terminate',
} as const
export type IosStateValues = typeof IosStateValues[keyof typeof IosStateValues]




export const AndroidStateValues = {
  /** Any time before Activity.onResume() or, if the app has no Activity, Context.startService() has been called in the app for the first time. */
  CREATED: 'created',
  /** Any time after Activity.onPause() or, if the app has no Activity, Context.stopService() has been called when the app was in the foreground state. */
  BACKGROUND: 'background',
  /** Any time after Activity.onResume() or, if the app has no Activity, Context.startService() has been called when the app was in either the created or background states. */
  FOREGROUND: 'foreground',
} as const
export type AndroidStateValues = typeof AndroidStateValues[keyof typeof AndroidStateValues]




export const StateValues = {
  /** idle. */
  IDLE: 'idle',
  /** used. */
  USED: 'used',
} as const
export type StateValues = typeof StateValues[keyof typeof StateValues]




export const AspnetcoreRateLimitingResultValues = {
  /** Lease was acquired. */
  ACQUIRED: 'acquired',
  /** Lease request was rejected by the endpoint limiter. */
  ENDPOINT_LIMITER: 'endpoint_limiter',
  /** Lease request was rejected by the global limiter. */
  GLOBAL_LIMITER: 'global_limiter',
  /** Lease request was canceled. */
  REQUEST_CANCELED: 'request_canceled',
} as const
export type AspnetcoreRateLimitingResultValues = typeof AspnetcoreRateLimitingResultValues[keyof typeof AspnetcoreRateLimitingResultValues]




export const AspnetcoreRoutingMatchStatusValues = {
  /** Match succeeded. */
  SUCCESS: 'success',
  /** Match failed. */
  FAILURE: 'failure',
} as const
export type AspnetcoreRoutingMatchStatusValues = typeof AspnetcoreRoutingMatchStatusValues[keyof typeof AspnetcoreRoutingMatchStatusValues]




export const AspnetcoreDiagnosticsExceptionResultValues = {
  /** Exception was handled by the exception handling middleware. */
  HANDLED: 'handled',
  /** Exception was not handled by the exception handling middleware. */
  UNHANDLED: 'unhandled',
  /** Exception handling was skipped because the response had started. */
  SKIPPED: 'skipped',
  /** Exception handling didn&#39;t run because the request was aborted. */
  ABORTED: 'aborted',
} as const
export type AspnetcoreDiagnosticsExceptionResultValues = typeof AspnetcoreDiagnosticsExceptionResultValues[keyof typeof AspnetcoreDiagnosticsExceptionResultValues]




export const HttpConnectionStateValues = {
  /** active state. */
  ACTIVE: 'active',
  /** idle state. */
  IDLE: 'idle',
} as const
export type HttpConnectionStateValues = typeof HttpConnectionStateValues[keyof typeof HttpConnectionStateValues]




export const SignalrConnectionStatusValues = {
  /** The connection was closed normally. */
  NORMAL_CLOSURE: 'normal_closure',
  /** The connection was closed due to a timeout. */
  TIMEOUT: 'timeout',
  /** The connection was closed because the app is shutting down. */
  APP_SHUTDOWN: 'app_shutdown',
} as const
export type SignalrConnectionStatusValues = typeof SignalrConnectionStatusValues[keyof typeof SignalrConnectionStatusValues]




export const SignalrTransportValues = {
  /** ServerSentEvents protocol. */
  SERVER_SENT_EVENTS: 'server_sent_events',
  /** LongPolling protocol. */
  LONG_POLLING: 'long_polling',
  /** WebSockets protocol. */
  WEB_SOCKETS: 'web_sockets',
} as const
export type SignalrTransportValues = typeof SignalrTransportValues[keyof typeof SignalrTransportValues]




export const JvmMemoryTypeValues = {
  /** Heap memory. */
  HEAP: 'heap',
  /** Non-heap memory. */
  NON_HEAP: 'non_heap',
} as const
export type JvmMemoryTypeValues = typeof JvmMemoryTypeValues[keyof typeof JvmMemoryTypeValues]




export const JvmThreadStateValues = {
  /** A thread that has not yet started is in this state. */
  NEW: 'new',
  /** A thread executing in the Java virtual machine is in this state. */
  RUNNABLE: 'runnable',
  /** A thread that is blocked waiting for a monitor lock is in this state. */
  BLOCKED: 'blocked',
  /** A thread that is waiting indefinitely for another thread to perform a particular action is in this state. */
  WAITING: 'waiting',
  /** A thread that is waiting for another thread to perform an action for up to a specified waiting time is in this state. */
  TIMED_WAITING: 'timed_waiting',
  /** A thread that has exited is in this state. */
  TERMINATED: 'terminated',
} as const
export type JvmThreadStateValues = typeof JvmThreadStateValues[keyof typeof JvmThreadStateValues]




export const SystemCpuStateValues = {
  /** user. */
  USER: 'user',
  /** system. */
  SYSTEM: 'system',
  /** nice. */
  NICE: 'nice',
  /** idle. */
  IDLE: 'idle',
  /** iowait. */
  IOWAIT: 'iowait',
  /** interrupt. */
  INTERRUPT: 'interrupt',
  /** steal. */
  STEAL: 'steal',
} as const
export type SystemCpuStateValues = typeof SystemCpuStateValues[keyof typeof SystemCpuStateValues]




export const SystemMemoryStateValues = {
  /** used. */
  USED: 'used',
  /** free. */
  FREE: 'free',
  /** shared. */
  SHARED: 'shared',
  /** buffers. */
  BUFFERS: 'buffers',
  /** cached. */
  CACHED: 'cached',
} as const
export type SystemMemoryStateValues = typeof SystemMemoryStateValues[keyof typeof SystemMemoryStateValues]




export const SystemPagingDirectionValues = {
  /** in. */
  IN: 'in',
  /** out. */
  OUT: 'out',
} as const
export type SystemPagingDirectionValues = typeof SystemPagingDirectionValues[keyof typeof SystemPagingDirectionValues]




export const SystemPagingStateValues = {
  /** used. */
  USED: 'used',
  /** free. */
  FREE: 'free',
} as const
export type SystemPagingStateValues = typeof SystemPagingStateValues[keyof typeof SystemPagingStateValues]




export const SystemPagingTypeValues = {
  /** major. */
  MAJOR: 'major',
  /** minor. */
  MINOR: 'minor',
} as const
export type SystemPagingTypeValues = typeof SystemPagingTypeValues[keyof typeof SystemPagingTypeValues]




export const SystemFilesystemStateValues = {
  /** used. */
  USED: 'used',
  /** free. */
  FREE: 'free',
  /** reserved. */
  RESERVED: 'reserved',
} as const
export type SystemFilesystemStateValues = typeof SystemFilesystemStateValues[keyof typeof SystemFilesystemStateValues]




export const SystemFilesystemTypeValues = {
  /** fat32. */
  FAT32: 'fat32',
  /** exfat. */
  EXFAT: 'exfat',
  /** ntfs. */
  NTFS: 'ntfs',
  /** refs. */
  REFS: 'refs',
  /** hfsplus. */
  HFSPLUS: 'hfsplus',
  /** ext4. */
  EXT4: 'ext4',
} as const
export type SystemFilesystemTypeValues = typeof SystemFilesystemTypeValues[keyof typeof SystemFilesystemTypeValues]




export const SystemNetworkStateValues = {
  /** close. */
  CLOSE: 'close',
  /** close_wait. */
  CLOSE_WAIT: 'close_wait',
  /** closing. */
  CLOSING: 'closing',
  /** delete. */
  DELETE: 'delete',
  /** established. */
  ESTABLISHED: 'established',
  /** fin_wait_1. */
  FIN_WAIT_1: 'fin_wait_1',
  /** fin_wait_2. */
  FIN_WAIT_2: 'fin_wait_2',
  /** last_ack. */
  LAST_ACK: 'last_ack',
  /** listen. */
  LISTEN: 'listen',
  /** syn_recv. */
  SYN_RECV: 'syn_recv',
  /** syn_sent. */
  SYN_SENT: 'syn_sent',
  /** time_wait. */
  TIME_WAIT: 'time_wait',
} as const
export type SystemNetworkStateValues = typeof SystemNetworkStateValues[keyof typeof SystemNetworkStateValues]




export const SystemProcessesStatusValues = {
  /** running. */
  RUNNING: 'running',
  /** sleeping. */
  SLEEPING: 'sleeping',
  /** stopped. */
  STOPPED: 'stopped',
  /** defunct. */
  DEFUNCT: 'defunct',
} as const
export type SystemProcessesStatusValues = typeof SystemProcessesStatusValues[keyof typeof SystemProcessesStatusValues]




export const DbCassandraConsistencyLevelValues = {
  /** all. */
  ALL: 'all',
  /** each_quorum. */
  EACH_QUORUM: 'each_quorum',
  /** quorum. */
  QUORUM: 'quorum',
  /** local_quorum. */
  LOCAL_QUORUM: 'local_quorum',
  /** one. */
  ONE: 'one',
  /** two. */
  TWO: 'two',
  /** three. */
  THREE: 'three',
  /** local_one. */
  LOCAL_ONE: 'local_one',
  /** any. */
  ANY: 'any',
  /** serial. */
  SERIAL: 'serial',
  /** local_serial. */
  LOCAL_SERIAL: 'local_serial',
} as const
export type DbCassandraConsistencyLevelValues = typeof DbCassandraConsistencyLevelValues[keyof typeof DbCassandraConsistencyLevelValues]




export const DbCosmosdbConnectionModeValues = {
  /** Gateway (HTTP) connections mode. */
  GATEWAY: 'gateway',
  /** Direct connection. */
  DIRECT: 'direct',
} as const
export type DbCosmosdbConnectionModeValues = typeof DbCosmosdbConnectionModeValues[keyof typeof DbCosmosdbConnectionModeValues]




export const DbCosmosdbOperationTypeValues = {
  /** invalid. */
  INVALID: 'Invalid',
  /** create. */
  CREATE: 'Create',
  /** patch. */
  PATCH: 'Patch',
  /** read. */
  READ: 'Read',
  /** read_feed. */
  READ_FEED: 'ReadFeed',
  /** delete. */
  DELETE: 'Delete',
  /** replace. */
  REPLACE: 'Replace',
  /** execute. */
  EXECUTE: 'Execute',
  /** query. */
  QUERY: 'Query',
  /** head. */
  HEAD: 'Head',
  /** head_feed. */
  HEAD_FEED: 'HeadFeed',
  /** upsert. */
  UPSERT: 'Upsert',
  /** batch. */
  BATCH: 'Batch',
  /** query_plan. */
  QUERY_PLAN: 'QueryPlan',
  /** execute_javascript. */
  EXECUTE_JAVASCRIPT: 'ExecuteJavaScript',
} as const
export type DbCosmosdbOperationTypeValues = typeof DbCosmosdbOperationTypeValues[keyof typeof DbCosmosdbOperationTypeValues]




export const DbSystemValues = {
  /** Some other SQL database. Fallback only. See notes. */
  OTHER_SQL: 'other_sql',
  /** Microsoft SQL Server. */
  MSSQL: 'mssql',
  /** Microsoft SQL Server Compact. */
  MSSQLCOMPACT: 'mssqlcompact',
  /** MySQL. */
  MYSQL: 'mysql',
  /** Oracle Database. */
  ORACLE: 'oracle',
  /** IBM Db2. */
  DB2: 'db2',
  /** PostgreSQL. */
  POSTGRESQL: 'postgresql',
  /** Amazon Redshift. */
  REDSHIFT: 'redshift',
  /** Apache Hive. */
  HIVE: 'hive',
  /** Cloudscape. */
  CLOUDSCAPE: 'cloudscape',
  /** HyperSQL DataBase. */
  HSQLDB: 'hsqldb',
  /** Progress Database. */
  PROGRESS: 'progress',
  /** SAP MaxDB. */
  MAXDB: 'maxdb',
  /** SAP HANA. */
  HANADB: 'hanadb',
  /** Ingres. */
  INGRES: 'ingres',
  /** FirstSQL. */
  FIRSTSQL: 'firstsql',
  /** EnterpriseDB. */
  EDB: 'edb',
  /** InterSystems Caché. */
  CACHE: 'cache',
  /** Adabas (Adaptable Database System). */
  ADABAS: 'adabas',
  /** Firebird. */
  FIREBIRD: 'firebird',
  /** Apache Derby. */
  DERBY: 'derby',
  /** FileMaker. */
  FILEMAKER: 'filemaker',
  /** Informix. */
  INFORMIX: 'informix',
  /** InstantDB. */
  INSTANTDB: 'instantdb',
  /** InterBase. */
  INTERBASE: 'interbase',
  /** MariaDB. */
  MARIADB: 'mariadb',
  /** Netezza. */
  NETEZZA: 'netezza',
  /** Pervasive PSQL. */
  PERVASIVE: 'pervasive',
  /** PointBase. */
  POINTBASE: 'pointbase',
  /** SQLite. */
  SQLITE: 'sqlite',
  /** Sybase. */
  SYBASE: 'sybase',
  /** Teradata. */
  TERADATA: 'teradata',
  /** Vertica. */
  VERTICA: 'vertica',
  /** H2. */
  H2: 'h2',
  /** ColdFusion IMQ. */
  COLDFUSION: 'coldfusion',
  /** Apache Cassandra. */
  CASSANDRA: 'cassandra',
  /** Apache HBase. */
  HBASE: 'hbase',
  /** MongoDB. */
  MONGODB: 'mongodb',
  /** Redis. */
  REDIS: 'redis',
  /** Couchbase. */
  COUCHBASE: 'couchbase',
  /** CouchDB. */
  COUCHDB: 'couchdb',
  /** Microsoft Azure Cosmos DB. */
  COSMOSDB: 'cosmosdb',
  /** Amazon DynamoDB. */
  DYNAMODB: 'dynamodb',
  /** Neo4j. */
  NEO4J: 'neo4j',
  /** Apache Geode. */
  GEODE: 'geode',
  /** Elasticsearch. */
  ELASTICSEARCH: 'elasticsearch',
  /** Memcached. */
  MEMCACHED: 'memcached',
  /** CockroachDB. */
  COCKROACHDB: 'cockroachdb',
  /** OpenSearch. */
  OPENSEARCH: 'opensearch',
  /** ClickHouse. */
  CLICKHOUSE: 'clickhouse',
  /** Cloud Spanner. */
  SPANNER: 'spanner',
  /** Trino. */
  TRINO: 'trino',
} as const
export type DbSystemValues = typeof DbSystemValues[keyof typeof DbSystemValues]




export const HttpFlavorValues = {
  /** HTTP/1.0. */
  HTTP_1_0: '1.0',
  /** HTTP/1.1. */
  HTTP_1_1: '1.1',
  /** HTTP/2. */
  HTTP_2_0: '2.0',
  /** HTTP/3. */
  HTTP_3_0: '3.0',
  /** SPDY protocol. */
  SPDY: 'SPDY',
  /** QUIC protocol. */
  QUIC: 'QUIC',
} as const
export type HttpFlavorValues = typeof HttpFlavorValues[keyof typeof HttpFlavorValues]




export const NetSockFamilyValues = {
  /** IPv4 address. */
  INET: 'inet',
  /** IPv6 address. */
  INET6: 'inet6',
  /** Unix domain socket path. */
  UNIX: 'unix',
} as const
export type NetSockFamilyValues = typeof NetSockFamilyValues[keyof typeof NetSockFamilyValues]




export const NetTransportValues = {
  /** ip_tcp. */
  IP_TCP: 'ip_tcp',
  /** ip_udp. */
  IP_UDP: 'ip_udp',
  /** Named or anonymous pipe. */
  PIPE: 'pipe',
  /** In-process communication. */
  INPROC: 'inproc',
  /** Something else (non IP-based). */
  OTHER: 'other',
} as const
export type NetTransportValues = typeof NetTransportValues[keyof typeof NetTransportValues]




export const DiskIoDirectionValues = {
  /** read. */
  READ: 'read',
  /** write. */
  WRITE: 'write',
} as const
export type DiskIoDirectionValues = typeof DiskIoDirectionValues[keyof typeof DiskIoDirectionValues]




export const ErrorTypeValues = {
  /** A fallback error value to be used when the instrumentation doesn&#39;t define a custom value. */
  OTHER: '_OTHER',
} as const
export type ErrorTypeValues = typeof ErrorTypeValues[keyof typeof ErrorTypeValues]




export const HttpRequestMethodValues = {
  /** CONNECT method. */
  CONNECT: 'CONNECT',
  /** DELETE method. */
  DELETE: 'DELETE',
  /** GET method. */
  GET: 'GET',
  /** HEAD method. */
  HEAD: 'HEAD',
  /** OPTIONS method. */
  OPTIONS: 'OPTIONS',
  /** PATCH method. */
  PATCH: 'PATCH',
  /** POST method. */
  POST: 'POST',
  /** PUT method. */
  PUT: 'PUT',
  /** TRACE method. */
  TRACE: 'TRACE',
  /** Any HTTP method that the instrumentation has no prior knowledge of. */
  OTHER: '_OTHER',
} as const
export type HttpRequestMethodValues = typeof HttpRequestMethodValues[keyof typeof HttpRequestMethodValues]




export const MessagingOperationValues = {
  /** One or more messages are provided for publishing to an intermediary. If a single message is published, the context of the &#34;Publish&#34; span can be used as the creation context and no &#34;Create&#34; span needs to be created. */
  PUBLISH: 'publish',
  /** A message is created. &#34;Create&#34; spans always refer to a single message and are used to provide a unique creation context for messages in batch publishing scenarios. */
  CREATE: 'create',
  /** One or more messages are requested by a consumer. This operation refers to pull-based scenarios, where consumers explicitly call methods of messaging SDKs to receive messages. */
  RECEIVE: 'receive',
  /** One or more messages are passed to a consumer. This operation refers to push-based scenarios, where consumer register callbacks which get called by messaging SDKs. */
  DELIVER: 'deliver',
} as const
export type MessagingOperationValues = typeof MessagingOperationValues[keyof typeof MessagingOperationValues]




export const MessagingRocketmqConsumptionModelValues = {
  /** Clustering consumption model. */
  CLUSTERING: 'clustering',
  /** Broadcasting consumption model. */
  BROADCASTING: 'broadcasting',
} as const
export type MessagingRocketmqConsumptionModelValues = typeof MessagingRocketmqConsumptionModelValues[keyof typeof MessagingRocketmqConsumptionModelValues]




export const MessagingRocketmqMessageTypeValues = {
  /** Normal message. */
  NORMAL: 'normal',
  /** FIFO message. */
  FIFO: 'fifo',
  /** Delay message. */
  DELAY: 'delay',
  /** Transaction message. */
  TRANSACTION: 'transaction',
} as const
export type MessagingRocketmqMessageTypeValues = typeof MessagingRocketmqMessageTypeValues[keyof typeof MessagingRocketmqMessageTypeValues]




export const MessagingSystemValues = {
  /** Apache ActiveMQ. */
  ACTIVEMQ: 'activemq',
  /** Amazon Simple Queue Service (SQS). */
  AWS_SQS: 'aws_sqs',
  /** Azure Event Grid. */
  AZURE_EVENTGRID: 'azure_eventgrid',
  /** Azure Event Hubs. */
  AZURE_EVENTHUBS: 'azure_eventhubs',
  /** Azure Service Bus. */
  AZURE_SERVICEBUS: 'azure_servicebus',
  /** Google Cloud Pub/Sub. */
  GCP_PUBSUB: 'gcp_pubsub',
  /** Java Message Service. */
  JMS: 'jms',
  /** Apache Kafka. */
  KAFKA: 'kafka',
  /** RabbitMQ. */
  RABBITMQ: 'rabbitmq',
  /** Apache RocketMQ. */
  ROCKETMQ: 'rocketmq',
} as const
export type MessagingSystemValues = typeof MessagingSystemValues[keyof typeof MessagingSystemValues]




export const NetworkConnectionSubtypeValues = {
  /** GPRS. */
  GPRS: 'gprs',
  /** EDGE. */
  EDGE: 'edge',
  /** UMTS. */
  UMTS: 'umts',
  /** CDMA. */
  CDMA: 'cdma',
  /** EVDO Rel. 0. */
  EVDO_0: 'evdo_0',
  /** EVDO Rev. A. */
  EVDO_A: 'evdo_a',
  /** CDMA2000 1XRTT. */
  CDMA2000_1XRTT: 'cdma2000_1xrtt',
  /** HSDPA. */
  HSDPA: 'hsdpa',
  /** HSUPA. */
  HSUPA: 'hsupa',
  /** HSPA. */
  HSPA: 'hspa',
  /** IDEN. */
  IDEN: 'iden',
  /** EVDO Rev. B. */
  EVDO_B: 'evdo_b',
  /** LTE. */
  LTE: 'lte',
  /** EHRPD. */
  EHRPD: 'ehrpd',
  /** HSPAP. */
  HSPAP: 'hspap',
  /** GSM. */
  GSM: 'gsm',
  /** TD-SCDMA. */
  TD_SCDMA: 'td_scdma',
  /** IWLAN. */
  IWLAN: 'iwlan',
  /** 5G NR (New Radio). */
  NR: 'nr',
  /** 5G NRNSA (New Radio Non-Standalone). */
  NRNSA: 'nrnsa',
  /** LTE CA. */
  LTE_CA: 'lte_ca',
} as const
export type NetworkConnectionSubtypeValues = typeof NetworkConnectionSubtypeValues[keyof typeof NetworkConnectionSubtypeValues]




export const NetworkConnectionTypeValues = {
  /** wifi. */
  WIFI: 'wifi',
  /** wired. */
  WIRED: 'wired',
  /** cell. */
  CELL: 'cell',
  /** unavailable. */
  UNAVAILABLE: 'unavailable',
  /** unknown. */
  UNKNOWN: 'unknown',
} as const
export type NetworkConnectionTypeValues = typeof NetworkConnectionTypeValues[keyof typeof NetworkConnectionTypeValues]




export const NetworkIoDirectionValues = {
  /** transmit. */
  TRANSMIT: 'transmit',
  /** receive. */
  RECEIVE: 'receive',
} as const
export type NetworkIoDirectionValues = typeof NetworkIoDirectionValues[keyof typeof NetworkIoDirectionValues]




export const NetworkTransportValues = {
  /** TCP. */
  TCP: 'tcp',
  /** UDP. */
  UDP: 'udp',
  /** Named or anonymous pipe. */
  PIPE: 'pipe',
  /** Unix domain socket. */
  UNIX: 'unix',
} as const
export type NetworkTransportValues = typeof NetworkTransportValues[keyof typeof NetworkTransportValues]




export const NetworkTypeValues = {
  /** IPv4. */
  IPV4: 'ipv4',
  /** IPv6. */
  IPV6: 'ipv6',
} as const
export type NetworkTypeValues = typeof NetworkTypeValues[keyof typeof NetworkTypeValues]




export const RpcConnectRpcErrorCodeValues = {
  /** cancelled. */
  CANCELLED: 'cancelled',
  /** unknown. */
  UNKNOWN: 'unknown',
  /** invalid_argument. */
  INVALID_ARGUMENT: 'invalid_argument',
  /** deadline_exceeded. */
  DEADLINE_EXCEEDED: 'deadline_exceeded',
  /** not_found. */
  NOT_FOUND: 'not_found',
  /** already_exists. */
  ALREADY_EXISTS: 'already_exists',
  /** permission_denied. */
  PERMISSION_DENIED: 'permission_denied',
  /** resource_exhausted. */
  RESOURCE_EXHAUSTED: 'resource_exhausted',
  /** failed_precondition. */
  FAILED_PRECONDITION: 'failed_precondition',
  /** aborted. */
  ABORTED: 'aborted',
  /** out_of_range. */
  OUT_OF_RANGE: 'out_of_range',
  /** unimplemented. */
  UNIMPLEMENTED: 'unimplemented',
  /** internal. */
  INTERNAL: 'internal',
  /** unavailable. */
  UNAVAILABLE: 'unavailable',
  /** data_loss. */
  DATA_LOSS: 'data_loss',
  /** unauthenticated. */
  UNAUTHENTICATED: 'unauthenticated',
} as const
export type RpcConnectRpcErrorCodeValues = typeof RpcConnectRpcErrorCodeValues[keyof typeof RpcConnectRpcErrorCodeValues]




export const RpcGrpcStatusCodeValues = {
  /** OK. */
  OK: 0,
  /** CANCELLED. */
  CANCELLED: 1,
  /** UNKNOWN. */
  UNKNOWN: 2,
  /** INVALID_ARGUMENT. */
  INVALID_ARGUMENT: 3,
  /** DEADLINE_EXCEEDED. */
  DEADLINE_EXCEEDED: 4,
  /** NOT_FOUND. */
  NOT_FOUND: 5,
  /** ALREADY_EXISTS. */
  ALREADY_EXISTS: 6,
  /** PERMISSION_DENIED. */
  PERMISSION_DENIED: 7,
  /** RESOURCE_EXHAUSTED. */
  RESOURCE_EXHAUSTED: 8,
  /** FAILED_PRECONDITION. */
  FAILED_PRECONDITION: 9,
  /** ABORTED. */
  ABORTED: 10,
  /** OUT_OF_RANGE. */
  OUT_OF_RANGE: 11,
  /** UNIMPLEMENTED. */
  UNIMPLEMENTED: 12,
  /** INTERNAL. */
  INTERNAL: 13,
  /** UNAVAILABLE. */
  UNAVAILABLE: 14,
  /** DATA_LOSS. */
  DATA_LOSS: 15,
  /** UNAUTHENTICATED. */
  UNAUTHENTICATED: 16,
} as const
export type RpcGrpcStatusCodeValues = typeof RpcGrpcStatusCodeValues[keyof typeof RpcGrpcStatusCodeValues]




export const RpcSystemValues = {
  /** gRPC. */
  GRPC: 'grpc',
  /** Java RMI. */
  JAVA_RMI: 'java_rmi',
  /** .NET WCF. */
  DOTNET_WCF: 'dotnet_wcf',
  /** Apache Dubbo. */
  APACHE_DUBBO: 'apache_dubbo',
  /** Connect RPC. */
  CONNECT_RPC: 'connect_rpc',
} as const
export type RpcSystemValues = typeof RpcSystemValues[keyof typeof RpcSystemValues]




export const TlsProtocolNameValues = {
  /** ssl. */
  SSL: 'ssl',
  /** tls. */
  TLS: 'tls',
} as const
export type TlsProtocolNameValues = typeof TlsProtocolNameValues[keyof typeof TlsProtocolNameValues]




export const OpentracingRefTypeValues = {
  /** The parent Span depends on the child Span in some capacity. */
  CHILD_OF: 'child_of',
  /** The parent Span doesn&#39;t depend in any way on the result of the child Span. */
  FOLLOWS_FROM: 'follows_from',
} as const
export type OpentracingRefTypeValues = typeof OpentracingRefTypeValues[keyof typeof OpentracingRefTypeValues]




export const OtelStatusCodeValues = {
  /** The operation has been validated by an Application developer or Operator to have completed successfully. */
  OK: 'OK',
  /** The operation contains an error. */
  ERROR: 'ERROR',
} as const
export type OtelStatusCodeValues = typeof OtelStatusCodeValues[keyof typeof OtelStatusCodeValues]




export const FaasDocumentOperationValues = {
  /** When a new object is created. */
  INSERT: 'insert',
  /** When an object is modified. */
  EDIT: 'edit',
  /** When an object is deleted. */
  DELETE: 'delete',
} as const
export type FaasDocumentOperationValues = typeof FaasDocumentOperationValues[keyof typeof FaasDocumentOperationValues]




export const GraphqlOperationTypeValues = {
  /** GraphQL query. */
  QUERY: 'query',
  /** GraphQL mutation. */
  MUTATION: 'mutation',
  /** GraphQL subscription. */
  SUBSCRIPTION: 'subscription',
} as const
export type GraphqlOperationTypeValues = typeof GraphqlOperationTypeValues[keyof typeof GraphqlOperationTypeValues]




export const MessageTypeValues = {
  /** sent. */
  SENT: 'SENT',
  /** received. */
  RECEIVED: 'RECEIVED',
} as const
export type MessageTypeValues = typeof MessageTypeValues[keyof typeof MessageTypeValues]

