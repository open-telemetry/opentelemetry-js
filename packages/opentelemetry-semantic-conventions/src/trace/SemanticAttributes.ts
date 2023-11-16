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
import {
  DOT,
  UNDERSCORE,
  DB_DOT,
  CARRIER_DOT,
  CASSANDRA_DOT,
  CODE_DOT,
  COORDINATOR_DOT,
  DOCUMENT_DOT,
  DYNAMODB_DOT,
  ENDUSER_DOT,
  EXCEPTION_DOT,
  FAAS_DOT,
  HTTP_DOT,
  JSONRPC_DOT,
  KAFKA_DOT,
  LAMBDA_DOT,
  MESSAGING_DOT,
  MONGODB_DOT,
  MSSQL_DOT,
  NET_DOT,
  PEER_DOT,
  RPC_DOT,
  THREAD_DOT,
  AWS,
  AZURE,
  CONTENT,
  COLLECTION,
  COMPRESSED,
  CONNECTION,
  GLOBAL,
  HOST,
  ID,
  INDEX,
  INSTANCE,
  INVOKED,
  LENGTH,
  LOCAL,
  MESSAGE,
  NAME,
  PORT,
  PROTOCOL,
  PROVISIONED,
  READ,
  REQUEST,
  RESPONSE,
  SECONDARY,
  SPACE,
  TYPE,
  UN,
  VERSION,
  WRITE,
} from '../internal/constants';

//----------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
//----------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------
// Constant values for SemanticAttributes
//----------------------------------------------------------------------------------------------------------

/**
 * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
 *
 * Note: This may be different from `faas.id` if an alias is involved.
 */
export const SEMATTRS_AWS_LAMBDA_INVOKED_ARN = (AWS +
  DOT +
  LAMBDA_DOT +
  INVOKED +
  UNDERSCORE +
  'arn') as 'aws.lambda.invoked_arn';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const SEMATTRS_DB_SYSTEM = (DB_DOT + 'system') as 'db.system';

/**
 * The connection string used to connect to the database. It is recommended to remove embedded credentials.
 */
export const SEMATTRS_DB_CONNECTION_STRING = (DB_DOT +
  CONNECTION +
  UNDERSCORE +
  'string') as 'db.connection_string';

/**
 * Username for accessing the database.
 */
export const SEMATTRS_DB_USER = (DB_DOT + 'user') as 'db.user';

/**
 * The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
 */
export const SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = (DB_DOT +
  'jdbc.driver_classname') as 'db.jdbc.driver_classname';

/**
 * If no [tech-specific attribute](#call-level-attributes-for-specific-technologies) is defined, this attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
 *
 * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;.
 */
export const SEMATTRS_DB_NAME = (DB_DOT + NAME) as 'db.name';

/**
 * The database statement being executed.
 *
 * Note: The value may be sanitized to exclude sensitive information.
 */
export const SEMATTRS_DB_STATEMENT = (DB_DOT + 'statement') as 'db.statement';

/**
 * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
 *
 * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
 */
export const SEMATTRS_DB_OPERATION = (DB_DOT + 'operation') as 'db.operation';

/**
 * The Microsoft SQL Server [instance name](https://docs.microsoft.com/en-us/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
 *
 * Note: If setting a `db.mssql.instance_name`, `net.peer.port` is no longer required (but still recommended if non-standard).
 */
export const SEMATTRS_DB_MSSQL_INSTANCE_NAME = (DB_DOT +
  MSSQL_DOT +
  INSTANCE +
  UNDERSCORE +
  NAME) as 'db.mssql.instance_name';

/**
 * The name of the keyspace being accessed. To be used instead of the generic `db.name` attribute.
 */
export const SEMATTRS_DB_CASSANDRA_KEYSPACE = (DB_DOT +
  CASSANDRA_DOT +
  'keyspace') as 'db.cassandra.keyspace';

/**
 * The fetch size used for paging, i.e. how many rows will be returned at once.
 */
export const SEMATTRS_DB_CASSANDRA_PAGE_SIZE = (DB_DOT +
  CASSANDRA_DOT +
  'page_size') as 'db.cassandra.page_size';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL = (DB_DOT +
  CASSANDRA_DOT +
  'consistency_level') as 'db.cassandra.consistency_level';

/**
 * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
 *
 * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 */
export const SEMATTRS_DB_CASSANDRA_TABLE = (DB_DOT +
  CASSANDRA_DOT +
  'table') as 'db.cassandra.table';

/**
 * Whether or not the query is idempotent.
 */
export const SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = (DB_DOT +
  CASSANDRA_DOT +
  ID +
  'empotence') as 'db.cassandra.idempotence';

/**
 * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
 */
export const SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = (DB_DOT +
  CASSANDRA_DOT +
  'speculative_execution_count') as 'db.cassandra.speculative_execution_count';

/**
 * The ID of the coordinating node for a query.
 */
export const SEMATTRS_DB_CASSANDRA_COORDINATOR_ID = (DB_DOT +
  CASSANDRA_DOT +
  COORDINATOR_DOT +
  ID) as 'db.cassandra.coordinator.id';

/**
 * The data center of the coordinating node for a query.
 */
export const SEMATTRS_DB_CASSANDRA_COORDINATOR_DC = (DB_DOT +
  CASSANDRA_DOT +
  COORDINATOR_DOT +
  'dc') as 'db.cassandra.coordinator.dc';

/**
 * The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed. To be used instead of the generic `db.name` attribute.
 */
export const SEMATTRS_DB_HBASE_NAMESPACE = (DB_DOT +
  'hbase.namespace') as 'db.hbase.namespace';

/**
 * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
 */
export const SEMATTRS_DB_REDIS_DATABASE_INDEX = (DB_DOT +
  'redis.database_index') as 'db.redis.database_index';

/**
 * The collection being accessed within the database stated in `db.name`.
 */
export const SEMATTRS_DB_MONGODB_COLLECTION = (DB_DOT +
  MONGODB_DOT +
  COLLECTION) as 'db.mongodb.collection';

/**
 * The name of the primary table that the operation is acting upon, including the schema name (if applicable).
 *
 * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 */
export const SEMATTRS_DB_SQL_TABLE = (DB_DOT + 'sql.table') as 'db.sql.table';

/**
 * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
 */
export const SEMATTRS_EXCEPTION_TYPE = (EXCEPTION_DOT +
  TYPE) as 'exception.type';

/**
 * The exception message.
 */
