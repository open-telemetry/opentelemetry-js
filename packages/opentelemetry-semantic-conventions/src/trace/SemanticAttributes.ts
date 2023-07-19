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
   * Client address - unix domain socket name, IPv4 or IPv6 address.
   *
   * Note: When observed from the server side, and when communicating through an intermediary, `client.address` SHOULD represent client address behind any intermediaries (e.g. proxies) if it&#39;s available.
   */
  CLIENT_ADDRESS: 'client.address',

  /**
   * Client port number.
   *
   * Note: When observed from the server side, and when communicating through an intermediary, `client.port` SHOULD represent client port behind any intermediaries (e.g. proxies) if it&#39;s available.
   */
  CLIENT_PORT: 'client.port',

  /**
   * Immediate client peer address - unix domain socket name, IPv4 or IPv6 address.
   */
  CLIENT_SOCKET_ADDRESS: 'client.socket.address',

  /**
   * Immediate client peer port number.
   */
  CLIENT_SOCKET_PORT: 'client.socket.port',

  /**
   * Deprecated, use `http.request.method` instead.
   *
   * @deprecated Deprecated, use `http.request.method` instead
   */
  HTTP_METHOD: 'http.method',

  /**
   * Deprecated, use `http.response.status_code` instead.
   *
   * @deprecated Deprecated, use `http.response.status_code` instead
   */
  HTTP_STATUS_CODE: 'http.status_code',

  /**
   * Deprecated, use `url.scheme` instead.
   *
   * @deprecated Deprecated, use `url.scheme` instead
   */
  HTTP_SCHEME: 'http.scheme',

  /**
   * Deprecated, use `url.full` instead.
   *
   * @deprecated Deprecated, use `url.full` instead
   */
  HTTP_URL: 'http.url',

  /**
   * Deprecated, use `url.path` and `url.query` instead.
   *
   * @deprecated Deprecated, use `url.path` and `url.query` instead
   */
  HTTP_TARGET: 'http.target',

  /**
   * Deprecated, use `http.request.body.size` instead.
   *
   * @deprecated Deprecated, use `http.request.body.size` instead
   */
  HTTP_REQUEST_CONTENT_LENGTH: 'http.request_content_length',

  /**
   * Deprecated, use `http.response.body.size` instead.
   *
   * @deprecated Deprecated, use `http.response.body.size` instead
   */
  HTTP_RESPONSE_CONTENT_LENGTH: 'http.response_content_length',

  /**
   * Deprecated, use `server.socket.domain` on client spans.
   *
   * @deprecated Deprecated, use `server.socket.domain` on client spans
   */
  NET_SOCK_PEER_NAME: 'net.sock.peer.name',

  /**
   * Deprecated, use `server.socket.address` on client spans and `client.socket.address` on server spans.
   *
   * @deprecated Deprecated, use `server.socket.address` on client spans and `client.socket.address` on server spans
   */
  NET_SOCK_PEER_ADDR: 'net.sock.peer.addr',

  /**
   * Deprecated, use `server.socket.port` on client spans and `client.socket.port` on server spans.
   *
   * @deprecated Deprecated, use `server.socket.port` on client spans and `client.socket.port` on server spans
   */
  NET_SOCK_PEER_PORT: 'net.sock.peer.port',

  /**
   * Deprecated, use `server.address` on client spans and `client.address` on server spans.
   *
   * @deprecated Deprecated, use `server.address` on client spans and `client.address` on server spans
   */
  NET_PEER_NAME: 'net.peer.name',

  /**
   * Deprecated, use `server.port` on client spans and `client.port` on server spans.
   *
   * @deprecated Deprecated, use `server.port` on client spans and `client.port` on server spans
   */
  NET_PEER_PORT: 'net.peer.port',

  /**
   * Deprecated, use `server.address`.
   *
   * @deprecated Deprecated, use `server.address`
   */
  NET_HOST_NAME: 'net.host.name',

  /**
   * Deprecated, use `server.port`.
   *
   * @deprecated Deprecated, use `server.port`
   */
  NET_HOST_PORT: 'net.host.port',

  /**
   * Deprecated, use `server.socket.address`.
   *
   * @deprecated Deprecated, use `server.socket.address`
   */
  NET_SOCK_HOST_ADDR: 'net.sock.host.addr',

  /**
   * Deprecated, use `server.socket.port`.
   *
   * @deprecated Deprecated, use `server.socket.port`
   */
  NET_SOCK_HOST_PORT: 'net.sock.host.port',

  /**
   * Deprecated, use `network.transport`.
   *
   * @deprecated Deprecated, use `network.transport`
   */
  NET_TRANSPORT: 'net.transport',

  /**
   * Deprecated, use `network.protocol.name`.
   *
   * @deprecated Deprecated, use `network.protocol.name`
   */
  NET_PROTOCOL_NAME: 'net.protocol.name',

  /**
   * Deprecated, use `network.protocol.version`.
   *
   * @deprecated Deprecated, use `network.protocol.version`
   */
  NET_PROTOCOL_VERSION: 'net.protocol.version',

  /**
   * Deprecated, use `network.transport` and `network.type`.
   *
   * @deprecated Deprecated, use `network.transport` and `network.type`
   */
  NET_SOCK_FAMILY: 'net.sock.family',

  /**
   * The domain name of the destination system.
   *
   * Note: This value may be a host name, a fully qualified domain name, or another host naming format.
   */
  DESTINATION_DOMAIN: 'destination.domain',

  /**
   * Peer address, for example IP address or UNIX socket name.
   */
  DESTINATION_ADDRESS: 'destination.address',

  /**
   * Peer port number.
   */
  DESTINATION_PORT: 'destination.port',

  /**
   * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
   */
  EXCEPTION_TYPE: 'exception.type',

  /**
   * The exception message.
   */
  EXCEPTION_MESSAGE: 'exception.message',

  /**
   * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
   */
  EXCEPTION_STACKTRACE: 'exception.stacktrace',

  /**
  * HTTP request method.
  *
  * Note: HTTP request method value SHOULD be &#34;known&#34; to the instrumentation.
By default, this convention defines &#34;known&#34; methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
and the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html).

If the HTTP request method is not known to instrumentation, it MUST set the `http.request.method` attribute to `_OTHER` and, except if reporting a metric, MUST
set the exact method received in the request line as value of the `http.request.method_original` attribute.

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
   * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
   */
  HTTP_RESPONSE_STATUS_CODE: 'http.response.status_code',

  /**
  * The matched route (path template in the format used by the respective server framework). See note below.
  *
  * Note: MUST NOT be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
  */
  HTTP_ROUTE: 'http.route',

  /**
   * The name identifies the event.
   */
  EVENT_NAME: 'event.name',

  /**
  * The domain identifies the business context for the events.
  *
  * Note: Events across different domains may have same `event.name`, yet be
unrelated events.
  */
  EVENT_DOMAIN: 'event.domain',

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
   * The full path to the file.
   */
  LOG_FILE_PATH: 'log.file.path',

  /**
   * The basename of the file, with symlinks resolved.
   */
  LOG_FILE_NAME_RESOLVED: 'log.file.name_resolved',

  /**
   * The full path to the file, with symlinks resolved.
   */
  LOG_FILE_PATH_RESOLVED: 'log.file.path_resolved',

  /**
   * The type of memory.
   */
  TYPE: 'type',

  /**
   * Name of the memory pool.
   *
   * Note: Pool names are generally obtained via [MemoryPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/MemoryPoolMXBean.html#getName()).
   */
  POOL: 'pool',

  /**
   * Logical server hostname, matches server FQDN if available, and IP or socket address if FQDN is not known.
   */
  SERVER_ADDRESS: 'server.address',

  /**
   * Logical server port number.
   */
  SERVER_PORT: 'server.port',

  /**
   * The domain name of an immediate peer.
   *
   * Note: Typically observed from the client side, and represents a proxy or other intermediary domain name.
   */
  SERVER_SOCKET_DOMAIN: 'server.socket.domain',

  /**
   * Physical server IP address or Unix socket address. If set from the client, should simply use the socket&#39;s peer address, and not attempt to find any actual server IP (i.e., if set from client, this may represent some proxy server instead of the logical server).
   */
  SERVER_SOCKET_ADDRESS: 'server.socket.address',

  /**
   * Physical server port.
   */
  SERVER_SOCKET_PORT: 'server.socket.port',

  /**
   * The domain name of the source system.
   *
   * Note: This value may be a host name, a fully qualified domain name, or another host naming format.
   */
  SOURCE_DOMAIN: 'source.domain',

  /**
   * Source address, for example IP address or Unix socket name.
   */
  SOURCE_ADDRESS: 'source.address',

  /**
   * Source port number.
   */
  SOURCE_PORT: 'source.port',

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
   * The [event_type](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#type) contains a value describing the type of event related to the originating occurrence.
   */
  CLOUDEVENTS_EVENT_TYPE: 'cloudevents.event_type',

  /**
   * The [subject](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#subject) of the event in the context of the event producer (identified by source).
   */
  CLOUDEVENTS_EVENT_SUBJECT: 'cloudevents.event_subject',

  /**
   * Parent-child Reference type.
   *
   * Note: The causal relationship between a child Span and a parent Span.
   */
  OPENTRACING_REF_TYPE: 'opentracing.ref_type',

  /**
   * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
   */
  DB_SYSTEM: 'db.system',

  /**
   * The connection string used to connect to the database. It is recommended to remove embedded credentials.
   */
  DB_CONNECTION_STRING: 'db.connection_string',

  /**
   * Username for accessing the database.
   */
  DB_USER: 'db.user',

  /**
   * The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
   */
  DB_JDBC_DRIVER_CLASSNAME: 'db.jdbc.driver_classname',

  /**
   * This attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
   *
   * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;. In case there are multiple layers that could be considered for database name (e.g. Oracle instance name and schema name), the database name to be used is the more specific layer (e.g. Oracle schema name).
   */
  DB_NAME: 'db.name',

  /**
   * The database statement being executed.
   */
  DB_STATEMENT: 'db.statement',

  /**
   * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
   *
   * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
   */
  DB_OPERATION: 'db.operation',

  /**
   * The Microsoft SQL Server [instance name](https://docs.microsoft.com/en-us/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
   *
   * Note: If setting a `db.mssql.instance_name`, `server.port` is no longer required (but still recommended if non-standard).
   */
  DB_MSSQL_INSTANCE_NAME: 'db.mssql.instance_name',

  /**
   * The fetch size used for paging, i.e. how many rows will be returned at once.
   */
  DB_CASSANDRA_PAGE_SIZE: 'db.cassandra.page_size',

  /**
   * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
   */
  DB_CASSANDRA_CONSISTENCY_LEVEL: 'db.cassandra.consistency_level',

  /**
   * The name of the primary table that the operation is acting upon, including the keyspace name (if applicable).
   *
   * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
   */
  DB_CASSANDRA_TABLE: 'db.cassandra.table',

  /**
   * Whether or not the query is idempotent.
   */
  DB_CASSANDRA_IDEMPOTENCE: 'db.cassandra.idempotence',

  /**
   * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
   */
  DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT:
    'db.cassandra.speculative_execution_count',

  /**
   * The ID of the coordinating node for a query.
   */
  DB_CASSANDRA_COORDINATOR_ID: 'db.cassandra.coordinator.id',

  /**
   * The data center of the coordinating node for a query.
   */
  DB_CASSANDRA_COORDINATOR_DC: 'db.cassandra.coordinator.dc',

  /**
   * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
   */
  DB_REDIS_DATABASE_INDEX: 'db.redis.database_index',

  /**
   * The collection being accessed within the database stated in `db.name`.
   */
  DB_MONGODB_COLLECTION: 'db.mongodb.collection',

  /**
   * The name of the primary table that the operation is acting upon, including the database name (if applicable).
   *
   * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
   */
  DB_SQL_TABLE: 'db.sql.table',

  /**
   * Unique Cosmos client instance id.
   */
  DB_COSMOSDB_CLIENT_ID: 'db.cosmosdb.client_id',

  /**
   * CosmosDB Operation Type.
   */
  DB_COSMOSDB_OPERATION_TYPE: 'db.cosmosdb.operation_type',

  /**
   * Cosmos client connection mode.
   */
  DB_COSMOSDB_CONNECTION_MODE: 'db.cosmosdb.connection_mode',

  /**
   * Cosmos DB container name.
   */
  DB_COSMOSDB_CONTAINER: 'db.cosmosdb.container',

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
   * RU consumed for that operation.
   */
  DB_COSMOSDB_REQUEST_CHARGE: 'db.cosmosdb.request_charge',

  /**
   * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
   */
  OTEL_STATUS_CODE: 'otel.status_code',

  /**
   * Description of the Status if it has a value, otherwise not set.
   */
  OTEL_STATUS_DESCRIPTION: 'otel.status_description',

  /**
  * Type of the trigger which caused this function invocation.
  *
  * Note: For the server/consumer span on the incoming side,
`faas.trigger` MUST be set.

Clients invoking FaaS instances usually cannot set `faas.trigger`,
since they would typically need to look in the payload to determine
the event type. If clients set it, it should be the same as the
trigger that corresponding incoming would have (i.e., this has
nothing to do with the underlying transport used to make the API
call to invoke the lambda, which is often HTTP).
  */
  FAAS_TRIGGER: 'faas.trigger',

  /**
   * The invocation ID of the current function invocation.
   */
  FAAS_INVOCATION_ID: 'faas.invocation_id',

  /**
   * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
   */
  FAAS_DOCUMENT_COLLECTION: 'faas.document.collection',

  /**
   * Describes the type of the operation that was performed on the data.
   */
  FAAS_DOCUMENT_OPERATION: 'faas.document.operation',

  /**
   * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
   */
  FAAS_DOCUMENT_TIME: 'faas.document.time',

  /**
   * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
   */
  FAAS_DOCUMENT_NAME: 'faas.document.name',

  /**
   * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
   */
  FAAS_TIME: 'faas.time',

  /**
   * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
   */
  FAAS_CRON: 'faas.cron',

  /**
   * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
   */
  FAAS_COLDSTART: 'faas.coldstart',

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
   * [OSI Transport Layer](https://osi-model.com/transport-layer/) or [Inter-process Communication method](https://en.wikipedia.org/wiki/Inter-process_communication). The value SHOULD be normalized to lowercase.
   */
  NETWORK_TRANSPORT: 'network.transport',

  /**
   * [OSI Network Layer](https://osi-model.com/network-layer/) or non-OSI equivalent. The value SHOULD be normalized to lowercase.
   */
  NETWORK_TYPE: 'network.type',

  /**
   * [OSI Application Layer](https://osi-model.com/application-layer/) or non-OSI equivalent. The value SHOULD be normalized to lowercase.
   */
  NETWORK_PROTOCOL_NAME: 'network.protocol.name',

  /**
   * Version of the application layer protocol used. See note below.
   *
   * Note: `network.protocol.version` refers to the version of the protocol used and might be different from the protocol client&#39;s version. If the HTTP client used has a version of `0.27.2`, but sends HTTP version `1.1`, this attribute should be set to `1.1`.
   */
  NETWORK_PROTOCOL_VERSION: 'network.protocol.version',

  /**
   * The internet connection type.
   */
  NETWORK_CONNECTION_TYPE: 'network.connection.type',

  /**
   * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
   */
  NETWORK_CONNECTION_SUBTYPE: 'network.connection.subtype',

  /**
   * The name of the mobile carrier.
   */
  NETWORK_CARRIER_NAME: 'network.carrier.name',

  /**
   * The mobile carrier country code.
   */
  NETWORK_CARRIER_MCC: 'network.carrier.mcc',

  /**
   * The mobile carrier network code.
   */
  NETWORK_CARRIER_MNC: 'network.carrier.mnc',

  /**
   * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
   */
  NETWORK_CARRIER_ICC: 'network.carrier.icc',

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
   * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
   */
  THREAD_ID: 'thread.id',

  /**
   * Current thread name.
   */
  THREAD_NAME: 'thread.name',

  /**
   * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
   */
  CODE_FUNCTION: 'code.function',

  /**
   * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
   */
  CODE_NAMESPACE: 'code.namespace',

  /**
   * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
   */
  CODE_FILEPATH: 'code.filepath',

  /**
   * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
   */
  CODE_LINENO: 'code.lineno',

  /**
   * The column number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
   */
  CODE_COLUMN: 'code.column',

  /**
   * Original HTTP method sent by the client in the request line.
   */
  HTTP_REQUEST_METHOD_ORIGINAL: 'http.request.method_original',

  /**
   * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
   */
  HTTP_REQUEST_BODY_SIZE: 'http.request.body.size',

  /**
   * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
   */
  HTTP_RESPONSE_BODY_SIZE: 'http.response.body.size',

  /**
   * The ordinal number of request resending attempt (for any reason, including redirects).
   *
   * Note: The resend count SHOULD be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
   */
  HTTP_RESEND_COUNT: 'http.resend_count',

  /**
   * The AWS request ID as returned in the response headers `x-amz-request-id` or `x-amz-requestid`.
   */
  AWS_REQUEST_ID: 'aws.request_id',

  /**
   * The keys in the `RequestItems` object field.
   */
  AWS_DYNAMODB_TABLE_NAMES: 'aws.dynamodb.table_names',

  /**
   * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
   */
  AWS_DYNAMODB_CONSUMED_CAPACITY: 'aws.dynamodb.consumed_capacity',

  /**
   * The JSON-serialized value of the `ItemCollectionMetrics` response field.
   */
  AWS_DYNAMODB_ITEM_COLLECTION_METRICS: 'aws.dynamodb.item_collection_metrics',

  /**
   * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
   */
  AWS_DYNAMODB_PROVISIONED_READ_CAPACITY:
    'aws.dynamodb.provisioned_read_capacity',

  /**
   * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
   */
  AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY:
    'aws.dynamodb.provisioned_write_capacity',

  /**
   * The value of the `ConsistentRead` request parameter.
   */
  AWS_DYNAMODB_CONSISTENT_READ: 'aws.dynamodb.consistent_read',

  /**
   * The value of the `ProjectionExpression` request parameter.
   */
  AWS_DYNAMODB_PROJECTION: 'aws.dynamodb.projection',

  /**
   * The value of the `Limit` request parameter.
   */
  AWS_DYNAMODB_LIMIT: 'aws.dynamodb.limit',

  /**
   * The value of the `AttributesToGet` request parameter.
   */
  AWS_DYNAMODB_ATTRIBUTES_TO_GET: 'aws.dynamodb.attributes_to_get',

  /**
   * The value of the `IndexName` request parameter.
   */
  AWS_DYNAMODB_INDEX_NAME: 'aws.dynamodb.index_name',

  /**
   * The value of the `Select` request parameter.
   */
  AWS_DYNAMODB_SELECT: 'aws.dynamodb.select',

  /**
   * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
   */
  AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES:
    'aws.dynamodb.global_secondary_indexes',

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
   * The value of the `Segment` request parameter.
   */
  AWS_DYNAMODB_SEGMENT: 'aws.dynamodb.segment',

  /**
   * The value of the `TotalSegments` request parameter.
   */
  AWS_DYNAMODB_TOTAL_SEGMENTS: 'aws.dynamodb.total_segments',

  /**
   * The value of the `Count` response parameter.
   */
  AWS_DYNAMODB_COUNT: 'aws.dynamodb.count',

  /**
   * The value of the `ScannedCount` response parameter.
   */
  AWS_DYNAMODB_SCANNED_COUNT: 'aws.dynamodb.scanned_count',

  /**
   * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
   */
  AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS: 'aws.dynamodb.attribute_definitions',

  /**
   * The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
   */
  AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES:
    'aws.dynamodb.global_secondary_index_updates',

  /**
  * The S3 bucket name the request refers to. Corresponds to the `--bucket` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
  *
  * Note: The `bucket` attribute is applicable to all S3 operations that reference a bucket, i.e. that require the bucket name as a mandatory parameter.
This applies to almost all S3 operations except `list-buckets`.
  */
  AWS_S3_BUCKET: 'aws.s3.bucket',

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
  * The delete request container that specifies the objects to be deleted.
  *
  * Note: The `delete` attribute is only applicable to the [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html) operation.
The `delete` attribute corresponds to the `--delete` parameter of the
[delete-objects operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-objects.html).
  */
  AWS_S3_DELETE: 'aws.s3.delete',

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
   * The name of the operation being executed.
   */
  GRAPHQL_OPERATION_NAME: 'graphql.operation.name',

  /**
   * The type of the operation being executed.
   */
  GRAPHQL_OPERATION_TYPE: 'graphql.operation.type',

  /**
   * The GraphQL document being executed.
   *
   * Note: The value may be sanitized to exclude sensitive information.
   */
  GRAPHQL_DOCUMENT: 'graphql.document',

  /**
   * A value used by the messaging system as an identifier for the message, represented as a string.
   */
  MESSAGING_MESSAGE_ID: 'messaging.message.id',

  /**
   * The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
   */
  MESSAGING_MESSAGE_CONVERSATION_ID: 'messaging.message.conversation_id',

  /**
   * The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
   */
  MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES: 'messaging.message.payload_size_bytes',

  /**
   * The compressed size of the message payload in bytes.
   */
  MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES:
    'messaging.message.payload_compressed_size_bytes',

  /**
  * The message destination name.
  *
  * Note: Destination name SHOULD uniquely identify a specific queue, topic or other entity within the broker. If
the broker does not have such notion, the destination name SHOULD uniquely identify the broker.
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
   * A boolean that is true if the message destination is anonymous (could be unnamed or have auto-generated name).
   */
  MESSAGING_DESTINATION_ANONYMOUS: 'messaging.destination.anonymous',

  /**
   * A string identifying the messaging system.
   */
  MESSAGING_SYSTEM: 'messaging.system',

  /**
   * A string identifying the kind of messaging operation as defined in the [Operation names](#operation-names) section above.
   *
   * Note: If a custom value is used, it MUST be of low cardinality.
   */
  MESSAGING_OPERATION: 'messaging.operation',

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
   * RabbitMQ message routing key.
   */
  MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY:
    'messaging.rabbitmq.destination.routing_key',

  /**
   * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message.id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
   *
   * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
   */
  MESSAGING_KAFKA_MESSAGE_KEY: 'messaging.kafka.message.key',

  /**
   * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
   */
  MESSAGING_KAFKA_CONSUMER_GROUP: 'messaging.kafka.consumer.group',

  /**
   * Partition the message is sent to.
   */
  MESSAGING_KAFKA_DESTINATION_PARTITION:
    'messaging.kafka.destination.partition',

  /**
   * The offset of a record in the corresponding Kafka partition.
   */
  MESSAGING_KAFKA_MESSAGE_OFFSET: 'messaging.kafka.message.offset',

  /**
   * A boolean that is true if the message is a tombstone.
   */
  MESSAGING_KAFKA_MESSAGE_TOMBSTONE: 'messaging.kafka.message.tombstone',

  /**
   * Namespace of RocketMQ resources, resources in different namespaces are individual.
   */
  MESSAGING_ROCKETMQ_NAMESPACE: 'messaging.rocketmq.namespace',

  /**
   * Name of the RocketMQ producer/consumer group that is handling the message. The client type is identified by the SpanKind.
   */
  MESSAGING_ROCKETMQ_CLIENT_GROUP: 'messaging.rocketmq.client_group',

  /**
   * The timestamp in milliseconds that the delay message is expected to be delivered to consumer.
   */
  MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP:
    'messaging.rocketmq.message.delivery_timestamp',

  /**
   * The delay time level for delay message, which determines the message delay time.
   */
  MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL:
    'messaging.rocketmq.message.delay_time_level',

  /**
   * It is essential for FIFO message. Messages that belong to the same message group are always processed one by one within the same consumer group.
   */
  MESSAGING_ROCKETMQ_MESSAGE_GROUP: 'messaging.rocketmq.message.group',

  /**
   * Type of message.
   */
  MESSAGING_ROCKETMQ_MESSAGE_TYPE: 'messaging.rocketmq.message.type',

  /**
   * The secondary classifier of message besides topic.
   */
  MESSAGING_ROCKETMQ_MESSAGE_TAG: 'messaging.rocketmq.message.tag',

  /**
   * Key(s) of message, another way to mark message besides message id.
   */
  MESSAGING_ROCKETMQ_MESSAGE_KEYS: 'messaging.rocketmq.message.keys',

  /**
   * Model of message consumption. This only applies to consumer spans.
   */
  MESSAGING_ROCKETMQ_CONSUMPTION_MODEL: 'messaging.rocketmq.consumption_model',

  /**
   * A string identifying the remoting system. See below for a list of well-known identifiers.
   */
  RPC_SYSTEM: 'rpc.system',

  /**
   * The full (logical) name of the service being called, including its package name, if applicable.
   *
   * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
   */
  RPC_SERVICE: 'rpc.service',

  /**
   * The name of the (logical) method being called, must be equal to the $method part in the span name.
   *
   * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
   */
  RPC_METHOD: 'rpc.method',

  /**
   * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
   */
  RPC_GRPC_STATUS_CODE: 'rpc.grpc.status_code',

  /**
   * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 does not specify this, the value can be omitted.
   */
  RPC_JSONRPC_VERSION: 'rpc.jsonrpc.version',

  /**
   * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
   */
  RPC_JSONRPC_REQUEST_ID: 'rpc.jsonrpc.request_id',

  /**
   * `error.code` property of response if it is an error response.
   */
  RPC_JSONRPC_ERROR_CODE: 'rpc.jsonrpc.error_code',

  /**
   * `error.message` property of response if it is an error response.
   */
  RPC_JSONRPC_ERROR_MESSAGE: 'rpc.jsonrpc.error_message',

  /**
   * Whether this is a received or sent message.
   */
  MESSAGE_TYPE: 'message.type',

  /**
   * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
   *
   * Note: This way we guarantee that the values will be consistent between different implementations.
   */
  MESSAGE_ID: 'message.id',

  /**
   * Compressed size of the message in bytes.
   */
  MESSAGE_COMPRESSED_SIZE: 'message.compressed_size',

  /**
   * Uncompressed size of the message in bytes.
   */
  MESSAGE_UNCOMPRESSED_SIZE: 'message.uncompressed_size',

  /**
   * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
   */
  RPC_CONNECT_RPC_ERROR_CODE: 'rpc.connect_rpc.error_code',

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
as done in the [example above](#recording-an-exception).

It follows that an exception may still escape the scope of the span
even if the `exception.escaped` attribute was not set or set to false,
since the event might have been recorded at a time where it was not
clear whether the exception will escape.
  */
  EXCEPTION_ESCAPED: 'exception.escaped',

  /**
   * The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
   */
  URL_SCHEME: 'url.scheme',

  /**
  * Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986).
  *
  * Note: For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
`url.full` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password should be redacted and attribute&#39;s value should be `https://REDACTED:REDACTED@www.example.com/`.
`url.full` SHOULD capture the absolute URL when it is available (or can be reconstructed) and SHOULD NOT be validated or modified except for sanitizing purposes.
  */
  URL_FULL: 'url.full',

  /**
   * The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component.
   *
   * Note: When missing, the value is assumed to be `/`.
   */
  URL_PATH: 'url.path',

  /**
   * The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component.
   *
   * Note: Sensitive content provided in query string SHOULD be scrubbed when instrumentations can identify it.
   */
  URL_QUERY: 'url.query',

  /**
   * The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component.
   */
  URL_FRAGMENT: 'url.fragment',

  /**
   * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
   */
  USER_AGENT_ORIGINAL: 'user_agent.original',
};

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
} as const;
export type NetTransportValues =
  (typeof NetTransportValues)[keyof typeof NetTransportValues];

export const NetSockFamilyValues = {
  /** IPv4 address. */
  INET: 'inet',
  /** IPv6 address. */
  INET6: 'inet6',
  /** Unix domain socket path. */
  UNIX: 'unix',
} as const;
export type NetSockFamilyValues =
  (typeof NetSockFamilyValues)[keyof typeof NetSockFamilyValues];

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
} as const;
export type HttpRequestMethodValues =
  (typeof HttpRequestMethodValues)[keyof typeof HttpRequestMethodValues];

