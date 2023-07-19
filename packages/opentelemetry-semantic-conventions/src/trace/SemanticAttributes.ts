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
   * The name of the instrumentation scope - (`InstrumentationScope.Name` in OTLP).
   */
  OTEL_SCOPE_NAME: 'otel.scope.name',

  /**
   * The version of the instrumentation scope - (`InstrumentationScope.Version` in OTLP).
   */
  OTEL_SCOPE_VERSION: 'otel.scope.version',

  /**
   * Deprecated, use the `otel.scope.name` attribute.
   */
  OTEL_LIBRARY_NAME: 'otel.library.name',

  /**
   * Deprecated, use the `otel.scope.version` attribute.
   */
  OTEL_LIBRARY_VERSION: 'otel.library.version',

  /**
   * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
   *
   * Note: This may be different from `faas.id` if an alias is involved.
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
   *
   * Note: The value may be sanitized to exclude sensitive information.
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
   * Note: If setting a `db.mssql.instance_name`, `net.peer.port` is no longer required (but still recommended if non-standard).
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
   * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
   */
  OTEL_STATUS_CODE: 'otel.status_code',

  /**
   * Description of the Status if it has a value, otherwise not set.
   */
  OTEL_STATUS_DESCRIPTION: 'otel.status_description',

  /**
  * Type of the trigger which caused this function execution.
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
   * The execution ID of the current function execution.
   */
  FAAS_EXECUTION: 'faas.execution',

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
   * Transport protocol used. See note below.
   */
  NET_TRANSPORT: 'net.transport',

  /**
   * Application layer protocol used. The value SHOULD be normalized to lowercase.
   */
  NET_APP_PROTOCOL_NAME: 'net.app.protocol.name',

  /**
   * Version of the application layer protocol used. See note below.
   *
   * Note: `net.app.protocol.version` refers to the version of the protocol used and might be different from the protocol client&#39;s version. If the HTTP client used has a version of `0.27.2`, but sends HTTP version `1.1`, this attribute should be set to `1.1`.
   */
  NET_APP_PROTOCOL_VERSION: 'net.app.protocol.version',

  /**
   * Remote socket peer name.
   */
  NET_SOCK_PEER_NAME: 'net.sock.peer.name',

  /**
   * Remote socket peer address: IPv4 or IPv6 for internet protocols, path for local communication, [etc](https://man7.org/linux/man-pages/man7/address_families.7.html).
   */
  NET_SOCK_PEER_ADDR: 'net.sock.peer.addr',

  /**
   * Remote socket peer port.
   */
  NET_SOCK_PEER_PORT: 'net.sock.peer.port',

  /**
   * Protocol [address family](https://man7.org/linux/man-pages/man7/address_families.7.html) which is used for communication.
   */
  NET_SOCK_FAMILY: 'net.sock.family',

  /**
   * Logical remote hostname, see note below.
   *
   * Note: `net.peer.name` SHOULD NOT be set if capturing it would require an extra DNS lookup.
   */
  NET_PEER_NAME: 'net.peer.name',

  /**
   * Logical remote port number.
   */
  NET_PEER_PORT: 'net.peer.port',

  /**
   * Logical local hostname or similar, see note below.
   */
  NET_HOST_NAME: 'net.host.name',

  /**
   * Logical local port number, preferably the one that the peer used to connect.
   */
  NET_HOST_PORT: 'net.host.port',

  /**
   * Local socket address. Useful in case of a multi-IP host.
   */
  NET_SOCK_HOST_ADDR: 'net.sock.host.addr',

  /**
   * Local socket port number.
   */
  NET_SOCK_HOST_PORT: 'net.sock.host.port',

  /**
   * The internet connection type currently being used by the host.
   */
  NET_HOST_CONNECTION_TYPE: 'net.host.connection.type',

  /**
   * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
   */
  NET_HOST_CONNECTION_SUBTYPE: 'net.host.connection.subtype',

  /**
   * The name of the mobile carrier.
   */
  NET_HOST_CARRIER_NAME: 'net.host.carrier.name',

  /**
   * The mobile carrier country code.
   */
  NET_HOST_CARRIER_MCC: 'net.host.carrier.mcc',

  /**
   * The mobile carrier network code.
   */
  NET_HOST_CARRIER_MNC: 'net.host.carrier.mnc',

  /**
   * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
   */
  NET_HOST_CARRIER_ICC: 'net.host.carrier.icc',

  /**
   * The [`service.name`](../../resource/semantic_conventions/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
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
   * HTTP request method.
   */
  HTTP_METHOD: 'http.method',

  /**
   * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
   */
  HTTP_STATUS_CODE: 'http.status_code',

  /**
   * Kind of HTTP protocol used.
   *
   * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
   */
  HTTP_FLAVOR: 'http.flavor',

  /**
   * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
   */
  HTTP_USER_AGENT: 'http.user_agent',

  /**
   * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
   */
  HTTP_REQUEST_CONTENT_LENGTH: 'http.request_content_length',

  /**
   * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
   */
  HTTP_RESPONSE_CONTENT_LENGTH: 'http.response_content_length',

  /**
   * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`. Usually the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
   *
   * Note: `http.url` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case the attribute&#39;s value should be `https://www.example.com/`.
   */
  HTTP_URL: 'http.url',

  /**
   * The ordinal number of request resending attempt (for any reason, including redirects).
   *
   * Note: The resend count SHOULD be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
   */
  HTTP_RESEND_COUNT: 'http.resend_count',

  /**
   * The URI scheme identifying the used protocol.
   */
  HTTP_SCHEME: 'http.scheme',

  /**
   * The full request target as passed in a HTTP request line or equivalent.
   */
  HTTP_TARGET: 'http.target',

  /**
   * The matched route (path template in the format used by the respective server framework). See note below.
   *
   * Note: &#39;http.route&#39; MUST NOT be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
   */
  HTTP_ROUTE: 'http.route',

  /**
  * The IP address of the original client behind all proxies, if known (e.g. from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)).
  *
  * Note: This is not necessarily the same as `net.sock.peer.addr`, which would
identify the network-level peer, which may be a proxy.

This attribute should be set when a source of information different
from the one used for `net.sock.peer.addr`, is available even if that other
source just confirms the same value as `net.sock.peer.addr`.
Rationale: For `net.sock.peer.addr`, one typically does not know if it
comes from a proxy, reverse proxy, or the actual client. Setting
`http.client_ip` when it&#39;s the same as `net.sock.peer.addr` means that
one is at least somewhat confident that the address is not that of
the closest proxy.
  */
  HTTP_CLIENT_IP: 'http.client_ip',

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
   * A string identifying the messaging system.
   */
  MESSAGING_SYSTEM: 'messaging.system',

  /**
   * The message destination name. This might be equal to the span name but is required nevertheless.
   */
  MESSAGING_DESTINATION: 'messaging.destination',

  /**
   * The kind of message destination.
   */
  MESSAGING_DESTINATION_KIND: 'messaging.destination_kind',

  /**
   * A boolean that is true if the message destination is temporary.
   */
  MESSAGING_TEMP_DESTINATION: 'messaging.temp_destination',

  /**
   * The name of the transport protocol.
   */
  MESSAGING_PROTOCOL: 'messaging.protocol',

  /**
   * The version of the transport protocol.
   */
  MESSAGING_PROTOCOL_VERSION: 'messaging.protocol_version',

  /**
   * Connection string.
   */
  MESSAGING_URL: 'messaging.url',

  /**
   * A value used by the messaging system as an identifier for the message, represented as a string.
   */
  MESSAGING_MESSAGE_ID: 'messaging.message_id',

  /**
   * The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
   */
  MESSAGING_CONVERSATION_ID: 'messaging.conversation_id',

  /**
   * The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
   */
  MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES: 'messaging.message_payload_size_bytes',

  /**
   * The compressed size of the message payload in bytes.
   */
  MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES:
    'messaging.message_payload_compressed_size_bytes',

  /**
   * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
   */
  MESSAGING_OPERATION: 'messaging.operation',

  /**
   * The identifier for the consumer receiving a message. For Kafka, set it to `{messaging.kafka.consumer_group} - {messaging.kafka.client_id}`, if both are present, or only `messaging.kafka.consumer_group`. For brokers, such as RabbitMQ and Artemis, set it to the `client_id` of the client consuming the message.
   */
  MESSAGING_CONSUMER_ID: 'messaging.consumer_id',

  /**
   * RabbitMQ message routing key.
   */
  MESSAGING_RABBITMQ_ROUTING_KEY: 'messaging.rabbitmq.routing_key',

  /**
   * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message_id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
   *
   * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
   */
  MESSAGING_KAFKA_MESSAGE_KEY: 'messaging.kafka.message_key',

  /**
   * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
   */
  MESSAGING_KAFKA_CONSUMER_GROUP: 'messaging.kafka.consumer_group',

  /**
   * Client Id for the Consumer or Producer that is handling the message.
   */
  MESSAGING_KAFKA_CLIENT_ID: 'messaging.kafka.client_id',

  /**
   * Partition the message is sent to.
   */
  MESSAGING_KAFKA_PARTITION: 'messaging.kafka.partition',

  /**
   * The offset of a record in the corresponding Kafka partition.
   */
  MESSAGING_KAFKA_MESSAGE_OFFSET: 'messaging.kafka.message.offset',

  /**
   * A boolean that is true if the message is a tombstone.
   */
  MESSAGING_KAFKA_TOMBSTONE: 'messaging.kafka.tombstone',

  /**
   * Namespace of RocketMQ resources, resources in different namespaces are individual.
   */
  MESSAGING_ROCKETMQ_NAMESPACE: 'messaging.rocketmq.namespace',

  /**
   * Name of the RocketMQ producer/consumer group that is handling the message. The client type is identified by the SpanKind.
   */
  MESSAGING_ROCKETMQ_CLIENT_GROUP: 'messaging.rocketmq.client_group',

  /**
   * The unique identifier for each client.
   */
  MESSAGING_ROCKETMQ_CLIENT_ID: 'messaging.rocketmq.client_id',

  /**
   * The timestamp in milliseconds that the delay message is expected to be delivered to consumer.
   */
  MESSAGING_ROCKETMQ_DELIVERY_TIMESTAMP:
    'messaging.rocketmq.delivery_timestamp',

  /**
   * The delay time level for delay message, which determines the message delay time.
   */
  MESSAGING_ROCKETMQ_DELAY_TIME_LEVEL: 'messaging.rocketmq.delay_time_level',

  /**
   * It is essential for FIFO message. Messages that belong to the same message group are always processed one by one within the same consumer group.
   */
  MESSAGING_ROCKETMQ_MESSAGE_GROUP: 'messaging.rocketmq.message_group',

  /**
   * Type of message.
   */
  MESSAGING_ROCKETMQ_MESSAGE_TYPE: 'messaging.rocketmq.message_type',

  /**
   * The secondary classifier of message besides topic.
   */
  MESSAGING_ROCKETMQ_MESSAGE_TAG: 'messaging.rocketmq.message_tag',

  /**
   * Key(s) of message, another way to mark message besides message id.
   */
  MESSAGING_ROCKETMQ_MESSAGE_KEYS: 'messaging.rocketmq.message_keys',

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
};

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

export const NetTransportValues = {
  /** ip_tcp. */
  IP_TCP: 'ip_tcp',
  /** ip_udp. */
  IP_UDP: 'ip_udp',
  /** Named or anonymous pipe. See note below. */
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

export const NetHostConnectionTypeValues = {
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
export type NetHostConnectionTypeValues =
  (typeof NetHostConnectionTypeValues)[keyof typeof NetHostConnectionTypeValues];

export const NetHostConnectionSubtypeValues = {
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
export type NetHostConnectionSubtypeValues =
  (typeof NetHostConnectionSubtypeValues)[keyof typeof NetHostConnectionSubtypeValues];

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
} as const;
export type HttpFlavorValues =
  (typeof HttpFlavorValues)[keyof typeof HttpFlavorValues];

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

export const MessagingDestinationKindValues = {
  /** A message sent to a queue. */
  QUEUE: 'queue',
  /** A message sent to a topic. */
  TOPIC: 'topic',
} as const;
export type MessagingDestinationKindValues =
  (typeof MessagingDestinationKindValues)[keyof typeof MessagingDestinationKindValues];

export const MessagingOperationValues = {
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