export const SEMATTRS_EXCEPTION_MESSAGE = (EXCEPTION_DOT +
  MESSAGE) as 'exception.message';

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 */
export const SEMATTRS_EXCEPTION_STACKTRACE = (EXCEPTION_DOT +
  'stacktrace') as 'exception.stacktrace';

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
export const SEMATTRS_EXCEPTION_ESCAPED = (EXCEPTION_DOT +
  'escaped') as 'exception.escaped';

/**
 * Type of the trigger on which the function is executed.
 */
export const SEMATTRS_FAAS_TRIGGER = (FAAS_DOT + 'trigger') as 'faas.trigger';

/**
 * The execution ID of the current function execution.
 */
export const SEMATTRS_FAAS_EXECUTION = (FAAS_DOT +
  'execution') as 'faas.execution';

/**
 * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
 */
export const SEMATTRS_FAAS_DOCUMENT_COLLECTION = (FAAS_DOT +
  DOCUMENT_DOT +
  COLLECTION) as 'faas.document.collection';

/**
 * Describes the type of the operation that was performed on the data.
 */
export const SEMATTRS_FAAS_DOCUMENT_OPERATION = (FAAS_DOT +
  DOCUMENT_DOT +
  'operation') as 'faas.document.operation';

/**
 * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 */
export const SEMATTRS_FAAS_DOCUMENT_TIME = (FAAS_DOT +
  DOCUMENT_DOT +
  'time') as 'faas.document.time';

/**
 * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
 */
export const SEMATTRS_FAAS_DOCUMENT_NAME = (FAAS_DOT +
  DOCUMENT_DOT +
  NAME) as 'faas.document.name';

/**
 * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 */
export const SEMATTRS_FAAS_TIME = (FAAS_DOT + 'time') as 'faas.time';

/**
 * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
 */
export const SEMATTRS_FAAS_CRON = (FAAS_DOT + 'cron') as 'faas.cron';

/**
 * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
 */
export const SEMATTRS_FAAS_COLDSTART = (FAAS_DOT +
  'coldstart') as 'faas.coldstart';

/**
 * The name of the invoked function.
 *
 * Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
 */
export const SEMATTRS_FAAS_INVOKED_NAME = (FAAS_DOT +
  INVOKED +
  UNDERSCORE +
  NAME) as 'faas.invoked_name';

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const SEMATTRS_FAAS_INVOKED_PROVIDER = (FAAS_DOT +
  INVOKED +
  UNDERSCORE +
  'provider') as 'faas.invoked_provider';

/**
 * The cloud region of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
 */
export const SEMATTRS_FAAS_INVOKED_REGION = (FAAS_DOT +
  INVOKED +
  UNDERSCORE +
  'region') as 'faas.invoked_region';

/**
 * Transport protocol used. See note below.
 */
export const SEMATTRS_NET_TRANSPORT = (NET_DOT +
  'transport') as 'net.transport';

/**
 * Remote address of the peer (dotted decimal for IPv4 or [RFC5952](https://tools.ietf.org/html/rfc5952) for IPv6).
 */
export const SEMATTRS_NET_PEER_IP = (NET_DOT +
  PEER_DOT +
  'ip') as 'net.peer.ip';

/**
 * Remote port number.
 */
export const SEMATTRS_NET_PEER_PORT = (NET_DOT +
  PEER_DOT +
  PORT) as 'net.peer.port';

/**
 * Remote hostname or similar, see note below.
 */
export const SEMATTRS_NET_PEER_NAME = (NET_DOT +
  PEER_DOT +
  NAME) as 'net.peer.name';

/**
 * Like `net.peer.ip` but for the host IP. Useful in case of a multi-IP host.
 */
export const SEMATTRS_NET_HOST_IP = (NET_DOT +
  HOST +
  DOT +
  'ip') as 'net.host.ip';

/**
 * Like `net.peer.port` but for the host port.
 */
export const SEMATTRS_NET_HOST_PORT = (NET_DOT +
  HOST +
  DOT +
  PORT) as 'net.host.port';

/**
 * Local hostname or similar, see note below.
 */
export const SEMATTRS_NET_HOST_NAME = (NET_DOT +
  HOST +
  DOT +
  NAME) as 'net.host.name';

/**
 * The internet connection type currently being used by the host.
 */
export const SEMATTRS_NET_HOST_CONNECTION_TYPE = (NET_DOT +
  HOST +
  DOT +
  CONNECTION +
  DOT +
  TYPE) as 'net.host.connection.type';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const SEMATTRS_NET_HOST_CONNECTION_SUBTYPE = (NET_DOT +
  HOST +
  DOT +
  CONNECTION +
  DOT +
  'subtype') as 'net.host.connection.subtype';

/**
 * The name of the mobile carrier.
 */
export const SEMATTRS_NET_HOST_CARRIER_NAME = (NET_DOT +
  HOST +
  DOT +
  CARRIER_DOT +
  NAME) as 'net.host.carrier.name';

/**
 * The mobile carrier country code.
 */
export const SEMATTRS_NET_HOST_CARRIER_MCC = (NET_DOT +
  HOST +
  DOT +
  CARRIER_DOT +
  'mcc') as 'net.host.carrier.mcc';

/**
 * The mobile carrier network code.
 */
export const SEMATTRS_NET_HOST_CARRIER_MNC = (NET_DOT +
  HOST +
  DOT +
  CARRIER_DOT +
  'mnc') as 'net.host.carrier.mnc';

/**
 * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
 */
export const SEMATTRS_NET_HOST_CARRIER_ICC = (NET_DOT +
  HOST +
  DOT +
  CARRIER_DOT +
  'icc') as 'net.host.carrier.icc';

/**
 * The [`service.name`](../../resource/semantic_conventions/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
 */
export const SEMATTRS_PEER_SERVICE = (PEER_DOT + 'service') as 'peer.service';

/**
 * Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
 */
export const SEMATTRS_ENDUSER_ID = (ENDUSER_DOT + ID) as 'enduser.id';

/**
 * Actual/assumed role the client is making the request under extracted from token or application security context.
 */
export const SEMATTRS_ENDUSER_ROLE = (ENDUSER_DOT + 'role') as 'enduser.role';

/**
 * Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
 */
export const SEMATTRS_ENDUSER_SCOPE = (ENDUSER_DOT +
  'scope') as 'enduser.scope';

/**
 * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
 */
export const SEMATTRS_THREAD_ID = (THREAD_DOT + ID) as 'thread.id';

/**
 * Current thread name.
 */