export const EventDomainValues = {
  /** Events from browser apps. */
  BROWSER: 'browser',
  /** Events from mobile apps. */
  DEVICE: 'device',
  /** Events from Kubernetes. */
  K8S: 'k8s',
} as const;
export type EventDomainValues =
  (typeof EventDomainValues)[keyof typeof EventDomainValues];

export const LogIostreamValues = {
  /** Logs from stdout stream. */
  STDOUT: 'stdout',
  /** Events from stderr stream. */
  STDERR: 'stderr',
} as const;
export type LogIostreamValues =
  (typeof LogIostreamValues)[keyof typeof LogIostreamValues];

export const TypeValues = {
  /** Heap memory. */
  HEAP: 'heap',
  /** Non-heap memory. */
  NON_HEAP: 'non_heap',
} as const;
export type TypeValues = (typeof TypeValues)[keyof typeof TypeValues];

export const OpentracingRefTypeValues = {
  /** The parent Span depends on the child Span in some capacity. */
  CHILD_OF: 'child_of',
  /** The parent Span does not depend in any way on the result of the child Span. */
  FOLLOWS_FROM: 'follows_from',
} as const;
export type OpentracingRefTypeValues =
  (typeof OpentracingRefTypeValues)[keyof typeof OpentracingRefTypeValues];

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
} as const;
export type DbSystemValues =
  (typeof DbSystemValues)[keyof typeof DbSystemValues];

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
} as const;
export type DbCassandraConsistencyLevelValues =
  (typeof DbCassandraConsistencyLevelValues)[keyof typeof DbCassandraConsistencyLevelValues];

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
} as const;
export type DbCosmosdbOperationTypeValues =
  (typeof DbCosmosdbOperationTypeValues)[keyof typeof DbCosmosdbOperationTypeValues];

