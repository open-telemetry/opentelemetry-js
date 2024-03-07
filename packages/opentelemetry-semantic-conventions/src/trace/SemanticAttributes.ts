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

import { createConstMap } from '../internal/utils';

//----------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
//----------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------
// Constant values for SemanticAttributes
//----------------------------------------------------------------------------------------------------------

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_AWS_LAMBDA_INVOKED_ARN = 'aws.lambda.invoked_arn';
const TMP_DB_SYSTEM = 'db.system';
const TMP_DB_CONNECTION_STRING = 'db.connection_string';
const TMP_DB_USER = 'db.user';
const TMP_DB_JDBC_DRIVER_CLASSNAME = 'db.jdbc.driver_classname';
const TMP_DB_NAME = 'db.name';
const TMP_DB_STATEMENT = 'db.statement';
const TMP_DB_OPERATION = 'db.operation';
const TMP_DB_MSSQL_INSTANCE_NAME = 'db.mssql.instance_name';
const TMP_DB_CASSANDRA_KEYSPACE = 'db.cassandra.keyspace';
const TMP_DB_CASSANDRA_PAGE_SIZE = 'db.cassandra.page_size';
const TMP_DB_CASSANDRA_CONSISTENCY_LEVEL = 'db.cassandra.consistency_level';
const TMP_DB_CASSANDRA_TABLE = 'db.cassandra.table';
const TMP_DB_CASSANDRA_IDEMPOTENCE = 'db.cassandra.idempotence';
const TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT =
  'db.cassandra.speculative_execution_count';
const TMP_DB_CASSANDRA_COORDINATOR_ID = 'db.cassandra.coordinator.id';
const TMP_DB_CASSANDRA_COORDINATOR_DC = 'db.cassandra.coordinator.dc';
const TMP_DB_HBASE_NAMESPACE = 'db.hbase.namespace';
const TMP_DB_REDIS_DATABASE_INDEX = 'db.redis.database_index';
const TMP_DB_MONGODB_COLLECTION = 'db.mongodb.collection';
const TMP_DB_SQL_TABLE = 'db.sql.table';
const TMP_EXCEPTION_TYPE = 'exception.type';
const TMP_EXCEPTION_MESSAGE = 'exception.message';
const TMP_EXCEPTION_STACKTRACE = 'exception.stacktrace';
const TMP_EXCEPTION_ESCAPED = 'exception.escaped';
const TMP_FAAS_TRIGGER = 'faas.trigger';
const TMP_FAAS_EXECUTION = 'faas.execution';
const TMP_FAAS_DOCUMENT_COLLECTION = 'faas.document.collection';
const TMP_FAAS_DOCUMENT_OPERATION = 'faas.document.operation';
const TMP_FAAS_DOCUMENT_TIME = 'faas.document.time';
const TMP_FAAS_DOCUMENT_NAME = 'faas.document.name';
const TMP_FAAS_TIME = 'faas.time';
const TMP_FAAS_CRON = 'faas.cron';
const TMP_FAAS_COLDSTART = 'faas.coldstart';
const TMP_FAAS_INVOKED_NAME = 'faas.invoked_name';
const TMP_FAAS_INVOKED_PROVIDER = 'faas.invoked_provider';
const TMP_FAAS_INVOKED_REGION = 'faas.invoked_region';
const TMP_NET_TRANSPORT = 'net.transport';
const TMP_NET_PEER_IP = 'net.peer.ip';
const TMP_NET_PEER_PORT = 'net.peer.port';
const TMP_NET_PEER_NAME = 'net.peer.name';
const TMP_NET_HOST_IP = 'net.host.ip';
const TMP_NET_HOST_PORT = 'net.host.port';
const TMP_NET_HOST_NAME = 'net.host.name';
const TMP_NET_HOST_CONNECTION_TYPE = 'net.host.connection.type';
const TMP_NET_HOST_CONNECTION_SUBTYPE = 'net.host.connection.subtype';
const TMP_NET_HOST_CARRIER_NAME = 'net.host.carrier.name';
const TMP_NET_HOST_CARRIER_MCC = 'net.host.carrier.mcc';
const TMP_NET_HOST_CARRIER_MNC = 'net.host.carrier.mnc';
const TMP_NET_HOST_CARRIER_ICC = 'net.host.carrier.icc';
const TMP_PEER_SERVICE = 'peer.service';
const TMP_ENDUSER_ID = 'enduser.id';
const TMP_ENDUSER_ROLE = 'enduser.role';
const TMP_ENDUSER_SCOPE = 'enduser.scope';
const TMP_THREAD_ID = 'thread.id';
const TMP_THREAD_NAME = 'thread.name';
const TMP_CODE_FUNCTION = 'code.function';
const TMP_CODE_NAMESPACE = 'code.namespace';
const TMP_CODE_FILEPATH = 'code.filepath';
const TMP_CODE_LINENO = 'code.lineno';
const TMP_HTTP_METHOD = 'http.method';
const TMP_HTTP_URL = 'http.url';
const TMP_HTTP_TARGET = 'http.target';
const TMP_HTTP_HOST = 'http.host';
const TMP_HTTP_SCHEME = 'http.scheme';
const TMP_HTTP_STATUS_CODE = 'http.status_code';
const TMP_HTTP_FLAVOR = 'http.flavor';
const TMP_HTTP_USER_AGENT = 'http.user_agent';
const TMP_HTTP_REQUEST_CONTENT_LENGTH = 'http.request_content_length';
const TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED =
  'http.request_content_length_uncompressed';
const TMP_HTTP_RESPONSE_CONTENT_LENGTH = 'http.response_content_length';
const TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED =
  'http.response_content_length_uncompressed';
const TMP_HTTP_SERVER_NAME = 'http.server_name';
const TMP_HTTP_ROUTE = 'http.route';
const TMP_HTTP_CLIENT_IP = 'http.client_ip';
const TMP_AWS_DYNAMODB_TABLE_NAMES = 'aws.dynamodb.table_names';
const TMP_AWS_DYNAMODB_CONSUMED_CAPACITY = 'aws.dynamodb.consumed_capacity';
const TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS =
  'aws.dynamodb.item_collection_metrics';
const TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY =
  'aws.dynamodb.provisioned_read_capacity';
const TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY =
  'aws.dynamodb.provisioned_write_capacity';
const TMP_AWS_DYNAMODB_CONSISTENT_READ = 'aws.dynamodb.consistent_read';
const TMP_AWS_DYNAMODB_PROJECTION = 'aws.dynamodb.projection';
const TMP_AWS_DYNAMODB_LIMIT = 'aws.dynamodb.limit';
const TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET = 'aws.dynamodb.attributes_to_get';
const TMP_AWS_DYNAMODB_INDEX_NAME = 'aws.dynamodb.index_name';
const TMP_AWS_DYNAMODB_SELECT = 'aws.dynamodb.select';
const TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES =
  'aws.dynamodb.global_secondary_indexes';
const TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES =
  'aws.dynamodb.local_secondary_indexes';
const TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE =
  'aws.dynamodb.exclusive_start_table';
const TMP_AWS_DYNAMODB_TABLE_COUNT = 'aws.dynamodb.table_count';
const TMP_AWS_DYNAMODB_SCAN_FORWARD = 'aws.dynamodb.scan_forward';
const TMP_AWS_DYNAMODB_SEGMENT = 'aws.dynamodb.segment';
const TMP_AWS_DYNAMODB_TOTAL_SEGMENTS = 'aws.dynamodb.total_segments';
const TMP_AWS_DYNAMODB_COUNT = 'aws.dynamodb.count';
const TMP_AWS_DYNAMODB_SCANNED_COUNT = 'aws.dynamodb.scanned_count';
const TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS =
  'aws.dynamodb.attribute_definitions';
const TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES =
  'aws.dynamodb.global_secondary_index_updates';
const TMP_MESSAGING_SYSTEM = 'messaging.system';
const TMP_MESSAGING_DESTINATION = 'messaging.destination';
const TMP_MESSAGING_DESTINATION_KIND = 'messaging.destination_kind';
const TMP_MESSAGING_TEMP_DESTINATION = 'messaging.temp_destination';
const TMP_MESSAGING_PROTOCOL = 'messaging.protocol';
const TMP_MESSAGING_PROTOCOL_VERSION = 'messaging.protocol_version';
const TMP_MESSAGING_URL = 'messaging.url';
const TMP_MESSAGING_MESSAGE_ID = 'messaging.message_id';
const TMP_MESSAGING_CONVERSATION_ID = 'messaging.conversation_id';
const TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES =
  'messaging.message_payload_size_bytes';
const TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES =
  'messaging.message_payload_compressed_size_bytes';
const TMP_MESSAGING_OPERATION = 'messaging.operation';
const TMP_MESSAGING_CONSUMER_ID = 'messaging.consumer_id';
const TMP_MESSAGING_RABBITMQ_ROUTING_KEY = 'messaging.rabbitmq.routing_key';
const TMP_MESSAGING_KAFKA_MESSAGE_KEY = 'messaging.kafka.message_key';
const TMP_MESSAGING_KAFKA_CONSUMER_GROUP = 'messaging.kafka.consumer_group';
const TMP_MESSAGING_KAFKA_CLIENT_ID = 'messaging.kafka.client_id';
const TMP_MESSAGING_KAFKA_PARTITION = 'messaging.kafka.partition';
const TMP_MESSAGING_KAFKA_TOMBSTONE = 'messaging.kafka.tombstone';
const TMP_RPC_SYSTEM = 'rpc.system';
const TMP_RPC_SERVICE = 'rpc.service';
const TMP_RPC_METHOD = 'rpc.method';
const TMP_RPC_GRPC_STATUS_CODE = 'rpc.grpc.status_code';
const TMP_RPC_JSONRPC_VERSION = 'rpc.jsonrpc.version';
const TMP_RPC_JSONRPC_REQUEST_ID = 'rpc.jsonrpc.request_id';
const TMP_RPC_JSONRPC_ERROR_CODE = 'rpc.jsonrpc.error_code';
const TMP_RPC_JSONRPC_ERROR_MESSAGE = 'rpc.jsonrpc.error_message';
const TMP_MESSAGE_TYPE = 'message.type';
const TMP_MESSAGE_ID = 'message.id';
const TMP_MESSAGE_COMPRESSED_SIZE = 'message.compressed_size';
const TMP_MESSAGE_UNCOMPRESSED_SIZE = 'message.uncompressed_size';

/**
 * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
 *
 * Note: This may be different from `faas.id` if an alias is involved.
 */
export const SEMATTRS_AWS_LAMBDA_INVOKED_ARN = TMP_AWS_LAMBDA_INVOKED_ARN;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const SEMATTRS_DB_SYSTEM = TMP_DB_SYSTEM;

/**
 * The connection string used to connect to the database. It is recommended to remove embedded credentials.
 */
export const SEMATTRS_DB_CONNECTION_STRING = TMP_DB_CONNECTION_STRING;

/**
 * Username for accessing the database.
 */
export const SEMATTRS_DB_USER = TMP_DB_USER;

/**
 * The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
 */
export const SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = TMP_DB_JDBC_DRIVER_CLASSNAME;

/**
 * If no [tech-specific attribute](#call-level-attributes-for-specific-technologies) is defined, this attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
 *
 * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;.
 */
export const SEMATTRS_DB_NAME = TMP_DB_NAME;

/**
 * The database statement being executed.
 *
 * Note: The value may be sanitized to exclude sensitive information.
 */
export const SEMATTRS_DB_STATEMENT = TMP_DB_STATEMENT;

/**
 * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
 *
 * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
 */
export const SEMATTRS_DB_OPERATION = TMP_DB_OPERATION;

/**
 * The Microsoft SQL Server [instance name](https://docs.microsoft.com/en-us/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
 *
 * Note: If setting a `db.mssql.instance_name`, `net.peer.port` is no longer required (but still recommended if non-standard).
 */
export const SEMATTRS_DB_MSSQL_INSTANCE_NAME = TMP_DB_MSSQL_INSTANCE_NAME;