export const SEMATTRS_THREAD_NAME = (THREAD_DOT + NAME) as 'thread.name';

/**
 * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
 */
export const SEMATTRS_CODE_FUNCTION = (CODE_DOT +
  'function') as 'code.function';

/**
 * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
 */
export const SEMATTRS_CODE_NAMESPACE = (CODE_DOT +
  NAME +
  SPACE) as 'code.namespace';

/**
 * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
 */
export const SEMATTRS_CODE_FILEPATH = (CODE_DOT +
  'filepath') as 'code.filepath';

/**
 * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
 */
export const SEMATTRS_CODE_LINENO = (CODE_DOT + 'lineno') as 'code.lineno';

/**
 * HTTP request method.
 */
export const SEMATTRS_HTTP_METHOD = (HTTP_DOT + 'method') as 'http.method';

/**
 * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`. Usually the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
 *
 * Note: `http.url` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case the attribute&#39;s value should be `https://www.example.com/`.
 */
export const SEMATTRS_HTTP_URL = (HTTP_DOT + 'url') as 'http.url';

/**
 * The full request target as passed in a HTTP request line or equivalent.
 */
export const SEMATTRS_HTTP_TARGET = (HTTP_DOT + 'target') as 'http.target';

/**
 * The value of the [HTTP host header](https://tools.ietf.org/html/rfc7230#section-5.4). An empty Host header should also be reported, see note.
 *
 * Note: When the header is present but empty the attribute SHOULD be set to the empty string. Note that this is a valid situation that is expected in certain cases, according the aforementioned [section of RFC 7230](https://tools.ietf.org/html/rfc7230#section-5.4). When the header is not set the attribute MUST NOT be set.
 */
export const SEMATTRS_HTTP_HOST = (HTTP_DOT + HOST) as 'http.host';

/**
 * The URI scheme identifying the used protocol.
 */
export const SEMATTRS_HTTP_SCHEME = (HTTP_DOT + 'scheme') as 'http.scheme';

/**
 * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
 */
export const SEMATTRS_HTTP_STATUS_CODE = (HTTP_DOT +
  'status_code') as 'http.status_code';

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const SEMATTRS_HTTP_FLAVOR = (HTTP_DOT + 'flavor') as 'http.flavor';

/**
 * Value of the [HTTP User-Agent](https://tools.ietf.org/html/rfc7231#section-5.5.3) header sent by the client.
 */
export const SEMATTRS_HTTP_USER_AGENT = (HTTP_DOT +
  'user_agent') as 'http.user_agent';

/**
 * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
 */
export const SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH = (HTTP_DOT +
  REQUEST +
  UNDERSCORE +
  CONTENT +
  UNDERSCORE +
  LENGTH) as 'http.request_content_length';

/**
 * The size of the uncompressed request payload body after transport decoding. Not set if transport encoding not used.
 */
export const SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = (HTTP_DOT +
  REQUEST +
  UNDERSCORE +
  CONTENT +
  UNDERSCORE +
  LENGTH +
  UNDERSCORE +
  UN +
  COMPRESSED) as 'http.request_content_length_uncompressed';

/**
 * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
 */
export const SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = (HTTP_DOT +
  RESPONSE +
  UNDERSCORE +
  CONTENT +
  UNDERSCORE +
  LENGTH) as 'http.response_content_length';

/**
 * The size of the uncompressed response payload body after transport decoding. Not set if transport encoding not used.
 */
export const SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = (HTTP_DOT +
  RESPONSE +
  UNDERSCORE +
  CONTENT +
  UNDERSCORE +
  LENGTH +
  UNDERSCORE +
  UN +
  COMPRESSED) as 'http.response_content_length_uncompressed';

/**
 * The primary server name of the matched virtual host. This should be obtained via configuration. If no such configuration can be obtained, this attribute MUST NOT be set ( `net.host.name` should be used instead).
 *
 * Note: `http.url` is usually not readily available on the server side but would have to be assembled in a cumbersome and sometimes lossy process from other information (see e.g. open-telemetry/opentelemetry-python/pull/148). It is thus preferred to supply the raw data that is available.
 */
export const SEMATTRS_HTTP_SERVER_NAME = (HTTP_DOT +
  'server_name') as 'http.server_name';

/**
 * The matched route (path template).
 */
export const SEMATTRS_HTTP_ROUTE = (HTTP_DOT + 'route') as 'http.route';

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
export const SEMATTRS_HTTP_CLIENT_IP = (HTTP_DOT +
  'client_ip') as 'http.client_ip';

/**
 * The keys in the `RequestItems` object field.
 */
export const SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = (AWS +
  DOT +
  DYNAMODB_DOT +
  'table_names') as 'aws.dynamodb.table_names';

/**
 * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
 */
export const SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY = (AWS +
  DOT +
  DYNAMODB_DOT +
  'consumed_capacity') as 'aws.dynamodb.consumed_capacity';

/**
 * The JSON-serialized value of the `ItemCollectionMetrics` response field.
 */
export const SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = (AWS +
  DOT +
  DYNAMODB_DOT +
  'item_collection_metrics') as 'aws.dynamodb.item_collection_metrics';

