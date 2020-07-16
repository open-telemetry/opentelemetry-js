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

/**
 * Database attribute names defined by the Opetelemetry Semantic Conventions specification
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/database.md
 */
export const DatabaseAttribute = {
  // Connection-level attributes

  /**
   * An identifier for the database management system (DBMS) product being used.
   *
   * @remarks
   * Required.
   */
  DB_SYSTEM: 'db.system',

  /**
   * The connection string used to connect to the database.
   * It is recommended to remove embedded credentials.
   *
   * @remarks
   * Optional.
   */
  DB_CONNECTION_STRING: 'db.connection_string',

  /**
   * Username for accessing the database, e.g., "readonly_user" or "reporting_user".
   *
   * @remarks
   * Optional.
   */
  DB_USER: 'db.user',

  // Please see ./general.ts for NET_PEER_NAME, NET_PEER_IP, NET_PEER_PORT, NET_TRANSPORT

  // Call-level attributes

  /**
   * If no [tech-specific attribute](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/database.md#call-level-attributes-for-specific-technologies)
   * is defined in the list below,
   * this attribute is used to report the name of the database being accessed.
   * For commands that switch the database,this should be set to the
   * target database (even if the command fails).
   *
   * @remarks
   * Required if applicable and no more specific attribute is defined.
   */
  DB_NAME: 'db.name',

  /**
   * The database statement being executed.
   * Note that the value may be sanitized to exclude sensitive information.
   * E.g., for db.system="other_sql", "SELECT * FROM wuser_table";
   * for db.system="redis", "SET mykey 'WuValue'".
   *
   * @remarks
   * Required if applicable.
   */
  DB_STATEMENT: 'db.statement',

  /**
   * The name of the operation being executed,
   * e.g. the MongoDB command name such as findAndModify.
   * While it would semantically make sense to set this,
   * e.g., to an SQL keyword like SELECT or INSERT,
   * it is not recommended to attempt any client-side parsing of
   * db.statement just to get this property (the back end can do that if required).
   *
   * @remarks
   * Required if db.statement is not applicable.
   */
  DB_OPERATION: 'db.operation',

  // Connection-level attributes for specific technologies

  /**
   * The instance name connecting to.
   * This name is used to determine the port of a named instance.
   *
   * @remarks
   * If setting a `db.mssql.instance_name`,
   * `net.peer.port` is no longer required (but still recommended if non-standard)
   */
  DB_MSSSQL_INSTANCE_NAME: 'db.mssql.instance_name',

  /**
   * The fully-qualified class name of the Java Database Connectivity (JDBC) driver used to connect,
   * e.g., "org.postgresql.Driver" or "com.microsoft.sqlserver.jdbc.SQLServerDriver".
   *
   * @remarks
   * Optional.
   */
  DB_JDBC_DRIVER_CLASSNAME: 'db.jdbc.driver_classname',

  // Call-level attributes for specific technologies

  /**
   * The name of the keyspace being accessed. To be used instead of the generic db.name attribute.
   *
   * @remarks
   * Required.
   */
  DB_CASSANDRA_KEYSPACE: 'db.cassandra.keyspace',

  /**
   * The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed.
   * To be used instead of the generic db.name attribute.
   *
   * @remarks
   * Required.
   */
  DB_HBASE_NAMESPACE: 'db.hbase.namespace',

  /**
   * The index of the database being accessed as used in the [SELECT command](https://redis.io/commands/select),
   * provided as an integer. To be used instead of the generic db.name attribute.
   *
   * @remarks
   * Required if other than the default database (0).
   */
  DB_REDIS_DATABASE_INDEX: 'db.redis.database_index',

  /**
   * The collection being accessed within the database stated in db.name.
   *
   * @remarks
   * Required.
   */
  DB_MONGODB_COLLECTION: 'db.mongodb.collection',

  // Not in spec.

  /** Deprecated. Not in spec. */
  DB_TYPE: 'db.type',

  /** Deprecated. Not in spec. */
  DB_INSTANCE: 'db.instance',

  /** Deprecated. Not in spec. */
  DB_URL: 'db.url',
};