/**
 * The name of the keyspace being accessed. To be used instead of the generic `db.name` attribute.
 */
export const SEMATTRS_DB_CASSANDRA_KEYSPACE = TMP_DB_CASSANDRA_KEYSPACE;

/**
 * The fetch size used for paging, i.e. how many rows will be returned at once.
 */
export const SEMATTRS_DB_CASSANDRA_PAGE_SIZE = TMP_DB_CASSANDRA_PAGE_SIZE;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL =
  TMP_DB_CASSANDRA_CONSISTENCY_LEVEL;

/**
 * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
 *
 * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 */
export const SEMATTRS_DB_CASSANDRA_TABLE = TMP_DB_CASSANDRA_TABLE;

/**
 * Whether or not the query is idempotent.
 */
export const SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = TMP_DB_CASSANDRA_IDEMPOTENCE;

/**
 * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
 */
export const SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT =
  TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT;

/**
 * The ID of the coordinating node for a query.
 */
export const SEMATTRS_DB_CASSANDRA_COORDINATOR_ID =
  TMP_DB_CASSANDRA_COORDINATOR_ID;

/**
 * The data center of the coordinating node for a query.
 */
export const SEMATTRS_DB_CASSANDRA_COORDINATOR_DC =
  TMP_DB_CASSANDRA_COORDINATOR_DC;

/**
 * The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed. To be used instead of the generic `db.name` attribute.
 */
export const SEMATTRS_DB_HBASE_NAMESPACE = TMP_DB_HBASE_NAMESPACE;

/**
 * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
 */
export const SEMATTRS_DB_REDIS_DATABASE_INDEX = TMP_DB_REDIS_DATABASE_INDEX;

/**
 * The collection being accessed within the database stated in `db.name`.
 */
export const SEMATTRS_DB_MONGODB_COLLECTION = TMP_DB_MONGODB_COLLECTION;

/**
 * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
 *
 * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 */
export const SEMATTRS_DB_SQL_TABLE = TMP_DB_SQL_TABLE;

/**
 * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
 */
export const SEMATTRS_EXCEPTION_TYPE = TMP_EXCEPTION_TYPE;

/**
 * The exception message.
 */