export const DbCosmosdbConnectionModeValues = {
  /** Gateway (HTTP) connections mode. */
  GATEWAY: 'gateway',
  /** Direct connection. */
  DIRECT: 'direct',
} as const;
export type DbCosmosdbConnectionModeValues =
  (typeof DbCosmosdbConnectionModeValues)[keyof typeof DbCosmosdbConnectionModeValues];

export const OtelStatusCodeValues = {
  /** The operation has been validated by an Application developer or Operator to have completed successfully. */
  OK: 'OK',
  /** The operation contains an error. */
  ERROR: 'ERROR',
} as const;
export type OtelStatusCodeValues =
  (typeof OtelStatusCodeValues)[keyof typeof OtelStatusCodeValues];

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
} as const;
export type FaasTriggerValues =
  (typeof FaasTriggerValues)[keyof typeof FaasTriggerValues];

export const FaasDocumentOperationValues = {
  /** When a new object is created. */
  INSERT: 'insert',
  /** When an object is modified. */
  EDIT: 'edit',
  /** When an object is deleted. */
  DELETE: 'delete',
} as const;
export type FaasDocumentOperationValues =
  (typeof FaasDocumentOperationValues)[keyof typeof FaasDocumentOperationValues];

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
} as const;
export type FaasInvokedProviderValues =
  (typeof FaasInvokedProviderValues)[keyof typeof FaasInvokedProviderValues];