/**
 * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = (AWS +
  DOT +
  DYNAMODB_DOT +
  PROVISIONED +
  UNDERSCORE +
  READ +
  UNDERSCORE +
  'capacity') as 'aws.dynamodb.provisioned_read_capacity';

/**
 * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = (AWS +
  DOT +
  DYNAMODB_DOT +
  PROVISIONED +
  UNDERSCORE +
  WRITE +
  UNDERSCORE +
  'capacity') as 'aws.dynamodb.provisioned_write_capacity';

/**
 * The value of the `ConsistentRead` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ = (AWS +
  DOT +
  DYNAMODB_DOT +
  'consistent_read') as 'aws.dynamodb.consistent_read';

/**
 * The value of the `ProjectionExpression` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_PROJECTION = (AWS +
  DOT +
  DYNAMODB_DOT +
  'projection') as 'aws.dynamodb.projection';

/**
 * The value of the `Limit` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_LIMIT = (AWS +
  DOT +
  DYNAMODB_DOT +
  'limit') as 'aws.dynamodb.limit';

/**
 * The value of the `AttributesToGet` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET = (AWS +
  DOT +
  DYNAMODB_DOT +
  'attributes_to_get') as 'aws.dynamodb.attributes_to_get';

/**
 * The value of the `IndexName` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_INDEX_NAME = (AWS +
  DOT +
  DYNAMODB_DOT +
  INDEX +
  UNDERSCORE +
  NAME) as 'aws.dynamodb.index_name';

/**
 * The value of the `Select` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SELECT = (AWS +
  DOT +
  DYNAMODB_DOT +
  'select') as 'aws.dynamodb.select';

/**
 * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = (AWS +
  DOT +
  DYNAMODB_DOT +
  GLOBAL +
  UNDERSCORE +
  SECONDARY +
  UNDERSCORE +
  INDEX +
  'es') as 'aws.dynamodb.global_secondary_indexes';

/**
 * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = (AWS +
  DOT +
  DYNAMODB_DOT +
  LOCAL +
  UNDERSCORE +
  SECONDARY +
  UNDERSCORE +
  INDEX +
  'es') as 'aws.dynamodb.local_secondary_indexes';

/**
 * The value of the `ExclusiveStartTableName` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = (AWS +
  DOT +
  DYNAMODB_DOT +
  'exclusive_start_table') as 'aws.dynamodb.exclusive_start_table';

/**
 * The the number of items in the `TableNames` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = (AWS +
  DOT +
  DYNAMODB_DOT +
  'table_count') as 'aws.dynamodb.table_count';

/**
 * The value of the `ScanIndexForward` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = (AWS +
  DOT +
  DYNAMODB_DOT +
  'scan_forward') as 'aws.dynamodb.scan_forward';

/**
 * The value of the `Segment` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SEGMENT = (AWS +
  DOT +
  DYNAMODB_DOT +
  'segment') as 'aws.dynamodb.segment';

/**
 * The value of the `TotalSegments` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS = (AWS +
  DOT +
  DYNAMODB_DOT +
  'total_segments') as 'aws.dynamodb.total_segments';

/**
 * The value of the `Count` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_COUNT = (AWS +
  DOT +
  DYNAMODB_DOT +
  'count') as 'aws.dynamodb.count';

/**
 * The value of the `ScannedCount` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT = (AWS +
  DOT +
  DYNAMODB_DOT +
  'scanned_count') as 'aws.dynamodb.scanned_count';

/**
 * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = (AWS +
  DOT +
  DYNAMODB_DOT +
  'attribute_definitions') as 'aws.dynamodb.attribute_definitions';

/**
 * The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = (AWS +
  DOT +
  DYNAMODB_DOT +
  GLOBAL +
  UNDERSCORE +
  SECONDARY +
  UNDERSCORE +
  INDEX +
  UNDERSCORE +
  'updates') as 'aws.dynamodb.global_secondary_index_updates';

/**
 * A string identifying the messaging system.
 */
export const SEMATTRS_MESSAGING_SYSTEM = (MESSAGING_DOT +
  'system') as 'messaging.system';

/**
 * The message destination name. This might be equal to the span name but is required nevertheless.
 */
export const SEMATTRS_MESSAGING_DESTINATION = (MESSAGING_DOT +
  'destination') as 'messaging.destination';

/**
 * The kind of message destination.
 */
export const SEMATTRS_MESSAGING_DESTINATION_KIND = (MESSAGING_DOT +
  'destination_kind') as 'messaging.destination_kind';

/**
 * A boolean that is true if the message destination is temporary.
 */
export const SEMATTRS_MESSAGING_TEMP_DESTINATION = (MESSAGING_DOT +
  'temp_destination') as 'messaging.temp_destination';

/**
 * The name of the transport protocol.
 */
export const SEMATTRS_MESSAGING_PROTOCOL = (MESSAGING_DOT +
  PROTOCOL) as 'messaging.protocol';

/**
 * The version of the transport protocol.
 */
export const SEMATTRS_MESSAGING_PROTOCOL_VERSION = (MESSAGING_DOT +
  PROTOCOL +
  UNDERSCORE +
  VERSION) as 'messaging.protocol_version';

/**
 * Connection string.
 */
export const SEMATTRS_MESSAGING_URL = (MESSAGING_DOT +
  'url') as 'messaging.url';

/**
 * A value used by the messaging system as an identifier for the message, represented as a string.
 */
export const SEMATTRS_MESSAGING_MESSAGE_ID = (MESSAGING_DOT +
  MESSAGE +
  UNDERSCORE +
  ID) as 'messaging.message_id';

/**
 * The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
 */
export const SEMATTRS_MESSAGING_CONVERSATION_ID = (MESSAGING_DOT +
  'conversation_id') as 'messaging.conversation_id';

/**
 * The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
 */
export const SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = (MESSAGING_DOT +
  MESSAGE +
  UNDERSCORE +
  'payload_size_bytes') as 'messaging.message_payload_size_bytes';

/**
 * The compressed size of the message payload in bytes.
 */
export const SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES =
  (MESSAGING_DOT +
    MESSAGE +
    UNDERSCORE +
    'payload_compressed_size_bytes') as 'messaging.message_payload_compressed_size_bytes';

/**
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 */
export const SEMATTRS_MESSAGING_OPERATION = (MESSAGING_DOT +
  'operation') as 'messaging.operation';

/**
 * The identifier for the consumer receiving a message. For Kafka, set it to `{messaging.kafka.consumer_group} - {messaging.kafka.client_id}`, if both are present, or only `messaging.kafka.consumer_group`. For brokers, such as RabbitMQ and Artemis, set it to the `client_id` of the client consuming the message.
 */
export const SEMATTRS_MESSAGING_CONSUMER_ID = (MESSAGING_DOT +
  'consumer_id') as 'messaging.consumer_id';

/**
 * RabbitMQ message routing key.
 */
export const SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY = (MESSAGING_DOT +
  'rabbitmq.routing_key') as 'messaging.rabbitmq.routing_key';

/**
 * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message_id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
 *
 * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
 */
export const SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY = (MESSAGING_DOT +
  KAFKA_DOT +
  MESSAGE +
  UNDERSCORE +
  'key') as 'messaging.kafka.message_key';

/**
 * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
 */
export const SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP = (MESSAGING_DOT +
  KAFKA_DOT +
  'consumer_group') as 'messaging.kafka.consumer_group';

/**
 * Client Id for the Consumer or Producer that is handling the message.
 */
export const SEMATTRS_MESSAGING_KAFKA_CLIENT_ID = (MESSAGING_DOT +
  KAFKA_DOT +
  'client_id') as 'messaging.kafka.client_id';

/**
 * Partition the message is sent to.
 */