export const SEMATTRS_EXCEPTION_MESSAGE = TMP_EXCEPTION_MESSAGE;

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 */
export const SEMATTRS_EXCEPTION_STACKTRACE = TMP_EXCEPTION_STACKTRACE;

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
as done in the [example above](#exception-end-example).

It follows that an exception may still escape the scope of the span
even if the `exception.escaped` attribute was not set or set to false,
since the event might have been recorded at a time where it was not
clear whether the exception will escape.
*/
export const SEMATTRS_EXCEPTION_ESCAPED = TMP_EXCEPTION_ESCAPED;

/**
 * Type of the trigger on which the function is executed.
 */
export const SEMATTRS_FAAS_TRIGGER = TMP_FAAS_TRIGGER;

/**
 * The execution ID of the current function execution.
 */
export const SEMATTRS_FAAS_EXECUTION = TMP_FAAS_EXECUTION;

/**
 * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
 */
export const SEMATTRS_FAAS_DOCUMENT_COLLECTION = TMP_FAAS_DOCUMENT_COLLECTION;

/**
 * Describes the type of the operation that was performed on the data.
 */
export const SEMATTRS_FAAS_DOCUMENT_OPERATION = TMP_FAAS_DOCUMENT_OPERATION;

/**
 * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 */
export const SEMATTRS_FAAS_DOCUMENT_TIME = TMP_FAAS_DOCUMENT_TIME;

/**
 * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
 */
export const SEMATTRS_FAAS_DOCUMENT_NAME = TMP_FAAS_DOCUMENT_NAME;

/**
 * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 */
export const SEMATTRS_FAAS_TIME = TMP_FAAS_TIME;

/**
 * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
 */
export const SEMATTRS_FAAS_CRON = TMP_FAAS_CRON;

/**
 * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
 */
export const SEMATTRS_FAAS_COLDSTART = TMP_FAAS_COLDSTART;

/**
 * The name of the invoked function.
 *
 * Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
 */
export const SEMATTRS_FAAS_INVOKED_NAME = TMP_FAAS_INVOKED_NAME;

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const SEMATTRS_FAAS_INVOKED_PROVIDER = TMP_FAAS_INVOKED_PROVIDER;

/**
 * The cloud region of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
 */
export const SEMATTRS_FAAS_INVOKED_REGION = TMP_FAAS_INVOKED_REGION;

/**
 * Transport protocol used. See note below.
 */
export const SEMATTRS_NET_TRANSPORT = TMP_NET_TRANSPORT;

/**
 * Remote address of the peer (dotted decimal for IPv4 or [RFC5952](https://tools.ietf.org/html/rfc5952) for IPv6).
 */
export const SEMATTRS_NET_PEER_IP = TMP_NET_PEER_IP;

/**
 * Remote port number.
 */
export const SEMATTRS_NET_PEER_PORT = TMP_NET_PEER_PORT;

/**
 * Remote hostname or similar, see note below.
 */
export const SEMATTRS_NET_PEER_NAME = TMP_NET_PEER_NAME;

/**
 * Like `net.peer.ip` but for the host IP. Useful in case of a multi-IP host.
 */
export const SEMATTRS_NET_HOST_IP = TMP_NET_HOST_IP;

/**
 * Like `net.peer.port` but for the host port.
 */
export const SEMATTRS_NET_HOST_PORT = TMP_NET_HOST_PORT;

/**
 * Local hostname or similar, see note below.
 */
export const SEMATTRS_NET_HOST_NAME = TMP_NET_HOST_NAME;

/**
 * The internet connection type currently being used by the host.
 */
export const SEMATTRS_NET_HOST_CONNECTION_TYPE = TMP_NET_HOST_CONNECTION_TYPE;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const SEMATTRS_NET_HOST_CONNECTION_SUBTYPE =
  TMP_NET_HOST_CONNECTION_SUBTYPE;

/**
 * The name of the mobile carrier.
 */
export const SEMATTRS_NET_HOST_CARRIER_NAME = TMP_NET_HOST_CARRIER_NAME;

/**
 * The mobile carrier country code.
 */
export const SEMATTRS_NET_HOST_CARRIER_MCC = TMP_NET_HOST_CARRIER_MCC;

/**
 * The mobile carrier network code.
 */
export const SEMATTRS_NET_HOST_CARRIER_MNC = TMP_NET_HOST_CARRIER_MNC;

/**
 * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
 */
export const SEMATTRS_NET_HOST_CARRIER_ICC = TMP_NET_HOST_CARRIER_ICC;

/**
 * The [`service.name`](../../resource/semantic_conventions/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
 */
export const SEMATTRS_PEER_SERVICE = TMP_PEER_SERVICE;

/**
 * Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
 */
export const SEMATTRS_ENDUSER_ID = TMP_ENDUSER_ID;

/**
 * Actual/assumed role the client is making the request under extracted from token or application security context.
 */
export const SEMATTRS_ENDUSER_ROLE = TMP_ENDUSER_ROLE;

/**
 * Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
 */
export const SEMATTRS_ENDUSER_SCOPE = TMP_ENDUSER_SCOPE;

/**
 * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
 */
export const SEMATTRS_THREAD_ID = TMP_THREAD_ID;

/**
 * Current thread name.
 */
export const SEMATTRS_THREAD_NAME = TMP_THREAD_NAME;

/**
 * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
 */
export const SEMATTRS_CODE_FUNCTION = TMP_CODE_FUNCTION;

/**
 * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
 */
export const SEMATTRS_CODE_NAMESPACE = TMP_CODE_NAMESPACE;

/**
 * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
 */
export const SEMATTRS_CODE_FILEPATH = TMP_CODE_FILEPATH;

/**
 * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
 */
export const SEMATTRS_CODE_LINENO = TMP_CODE_LINENO;

/**
 * HTTP request method.
 */
export const SEMATTRS_HTTP_METHOD = TMP_HTTP_METHOD;

/**
 * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`. Usually the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
 *
 * Note: `http.url` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case the attribute&#39;s value should be `https://www.example.com/`.
 */
export const SEMATTRS_HTTP_URL = TMP_HTTP_URL;

/**
 * The full request target as passed in a HTTP request line or equivalent.
 */
export const SEMATTRS_HTTP_TARGET = TMP_HTTP_TARGET;

/**
 * The value of the [HTTP host header](https://tools.ietf.org/html/rfc7230#section-5.4). An empty Host header should also be reported, see note.
 *
 * Note: When the header is present but empty the attribute SHOULD be set to the empty string. Note that this is a valid situation that is expected in certain cases, according the aforementioned [section of RFC 7230](https://tools.ietf.org/html/rfc7230#section-5.4). When the header is not set the attribute MUST NOT be set.
 */
export const SEMATTRS_HTTP_HOST = TMP_HTTP_HOST;

/**
 * The URI scheme identifying the used protocol.
 */
export const SEMATTRS_HTTP_SCHEME = TMP_HTTP_SCHEME;

/**
 * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
 */
export const SEMATTRS_HTTP_STATUS_CODE = TMP_HTTP_STATUS_CODE;

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const SEMATTRS_HTTP_FLAVOR = TMP_HTTP_FLAVOR;

/**
 * Value of the [HTTP User-Agent](https://tools.ietf.org/html/rfc7231#section-5.5.3) header sent by the client.
 */
export const SEMATTRS_HTTP_USER_AGENT = TMP_HTTP_USER_AGENT;

/**
 * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
 */
export const SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH =
  TMP_HTTP_REQUEST_CONTENT_LENGTH;

/**
 * The size of the uncompressed request payload body after transport decoding. Not set if transport encoding not used.
 */
export const SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED =
  TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED;

/**
 * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
 */
export const SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH =
  TMP_HTTP_RESPONSE_CONTENT_LENGTH;

/**
 * The size of the uncompressed response payload body after transport decoding. Not set if transport encoding not used.
 */
export const SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED =
  TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED;

/**
 * The primary server name of the matched virtual host. This should be obtained via configuration. If no such configuration can be obtained, this attribute MUST NOT be set ( `net.host.name` should be used instead).
 *
 * Note: `http.url` is usually not readily available on the server side but would have to be assembled in a cumbersome and sometimes lossy process from other information (see e.g. open-telemetry/opentelemetry-python/pull/148). It is thus preferred to supply the raw data that is available.
 */
export const SEMATTRS_HTTP_SERVER_NAME = TMP_HTTP_SERVER_NAME;

/**
 * The matched route (path template).
 */
export const SEMATTRS_HTTP_ROUTE = TMP_HTTP_ROUTE;

/**
* The IP address of the original client behind all proxies, if known (e.g. from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)).
*
* Note: This is not necessarily the same as `net.peer.ip`, which would
identify the network-level peer, which may be a proxy.

This attribute should be set when a source of information different
from the one used for `net.peer.ip`, is available even if that other
source just confirms the same value as `net.peer.ip`.
Rationale: For `net.peer.ip`, one typically does not know if it
comes from a proxy, reverse proxy, or the actual client. Setting
`http.client_ip` when it&#39;s the same as `net.peer.ip` means that
one is at least somewhat confident that the address is not that of
the closest proxy.
*/
export const SEMATTRS_HTTP_CLIENT_IP = TMP_HTTP_CLIENT_IP;

/**
 * The keys in the `RequestItems` object field.
 */
export const SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = TMP_AWS_DYNAMODB_TABLE_NAMES;

/**
 * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
 */
export const SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY =
  TMP_AWS_DYNAMODB_CONSUMED_CAPACITY;

/**
 * The JSON-serialized value of the `ItemCollectionMetrics` response field.
 */
export const SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS =
  TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS;

/**
 * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY =
  TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY;

/**
 * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY =
  TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY;

/**
 * The value of the `ConsistentRead` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ =
  TMP_AWS_DYNAMODB_CONSISTENT_READ;

/**
 * The value of the `ProjectionExpression` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_PROJECTION = TMP_AWS_DYNAMODB_PROJECTION;

/**
 * The value of the `Limit` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_LIMIT = TMP_AWS_DYNAMODB_LIMIT;

/**
 * The value of the `AttributesToGet` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET =
  TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET;

/**
 * The value of the `IndexName` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_INDEX_NAME = TMP_AWS_DYNAMODB_INDEX_NAME;

/**
 * The value of the `Select` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SELECT = TMP_AWS_DYNAMODB_SELECT;

/**
 * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES =
  TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES;

/**
 * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES =
  TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES;

/**
 * The value of the `ExclusiveStartTableName` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE =
  TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE;

/**
 * The the number of items in the `TableNames` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = TMP_AWS_DYNAMODB_TABLE_COUNT;

/**
 * The value of the `ScanIndexForward` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = TMP_AWS_DYNAMODB_SCAN_FORWARD;

/**
 * The value of the `Segment` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SEGMENT = TMP_AWS_DYNAMODB_SEGMENT;

/**
 * The value of the `TotalSegments` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS =
  TMP_AWS_DYNAMODB_TOTAL_SEGMENTS;

/**
 * The value of the `Count` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_COUNT = TMP_AWS_DYNAMODB_COUNT;

/**
 * The value of the `ScannedCount` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT =
  TMP_AWS_DYNAMODB_SCANNED_COUNT;

/**
 * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS =
  TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS;

/**
 * The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES =
  TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES;

/**
 * A string identifying the messaging system.
 */
export const SEMATTRS_MESSAGING_SYSTEM = TMP_MESSAGING_SYSTEM;

/**
 * The message destination name. This might be equal to the span name but is required nevertheless.
 */
export const SEMATTRS_MESSAGING_DESTINATION = TMP_MESSAGING_DESTINATION;

/**
 * The kind of message destination.
 */
export const SEMATTRS_MESSAGING_DESTINATION_KIND =
  TMP_MESSAGING_DESTINATION_KIND;

/**
 * A boolean that is true if the message destination is temporary.
 */
export const SEMATTRS_MESSAGING_TEMP_DESTINATION =
  TMP_MESSAGING_TEMP_DESTINATION;

/**
 * The name of the transport protocol.
 */
export const SEMATTRS_MESSAGING_PROTOCOL = TMP_MESSAGING_PROTOCOL;

/**
 * The version of the transport protocol.
 */
export const SEMATTRS_MESSAGING_PROTOCOL_VERSION =
  TMP_MESSAGING_PROTOCOL_VERSION;

/**
 * Connection string.
 */
export const SEMATTRS_MESSAGING_URL = TMP_MESSAGING_URL;

/**
 * A value used by the messaging system as an identifier for the message, represented as a string.
 */
export const SEMATTRS_MESSAGING_MESSAGE_ID = TMP_MESSAGING_MESSAGE_ID;

/**
 * The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
 */
export const SEMATTRS_MESSAGING_CONVERSATION_ID = TMP_MESSAGING_CONVERSATION_ID;

/**
 * The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
 */
export const SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES =
  TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES;

/**
 * The compressed size of the message payload in bytes.
 */
export const SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES =
  TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES;

/**
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 */
export const SEMATTRS_MESSAGING_OPERATION = TMP_MESSAGING_OPERATION;

/**
 * The identifier for the consumer receiving a message. For Kafka, set it to `{messaging.kafka.consumer_group} - {messaging.kafka.client_id}`, if both are present, or only `messaging.kafka.consumer_group`. For brokers, such as RabbitMQ and Artemis, set it to the `client_id` of the client consuming the message.
 */
export const SEMATTRS_MESSAGING_CONSUMER_ID = TMP_MESSAGING_CONSUMER_ID;

/**
 * RabbitMQ message routing key.
 */
export const SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY =
  TMP_MESSAGING_RABBITMQ_ROUTING_KEY;

/**
 * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message_id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
 *
 * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
 */
export const SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY =
  TMP_MESSAGING_KAFKA_MESSAGE_KEY;

/**
 * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
 */
export const SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP =
  TMP_MESSAGING_KAFKA_CONSUMER_GROUP;

/**
 * Client Id for the Consumer or Producer that is handling the message.
 */
export const SEMATTRS_MESSAGING_KAFKA_CLIENT_ID = TMP_MESSAGING_KAFKA_CLIENT_ID;

/**
 * Partition the message is sent to.
 */
export const SEMATTRS_MESSAGING_KAFKA_PARTITION = TMP_MESSAGING_KAFKA_PARTITION;

/**
 * A boolean that is true if the message is a tombstone.
 */
export const SEMATTRS_MESSAGING_KAFKA_TOMBSTONE = TMP_MESSAGING_KAFKA_TOMBSTONE;

/**
 * A string identifying the remoting system.
 */
export const SEMATTRS_RPC_SYSTEM = TMP_RPC_SYSTEM;

/**
 * The full (logical) name of the service being called, including its package name, if applicable.
 *
 * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
 */
export const SEMATTRS_RPC_SERVICE = TMP_RPC_SERVICE;

/**
 * The name of the (logical) method being called, must be equal to the $method part in the span name.
 *
 * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
 */
export const SEMATTRS_RPC_METHOD = TMP_RPC_METHOD;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const SEMATTRS_RPC_GRPC_STATUS_CODE = TMP_RPC_GRPC_STATUS_CODE;

/**
 * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 does not specify this, the value can be omitted.
 */
export const SEMATTRS_RPC_JSONRPC_VERSION = TMP_RPC_JSONRPC_VERSION;

/**
 * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
 */
export const SEMATTRS_RPC_JSONRPC_REQUEST_ID = TMP_RPC_JSONRPC_REQUEST_ID;

/**
 * `error.code` property of response if it is an error response.
 */
export const SEMATTRS_RPC_JSONRPC_ERROR_CODE = TMP_RPC_JSONRPC_ERROR_CODE;

/**
 * `error.message` property of response if it is an error response.
 */
export const SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = TMP_RPC_JSONRPC_ERROR_MESSAGE;

/**
 * Whether this is a received or sent message.
 */
export const SEMATTRS_MESSAGE_TYPE = TMP_MESSAGE_TYPE;

/**
 * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
 *
 * Note: This way we guarantee that the values will be consistent between different implementations.
 */
export const SEMATTRS_MESSAGE_ID = TMP_MESSAGE_ID;

/**
 * Compressed size of the message in bytes.
 */
export const SEMATTRS_MESSAGE_COMPRESSED_SIZE = TMP_MESSAGE_COMPRESSED_SIZE;

/**
 * Uncompressed size of the message in bytes.
 */
export const SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE = TMP_MESSAGE_UNCOMPRESSED_SIZE;

/**
 * Definition of available values for SemanticAttributes
 * This type is used for backward compatibility, you should use the individual exported
 * constants SemanticAttributes_XXXXX rather than the exported constant map. As any single reference
 * to a constant map value will result in all strings being included into your bundle.
 * @deprecated Use the SEMATTRS_XXXXX constants rather than the SemanticAttributes.XXXXX for bundle minification.
 */
export type SemanticAttributes = {
  /**
   * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
   *
   * Note: This may be different from `faas.id` if an alias is involved.
   */
  AWS_LAMBDA_INVOKED_ARN: 'aws.lambda.invoked_arn';

  /**
   * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
   */
  DB_SYSTEM: 'db.system';

  /**
   * The connection string used to connect to the database. It is recommended to remove embedded credentials.
   */
  DB_CONNECTION_STRING: 'db.connection_string';

  /**
   * Username for accessing the database.
   */
  DB_USER: 'db.user';

  /**
   * The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
   */
  DB_JDBC_DRIVER_CLASSNAME: 'db.jdbc.driver_classname';

  /**
   * If no [tech-specific attribute](#call-level-attributes-for-specific-technologies) is defined, this attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
   *
   * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;.
   */
  DB_NAME: 'db.name';

  /**
   * The database statement being executed.
   *
   * Note: The value may be sanitized to exclude sensitive information.
   */
  DB_STATEMENT: 'db.statement';

  /**
   * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
   *
   * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
   */
  DB_OPERATION: 'db.operation';

  /**
   * The Microsoft SQL Server [instance name](https://docs.microsoft.com/en-us/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
   *
   * Note: If setting a `db.mssql.instance_name`, `net.peer.port` is no longer required (but still recommended if non-standard).
   */
  DB_MSSQL_INSTANCE_NAME: 'db.mssql.instance_name';

  /**
   * The name of the keyspace being accessed. To be used instead of the generic `db.name` attribute.
   */
  DB_CASSANDRA_KEYSPACE: 'db.cassandra.keyspace';

  /**
   * The fetch size used for paging, i.e. how many rows will be returned at once.
   */
  DB_CASSANDRA_PAGE_SIZE: 'db.cassandra.page_size';

  /**
   * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
   */
  DB_CASSANDRA_CONSISTENCY_LEVEL: 'db.cassandra.consistency_level';

  /**
   * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
   *
   * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
   */
  DB_CASSANDRA_TABLE: 'db.cassandra.table';

  /**
   * Whether or not the query is idempotent.
   */
  DB_CASSANDRA_IDEMPOTENCE: 'db.cassandra.idempotence';

  /**
   * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
   */
  DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT: 'db.cassandra.speculative_execution_count';

  /**
   * The ID of the coordinating node for a query.
   */
  DB_CASSANDRA_COORDINATOR_ID: 'db.cassandra.coordinator.id';

  /**
   * The data center of the coordinating node for a query.
   */
  DB_CASSANDRA_COORDINATOR_DC: 'db.cassandra.coordinator.dc';

  /**
   * The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed. To be used instead of the generic `db.name` attribute.
   */
  DB_HBASE_NAMESPACE: 'db.hbase.namespace';

  /**
   * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
   */
  DB_REDIS_DATABASE_INDEX: 'db.redis.database_index';

  /**
   * The collection being accessed within the database stated in `db.name`.
   */
  DB_MONGODB_COLLECTION: 'db.mongodb.collection';

  /**
   * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
   *
   * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
   */
  DB_SQL_TABLE: 'db.sql.table';

  /**
   * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
   */
  EXCEPTION_TYPE: 'exception.type';

  /**
   * The exception message.
   */
  EXCEPTION_MESSAGE: 'exception.message';

  /**
   * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
   */
  EXCEPTION_STACKTRACE: 'exception.stacktrace';

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
as done in the [example above](#exception-end-example).

It follows that an exception may still escape the scope of the span
even if the `exception.escaped` attribute was not set or set to false,
since the event might have been recorded at a time where it was not
clear whether the exception will escape.
  */
  EXCEPTION_ESCAPED: 'exception.escaped';

  /**
   * Type of the trigger on which the function is executed.
   */
  FAAS_TRIGGER: 'faas.trigger';

  /**
   * The execution ID of the current function execution.
   */
  FAAS_EXECUTION: 'faas.execution';

  /**
   * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
   */
  FAAS_DOCUMENT_COLLECTION: 'faas.document.collection';

  /**
   * Describes the type of the operation that was performed on the data.
   */
  FAAS_DOCUMENT_OPERATION: 'faas.document.operation';

  /**
   * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
   */
  FAAS_DOCUMENT_TIME: 'faas.document.time';

  /**
   * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
   */
  FAAS_DOCUMENT_NAME: 'faas.document.name';

  /**
   * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
   */
  FAAS_TIME: 'faas.time';

  /**
   * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
   */
  FAAS_CRON: 'faas.cron';

  /**
   * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
   */
  FAAS_COLDSTART: 'faas.coldstart';

  /**
   * The name of the invoked function.
   *
   * Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
   */
  FAAS_INVOKED_NAME: 'faas.invoked_name';

  /**
   * The cloud provider of the invoked function.
   *
   * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
   */
  FAAS_INVOKED_PROVIDER: 'faas.invoked_provider';

  /**
   * The cloud region of the invoked function.
   *
   * Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
   */
  FAAS_INVOKED_REGION: 'faas.invoked_region';

  /**
   * Transport protocol used. See note below.
   */
  NET_TRANSPORT: 'net.transport';

  /**
   * Remote address of the peer (dotted decimal for IPv4 or [RFC5952](https://tools.ietf.org/html/rfc5952) for IPv6).
   */
  NET_PEER_IP: 'net.peer.ip';

  /**
   * Remote port number.
   */
  NET_PEER_PORT: 'net.peer.port';

  /**
   * Remote hostname or similar, see note below.
   */
  NET_PEER_NAME: 'net.peer.name';

  /**
   * Like `net.peer.ip` but for the host IP. Useful in case of a multi-IP host.
   */
  NET_HOST_IP: 'net.host.ip';

  /**
   * Like `net.peer.port` but for the host port.
   */
  NET_HOST_PORT: 'net.host.port';

  /**
   * Local hostname or similar, see note below.
   */
  NET_HOST_NAME: 'net.host.name';

  /**
   * The internet connection type currently being used by the host.
   */
  NET_HOST_CONNECTION_TYPE: 'net.host.connection.type';

  /**
   * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
   */
  NET_HOST_CONNECTION_SUBTYPE: 'net.host.connection.subtype';

  /**
   * The name of the mobile carrier.
   */
  NET_HOST_CARRIER_NAME: 'net.host.carrier.name';

  /**
   * The mobile carrier country code.
   */
  NET_HOST_CARRIER_MCC: 'net.host.carrier.mcc';

  /**
   * The mobile carrier network code.
   */
  NET_HOST_CARRIER_MNC: 'net.host.carrier.mnc';

  /**
   * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
   */
  NET_HOST_CARRIER_ICC: 'net.host.carrier.icc';

  /**
   * The [`service.name`](../../resource/semantic_conventions/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
   */
  PEER_SERVICE: 'peer.service';

  /**
   * Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
   */
  ENDUSER_ID: 'enduser.id';

  /**
   * Actual/assumed role the client is making the request under extracted from token or application security context.
   */
  ENDUSER_ROLE: 'enduser.role';

  /**
   * Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
   */
  ENDUSER_SCOPE: 'enduser.scope';

  /**
   * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
   */
  THREAD_ID: 'thread.id';

  /**
   * Current thread name.
   */
  THREAD_NAME: 'thread.name';

  /**
   * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
   */
  CODE_FUNCTION: 'code.function';

  /**
   * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
   */
  CODE_NAMESPACE: 'code.namespace';

  /**
   * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
   */
  CODE_FILEPATH: 'code.filepath';

  /**
   * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
   */
  CODE_LINENO: 'code.lineno';

  /**
   * HTTP request method.
   */
  HTTP_METHOD: 'http.method';

  /**
   * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`. Usually the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
   *
   * Note: `http.url` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case the attribute&#39;s value should be `https://www.example.com/`.
   */
  HTTP_URL: 'http.url';

  /**
   * The full request target as passed in a HTTP request line or equivalent.
   */
  HTTP_TARGET: 'http.target';

  /**
   * The value of the [HTTP host header](https://tools.ietf.org/html/rfc7230#section-5.4). An empty Host header should also be reported, see note.
   *
   * Note: When the header is present but empty the attribute SHOULD be set to the empty string. Note that this is a valid situation that is expected in certain cases, according the aforementioned [section of RFC 7230](https://tools.ietf.org/html/rfc7230#section-5.4). When the header is not set the attribute MUST NOT be set.
   */
  HTTP_HOST: 'http.host';

  /**
   * The URI scheme identifying the used protocol.
   */
  HTTP_SCHEME: 'http.scheme';

  /**
   * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
   */
  HTTP_STATUS_CODE: 'http.status_code';

  /**
   * Kind of HTTP protocol used.
   *
   * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
   */
  HTTP_FLAVOR: 'http.flavor';

  /**
   * Value of the [HTTP User-Agent](https://tools.ietf.org/html/rfc7231#section-5.5.3) header sent by the client.
   */
  HTTP_USER_AGENT: 'http.user_agent';

  /**
   * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
   */
  HTTP_REQUEST_CONTENT_LENGTH: 'http.request_content_length';

  /**
   * The size of the uncompressed request payload body after transport decoding. Not set if transport encoding not used.
   */
  HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED: 'http.request_content_length_uncompressed';

  /**
   * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
   */
  HTTP_RESPONSE_CONTENT_LENGTH: 'http.response_content_length';

  /**
   * The size of the uncompressed response payload body after transport decoding. Not set if transport encoding not used.
   */
  HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED: 'http.response_content_length_uncompressed';

  /**
   * The primary server name of the matched virtual host. This should be obtained via configuration. If no such configuration can be obtained, this attribute MUST NOT be set ( `net.host.name` should be used instead).
   *
   * Note: `http.url` is usually not readily available on the server side but would have to be assembled in a cumbersome and sometimes lossy process from other information (see e.g. open-telemetry/opentelemetry-python/pull/148). It is thus preferred to supply the raw data that is available.
   */
  HTTP_SERVER_NAME: 'http.server_name';

  /**
   * The matched route (path template).
   */
  HTTP_ROUTE: 'http.route';

  /**
  * The IP address of the original client behind all proxies, if known (e.g. from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)).
  *
  * Note: This is not necessarily the same as `net.peer.ip`, which would
identify the network-level peer, which may be a proxy.

This attribute should be set when a source of information different
from the one used for `net.peer.ip`, is available even if that other
source just confirms the same value as `net.peer.ip`.
Rationale: For `net.peer.ip`, one typically does not know if it
comes from a proxy, reverse proxy, or the actual client. Setting
`http.client_ip` when it&#39;s the same as `net.peer.ip` means that
one is at least somewhat confident that the address is not that of
the closest proxy.
  */
  HTTP_CLIENT_IP: 'http.client_ip';

  /**
   * The keys in the `RequestItems` object field.
   */
  AWS_DYNAMODB_TABLE_NAMES: 'aws.dynamodb.table_names';

  /**
   * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
   */
  AWS_DYNAMODB_CONSUMED_CAPACITY: 'aws.dynamodb.consumed_capacity';

  /**
   * The JSON-serialized value of the `ItemCollectionMetrics` response field.
   */
  AWS_DYNAMODB_ITEM_COLLECTION_METRICS: 'aws.dynamodb.item_collection_metrics';

  /**
   * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
   */
  AWS_DYNAMODB_PROVISIONED_READ_CAPACITY: 'aws.dynamodb.provisioned_read_capacity';

  /**
   * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
   */
  AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY: 'aws.dynamodb.provisioned_write_capacity';

  /**
   * The value of the `ConsistentRead` request parameter.
   */
  AWS_DYNAMODB_CONSISTENT_READ: 'aws.dynamodb.consistent_read';

  /**
   * The value of the `ProjectionExpression` request parameter.
   */
  AWS_DYNAMODB_PROJECTION: 'aws.dynamodb.projection';

  /**
   * The value of the `Limit` request parameter.
   */
  AWS_DYNAMODB_LIMIT: 'aws.dynamodb.limit';

  /**
   * The value of the `AttributesToGet` request parameter.
   */
  AWS_DYNAMODB_ATTRIBUTES_TO_GET: 'aws.dynamodb.attributes_to_get';

  /**
   * The value of the `IndexName` request parameter.
   */
  AWS_DYNAMODB_INDEX_NAME: 'aws.dynamodb.index_name';

  /**
   * The value of the `Select` request parameter.
   */
  AWS_DYNAMODB_SELECT: 'aws.dynamodb.select';

  /**
   * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
   */
  AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES: 'aws.dynamodb.global_secondary_indexes';

  /**
   * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
   */
  AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES: 'aws.dynamodb.local_secondary_indexes';

  /**
   * The value of the `ExclusiveStartTableName` request parameter.
   */
  AWS_DYNAMODB_EXCLUSIVE_START_TABLE: 'aws.dynamodb.exclusive_start_table';

  /**
   * The the number of items in the `TableNames` response parameter.
   */
  AWS_DYNAMODB_TABLE_COUNT: 'aws.dynamodb.table_count';

  /**
   * The value of the `ScanIndexForward` request parameter.
   */
  AWS_DYNAMODB_SCAN_FORWARD: 'aws.dynamodb.scan_forward';

  /**
   * The value of the `Segment` request parameter.
   */
  AWS_DYNAMODB_SEGMENT: 'aws.dynamodb.segment';

  /**
   * The value of the `TotalSegments` request parameter.
   */
  AWS_DYNAMODB_TOTAL_SEGMENTS: 'aws.dynamodb.total_segments';

  /**
   * The value of the `Count` response parameter.
   */
  AWS_DYNAMODB_COUNT: 'aws.dynamodb.count';

  /**
   * The value of the `ScannedCount` response parameter.
   */
  AWS_DYNAMODB_SCANNED_COUNT: 'aws.dynamodb.scanned_count';

  /**
   * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
   */
  AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS: 'aws.dynamodb.attribute_definitions';

  /**
   * The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
   */
  AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES: 'aws.dynamodb.global_secondary_index_updates';

  /**
   * A string identifying the messaging system.
   */
  MESSAGING_SYSTEM: 'messaging.system';

  /**
   * The message destination name. This might be equal to the span name but is required nevertheless.
   */
  MESSAGING_DESTINATION: 'messaging.destination';

  /**
   * The kind of message destination.
   */
  MESSAGING_DESTINATION_KIND: 'messaging.destination_kind';

  /**
   * A boolean that is true if the message destination is temporary.
   */
  MESSAGING_TEMP_DESTINATION: 'messaging.temp_destination';

  /**
   * The name of the transport protocol.
   */
  MESSAGING_PROTOCOL: 'messaging.protocol';

  /**
   * The version of the transport protocol.
   */
  MESSAGING_PROTOCOL_VERSION: 'messaging.protocol_version';

  /**
   * Connection string.
   */
  MESSAGING_URL: 'messaging.url';

  /**
   * A value used by the messaging system as an identifier for the message, represented as a string.
   */
  MESSAGING_MESSAGE_ID: 'messaging.message_id';

  /**
   * The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
   */
  MESSAGING_CONVERSATION_ID: 'messaging.conversation_id';

  /**
   * The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
   */
  MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES: 'messaging.message_payload_size_bytes';

  /**
   * The compressed size of the message payload in bytes.
   */
  MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES: 'messaging.message_payload_compressed_size_bytes';

  /**
   * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
   */
  MESSAGING_OPERATION: 'messaging.operation';

  /**
   * The identifier for the consumer receiving a message. For Kafka, set it to `{messaging.kafka.consumer_group} - {messaging.kafka.client_id}`, if both are present, or only `messaging.kafka.consumer_group`. For brokers, such as RabbitMQ and Artemis, set it to the `client_id` of the client consuming the message.
   */
  MESSAGING_CONSUMER_ID: 'messaging.consumer_id';

  /**
   * RabbitMQ message routing key.
   */
  MESSAGING_RABBITMQ_ROUTING_KEY: 'messaging.rabbitmq.routing_key';

  /**
   * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message_id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
   *
   * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
   */
  MESSAGING_KAFKA_MESSAGE_KEY: 'messaging.kafka.message_key';

  /**
   * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
   */
  MESSAGING_KAFKA_CONSUMER_GROUP: 'messaging.kafka.consumer_group';

  /**
   * Client Id for the Consumer or Producer that is handling the message.
   */
  MESSAGING_KAFKA_CLIENT_ID: 'messaging.kafka.client_id';

  /**
   * Partition the message is sent to.
   */
  MESSAGING_KAFKA_PARTITION: 'messaging.kafka.partition';

  /**
   * A boolean that is true if the message is a tombstone.
   */
  MESSAGING_KAFKA_TOMBSTONE: 'messaging.kafka.tombstone';

  /**
   * A string identifying the remoting system.
   */
  RPC_SYSTEM: 'rpc.system';

  /**
   * The full (logical) name of the service being called, including its package name, if applicable.
   *
   * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
   */
  RPC_SERVICE: 'rpc.service';

  /**
   * The name of the (logical) method being called, must be equal to the $method part in the span name.
   *
   * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
   */
  RPC_METHOD: 'rpc.method';

  /**
   * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
   */
  RPC_GRPC_STATUS_CODE: 'rpc.grpc.status_code';

  /**
   * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 does not specify this, the value can be omitted.
   */
  RPC_JSONRPC_VERSION: 'rpc.jsonrpc.version';

  /**
   * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
   */
  RPC_JSONRPC_REQUEST_ID: 'rpc.jsonrpc.request_id';

  /**
   * `error.code` property of response if it is an error response.
   */
  RPC_JSONRPC_ERROR_CODE: 'rpc.jsonrpc.error_code';

  /**
   * `error.message` property of response if it is an error response.
   */
  RPC_JSONRPC_ERROR_MESSAGE: 'rpc.jsonrpc.error_message';

  /**
   * Whether this is a received or sent message.
   */
  MESSAGE_TYPE: 'message.type';

  /**
   * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
   *
   * Note: This way we guarantee that the values will be consistent between different implementations.
   */
  MESSAGE_ID: 'message.id';

  /**
   * Compressed size of the message in bytes.
   */
  MESSAGE_COMPRESSED_SIZE: 'message.compressed_size';

  /**
   * Uncompressed size of the message in bytes.
   */
  MESSAGE_UNCOMPRESSED_SIZE: 'message.uncompressed_size';
};

/**
 * Create exported Value Map for SemanticAttributes values
 * @deprecated Use the SEMATTRS_XXXXX constants rather than the SemanticAttributes.XXXXX for bundle minification
 */
export const SemanticAttributes: SemanticAttributes =
  /*#__PURE__*/ createConstMap<SemanticAttributes>([
    TMP_AWS_LAMBDA_INVOKED_ARN,
    TMP_DB_SYSTEM,
    TMP_DB_CONNECTION_STRING,
    TMP_DB_USER,
    TMP_DB_JDBC_DRIVER_CLASSNAME,
    TMP_DB_NAME,
    TMP_DB_STATEMENT,
    TMP_DB_OPERATION,
    TMP_DB_MSSQL_INSTANCE_NAME,
    TMP_DB_CASSANDRA_KEYSPACE,
    TMP_DB_CASSANDRA_PAGE_SIZE,
    TMP_DB_CASSANDRA_CONSISTENCY_LEVEL,
    TMP_DB_CASSANDRA_TABLE,
    TMP_DB_CASSANDRA_IDEMPOTENCE,
    TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT,
    TMP_DB_CASSANDRA_COORDINATOR_ID,
    TMP_DB_CASSANDRA_COORDINATOR_DC,
    TMP_DB_HBASE_NAMESPACE,
    TMP_DB_REDIS_DATABASE_INDEX,
    TMP_DB_MONGODB_COLLECTION,
    TMP_DB_SQL_TABLE,
    TMP_EXCEPTION_TYPE,
    TMP_EXCEPTION_MESSAGE,
    TMP_EXCEPTION_STACKTRACE,
    TMP_EXCEPTION_ESCAPED,
    TMP_FAAS_TRIGGER,
    TMP_FAAS_EXECUTION,
    TMP_FAAS_DOCUMENT_COLLECTION,
    TMP_FAAS_DOCUMENT_OPERATION,
    TMP_FAAS_DOCUMENT_TIME,
    TMP_FAAS_DOCUMENT_NAME,
    TMP_FAAS_TIME,
    TMP_FAAS_CRON,
    TMP_FAAS_COLDSTART,
    TMP_FAAS_INVOKED_NAME,
    TMP_FAAS_INVOKED_PROVIDER,
    TMP_FAAS_INVOKED_REGION,
    TMP_NET_TRANSPORT,
    TMP_NET_PEER_IP,
    TMP_NET_PEER_PORT,
    TMP_NET_PEER_NAME,
    TMP_NET_HOST_IP,
    TMP_NET_HOST_PORT,
    TMP_NET_HOST_NAME,
    TMP_NET_HOST_CONNECTION_TYPE,
    TMP_NET_HOST_CONNECTION_SUBTYPE,
    TMP_NET_HOST_CARRIER_NAME,
    TMP_NET_HOST_CARRIER_MCC,
    TMP_NET_HOST_CARRIER_MNC,
    TMP_NET_HOST_CARRIER_ICC,
    TMP_PEER_SERVICE,
    TMP_ENDUSER_ID,
    TMP_ENDUSER_ROLE,
    TMP_ENDUSER_SCOPE,
    TMP_THREAD_ID,
    TMP_THREAD_NAME,
    TMP_CODE_FUNCTION,
    TMP_CODE_NAMESPACE,
    TMP_CODE_FILEPATH,
    TMP_CODE_LINENO,
    TMP_HTTP_METHOD,
    TMP_HTTP_URL,
    TMP_HTTP_TARGET,
    TMP_HTTP_HOST,
    TMP_HTTP_SCHEME,
    TMP_HTTP_STATUS_CODE,
    TMP_HTTP_FLAVOR,
    TMP_HTTP_USER_AGENT,
    TMP_HTTP_REQUEST_CONTENT_LENGTH,
    TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
    TMP_HTTP_RESPONSE_CONTENT_LENGTH,
    TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
    TMP_HTTP_SERVER_NAME,
    TMP_HTTP_ROUTE,
    TMP_HTTP_CLIENT_IP,
    TMP_AWS_DYNAMODB_TABLE_NAMES,
    TMP_AWS_DYNAMODB_CONSUMED_CAPACITY,
    TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS,
    TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY,
    TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY,
    TMP_AWS_DYNAMODB_CONSISTENT_READ,
    TMP_AWS_DYNAMODB_PROJECTION,
    TMP_AWS_DYNAMODB_LIMIT,
    TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET,
    TMP_AWS_DYNAMODB_INDEX_NAME,
    TMP_AWS_DYNAMODB_SELECT,
    TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES,
    TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES,
    TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE,
    TMP_AWS_DYNAMODB_TABLE_COUNT,
    TMP_AWS_DYNAMODB_SCAN_FORWARD,
    TMP_AWS_DYNAMODB_SEGMENT,
    TMP_AWS_DYNAMODB_TOTAL_SEGMENTS,
    TMP_AWS_DYNAMODB_COUNT,
    TMP_AWS_DYNAMODB_SCANNED_COUNT,
    TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS,
    TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES,
    TMP_MESSAGING_SYSTEM,
    TMP_MESSAGING_DESTINATION,
    TMP_MESSAGING_DESTINATION_KIND,
    TMP_MESSAGING_TEMP_DESTINATION,
    TMP_MESSAGING_PROTOCOL,
    TMP_MESSAGING_PROTOCOL_VERSION,
    TMP_MESSAGING_URL,
    TMP_MESSAGING_MESSAGE_ID,
    TMP_MESSAGING_CONVERSATION_ID,
    TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES,
    TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES,
    TMP_MESSAGING_OPERATION,
    TMP_MESSAGING_CONSUMER_ID,
    TMP_MESSAGING_RABBITMQ_ROUTING_KEY,
    TMP_MESSAGING_KAFKA_MESSAGE_KEY,
    TMP_MESSAGING_KAFKA_CONSUMER_GROUP,
    TMP_MESSAGING_KAFKA_CLIENT_ID,
    TMP_MESSAGING_KAFKA_PARTITION,
    TMP_MESSAGING_KAFKA_TOMBSTONE,
    TMP_RPC_SYSTEM,
    TMP_RPC_SERVICE,
    TMP_RPC_METHOD,
    TMP_RPC_GRPC_STATUS_CODE,
    TMP_RPC_JSONRPC_VERSION,
    TMP_RPC_JSONRPC_REQUEST_ID,
    TMP_RPC_JSONRPC_ERROR_CODE,
    TMP_RPC_JSONRPC_ERROR_MESSAGE,
    TMP_MESSAGE_TYPE,
    TMP_MESSAGE_ID,
    TMP_MESSAGE_COMPRESSED_SIZE,
    TMP_MESSAGE_UNCOMPRESSED_SIZE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for DbSystemValues enum definition
 *
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_DBSYSTEMVALUES_OTHER_SQL = 'other_sql';
const TMP_DBSYSTEMVALUES_MSSQL = 'mssql';
const TMP_DBSYSTEMVALUES_MYSQL = 'mysql';
const TMP_DBSYSTEMVALUES_ORACLE = 'oracle';
const TMP_DBSYSTEMVALUES_DB2 = 'db2';
const TMP_DBSYSTEMVALUES_POSTGRESQL = 'postgresql';
const TMP_DBSYSTEMVALUES_REDSHIFT = 'redshift';
const TMP_DBSYSTEMVALUES_HIVE = 'hive';
const TMP_DBSYSTEMVALUES_CLOUDSCAPE = 'cloudscape';
const TMP_DBSYSTEMVALUES_HSQLDB = 'hsqldb';
const TMP_DBSYSTEMVALUES_PROGRESS = 'progress';
const TMP_DBSYSTEMVALUES_MAXDB = 'maxdb';
const TMP_DBSYSTEMVALUES_HANADB = 'hanadb';
const TMP_DBSYSTEMVALUES_INGRES = 'ingres';
const TMP_DBSYSTEMVALUES_FIRSTSQL = 'firstsql';
const TMP_DBSYSTEMVALUES_EDB = 'edb';
const TMP_DBSYSTEMVALUES_CACHE = 'cache';
const TMP_DBSYSTEMVALUES_ADABAS = 'adabas';
const TMP_DBSYSTEMVALUES_FIREBIRD = 'firebird';
const TMP_DBSYSTEMVALUES_DERBY = 'derby';
const TMP_DBSYSTEMVALUES_FILEMAKER = 'filemaker';
const TMP_DBSYSTEMVALUES_INFORMIX = 'informix';
const TMP_DBSYSTEMVALUES_INSTANTDB = 'instantdb';
const TMP_DBSYSTEMVALUES_INTERBASE = 'interbase';
const TMP_DBSYSTEMVALUES_MARIADB = 'mariadb';
const TMP_DBSYSTEMVALUES_NETEZZA = 'netezza';
const TMP_DBSYSTEMVALUES_PERVASIVE = 'pervasive';
const TMP_DBSYSTEMVALUES_POINTBASE = 'pointbase';
const TMP_DBSYSTEMVALUES_SQLITE = 'sqlite';
const TMP_DBSYSTEMVALUES_SYBASE = 'sybase';
const TMP_DBSYSTEMVALUES_TERADATA = 'teradata';
const TMP_DBSYSTEMVALUES_VERTICA = 'vertica';
const TMP_DBSYSTEMVALUES_H2 = 'h2';
const TMP_DBSYSTEMVALUES_COLDFUSION = 'coldfusion';
const TMP_DBSYSTEMVALUES_CASSANDRA = 'cassandra';
const TMP_DBSYSTEMVALUES_HBASE = 'hbase';
const TMP_DBSYSTEMVALUES_MONGODB = 'mongodb';
const TMP_DBSYSTEMVALUES_REDIS = 'redis';
const TMP_DBSYSTEMVALUES_COUCHBASE = 'couchbase';
const TMP_DBSYSTEMVALUES_COUCHDB = 'couchdb';
const TMP_DBSYSTEMVALUES_COSMOSDB = 'cosmosdb';
const TMP_DBSYSTEMVALUES_DYNAMODB = 'dynamodb';
const TMP_DBSYSTEMVALUES_NEO4J = 'neo4j';
const TMP_DBSYSTEMVALUES_GEODE = 'geode';
const TMP_DBSYSTEMVALUES_ELASTICSEARCH = 'elasticsearch';
const TMP_DBSYSTEMVALUES_MEMCACHED = 'memcached';
const TMP_DBSYSTEMVALUES_COCKROACHDB = 'cockroachdb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_OTHER_SQL = TMP_DBSYSTEMVALUES_OTHER_SQL;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MSSQL = TMP_DBSYSTEMVALUES_MSSQL;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MYSQL = TMP_DBSYSTEMVALUES_MYSQL;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_ORACLE = TMP_DBSYSTEMVALUES_ORACLE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_DB2 = TMP_DBSYSTEMVALUES_DB2;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_POSTGRESQL = TMP_DBSYSTEMVALUES_POSTGRESQL;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_REDSHIFT = TMP_DBSYSTEMVALUES_REDSHIFT;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_HIVE = TMP_DBSYSTEMVALUES_HIVE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_CLOUDSCAPE = TMP_DBSYSTEMVALUES_CLOUDSCAPE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_HSQLDB = TMP_DBSYSTEMVALUES_HSQLDB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_PROGRESS = TMP_DBSYSTEMVALUES_PROGRESS;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MAXDB = TMP_DBSYSTEMVALUES_MAXDB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_HANADB = TMP_DBSYSTEMVALUES_HANADB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_INGRES = TMP_DBSYSTEMVALUES_INGRES;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_FIRSTSQL = TMP_DBSYSTEMVALUES_FIRSTSQL;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_EDB = TMP_DBSYSTEMVALUES_EDB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_CACHE = TMP_DBSYSTEMVALUES_CACHE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_ADABAS = TMP_DBSYSTEMVALUES_ADABAS;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_FIREBIRD = TMP_DBSYSTEMVALUES_FIREBIRD;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_DERBY = TMP_DBSYSTEMVALUES_DERBY;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_FILEMAKER = TMP_DBSYSTEMVALUES_FILEMAKER;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_INFORMIX = TMP_DBSYSTEMVALUES_INFORMIX;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_INSTANTDB = TMP_DBSYSTEMVALUES_INSTANTDB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_INTERBASE = TMP_DBSYSTEMVALUES_INTERBASE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MARIADB = TMP_DBSYSTEMVALUES_MARIADB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_NETEZZA = TMP_DBSYSTEMVALUES_NETEZZA;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_PERVASIVE = TMP_DBSYSTEMVALUES_PERVASIVE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_POINTBASE = TMP_DBSYSTEMVALUES_POINTBASE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_SQLITE = TMP_DBSYSTEMVALUES_SQLITE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_SYBASE = TMP_DBSYSTEMVALUES_SYBASE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_TERADATA = TMP_DBSYSTEMVALUES_TERADATA;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_VERTICA = TMP_DBSYSTEMVALUES_VERTICA;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_H2 = TMP_DBSYSTEMVALUES_H2;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COLDFUSION = TMP_DBSYSTEMVALUES_COLDFUSION;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_CASSANDRA = TMP_DBSYSTEMVALUES_CASSANDRA;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_HBASE = TMP_DBSYSTEMVALUES_HBASE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MONGODB = TMP_DBSYSTEMVALUES_MONGODB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_REDIS = TMP_DBSYSTEMVALUES_REDIS;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COUCHBASE = TMP_DBSYSTEMVALUES_COUCHBASE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COUCHDB = TMP_DBSYSTEMVALUES_COUCHDB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COSMOSDB = TMP_DBSYSTEMVALUES_COSMOSDB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_DYNAMODB = TMP_DBSYSTEMVALUES_DYNAMODB;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_NEO4J = TMP_DBSYSTEMVALUES_NEO4J;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_GEODE = TMP_DBSYSTEMVALUES_GEODE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_ELASTICSEARCH = TMP_DBSYSTEMVALUES_ELASTICSEARCH;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MEMCACHED = TMP_DBSYSTEMVALUES_MEMCACHED;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COCKROACHDB = TMP_DBSYSTEMVALUES_COCKROACHDB;

/**
 * Identifies the Values for DbSystemValues enum definition
 *
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 * @deprecated Use the DBSYSTEMVALUES_XXXXX constants rather than the DbSystemValues.XXXXX for bundle minification.
 */
export type DbSystemValues = {
  /** Some other SQL database. Fallback only. See notes. */
  OTHER_SQL: 'other_sql';

  /** Microsoft SQL Server. */
  MSSQL: 'mssql';

  /** MySQL. */
  MYSQL: 'mysql';

  /** Oracle Database. */
  ORACLE: 'oracle';

  /** IBM Db2. */
  DB2: 'db2';

  /** PostgreSQL. */
  POSTGRESQL: 'postgresql';

  /** Amazon Redshift. */
  REDSHIFT: 'redshift';

  /** Apache Hive. */
  HIVE: 'hive';

  /** Cloudscape. */
  CLOUDSCAPE: 'cloudscape';

  /** HyperSQL DataBase. */
  HSQLDB: 'hsqldb';

  /** Progress Database. */
  PROGRESS: 'progress';

  /** SAP MaxDB. */
  MAXDB: 'maxdb';

  /** SAP HANA. */
  HANADB: 'hanadb';

  /** Ingres. */
  INGRES: 'ingres';

  /** FirstSQL. */
  FIRSTSQL: 'firstsql';

  /** EnterpriseDB. */
  EDB: 'edb';

  /** InterSystems Caché. */
  CACHE: 'cache';

  /** Adabas (Adaptable Database System). */
  ADABAS: 'adabas';

  /** Firebird. */
  FIREBIRD: 'firebird';

  /** Apache Derby. */
  DERBY: 'derby';

  /** FileMaker. */
  FILEMAKER: 'filemaker';

  /** Informix. */
  INFORMIX: 'informix';

  /** InstantDB. */
  INSTANTDB: 'instantdb';

  /** InterBase. */
  INTERBASE: 'interbase';

  /** MariaDB. */
  MARIADB: 'mariadb';

  /** Netezza. */
  NETEZZA: 'netezza';

  /** Pervasive PSQL. */
  PERVASIVE: 'pervasive';

  /** PointBase. */
  POINTBASE: 'pointbase';

  /** SQLite. */
  SQLITE: 'sqlite';

  /** Sybase. */
  SYBASE: 'sybase';

  /** Teradata. */
  TERADATA: 'teradata';

  /** Vertica. */
  VERTICA: 'vertica';

  /** H2. */
  H2: 'h2';

  /** ColdFusion IMQ. */
  COLDFUSION: 'coldfusion';

  /** Apache Cassandra. */
  CASSANDRA: 'cassandra';

  /** Apache HBase. */
  HBASE: 'hbase';

  /** MongoDB. */
  MONGODB: 'mongodb';

  /** Redis. */
  REDIS: 'redis';

  /** Couchbase. */
  COUCHBASE: 'couchbase';

  /** CouchDB. */
  COUCHDB: 'couchdb';

  /** Microsoft Azure Cosmos DB. */
  COSMOSDB: 'cosmosdb';

  /** Amazon DynamoDB. */
  DYNAMODB: 'dynamodb';

  /** Neo4j. */
  NEO4J: 'neo4j';

  /** Apache Geode. */
  GEODE: 'geode';

  /** Elasticsearch. */
  ELASTICSEARCH: 'elasticsearch';

  /** Memcached. */
  MEMCACHED: 'memcached';

  /** CockroachDB. */
  COCKROACHDB: 'cockroachdb';
};

/**
 * The constant map of values for DbSystemValues.
 * @deprecated Use the DBSYSTEMVALUES_XXXXX constants rather than the DbSystemValues.XXXXX for bundle minification.
 */
export const DbSystemValues: DbSystemValues =
  /*#__PURE__*/ createConstMap<DbSystemValues>([
    TMP_DBSYSTEMVALUES_OTHER_SQL,
    TMP_DBSYSTEMVALUES_MSSQL,
    TMP_DBSYSTEMVALUES_MYSQL,
    TMP_DBSYSTEMVALUES_ORACLE,
    TMP_DBSYSTEMVALUES_DB2,
    TMP_DBSYSTEMVALUES_POSTGRESQL,
    TMP_DBSYSTEMVALUES_REDSHIFT,
    TMP_DBSYSTEMVALUES_HIVE,
    TMP_DBSYSTEMVALUES_CLOUDSCAPE,
    TMP_DBSYSTEMVALUES_HSQLDB,
    TMP_DBSYSTEMVALUES_PROGRESS,
    TMP_DBSYSTEMVALUES_MAXDB,
    TMP_DBSYSTEMVALUES_HANADB,
    TMP_DBSYSTEMVALUES_INGRES,
    TMP_DBSYSTEMVALUES_FIRSTSQL,
    TMP_DBSYSTEMVALUES_EDB,
    TMP_DBSYSTEMVALUES_CACHE,
    TMP_DBSYSTEMVALUES_ADABAS,
    TMP_DBSYSTEMVALUES_FIREBIRD,
    TMP_DBSYSTEMVALUES_DERBY,
    TMP_DBSYSTEMVALUES_FILEMAKER,
    TMP_DBSYSTEMVALUES_INFORMIX,
    TMP_DBSYSTEMVALUES_INSTANTDB,
    TMP_DBSYSTEMVALUES_INTERBASE,
    TMP_DBSYSTEMVALUES_MARIADB,
    TMP_DBSYSTEMVALUES_NETEZZA,
    TMP_DBSYSTEMVALUES_PERVASIVE,
    TMP_DBSYSTEMVALUES_POINTBASE,
    TMP_DBSYSTEMVALUES_SQLITE,
    TMP_DBSYSTEMVALUES_SYBASE,
    TMP_DBSYSTEMVALUES_TERADATA,
    TMP_DBSYSTEMVALUES_VERTICA,
    TMP_DBSYSTEMVALUES_H2,
    TMP_DBSYSTEMVALUES_COLDFUSION,
    TMP_DBSYSTEMVALUES_CASSANDRA,
    TMP_DBSYSTEMVALUES_HBASE,
    TMP_DBSYSTEMVALUES_MONGODB,
    TMP_DBSYSTEMVALUES_REDIS,
    TMP_DBSYSTEMVALUES_COUCHBASE,
    TMP_DBSYSTEMVALUES_COUCHDB,
    TMP_DBSYSTEMVALUES_COSMOSDB,
    TMP_DBSYSTEMVALUES_DYNAMODB,
    TMP_DBSYSTEMVALUES_NEO4J,
    TMP_DBSYSTEMVALUES_GEODE,
    TMP_DBSYSTEMVALUES_ELASTICSEARCH,
    TMP_DBSYSTEMVALUES_MEMCACHED,
    TMP_DBSYSTEMVALUES_COCKROACHDB,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for DbCassandraConsistencyLevelValues enum definition
 *
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL = 'all';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = 'each_quorum';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = 'quorum';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = 'local_quorum';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE = 'one';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO = 'two';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE = 'three';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = 'local_one';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY = 'any';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = 'serial';
const TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = 'local_serial';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_ALL =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_ONE =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_TWO =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_THREE =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_ANY =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL =
  TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL;

/**
 * Identifies the Values for DbCassandraConsistencyLevelValues enum definition
 *
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 * @deprecated Use the DBCASSANDRACONSISTENCYLEVELVALUES_XXXXX constants rather than the DbCassandraConsistencyLevelValues.XXXXX for bundle minification.
 */
export type DbCassandraConsistencyLevelValues = {
  /** all. */
  ALL: 'all';

  /** each_quorum. */
  EACH_QUORUM: 'each_quorum';

  /** quorum. */
  QUORUM: 'quorum';

  /** local_quorum. */
  LOCAL_QUORUM: 'local_quorum';

  /** one. */
  ONE: 'one';

  /** two. */
  TWO: 'two';

  /** three. */
  THREE: 'three';

  /** local_one. */
  LOCAL_ONE: 'local_one';

  /** any. */
  ANY: 'any';

  /** serial. */
  SERIAL: 'serial';

  /** local_serial. */
  LOCAL_SERIAL: 'local_serial';
};

/**
 * The constant map of values for DbCassandraConsistencyLevelValues.
 * @deprecated Use the DBCASSANDRACONSISTENCYLEVELVALUES_XXXXX constants rather than the DbCassandraConsistencyLevelValues.XXXXX for bundle minification.
 */
export const DbCassandraConsistencyLevelValues: DbCassandraConsistencyLevelValues =
  /*#__PURE__*/ createConstMap<DbCassandraConsistencyLevelValues>([
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL,
    TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for FaasTriggerValues enum definition
 *
 * Type of the trigger on which the function is executed.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_FAASTRIGGERVALUES_DATASOURCE = 'datasource';
const TMP_FAASTRIGGERVALUES_HTTP = 'http';
const TMP_FAASTRIGGERVALUES_PUBSUB = 'pubsub';
const TMP_FAASTRIGGERVALUES_TIMER = 'timer';
const TMP_FAASTRIGGERVALUES_OTHER = 'other';

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_DATASOURCE = TMP_FAASTRIGGERVALUES_DATASOURCE;

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_HTTP = TMP_FAASTRIGGERVALUES_HTTP;

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_PUBSUB = TMP_FAASTRIGGERVALUES_PUBSUB;

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_TIMER = TMP_FAASTRIGGERVALUES_TIMER;

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_OTHER = TMP_FAASTRIGGERVALUES_OTHER;

/**
 * Identifies the Values for FaasTriggerValues enum definition
 *
 * Type of the trigger on which the function is executed.
 * @deprecated Use the FAASTRIGGERVALUES_XXXXX constants rather than the FaasTriggerValues.XXXXX for bundle minification.
 */
export type FaasTriggerValues = {
  /** A response to some data source operation such as a database or filesystem read/write. */
  DATASOURCE: 'datasource';

  /** To provide an answer to an inbound HTTP request. */
  HTTP: 'http';

  /** A function is set to be executed when messages are sent to a messaging system. */
  PUBSUB: 'pubsub';

  /** A function is scheduled to be executed regularly. */
  TIMER: 'timer';

  /** If none of the others apply. */
  OTHER: 'other';
};

/**
 * The constant map of values for FaasTriggerValues.
 * @deprecated Use the FAASTRIGGERVALUES_XXXXX constants rather than the FaasTriggerValues.XXXXX for bundle minification.
 */
export const FaasTriggerValues: FaasTriggerValues =
  /*#__PURE__*/ createConstMap<FaasTriggerValues>([
    TMP_FAASTRIGGERVALUES_DATASOURCE,
    TMP_FAASTRIGGERVALUES_HTTP,
    TMP_FAASTRIGGERVALUES_PUBSUB,
    TMP_FAASTRIGGERVALUES_TIMER,
    TMP_FAASTRIGGERVALUES_OTHER,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for FaasDocumentOperationValues enum definition
 *
 * Describes the type of the operation that was performed on the data.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_FAASDOCUMENTOPERATIONVALUES_INSERT = 'insert';
const TMP_FAASDOCUMENTOPERATIONVALUES_EDIT = 'edit';
const TMP_FAASDOCUMENTOPERATIONVALUES_DELETE = 'delete';

/**
 * Describes the type of the operation that was performed on the data.
 */
export const FAASDOCUMENTOPERATIONVALUES_INSERT =
  TMP_FAASDOCUMENTOPERATIONVALUES_INSERT;

/**
 * Describes the type of the operation that was performed on the data.
 */
export const FAASDOCUMENTOPERATIONVALUES_EDIT =
  TMP_FAASDOCUMENTOPERATIONVALUES_EDIT;

/**
 * Describes the type of the operation that was performed on the data.
 */
export const FAASDOCUMENTOPERATIONVALUES_DELETE =
  TMP_FAASDOCUMENTOPERATIONVALUES_DELETE;

/**
 * Identifies the Values for FaasDocumentOperationValues enum definition
 *
 * Describes the type of the operation that was performed on the data.
 * @deprecated Use the FAASDOCUMENTOPERATIONVALUES_XXXXX constants rather than the FaasDocumentOperationValues.XXXXX for bundle minification.
 */
export type FaasDocumentOperationValues = {
  /** When a new object is created. */
  INSERT: 'insert';

  /** When an object is modified. */
  EDIT: 'edit';

  /** When an object is deleted. */
  DELETE: 'delete';
};

/**
 * The constant map of values for FaasDocumentOperationValues.
 * @deprecated Use the FAASDOCUMENTOPERATIONVALUES_XXXXX constants rather than the FaasDocumentOperationValues.XXXXX for bundle minification.
 */
export const FaasDocumentOperationValues: FaasDocumentOperationValues =
  /*#__PURE__*/ createConstMap<FaasDocumentOperationValues>([
    TMP_FAASDOCUMENTOPERATIONVALUES_INSERT,
    TMP_FAASDOCUMENTOPERATIONVALUES_EDIT,
    TMP_FAASDOCUMENTOPERATIONVALUES_DELETE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for FaasInvokedProviderValues enum definition
 *
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = 'alibaba_cloud';
const TMP_FAASINVOKEDPROVIDERVALUES_AWS = 'aws';
const TMP_FAASINVOKEDPROVIDERVALUES_AZURE = 'azure';
const TMP_FAASINVOKEDPROVIDERVALUES_GCP = 'gcp';

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD =
  TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD;

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_AWS = TMP_FAASINVOKEDPROVIDERVALUES_AWS;

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_AZURE =
  TMP_FAASINVOKEDPROVIDERVALUES_AZURE;

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_GCP = TMP_FAASINVOKEDPROVIDERVALUES_GCP;

/**
 * Identifies the Values for FaasInvokedProviderValues enum definition
 *
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 * @deprecated Use the FAASINVOKEDPROVIDERVALUES_XXXXX constants rather than the FaasInvokedProviderValues.XXXXX for bundle minification.
 */
export type FaasInvokedProviderValues = {
  /** Alibaba Cloud. */
  ALIBABA_CLOUD: 'alibaba_cloud';

  /** Amazon Web Services. */
  AWS: 'aws';

  /** Microsoft Azure. */
  AZURE: 'azure';

  /** Google Cloud Platform. */
  GCP: 'gcp';
};

/**
 * The constant map of values for FaasInvokedProviderValues.
 * @deprecated Use the FAASINVOKEDPROVIDERVALUES_XXXXX constants rather than the FaasInvokedProviderValues.XXXXX for bundle minification.
 */
export const FaasInvokedProviderValues: FaasInvokedProviderValues =
  /*#__PURE__*/ createConstMap<FaasInvokedProviderValues>([
    TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD,
    TMP_FAASINVOKEDPROVIDERVALUES_AWS,
    TMP_FAASINVOKEDPROVIDERVALUES_AZURE,
    TMP_FAASINVOKEDPROVIDERVALUES_GCP,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetTransportValues enum definition
 *
 * Transport protocol used. See note below.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_NETTRANSPORTVALUES_IP_TCP = 'ip_tcp';
const TMP_NETTRANSPORTVALUES_IP_UDP = 'ip_udp';
const TMP_NETTRANSPORTVALUES_IP = 'ip';
const TMP_NETTRANSPORTVALUES_UNIX = 'unix';
const TMP_NETTRANSPORTVALUES_PIPE = 'pipe';
const TMP_NETTRANSPORTVALUES_INPROC = 'inproc';
const TMP_NETTRANSPORTVALUES_OTHER = 'other';

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_IP_TCP = TMP_NETTRANSPORTVALUES_IP_TCP;

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_IP_UDP = TMP_NETTRANSPORTVALUES_IP_UDP;

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_IP = TMP_NETTRANSPORTVALUES_IP;

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_UNIX = TMP_NETTRANSPORTVALUES_UNIX;

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_PIPE = TMP_NETTRANSPORTVALUES_PIPE;

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_INPROC = TMP_NETTRANSPORTVALUES_INPROC;

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_OTHER = TMP_NETTRANSPORTVALUES_OTHER;

/**
 * Identifies the Values for NetTransportValues enum definition
 *
 * Transport protocol used. See note below.
 * @deprecated Use the NETTRANSPORTVALUES_XXXXX constants rather than the NetTransportValues.XXXXX for bundle minification.
 */
export type NetTransportValues = {
  /** ip_tcp. */
  IP_TCP: 'ip_tcp';

  /** ip_udp. */
  IP_UDP: 'ip_udp';

  /** Another IP-based protocol. */
  IP: 'ip';

  /** Unix Domain socket. See below. */
  UNIX: 'unix';

  /** Named or anonymous pipe. See note below. */
  PIPE: 'pipe';

  /** In-process communication. */
  INPROC: 'inproc';

  /** Something else (non IP-based). */
  OTHER: 'other';
};

/**
 * The constant map of values for NetTransportValues.
 * @deprecated Use the NETTRANSPORTVALUES_XXXXX constants rather than the NetTransportValues.XXXXX for bundle minification.
 */
export const NetTransportValues: NetTransportValues =
  /*#__PURE__*/ createConstMap<NetTransportValues>([
    TMP_NETTRANSPORTVALUES_IP_TCP,
    TMP_NETTRANSPORTVALUES_IP_UDP,
    TMP_NETTRANSPORTVALUES_IP,
    TMP_NETTRANSPORTVALUES_UNIX,
    TMP_NETTRANSPORTVALUES_PIPE,
    TMP_NETTRANSPORTVALUES_INPROC,
    TMP_NETTRANSPORTVALUES_OTHER,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetHostConnectionTypeValues enum definition
 *
 * The internet connection type currently being used by the host.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI = 'wifi';
const TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED = 'wired';
const TMP_NETHOSTCONNECTIONTYPEVALUES_CELL = 'cell';
const TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = 'unavailable';
const TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = 'unknown';

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_WIFI =
  TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI;

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_WIRED =
  TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED;

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_CELL =
  TMP_NETHOSTCONNECTIONTYPEVALUES_CELL;

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE =
  TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE;

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_UNKNOWN =
  TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN;

/**
 * Identifies the Values for NetHostConnectionTypeValues enum definition
 *
 * The internet connection type currently being used by the host.
 * @deprecated Use the NETHOSTCONNECTIONTYPEVALUES_XXXXX constants rather than the NetHostConnectionTypeValues.XXXXX for bundle minification.
 */
export type NetHostConnectionTypeValues = {
  /** wifi. */
  WIFI: 'wifi';

  /** wired. */
  WIRED: 'wired';

  /** cell. */
  CELL: 'cell';

  /** unavailable. */
  UNAVAILABLE: 'unavailable';

  /** unknown. */
  UNKNOWN: 'unknown';
};

/**
 * The constant map of values for NetHostConnectionTypeValues.
 * @deprecated Use the NETHOSTCONNECTIONTYPEVALUES_XXXXX constants rather than the NetHostConnectionTypeValues.XXXXX for bundle minification.
 */
export const NetHostConnectionTypeValues: NetHostConnectionTypeValues =
  /*#__PURE__*/ createConstMap<NetHostConnectionTypeValues>([
    TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI,
    TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED,
    TMP_NETHOSTCONNECTIONTYPEVALUES_CELL,
    TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE,
    TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetHostConnectionSubtypeValues enum definition
 *
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = 'gprs';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = 'edge';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = 'umts';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = 'cdma';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = 'evdo_0';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = 'evdo_a';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = 'cdma2000_1xrtt';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = 'hsdpa';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = 'hsupa';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = 'hspa';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = 'iden';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = 'evdo_b';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE = 'lte';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = 'ehrpd';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = 'hspap';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM = 'gsm';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = 'td_scdma';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = 'iwlan';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR = 'nr';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = 'nrnsa';
const TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = 'lte_ca';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_GPRS =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EDGE =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_UMTS =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_CDMA =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_HSPA =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_IDEN =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_LTE =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_GSM =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_NR =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA =
  TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA;

/**
 * Identifies the Values for NetHostConnectionSubtypeValues enum definition
 *
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 * @deprecated Use the NETHOSTCONNECTIONSUBTYPEVALUES_XXXXX constants rather than the NetHostConnectionSubtypeValues.XXXXX for bundle minification.
 */
export type NetHostConnectionSubtypeValues = {
  /** GPRS. */
  GPRS: 'gprs';

  /** EDGE. */
  EDGE: 'edge';

  /** UMTS. */
  UMTS: 'umts';

  /** CDMA. */
  CDMA: 'cdma';

  /** EVDO Rel. 0. */
  EVDO_0: 'evdo_0';

  /** EVDO Rev. A. */
  EVDO_A: 'evdo_a';

  /** CDMA2000 1XRTT. */
  CDMA2000_1XRTT: 'cdma2000_1xrtt';

  /** HSDPA. */
  HSDPA: 'hsdpa';

  /** HSUPA. */
  HSUPA: 'hsupa';

  /** HSPA. */
  HSPA: 'hspa';

  /** IDEN. */
  IDEN: 'iden';

  /** EVDO Rev. B. */
  EVDO_B: 'evdo_b';

  /** LTE. */
  LTE: 'lte';

  /** EHRPD. */
  EHRPD: 'ehrpd';

  /** HSPAP. */
  HSPAP: 'hspap';

  /** GSM. */
  GSM: 'gsm';

  /** TD-SCDMA. */
  TD_SCDMA: 'td_scdma';

  /** IWLAN. */
  IWLAN: 'iwlan';

  /** 5G NR (New Radio). */
  NR: 'nr';

  /** 5G NRNSA (New Radio Non-Standalone). */
  NRNSA: 'nrnsa';

  /** LTE CA. */
  LTE_CA: 'lte_ca';
};

/**
 * The constant map of values for NetHostConnectionSubtypeValues.
 * @deprecated Use the NETHOSTCONNECTIONSUBTYPEVALUES_XXXXX constants rather than the NetHostConnectionSubtypeValues.XXXXX for bundle minification.
 */
export const NetHostConnectionSubtypeValues: NetHostConnectionSubtypeValues =
  /*#__PURE__*/ createConstMap<NetHostConnectionSubtypeValues>([
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA,
    TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for HttpFlavorValues enum definition
 *
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_HTTPFLAVORVALUES_HTTP_1_0 = '1.0';
const TMP_HTTPFLAVORVALUES_HTTP_1_1 = '1.1';
const TMP_HTTPFLAVORVALUES_HTTP_2_0 = '2.0';
const TMP_HTTPFLAVORVALUES_SPDY = 'SPDY';
const TMP_HTTPFLAVORVALUES_QUIC = 'QUIC';

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_HTTP_1_0 = TMP_HTTPFLAVORVALUES_HTTP_1_0;

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_HTTP_1_1 = TMP_HTTPFLAVORVALUES_HTTP_1_1;

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_HTTP_2_0 = TMP_HTTPFLAVORVALUES_HTTP_2_0;

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_SPDY = TMP_HTTPFLAVORVALUES_SPDY;

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_QUIC = TMP_HTTPFLAVORVALUES_QUIC;

/**
 * Identifies the Values for HttpFlavorValues enum definition
 *
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 * @deprecated Use the HTTPFLAVORVALUES_XXXXX constants rather than the HttpFlavorValues.XXXXX for bundle minification.
 */
export type HttpFlavorValues = {
  /** HTTP 1.0. */
  HTTP_1_0: '1.0';

  /** HTTP 1.1. */
  HTTP_1_1: '1.1';

  /** HTTP 2. */
  HTTP_2_0: '2.0';

  /** SPDY protocol. */
  SPDY: 'SPDY';

  /** QUIC protocol. */
  QUIC: 'QUIC';
};

/**
 * The constant map of values for HttpFlavorValues.
 * @deprecated Use the HTTPFLAVORVALUES_XXXXX constants rather than the HttpFlavorValues.XXXXX for bundle minification.
 */
export const HttpFlavorValues: HttpFlavorValues = {
  HTTP_1_0: TMP_HTTPFLAVORVALUES_HTTP_1_0,
  HTTP_1_1: TMP_HTTPFLAVORVALUES_HTTP_1_1,
  HTTP_2_0: TMP_HTTPFLAVORVALUES_HTTP_2_0,
  SPDY: TMP_HTTPFLAVORVALUES_SPDY,
  QUIC: TMP_HTTPFLAVORVALUES_QUIC,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingDestinationKindValues enum definition
 *
 * The kind of message destination.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE = 'queue';
const TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC = 'topic';

/**
 * The kind of message destination.
 */
export const MESSAGINGDESTINATIONKINDVALUES_QUEUE =
  TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE;

/**
 * The kind of message destination.
 */
export const MESSAGINGDESTINATIONKINDVALUES_TOPIC =
  TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC;

/**
 * Identifies the Values for MessagingDestinationKindValues enum definition
 *
 * The kind of message destination.
 * @deprecated Use the MESSAGINGDESTINATIONKINDVALUES_XXXXX constants rather than the MessagingDestinationKindValues.XXXXX for bundle minification.
 */
export type MessagingDestinationKindValues = {
  /** A message sent to a queue. */
  QUEUE: 'queue';

  /** A message sent to a topic. */
  TOPIC: 'topic';
};

/**
 * The constant map of values for MessagingDestinationKindValues.
 * @deprecated Use the MESSAGINGDESTINATIONKINDVALUES_XXXXX constants rather than the MessagingDestinationKindValues.XXXXX for bundle minification.
 */
export const MessagingDestinationKindValues: MessagingDestinationKindValues =
  /*#__PURE__*/ createConstMap<MessagingDestinationKindValues>([
    TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE,
    TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingOperationValues enum definition
 *
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_MESSAGINGOPERATIONVALUES_RECEIVE = 'receive';
const TMP_MESSAGINGOPERATIONVALUES_PROCESS = 'process';

/**
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 */
export const MESSAGINGOPERATIONVALUES_RECEIVE =
  TMP_MESSAGINGOPERATIONVALUES_RECEIVE;

/**
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 */
export const MESSAGINGOPERATIONVALUES_PROCESS =
  TMP_MESSAGINGOPERATIONVALUES_PROCESS;

/**
 * Identifies the Values for MessagingOperationValues enum definition
 *
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 * @deprecated Use the MESSAGINGOPERATIONVALUES_XXXXX constants rather than the MessagingOperationValues.XXXXX for bundle minification.
 */
export type MessagingOperationValues = {
  /** receive. */
  RECEIVE: 'receive';

  /** process. */
  PROCESS: 'process';
};

/**
 * The constant map of values for MessagingOperationValues.
 * @deprecated Use the MESSAGINGOPERATIONVALUES_XXXXX constants rather than the MessagingOperationValues.XXXXX for bundle minification.
 */
export const MessagingOperationValues: MessagingOperationValues =
  /*#__PURE__*/ createConstMap<MessagingOperationValues>([
    TMP_MESSAGINGOPERATIONVALUES_RECEIVE,
    TMP_MESSAGINGOPERATIONVALUES_PROCESS,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for RpcGrpcStatusCodeValues enum definition
 *
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_RPCGRPCSTATUSCODEVALUES_OK = 0;
const TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED = 1;
const TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN = 2;
const TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = 3;
const TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = 4;
const TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND = 5;
const TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = 6;
const TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = 7;
const TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = 8;
const TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = 9;
const TMP_RPCGRPCSTATUSCODEVALUES_ABORTED = 10;
const TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = 11;
const TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = 12;
const TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL = 13;
const TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = 14;
const TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS = 15;
const TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = 16;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_OK = TMP_RPCGRPCSTATUSCODEVALUES_OK;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_CANCELLED =
  TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_UNKNOWN =
  TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT =
  TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED =
  TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_NOT_FOUND =
  TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS =
  TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED =
  TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED =
  TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION =
  TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_ABORTED =
  TMP_RPCGRPCSTATUSCODEVALUES_ABORTED;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE =
  TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED =
  TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_INTERNAL =
  TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_UNAVAILABLE =
  TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_DATA_LOSS =
  TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED =
  TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED;

/**
 * Identifies the Values for RpcGrpcStatusCodeValues enum definition
 *
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 * @deprecated Use the RPCGRPCSTATUSCODEVALUES_XXXXX constants rather than the RpcGrpcStatusCodeValues.XXXXX for bundle minification.
 */
export type RpcGrpcStatusCodeValues = {
  /** OK. */
  OK: 0;

  /** CANCELLED. */
  CANCELLED: 1;

  /** UNKNOWN. */
  UNKNOWN: 2;

  /** INVALID_ARGUMENT. */
  INVALID_ARGUMENT: 3;

  /** DEADLINE_EXCEEDED. */
  DEADLINE_EXCEEDED: 4;

  /** NOT_FOUND. */
  NOT_FOUND: 5;

  /** ALREADY_EXISTS. */
  ALREADY_EXISTS: 6;

  /** PERMISSION_DENIED. */
  PERMISSION_DENIED: 7;

  /** RESOURCE_EXHAUSTED. */
  RESOURCE_EXHAUSTED: 8;

  /** FAILED_PRECONDITION. */
  FAILED_PRECONDITION: 9;

  /** ABORTED. */
  ABORTED: 10;

  /** OUT_OF_RANGE. */
  OUT_OF_RANGE: 11;

  /** UNIMPLEMENTED. */
  UNIMPLEMENTED: 12;

  /** INTERNAL. */
  INTERNAL: 13;

  /** UNAVAILABLE. */
  UNAVAILABLE: 14;

  /** DATA_LOSS. */
  DATA_LOSS: 15;

  /** UNAUTHENTICATED. */
  UNAUTHENTICATED: 16;
};

/**
 * The constant map of values for RpcGrpcStatusCodeValues.
 * @deprecated Use the RPCGRPCSTATUSCODEVALUES_XXXXX constants rather than the RpcGrpcStatusCodeValues.XXXXX for bundle minification.
 */
export const RpcGrpcStatusCodeValues: RpcGrpcStatusCodeValues = {
  OK: TMP_RPCGRPCSTATUSCODEVALUES_OK,
  CANCELLED: TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED,
  UNKNOWN: TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN,
  INVALID_ARGUMENT: TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT,
  DEADLINE_EXCEEDED: TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED,
  NOT_FOUND: TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND,
  ALREADY_EXISTS: TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS,
  PERMISSION_DENIED: TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED,
  RESOURCE_EXHAUSTED: TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED,
  FAILED_PRECONDITION: TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION,
  ABORTED: TMP_RPCGRPCSTATUSCODEVALUES_ABORTED,
  OUT_OF_RANGE: TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE,
  UNIMPLEMENTED: TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED,
  INTERNAL: TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL,
  UNAVAILABLE: TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE,
  DATA_LOSS: TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS,
  UNAUTHENTICATED: TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessageTypeValues enum definition
 *
 * Whether this is a received or sent message.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifable export names for some package types
const TMP_MESSAGETYPEVALUES_SENT = 'SENT';
const TMP_MESSAGETYPEVALUES_RECEIVED = 'RECEIVED';

/**
 * Whether this is a received or sent message.
 */
export const MESSAGETYPEVALUES_SENT = TMP_MESSAGETYPEVALUES_SENT;

/**
 * Whether this is a received or sent message.
 */
export const MESSAGETYPEVALUES_RECEIVED = TMP_MESSAGETYPEVALUES_RECEIVED;

/**
 * Identifies the Values for MessageTypeValues enum definition
 *
 * Whether this is a received or sent message.
 * @deprecated Use the MESSAGETYPEVALUES_XXXXX constants rather than the MessageTypeValues.XXXXX for bundle minification.
 */
export type MessageTypeValues = {
  /** sent. */
  SENT: 'SENT';

  /** received. */
  RECEIVED: 'RECEIVED';
};

/**
 * The constant map of values for MessageTypeValues.
 * @deprecated Use the MESSAGETYPEVALUES_XXXXX constants rather than the MessageTypeValues.XXXXX for bundle minification.
 */
export const MessageTypeValues: MessageTypeValues =
  /*#__PURE__*/ createConstMap<MessageTypeValues>([
    TMP_MESSAGETYPEVALUES_SENT,
    TMP_MESSAGETYPEVALUES_RECEIVED,
  ]);