export const NetworkTransportValues = {
  /** TCP. */
  TCP: 'tcp',
  /** UDP. */
  UDP: 'udp',
  /** Named or anonymous pipe. See note below. */
  PIPE: 'pipe',
  /** Unix domain socket. */
  UNIX: 'unix',
} as const;
export type NetworkTransportValues =
  (typeof NetworkTransportValues)[keyof typeof NetworkTransportValues];

export const NetworkTypeValues = {
  /** IPv4. */
  IPV4: 'ipv4',
  /** IPv6. */
  IPV6: 'ipv6',
} as const;
export type NetworkTypeValues =
  (typeof NetworkTypeValues)[keyof typeof NetworkTypeValues];

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
} as const;
export type NetworkConnectionTypeValues =
  (typeof NetworkConnectionTypeValues)[keyof typeof NetworkConnectionTypeValues];

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
} as const;
export type NetworkConnectionSubtypeValues =
  (typeof NetworkConnectionSubtypeValues)[keyof typeof NetworkConnectionSubtypeValues];

export const GraphqlOperationTypeValues = {
  /** GraphQL query. */
  QUERY: 'query',
  /** GraphQL mutation. */
  MUTATION: 'mutation',
  /** GraphQL subscription. */
  SUBSCRIPTION: 'subscription',
} as const;
export type GraphqlOperationTypeValues =
  (typeof GraphqlOperationTypeValues)[keyof typeof GraphqlOperationTypeValues];