export const SEMATTRS_MESSAGING_KAFKA_PARTITION = (MESSAGING_DOT +
  KAFKA_DOT +
  'partition') as 'messaging.kafka.partition';

/**
 * A boolean that is true if the message is a tombstone.
 */
export const SEMATTRS_MESSAGING_KAFKA_TOMBSTONE = (MESSAGING_DOT +
  KAFKA_DOT +
  'tombstone') as 'messaging.kafka.tombstone';

/**
 * A string identifying the remoting system.
 */
export const SEMATTRS_RPC_SYSTEM = (RPC_DOT + 'system') as 'rpc.system';

/**
 * The full (logical) name of the service being called, including its package name, if applicable.
 *
 * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
 */
export const SEMATTRS_RPC_SERVICE = (RPC_DOT + 'service') as 'rpc.service';

/**
 * The name of the (logical) method being called, must be equal to the $method part in the span name.
 *
 * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
 */
export const SEMATTRS_RPC_METHOD = (RPC_DOT + 'method') as 'rpc.method';

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const SEMATTRS_RPC_GRPC_STATUS_CODE = (RPC_DOT +
  'grpc.status_code') as 'rpc.grpc.status_code';

/**
 * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 does not specify this, the value can be omitted.
 */
export const SEMATTRS_RPC_JSONRPC_VERSION = (RPC_DOT +
  JSONRPC_DOT +
  VERSION) as 'rpc.jsonrpc.version';

/**
 * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
 */
export const SEMATTRS_RPC_JSONRPC_REQUEST_ID = (RPC_DOT +
  JSONRPC_DOT +
  REQUEST +
  UNDERSCORE +
  ID) as 'rpc.jsonrpc.request_id';

/**
 * `error.code` property of response if it is an error response.
 */
export const SEMATTRS_RPC_JSONRPC_ERROR_CODE = (RPC_DOT +
  JSONRPC_DOT +
  'error_code') as 'rpc.jsonrpc.error_code';

/**
 * `error.message` property of response if it is an error response.
 */
export const SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = (RPC_DOT +
  JSONRPC_DOT +
  'error_message') as 'rpc.jsonrpc.error_message';

/**
 * Whether this is a received or sent message.
 */
export const SEMATTRS_MESSAGE_TYPE = (MESSAGE + DOT + TYPE) as 'message.type';

/**
 * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
 *
 * Note: This way we guarantee that the values will be consistent between different implementations.
 */
export const SEMATTRS_MESSAGE_ID = (MESSAGE + DOT + ID) as 'message.id';

/**
 * Compressed size of the message in bytes.
 */
export const SEMATTRS_MESSAGE_COMPRESSED_SIZE = (MESSAGE +
  DOT +
  COMPRESSED +
  UNDERSCORE +
  'size') as 'message.compressed_size';

/**
 * Uncompressed size of the message in bytes.
 */
export const SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE = (MESSAGE +
  DOT +
  UN +
  COMPRESSED +
  UNDERSCORE +
  'size') as 'message.uncompressed_size';

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
  createConstMap<SemanticAttributes>([
    SEMATTRS_AWS_LAMBDA_INVOKED_ARN,
    SEMATTRS_DB_SYSTEM,
    SEMATTRS_DB_CONNECTION_STRING,
    SEMATTRS_DB_USER,
    SEMATTRS_DB_JDBC_DRIVER_CLASSNAME,
    SEMATTRS_DB_NAME,
    SEMATTRS_DB_STATEMENT,
    SEMATTRS_DB_OPERATION,
    SEMATTRS_DB_MSSQL_INSTANCE_NAME,
    SEMATTRS_DB_CASSANDRA_KEYSPACE,
    SEMATTRS_DB_CASSANDRA_PAGE_SIZE,
    SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL,
    SEMATTRS_DB_CASSANDRA_TABLE,
    SEMATTRS_DB_CASSANDRA_IDEMPOTENCE,
    SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT,
    SEMATTRS_DB_CASSANDRA_COORDINATOR_ID,
    SEMATTRS_DB_CASSANDRA_COORDINATOR_DC,
    SEMATTRS_DB_HBASE_NAMESPACE,
    SEMATTRS_DB_REDIS_DATABASE_INDEX,
    SEMATTRS_DB_MONGODB_COLLECTION,
    SEMATTRS_DB_SQL_TABLE,
    SEMATTRS_EXCEPTION_TYPE,
    SEMATTRS_EXCEPTION_MESSAGE,
    SEMATTRS_EXCEPTION_STACKTRACE,
    SEMATTRS_EXCEPTION_ESCAPED,
    SEMATTRS_FAAS_TRIGGER,
    SEMATTRS_FAAS_EXECUTION,
    SEMATTRS_FAAS_DOCUMENT_COLLECTION,
    SEMATTRS_FAAS_DOCUMENT_OPERATION,
    SEMATTRS_FAAS_DOCUMENT_TIME,
    SEMATTRS_FAAS_DOCUMENT_NAME,
    SEMATTRS_FAAS_TIME,
    SEMATTRS_FAAS_CRON,
    SEMATTRS_FAAS_COLDSTART,
    SEMATTRS_FAAS_INVOKED_NAME,
    SEMATTRS_FAAS_INVOKED_PROVIDER,
    SEMATTRS_FAAS_INVOKED_REGION,
    SEMATTRS_NET_TRANSPORT,
    SEMATTRS_NET_PEER_IP,
    SEMATTRS_NET_PEER_PORT,
    SEMATTRS_NET_PEER_NAME,
    SEMATTRS_NET_HOST_IP,
    SEMATTRS_NET_HOST_PORT,
    SEMATTRS_NET_HOST_NAME,
    SEMATTRS_NET_HOST_CONNECTION_TYPE,
    SEMATTRS_NET_HOST_CONNECTION_SUBTYPE,
    SEMATTRS_NET_HOST_CARRIER_NAME,
    SEMATTRS_NET_HOST_CARRIER_MCC,
    SEMATTRS_NET_HOST_CARRIER_MNC,
    SEMATTRS_NET_HOST_CARRIER_ICC,
    SEMATTRS_PEER_SERVICE,
    SEMATTRS_ENDUSER_ID,
    SEMATTRS_ENDUSER_ROLE,
    SEMATTRS_ENDUSER_SCOPE,
    SEMATTRS_THREAD_ID,
    SEMATTRS_THREAD_NAME,
    SEMATTRS_CODE_FUNCTION,
    SEMATTRS_CODE_NAMESPACE,
    SEMATTRS_CODE_FILEPATH,
    SEMATTRS_CODE_LINENO,
    SEMATTRS_HTTP_METHOD,
    SEMATTRS_HTTP_URL,
    SEMATTRS_HTTP_TARGET,
    SEMATTRS_HTTP_HOST,
    SEMATTRS_HTTP_SCHEME,
    SEMATTRS_HTTP_STATUS_CODE,
    SEMATTRS_HTTP_FLAVOR,
    SEMATTRS_HTTP_USER_AGENT,
    SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH,
    SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
    SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
    SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
    SEMATTRS_HTTP_SERVER_NAME,
    SEMATTRS_HTTP_ROUTE,
    SEMATTRS_HTTP_CLIENT_IP,
    SEMATTRS_AWS_DYNAMODB_TABLE_NAMES,
    SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY,
    SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS,
    SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY,
    SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY,
    SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ,
    SEMATTRS_AWS_DYNAMODB_PROJECTION,
    SEMATTRS_AWS_DYNAMODB_LIMIT,
    SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET,
    SEMATTRS_AWS_DYNAMODB_INDEX_NAME,
    SEMATTRS_AWS_DYNAMODB_SELECT,
    SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES,
    SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES,
    SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE,
    SEMATTRS_AWS_DYNAMODB_TABLE_COUNT,
    SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD,
    SEMATTRS_AWS_DYNAMODB_SEGMENT,
    SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS,
    SEMATTRS_AWS_DYNAMODB_COUNT,
    SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT,
    SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS,
    SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES,
    SEMATTRS_MESSAGING_SYSTEM,
    SEMATTRS_MESSAGING_DESTINATION,
    SEMATTRS_MESSAGING_DESTINATION_KIND,
    SEMATTRS_MESSAGING_TEMP_DESTINATION,
    SEMATTRS_MESSAGING_PROTOCOL,
    SEMATTRS_MESSAGING_PROTOCOL_VERSION,
    SEMATTRS_MESSAGING_URL,
    SEMATTRS_MESSAGING_MESSAGE_ID,
    SEMATTRS_MESSAGING_CONVERSATION_ID,
    SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES,
    SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES,
    SEMATTRS_MESSAGING_OPERATION,
    SEMATTRS_MESSAGING_CONSUMER_ID,
    SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY,
    SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY,
    SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP,
    SEMATTRS_MESSAGING_KAFKA_CLIENT_ID,
    SEMATTRS_MESSAGING_KAFKA_PARTITION,
    SEMATTRS_MESSAGING_KAFKA_TOMBSTONE,
    SEMATTRS_RPC_SYSTEM,
    SEMATTRS_RPC_SERVICE,
    SEMATTRS_RPC_METHOD,
    SEMATTRS_RPC_GRPC_STATUS_CODE,
    SEMATTRS_RPC_JSONRPC_VERSION,
    SEMATTRS_RPC_JSONRPC_REQUEST_ID,
    SEMATTRS_RPC_JSONRPC_ERROR_CODE,
    SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE,
    SEMATTRS_MESSAGE_TYPE,
    SEMATTRS_MESSAGE_ID,
    SEMATTRS_MESSAGE_COMPRESSED_SIZE,
    SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for DbSystemValues enum definition
 *
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_OTHER_SQL = 'other_sql';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MSSQL = 'mssql';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MYSQL = 'mysql';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_ORACLE = 'oracle';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_DB2 = 'db2';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_POSTGRESQL = 'postgresql';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_REDSHIFT = 'redshift';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_HIVE = 'hive';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_CLOUDSCAPE = 'cloudscape';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_HSQLDB = 'hsqldb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_PROGRESS = 'progress';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MAXDB = 'maxdb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_HANADB = 'hanadb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_INGRES = 'ingres';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_FIRSTSQL = 'firstsql';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_EDB = 'edb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_CACHE = 'cache';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_ADABAS = 'adabas';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_FIREBIRD = 'firebird';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_DERBY = 'derby';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_FILEMAKER = 'filemaker';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_INFORMIX = 'informix';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_INSTANTDB = 'instantdb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_INTERBASE = 'interbase';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MARIADB = 'mariadb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_NETEZZA = 'netezza';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_PERVASIVE = 'pervasive';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_POINTBASE = 'pointbase';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_SQLITE = 'sqlite';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_SYBASE = 'sybase';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_TERADATA = 'teradata';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_VERTICA = 'vertica';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_H2 = 'h2';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COLDFUSION = 'coldfusion';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_CASSANDRA = 'cassandra';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_HBASE = 'hbase';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MONGODB = 'mongodb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_REDIS = 'redis';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COUCHBASE = 'couchbase';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COUCHDB = 'couchdb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COSMOSDB = 'cosmosdb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_DYNAMODB = 'dynamodb';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_NEO4J = 'neo4j';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_GEODE = 'geode';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_ELASTICSEARCH = 'elasticsearch';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_MEMCACHED = 'memcached';

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_COCKROACHDB = 'cockroachdb';

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
export const DbSystemValues: DbSystemValues = {
  OTHER_SQL: DBSYSTEMVALUES_OTHER_SQL,
  MSSQL: DBSYSTEMVALUES_MSSQL,
  MYSQL: DBSYSTEMVALUES_MYSQL,
  ORACLE: DBSYSTEMVALUES_ORACLE,
  DB2: DBSYSTEMVALUES_DB2,
  POSTGRESQL: DBSYSTEMVALUES_POSTGRESQL,
  REDSHIFT: DBSYSTEMVALUES_REDSHIFT,
  HIVE: DBSYSTEMVALUES_HIVE,
  CLOUDSCAPE: DBSYSTEMVALUES_CLOUDSCAPE,
  HSQLDB: DBSYSTEMVALUES_HSQLDB,
  PROGRESS: DBSYSTEMVALUES_PROGRESS,
  MAXDB: DBSYSTEMVALUES_MAXDB,
  HANADB: DBSYSTEMVALUES_HANADB,
  INGRES: DBSYSTEMVALUES_INGRES,
  FIRSTSQL: DBSYSTEMVALUES_FIRSTSQL,
  EDB: DBSYSTEMVALUES_EDB,
  CACHE: DBSYSTEMVALUES_CACHE,
  ADABAS: DBSYSTEMVALUES_ADABAS,
  FIREBIRD: DBSYSTEMVALUES_FIREBIRD,
  DERBY: DBSYSTEMVALUES_DERBY,
  FILEMAKER: DBSYSTEMVALUES_FILEMAKER,
  INFORMIX: DBSYSTEMVALUES_INFORMIX,
  INSTANTDB: DBSYSTEMVALUES_INSTANTDB,
  INTERBASE: DBSYSTEMVALUES_INTERBASE,
  MARIADB: DBSYSTEMVALUES_MARIADB,
  NETEZZA: DBSYSTEMVALUES_NETEZZA,
  PERVASIVE: DBSYSTEMVALUES_PERVASIVE,
  POINTBASE: DBSYSTEMVALUES_POINTBASE,
  SQLITE: DBSYSTEMVALUES_SQLITE,
  SYBASE: DBSYSTEMVALUES_SYBASE,
  TERADATA: DBSYSTEMVALUES_TERADATA,
  VERTICA: DBSYSTEMVALUES_VERTICA,
  H2: DBSYSTEMVALUES_H2,
  COLDFUSION: DBSYSTEMVALUES_COLDFUSION,
  CASSANDRA: DBSYSTEMVALUES_CASSANDRA,
  HBASE: DBSYSTEMVALUES_HBASE,
  MONGODB: DBSYSTEMVALUES_MONGODB,
  REDIS: DBSYSTEMVALUES_REDIS,
  COUCHBASE: DBSYSTEMVALUES_COUCHBASE,
  COUCHDB: DBSYSTEMVALUES_COUCHDB,
  COSMOSDB: DBSYSTEMVALUES_COSMOSDB,
  DYNAMODB: DBSYSTEMVALUES_DYNAMODB,
  NEO4J: DBSYSTEMVALUES_NEO4J,
  GEODE: DBSYSTEMVALUES_GEODE,
  ELASTICSEARCH: DBSYSTEMVALUES_ELASTICSEARCH,
  MEMCACHED: DBSYSTEMVALUES_MEMCACHED,
  COCKROACHDB: DBSYSTEMVALUES_COCKROACHDB,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for DbCassandraConsistencyLevelValues enum definition
 *
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_ALL = 'all';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = 'each_quorum';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = 'quorum';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = (LOCAL +
  UNDERSCORE +
  'quorum') as 'local_quorum';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_ONE = 'one';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_TWO = 'two';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_THREE = 'three';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = (LOCAL +
  UNDERSCORE +
  'one') as 'local_one';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_ANY = 'any';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = 'serial';

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = (LOCAL +
  UNDERSCORE +
  'serial') as 'local_serial';

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
  {
    ALL: DBCASSANDRACONSISTENCYLEVELVALUES_ALL,
    EACH_QUORUM: DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM,
    QUORUM: DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM,
    LOCAL_QUORUM: DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM,
    ONE: DBCASSANDRACONSISTENCYLEVELVALUES_ONE,
    TWO: DBCASSANDRACONSISTENCYLEVELVALUES_TWO,
    THREE: DBCASSANDRACONSISTENCYLEVELVALUES_THREE,
    LOCAL_ONE: DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE,
    ANY: DBCASSANDRACONSISTENCYLEVELVALUES_ANY,
    SERIAL: DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL,
    LOCAL_SERIAL: DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL,
  };

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for FaasTriggerValues enum definition
 *
 * Type of the trigger on which the function is executed.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_DATASOURCE = 'datasource';

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_HTTP = 'http';

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_PUBSUB = 'pubsub';

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_TIMER = 'timer';

/**
 * Type of the trigger on which the function is executed.
 */
export const FAASTRIGGERVALUES_OTHER = 'other';

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
export const FaasTriggerValues: FaasTriggerValues = {
  DATASOURCE: FAASTRIGGERVALUES_DATASOURCE,
  HTTP: FAASTRIGGERVALUES_HTTP,
  PUBSUB: FAASTRIGGERVALUES_PUBSUB,
  TIMER: FAASTRIGGERVALUES_TIMER,
  OTHER: FAASTRIGGERVALUES_OTHER,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for FaasDocumentOperationValues enum definition
 *
 * Describes the type of the operation that was performed on the data.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * Describes the type of the operation that was performed on the data.
 */
export const FAASDOCUMENTOPERATIONVALUES_INSERT = 'insert';

/**
 * Describes the type of the operation that was performed on the data.
 */
export const FAASDOCUMENTOPERATIONVALUES_EDIT = 'edit';

/**
 * Describes the type of the operation that was performed on the data.
 */
export const FAASDOCUMENTOPERATIONVALUES_DELETE = 'delete';

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
export const FaasDocumentOperationValues: FaasDocumentOperationValues = {
  INSERT: FAASDOCUMENTOPERATIONVALUES_INSERT,
  EDIT: FAASDOCUMENTOPERATIONVALUES_EDIT,
  DELETE: FAASDOCUMENTOPERATIONVALUES_DELETE,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for FaasInvokedProviderValues enum definition
 *
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = 'alibaba_cloud';

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_AWS = AWS as 'aws';

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_AZURE = AZURE as 'azure';

/**
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_GCP = 'gcp';

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
export const FaasInvokedProviderValues: FaasInvokedProviderValues = {
  ALIBABA_CLOUD: FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD,
  AWS: FAASINVOKEDPROVIDERVALUES_AWS,
  AZURE: FAASINVOKEDPROVIDERVALUES_AZURE,
  GCP: FAASINVOKEDPROVIDERVALUES_GCP,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetTransportValues enum definition
 *
 * Transport protocol used. See note below.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_IP_TCP = 'ip_tcp';

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_IP_UDP = 'ip_udp';

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_IP = 'ip';

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_UNIX = (UN + 'ix') as 'unix';

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_PIPE = 'pipe';

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_INPROC = 'inproc';

/**
 * Transport protocol used. See note below.
 */
export const NETTRANSPORTVALUES_OTHER = 'other';

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
export const NetTransportValues: NetTransportValues = {
  IP_TCP: NETTRANSPORTVALUES_IP_TCP,
  IP_UDP: NETTRANSPORTVALUES_IP_UDP,
  IP: NETTRANSPORTVALUES_IP,
  UNIX: NETTRANSPORTVALUES_UNIX,
  PIPE: NETTRANSPORTVALUES_PIPE,
  INPROC: NETTRANSPORTVALUES_INPROC,
  OTHER: NETTRANSPORTVALUES_OTHER,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetHostConnectionTypeValues enum definition
 *
 * The internet connection type currently being used by the host.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_WIFI = 'wifi';

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_WIRED = 'wired';

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_CELL = 'cell';

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = (UN +
  'available') as 'unavailable';

/**
 * The internet connection type currently being used by the host.
 */
export const NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = (UN + 'known') as 'unknown';

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
export const NetHostConnectionTypeValues: NetHostConnectionTypeValues = {
  WIFI: NETHOSTCONNECTIONTYPEVALUES_WIFI,
  WIRED: NETHOSTCONNECTIONTYPEVALUES_WIRED,
  CELL: NETHOSTCONNECTIONTYPEVALUES_CELL,
  UNAVAILABLE: NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE,
  UNKNOWN: NETHOSTCONNECTIONTYPEVALUES_UNKNOWN,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetHostConnectionSubtypeValues enum definition
 *
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = 'gprs';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = 'edge';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = 'umts';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = 'cdma';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = 'evdo_0';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = 'evdo_a';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = 'cdma2000_1xrtt';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = 'hsdpa';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = 'hsupa';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = 'hspa';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = (ID + 'en') as 'iden';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = 'evdo_b';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_LTE = 'lte';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = 'ehrpd';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = 'hspap';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_GSM = 'gsm';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = 'td_scdma';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = 'iwlan';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_NR = 'nr';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = 'nrnsa';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = 'lte_ca';

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
export const NetHostConnectionSubtypeValues: NetHostConnectionSubtypeValues = {
  GPRS: NETHOSTCONNECTIONSUBTYPEVALUES_GPRS,
  EDGE: NETHOSTCONNECTIONSUBTYPEVALUES_EDGE,
  UMTS: NETHOSTCONNECTIONSUBTYPEVALUES_UMTS,
  CDMA: NETHOSTCONNECTIONSUBTYPEVALUES_CDMA,
  EVDO_0: NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0,
  EVDO_A: NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A,
  CDMA2000_1XRTT: NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT,
  HSDPA: NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA,
  HSUPA: NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA,
  HSPA: NETHOSTCONNECTIONSUBTYPEVALUES_HSPA,
  IDEN: NETHOSTCONNECTIONSUBTYPEVALUES_IDEN,
  EVDO_B: NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B,
  LTE: NETHOSTCONNECTIONSUBTYPEVALUES_LTE,
  EHRPD: NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD,
  HSPAP: NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP,
  GSM: NETHOSTCONNECTIONSUBTYPEVALUES_GSM,
  TD_SCDMA: NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA,
  IWLAN: NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN,
  NR: NETHOSTCONNECTIONSUBTYPEVALUES_NR,
  NRNSA: NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA,
  LTE_CA: NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for HttpFlavorValues enum definition
 *
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_HTTP_1_0 = '1.0';

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_HTTP_1_1 = '1.1';

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_HTTP_2_0 = '2.0';

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_SPDY = 'SPDY';

/**
 * Kind of HTTP protocol used.
 *
 * Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
 */
export const HTTPFLAVORVALUES_QUIC = 'QUIC';

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
  HTTP_1_0: HTTPFLAVORVALUES_HTTP_1_0,
  HTTP_1_1: HTTPFLAVORVALUES_HTTP_1_1,
  HTTP_2_0: HTTPFLAVORVALUES_HTTP_2_0,
  SPDY: HTTPFLAVORVALUES_SPDY,
  QUIC: HTTPFLAVORVALUES_QUIC,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingDestinationKindValues enum definition
 *
 * The kind of message destination.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * The kind of message destination.
 */
export const MESSAGINGDESTINATIONKINDVALUES_QUEUE = 'queue';

/**
 * The kind of message destination.
 */
export const MESSAGINGDESTINATIONKINDVALUES_TOPIC = 'topic';

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
export const MessagingDestinationKindValues: MessagingDestinationKindValues = {
  QUEUE: MESSAGINGDESTINATIONKINDVALUES_QUEUE,
  TOPIC: MESSAGINGDESTINATIONKINDVALUES_TOPIC,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingOperationValues enum definition
 *
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 */
export const MESSAGINGOPERATIONVALUES_RECEIVE = 'receive';

/**
 * A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
 */
export const MESSAGINGOPERATIONVALUES_PROCESS = 'process';

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
export const MessagingOperationValues: MessagingOperationValues = {
  RECEIVE: MESSAGINGOPERATIONVALUES_RECEIVE,
  PROCESS: MESSAGINGOPERATIONVALUES_PROCESS,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for RpcGrpcStatusCodeValues enum definition
 *
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_OK = 0;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_CANCELLED = 1;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_UNKNOWN = 2;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = 3;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = 4;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_NOT_FOUND = 5;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = 6;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = 7;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = 8;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = 9;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_ABORTED = 10;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = 11;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = 12;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_INTERNAL = 13;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = 14;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_DATA_LOSS = 15;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = 16;

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
  OK: RPCGRPCSTATUSCODEVALUES_OK,
  CANCELLED: RPCGRPCSTATUSCODEVALUES_CANCELLED,
  UNKNOWN: RPCGRPCSTATUSCODEVALUES_UNKNOWN,
  INVALID_ARGUMENT: RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT,
  DEADLINE_EXCEEDED: RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED,
  NOT_FOUND: RPCGRPCSTATUSCODEVALUES_NOT_FOUND,
  ALREADY_EXISTS: RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS,
  PERMISSION_DENIED: RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED,
  RESOURCE_EXHAUSTED: RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED,
  FAILED_PRECONDITION: RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION,
  ABORTED: RPCGRPCSTATUSCODEVALUES_ABORTED,
  OUT_OF_RANGE: RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE,
  UNIMPLEMENTED: RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED,
  INTERNAL: RPCGRPCSTATUSCODEVALUES_INTERNAL,
  UNAVAILABLE: RPCGRPCSTATUSCODEVALUES_UNAVAILABLE,
  DATA_LOSS: RPCGRPCSTATUSCODEVALUES_DATA_LOSS,
  UNAUTHENTICATED: RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessageTypeValues enum definition
 *
 * Whether this is a received or sent message.
 * ---------------------------------------------------------------------------------------------------------- */

/**
 * Whether this is a received or sent message.
 */
export const MESSAGETYPEVALUES_SENT = 'SENT';

/**
 * Whether this is a received or sent message.
 */
export const MESSAGETYPEVALUES_RECEIVED = 'RECEIVED';

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
export const MessageTypeValues: MessageTypeValues = {
  SENT: MESSAGETYPEVALUES_SENT,
  RECEIVED: MESSAGETYPEVALUES_RECEIVED,
};