export const MessagingOperationValues = {
  /** publish. */
  PUBLISH: 'publish',
  /** receive. */
  RECEIVE: 'receive',
  /** process. */
  PROCESS: 'process',
} as const;
export type MessagingOperationValues =
  (typeof MessagingOperationValues)[keyof typeof MessagingOperationValues];

export const MessagingRocketmqMessageTypeValues = {
  /** Normal message. */
  NORMAL: 'normal',
  /** FIFO message. */
  FIFO: 'fifo',
  /** Delay message. */
  DELAY: 'delay',
  /** Transaction message. */
  TRANSACTION: 'transaction',
} as const;
export type MessagingRocketmqMessageTypeValues =
  (typeof MessagingRocketmqMessageTypeValues)[keyof typeof MessagingRocketmqMessageTypeValues];

export const MessagingRocketmqConsumptionModelValues = {
  /** Clustering consumption model. */
  CLUSTERING: 'clustering',
  /** Broadcasting consumption model. */
  BROADCASTING: 'broadcasting',
} as const;
export type MessagingRocketmqConsumptionModelValues =
  (typeof MessagingRocketmqConsumptionModelValues)[keyof typeof MessagingRocketmqConsumptionModelValues];

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
} as const;
export type RpcSystemValues =
  (typeof RpcSystemValues)[keyof typeof RpcSystemValues];

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
} as const;
export type RpcGrpcStatusCodeValues =
  (typeof RpcGrpcStatusCodeValues)[keyof typeof RpcGrpcStatusCodeValues];

export const MessageTypeValues = {
  /** sent. */
  SENT: 'SENT',
  /** received. */
  RECEIVED: 'RECEIVED',
} as const;
export type MessageTypeValues =
  (typeof MessageTypeValues)[keyof typeof MessageTypeValues];

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
} as const;
export type RpcConnectRpcErrorCodeValues =
  (typeof RpcConnectRpcErrorCodeValues)[keyof typeof RpcConnectRpcErrorCodeValues];
