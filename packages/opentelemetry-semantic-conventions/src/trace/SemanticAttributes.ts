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
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_EVENT_NAME = 'event.name';
const TMP_LOG_RECORD_UID = 'log.record.uid';
const TMP_LOG_IOSTREAM = 'log.iostream';
const TMP_LOG_FILE_NAME = 'log.file.name';
const TMP_LOG_FILE_NAME_RESOLVED = 'log.file.name_resolved';
const TMP_LOG_FILE_PATH = 'log.file.path';
const TMP_LOG_FILE_PATH_RESOLVED = 'log.file.path_resolved';
const TMP_IOS_STATE = 'ios.state';
const TMP_ANDROID_STATE = 'android.state';
const TMP_POOL_NAME = 'pool.name';
const TMP_STATE = 'state';
const TMP_ASPNETCORE_RATE_LIMITING_RESULT = 'aspnetcore.rate_limiting.result';
const TMP_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE =
  'aspnetcore.diagnostics.handler.type';
const TMP_ASPNETCORE_RATE_LIMITING_POLICY = 'aspnetcore.rate_limiting.policy';
const TMP_ASPNETCORE_REQUEST_IS_UNHANDLED = 'aspnetcore.request.is_unhandled';
const TMP_ASPNETCORE_ROUTING_IS_FALLBACK = 'aspnetcore.routing.is_fallback';
const TMP_SIGNALR_CONNECTION_STATUS = 'signalr.connection.status';
const TMP_SIGNALR_TRANSPORT = 'signalr.transport';
const TMP_JVM_BUFFER_POOL_NAME = 'jvm.buffer.pool.name';
const TMP_JVM_MEMORY_POOL_NAME = 'jvm.memory.pool.name';
const TMP_JVM_MEMORY_TYPE = 'jvm.memory.type';
const TMP_PROCESS_CPU_STATE = 'process.cpu.state';
const TMP_SYSTEM_DEVICE = 'system.device';
const TMP_SYSTEM_CPU_LOGICAL_NUMBER = 'system.cpu.logical_number';
const TMP_SYSTEM_CPU_STATE = 'system.cpu.state';
const TMP_SYSTEM_MEMORY_STATE = 'system.memory.state';
const TMP_SYSTEM_PAGING_DIRECTION = 'system.paging.direction';
const TMP_SYSTEM_PAGING_STATE = 'system.paging.state';
const TMP_SYSTEM_PAGING_TYPE = 'system.paging.type';
const TMP_SYSTEM_FILESYSTEM_MODE = 'system.filesystem.mode';
const TMP_SYSTEM_FILESYSTEM_MOUNTPOINT = 'system.filesystem.mountpoint';
const TMP_SYSTEM_FILESYSTEM_STATE = 'system.filesystem.state';
const TMP_SYSTEM_FILESYSTEM_TYPE = 'system.filesystem.type';
const TMP_SYSTEM_NETWORK_STATE = 'system.network.state';
const TMP_SYSTEM_PROCESS_STATUS = 'system.process.status';
const TMP_ANDROID_OS_API_LEVEL = 'android.os.api_level';
const TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS =
  'aws.dynamodb.attribute_definitions';
const TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET = 'aws.dynamodb.attributes_to_get';
const TMP_AWS_DYNAMODB_CONSISTENT_READ = 'aws.dynamodb.consistent_read';
const TMP_AWS_DYNAMODB_CONSUMED_CAPACITY = 'aws.dynamodb.consumed_capacity';
const TMP_AWS_DYNAMODB_COUNT = 'aws.dynamodb.count';
const TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE =
  'aws.dynamodb.exclusive_start_table';
const TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES =
  'aws.dynamodb.global_secondary_index_updates';
const TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES =
  'aws.dynamodb.global_secondary_indexes';
const TMP_AWS_DYNAMODB_INDEX_NAME = 'aws.dynamodb.index_name';
const TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS =
  'aws.dynamodb.item_collection_metrics';
const TMP_AWS_DYNAMODB_LIMIT = 'aws.dynamodb.limit';
const TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES =
  'aws.dynamodb.local_secondary_indexes';
const TMP_AWS_DYNAMODB_PROJECTION = 'aws.dynamodb.projection';
const TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY =
  'aws.dynamodb.provisioned_read_capacity';
const TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY =
  'aws.dynamodb.provisioned_write_capacity';
const TMP_AWS_DYNAMODB_SCAN_FORWARD = 'aws.dynamodb.scan_forward';
const TMP_AWS_DYNAMODB_SCANNED_COUNT = 'aws.dynamodb.scanned_count';
const TMP_AWS_DYNAMODB_SEGMENT = 'aws.dynamodb.segment';
const TMP_AWS_DYNAMODB_SELECT = 'aws.dynamodb.select';
const TMP_AWS_DYNAMODB_TABLE_COUNT = 'aws.dynamodb.table_count';
const TMP_AWS_DYNAMODB_TABLE_NAMES = 'aws.dynamodb.table_names';
const TMP_AWS_DYNAMODB_TOTAL_SEGMENTS = 'aws.dynamodb.total_segments';
const TMP_BROWSER_BRANDS = 'browser.brands';
const TMP_BROWSER_LANGUAGE = 'browser.language';
const TMP_BROWSER_MOBILE = 'browser.mobile';
const TMP_BROWSER_PLATFORM = 'browser.platform';
const TMP_CLIENT_ADDRESS = 'client.address';
const TMP_CLIENT_PORT = 'client.port';
const TMP_CLOUD_ACCOUNT_ID = 'cloud.account.id';
const TMP_CLOUD_AVAILABILITY_ZONE = 'cloud.availability_zone';
const TMP_CLOUD_PLATFORM = 'cloud.platform';
const TMP_CLOUD_PROVIDER = 'cloud.provider';
const TMP_CLOUD_REGION = 'cloud.region';
const TMP_CLOUD_RESOURCE_ID = 'cloud.resource_id';
const TMP_CLOUDEVENTS_EVENT_ID = 'cloudevents.event_id';
const TMP_CLOUDEVENTS_EVENT_SOURCE = 'cloudevents.event_source';
const TMP_CLOUDEVENTS_EVENT_SPEC_VERSION = 'cloudevents.event_spec_version';
const TMP_CLOUDEVENTS_EVENT_SUBJECT = 'cloudevents.event_subject';
const TMP_CLOUDEVENTS_EVENT_TYPE = 'cloudevents.event_type';
const TMP_CODE_COLUMN = 'code.column';
const TMP_CODE_FILEPATH = 'code.filepath';
const TMP_CODE_FUNCTION = 'code.function';
const TMP_CODE_LINENO = 'code.lineno';
const TMP_CODE_NAMESPACE = 'code.namespace';
const TMP_CODE_STACKTRACE = 'code.stacktrace';
const TMP_CONTAINER_COMMAND = 'container.command';
const TMP_CONTAINER_COMMAND_ARGS = 'container.command_args';
const TMP_CONTAINER_COMMAND_LINE = 'container.command_line';
const TMP_CONTAINER_CPU_STATE = 'container.cpu.state';
const TMP_CONTAINER_ID = 'container.id';
const TMP_CONTAINER_IMAGE_ID = 'container.image.id';
const TMP_CONTAINER_IMAGE_NAME = 'container.image.name';
const TMP_CONTAINER_IMAGE_REPO_DIGESTS = 'container.image.repo_digests';
const TMP_CONTAINER_IMAGE_TAGS = 'container.image.tags';
const TMP_CONTAINER_NAME = 'container.name';
const TMP_CONTAINER_RUNTIME = 'container.runtime';
const TMP_DB_CASSANDRA_CONSISTENCY_LEVEL = 'db.cassandra.consistency_level';
const TMP_DB_CASSANDRA_COORDINATOR_DC = 'db.cassandra.coordinator.dc';
const TMP_DB_CASSANDRA_COORDINATOR_ID = 'db.cassandra.coordinator.id';
const TMP_DB_CASSANDRA_IDEMPOTENCE = 'db.cassandra.idempotence';
const TMP_DB_CASSANDRA_PAGE_SIZE = 'db.cassandra.page_size';
const TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT =
  'db.cassandra.speculative_execution_count';
const TMP_DB_CASSANDRA_TABLE = 'db.cassandra.table';
const TMP_DB_COSMOSDB_CLIENT_ID = 'db.cosmosdb.client_id';
const TMP_DB_COSMOSDB_CONNECTION_MODE = 'db.cosmosdb.connection_mode';
const TMP_DB_COSMOSDB_CONTAINER = 'db.cosmosdb.container';
const TMP_DB_COSMOSDB_OPERATION_TYPE = 'db.cosmosdb.operation_type';
const TMP_DB_COSMOSDB_REQUEST_CHARGE = 'db.cosmosdb.request_charge';
const TMP_DB_COSMOSDB_REQUEST_CONTENT_LENGTH =
  'db.cosmosdb.request_content_length';
const TMP_DB_COSMOSDB_STATUS_CODE = 'db.cosmosdb.status_code';
const TMP_DB_COSMOSDB_SUB_STATUS_CODE = 'db.cosmosdb.sub_status_code';
const TMP_DB_ELASTICSEARCH_CLUSTER_NAME = 'db.elasticsearch.cluster.name';
const TMP_DB_INSTANCE_ID = 'db.instance.id';
const TMP_DB_MONGODB_COLLECTION = 'db.mongodb.collection';
const TMP_DB_MSSQL_INSTANCE_NAME = 'db.mssql.instance_name';
const TMP_DB_NAME = 'db.name';
const TMP_DB_OPERATION = 'db.operation';
const TMP_DB_REDIS_DATABASE_INDEX = 'db.redis.database_index';
const TMP_DB_SQL_TABLE = 'db.sql.table';
const TMP_DB_STATEMENT = 'db.statement';
const TMP_DB_SYSTEM = 'db.system';
const TMP_DB_USER = 'db.user';
const TMP_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
const TMP_DB_CONNECTION_STRING = 'db.connection_string';
const TMP_DB_ELASTICSEARCH_NODE_NAME = 'db.elasticsearch.node.name';
const TMP_DB_JDBC_DRIVER_CLASSNAME = 'db.jdbc.driver_classname';
const TMP_HTTP_FLAVOR = 'http.flavor';
const TMP_HTTP_METHOD = 'http.method';
const TMP_HTTP_REQUEST_CONTENT_LENGTH = 'http.request_content_length';
const TMP_HTTP_RESPONSE_CONTENT_LENGTH = 'http.response_content_length';
const TMP_HTTP_SCHEME = 'http.scheme';
const TMP_HTTP_STATUS_CODE = 'http.status_code';
const TMP_HTTP_TARGET = 'http.target';
const TMP_HTTP_URL = 'http.url';
const TMP_HTTP_USER_AGENT = 'http.user_agent';
const TMP_MESSAGING_KAFKA_DESTINATION_PARTITION =
  'messaging.kafka.destination.partition';
const TMP_NET_HOST_NAME = 'net.host.name';
const TMP_NET_HOST_PORT = 'net.host.port';
const TMP_NET_PEER_NAME = 'net.peer.name';
const TMP_NET_PEER_PORT = 'net.peer.port';
const TMP_NET_PROTOCOL_NAME = 'net.protocol.name';
const TMP_NET_PROTOCOL_VERSION = 'net.protocol.version';
const TMP_NET_SOCK_FAMILY = 'net.sock.family';
const TMP_NET_SOCK_HOST_ADDR = 'net.sock.host.addr';
const TMP_NET_SOCK_HOST_PORT = 'net.sock.host.port';
const TMP_NET_SOCK_PEER_ADDR = 'net.sock.peer.addr';
const TMP_NET_SOCK_PEER_NAME = 'net.sock.peer.name';
const TMP_NET_SOCK_PEER_PORT = 'net.sock.peer.port';
const TMP_NET_TRANSPORT = 'net.transport';
const TMP_SYSTEM_PROCESSES_STATUS = 'system.processes.status';
const TMP_DESTINATION_ADDRESS = 'destination.address';
const TMP_DESTINATION_PORT = 'destination.port';
const TMP_DEVICE_ID = 'device.id';
const TMP_DEVICE_MANUFACTURER = 'device.manufacturer';
const TMP_DEVICE_MODEL_IDENTIFIER = 'device.model.identifier';
const TMP_DEVICE_MODEL_NAME = 'device.model.name';
const TMP_DISK_IO_DIRECTION = 'disk.io.direction';
const TMP_DNS_QUESTION_NAME = 'dns.question.name';
const TMP_ENDUSER_ID = 'enduser.id';
const TMP_ENDUSER_ROLE = 'enduser.role';
const TMP_ENDUSER_SCOPE = 'enduser.scope';
const TMP_ERROR_TYPE = 'error.type';
const TMP_EXCEPTION_ESCAPED = 'exception.escaped';
const TMP_EXCEPTION_MESSAGE = 'exception.message';
const TMP_EXCEPTION_STACKTRACE = 'exception.stacktrace';
const TMP_EXCEPTION_TYPE = 'exception.type';
const TMP_FAAS_COLDSTART = 'faas.coldstart';
const TMP_FAAS_CRON = 'faas.cron';
const TMP_FAAS_DOCUMENT_COLLECTION = 'faas.document.collection';
const TMP_FAAS_DOCUMENT_NAME = 'faas.document.name';
const TMP_FAAS_DOCUMENT_OPERATION = 'faas.document.operation';
const TMP_FAAS_DOCUMENT_TIME = 'faas.document.time';
const TMP_FAAS_INSTANCE = 'faas.instance';
const TMP_FAAS_INVOCATION_ID = 'faas.invocation_id';
const TMP_FAAS_INVOKED_NAME = 'faas.invoked_name';
const TMP_FAAS_INVOKED_PROVIDER = 'faas.invoked_provider';
const TMP_FAAS_INVOKED_REGION = 'faas.invoked_region';
const TMP_FAAS_MAX_MEMORY = 'faas.max_memory';
const TMP_FAAS_NAME = 'faas.name';
const TMP_FAAS_TIME = 'faas.time';
const TMP_FAAS_TRIGGER = 'faas.trigger';
const TMP_FAAS_VERSION = 'faas.version';
const TMP_FEATURE_FLAG_KEY = 'feature_flag.key';
const TMP_FEATURE_FLAG_PROVIDER_NAME = 'feature_flag.provider_name';
const TMP_FEATURE_FLAG_VARIANT = 'feature_flag.variant';
const TMP_FILE_DIRECTORY = 'file.directory';
const TMP_FILE_EXTENSION = 'file.extension';
const TMP_FILE_NAME = 'file.name';
const TMP_FILE_PATH = 'file.path';
const TMP_FILE_SIZE = 'file.size';
const TMP_GCP_CLOUD_RUN_JOB_EXECUTION = 'gcp.cloud_run.job.execution';
const TMP_GCP_CLOUD_RUN_JOB_TASK_INDEX = 'gcp.cloud_run.job.task_index';
const TMP_GCP_GCE_INSTANCE_HOSTNAME = 'gcp.gce.instance.hostname';
const TMP_GCP_GCE_INSTANCE_NAME = 'gcp.gce.instance.name';
const TMP_HOST_ARCH = 'host.arch';
const TMP_HOST_CPU_CACHE_L2_SIZE = 'host.cpu.cache.l2.size';
const TMP_HOST_CPU_FAMILY = 'host.cpu.family';
const TMP_HOST_CPU_MODEL_ID = 'host.cpu.model.id';
const TMP_HOST_CPU_MODEL_NAME = 'host.cpu.model.name';
const TMP_HOST_CPU_STEPPING = 'host.cpu.stepping';
const TMP_HOST_CPU_VENDOR_ID = 'host.cpu.vendor.id';
const TMP_HOST_ID = 'host.id';
const TMP_HOST_IMAGE_ID = 'host.image.id';
const TMP_HOST_IMAGE_NAME = 'host.image.name';
const TMP_HOST_IMAGE_VERSION = 'host.image.version';
const TMP_HOST_IP = 'host.ip';
const TMP_HOST_MAC = 'host.mac';
const TMP_HOST_NAME = 'host.name';
const TMP_HOST_TYPE = 'host.type';
const TMP_HTTP_CONNECTION_STATE = 'http.connection.state';
const TMP_HTTP_REQUEST_BODY_SIZE = 'http.request.body.size';
const TMP_HTTP_REQUEST_METHOD = 'http.request.method';
const TMP_HTTP_REQUEST_METHOD_ORIGINAL = 'http.request.method_original';
const TMP_HTTP_REQUEST_RESEND_COUNT = 'http.request.resend_count';
const TMP_HTTP_REQUEST_SIZE = 'http.request.size';
const TMP_HTTP_RESPONSE_BODY_SIZE = 'http.response.body.size';
const TMP_HTTP_RESPONSE_SIZE = 'http.response.size';
const TMP_HTTP_RESPONSE_STATUS_CODE = 'http.response.status_code';
const TMP_HTTP_ROUTE = 'http.route';
const TMP_K8S_CLUSTER_NAME = 'k8s.cluster.name';
const TMP_K8S_CLUSTER_UID = 'k8s.cluster.uid';
const TMP_K8S_CONTAINER_NAME = 'k8s.container.name';
const TMP_K8S_CONTAINER_RESTART_COUNT = 'k8s.container.restart_count';
const TMP_K8S_CRONJOB_NAME = 'k8s.cronjob.name';
const TMP_K8S_CRONJOB_UID = 'k8s.cronjob.uid';
const TMP_K8S_DAEMONSET_NAME = 'k8s.daemonset.name';
const TMP_K8S_DAEMONSET_UID = 'k8s.daemonset.uid';
const TMP_K8S_DEPLOYMENT_NAME = 'k8s.deployment.name';
const TMP_K8S_DEPLOYMENT_UID = 'k8s.deployment.uid';
const TMP_K8S_JOB_NAME = 'k8s.job.name';
const TMP_K8S_JOB_UID = 'k8s.job.uid';
const TMP_K8S_NAMESPACE_NAME = 'k8s.namespace.name';
const TMP_K8S_NODE_NAME = 'k8s.node.name';
const TMP_K8S_NODE_UID = 'k8s.node.uid';
const TMP_K8S_POD_NAME = 'k8s.pod.name';
const TMP_K8S_POD_UID = 'k8s.pod.uid';
const TMP_K8S_REPLICASET_NAME = 'k8s.replicaset.name';
const TMP_K8S_REPLICASET_UID = 'k8s.replicaset.uid';
const TMP_K8S_STATEFULSET_NAME = 'k8s.statefulset.name';
const TMP_K8S_STATEFULSET_UID = 'k8s.statefulset.uid';
const TMP_MESSAGING_BATCH_MESSAGE_COUNT = 'messaging.batch.message_count';
const TMP_MESSAGING_CLIENT_ID = 'messaging.client_id';
const TMP_MESSAGING_DESTINATION_ANONYMOUS = 'messaging.destination.anonymous';
const TMP_MESSAGING_DESTINATION_NAME = 'messaging.destination.name';
const TMP_MESSAGING_DESTINATION_PARTITION_ID =
  'messaging.destination.partition.id';
const TMP_MESSAGING_DESTINATION_TEMPLATE = 'messaging.destination.template';
const TMP_MESSAGING_DESTINATION_TEMPORARY = 'messaging.destination.temporary';
const TMP_MESSAGING_DESTINATION_PUBLISH_ANONYMOUS =
  'messaging.destination_publish.anonymous';
const TMP_MESSAGING_DESTINATION_PUBLISH_NAME =
  'messaging.destination_publish.name';
const TMP_MESSAGING_EVENTHUBS_CONSUMER_GROUP =
  'messaging.eventhubs.consumer.group';
const TMP_MESSAGING_EVENTHUBS_MESSAGE_ENQUEUED_TIME =
  'messaging.eventhubs.message.enqueued_time';
const TMP_MESSAGING_GCP_PUBSUB_MESSAGE_ORDERING_KEY =
  'messaging.gcp_pubsub.message.ordering_key';
const TMP_MESSAGING_KAFKA_CONSUMER_GROUP = 'messaging.kafka.consumer.group';
const TMP_MESSAGING_KAFKA_MESSAGE_KEY = 'messaging.kafka.message.key';
const TMP_MESSAGING_KAFKA_MESSAGE_OFFSET = 'messaging.kafka.message.offset';
const TMP_MESSAGING_KAFKA_MESSAGE_TOMBSTONE =
  'messaging.kafka.message.tombstone';
const TMP_MESSAGING_MESSAGE_BODY_SIZE = 'messaging.message.body.size';
const TMP_MESSAGING_MESSAGE_CONVERSATION_ID =
  'messaging.message.conversation_id';
const TMP_MESSAGING_MESSAGE_ENVELOPE_SIZE = 'messaging.message.envelope.size';
const TMP_MESSAGING_MESSAGE_ID = 'messaging.message.id';
const TMP_MESSAGING_OPERATION = 'messaging.operation';
const TMP_MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY =
  'messaging.rabbitmq.destination.routing_key';
const TMP_MESSAGING_RABBITMQ_MESSAGE_DELIVERY_TAG =
  'messaging.rabbitmq.message.delivery_tag';
const TMP_MESSAGING_ROCKETMQ_CLIENT_GROUP = 'messaging.rocketmq.client_group';
const TMP_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL =
  'messaging.rocketmq.consumption_model';
const TMP_MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL =
  'messaging.rocketmq.message.delay_time_level';
const TMP_MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP =
  'messaging.rocketmq.message.delivery_timestamp';
const TMP_MESSAGING_ROCKETMQ_MESSAGE_GROUP = 'messaging.rocketmq.message.group';
const TMP_MESSAGING_ROCKETMQ_MESSAGE_KEYS = 'messaging.rocketmq.message.keys';
const TMP_MESSAGING_ROCKETMQ_MESSAGE_TAG = 'messaging.rocketmq.message.tag';
const TMP_MESSAGING_ROCKETMQ_MESSAGE_TYPE = 'messaging.rocketmq.message.type';
const TMP_MESSAGING_ROCKETMQ_NAMESPACE = 'messaging.rocketmq.namespace';
const TMP_MESSAGING_SERVICEBUS_DESTINATION_SUBSCRIPTION_NAME =
  'messaging.servicebus.destination.subscription_name';
const TMP_MESSAGING_SERVICEBUS_DISPOSITION_STATUS =
  'messaging.servicebus.disposition_status';
const TMP_MESSAGING_SERVICEBUS_MESSAGE_DELIVERY_COUNT =
  'messaging.servicebus.message.delivery_count';
const TMP_MESSAGING_SERVICEBUS_MESSAGE_ENQUEUED_TIME =
  'messaging.servicebus.message.enqueued_time';
const TMP_MESSAGING_SYSTEM = 'messaging.system';
const TMP_NETWORK_CARRIER_ICC = 'network.carrier.icc';
const TMP_NETWORK_CARRIER_MCC = 'network.carrier.mcc';
const TMP_NETWORK_CARRIER_MNC = 'network.carrier.mnc';
const TMP_NETWORK_CARRIER_NAME = 'network.carrier.name';
const TMP_NETWORK_CONNECTION_SUBTYPE = 'network.connection.subtype';
const TMP_NETWORK_CONNECTION_TYPE = 'network.connection.type';
const TMP_NETWORK_IO_DIRECTION = 'network.io.direction';
const TMP_NETWORK_LOCAL_ADDRESS = 'network.local.address';
const TMP_NETWORK_LOCAL_PORT = 'network.local.port';
const TMP_NETWORK_PEER_ADDRESS = 'network.peer.address';
const TMP_NETWORK_PEER_PORT = 'network.peer.port';
const TMP_NETWORK_PROTOCOL_NAME = 'network.protocol.name';
const TMP_NETWORK_PROTOCOL_VERSION = 'network.protocol.version';
const TMP_NETWORK_TRANSPORT = 'network.transport';
const TMP_NETWORK_TYPE = 'network.type';
const TMP_OCI_MANIFEST_DIGEST = 'oci.manifest.digest';
const TMP_OS_BUILD_ID = 'os.build_id';
const TMP_OS_DESCRIPTION = 'os.description';
const TMP_OS_NAME = 'os.name';
const TMP_OS_TYPE = 'os.type';
const TMP_OS_VERSION = 'os.version';
const TMP_PEER_SERVICE = 'peer.service';
const TMP_PROCESS_COMMAND = 'process.command';
const TMP_PROCESS_COMMAND_ARGS = 'process.command_args';
const TMP_PROCESS_COMMAND_LINE = 'process.command_line';
const TMP_PROCESS_EXECUTABLE_NAME = 'process.executable.name';
const TMP_PROCESS_EXECUTABLE_PATH = 'process.executable.path';
const TMP_PROCESS_OWNER = 'process.owner';
const TMP_PROCESS_PARENT_PID = 'process.parent_pid';
const TMP_PROCESS_PID = 'process.pid';
const TMP_PROCESS_RUNTIME_DESCRIPTION = 'process.runtime.description';
const TMP_PROCESS_RUNTIME_NAME = 'process.runtime.name';
const TMP_PROCESS_RUNTIME_VERSION = 'process.runtime.version';
const TMP_RPC_CONNECT_RPC_ERROR_CODE = 'rpc.connect_rpc.error_code';
const TMP_RPC_GRPC_STATUS_CODE = 'rpc.grpc.status_code';
const TMP_RPC_JSONRPC_ERROR_CODE = 'rpc.jsonrpc.error_code';
const TMP_RPC_JSONRPC_ERROR_MESSAGE = 'rpc.jsonrpc.error_message';
const TMP_RPC_JSONRPC_REQUEST_ID = 'rpc.jsonrpc.request_id';
const TMP_RPC_JSONRPC_VERSION = 'rpc.jsonrpc.version';
const TMP_RPC_METHOD = 'rpc.method';
const TMP_RPC_SERVICE = 'rpc.service';
const TMP_RPC_SYSTEM = 'rpc.system';
const TMP_SERVER_ADDRESS = 'server.address';
const TMP_SERVER_PORT = 'server.port';
const TMP_SERVICE_INSTANCE_ID = 'service.instance.id';
const TMP_SERVICE_NAME = 'service.name';
const TMP_SERVICE_NAMESPACE = 'service.namespace';
const TMP_SERVICE_VERSION = 'service.version';
const TMP_SESSION_ID = 'session.id';
const TMP_SESSION_PREVIOUS_ID = 'session.previous_id';
const TMP_SOURCE_ADDRESS = 'source.address';
const TMP_SOURCE_PORT = 'source.port';
const TMP_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';
const TMP_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';
const TMP_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';
const TMP_TELEMETRY_DISTRO_NAME = 'telemetry.distro.name';
const TMP_TELEMETRY_DISTRO_VERSION = 'telemetry.distro.version';
const TMP_THREAD_ID = 'thread.id';
const TMP_THREAD_NAME = 'thread.name';
const TMP_TLS_CIPHER = 'tls.cipher';
const TMP_TLS_CLIENT_CERTIFICATE = 'tls.client.certificate';
const TMP_TLS_CLIENT_CERTIFICATE_CHAIN = 'tls.client.certificate_chain';
const TMP_TLS_CLIENT_HASH_MD5 = 'tls.client.hash.md5';
const TMP_TLS_CLIENT_HASH_SHA1 = 'tls.client.hash.sha1';
const TMP_TLS_CLIENT_HASH_SHA256 = 'tls.client.hash.sha256';
const TMP_TLS_CLIENT_ISSUER = 'tls.client.issuer';
const TMP_TLS_CLIENT_JA3 = 'tls.client.ja3';
const TMP_TLS_CLIENT_NOT_AFTER = 'tls.client.not_after';
const TMP_TLS_CLIENT_NOT_BEFORE = 'tls.client.not_before';
const TMP_TLS_CLIENT_SERVER_NAME = 'tls.client.server_name';
const TMP_TLS_CLIENT_SUBJECT = 'tls.client.subject';
const TMP_TLS_CLIENT_SUPPORTED_CIPHERS = 'tls.client.supported_ciphers';
const TMP_TLS_CURVE = 'tls.curve';
const TMP_TLS_ESTABLISHED = 'tls.established';
const TMP_TLS_NEXT_PROTOCOL = 'tls.next_protocol';
const TMP_TLS_PROTOCOL_NAME = 'tls.protocol.name';
const TMP_TLS_PROTOCOL_VERSION = 'tls.protocol.version';
const TMP_TLS_RESUMED = 'tls.resumed';
const TMP_TLS_SERVER_CERTIFICATE = 'tls.server.certificate';
const TMP_TLS_SERVER_CERTIFICATE_CHAIN = 'tls.server.certificate_chain';
const TMP_TLS_SERVER_HASH_MD5 = 'tls.server.hash.md5';
const TMP_TLS_SERVER_HASH_SHA1 = 'tls.server.hash.sha1';
const TMP_TLS_SERVER_HASH_SHA256 = 'tls.server.hash.sha256';
const TMP_TLS_SERVER_ISSUER = 'tls.server.issuer';
const TMP_TLS_SERVER_JA3S = 'tls.server.ja3s';
const TMP_TLS_SERVER_NOT_AFTER = 'tls.server.not_after';
const TMP_TLS_SERVER_NOT_BEFORE = 'tls.server.not_before';
const TMP_TLS_SERVER_SUBJECT = 'tls.server.subject';
const TMP_URL_DOMAIN = 'url.domain';
const TMP_URL_EXTENSION = 'url.extension';
const TMP_URL_FRAGMENT = 'url.fragment';
const TMP_URL_FULL = 'url.full';
const TMP_URL_ORIGINAL = 'url.original';
const TMP_URL_PATH = 'url.path';
const TMP_URL_PORT = 'url.port';
const TMP_URL_QUERY = 'url.query';
const TMP_URL_REGISTERED_DOMAIN = 'url.registered_domain';
const TMP_URL_SCHEME = 'url.scheme';
const TMP_URL_SUBDOMAIN = 'url.subdomain';
const TMP_URL_TOP_LEVEL_DOMAIN = 'url.top_level_domain';
const TMP_USER_AGENT_NAME = 'user_agent.name';
const TMP_USER_AGENT_ORIGINAL = 'user_agent.original';
const TMP_USER_AGENT_VERSION = 'user_agent.version';
const TMP_AWS_LAMBDA_INVOKED_ARN = 'aws.lambda.invoked_arn';
const TMP_OPENTRACING_REF_TYPE = 'opentracing.ref_type';
const TMP_OTEL_STATUS_CODE = 'otel.status_code';
const TMP_OTEL_STATUS_DESCRIPTION = 'otel.status_description';
const TMP_AWS_REQUEST_ID = 'aws.request_id';
const TMP_AWS_S3_BUCKET = 'aws.s3.bucket';
const TMP_AWS_S3_COPY_SOURCE = 'aws.s3.copy_source';
const TMP_AWS_S3_DELETE = 'aws.s3.delete';
const TMP_AWS_S3_KEY = 'aws.s3.key';
const TMP_AWS_S3_PART_NUMBER = 'aws.s3.part_number';
const TMP_AWS_S3_UPLOAD_ID = 'aws.s3.upload_id';
const TMP_GRAPHQL_DOCUMENT = 'graphql.document';
const TMP_GRAPHQL_OPERATION_NAME = 'graphql.operation.name';
const TMP_GRAPHQL_OPERATION_TYPE = 'graphql.operation.type';
const TMP_MESSAGE_COMPRESSED_SIZE = 'message.compressed_size';
const TMP_MESSAGE_ID = 'message.id';
const TMP_MESSAGE_TYPE = 'message.type';
const TMP_MESSAGE_UNCOMPRESSED_SIZE = 'message.uncompressed_size';

/**
 * Identifies the class / type of event.
 *
 * Note: Event names are subject to the same rules as [attribute names](https://github.com/open-telemetry/opentelemetry-specification/tree/v1.31.0/specification/common/attribute-naming.md). Notably, event names are namespaced to avoid collisions and provide a clean separation of semantics for events in separate domains like browser, mobile, and kubernetes.
 */
export const SEMATTRS_EVENT_NAME = TMP_EVENT_NAME;

/**
* A unique identifier for the Log Record.
*
* Note: If an id is provided, other log records with the same id will be considered duplicates and can be removed safely. This means, that two distinguishable log records MUST have different values.
The id MAY be an [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec), but other identifiers (e.g. UUID) may be used as needed.
*/
export const SEMATTRS_LOG_RECORD_UID = TMP_LOG_RECORD_UID;

/**
 * The stream associated with the log. See below for a list of well-known values.
 */
export const SEMATTRS_LOG_IOSTREAM = TMP_LOG_IOSTREAM;

/**
 * The basename of the file.
 */
export const SEMATTRS_LOG_FILE_NAME = TMP_LOG_FILE_NAME;

/**
 * The basename of the file, with symlinks resolved.
 */
export const SEMATTRS_LOG_FILE_NAME_RESOLVED = TMP_LOG_FILE_NAME_RESOLVED;

/**
 * The full path to the file.
 */
export const SEMATTRS_LOG_FILE_PATH = TMP_LOG_FILE_PATH;

/**
 * The full path to the file, with symlinks resolved.
 */
export const SEMATTRS_LOG_FILE_PATH_RESOLVED = TMP_LOG_FILE_PATH_RESOLVED;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 */
export const SEMATTRS_IOS_STATE = TMP_IOS_STATE;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 */
export const SEMATTRS_ANDROID_STATE = TMP_ANDROID_STATE;

/**
 * The name of the connection pool; unique within the instrumented application. In case the connection pool implementation doesn&#39;t provide a name, instrumentation should use a combination of `server.address` and `server.port` attributes formatted as `server.address:server.port`.
 */
export const SEMATTRS_POOL_NAME = TMP_POOL_NAME;

/**
 * The state of a connection in the pool.
 */
export const SEMATTRS_STATE = TMP_STATE;

/**
 * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
 */
export const SEMATTRS_ASPNETCORE_RATE_LIMITING_RESULT =
  TMP_ASPNETCORE_RATE_LIMITING_RESULT;

/**
 * Full type name of the [`IExceptionHandler`](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.diagnostics.iexceptionhandler) implementation that handled the exception.
 */
export const SEMATTRS_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE =
  TMP_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE;

/**
 * Rate limiting policy name.
 */
export const SEMATTRS_ASPNETCORE_RATE_LIMITING_POLICY =
  TMP_ASPNETCORE_RATE_LIMITING_POLICY;

/**
 * Flag indicating if request was handled by the application pipeline.
 */
export const SEMATTRS_ASPNETCORE_REQUEST_IS_UNHANDLED =
  TMP_ASPNETCORE_REQUEST_IS_UNHANDLED;

/**
 * A value that indicates whether the matched route is a fallback route.
 */
export const SEMATTRS_ASPNETCORE_ROUTING_IS_FALLBACK =
  TMP_ASPNETCORE_ROUTING_IS_FALLBACK;

/**
 * SignalR HTTP connection closure status.
 */
export const SEMATTRS_SIGNALR_CONNECTION_STATUS = TMP_SIGNALR_CONNECTION_STATUS;

/**
 * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
 */
export const SEMATTRS_SIGNALR_TRANSPORT = TMP_SIGNALR_TRANSPORT;

/**
 * Name of the buffer pool.
 *
 * Note: Pool names are generally obtained via [BufferPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/BufferPoolMXBean.html#getName()).
 */
export const SEMATTRS_JVM_BUFFER_POOL_NAME = TMP_JVM_BUFFER_POOL_NAME;

/**
 * Name of the memory pool.
 *
 * Note: Pool names are generally obtained via [MemoryPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/MemoryPoolMXBean.html#getName()).
 */
export const SEMATTRS_JVM_MEMORY_POOL_NAME = TMP_JVM_MEMORY_POOL_NAME;

/**
 * The type of memory.
 */
export const SEMATTRS_JVM_MEMORY_TYPE = TMP_JVM_MEMORY_TYPE;

/**
 * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
 */
export const SEMATTRS_PROCESS_CPU_STATE = TMP_PROCESS_CPU_STATE;

/**
 * The device identifier.
 */
export const SEMATTRS_SYSTEM_DEVICE = TMP_SYSTEM_DEVICE;

/**
 * The logical CPU number [0..n-1].
 */
export const SEMATTRS_SYSTEM_CPU_LOGICAL_NUMBER = TMP_SYSTEM_CPU_LOGICAL_NUMBER;

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 */
export const SEMATTRS_SYSTEM_CPU_STATE = TMP_SYSTEM_CPU_STATE;

/**
 * The memory state.
 */
export const SEMATTRS_SYSTEM_MEMORY_STATE = TMP_SYSTEM_MEMORY_STATE;

/**
 * The paging access direction.
 */
export const SEMATTRS_SYSTEM_PAGING_DIRECTION = TMP_SYSTEM_PAGING_DIRECTION;

/**
 * The memory paging state.
 */
export const SEMATTRS_SYSTEM_PAGING_STATE = TMP_SYSTEM_PAGING_STATE;

/**
 * The memory paging type.
 */
export const SEMATTRS_SYSTEM_PAGING_TYPE = TMP_SYSTEM_PAGING_TYPE;

/**
 * The filesystem mode.
 */
export const SEMATTRS_SYSTEM_FILESYSTEM_MODE = TMP_SYSTEM_FILESYSTEM_MODE;

/**
 * The filesystem mount path.
 */
export const SEMATTRS_SYSTEM_FILESYSTEM_MOUNTPOINT =
  TMP_SYSTEM_FILESYSTEM_MOUNTPOINT;

/**
 * The filesystem state.
 */
export const SEMATTRS_SYSTEM_FILESYSTEM_STATE = TMP_SYSTEM_FILESYSTEM_STATE;

/**
 * The filesystem type.
 */
export const SEMATTRS_SYSTEM_FILESYSTEM_TYPE = TMP_SYSTEM_FILESYSTEM_TYPE;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SEMATTRS_SYSTEM_NETWORK_STATE = TMP_SYSTEM_NETWORK_STATE;

/**
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 */
export const SEMATTRS_SYSTEM_PROCESS_STATUS = TMP_SYSTEM_PROCESS_STATUS;

/**
 * Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found [here](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
 */
export const SEMATTRS_ANDROID_OS_API_LEVEL = TMP_ANDROID_OS_API_LEVEL;

/**
 * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS =
  TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS;

/**
 * The value of the `AttributesToGet` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET =
  TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET;

/**
 * The value of the `ConsistentRead` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ =
  TMP_AWS_DYNAMODB_CONSISTENT_READ;

/**
 * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
 */
export const SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY =
  TMP_AWS_DYNAMODB_CONSUMED_CAPACITY;

/**
 * The value of the `Count` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_COUNT = TMP_AWS_DYNAMODB_COUNT;

/**
 * The value of the `ExclusiveStartTableName` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE =
  TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE;

/**
 * The JSON-serialized value of each item in the `GlobalSecondaryIndexUpdates` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES =
  TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES;

/**
 * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES =
  TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES;

/**
 * The value of the `IndexName` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_INDEX_NAME = TMP_AWS_DYNAMODB_INDEX_NAME;

/**
 * The JSON-serialized value of the `ItemCollectionMetrics` response field.
 */
export const SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS =
  TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS;

/**
 * The value of the `Limit` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_LIMIT = TMP_AWS_DYNAMODB_LIMIT;

/**
 * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
 */
export const SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES =
  TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES;

/**
 * The value of the `ProjectionExpression` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_PROJECTION = TMP_AWS_DYNAMODB_PROJECTION;

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
 * The value of the `ScanIndexForward` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = TMP_AWS_DYNAMODB_SCAN_FORWARD;

/**
 * The value of the `ScannedCount` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT =
  TMP_AWS_DYNAMODB_SCANNED_COUNT;

/**
 * The value of the `Segment` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SEGMENT = TMP_AWS_DYNAMODB_SEGMENT;

/**
 * The value of the `Select` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_SELECT = TMP_AWS_DYNAMODB_SELECT;

/**
 * The number of items in the `TableNames` response parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = TMP_AWS_DYNAMODB_TABLE_COUNT;

/**
 * The keys in the `RequestItems` object field.
 */
export const SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = TMP_AWS_DYNAMODB_TABLE_NAMES;

/**
 * The value of the `TotalSegments` request parameter.
 */
export const SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS =
  TMP_AWS_DYNAMODB_TOTAL_SEGMENTS;

/**
 * Array of brand name and version separated by a space.
 *
 * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
 */
export const SEMATTRS_BROWSER_BRANDS = TMP_BROWSER_BRANDS;

/**
 * Preferred language of the user using the browser.
 *
 * Note: This value is intended to be taken from the Navigator API `navigator.language`.
 */
export const SEMATTRS_BROWSER_LANGUAGE = TMP_BROWSER_LANGUAGE;

/**
 * A boolean that is true if the browser is running on a mobile device.
 *
 * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute SHOULD be left unset.
 */
export const SEMATTRS_BROWSER_MOBILE = TMP_BROWSER_MOBILE;

/**
* The platform on which the browser is running.
*
* Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API SHOULD NOT be used instead and this attribute SHOULD be left unset in order for the values to be consistent.
The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
*/
export const SEMATTRS_BROWSER_PLATFORM = TMP_BROWSER_PLATFORM;

/**
 * Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the server side, and when communicating through an intermediary, `client.address` SHOULD represent the client address behind any intermediaries,  for example proxies, if it&#39;s available.
 */
export const SEMATTRS_CLIENT_ADDRESS = TMP_CLIENT_ADDRESS;

/**
 * Client port number.
 *
 * Note: When observed from the server side, and when communicating through an intermediary, `client.port` SHOULD represent the client port behind any intermediaries,  for example proxies, if it&#39;s available.
 */
export const SEMATTRS_CLIENT_PORT = TMP_CLIENT_PORT;

/**
 * The cloud account ID the resource is assigned to.
 */
export const SEMATTRS_CLOUD_ACCOUNT_ID = TMP_CLOUD_ACCOUNT_ID;

/**
 * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
 *
 * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
 */
export const SEMATTRS_CLOUD_AVAILABILITY_ZONE = TMP_CLOUD_AVAILABILITY_ZONE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const SEMATTRS_CLOUD_PLATFORM = TMP_CLOUD_PLATFORM;

/**
 * Name of the cloud provider.
 */
export const SEMATTRS_CLOUD_PROVIDER = TMP_CLOUD_PROVIDER;

/**
 * The geographical region the resource is running.
 *
 * Note: Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://www.tencentcloud.com/document/product/213/6091).
 */
export const SEMATTRS_CLOUD_REGION = TMP_CLOUD_REGION;

/**
* Cloud provider-specific native identifier of the monitored cloud resource (e.g. an [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) on AWS, a [fully qualified resource ID](https://learn.microsoft.com/rest/api/resources/resources/get-by-id) on Azure, a [full resource name](https://cloud.google.com/apis/design/resource_names#full_resource_name) on GCP).
*
* Note: On some cloud providers, it may not be possible to determine the full ID at startup,
so it may be necessary to set `cloud.resource_id` as a span attribute instead.

The exact value to use for `cloud.resource_id` depends on the cloud provider.
The following well-known definitions MUST be used if you set this attribute and they apply:

* **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
  Take care not to use the &#34;invoked ARN&#34; directly but replace any
  [alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html)
  with the resolved function version, as the same runtime instance may be invokable with
  multiple different aliases.
* **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
* **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/rest/api/resources/resources/get-by-id) of the invoked function,
  *not* the function app, having the form
  `/subscriptions/&lt;SUBSCIPTION_GUID&gt;/resourceGroups/&lt;RG&gt;/providers/Microsoft.Web/sites/&lt;FUNCAPP&gt;/functions/&lt;FUNC&gt;`.
  This means that a span attribute MUST be used, as an Azure function app can host multiple functions that would usually share
  a TracerProvider.
*/
export const SEMATTRS_CLOUD_RESOURCE_ID = TMP_CLOUD_RESOURCE_ID;

/**
 * The [event_id](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#id) uniquely identifies the event.
 */
export const SEMATTRS_CLOUDEVENTS_EVENT_ID = TMP_CLOUDEVENTS_EVENT_ID;

/**
 * The [source](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#source-1) identifies the context in which an event happened.
 */
export const SEMATTRS_CLOUDEVENTS_EVENT_SOURCE = TMP_CLOUDEVENTS_EVENT_SOURCE;

/**
 * The [version of the CloudEvents specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#specversion) which the event uses.
 */
export const SEMATTRS_CLOUDEVENTS_EVENT_SPEC_VERSION =
  TMP_CLOUDEVENTS_EVENT_SPEC_VERSION;

/**
 * The [subject](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#subject) of the event in the context of the event producer (identified by source).
 */
export const SEMATTRS_CLOUDEVENTS_EVENT_SUBJECT = TMP_CLOUDEVENTS_EVENT_SUBJECT;

/**
 * The [event_type](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#type) contains a value describing the type of event related to the originating occurrence.
 */
export const SEMATTRS_CLOUDEVENTS_EVENT_TYPE = TMP_CLOUDEVENTS_EVENT_TYPE;

/**
 * The column number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
 */
export const SEMATTRS_CODE_COLUMN = TMP_CODE_COLUMN;

/**
 * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
 */
export const SEMATTRS_CODE_FILEPATH = TMP_CODE_FILEPATH;

/**
 * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
 */
export const SEMATTRS_CODE_FUNCTION = TMP_CODE_FUNCTION;

/**
 * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
 */
export const SEMATTRS_CODE_LINENO = TMP_CODE_LINENO;

/**
 * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
 */
export const SEMATTRS_CODE_NAMESPACE = TMP_CODE_NAMESPACE;

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 */
export const SEMATTRS_CODE_STACKTRACE = TMP_CODE_STACKTRACE;

/**
 * The command used to run the container (i.e. the command name).
 *
 * Note: If using embedded credentials or sensitive data, it is recommended to remove them to prevent potential leakage.
 */
export const SEMATTRS_CONTAINER_COMMAND = TMP_CONTAINER_COMMAND;

/**
 * All the command arguments (including the command/executable itself) run by the container. [2].
 */
export const SEMATTRS_CONTAINER_COMMAND_ARGS = TMP_CONTAINER_COMMAND_ARGS;

/**
 * The full command run by the container as a single string representing the full command. [2].
 */
export const SEMATTRS_CONTAINER_COMMAND_LINE = TMP_CONTAINER_COMMAND_LINE;

/**
 * The CPU state for this data point.
 */
export const SEMATTRS_CONTAINER_CPU_STATE = TMP_CONTAINER_CPU_STATE;

/**
 * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
 */
export const SEMATTRS_CONTAINER_ID = TMP_CONTAINER_ID;

/**
* Runtime specific image identifier. Usually a hash algorithm followed by a UUID.
*
* Note: Docker defines a sha256 of the image id; `container.image.id` corresponds to the `Image` field from the Docker container inspect [API](https://docs.docker.com/engine/api/v1.43/#tag/Container/operation/ContainerInspect) endpoint.
K8s defines a link to the container registry repository with digest `&#34;imageID&#34;: &#34;registry.azurecr.io /namespace/service/dockerfile@sha256:bdeabd40c3a8a492eaf9e8e44d0ebbb84bac7ee25ac0cf8a7159d25f62555625&#34;`.
The ID is assinged by the container runtime and can vary in different environments. Consider using `oci.manifest.digest` if it is important to identify the same image in different environments/runtimes.
*/
export const SEMATTRS_CONTAINER_IMAGE_ID = TMP_CONTAINER_IMAGE_ID;

/**
 * Name of the image the container was built on.
 */
export const SEMATTRS_CONTAINER_IMAGE_NAME = TMP_CONTAINER_IMAGE_NAME;

/**
 * Repo digests of the container image as provided by the container runtime.
 *
 * Note: [Docker](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect) and [CRI](https://github.com/kubernetes/cri-api/blob/c75ef5b473bbe2d0a4fc92f82235efd665ea8e9f/pkg/apis/runtime/v1/api.proto#L1237-L1238) report those under the `RepoDigests` field.
 */
export const SEMATTRS_CONTAINER_IMAGE_REPO_DIGESTS =
  TMP_CONTAINER_IMAGE_REPO_DIGESTS;

/**
 * Container image tags. An example can be found in [Docker Image Inspect](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect). Should be only the `&lt;tag&gt;` section of the full name for example from `registry.example.com/my-org/my-image:&lt;tag&gt;`.
 */
export const SEMATTRS_CONTAINER_IMAGE_TAGS = TMP_CONTAINER_IMAGE_TAGS;

/**
 * Container name used by container runtime.
 */
export const SEMATTRS_CONTAINER_NAME = TMP_CONTAINER_NAME;

/**
 * The container runtime managing this container.
 */
export const SEMATTRS_CONTAINER_RUNTIME = TMP_CONTAINER_RUNTIME;

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 */
export const SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL =
  TMP_DB_CASSANDRA_CONSISTENCY_LEVEL;

/**
 * The data center of the coordinating node for a query.
 */
export const SEMATTRS_DB_CASSANDRA_COORDINATOR_DC =
  TMP_DB_CASSANDRA_COORDINATOR_DC;

/**
 * The ID of the coordinating node for a query.
 */
export const SEMATTRS_DB_CASSANDRA_COORDINATOR_ID =
  TMP_DB_CASSANDRA_COORDINATOR_ID;

/**
 * Whether or not the query is idempotent.
 */
export const SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = TMP_DB_CASSANDRA_IDEMPOTENCE;

/**
 * The fetch size used for paging, i.e. how many rows will be returned at once.
 */
export const SEMATTRS_DB_CASSANDRA_PAGE_SIZE = TMP_DB_CASSANDRA_PAGE_SIZE;

/**
 * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
 */
export const SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT =
  TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT;

/**
 * The name of the primary Cassandra table that the operation is acting upon, including the keyspace name (if applicable).
 *
 * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 */
export const SEMATTRS_DB_CASSANDRA_TABLE = TMP_DB_CASSANDRA_TABLE;

/**
 * Unique Cosmos client instance id.
 */
export const SEMATTRS_DB_COSMOSDB_CLIENT_ID = TMP_DB_COSMOSDB_CLIENT_ID;

/**
 * Cosmos client connection mode.
 */
export const SEMATTRS_DB_COSMOSDB_CONNECTION_MODE =
  TMP_DB_COSMOSDB_CONNECTION_MODE;

/**
 * Cosmos DB container name.
 */
export const SEMATTRS_DB_COSMOSDB_CONTAINER = TMP_DB_COSMOSDB_CONTAINER;

/**
 * CosmosDB Operation Type.
 */
export const SEMATTRS_DB_COSMOSDB_OPERATION_TYPE =
  TMP_DB_COSMOSDB_OPERATION_TYPE;

/**
 * RU consumed for that operation.
 */
export const SEMATTRS_DB_COSMOSDB_REQUEST_CHARGE =
  TMP_DB_COSMOSDB_REQUEST_CHARGE;

/**
 * Request payload size in bytes.
 */
export const SEMATTRS_DB_COSMOSDB_REQUEST_CONTENT_LENGTH =
  TMP_DB_COSMOSDB_REQUEST_CONTENT_LENGTH;

/**
 * Cosmos DB status code.
 */
export const SEMATTRS_DB_COSMOSDB_STATUS_CODE = TMP_DB_COSMOSDB_STATUS_CODE;

/**
 * Cosmos DB sub status code.
 */
export const SEMATTRS_DB_COSMOSDB_SUB_STATUS_CODE =
  TMP_DB_COSMOSDB_SUB_STATUS_CODE;

/**
 * Represents the identifier of an Elasticsearch cluster.
 */
export const SEMATTRS_DB_ELASTICSEARCH_CLUSTER_NAME =
  TMP_DB_ELASTICSEARCH_CLUSTER_NAME;

/**
 * An identifier (address, unique name, or any other identifier) of the database instance that is executing queries or mutations on the current connection. This is useful in cases where the database is running in a clustered environment and the instrumentation is able to record the node executing the query. The client may obtain this value in databases like MySQL using queries like `select @@hostname`.
 */
export const SEMATTRS_DB_INSTANCE_ID = TMP_DB_INSTANCE_ID;

/**
 * The MongoDB collection being accessed within the database stated in `db.name`.
 */
export const SEMATTRS_DB_MONGODB_COLLECTION = TMP_DB_MONGODB_COLLECTION;

/**
 * The Microsoft SQL Server [instance name](https://docs.microsoft.com/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
 *
 * Note: If setting a `db.mssql.instance_name`, `server.port` is no longer required (but still recommended if non-standard).
 */
export const SEMATTRS_DB_MSSQL_INSTANCE_NAME = TMP_DB_MSSQL_INSTANCE_NAME;

/**
 * This attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
 *
 * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;. In case there are multiple layers that could be considered for database name (e.g. Oracle instance name and schema name), the database name to be used is the more specific layer (e.g. Oracle schema name).
 */
export const SEMATTRS_DB_NAME = TMP_DB_NAME;

/**
 * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
 *
 * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
 */
export const SEMATTRS_DB_OPERATION = TMP_DB_OPERATION;

/**
 * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
 */
export const SEMATTRS_DB_REDIS_DATABASE_INDEX = TMP_DB_REDIS_DATABASE_INDEX;

/**
 * The name of the primary table that the operation is acting upon, including the database name (if applicable).
 *
 * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
 */
export const SEMATTRS_DB_SQL_TABLE = TMP_DB_SQL_TABLE;

/**
 * The database statement being executed.
 */
export const SEMATTRS_DB_STATEMENT = TMP_DB_STATEMENT;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const SEMATTRS_DB_SYSTEM = TMP_DB_SYSTEM;

/**
 * Username for accessing the database.
 */
export const SEMATTRS_DB_USER = TMP_DB_USER;

/**
* Name of the [deployment environment](https://wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
*
* Note: `deployment.environment` does not affect the uniqueness constraints defined through
the `service.namespace`, `service.name` and `service.instance.id` resource attributes.
This implies that resources carrying the following attribute combinations MUST be
considered to be identifying the same service:

* `service.name=frontend`, `deployment.environment=production`
* `service.name=frontend`, `deployment.environment=staging`.
*/
export const SEMATTRS_DEPLOYMENT_ENVIRONMENT = TMP_DEPLOYMENT_ENVIRONMENT;

/**
 * Deprecated, use `server.address`, `server.port` attributes instead.
 *
 * @deprecated "Replaced by `server.address` and `server.port`.".
 */
export const SEMATTRS_DB_CONNECTION_STRING = TMP_DB_CONNECTION_STRING;

/**
 * Deprecated, use `db.instance.id` instead.
 *
 * @deprecated Replaced by `db.instance.id`.
 */
export const SEMATTRS_DB_ELASTICSEARCH_NODE_NAME =
  TMP_DB_ELASTICSEARCH_NODE_NAME;

/**
 * Removed, no replacement at this time.
 *
 * @deprecated Removed as not used.
 */
export const SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = TMP_DB_JDBC_DRIVER_CLASSNAME;

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const SEMATTRS_HTTP_FLAVOR = TMP_HTTP_FLAVOR;

/**
 * Deprecated, use `http.request.method` instead.
 *
 * @deprecated Replaced by `http.request.method`.
 */
export const SEMATTRS_HTTP_METHOD = TMP_HTTP_METHOD;

/**
 * Deprecated, use `http.request.header.content-length` instead.
 *
 * @deprecated Replaced by `http.request.header.content-length`.
 */
export const SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH =
  TMP_HTTP_REQUEST_CONTENT_LENGTH;

/**
 * Deprecated, use `http.response.header.content-length` instead.
 *
 * @deprecated Replaced by `http.response.header.content-length`.
 */
export const SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH =
  TMP_HTTP_RESPONSE_CONTENT_LENGTH;

/**
 * Deprecated, use `url.scheme` instead.
 *
 * @deprecated Replaced by `url.scheme` instead.
 */
export const SEMATTRS_HTTP_SCHEME = TMP_HTTP_SCHEME;

/**
 * Deprecated, use `http.response.status_code` instead.
 *
 * @deprecated Replaced by `http.response.status_code`.
 */
export const SEMATTRS_HTTP_STATUS_CODE = TMP_HTTP_STATUS_CODE;

/**
 * Deprecated, use `url.path` and `url.query` instead.
 *
 * @deprecated Split to `url.path` and `url.query.
 */
export const SEMATTRS_HTTP_TARGET = TMP_HTTP_TARGET;

/**
 * Deprecated, use `url.full` instead.
 *
 * @deprecated Replaced by `url.full`.
 */
export const SEMATTRS_HTTP_URL = TMP_HTTP_URL;

/**
 * Deprecated, use `user_agent.original` instead.
 *
 * @deprecated Replaced by `user_agent.original`.
 */
export const SEMATTRS_HTTP_USER_AGENT = TMP_HTTP_USER_AGENT;

/**
 * &#34;Deprecated, use `messaging.destination.partition.id` instead.&#34;.
 *
 * @deprecated Replaced by `messaging.destination.partition.id`.
 */
export const SEMATTRS_MESSAGING_KAFKA_DESTINATION_PARTITION =
  TMP_MESSAGING_KAFKA_DESTINATION_PARTITION;

/**
 * Deprecated, use `server.address`.
 *
 * @deprecated Replaced by `server.address`.
 */
export const SEMATTRS_NET_HOST_NAME = TMP_NET_HOST_NAME;

/**
 * Deprecated, use `server.port`.
 *
 * @deprecated Replaced by `server.port`.
 */
export const SEMATTRS_NET_HOST_PORT = TMP_NET_HOST_PORT;

/**
 * Deprecated, use `server.address` on client spans and `client.address` on server spans.
 *
 * @deprecated Replaced by `server.address` on client spans and `client.address` on server spans.
 */
export const SEMATTRS_NET_PEER_NAME = TMP_NET_PEER_NAME;

/**
 * Deprecated, use `server.port` on client spans and `client.port` on server spans.
 *
 * @deprecated Replaced by `server.port` on client spans and `client.port` on server spans.
 */
export const SEMATTRS_NET_PEER_PORT = TMP_NET_PEER_PORT;

/**
 * Deprecated, use `network.protocol.name`.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const SEMATTRS_NET_PROTOCOL_NAME = TMP_NET_PROTOCOL_NAME;

/**
 * Deprecated, use `network.protocol.version`.
 *
 * @deprecated Replaced by `network.protocol.version`.
 */
export const SEMATTRS_NET_PROTOCOL_VERSION = TMP_NET_PROTOCOL_VERSION;

/**
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const SEMATTRS_NET_SOCK_FAMILY = TMP_NET_SOCK_FAMILY;

/**
 * Deprecated, use `network.local.address`.
 *
 * @deprecated Replaced by `network.local.address`.
 */
export const SEMATTRS_NET_SOCK_HOST_ADDR = TMP_NET_SOCK_HOST_ADDR;

/**
 * Deprecated, use `network.local.port`.
 *
 * @deprecated Replaced by `network.local.port`.
 */
export const SEMATTRS_NET_SOCK_HOST_PORT = TMP_NET_SOCK_HOST_PORT;

/**
 * Deprecated, use `network.peer.address`.
 *
 * @deprecated Replaced by `network.peer.address`.
 */
export const SEMATTRS_NET_SOCK_PEER_ADDR = TMP_NET_SOCK_PEER_ADDR;

/**
 * Deprecated, no replacement at this time.
 *
 * @deprecated Removed.
 */
export const SEMATTRS_NET_SOCK_PEER_NAME = TMP_NET_SOCK_PEER_NAME;

/**
 * Deprecated, use `network.peer.port`.
 *
 * @deprecated Replaced by `network.peer.port`.
 */
export const SEMATTRS_NET_SOCK_PEER_PORT = TMP_NET_SOCK_PEER_PORT;

/**
 * Deprecated, use `network.transport`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const SEMATTRS_NET_TRANSPORT = TMP_NET_TRANSPORT;

/**
 * Deprecated, use `system.process.status` instead.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SEMATTRS_SYSTEM_PROCESSES_STATUS = TMP_SYSTEM_PROCESSES_STATUS;

/**
 * Destination address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the source side, and when communicating through an intermediary, `destination.address` SHOULD represent the destination address behind any intermediaries, for example proxies, if it&#39;s available.
 */
export const SEMATTRS_DESTINATION_ADDRESS = TMP_DESTINATION_ADDRESS;

/**
 * Destination port number.
 */
export const SEMATTRS_DESTINATION_PORT = TMP_DESTINATION_PORT;

/**
 * A unique identifier representing the device.
 *
 * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
 */
export const SEMATTRS_DEVICE_ID = TMP_DEVICE_ID;

/**
 * The name of the device manufacturer.
 *
 * Note: The Android OS provides this field via [Build](https://developer.android.com/reference/android/os/Build#MANUFACTURER). iOS apps SHOULD hardcode the value `Apple`.
 */
export const SEMATTRS_DEVICE_MANUFACTURER = TMP_DEVICE_MANUFACTURER;

/**
 * The model identifier for the device.
 *
 * Note: It&#39;s recommended this value represents a machine-readable version of the model identifier rather than the market or consumer-friendly name of the device.
 */
export const SEMATTRS_DEVICE_MODEL_IDENTIFIER = TMP_DEVICE_MODEL_IDENTIFIER;

/**
 * The marketing name for the device model.
 *
 * Note: It&#39;s recommended this value represents a human-readable version of the device model rather than a machine-readable alternative.
 */
export const SEMATTRS_DEVICE_MODEL_NAME = TMP_DEVICE_MODEL_NAME;

/**
 * The disk IO operation direction.
 */
export const SEMATTRS_DISK_IO_DIRECTION = TMP_DISK_IO_DIRECTION;

/**
 * The name being queried.
 *
 * Note: If the name field contains non-printable characters (below 32 or above 126), those characters should be represented as escaped base 10 integers (\DDD). Back slashes and quotes should be escaped. Tabs, carriage returns, and line feeds should be converted to \t, \r, and \n respectively.
 */
export const SEMATTRS_DNS_QUESTION_NAME = TMP_DNS_QUESTION_NAME;

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
export const SEMATTRS_ERROR_TYPE = TMP_ERROR_TYPE;

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
export const SEMATTRS_EXCEPTION_ESCAPED = TMP_EXCEPTION_ESCAPED;

/**
 * The exception message.
 */
export const SEMATTRS_EXCEPTION_MESSAGE = TMP_EXCEPTION_MESSAGE;

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 */
export const SEMATTRS_EXCEPTION_STACKTRACE = TMP_EXCEPTION_STACKTRACE;

/**
 * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
 */
export const SEMATTRS_EXCEPTION_TYPE = TMP_EXCEPTION_TYPE;

/**
 * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
 */
export const SEMATTRS_FAAS_COLDSTART = TMP_FAAS_COLDSTART;

/**
 * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
 */
export const SEMATTRS_FAAS_CRON = TMP_FAAS_CRON;

/**
 * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
 */
export const SEMATTRS_FAAS_DOCUMENT_COLLECTION = TMP_FAAS_DOCUMENT_COLLECTION;

/**
 * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
 */
export const SEMATTRS_FAAS_DOCUMENT_NAME = TMP_FAAS_DOCUMENT_NAME;

/**
 * Describes the type of the operation that was performed on the data.
 */
export const SEMATTRS_FAAS_DOCUMENT_OPERATION = TMP_FAAS_DOCUMENT_OPERATION;

/**
 * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 */
export const SEMATTRS_FAAS_DOCUMENT_TIME = TMP_FAAS_DOCUMENT_TIME;

/**
 * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
 *
 * Note: * **AWS Lambda:** Use the (full) log stream name.
 */
export const SEMATTRS_FAAS_INSTANCE = TMP_FAAS_INSTANCE;

/**
 * The invocation ID of the current function invocation.
 */
export const SEMATTRS_FAAS_INVOCATION_ID = TMP_FAAS_INVOCATION_ID;

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
 * The amount of memory available to the serverless function converted to Bytes.
 *
 * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information (which must be multiplied by 1,048,576).
 */
export const SEMATTRS_FAAS_MAX_MEMORY = TMP_FAAS_MAX_MEMORY;

/**
* The name of the single function that this runtime instance executes.
*
* Note: This is the name of the function as configured/deployed on the FaaS
platform and is usually different from the name of the callback
function (which may be stored in the
[`code.namespace`/`code.function`](/docs/general/attributes.md#source-code-attributes)
span attributes).

For some cloud providers, the above definition is ambiguous. The following
definition of function name MUST be used for this attribute
(and consequently the span name) for the listed cloud providers/products:

* **Azure:**  The full name `&lt;FUNCAPP&gt;/&lt;FUNC&gt;`, i.e., function app name
  followed by a forward slash followed by the function name (this form
  can also be seen in the resource JSON for the function).
  This means that a span attribute MUST be used, as an Azure function
  app can host multiple functions that would usually share
  a TracerProvider (see also the `cloud.resource_id` attribute).
*/
export const SEMATTRS_FAAS_NAME = TMP_FAAS_NAME;

/**
 * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 */
export const SEMATTRS_FAAS_TIME = TMP_FAAS_TIME;

/**
 * Type of the trigger which caused this function invocation.
 */
export const SEMATTRS_FAAS_TRIGGER = TMP_FAAS_TRIGGER;

/**
* The immutable version of the function being executed.
*
* Note: Depending on the cloud provider and platform, use:

* **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
  (an integer represented as a decimal string).
* **Google Cloud Run (Services):** The [revision](https://cloud.google.com/run/docs/managing/revisions)
  (i.e., the function name plus the revision suffix).
* **Google Cloud Functions:** The value of the
  [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
* **Azure Functions:** Not applicable. Do not set this attribute.
*/
export const SEMATTRS_FAAS_VERSION = TMP_FAAS_VERSION;

/**
 * The unique identifier of the feature flag.
 */
export const SEMATTRS_FEATURE_FLAG_KEY = TMP_FEATURE_FLAG_KEY;

/**
 * The name of the service provider that performs the flag evaluation.
 */
export const SEMATTRS_FEATURE_FLAG_PROVIDER_NAME =
  TMP_FEATURE_FLAG_PROVIDER_NAME;

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
export const SEMATTRS_FEATURE_FLAG_VARIANT = TMP_FEATURE_FLAG_VARIANT;

/**
 * Directory where the file is located. It should include the drive letter, when appropriate.
 */
export const SEMATTRS_FILE_DIRECTORY = TMP_FILE_DIRECTORY;

/**
 * File extension, excluding the leading dot.
 *
 * Note: When the file name has multiple extensions (example.tar.gz), only the last one should be captured (&#34;gz&#34;, not &#34;tar.gz&#34;).
 */
export const SEMATTRS_FILE_EXTENSION = TMP_FILE_EXTENSION;

/**
 * Name of the file including the extension, without the directory.
 */
export const SEMATTRS_FILE_NAME = TMP_FILE_NAME;

/**
 * Full path to the file, including the file name. It should include the drive letter, when appropriate.
 */
export const SEMATTRS_FILE_PATH = TMP_FILE_PATH;

/**
 * File size in bytes.
 */
export const SEMATTRS_FILE_SIZE = TMP_FILE_SIZE;

/**
 * The name of the Cloud Run [execution](https://cloud.google.com/run/docs/managing/job-executions) being run for the Job, as set by the [`CLOUD_RUN_EXECUTION`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
 */
export const SEMATTRS_GCP_CLOUD_RUN_JOB_EXECUTION =
  TMP_GCP_CLOUD_RUN_JOB_EXECUTION;

/**
 * The index for a task within an execution as provided by the [`CLOUD_RUN_TASK_INDEX`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
 */
export const SEMATTRS_GCP_CLOUD_RUN_JOB_TASK_INDEX =
  TMP_GCP_CLOUD_RUN_JOB_TASK_INDEX;

/**
 * The hostname of a GCE instance. This is the full value of the default or [custom hostname](https://cloud.google.com/compute/docs/instances/custom-hostname-vm).
 */
export const SEMATTRS_GCP_GCE_INSTANCE_HOSTNAME = TMP_GCP_GCE_INSTANCE_HOSTNAME;

/**
 * The instance name of a GCE instance. This is the value provided by `host.name`, the visible name of the instance in the Cloud Console UI, and the prefix for the default hostname of the instance as defined by the [default internal DNS name](https://cloud.google.com/compute/docs/internal-dns#instance-fully-qualified-domain-names).
 */
export const SEMATTRS_GCP_GCE_INSTANCE_NAME = TMP_GCP_GCE_INSTANCE_NAME;

/**
 * The CPU architecture the host system is running on.
 */
export const SEMATTRS_HOST_ARCH = TMP_HOST_ARCH;

/**
 * The amount of level 2 memory cache available to the processor (in Bytes).
 */
export const SEMATTRS_HOST_CPU_CACHE_L2_SIZE = TMP_HOST_CPU_CACHE_L2_SIZE;

/**
 * Family or generation of the CPU.
 */
export const SEMATTRS_HOST_CPU_FAMILY = TMP_HOST_CPU_FAMILY;

/**
 * Model identifier. It provides more granular information about the CPU, distinguishing it from other CPUs within the same family.
 */
export const SEMATTRS_HOST_CPU_MODEL_ID = TMP_HOST_CPU_MODEL_ID;

/**
 * Model designation of the processor.
 */
export const SEMATTRS_HOST_CPU_MODEL_NAME = TMP_HOST_CPU_MODEL_NAME;

/**
 * Stepping or core revisions.
 */
export const SEMATTRS_HOST_CPU_STEPPING = TMP_HOST_CPU_STEPPING;

/**
 * Processor manufacturer identifier. A maximum 12-character string.
 *
 * Note: [CPUID](https://wiki.osdev.org/CPUID) command returns the vendor ID string in EBX, EDX and ECX registers. Writing these to memory in this order results in a 12-character string.
 */
export const SEMATTRS_HOST_CPU_VENDOR_ID = TMP_HOST_CPU_VENDOR_ID;

/**
 * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized systems, this should be the `machine-id`. See the table below for the sources to use to determine the `machine-id` based on operating system.
 */
export const SEMATTRS_HOST_ID = TMP_HOST_ID;

/**
 * VM image ID or host OS image ID. For Cloud, this value is from the provider.
 */
export const SEMATTRS_HOST_IMAGE_ID = TMP_HOST_IMAGE_ID;

/**
 * Name of the VM image or OS install the host was instantiated from.
 */
export const SEMATTRS_HOST_IMAGE_NAME = TMP_HOST_IMAGE_NAME;

/**
 * The version string of the VM image or host OS as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
 */
export const SEMATTRS_HOST_IMAGE_VERSION = TMP_HOST_IMAGE_VERSION;

/**
 * Available IP addresses of the host, excluding loopback interfaces.
 *
 * Note: IPv4 Addresses MUST be specified in dotted-quad notation. IPv6 addresses MUST be specified in the [RFC 5952](https://www.rfc-editor.org/rfc/rfc5952.html) format.
 */
export const SEMATTRS_HOST_IP = TMP_HOST_IP;

/**
 * Available MAC addresses of the host, excluding loopback interfaces.
 *
 * Note: MAC Addresses MUST be represented in [IEEE RA hexadecimal form](https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf): as hyphen-separated octets in uppercase hexadecimal form from most to least significant.
 */
export const SEMATTRS_HOST_MAC = TMP_HOST_MAC;

/**
 * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
 */
export const SEMATTRS_HOST_NAME = TMP_HOST_NAME;

/**
 * Type of host. For Cloud, this must be the machine type.
 */
export const SEMATTRS_HOST_TYPE = TMP_HOST_TYPE;

/**
 * State of the HTTP connection in the HTTP connection pool.
 */
export const SEMATTRS_HTTP_CONNECTION_STATE = TMP_HTTP_CONNECTION_STATE;

/**
 * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 */
export const SEMATTRS_HTTP_REQUEST_BODY_SIZE = TMP_HTTP_REQUEST_BODY_SIZE;

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
export const SEMATTRS_HTTP_REQUEST_METHOD = TMP_HTTP_REQUEST_METHOD;

/**
 * Original HTTP method sent by the client in the request line.
 */
export const SEMATTRS_HTTP_REQUEST_METHOD_ORIGINAL =
  TMP_HTTP_REQUEST_METHOD_ORIGINAL;

/**
 * The ordinal number of request resending attempt (for any reason, including redirects).
 *
 * Note: The resend count SHOULD be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
 */
export const SEMATTRS_HTTP_REQUEST_RESEND_COUNT = TMP_HTTP_REQUEST_RESEND_COUNT;

/**
 * The total size of the request in bytes. This should be the total number of bytes sent over the wire, including the request line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and request body if any.
 */
export const SEMATTRS_HTTP_REQUEST_SIZE = TMP_HTTP_REQUEST_SIZE;

/**
 * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 */
export const SEMATTRS_HTTP_RESPONSE_BODY_SIZE = TMP_HTTP_RESPONSE_BODY_SIZE;

/**
 * The total size of the response in bytes. This should be the total number of bytes sent over the wire, including the status line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and response body and trailers if any.
 */
export const SEMATTRS_HTTP_RESPONSE_SIZE = TMP_HTTP_RESPONSE_SIZE;

/**
 * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
 */
export const SEMATTRS_HTTP_RESPONSE_STATUS_CODE = TMP_HTTP_RESPONSE_STATUS_CODE;

/**
* The matched route, that is, the path template in the format used by the respective server framework.
*
* Note: MUST NOT be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
*/
export const SEMATTRS_HTTP_ROUTE = TMP_HTTP_ROUTE;

/**
 * The name of the cluster.
 */
export const SEMATTRS_K8S_CLUSTER_NAME = TMP_K8S_CLUSTER_NAME;

/**
* A pseudo-ID for the cluster, set to the UID of the `kube-system` namespace.
*
* Note: K8s doesn&#39;t have support for obtaining a cluster ID. If this is ever
added, we will recommend collecting the `k8s.cluster.uid` through the
official APIs. In the meantime, we are able to use the `uid` of the
`kube-system` namespace as a proxy for cluster ID. Read on for the
rationale.

Every object created in a K8s cluster is assigned a distinct UID. The
`kube-system` namespace is used by Kubernetes itself and will exist
for the lifetime of the cluster. Using the `uid` of the `kube-system`
namespace is a reasonable proxy for the K8s ClusterID as it will only
change if the cluster is rebuilt. Furthermore, Kubernetes UIDs are
UUIDs as standardized by
[ISO/IEC 9834-8 and ITU-T X.667](https://www.itu.int/ITU-T/studygroups/com17/oid.html).
Which states:

&gt; If generated according to one of the mechanisms defined in Rec.
  ITU-T X.667 | ISO/IEC 9834-8, a UUID is either guaranteed to be
  different from all other UUIDs generated before 3603 A.D., or is
  extremely likely to be different (depending on the mechanism chosen).

Therefore, UIDs between clusters should be extremely unlikely to
conflict.
*/
export const SEMATTRS_K8S_CLUSTER_UID = TMP_K8S_CLUSTER_UID;

/**
 * The name of the Container from Pod specification, must be unique within a Pod. Container runtime usually uses different globally unique name (`container.name`).
 */
export const SEMATTRS_K8S_CONTAINER_NAME = TMP_K8S_CONTAINER_NAME;

/**
 * Number of times the container was restarted. This attribute can be used to identify a particular container (running or stopped) within a container spec.
 */
export const SEMATTRS_K8S_CONTAINER_RESTART_COUNT =
  TMP_K8S_CONTAINER_RESTART_COUNT;

/**
 * The name of the CronJob.
 */
export const SEMATTRS_K8S_CRONJOB_NAME = TMP_K8S_CRONJOB_NAME;

/**
 * The UID of the CronJob.
 */
export const SEMATTRS_K8S_CRONJOB_UID = TMP_K8S_CRONJOB_UID;

/**
 * The name of the DaemonSet.
 */
export const SEMATTRS_K8S_DAEMONSET_NAME = TMP_K8S_DAEMONSET_NAME;

/**
 * The UID of the DaemonSet.
 */
export const SEMATTRS_K8S_DAEMONSET_UID = TMP_K8S_DAEMONSET_UID;

/**
 * The name of the Deployment.
 */
export const SEMATTRS_K8S_DEPLOYMENT_NAME = TMP_K8S_DEPLOYMENT_NAME;

/**
 * The UID of the Deployment.
 */
export const SEMATTRS_K8S_DEPLOYMENT_UID = TMP_K8S_DEPLOYMENT_UID;

/**
 * The name of the Job.
 */
export const SEMATTRS_K8S_JOB_NAME = TMP_K8S_JOB_NAME;

/**
 * The UID of the Job.
 */
export const SEMATTRS_K8S_JOB_UID = TMP_K8S_JOB_UID;

/**
 * The name of the namespace that the pod is running in.
 */
export const SEMATTRS_K8S_NAMESPACE_NAME = TMP_K8S_NAMESPACE_NAME;

/**
 * The name of the Node.
 */
export const SEMATTRS_K8S_NODE_NAME = TMP_K8S_NODE_NAME;

/**
 * The UID of the Node.
 */
export const SEMATTRS_K8S_NODE_UID = TMP_K8S_NODE_UID;

/**
 * The name of the Pod.
 */
export const SEMATTRS_K8S_POD_NAME = TMP_K8S_POD_NAME;

/**
 * The UID of the Pod.
 */
export const SEMATTRS_K8S_POD_UID = TMP_K8S_POD_UID;

/**
 * The name of the ReplicaSet.
 */
export const SEMATTRS_K8S_REPLICASET_NAME = TMP_K8S_REPLICASET_NAME;

/**
 * The UID of the ReplicaSet.
 */
export const SEMATTRS_K8S_REPLICASET_UID = TMP_K8S_REPLICASET_UID;

/**
 * The name of the StatefulSet.
 */
export const SEMATTRS_K8S_STATEFULSET_NAME = TMP_K8S_STATEFULSET_NAME;

/**
 * The UID of the StatefulSet.
 */
export const SEMATTRS_K8S_STATEFULSET_UID = TMP_K8S_STATEFULSET_UID;

/**
 * The number of messages sent, received, or processed in the scope of the batching operation.
 *
 * Note: Instrumentations SHOULD NOT set `messaging.batch.message_count` on spans that operate with a single message. When a messaging client library supports both batch and single-message API for the same operation, instrumentations SHOULD use `messaging.batch.message_count` for batching APIs and SHOULD NOT use it for single-message APIs.
 */
export const SEMATTRS_MESSAGING_BATCH_MESSAGE_COUNT =
  TMP_MESSAGING_BATCH_MESSAGE_COUNT;

/**
 * A unique identifier for the client that consumes or produces a message.
 */
export const SEMATTRS_MESSAGING_CLIENT_ID = TMP_MESSAGING_CLIENT_ID;

/**
 * A boolean that is true if the message destination is anonymous (could be unnamed or have auto-generated name).
 */
export const SEMATTRS_MESSAGING_DESTINATION_ANONYMOUS =
  TMP_MESSAGING_DESTINATION_ANONYMOUS;

/**
* The message destination name.
*
* Note: Destination name SHOULD uniquely identify a specific queue, topic or other entity within the broker. If
the broker doesn&#39;t have such notion, the destination name SHOULD uniquely identify the broker.
*/
export const SEMATTRS_MESSAGING_DESTINATION_NAME =
  TMP_MESSAGING_DESTINATION_NAME;

/**
 * The identifier of the partition messages are sent to or received from, unique within the `messaging.destination.name`.
 */
export const SEMATTRS_MESSAGING_DESTINATION_PARTITION_ID =
  TMP_MESSAGING_DESTINATION_PARTITION_ID;

/**
 * Low cardinality representation of the messaging destination name.
 *
 * Note: Destination names could be constructed from templates. An example would be a destination name involving a user name or product id. Although the destination name in this case is of high cardinality, the underlying template is of low cardinality and can be effectively used for grouping and aggregation.
 */
export const SEMATTRS_MESSAGING_DESTINATION_TEMPLATE =
  TMP_MESSAGING_DESTINATION_TEMPLATE;

/**
 * A boolean that is true if the message destination is temporary and might not exist anymore after messages are processed.
 */
export const SEMATTRS_MESSAGING_DESTINATION_TEMPORARY =
  TMP_MESSAGING_DESTINATION_TEMPORARY;

/**
 * A boolean that is true if the publish message destination is anonymous (could be unnamed or have auto-generated name).
 */
export const SEMATTRS_MESSAGING_DESTINATION_PUBLISH_ANONYMOUS =
  TMP_MESSAGING_DESTINATION_PUBLISH_ANONYMOUS;

/**
* The name of the original destination the message was published to.
*
* Note: The name SHOULD uniquely identify a specific queue, topic, or other entity within the broker. If
the broker doesn&#39;t have such notion, the original destination name SHOULD uniquely identify the broker.
*/
export const SEMATTRS_MESSAGING_DESTINATION_PUBLISH_NAME =
  TMP_MESSAGING_DESTINATION_PUBLISH_NAME;

/**
 * The name of the consumer group the event consumer is associated with.
 */
export const SEMATTRS_MESSAGING_EVENTHUBS_CONSUMER_GROUP =
  TMP_MESSAGING_EVENTHUBS_CONSUMER_GROUP;

/**
 * The UTC epoch seconds at which the message has been accepted and stored in the entity.
 */
export const SEMATTRS_MESSAGING_EVENTHUBS_MESSAGE_ENQUEUED_TIME =
  TMP_MESSAGING_EVENTHUBS_MESSAGE_ENQUEUED_TIME;

/**
 * The ordering key for a given message. If the attribute is not present, the message does not have an ordering key.
 */
export const SEMATTRS_MESSAGING_GCP_PUBSUB_MESSAGE_ORDERING_KEY =
  TMP_MESSAGING_GCP_PUBSUB_MESSAGE_ORDERING_KEY;

/**
 * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
 */
export const SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP =
  TMP_MESSAGING_KAFKA_CONSUMER_GROUP;

/**
 * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message.id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
 *
 * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
 */
export const SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY =
  TMP_MESSAGING_KAFKA_MESSAGE_KEY;

/**
 * The offset of a record in the corresponding Kafka partition.
 */
export const SEMATTRS_MESSAGING_KAFKA_MESSAGE_OFFSET =
  TMP_MESSAGING_KAFKA_MESSAGE_OFFSET;

/**
 * A boolean that is true if the message is a tombstone.
 */
export const SEMATTRS_MESSAGING_KAFKA_MESSAGE_TOMBSTONE =
  TMP_MESSAGING_KAFKA_MESSAGE_TOMBSTONE;

/**
* The size of the message body in bytes.
*
* Note: This can refer to both the compressed or uncompressed body size. If both sizes are known, the uncompressed
body size should be used.
*/
export const SEMATTRS_MESSAGING_MESSAGE_BODY_SIZE =
  TMP_MESSAGING_MESSAGE_BODY_SIZE;

/**
 * The conversation ID identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
 */
export const SEMATTRS_MESSAGING_MESSAGE_CONVERSATION_ID =
  TMP_MESSAGING_MESSAGE_CONVERSATION_ID;

/**
* The size of the message body and metadata in bytes.
*
* Note: This can refer to both the compressed or uncompressed size. If both sizes are known, the uncompressed
size should be used.
*/
export const SEMATTRS_MESSAGING_MESSAGE_ENVELOPE_SIZE =
  TMP_MESSAGING_MESSAGE_ENVELOPE_SIZE;

/**
 * A value used by the messaging system as an identifier for the message, represented as a string.
 */
export const SEMATTRS_MESSAGING_MESSAGE_ID = TMP_MESSAGING_MESSAGE_ID;

/**
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 */
export const SEMATTRS_MESSAGING_OPERATION = TMP_MESSAGING_OPERATION;

/**
 * RabbitMQ message routing key.
 */
export const SEMATTRS_MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY =
  TMP_MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY;

/**
 * RabbitMQ message delivery tag.
 */
export const SEMATTRS_MESSAGING_RABBITMQ_MESSAGE_DELIVERY_TAG =
  TMP_MESSAGING_RABBITMQ_MESSAGE_DELIVERY_TAG;

/**
 * Name of the RocketMQ producer/consumer group that is handling the message. The client type is identified by the SpanKind.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_CLIENT_GROUP =
  TMP_MESSAGING_ROCKETMQ_CLIENT_GROUP;

/**
 * Model of message consumption. This only applies to consumer spans.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL =
  TMP_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL;

/**
 * The delay time level for delay message, which determines the message delay time.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL =
  TMP_MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL;

/**
 * The timestamp in milliseconds that the delay message is expected to be delivered to consumer.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP =
  TMP_MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP;

/**
 * It is essential for FIFO message. Messages that belong to the same message group are always processed one by one within the same consumer group.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_MESSAGE_GROUP =
  TMP_MESSAGING_ROCKETMQ_MESSAGE_GROUP;

/**
 * Key(s) of message, another way to mark message besides message id.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_MESSAGE_KEYS =
  TMP_MESSAGING_ROCKETMQ_MESSAGE_KEYS;

/**
 * The secondary classifier of message besides topic.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_MESSAGE_TAG =
  TMP_MESSAGING_ROCKETMQ_MESSAGE_TAG;

/**
 * Type of message.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_MESSAGE_TYPE =
  TMP_MESSAGING_ROCKETMQ_MESSAGE_TYPE;

/**
 * Namespace of RocketMQ resources, resources in different namespaces are individual.
 */
export const SEMATTRS_MESSAGING_ROCKETMQ_NAMESPACE =
  TMP_MESSAGING_ROCKETMQ_NAMESPACE;

/**
 * The name of the subscription in the topic messages are received from.
 */
export const SEMATTRS_MESSAGING_SERVICEBUS_DESTINATION_SUBSCRIPTION_NAME =
  TMP_MESSAGING_SERVICEBUS_DESTINATION_SUBSCRIPTION_NAME;

/**
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 */
export const SEMATTRS_MESSAGING_SERVICEBUS_DISPOSITION_STATUS =
  TMP_MESSAGING_SERVICEBUS_DISPOSITION_STATUS;

/**
 * Number of deliveries that have been attempted for this message.
 */
export const SEMATTRS_MESSAGING_SERVICEBUS_MESSAGE_DELIVERY_COUNT =
  TMP_MESSAGING_SERVICEBUS_MESSAGE_DELIVERY_COUNT;

/**
 * The UTC epoch seconds at which the message has been accepted and stored in the entity.
 */
export const SEMATTRS_MESSAGING_SERVICEBUS_MESSAGE_ENQUEUED_TIME =
  TMP_MESSAGING_SERVICEBUS_MESSAGE_ENQUEUED_TIME;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const SEMATTRS_MESSAGING_SYSTEM = TMP_MESSAGING_SYSTEM;

/**
 * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
 */
export const SEMATTRS_NETWORK_CARRIER_ICC = TMP_NETWORK_CARRIER_ICC;

/**
 * The mobile carrier country code.
 */
export const SEMATTRS_NETWORK_CARRIER_MCC = TMP_NETWORK_CARRIER_MCC;

/**
 * The mobile carrier network code.
 */
export const SEMATTRS_NETWORK_CARRIER_MNC = TMP_NETWORK_CARRIER_MNC;

/**
 * The name of the mobile carrier.
 */
export const SEMATTRS_NETWORK_CARRIER_NAME = TMP_NETWORK_CARRIER_NAME;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const SEMATTRS_NETWORK_CONNECTION_SUBTYPE =
  TMP_NETWORK_CONNECTION_SUBTYPE;

/**
 * The internet connection type.
 */
export const SEMATTRS_NETWORK_CONNECTION_TYPE = TMP_NETWORK_CONNECTION_TYPE;

/**
 * The network IO operation direction.
 */
export const SEMATTRS_NETWORK_IO_DIRECTION = TMP_NETWORK_IO_DIRECTION;

/**
 * Local address of the network connection - IP address or Unix domain socket name.
 */
export const SEMATTRS_NETWORK_LOCAL_ADDRESS = TMP_NETWORK_LOCAL_ADDRESS;

/**
 * Local port number of the network connection.
 */
export const SEMATTRS_NETWORK_LOCAL_PORT = TMP_NETWORK_LOCAL_PORT;

/**
 * Peer address of the network connection - IP address or Unix domain socket name.
 */
export const SEMATTRS_NETWORK_PEER_ADDRESS = TMP_NETWORK_PEER_ADDRESS;

/**
 * Peer port number of the network connection.
 */
export const SEMATTRS_NETWORK_PEER_PORT = TMP_NETWORK_PEER_PORT;

/**
 * [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
 *
 * Note: The value SHOULD be normalized to lowercase.
 */
export const SEMATTRS_NETWORK_PROTOCOL_NAME = TMP_NETWORK_PROTOCOL_NAME;

/**
 * The actual version of the protocol used for network communication.
 *
 * Note: If protocol version is subject to negotiation (for example using [ALPN](https://www.rfc-editor.org/rfc/rfc7301.html)), this attribute SHOULD be set to the negotiated version. If the actual protocol version is not known, this attribute SHOULD NOT be set.
 */
export const SEMATTRS_NETWORK_PROTOCOL_VERSION = TMP_NETWORK_PROTOCOL_VERSION;

/**
* [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
*
* Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
*/
export const SEMATTRS_NETWORK_TRANSPORT = TMP_NETWORK_TRANSPORT;

/**
 * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
 *
 * Note: The value SHOULD be normalized to lowercase.
 */
export const SEMATTRS_NETWORK_TYPE = TMP_NETWORK_TYPE;

/**
* The digest of the OCI image manifest. For container images specifically is the digest by which the container image is known.
*
* Note: Follows [OCI Image Manifest Specification](https://github.com/opencontainers/image-spec/blob/main/manifest.md), and specifically the [Digest property](https://github.com/opencontainers/image-spec/blob/main/descriptor.md#digests).
An example can be found in [Example Image Manifest](https://docs.docker.com/registry/spec/manifest-v2-2/#example-image-manifest).
*/
export const SEMATTRS_OCI_MANIFEST_DIGEST = TMP_OCI_MANIFEST_DIGEST;

/**
 * Unique identifier for a particular build or compilation of the operating system.
 */
export const SEMATTRS_OS_BUILD_ID = TMP_OS_BUILD_ID;

/**
 * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
 */
export const SEMATTRS_OS_DESCRIPTION = TMP_OS_DESCRIPTION;

/**
 * Human readable operating system name.
 */
export const SEMATTRS_OS_NAME = TMP_OS_NAME;

/**
 * The operating system type.
 */
export const SEMATTRS_OS_TYPE = TMP_OS_TYPE;

/**
 * The version string of the operating system as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
 */
export const SEMATTRS_OS_VERSION = TMP_OS_VERSION;

/**
 * The [`service.name`](/docs/resource/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
 */
export const SEMATTRS_PEER_SERVICE = TMP_PEER_SERVICE;

/**
 * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
 */
export const SEMATTRS_PROCESS_COMMAND = TMP_PROCESS_COMMAND;

/**
 * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
 */
export const SEMATTRS_PROCESS_COMMAND_ARGS = TMP_PROCESS_COMMAND_ARGS;

/**
 * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
 */
export const SEMATTRS_PROCESS_COMMAND_LINE = TMP_PROCESS_COMMAND_LINE;

/**
 * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
 */
export const SEMATTRS_PROCESS_EXECUTABLE_NAME = TMP_PROCESS_EXECUTABLE_NAME;

/**
 * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
 */
export const SEMATTRS_PROCESS_EXECUTABLE_PATH = TMP_PROCESS_EXECUTABLE_PATH;

/**
 * The username of the user that owns the process.
 */
export const SEMATTRS_PROCESS_OWNER = TMP_PROCESS_OWNER;

/**
 * Parent Process identifier (PPID).
 */
export const SEMATTRS_PROCESS_PARENT_PID = TMP_PROCESS_PARENT_PID;

/**
 * Process identifier (PID).
 */
export const SEMATTRS_PROCESS_PID = TMP_PROCESS_PID;

/**
 * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
 */
export const SEMATTRS_PROCESS_RUNTIME_DESCRIPTION =
  TMP_PROCESS_RUNTIME_DESCRIPTION;

/**
 * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
 */
export const SEMATTRS_PROCESS_RUNTIME_NAME = TMP_PROCESS_RUNTIME_NAME;

/**
 * The version of the runtime of this process, as returned by the runtime without modification.
 */
export const SEMATTRS_PROCESS_RUNTIME_VERSION = TMP_PROCESS_RUNTIME_VERSION;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const SEMATTRS_RPC_CONNECT_RPC_ERROR_CODE =
  TMP_RPC_CONNECT_RPC_ERROR_CODE;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 */
export const SEMATTRS_RPC_GRPC_STATUS_CODE = TMP_RPC_GRPC_STATUS_CODE;

/**
 * `error.code` property of response if it is an error response.
 */
export const SEMATTRS_RPC_JSONRPC_ERROR_CODE = TMP_RPC_JSONRPC_ERROR_CODE;

/**
 * `error.message` property of response if it is an error response.
 */
export const SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = TMP_RPC_JSONRPC_ERROR_MESSAGE;

/**
 * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
 */
export const SEMATTRS_RPC_JSONRPC_REQUEST_ID = TMP_RPC_JSONRPC_REQUEST_ID;

/**
 * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 doesn&#39;t specify this, the value can be omitted.
 */
export const SEMATTRS_RPC_JSONRPC_VERSION = TMP_RPC_JSONRPC_VERSION;

/**
 * The name of the (logical) method being called, must be equal to the $method part in the span name.
 *
 * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
 */
export const SEMATTRS_RPC_METHOD = TMP_RPC_METHOD;

/**
 * The full (logical) name of the service being called, including its package name, if applicable.
 *
 * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
 */
export const SEMATTRS_RPC_SERVICE = TMP_RPC_SERVICE;

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 */
export const SEMATTRS_RPC_SYSTEM = TMP_RPC_SYSTEM;

/**
 * Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the client side, and when communicating through an intermediary, `server.address` SHOULD represent the server address behind any intermediaries, for example proxies, if it&#39;s available.
 */
export const SEMATTRS_SERVER_ADDRESS = TMP_SERVER_ADDRESS;

/**
 * Server port number.
 *
 * Note: When observed from the client side, and when communicating through an intermediary, `server.port` SHOULD represent the server port behind any intermediaries, for example proxies, if it&#39;s available.
 */
export const SEMATTRS_SERVER_PORT = TMP_SERVER_PORT;

/**
* The string ID of the service instance.
*
* Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words
`service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to
distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled
service).

Implementations, such as SDKs, are recommended to generate a random Version 1 or Version 4 [RFC
4122](https://www.ietf.org/rfc/rfc4122.txt) UUID, but are free to use an inherent unique ID as the source of
this value if stability is desirable. In that case, the ID SHOULD be used as source of a UUID Version 5 and
SHOULD use the following UUID as the namespace: `4d63009a-8d0f-11ee-aad7-4c796ed8e320`.

UUIDs are typically recommended, as only an opaque value for the purposes of identifying a service instance is
needed. Similar to what can be seen in the man page for the
[`/etc/machine-id`](https://www.freedesktop.org/software/systemd/man/machine-id.html) file, the underlying
data, such as pod name and namespace should be treated as confidential, being the user&#39;s choice to expose it
or not via another resource attribute.

For applications running behind an application server (like unicorn), we do not recommend using one identifier
for all processes participating in the application. Instead, it&#39;s recommended each division (e.g. a worker
thread in unicorn) to have its own instance.id.

It&#39;s not recommended for a Collector to set `service.instance.id` if it can&#39;t unambiguously determine the
service instance that is generating that telemetry. For instance, creating an UUID based on `pod.name` will
likely be wrong, as the Collector might not know from which container within that pod the telemetry originated.
However, Collectors can set the `service.instance.id` if they can unambiguously determine the service instance
for that telemetry. This is typically the case for scraping receivers, as they know the target address and
port.
*/
export const SEMATTRS_SERVICE_INSTANCE_ID = TMP_SERVICE_INSTANCE_ID;

/**
 * Logical name of the service.
 *
 * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
 */
export const SEMATTRS_SERVICE_NAME = TMP_SERVICE_NAME;

/**
 * A namespace for `service.name`.
 *
 * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
 */
export const SEMATTRS_SERVICE_NAMESPACE = TMP_SERVICE_NAMESPACE;

/**
 * The version string of the service API or implementation. The format is not defined by these conventions.
 */
export const SEMATTRS_SERVICE_VERSION = TMP_SERVICE_VERSION;

/**
 * A unique id to identify a session.
 */
export const SEMATTRS_SESSION_ID = TMP_SESSION_ID;

/**
 * The previous `session.id` for this user, when known.
 */
export const SEMATTRS_SESSION_PREVIOUS_ID = TMP_SESSION_PREVIOUS_ID;

/**
 * Source address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * Note: When observed from the destination side, and when communicating through an intermediary, `source.address` SHOULD represent the source address behind any intermediaries, for example proxies, if it&#39;s available.
 */
export const SEMATTRS_SOURCE_ADDRESS = TMP_SOURCE_ADDRESS;

/**
 * Source port number.
 */
export const SEMATTRS_SOURCE_PORT = TMP_SOURCE_PORT;

/**
 * The language of the telemetry SDK.
 */
export const SEMATTRS_TELEMETRY_SDK_LANGUAGE = TMP_TELEMETRY_SDK_LANGUAGE;

/**
* The name of the telemetry SDK as defined above.
*
* Note: The OpenTelemetry SDK MUST set the `telemetry.sdk.name` attribute to `opentelemetry`.
If another SDK, like a fork or a vendor-provided implementation, is used, this SDK MUST set the
`telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK&#39;s main entry point
or another suitable identifier depending on the language.
The identifier `opentelemetry` is reserved and MUST NOT be used in this case.
All custom identifiers SHOULD be stable across different versions of an implementation.
*/
export const SEMATTRS_TELEMETRY_SDK_NAME = TMP_TELEMETRY_SDK_NAME;

/**
 * The version string of the telemetry SDK.
 */
export const SEMATTRS_TELEMETRY_SDK_VERSION = TMP_TELEMETRY_SDK_VERSION;

/**
* The name of the auto instrumentation agent or distribution, if used.
*
* Note: Official auto instrumentation agents and distributions SHOULD set the `telemetry.distro.name` attribute to
a string starting with `opentelemetry-`, e.g. `opentelemetry-java-instrumentation`.
*/
export const SEMATTRS_TELEMETRY_DISTRO_NAME = TMP_TELEMETRY_DISTRO_NAME;

/**
 * The version string of the auto instrumentation agent or distribution, if used.
 */
export const SEMATTRS_TELEMETRY_DISTRO_VERSION = TMP_TELEMETRY_DISTRO_VERSION;

/**
 * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
 */
export const SEMATTRS_THREAD_ID = TMP_THREAD_ID;

/**
 * Current thread name.
 */
export const SEMATTRS_THREAD_NAME = TMP_THREAD_NAME;

/**
 * String indicating the [cipher](https://datatracker.ietf.org/doc/html/rfc5246#appendix-A.5) used during the current connection.
 *
 * Note: The values allowed for `tls.cipher` MUST be one of the `Descriptions` of the [registered TLS Cipher Suits](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#table-tls-parameters-4).
 */
export const SEMATTRS_TLS_CIPHER = TMP_TLS_CIPHER;

/**
 * PEM-encoded stand-alone certificate offered by the client. This is usually mutually-exclusive of `client.certificate_chain` since this value also exists in that list.
 */
export const SEMATTRS_TLS_CLIENT_CERTIFICATE = TMP_TLS_CLIENT_CERTIFICATE;

/**
 * Array of PEM-encoded certificates that make up the certificate chain offered by the client. This is usually mutually-exclusive of `client.certificate` since that value should be the first certificate in the chain.
 */
export const SEMATTRS_TLS_CLIENT_CERTIFICATE_CHAIN =
  TMP_TLS_CLIENT_CERTIFICATE_CHAIN;

/**
 * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 */
export const SEMATTRS_TLS_CLIENT_HASH_MD5 = TMP_TLS_CLIENT_HASH_MD5;

/**
 * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 */
export const SEMATTRS_TLS_CLIENT_HASH_SHA1 = TMP_TLS_CLIENT_HASH_SHA1;

/**
 * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 */
export const SEMATTRS_TLS_CLIENT_HASH_SHA256 = TMP_TLS_CLIENT_HASH_SHA256;

/**
 * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
 */
export const SEMATTRS_TLS_CLIENT_ISSUER = TMP_TLS_CLIENT_ISSUER;

/**
 * A hash that identifies clients based on how they perform an SSL/TLS handshake.
 */
export const SEMATTRS_TLS_CLIENT_JA3 = TMP_TLS_CLIENT_JA3;

/**
 * Date/Time indicating when client certificate is no longer considered valid.
 */
export const SEMATTRS_TLS_CLIENT_NOT_AFTER = TMP_TLS_CLIENT_NOT_AFTER;

/**
 * Date/Time indicating when client certificate is first considered valid.
 */
export const SEMATTRS_TLS_CLIENT_NOT_BEFORE = TMP_TLS_CLIENT_NOT_BEFORE;

/**
 * Also called an SNI, this tells the server which hostname to which the client is attempting to connect to.
 */
export const SEMATTRS_TLS_CLIENT_SERVER_NAME = TMP_TLS_CLIENT_SERVER_NAME;

/**
 * Distinguished name of subject of the x.509 certificate presented by the client.
 */
export const SEMATTRS_TLS_CLIENT_SUBJECT = TMP_TLS_CLIENT_SUBJECT;

/**
 * Array of ciphers offered by the client during the client hello.
 */
export const SEMATTRS_TLS_CLIENT_SUPPORTED_CIPHERS =
  TMP_TLS_CLIENT_SUPPORTED_CIPHERS;

/**
 * String indicating the curve used for the given cipher, when applicable.
 */
export const SEMATTRS_TLS_CURVE = TMP_TLS_CURVE;

/**
 * Boolean flag indicating if the TLS negotiation was successful and transitioned to an encrypted tunnel.
 */
export const SEMATTRS_TLS_ESTABLISHED = TMP_TLS_ESTABLISHED;

/**
 * String indicating the protocol being tunneled. Per the values in the [IANA registry](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids), this string should be lower case.
 */
export const SEMATTRS_TLS_NEXT_PROTOCOL = TMP_TLS_NEXT_PROTOCOL;

/**
 * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 */
export const SEMATTRS_TLS_PROTOCOL_NAME = TMP_TLS_PROTOCOL_NAME;

/**
 * Numeric part of the version parsed from the original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 */
export const SEMATTRS_TLS_PROTOCOL_VERSION = TMP_TLS_PROTOCOL_VERSION;

/**
 * Boolean flag indicating if this TLS connection was resumed from an existing TLS negotiation.
 */
export const SEMATTRS_TLS_RESUMED = TMP_TLS_RESUMED;

/**
 * PEM-encoded stand-alone certificate offered by the server. This is usually mutually-exclusive of `server.certificate_chain` since this value also exists in that list.
 */
export const SEMATTRS_TLS_SERVER_CERTIFICATE = TMP_TLS_SERVER_CERTIFICATE;

/**
 * Array of PEM-encoded certificates that make up the certificate chain offered by the server. This is usually mutually-exclusive of `server.certificate` since that value should be the first certificate in the chain.
 */
export const SEMATTRS_TLS_SERVER_CERTIFICATE_CHAIN =
  TMP_TLS_SERVER_CERTIFICATE_CHAIN;

/**
 * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 */
export const SEMATTRS_TLS_SERVER_HASH_MD5 = TMP_TLS_SERVER_HASH_MD5;

/**
 * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 */
export const SEMATTRS_TLS_SERVER_HASH_SHA1 = TMP_TLS_SERVER_HASH_SHA1;

/**
 * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 */
export const SEMATTRS_TLS_SERVER_HASH_SHA256 = TMP_TLS_SERVER_HASH_SHA256;

/**
 * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
 */
export const SEMATTRS_TLS_SERVER_ISSUER = TMP_TLS_SERVER_ISSUER;

/**
 * A hash that identifies servers based on how they perform an SSL/TLS handshake.
 */
export const SEMATTRS_TLS_SERVER_JA3S = TMP_TLS_SERVER_JA3S;

/**
 * Date/Time indicating when server certificate is no longer considered valid.
 */
export const SEMATTRS_TLS_SERVER_NOT_AFTER = TMP_TLS_SERVER_NOT_AFTER;

/**
 * Date/Time indicating when server certificate is first considered valid.
 */
export const SEMATTRS_TLS_SERVER_NOT_BEFORE = TMP_TLS_SERVER_NOT_BEFORE;

/**
 * Distinguished name of subject of the x.509 certificate presented by the server.
 */
export const SEMATTRS_TLS_SERVER_SUBJECT = TMP_TLS_SERVER_SUBJECT;

/**
 * Domain extracted from the `url.full`, such as &#34;opentelemetry.io&#34;.
 *
 * Note: In some cases a URL may refer to an IP and/or port directly, without a domain name. In this case, the IP address would go to the domain field. If the URL contains a [literal IPv6 address](https://www.rfc-editor.org/rfc/rfc2732#section-2) enclosed by `[` and `]`, the `[` and `]` characters should also be captured in the domain field.
 */
export const SEMATTRS_URL_DOMAIN = TMP_URL_DOMAIN;

/**
 * The file extension extracted from the `url.full`, excluding the leading dot.
 *
 * Note: The file extension is only set if it exists, as not every url has a file extension. When the file name has multiple extensions `example.tar.gz`, only the last one should be captured `gz`, not `tar.gz`.
 */
export const SEMATTRS_URL_EXTENSION = TMP_URL_EXTENSION;

/**
 * The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component.
 */
export const SEMATTRS_URL_FRAGMENT = TMP_URL_FRAGMENT;

/**
* Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986).
*
* Note: For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it SHOULD be included nevertheless.
`url.full` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password SHOULD be redacted and attribute&#39;s value SHOULD be `https://REDACTED:REDACTED@www.example.com/`.
`url.full` SHOULD capture the absolute URL when it is available (or can be reconstructed). Sensitive content provided in `url.full` SHOULD be scrubbed when instrumentations can identify it.
*/
export const SEMATTRS_URL_FULL = TMP_URL_FULL;

/**
* Unmodified original URL as seen in the event source.
*
* Note: In network monitoring, the observed URL may be a full URL, whereas in access logs, the URL is often just represented as a path. This field is meant to represent the URL as it was observed, complete or not.
`url.original` might contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case password and username SHOULD NOT be redacted and attribute&#39;s value SHOULD remain the same.
*/
export const SEMATTRS_URL_ORIGINAL = TMP_URL_ORIGINAL;

/**
 * The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component.
 *
 * Note: Sensitive content provided in `url.path` SHOULD be scrubbed when instrumentations can identify it.
 */
export const SEMATTRS_URL_PATH = TMP_URL_PATH;

/**
 * Port extracted from the `url.full`.
 */
export const SEMATTRS_URL_PORT = TMP_URL_PORT;

/**
 * The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component.
 *
 * Note: Sensitive content provided in `url.query` SHOULD be scrubbed when instrumentations can identify it.
 */
export const SEMATTRS_URL_QUERY = TMP_URL_QUERY;

/**
 * The highest registered url domain, stripped of the subdomain.
 *
 * Note: This value can be determined precisely with the [public suffix list](http://publicsuffix.org). For example, the registered domain for `foo.example.com` is `example.com`. Trying to approximate this by simply taking the last two labels will not work well for TLDs such as `co.uk`.
 */
export const SEMATTRS_URL_REGISTERED_DOMAIN = TMP_URL_REGISTERED_DOMAIN;

/**
 * The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
 */
export const SEMATTRS_URL_SCHEME = TMP_URL_SCHEME;

/**
 * The subdomain portion of a fully qualified domain name includes all of the names except the host name under the registered_domain. In a partially qualified domain, or if the qualification level of the full name cannot be determined, subdomain contains all of the names below the registered domain.
 *
 * Note: The subdomain portion of `www.east.mydomain.co.uk` is `east`. If the domain has multiple levels of subdomain, such as `sub2.sub1.example.com`, the subdomain field should contain `sub2.sub1`, with no trailing period.
 */
export const SEMATTRS_URL_SUBDOMAIN = TMP_URL_SUBDOMAIN;

/**
 * The effective top level domain (eTLD), also known as the domain suffix, is the last part of the domain name. For example, the top level domain for example.com is `com`.
 *
 * Note: This value can be determined precisely with the [public suffix list](http://publicsuffix.org).
 */
export const SEMATTRS_URL_TOP_LEVEL_DOMAIN = TMP_URL_TOP_LEVEL_DOMAIN;

/**
 * Name of the user-agent extracted from original. Usually refers to the browser&#39;s name.
 *
 * Note: [Example](https://www.whatsmyua.info) of extracting browser&#39;s name from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant name SHOULD be selected. In such a scenario it should align with `user_agent.version`.
 */
export const SEMATTRS_USER_AGENT_NAME = TMP_USER_AGENT_NAME;

/**
 * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
 */
export const SEMATTRS_USER_AGENT_ORIGINAL = TMP_USER_AGENT_ORIGINAL;

/**
 * Version of the user-agent extracted from original. Usually refers to the browser&#39;s version.
 *
 * Note: [Example](https://www.whatsmyua.info) of extracting browser&#39;s version from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant version SHOULD be selected. In such a scenario it should align with `user_agent.name`.
 */
export const SEMATTRS_USER_AGENT_VERSION = TMP_USER_AGENT_VERSION;

/**
 * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
 *
 * Note: This may be different from `cloud.resource_id` if an alias is involved.
 */
export const SEMATTRS_AWS_LAMBDA_INVOKED_ARN = TMP_AWS_LAMBDA_INVOKED_ARN;

/**
 * Parent-child Reference type.
 *
 * Note: The causal relationship between a child Span and a parent Span.
 */
export const SEMATTRS_OPENTRACING_REF_TYPE = TMP_OPENTRACING_REF_TYPE;

/**
 * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
 */
export const SEMATTRS_OTEL_STATUS_CODE = TMP_OTEL_STATUS_CODE;

/**
 * Description of the Status if it has a value, otherwise not set.
 */
export const SEMATTRS_OTEL_STATUS_DESCRIPTION = TMP_OTEL_STATUS_DESCRIPTION;

/**
 * The AWS request ID as returned in the response headers `x-amz-request-id` or `x-amz-requestid`.
 */
export const SEMATTRS_AWS_REQUEST_ID = TMP_AWS_REQUEST_ID;

/**
* The S3 bucket name the request refers to. Corresponds to the `--bucket` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
*
* Note: The `bucket` attribute is applicable to all S3 operations that reference a bucket, i.e. that require the bucket name as a mandatory parameter.
This applies to almost all S3 operations except `list-buckets`.
*/
export const SEMATTRS_AWS_S3_BUCKET = TMP_AWS_S3_BUCKET;

/**
* The source object (in the form `bucket`/`key`) for the copy operation.
*
* Note: The `copy_source` attribute applies to S3 copy operations and corresponds to the `--copy-source` parameter
of the [copy-object operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html).
This applies in particular to the following operations:

- [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
- [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
*/
export const SEMATTRS_AWS_S3_COPY_SOURCE = TMP_AWS_S3_COPY_SOURCE;

/**
* The delete request container that specifies the objects to be deleted.
*
* Note: The `delete` attribute is only applicable to the [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html) operation.
The `delete` attribute corresponds to the `--delete` parameter of the
[delete-objects operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-objects.html).
*/
export const SEMATTRS_AWS_S3_DELETE = TMP_AWS_S3_DELETE;

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
export const SEMATTRS_AWS_S3_KEY = TMP_AWS_S3_KEY;

/**
* The part number of the part being uploaded in a multipart-upload operation. This is a positive integer between 1 and 10,000.
*
* Note: The `part_number` attribute is only applicable to the [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
and [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html) operations.
The `part_number` attribute corresponds to the `--part-number` parameter of the
[upload-part operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html).
*/
export const SEMATTRS_AWS_S3_PART_NUMBER = TMP_AWS_S3_PART_NUMBER;

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
export const SEMATTRS_AWS_S3_UPLOAD_ID = TMP_AWS_S3_UPLOAD_ID;

/**
 * The GraphQL document being executed.
 *
 * Note: The value may be sanitized to exclude sensitive information.
 */
export const SEMATTRS_GRAPHQL_DOCUMENT = TMP_GRAPHQL_DOCUMENT;

/**
 * The name of the operation being executed.
 */
export const SEMATTRS_GRAPHQL_OPERATION_NAME = TMP_GRAPHQL_OPERATION_NAME;

/**
 * The type of the operation being executed.
 */
export const SEMATTRS_GRAPHQL_OPERATION_TYPE = TMP_GRAPHQL_OPERATION_TYPE;

/**
 * Compressed size of the message in bytes.
 */
export const SEMATTRS_MESSAGE_COMPRESSED_SIZE = TMP_MESSAGE_COMPRESSED_SIZE;

/**
 * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
 *
 * Note: This way we guarantee that the values will be consistent between different implementations.
 */
export const SEMATTRS_MESSAGE_ID = TMP_MESSAGE_ID;

/**
 * Whether this is a received or sent message.
 */
export const SEMATTRS_MESSAGE_TYPE = TMP_MESSAGE_TYPE;

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
   * Identifies the class / type of event.
   *
   * Note: Event names are subject to the same rules as [attribute names](https://github.com/open-telemetry/opentelemetry-specification/tree/v1.31.0/specification/common/attribute-naming.md). Notably, event names are namespaced to avoid collisions and provide a clean separation of semantics for events in separate domains like browser, mobile, and kubernetes.
   */
  EVENT_NAME: 'event.name';

  /**
  * A unique identifier for the Log Record.
  *
  * Note: If an id is provided, other log records with the same id will be considered duplicates and can be removed safely. This means, that two distinguishable log records MUST have different values.
The id MAY be an [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec), but other identifiers (e.g. UUID) may be used as needed.
  */
  LOG_RECORD_UID: 'log.record.uid';

  /**
   * The stream associated with the log. See below for a list of well-known values.
   */
  LOG_IOSTREAM: 'log.iostream';

  /**
   * The basename of the file.
   */
  LOG_FILE_NAME: 'log.file.name';

  /**
   * The basename of the file, with symlinks resolved.
   */
  LOG_FILE_NAME_RESOLVED: 'log.file.name_resolved';

  /**
   * The full path to the file.
   */
  LOG_FILE_PATH: 'log.file.path';

  /**
   * The full path to the file, with symlinks resolved.
   */
  LOG_FILE_PATH_RESOLVED: 'log.file.path_resolved';

  /**
   * This attribute represents the state the application has transitioned into at the occurrence of the event.
   *
   * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
   */
  IOS_STATE: 'ios.state';

  /**
   * This attribute represents the state the application has transitioned into at the occurrence of the event.
   *
   * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
   */
  ANDROID_STATE: 'android.state';

  /**
   * The name of the connection pool; unique within the instrumented application. In case the connection pool implementation doesn&#39;t provide a name, instrumentation should use a combination of `server.address` and `server.port` attributes formatted as `server.address:server.port`.
   */
  POOL_NAME: 'pool.name';

  /**
   * The state of a connection in the pool.
   */
  STATE: 'state';

  /**
   * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
   */
  ASPNETCORE_RATE_LIMITING_RESULT: 'aspnetcore.rate_limiting.result';

  /**
   * Full type name of the [`IExceptionHandler`](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.diagnostics.iexceptionhandler) implementation that handled the exception.
   */
  ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE: 'aspnetcore.diagnostics.handler.type';

  /**
   * Rate limiting policy name.
   */
  ASPNETCORE_RATE_LIMITING_POLICY: 'aspnetcore.rate_limiting.policy';

  /**
   * Flag indicating if request was handled by the application pipeline.
   */
  ASPNETCORE_REQUEST_IS_UNHANDLED: 'aspnetcore.request.is_unhandled';

  /**
   * A value that indicates whether the matched route is a fallback route.
   */
  ASPNETCORE_ROUTING_IS_FALLBACK: 'aspnetcore.routing.is_fallback';

  /**
   * SignalR HTTP connection closure status.
   */
  SIGNALR_CONNECTION_STATUS: 'signalr.connection.status';

  /**
   * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
   */
  SIGNALR_TRANSPORT: 'signalr.transport';

  /**
   * Name of the buffer pool.
   *
   * Note: Pool names are generally obtained via [BufferPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/BufferPoolMXBean.html#getName()).
   */
  JVM_BUFFER_POOL_NAME: 'jvm.buffer.pool.name';

  /**
   * Name of the memory pool.
   *
   * Note: Pool names are generally obtained via [MemoryPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/MemoryPoolMXBean.html#getName()).
   */
  JVM_MEMORY_POOL_NAME: 'jvm.memory.pool.name';

  /**
   * The type of memory.
   */
  JVM_MEMORY_TYPE: 'jvm.memory.type';

  /**
   * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
   */
  PROCESS_CPU_STATE: 'process.cpu.state';

  /**
   * The device identifier.
   */
  SYSTEM_DEVICE: 'system.device';

  /**
   * The logical CPU number [0..n-1].
   */
  SYSTEM_CPU_LOGICAL_NUMBER: 'system.cpu.logical_number';

  /**
   * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
   */
  SYSTEM_CPU_STATE: 'system.cpu.state';

  /**
   * The memory state.
   */
  SYSTEM_MEMORY_STATE: 'system.memory.state';

  /**
   * The paging access direction.
   */
  SYSTEM_PAGING_DIRECTION: 'system.paging.direction';

  /**
   * The memory paging state.
   */
  SYSTEM_PAGING_STATE: 'system.paging.state';

  /**
   * The memory paging type.
   */
  SYSTEM_PAGING_TYPE: 'system.paging.type';

  /**
   * The filesystem mode.
   */
  SYSTEM_FILESYSTEM_MODE: 'system.filesystem.mode';

  /**
   * The filesystem mount path.
   */
  SYSTEM_FILESYSTEM_MOUNTPOINT: 'system.filesystem.mountpoint';

  /**
   * The filesystem state.
   */
  SYSTEM_FILESYSTEM_STATE: 'system.filesystem.state';

  /**
   * The filesystem type.
   */
  SYSTEM_FILESYSTEM_TYPE: 'system.filesystem.type';

  /**
   * A stateless protocol MUST NOT set this attribute.
   */
  SYSTEM_NETWORK_STATE: 'system.network.state';

  /**
   * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
   */
  SYSTEM_PROCESS_STATUS: 'system.process.status';

  /**
   * Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found [here](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
   */
  ANDROID_OS_API_LEVEL: 'android.os.api_level';

  /**
   * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
   */
  AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS: 'aws.dynamodb.attribute_definitions';

  /**
   * The value of the `AttributesToGet` request parameter.
   */
  AWS_DYNAMODB_ATTRIBUTES_TO_GET: 'aws.dynamodb.attributes_to_get';

  /**
   * The value of the `ConsistentRead` request parameter.
   */
  AWS_DYNAMODB_CONSISTENT_READ: 'aws.dynamodb.consistent_read';

  /**
   * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
   */
  AWS_DYNAMODB_CONSUMED_CAPACITY: 'aws.dynamodb.consumed_capacity';

  /**
   * The value of the `Count` response parameter.
   */
  AWS_DYNAMODB_COUNT: 'aws.dynamodb.count';

  /**
   * The value of the `ExclusiveStartTableName` request parameter.
   */
  AWS_DYNAMODB_EXCLUSIVE_START_TABLE: 'aws.dynamodb.exclusive_start_table';

  /**
   * The JSON-serialized value of each item in the `GlobalSecondaryIndexUpdates` request field.
   */
  AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES: 'aws.dynamodb.global_secondary_index_updates';

  /**
   * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
   */
  AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES: 'aws.dynamodb.global_secondary_indexes';

  /**
   * The value of the `IndexName` request parameter.
   */
  AWS_DYNAMODB_INDEX_NAME: 'aws.dynamodb.index_name';

  /**
   * The JSON-serialized value of the `ItemCollectionMetrics` response field.
   */
  AWS_DYNAMODB_ITEM_COLLECTION_METRICS: 'aws.dynamodb.item_collection_metrics';

  /**
   * The value of the `Limit` request parameter.
   */
  AWS_DYNAMODB_LIMIT: 'aws.dynamodb.limit';

  /**
   * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
   */
  AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES: 'aws.dynamodb.local_secondary_indexes';

  /**
   * The value of the `ProjectionExpression` request parameter.
   */
  AWS_DYNAMODB_PROJECTION: 'aws.dynamodb.projection';

  /**
   * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
   */
  AWS_DYNAMODB_PROVISIONED_READ_CAPACITY: 'aws.dynamodb.provisioned_read_capacity';

  /**
   * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
   */
  AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY: 'aws.dynamodb.provisioned_write_capacity';

  /**
   * The value of the `ScanIndexForward` request parameter.
   */
  AWS_DYNAMODB_SCAN_FORWARD: 'aws.dynamodb.scan_forward';

  /**
   * The value of the `ScannedCount` response parameter.
   */
  AWS_DYNAMODB_SCANNED_COUNT: 'aws.dynamodb.scanned_count';

  /**
   * The value of the `Segment` request parameter.
   */
  AWS_DYNAMODB_SEGMENT: 'aws.dynamodb.segment';

  /**
   * The value of the `Select` request parameter.
   */
  AWS_DYNAMODB_SELECT: 'aws.dynamodb.select';

  /**
   * The number of items in the `TableNames` response parameter.
   */
  AWS_DYNAMODB_TABLE_COUNT: 'aws.dynamodb.table_count';

  /**
   * The keys in the `RequestItems` object field.
   */
  AWS_DYNAMODB_TABLE_NAMES: 'aws.dynamodb.table_names';

  /**
   * The value of the `TotalSegments` request parameter.
   */
  AWS_DYNAMODB_TOTAL_SEGMENTS: 'aws.dynamodb.total_segments';

  /**
   * Array of brand name and version separated by a space.
   *
   * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
   */
  BROWSER_BRANDS: 'browser.brands';

  /**
   * Preferred language of the user using the browser.
   *
   * Note: This value is intended to be taken from the Navigator API `navigator.language`.
   */
  BROWSER_LANGUAGE: 'browser.language';

  /**
   * A boolean that is true if the browser is running on a mobile device.
   *
   * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute SHOULD be left unset.
   */
  BROWSER_MOBILE: 'browser.mobile';

  /**
  * The platform on which the browser is running.
  *
  * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API SHOULD NOT be used instead and this attribute SHOULD be left unset in order for the values to be consistent.
The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
  */
  BROWSER_PLATFORM: 'browser.platform';

  /**
   * Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
   *
   * Note: When observed from the server side, and when communicating through an intermediary, `client.address` SHOULD represent the client address behind any intermediaries,  for example proxies, if it&#39;s available.
   */
  CLIENT_ADDRESS: 'client.address';

  /**
   * Client port number.
   *
   * Note: When observed from the server side, and when communicating through an intermediary, `client.port` SHOULD represent the client port behind any intermediaries,  for example proxies, if it&#39;s available.
   */
  CLIENT_PORT: 'client.port';

  /**
   * The cloud account ID the resource is assigned to.
   */
  CLOUD_ACCOUNT_ID: 'cloud.account.id';

  /**
   * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
   *
   * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
   */
  CLOUD_AVAILABILITY_ZONE: 'cloud.availability_zone';

  /**
   * The cloud platform in use.
   *
   * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
   */
  CLOUD_PLATFORM: 'cloud.platform';

  /**
   * Name of the cloud provider.
   */
  CLOUD_PROVIDER: 'cloud.provider';

  /**
   * The geographical region the resource is running.
   *
   * Note: Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://www.tencentcloud.com/document/product/213/6091).
   */
  CLOUD_REGION: 'cloud.region';

  /**
  * Cloud provider-specific native identifier of the monitored cloud resource (e.g. an [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) on AWS, a [fully qualified resource ID](https://learn.microsoft.com/rest/api/resources/resources/get-by-id) on Azure, a [full resource name](https://cloud.google.com/apis/design/resource_names#full_resource_name) on GCP).
  *
  * Note: On some cloud providers, it may not be possible to determine the full ID at startup,
so it may be necessary to set `cloud.resource_id` as a span attribute instead.

The exact value to use for `cloud.resource_id` depends on the cloud provider.
The following well-known definitions MUST be used if you set this attribute and they apply:

* **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
  Take care not to use the &#34;invoked ARN&#34; directly but replace any
  [alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html)
  with the resolved function version, as the same runtime instance may be invokable with
  multiple different aliases.
* **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
* **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/rest/api/resources/resources/get-by-id) of the invoked function,
  *not* the function app, having the form
  `/subscriptions/&lt;SUBSCIPTION_GUID&gt;/resourceGroups/&lt;RG&gt;/providers/Microsoft.Web/sites/&lt;FUNCAPP&gt;/functions/&lt;FUNC&gt;`.
  This means that a span attribute MUST be used, as an Azure function app can host multiple functions that would usually share
  a TracerProvider.
  */
  CLOUD_RESOURCE_ID: 'cloud.resource_id';

  /**
   * The [event_id](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#id) uniquely identifies the event.
   */
  CLOUDEVENTS_EVENT_ID: 'cloudevents.event_id';

  /**
   * The [source](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#source-1) identifies the context in which an event happened.
   */
  CLOUDEVENTS_EVENT_SOURCE: 'cloudevents.event_source';

  /**
   * The [version of the CloudEvents specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#specversion) which the event uses.
   */
  CLOUDEVENTS_EVENT_SPEC_VERSION: 'cloudevents.event_spec_version';

  /**
   * The [subject](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#subject) of the event in the context of the event producer (identified by source).
   */
  CLOUDEVENTS_EVENT_SUBJECT: 'cloudevents.event_subject';

  /**
   * The [event_type](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#type) contains a value describing the type of event related to the originating occurrence.
   */
  CLOUDEVENTS_EVENT_TYPE: 'cloudevents.event_type';

  /**
   * The column number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
   */
  CODE_COLUMN: 'code.column';

  /**
   * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
   */
  CODE_FILEPATH: 'code.filepath';

  /**
   * The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
   */
  CODE_FUNCTION: 'code.function';

  /**
   * The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
   */
  CODE_LINENO: 'code.lineno';

  /**
   * The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
   */
  CODE_NAMESPACE: 'code.namespace';

  /**
   * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
   */
  CODE_STACKTRACE: 'code.stacktrace';

  /**
   * The command used to run the container (i.e. the command name).
   *
   * Note: If using embedded credentials or sensitive data, it is recommended to remove them to prevent potential leakage.
   */
  CONTAINER_COMMAND: 'container.command';

  /**
   * All the command arguments (including the command/executable itself) run by the container. [2].
   */
  CONTAINER_COMMAND_ARGS: 'container.command_args';

  /**
   * The full command run by the container as a single string representing the full command. [2].
   */
  CONTAINER_COMMAND_LINE: 'container.command_line';

  /**
   * The CPU state for this data point.
   */
  CONTAINER_CPU_STATE: 'container.cpu.state';

  /**
   * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
   */
  CONTAINER_ID: 'container.id';

  /**
  * Runtime specific image identifier. Usually a hash algorithm followed by a UUID.
  *
  * Note: Docker defines a sha256 of the image id; `container.image.id` corresponds to the `Image` field from the Docker container inspect [API](https://docs.docker.com/engine/api/v1.43/#tag/Container/operation/ContainerInspect) endpoint.
K8s defines a link to the container registry repository with digest `&#34;imageID&#34;: &#34;registry.azurecr.io /namespace/service/dockerfile@sha256:bdeabd40c3a8a492eaf9e8e44d0ebbb84bac7ee25ac0cf8a7159d25f62555625&#34;`.
The ID is assinged by the container runtime and can vary in different environments. Consider using `oci.manifest.digest` if it is important to identify the same image in different environments/runtimes.
  */
  CONTAINER_IMAGE_ID: 'container.image.id';

  /**
   * Name of the image the container was built on.
   */
  CONTAINER_IMAGE_NAME: 'container.image.name';

  /**
   * Repo digests of the container image as provided by the container runtime.
   *
   * Note: [Docker](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect) and [CRI](https://github.com/kubernetes/cri-api/blob/c75ef5b473bbe2d0a4fc92f82235efd665ea8e9f/pkg/apis/runtime/v1/api.proto#L1237-L1238) report those under the `RepoDigests` field.
   */
  CONTAINER_IMAGE_REPO_DIGESTS: 'container.image.repo_digests';

  /**
   * Container image tags. An example can be found in [Docker Image Inspect](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect). Should be only the `&lt;tag&gt;` section of the full name for example from `registry.example.com/my-org/my-image:&lt;tag&gt;`.
   */
  CONTAINER_IMAGE_TAGS: 'container.image.tags';

  /**
   * Container name used by container runtime.
   */
  CONTAINER_NAME: 'container.name';

  /**
   * The container runtime managing this container.
   */
  CONTAINER_RUNTIME: 'container.runtime';

  /**
   * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
   */
  DB_CASSANDRA_CONSISTENCY_LEVEL: 'db.cassandra.consistency_level';

  /**
   * The data center of the coordinating node for a query.
   */
  DB_CASSANDRA_COORDINATOR_DC: 'db.cassandra.coordinator.dc';

  /**
   * The ID of the coordinating node for a query.
   */
  DB_CASSANDRA_COORDINATOR_ID: 'db.cassandra.coordinator.id';

  /**
   * Whether or not the query is idempotent.
   */
  DB_CASSANDRA_IDEMPOTENCE: 'db.cassandra.idempotence';

  /**
   * The fetch size used for paging, i.e. how many rows will be returned at once.
   */
  DB_CASSANDRA_PAGE_SIZE: 'db.cassandra.page_size';

  /**
   * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
   */
  DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT: 'db.cassandra.speculative_execution_count';

  /**
   * The name of the primary Cassandra table that the operation is acting upon, including the keyspace name (if applicable).
   *
   * Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
   */
  DB_CASSANDRA_TABLE: 'db.cassandra.table';

  /**
   * Unique Cosmos client instance id.
   */
  DB_COSMOSDB_CLIENT_ID: 'db.cosmosdb.client_id';

  /**
   * Cosmos client connection mode.
   */
  DB_COSMOSDB_CONNECTION_MODE: 'db.cosmosdb.connection_mode';

  /**
   * Cosmos DB container name.
   */
  DB_COSMOSDB_CONTAINER: 'db.cosmosdb.container';

  /**
   * CosmosDB Operation Type.
   */
  DB_COSMOSDB_OPERATION_TYPE: 'db.cosmosdb.operation_type';

  /**
   * RU consumed for that operation.
   */
  DB_COSMOSDB_REQUEST_CHARGE: 'db.cosmosdb.request_charge';

  /**
   * Request payload size in bytes.
   */
  DB_COSMOSDB_REQUEST_CONTENT_LENGTH: 'db.cosmosdb.request_content_length';

  /**
   * Cosmos DB status code.
   */
  DB_COSMOSDB_STATUS_CODE: 'db.cosmosdb.status_code';

  /**
   * Cosmos DB sub status code.
   */
  DB_COSMOSDB_SUB_STATUS_CODE: 'db.cosmosdb.sub_status_code';

  /**
   * Represents the identifier of an Elasticsearch cluster.
   */
  DB_ELASTICSEARCH_CLUSTER_NAME: 'db.elasticsearch.cluster.name';

  /**
   * An identifier (address, unique name, or any other identifier) of the database instance that is executing queries or mutations on the current connection. This is useful in cases where the database is running in a clustered environment and the instrumentation is able to record the node executing the query. The client may obtain this value in databases like MySQL using queries like `select @@hostname`.
   */
  DB_INSTANCE_ID: 'db.instance.id';

  /**
   * The MongoDB collection being accessed within the database stated in `db.name`.
   */
  DB_MONGODB_COLLECTION: 'db.mongodb.collection';

  /**
   * The Microsoft SQL Server [instance name](https://docs.microsoft.com/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
   *
   * Note: If setting a `db.mssql.instance_name`, `server.port` is no longer required (but still recommended if non-standard).
   */
  DB_MSSQL_INSTANCE_NAME: 'db.mssql.instance_name';

  /**
   * This attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
   *
   * Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;. In case there are multiple layers that could be considered for database name (e.g. Oracle instance name and schema name), the database name to be used is the more specific layer (e.g. Oracle schema name).
   */
  DB_NAME: 'db.name';

  /**
   * The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
   *
   * Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
   */
  DB_OPERATION: 'db.operation';

  /**
   * The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
   */
  DB_REDIS_DATABASE_INDEX: 'db.redis.database_index';

  /**
   * The name of the primary table that the operation is acting upon, including the database name (if applicable).
   *
   * Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
   */
  DB_SQL_TABLE: 'db.sql.table';

  /**
   * The database statement being executed.
   */
  DB_STATEMENT: 'db.statement';

  /**
   * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
   */
  DB_SYSTEM: 'db.system';

  /**
   * Username for accessing the database.
   */
  DB_USER: 'db.user';

  /**
  * Name of the [deployment environment](https://wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
  *
  * Note: `deployment.environment` does not affect the uniqueness constraints defined through
the `service.namespace`, `service.name` and `service.instance.id` resource attributes.
This implies that resources carrying the following attribute combinations MUST be
considered to be identifying the same service:

* `service.name=frontend`, `deployment.environment=production`
* `service.name=frontend`, `deployment.environment=staging`.
  */
  DEPLOYMENT_ENVIRONMENT: 'deployment.environment';

  /**
   * Deprecated, use `server.address`, `server.port` attributes instead.
   *
   * @deprecated "Replaced by `server.address` and `server.port`.".
   */
  DB_CONNECTION_STRING: 'db.connection_string';

  /**
   * Deprecated, use `db.instance.id` instead.
   *
   * @deprecated Replaced by `db.instance.id`.
   */
  DB_ELASTICSEARCH_NODE_NAME: 'db.elasticsearch.node.name';

  /**
   * Removed, no replacement at this time.
   *
   * @deprecated Removed as not used.
   */
  DB_JDBC_DRIVER_CLASSNAME: 'db.jdbc.driver_classname';

  /**
   * Deprecated, use `network.protocol.name` instead.
   *
   * @deprecated Replaced by `network.protocol.name`.
   */
  HTTP_FLAVOR: 'http.flavor';

  /**
   * Deprecated, use `http.request.method` instead.
   *
   * @deprecated Replaced by `http.request.method`.
   */
  HTTP_METHOD: 'http.method';

  /**
   * Deprecated, use `http.request.header.content-length` instead.
   *
   * @deprecated Replaced by `http.request.header.content-length`.
   */
  HTTP_REQUEST_CONTENT_LENGTH: 'http.request_content_length';

  /**
   * Deprecated, use `http.response.header.content-length` instead.
   *
   * @deprecated Replaced by `http.response.header.content-length`.
   */
  HTTP_RESPONSE_CONTENT_LENGTH: 'http.response_content_length';

  /**
   * Deprecated, use `url.scheme` instead.
   *
   * @deprecated Replaced by `url.scheme` instead.
   */
  HTTP_SCHEME: 'http.scheme';

  /**
   * Deprecated, use `http.response.status_code` instead.
   *
   * @deprecated Replaced by `http.response.status_code`.
   */
  HTTP_STATUS_CODE: 'http.status_code';

  /**
   * Deprecated, use `url.path` and `url.query` instead.
   *
   * @deprecated Split to `url.path` and `url.query.
   */
  HTTP_TARGET: 'http.target';

  /**
   * Deprecated, use `url.full` instead.
   *
   * @deprecated Replaced by `url.full`.
   */
  HTTP_URL: 'http.url';

  /**
   * Deprecated, use `user_agent.original` instead.
   *
   * @deprecated Replaced by `user_agent.original`.
   */
  HTTP_USER_AGENT: 'http.user_agent';

  /**
   * &#34;Deprecated, use `messaging.destination.partition.id` instead.&#34;.
   *
   * @deprecated Replaced by `messaging.destination.partition.id`.
   */
  MESSAGING_KAFKA_DESTINATION_PARTITION: 'messaging.kafka.destination.partition';

  /**
   * Deprecated, use `server.address`.
   *
   * @deprecated Replaced by `server.address`.
   */
  NET_HOST_NAME: 'net.host.name';

  /**
   * Deprecated, use `server.port`.
   *
   * @deprecated Replaced by `server.port`.
   */
  NET_HOST_PORT: 'net.host.port';

  /**
   * Deprecated, use `server.address` on client spans and `client.address` on server spans.
   *
   * @deprecated Replaced by `server.address` on client spans and `client.address` on server spans.
   */
  NET_PEER_NAME: 'net.peer.name';

  /**
   * Deprecated, use `server.port` on client spans and `client.port` on server spans.
   *
   * @deprecated Replaced by `server.port` on client spans and `client.port` on server spans.
   */
  NET_PEER_PORT: 'net.peer.port';

  /**
   * Deprecated, use `network.protocol.name`.
   *
   * @deprecated Replaced by `network.protocol.name`.
   */
  NET_PROTOCOL_NAME: 'net.protocol.name';

  /**
   * Deprecated, use `network.protocol.version`.
   *
   * @deprecated Replaced by `network.protocol.version`.
   */
  NET_PROTOCOL_VERSION: 'net.protocol.version';

  /**
   * Deprecated, use `network.transport` and `network.type`.
   *
   * @deprecated Split to `network.transport` and `network.type`.
   */
  NET_SOCK_FAMILY: 'net.sock.family';

  /**
   * Deprecated, use `network.local.address`.
   *
   * @deprecated Replaced by `network.local.address`.
   */
  NET_SOCK_HOST_ADDR: 'net.sock.host.addr';

  /**
   * Deprecated, use `network.local.port`.
   *
   * @deprecated Replaced by `network.local.port`.
   */
  NET_SOCK_HOST_PORT: 'net.sock.host.port';

  /**
   * Deprecated, use `network.peer.address`.
   *
   * @deprecated Replaced by `network.peer.address`.
   */
  NET_SOCK_PEER_ADDR: 'net.sock.peer.addr';

  /**
   * Deprecated, no replacement at this time.
   *
   * @deprecated Removed.
   */
  NET_SOCK_PEER_NAME: 'net.sock.peer.name';

  /**
   * Deprecated, use `network.peer.port`.
   *
   * @deprecated Replaced by `network.peer.port`.
   */
  NET_SOCK_PEER_PORT: 'net.sock.peer.port';

  /**
   * Deprecated, use `network.transport`.
   *
   * @deprecated Replaced by `network.transport`.
   */
  NET_TRANSPORT: 'net.transport';

  /**
   * Deprecated, use `system.process.status` instead.
   *
   * @deprecated Replaced by `system.process.status`.
   */
  SYSTEM_PROCESSES_STATUS: 'system.processes.status';

  /**
   * Destination address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
   *
   * Note: When observed from the source side, and when communicating through an intermediary, `destination.address` SHOULD represent the destination address behind any intermediaries, for example proxies, if it&#39;s available.
   */
  DESTINATION_ADDRESS: 'destination.address';

  /**
   * Destination port number.
   */
  DESTINATION_PORT: 'destination.port';

  /**
   * A unique identifier representing the device.
   *
   * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
   */
  DEVICE_ID: 'device.id';

  /**
   * The name of the device manufacturer.
   *
   * Note: The Android OS provides this field via [Build](https://developer.android.com/reference/android/os/Build#MANUFACTURER). iOS apps SHOULD hardcode the value `Apple`.
   */
  DEVICE_MANUFACTURER: 'device.manufacturer';

  /**
   * The model identifier for the device.
   *
   * Note: It&#39;s recommended this value represents a machine-readable version of the model identifier rather than the market or consumer-friendly name of the device.
   */
  DEVICE_MODEL_IDENTIFIER: 'device.model.identifier';

  /**
   * The marketing name for the device model.
   *
   * Note: It&#39;s recommended this value represents a human-readable version of the device model rather than a machine-readable alternative.
   */
  DEVICE_MODEL_NAME: 'device.model.name';

  /**
   * The disk IO operation direction.
   */
  DISK_IO_DIRECTION: 'disk.io.direction';

  /**
   * The name being queried.
   *
   * Note: If the name field contains non-printable characters (below 32 or above 126), those characters should be represented as escaped base 10 integers (\DDD). Back slashes and quotes should be escaped. Tabs, carriage returns, and line feeds should be converted to \t, \r, and \n respectively.
   */
  DNS_QUESTION_NAME: 'dns.question.name';

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
  ERROR_TYPE: 'error.type';

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
  EXCEPTION_ESCAPED: 'exception.escaped';

  /**
   * The exception message.
   */
  EXCEPTION_MESSAGE: 'exception.message';

  /**
   * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
   */
  EXCEPTION_STACKTRACE: 'exception.stacktrace';

  /**
   * The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
   */
  EXCEPTION_TYPE: 'exception.type';

  /**
   * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
   */
  FAAS_COLDSTART: 'faas.coldstart';

  /**
   * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
   */
  FAAS_CRON: 'faas.cron';

  /**
   * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
   */
  FAAS_DOCUMENT_COLLECTION: 'faas.document.collection';

  /**
   * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
   */
  FAAS_DOCUMENT_NAME: 'faas.document.name';

  /**
   * Describes the type of the operation that was performed on the data.
   */
  FAAS_DOCUMENT_OPERATION: 'faas.document.operation';

  /**
   * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
   */
  FAAS_DOCUMENT_TIME: 'faas.document.time';

  /**
   * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
   *
   * Note: * **AWS Lambda:** Use the (full) log stream name.
   */
  FAAS_INSTANCE: 'faas.instance';

  /**
   * The invocation ID of the current function invocation.
   */
  FAAS_INVOCATION_ID: 'faas.invocation_id';

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
   * The amount of memory available to the serverless function converted to Bytes.
   *
   * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information (which must be multiplied by 1,048,576).
   */
  FAAS_MAX_MEMORY: 'faas.max_memory';

  /**
  * The name of the single function that this runtime instance executes.
  *
  * Note: This is the name of the function as configured/deployed on the FaaS
platform and is usually different from the name of the callback
function (which may be stored in the
[`code.namespace`/`code.function`](/docs/general/attributes.md#source-code-attributes)
span attributes).

For some cloud providers, the above definition is ambiguous. The following
definition of function name MUST be used for this attribute
(and consequently the span name) for the listed cloud providers/products:

* **Azure:**  The full name `&lt;FUNCAPP&gt;/&lt;FUNC&gt;`, i.e., function app name
  followed by a forward slash followed by the function name (this form
  can also be seen in the resource JSON for the function).
  This means that a span attribute MUST be used, as an Azure function
  app can host multiple functions that would usually share
  a TracerProvider (see also the `cloud.resource_id` attribute).
  */
  FAAS_NAME: 'faas.name';

  /**
   * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
   */
  FAAS_TIME: 'faas.time';

  /**
   * Type of the trigger which caused this function invocation.
   */
  FAAS_TRIGGER: 'faas.trigger';

  /**
  * The immutable version of the function being executed.
  *
  * Note: Depending on the cloud provider and platform, use:

* **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
  (an integer represented as a decimal string).
* **Google Cloud Run (Services):** The [revision](https://cloud.google.com/run/docs/managing/revisions)
  (i.e., the function name plus the revision suffix).
* **Google Cloud Functions:** The value of the
  [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
* **Azure Functions:** Not applicable. Do not set this attribute.
  */
  FAAS_VERSION: 'faas.version';

  /**
   * The unique identifier of the feature flag.
   */
  FEATURE_FLAG_KEY: 'feature_flag.key';

  /**
   * The name of the service provider that performs the flag evaluation.
   */
  FEATURE_FLAG_PROVIDER_NAME: 'feature_flag.provider_name';

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
  FEATURE_FLAG_VARIANT: 'feature_flag.variant';

  /**
   * Directory where the file is located. It should include the drive letter, when appropriate.
   */
  FILE_DIRECTORY: 'file.directory';

  /**
   * File extension, excluding the leading dot.
   *
   * Note: When the file name has multiple extensions (example.tar.gz), only the last one should be captured (&#34;gz&#34;, not &#34;tar.gz&#34;).
   */
  FILE_EXTENSION: 'file.extension';

  /**
   * Name of the file including the extension, without the directory.
   */
  FILE_NAME: 'file.name';

  /**
   * Full path to the file, including the file name. It should include the drive letter, when appropriate.
   */
  FILE_PATH: 'file.path';

  /**
   * File size in bytes.
   */
  FILE_SIZE: 'file.size';

  /**
   * The name of the Cloud Run [execution](https://cloud.google.com/run/docs/managing/job-executions) being run for the Job, as set by the [`CLOUD_RUN_EXECUTION`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
   */
  GCP_CLOUD_RUN_JOB_EXECUTION: 'gcp.cloud_run.job.execution';

  /**
   * The index for a task within an execution as provided by the [`CLOUD_RUN_TASK_INDEX`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
   */
  GCP_CLOUD_RUN_JOB_TASK_INDEX: 'gcp.cloud_run.job.task_index';

  /**
   * The hostname of a GCE instance. This is the full value of the default or [custom hostname](https://cloud.google.com/compute/docs/instances/custom-hostname-vm).
   */
  GCP_GCE_INSTANCE_HOSTNAME: 'gcp.gce.instance.hostname';

  /**
   * The instance name of a GCE instance. This is the value provided by `host.name`, the visible name of the instance in the Cloud Console UI, and the prefix for the default hostname of the instance as defined by the [default internal DNS name](https://cloud.google.com/compute/docs/internal-dns#instance-fully-qualified-domain-names).
   */
  GCP_GCE_INSTANCE_NAME: 'gcp.gce.instance.name';

  /**
   * The CPU architecture the host system is running on.
   */
  HOST_ARCH: 'host.arch';

  /**
   * The amount of level 2 memory cache available to the processor (in Bytes).
   */
  HOST_CPU_CACHE_L2_SIZE: 'host.cpu.cache.l2.size';

  /**
   * Family or generation of the CPU.
   */
  HOST_CPU_FAMILY: 'host.cpu.family';

  /**
   * Model identifier. It provides more granular information about the CPU, distinguishing it from other CPUs within the same family.
   */
  HOST_CPU_MODEL_ID: 'host.cpu.model.id';

  /**
   * Model designation of the processor.
   */
  HOST_CPU_MODEL_NAME: 'host.cpu.model.name';

  /**
   * Stepping or core revisions.
   */
  HOST_CPU_STEPPING: 'host.cpu.stepping';

  /**
   * Processor manufacturer identifier. A maximum 12-character string.
   *
   * Note: [CPUID](https://wiki.osdev.org/CPUID) command returns the vendor ID string in EBX, EDX and ECX registers. Writing these to memory in this order results in a 12-character string.
   */
  HOST_CPU_VENDOR_ID: 'host.cpu.vendor.id';

  /**
   * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized systems, this should be the `machine-id`. See the table below for the sources to use to determine the `machine-id` based on operating system.
   */
  HOST_ID: 'host.id';

  /**
   * VM image ID or host OS image ID. For Cloud, this value is from the provider.
   */
  HOST_IMAGE_ID: 'host.image.id';

  /**
   * Name of the VM image or OS install the host was instantiated from.
   */
  HOST_IMAGE_NAME: 'host.image.name';

  /**
   * The version string of the VM image or host OS as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
   */
  HOST_IMAGE_VERSION: 'host.image.version';

  /**
   * Available IP addresses of the host, excluding loopback interfaces.
   *
   * Note: IPv4 Addresses MUST be specified in dotted-quad notation. IPv6 addresses MUST be specified in the [RFC 5952](https://www.rfc-editor.org/rfc/rfc5952.html) format.
   */
  HOST_IP: 'host.ip';

  /**
   * Available MAC addresses of the host, excluding loopback interfaces.
   *
   * Note: MAC Addresses MUST be represented in [IEEE RA hexadecimal form](https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf): as hyphen-separated octets in uppercase hexadecimal form from most to least significant.
   */
  HOST_MAC: 'host.mac';

  /**
   * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
   */
  HOST_NAME: 'host.name';

  /**
   * Type of host. For Cloud, this must be the machine type.
   */
  HOST_TYPE: 'host.type';

  /**
   * State of the HTTP connection in the HTTP connection pool.
   */
  HTTP_CONNECTION_STATE: 'http.connection.state';

  /**
   * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
   */
  HTTP_REQUEST_BODY_SIZE: 'http.request.body.size';

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
  HTTP_REQUEST_METHOD: 'http.request.method';

  /**
   * Original HTTP method sent by the client in the request line.
   */
  HTTP_REQUEST_METHOD_ORIGINAL: 'http.request.method_original';

  /**
   * The ordinal number of request resending attempt (for any reason, including redirects).
   *
   * Note: The resend count SHOULD be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
   */
  HTTP_REQUEST_RESEND_COUNT: 'http.request.resend_count';

  /**
   * The total size of the request in bytes. This should be the total number of bytes sent over the wire, including the request line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and request body if any.
   */
  HTTP_REQUEST_SIZE: 'http.request.size';

  /**
   * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
   */
  HTTP_RESPONSE_BODY_SIZE: 'http.response.body.size';

  /**
   * The total size of the response in bytes. This should be the total number of bytes sent over the wire, including the status line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and response body and trailers if any.
   */
  HTTP_RESPONSE_SIZE: 'http.response.size';

  /**
   * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
   */
  HTTP_RESPONSE_STATUS_CODE: 'http.response.status_code';

  /**
  * The matched route, that is, the path template in the format used by the respective server framework.
  *
  * Note: MUST NOT be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
  */
  HTTP_ROUTE: 'http.route';

  /**
   * The name of the cluster.
   */
  K8S_CLUSTER_NAME: 'k8s.cluster.name';

  /**
  * A pseudo-ID for the cluster, set to the UID of the `kube-system` namespace.
  *
  * Note: K8s doesn&#39;t have support for obtaining a cluster ID. If this is ever
added, we will recommend collecting the `k8s.cluster.uid` through the
official APIs. In the meantime, we are able to use the `uid` of the
`kube-system` namespace as a proxy for cluster ID. Read on for the
rationale.

Every object created in a K8s cluster is assigned a distinct UID. The
`kube-system` namespace is used by Kubernetes itself and will exist
for the lifetime of the cluster. Using the `uid` of the `kube-system`
namespace is a reasonable proxy for the K8s ClusterID as it will only
change if the cluster is rebuilt. Furthermore, Kubernetes UIDs are
UUIDs as standardized by
[ISO/IEC 9834-8 and ITU-T X.667](https://www.itu.int/ITU-T/studygroups/com17/oid.html).
Which states:

&gt; If generated according to one of the mechanisms defined in Rec.
  ITU-T X.667 | ISO/IEC 9834-8, a UUID is either guaranteed to be
  different from all other UUIDs generated before 3603 A.D., or is
  extremely likely to be different (depending on the mechanism chosen).

Therefore, UIDs between clusters should be extremely unlikely to
conflict.
  */
  K8S_CLUSTER_UID: 'k8s.cluster.uid';

  /**
   * The name of the Container from Pod specification, must be unique within a Pod. Container runtime usually uses different globally unique name (`container.name`).
   */
  K8S_CONTAINER_NAME: 'k8s.container.name';

  /**
   * Number of times the container was restarted. This attribute can be used to identify a particular container (running or stopped) within a container spec.
   */
  K8S_CONTAINER_RESTART_COUNT: 'k8s.container.restart_count';

  /**
   * The name of the CronJob.
   */
  K8S_CRONJOB_NAME: 'k8s.cronjob.name';

  /**
   * The UID of the CronJob.
   */
  K8S_CRONJOB_UID: 'k8s.cronjob.uid';

  /**
   * The name of the DaemonSet.
   */
  K8S_DAEMONSET_NAME: 'k8s.daemonset.name';

  /**
   * The UID of the DaemonSet.
   */
  K8S_DAEMONSET_UID: 'k8s.daemonset.uid';

  /**
   * The name of the Deployment.
   */
  K8S_DEPLOYMENT_NAME: 'k8s.deployment.name';

  /**
   * The UID of the Deployment.
   */
  K8S_DEPLOYMENT_UID: 'k8s.deployment.uid';

  /**
   * The name of the Job.
   */
  K8S_JOB_NAME: 'k8s.job.name';

  /**
   * The UID of the Job.
   */
  K8S_JOB_UID: 'k8s.job.uid';

  /**
   * The name of the namespace that the pod is running in.
   */
  K8S_NAMESPACE_NAME: 'k8s.namespace.name';

  /**
   * The name of the Node.
   */
  K8S_NODE_NAME: 'k8s.node.name';

  /**
   * The UID of the Node.
   */
  K8S_NODE_UID: 'k8s.node.uid';

  /**
   * The name of the Pod.
   */
  K8S_POD_NAME: 'k8s.pod.name';

  /**
   * The UID of the Pod.
   */
  K8S_POD_UID: 'k8s.pod.uid';

  /**
   * The name of the ReplicaSet.
   */
  K8S_REPLICASET_NAME: 'k8s.replicaset.name';

  /**
   * The UID of the ReplicaSet.
   */
  K8S_REPLICASET_UID: 'k8s.replicaset.uid';

  /**
   * The name of the StatefulSet.
   */
  K8S_STATEFULSET_NAME: 'k8s.statefulset.name';

  /**
   * The UID of the StatefulSet.
   */
  K8S_STATEFULSET_UID: 'k8s.statefulset.uid';

  /**
   * The number of messages sent, received, or processed in the scope of the batching operation.
   *
   * Note: Instrumentations SHOULD NOT set `messaging.batch.message_count` on spans that operate with a single message. When a messaging client library supports both batch and single-message API for the same operation, instrumentations SHOULD use `messaging.batch.message_count` for batching APIs and SHOULD NOT use it for single-message APIs.
   */
  MESSAGING_BATCH_MESSAGE_COUNT: 'messaging.batch.message_count';

  /**
   * A unique identifier for the client that consumes or produces a message.
   */
  MESSAGING_CLIENT_ID: 'messaging.client_id';

  /**
   * A boolean that is true if the message destination is anonymous (could be unnamed or have auto-generated name).
   */
  MESSAGING_DESTINATION_ANONYMOUS: 'messaging.destination.anonymous';

  /**
  * The message destination name.
  *
  * Note: Destination name SHOULD uniquely identify a specific queue, topic or other entity within the broker. If
the broker doesn&#39;t have such notion, the destination name SHOULD uniquely identify the broker.
  */
  MESSAGING_DESTINATION_NAME: 'messaging.destination.name';

  /**
   * The identifier of the partition messages are sent to or received from, unique within the `messaging.destination.name`.
   */
  MESSAGING_DESTINATION_PARTITION_ID: 'messaging.destination.partition.id';

  /**
   * Low cardinality representation of the messaging destination name.
   *
   * Note: Destination names could be constructed from templates. An example would be a destination name involving a user name or product id. Although the destination name in this case is of high cardinality, the underlying template is of low cardinality and can be effectively used for grouping and aggregation.
   */
  MESSAGING_DESTINATION_TEMPLATE: 'messaging.destination.template';

  /**
   * A boolean that is true if the message destination is temporary and might not exist anymore after messages are processed.
   */
  MESSAGING_DESTINATION_TEMPORARY: 'messaging.destination.temporary';

  /**
   * A boolean that is true if the publish message destination is anonymous (could be unnamed or have auto-generated name).
   */
  MESSAGING_DESTINATION_PUBLISH_ANONYMOUS: 'messaging.destination_publish.anonymous';

  /**
  * The name of the original destination the message was published to.
  *
  * Note: The name SHOULD uniquely identify a specific queue, topic, or other entity within the broker. If
the broker doesn&#39;t have such notion, the original destination name SHOULD uniquely identify the broker.
  */
  MESSAGING_DESTINATION_PUBLISH_NAME: 'messaging.destination_publish.name';

  /**
   * The name of the consumer group the event consumer is associated with.
   */
  MESSAGING_EVENTHUBS_CONSUMER_GROUP: 'messaging.eventhubs.consumer.group';

  /**
   * The UTC epoch seconds at which the message has been accepted and stored in the entity.
   */
  MESSAGING_EVENTHUBS_MESSAGE_ENQUEUED_TIME: 'messaging.eventhubs.message.enqueued_time';

  /**
   * The ordering key for a given message. If the attribute is not present, the message does not have an ordering key.
   */
  MESSAGING_GCP_PUBSUB_MESSAGE_ORDERING_KEY: 'messaging.gcp_pubsub.message.ordering_key';

  /**
   * Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
   */
  MESSAGING_KAFKA_CONSUMER_GROUP: 'messaging.kafka.consumer.group';

  /**
   * Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message.id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
   *
   * Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
   */
  MESSAGING_KAFKA_MESSAGE_KEY: 'messaging.kafka.message.key';

  /**
   * The offset of a record in the corresponding Kafka partition.
   */
  MESSAGING_KAFKA_MESSAGE_OFFSET: 'messaging.kafka.message.offset';

  /**
   * A boolean that is true if the message is a tombstone.
   */
  MESSAGING_KAFKA_MESSAGE_TOMBSTONE: 'messaging.kafka.message.tombstone';

  /**
  * The size of the message body in bytes.
  *
  * Note: This can refer to both the compressed or uncompressed body size. If both sizes are known, the uncompressed
body size should be used.
  */
  MESSAGING_MESSAGE_BODY_SIZE: 'messaging.message.body.size';

  /**
   * The conversation ID identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
   */
  MESSAGING_MESSAGE_CONVERSATION_ID: 'messaging.message.conversation_id';

  /**
  * The size of the message body and metadata in bytes.
  *
  * Note: This can refer to both the compressed or uncompressed size. If both sizes are known, the uncompressed
size should be used.
  */
  MESSAGING_MESSAGE_ENVELOPE_SIZE: 'messaging.message.envelope.size';

  /**
   * A value used by the messaging system as an identifier for the message, represented as a string.
   */
  MESSAGING_MESSAGE_ID: 'messaging.message.id';

  /**
   * A string identifying the kind of messaging operation.
   *
   * Note: If a custom value is used, it MUST be of low cardinality.
   */
  MESSAGING_OPERATION: 'messaging.operation';

  /**
   * RabbitMQ message routing key.
   */
  MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY: 'messaging.rabbitmq.destination.routing_key';

  /**
   * RabbitMQ message delivery tag.
   */
  MESSAGING_RABBITMQ_MESSAGE_DELIVERY_TAG: 'messaging.rabbitmq.message.delivery_tag';

  /**
   * Name of the RocketMQ producer/consumer group that is handling the message. The client type is identified by the SpanKind.
   */
  MESSAGING_ROCKETMQ_CLIENT_GROUP: 'messaging.rocketmq.client_group';

  /**
   * Model of message consumption. This only applies to consumer spans.
   */
  MESSAGING_ROCKETMQ_CONSUMPTION_MODEL: 'messaging.rocketmq.consumption_model';

  /**
   * The delay time level for delay message, which determines the message delay time.
   */
  MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL: 'messaging.rocketmq.message.delay_time_level';

  /**
   * The timestamp in milliseconds that the delay message is expected to be delivered to consumer.
   */
  MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP: 'messaging.rocketmq.message.delivery_timestamp';

  /**
   * It is essential for FIFO message. Messages that belong to the same message group are always processed one by one within the same consumer group.
   */
  MESSAGING_ROCKETMQ_MESSAGE_GROUP: 'messaging.rocketmq.message.group';

  /**
   * Key(s) of message, another way to mark message besides message id.
   */
  MESSAGING_ROCKETMQ_MESSAGE_KEYS: 'messaging.rocketmq.message.keys';

  /**
   * The secondary classifier of message besides topic.
   */
  MESSAGING_ROCKETMQ_MESSAGE_TAG: 'messaging.rocketmq.message.tag';

  /**
   * Type of message.
   */
  MESSAGING_ROCKETMQ_MESSAGE_TYPE: 'messaging.rocketmq.message.type';

  /**
   * Namespace of RocketMQ resources, resources in different namespaces are individual.
   */
  MESSAGING_ROCKETMQ_NAMESPACE: 'messaging.rocketmq.namespace';

  /**
   * The name of the subscription in the topic messages are received from.
   */
  MESSAGING_SERVICEBUS_DESTINATION_SUBSCRIPTION_NAME: 'messaging.servicebus.destination.subscription_name';

  /**
   * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
   */
  MESSAGING_SERVICEBUS_DISPOSITION_STATUS: 'messaging.servicebus.disposition_status';

  /**
   * Number of deliveries that have been attempted for this message.
   */
  MESSAGING_SERVICEBUS_MESSAGE_DELIVERY_COUNT: 'messaging.servicebus.message.delivery_count';

  /**
   * The UTC epoch seconds at which the message has been accepted and stored in the entity.
   */
  MESSAGING_SERVICEBUS_MESSAGE_ENQUEUED_TIME: 'messaging.servicebus.message.enqueued_time';

  /**
   * An identifier for the messaging system being used. See below for a list of well-known identifiers.
   */
  MESSAGING_SYSTEM: 'messaging.system';

  /**
   * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
   */
  NETWORK_CARRIER_ICC: 'network.carrier.icc';

  /**
   * The mobile carrier country code.
   */
  NETWORK_CARRIER_MCC: 'network.carrier.mcc';

  /**
   * The mobile carrier network code.
   */
  NETWORK_CARRIER_MNC: 'network.carrier.mnc';

  /**
   * The name of the mobile carrier.
   */
  NETWORK_CARRIER_NAME: 'network.carrier.name';

  /**
   * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
   */
  NETWORK_CONNECTION_SUBTYPE: 'network.connection.subtype';

  /**
   * The internet connection type.
   */
  NETWORK_CONNECTION_TYPE: 'network.connection.type';

  /**
   * The network IO operation direction.
   */
  NETWORK_IO_DIRECTION: 'network.io.direction';

  /**
   * Local address of the network connection - IP address or Unix domain socket name.
   */
  NETWORK_LOCAL_ADDRESS: 'network.local.address';

  /**
   * Local port number of the network connection.
   */
  NETWORK_LOCAL_PORT: 'network.local.port';

  /**
   * Peer address of the network connection - IP address or Unix domain socket name.
   */
  NETWORK_PEER_ADDRESS: 'network.peer.address';

  /**
   * Peer port number of the network connection.
   */
  NETWORK_PEER_PORT: 'network.peer.port';

  /**
   * [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
   *
   * Note: The value SHOULD be normalized to lowercase.
   */
  NETWORK_PROTOCOL_NAME: 'network.protocol.name';

  /**
   * The actual version of the protocol used for network communication.
   *
   * Note: If protocol version is subject to negotiation (for example using [ALPN](https://www.rfc-editor.org/rfc/rfc7301.html)), this attribute SHOULD be set to the negotiated version. If the actual protocol version is not known, this attribute SHOULD NOT be set.
   */
  NETWORK_PROTOCOL_VERSION: 'network.protocol.version';

  /**
  * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
  *
  * Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
  */
  NETWORK_TRANSPORT: 'network.transport';

  /**
   * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
   *
   * Note: The value SHOULD be normalized to lowercase.
   */
  NETWORK_TYPE: 'network.type';

  /**
  * The digest of the OCI image manifest. For container images specifically is the digest by which the container image is known.
  *
  * Note: Follows [OCI Image Manifest Specification](https://github.com/opencontainers/image-spec/blob/main/manifest.md), and specifically the [Digest property](https://github.com/opencontainers/image-spec/blob/main/descriptor.md#digests).
An example can be found in [Example Image Manifest](https://docs.docker.com/registry/spec/manifest-v2-2/#example-image-manifest).
  */
  OCI_MANIFEST_DIGEST: 'oci.manifest.digest';

  /**
   * Unique identifier for a particular build or compilation of the operating system.
   */
  OS_BUILD_ID: 'os.build_id';

  /**
   * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
   */
  OS_DESCRIPTION: 'os.description';

  /**
   * Human readable operating system name.
   */
  OS_NAME: 'os.name';

  /**
   * The operating system type.
   */
  OS_TYPE: 'os.type';

  /**
   * The version string of the operating system as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
   */
  OS_VERSION: 'os.version';

  /**
   * The [`service.name`](/docs/resource/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
   */
  PEER_SERVICE: 'peer.service';

  /**
   * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
   */
  PROCESS_COMMAND: 'process.command';

  /**
   * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
   */
  PROCESS_COMMAND_ARGS: 'process.command_args';

  /**
   * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
   */
  PROCESS_COMMAND_LINE: 'process.command_line';

  /**
   * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
   */
  PROCESS_EXECUTABLE_NAME: 'process.executable.name';

  /**
   * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
   */
  PROCESS_EXECUTABLE_PATH: 'process.executable.path';

  /**
   * The username of the user that owns the process.
   */
  PROCESS_OWNER: 'process.owner';

  /**
   * Parent Process identifier (PPID).
   */
  PROCESS_PARENT_PID: 'process.parent_pid';

  /**
   * Process identifier (PID).
   */
  PROCESS_PID: 'process.pid';

  /**
   * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
   */
  PROCESS_RUNTIME_DESCRIPTION: 'process.runtime.description';

  /**
   * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
   */
  PROCESS_RUNTIME_NAME: 'process.runtime.name';

  /**
   * The version of the runtime of this process, as returned by the runtime without modification.
   */
  PROCESS_RUNTIME_VERSION: 'process.runtime.version';

  /**
   * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
   */
  RPC_CONNECT_RPC_ERROR_CODE: 'rpc.connect_rpc.error_code';

  /**
   * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
   */
  RPC_GRPC_STATUS_CODE: 'rpc.grpc.status_code';

  /**
   * `error.code` property of response if it is an error response.
   */
  RPC_JSONRPC_ERROR_CODE: 'rpc.jsonrpc.error_code';

  /**
   * `error.message` property of response if it is an error response.
   */
  RPC_JSONRPC_ERROR_MESSAGE: 'rpc.jsonrpc.error_message';

  /**
   * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
   */
  RPC_JSONRPC_REQUEST_ID: 'rpc.jsonrpc.request_id';

  /**
   * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 doesn&#39;t specify this, the value can be omitted.
   */
  RPC_JSONRPC_VERSION: 'rpc.jsonrpc.version';

  /**
   * The name of the (logical) method being called, must be equal to the $method part in the span name.
   *
   * Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
   */
  RPC_METHOD: 'rpc.method';

  /**
   * The full (logical) name of the service being called, including its package name, if applicable.
   *
   * Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
   */
  RPC_SERVICE: 'rpc.service';

  /**
   * A string identifying the remoting system. See below for a list of well-known identifiers.
   */
  RPC_SYSTEM: 'rpc.system';

  /**
   * Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
   *
   * Note: When observed from the client side, and when communicating through an intermediary, `server.address` SHOULD represent the server address behind any intermediaries, for example proxies, if it&#39;s available.
   */
  SERVER_ADDRESS: 'server.address';

  /**
   * Server port number.
   *
   * Note: When observed from the client side, and when communicating through an intermediary, `server.port` SHOULD represent the server port behind any intermediaries, for example proxies, if it&#39;s available.
   */
  SERVER_PORT: 'server.port';

  /**
  * The string ID of the service instance.
  *
  * Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words
`service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to
distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled
service).

Implementations, such as SDKs, are recommended to generate a random Version 1 or Version 4 [RFC
4122](https://www.ietf.org/rfc/rfc4122.txt) UUID, but are free to use an inherent unique ID as the source of
this value if stability is desirable. In that case, the ID SHOULD be used as source of a UUID Version 5 and
SHOULD use the following UUID as the namespace: `4d63009a-8d0f-11ee-aad7-4c796ed8e320`.

UUIDs are typically recommended, as only an opaque value for the purposes of identifying a service instance is
needed. Similar to what can be seen in the man page for the
[`/etc/machine-id`](https://www.freedesktop.org/software/systemd/man/machine-id.html) file, the underlying
data, such as pod name and namespace should be treated as confidential, being the user&#39;s choice to expose it
or not via another resource attribute.

For applications running behind an application server (like unicorn), we do not recommend using one identifier
for all processes participating in the application. Instead, it&#39;s recommended each division (e.g. a worker
thread in unicorn) to have its own instance.id.

It&#39;s not recommended for a Collector to set `service.instance.id` if it can&#39;t unambiguously determine the
service instance that is generating that telemetry. For instance, creating an UUID based on `pod.name` will
likely be wrong, as the Collector might not know from which container within that pod the telemetry originated.
However, Collectors can set the `service.instance.id` if they can unambiguously determine the service instance
for that telemetry. This is typically the case for scraping receivers, as they know the target address and
port.
  */
  SERVICE_INSTANCE_ID: 'service.instance.id';

  /**
   * Logical name of the service.
   *
   * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
   */
  SERVICE_NAME: 'service.name';

  /**
   * A namespace for `service.name`.
   *
   * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
   */
  SERVICE_NAMESPACE: 'service.namespace';

  /**
   * The version string of the service API or implementation. The format is not defined by these conventions.
   */
  SERVICE_VERSION: 'service.version';

  /**
   * A unique id to identify a session.
   */
  SESSION_ID: 'session.id';

  /**
   * The previous `session.id` for this user, when known.
   */
  SESSION_PREVIOUS_ID: 'session.previous_id';

  /**
   * Source address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
   *
   * Note: When observed from the destination side, and when communicating through an intermediary, `source.address` SHOULD represent the source address behind any intermediaries, for example proxies, if it&#39;s available.
   */
  SOURCE_ADDRESS: 'source.address';

  /**
   * Source port number.
   */
  SOURCE_PORT: 'source.port';

  /**
   * The language of the telemetry SDK.
   */
  TELEMETRY_SDK_LANGUAGE: 'telemetry.sdk.language';

  /**
  * The name of the telemetry SDK as defined above.
  *
  * Note: The OpenTelemetry SDK MUST set the `telemetry.sdk.name` attribute to `opentelemetry`.
If another SDK, like a fork or a vendor-provided implementation, is used, this SDK MUST set the
`telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK&#39;s main entry point
or another suitable identifier depending on the language.
The identifier `opentelemetry` is reserved and MUST NOT be used in this case.
All custom identifiers SHOULD be stable across different versions of an implementation.
  */
  TELEMETRY_SDK_NAME: 'telemetry.sdk.name';

  /**
   * The version string of the telemetry SDK.
   */
  TELEMETRY_SDK_VERSION: 'telemetry.sdk.version';

  /**
  * The name of the auto instrumentation agent or distribution, if used.
  *
  * Note: Official auto instrumentation agents and distributions SHOULD set the `telemetry.distro.name` attribute to
a string starting with `opentelemetry-`, e.g. `opentelemetry-java-instrumentation`.
  */
  TELEMETRY_DISTRO_NAME: 'telemetry.distro.name';

  /**
   * The version string of the auto instrumentation agent or distribution, if used.
   */
  TELEMETRY_DISTRO_VERSION: 'telemetry.distro.version';

  /**
   * Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
   */
  THREAD_ID: 'thread.id';

  /**
   * Current thread name.
   */
  THREAD_NAME: 'thread.name';

  /**
   * String indicating the [cipher](https://datatracker.ietf.org/doc/html/rfc5246#appendix-A.5) used during the current connection.
   *
   * Note: The values allowed for `tls.cipher` MUST be one of the `Descriptions` of the [registered TLS Cipher Suits](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#table-tls-parameters-4).
   */
  TLS_CIPHER: 'tls.cipher';

  /**
   * PEM-encoded stand-alone certificate offered by the client. This is usually mutually-exclusive of `client.certificate_chain` since this value also exists in that list.
   */
  TLS_CLIENT_CERTIFICATE: 'tls.client.certificate';

  /**
   * Array of PEM-encoded certificates that make up the certificate chain offered by the client. This is usually mutually-exclusive of `client.certificate` since that value should be the first certificate in the chain.
   */
  TLS_CLIENT_CERTIFICATE_CHAIN: 'tls.client.certificate_chain';

  /**
   * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
   */
  TLS_CLIENT_HASH_MD5: 'tls.client.hash.md5';

  /**
   * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
   */
  TLS_CLIENT_HASH_SHA1: 'tls.client.hash.sha1';

  /**
   * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
   */
  TLS_CLIENT_HASH_SHA256: 'tls.client.hash.sha256';

  /**
   * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
   */
  TLS_CLIENT_ISSUER: 'tls.client.issuer';

  /**
   * A hash that identifies clients based on how they perform an SSL/TLS handshake.
   */
  TLS_CLIENT_JA3: 'tls.client.ja3';

  /**
   * Date/Time indicating when client certificate is no longer considered valid.
   */
  TLS_CLIENT_NOT_AFTER: 'tls.client.not_after';

  /**
   * Date/Time indicating when client certificate is first considered valid.
   */
  TLS_CLIENT_NOT_BEFORE: 'tls.client.not_before';

  /**
   * Also called an SNI, this tells the server which hostname to which the client is attempting to connect to.
   */
  TLS_CLIENT_SERVER_NAME: 'tls.client.server_name';

  /**
   * Distinguished name of subject of the x.509 certificate presented by the client.
   */
  TLS_CLIENT_SUBJECT: 'tls.client.subject';

  /**
   * Array of ciphers offered by the client during the client hello.
   */
  TLS_CLIENT_SUPPORTED_CIPHERS: 'tls.client.supported_ciphers';

  /**
   * String indicating the curve used for the given cipher, when applicable.
   */
  TLS_CURVE: 'tls.curve';

  /**
   * Boolean flag indicating if the TLS negotiation was successful and transitioned to an encrypted tunnel.
   */
  TLS_ESTABLISHED: 'tls.established';

  /**
   * String indicating the protocol being tunneled. Per the values in the [IANA registry](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids), this string should be lower case.
   */
  TLS_NEXT_PROTOCOL: 'tls.next_protocol';

  /**
   * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
   */
  TLS_PROTOCOL_NAME: 'tls.protocol.name';

  /**
   * Numeric part of the version parsed from the original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
   */
  TLS_PROTOCOL_VERSION: 'tls.protocol.version';

  /**
   * Boolean flag indicating if this TLS connection was resumed from an existing TLS negotiation.
   */
  TLS_RESUMED: 'tls.resumed';

  /**
   * PEM-encoded stand-alone certificate offered by the server. This is usually mutually-exclusive of `server.certificate_chain` since this value also exists in that list.
   */
  TLS_SERVER_CERTIFICATE: 'tls.server.certificate';

  /**
   * Array of PEM-encoded certificates that make up the certificate chain offered by the server. This is usually mutually-exclusive of `server.certificate` since that value should be the first certificate in the chain.
   */
  TLS_SERVER_CERTIFICATE_CHAIN: 'tls.server.certificate_chain';

  /**
   * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
   */
  TLS_SERVER_HASH_MD5: 'tls.server.hash.md5';

  /**
   * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
   */
  TLS_SERVER_HASH_SHA1: 'tls.server.hash.sha1';

  /**
   * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
   */
  TLS_SERVER_HASH_SHA256: 'tls.server.hash.sha256';

  /**
   * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
   */
  TLS_SERVER_ISSUER: 'tls.server.issuer';

  /**
   * A hash that identifies servers based on how they perform an SSL/TLS handshake.
   */
  TLS_SERVER_JA3S: 'tls.server.ja3s';

  /**
   * Date/Time indicating when server certificate is no longer considered valid.
   */
  TLS_SERVER_NOT_AFTER: 'tls.server.not_after';

  /**
   * Date/Time indicating when server certificate is first considered valid.
   */
  TLS_SERVER_NOT_BEFORE: 'tls.server.not_before';

  /**
   * Distinguished name of subject of the x.509 certificate presented by the server.
   */
  TLS_SERVER_SUBJECT: 'tls.server.subject';

  /**
   * Domain extracted from the `url.full`, such as &#34;opentelemetry.io&#34;.
   *
   * Note: In some cases a URL may refer to an IP and/or port directly, without a domain name. In this case, the IP address would go to the domain field. If the URL contains a [literal IPv6 address](https://www.rfc-editor.org/rfc/rfc2732#section-2) enclosed by `[` and `]`, the `[` and `]` characters should also be captured in the domain field.
   */
  URL_DOMAIN: 'url.domain';

  /**
   * The file extension extracted from the `url.full`, excluding the leading dot.
   *
   * Note: The file extension is only set if it exists, as not every url has a file extension. When the file name has multiple extensions `example.tar.gz`, only the last one should be captured `gz`, not `tar.gz`.
   */
  URL_EXTENSION: 'url.extension';

  /**
   * The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component.
   */
  URL_FRAGMENT: 'url.fragment';

  /**
  * Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986).
  *
  * Note: For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it SHOULD be included nevertheless.
`url.full` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password SHOULD be redacted and attribute&#39;s value SHOULD be `https://REDACTED:REDACTED@www.example.com/`.
`url.full` SHOULD capture the absolute URL when it is available (or can be reconstructed). Sensitive content provided in `url.full` SHOULD be scrubbed when instrumentations can identify it.
  */
  URL_FULL: 'url.full';

  /**
  * Unmodified original URL as seen in the event source.
  *
  * Note: In network monitoring, the observed URL may be a full URL, whereas in access logs, the URL is often just represented as a path. This field is meant to represent the URL as it was observed, complete or not.
`url.original` might contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case password and username SHOULD NOT be redacted and attribute&#39;s value SHOULD remain the same.
  */
  URL_ORIGINAL: 'url.original';

  /**
   * The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component.
   *
   * Note: Sensitive content provided in `url.path` SHOULD be scrubbed when instrumentations can identify it.
   */
  URL_PATH: 'url.path';

  /**
   * Port extracted from the `url.full`.
   */
  URL_PORT: 'url.port';

  /**
   * The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component.
   *
   * Note: Sensitive content provided in `url.query` SHOULD be scrubbed when instrumentations can identify it.
   */
  URL_QUERY: 'url.query';

  /**
   * The highest registered url domain, stripped of the subdomain.
   *
   * Note: This value can be determined precisely with the [public suffix list](http://publicsuffix.org). For example, the registered domain for `foo.example.com` is `example.com`. Trying to approximate this by simply taking the last two labels will not work well for TLDs such as `co.uk`.
   */
  URL_REGISTERED_DOMAIN: 'url.registered_domain';

  /**
   * The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
   */
  URL_SCHEME: 'url.scheme';

  /**
   * The subdomain portion of a fully qualified domain name includes all of the names except the host name under the registered_domain. In a partially qualified domain, or if the qualification level of the full name cannot be determined, subdomain contains all of the names below the registered domain.
   *
   * Note: The subdomain portion of `www.east.mydomain.co.uk` is `east`. If the domain has multiple levels of subdomain, such as `sub2.sub1.example.com`, the subdomain field should contain `sub2.sub1`, with no trailing period.
   */
  URL_SUBDOMAIN: 'url.subdomain';

  /**
   * The effective top level domain (eTLD), also known as the domain suffix, is the last part of the domain name. For example, the top level domain for example.com is `com`.
   *
   * Note: This value can be determined precisely with the [public suffix list](http://publicsuffix.org).
   */
  URL_TOP_LEVEL_DOMAIN: 'url.top_level_domain';

  /**
   * Name of the user-agent extracted from original. Usually refers to the browser&#39;s name.
   *
   * Note: [Example](https://www.whatsmyua.info) of extracting browser&#39;s name from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant name SHOULD be selected. In such a scenario it should align with `user_agent.version`.
   */
  USER_AGENT_NAME: 'user_agent.name';

  /**
   * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
   */
  USER_AGENT_ORIGINAL: 'user_agent.original';

  /**
   * Version of the user-agent extracted from original. Usually refers to the browser&#39;s version.
   *
   * Note: [Example](https://www.whatsmyua.info) of extracting browser&#39;s version from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant version SHOULD be selected. In such a scenario it should align with `user_agent.name`.
   */
  USER_AGENT_VERSION: 'user_agent.version';

  /**
   * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
   *
   * Note: This may be different from `cloud.resource_id` if an alias is involved.
   */
  AWS_LAMBDA_INVOKED_ARN: 'aws.lambda.invoked_arn';

  /**
   * Parent-child Reference type.
   *
   * Note: The causal relationship between a child Span and a parent Span.
   */
  OPENTRACING_REF_TYPE: 'opentracing.ref_type';

  /**
   * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
   */
  OTEL_STATUS_CODE: 'otel.status_code';

  /**
   * Description of the Status if it has a value, otherwise not set.
   */
  OTEL_STATUS_DESCRIPTION: 'otel.status_description';

  /**
   * The AWS request ID as returned in the response headers `x-amz-request-id` or `x-amz-requestid`.
   */
  AWS_REQUEST_ID: 'aws.request_id';

  /**
  * The S3 bucket name the request refers to. Corresponds to the `--bucket` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
  *
  * Note: The `bucket` attribute is applicable to all S3 operations that reference a bucket, i.e. that require the bucket name as a mandatory parameter.
This applies to almost all S3 operations except `list-buckets`.
  */
  AWS_S3_BUCKET: 'aws.s3.bucket';

  /**
  * The source object (in the form `bucket`/`key`) for the copy operation.
  *
  * Note: The `copy_source` attribute applies to S3 copy operations and corresponds to the `--copy-source` parameter
of the [copy-object operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html).
This applies in particular to the following operations:

- [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
- [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html).
  */
  AWS_S3_COPY_SOURCE: 'aws.s3.copy_source';

  /**
  * The delete request container that specifies the objects to be deleted.
  *
  * Note: The `delete` attribute is only applicable to the [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html) operation.
The `delete` attribute corresponds to the `--delete` parameter of the
[delete-objects operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-objects.html).
  */
  AWS_S3_DELETE: 'aws.s3.delete';

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
  AWS_S3_KEY: 'aws.s3.key';

  /**
  * The part number of the part being uploaded in a multipart-upload operation. This is a positive integer between 1 and 10,000.
  *
  * Note: The `part_number` attribute is only applicable to the [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
and [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html) operations.
The `part_number` attribute corresponds to the `--part-number` parameter of the
[upload-part operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html).
  */
  AWS_S3_PART_NUMBER: 'aws.s3.part_number';

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
  AWS_S3_UPLOAD_ID: 'aws.s3.upload_id';

  /**
   * The GraphQL document being executed.
   *
   * Note: The value may be sanitized to exclude sensitive information.
   */
  GRAPHQL_DOCUMENT: 'graphql.document';

  /**
   * The name of the operation being executed.
   */
  GRAPHQL_OPERATION_NAME: 'graphql.operation.name';

  /**
   * The type of the operation being executed.
   */
  GRAPHQL_OPERATION_TYPE: 'graphql.operation.type';

  /**
   * Compressed size of the message in bytes.
   */
  MESSAGE_COMPRESSED_SIZE: 'message.compressed_size';

  /**
   * MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
   *
   * Note: This way we guarantee that the values will be consistent between different implementations.
   */
  MESSAGE_ID: 'message.id';

  /**
   * Whether this is a received or sent message.
   */
  MESSAGE_TYPE: 'message.type';

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
    TMP_EVENT_NAME,
    TMP_LOG_RECORD_UID,
    TMP_LOG_IOSTREAM,
    TMP_LOG_FILE_NAME,
    TMP_LOG_FILE_NAME_RESOLVED,
    TMP_LOG_FILE_PATH,
    TMP_LOG_FILE_PATH_RESOLVED,
    TMP_IOS_STATE,
    TMP_ANDROID_STATE,
    TMP_POOL_NAME,
    TMP_STATE,
    TMP_ASPNETCORE_RATE_LIMITING_RESULT,
    TMP_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE,
    TMP_ASPNETCORE_RATE_LIMITING_POLICY,
    TMP_ASPNETCORE_REQUEST_IS_UNHANDLED,
    TMP_ASPNETCORE_ROUTING_IS_FALLBACK,
    TMP_SIGNALR_CONNECTION_STATUS,
    TMP_SIGNALR_TRANSPORT,
    TMP_JVM_BUFFER_POOL_NAME,
    TMP_JVM_MEMORY_POOL_NAME,
    TMP_JVM_MEMORY_TYPE,
    TMP_PROCESS_CPU_STATE,
    TMP_SYSTEM_DEVICE,
    TMP_SYSTEM_CPU_LOGICAL_NUMBER,
    TMP_SYSTEM_CPU_STATE,
    TMP_SYSTEM_MEMORY_STATE,
    TMP_SYSTEM_PAGING_DIRECTION,
    TMP_SYSTEM_PAGING_STATE,
    TMP_SYSTEM_PAGING_TYPE,
    TMP_SYSTEM_FILESYSTEM_MODE,
    TMP_SYSTEM_FILESYSTEM_MOUNTPOINT,
    TMP_SYSTEM_FILESYSTEM_STATE,
    TMP_SYSTEM_FILESYSTEM_TYPE,
    TMP_SYSTEM_NETWORK_STATE,
    TMP_SYSTEM_PROCESS_STATUS,
    TMP_ANDROID_OS_API_LEVEL,
    TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS,
    TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET,
    TMP_AWS_DYNAMODB_CONSISTENT_READ,
    TMP_AWS_DYNAMODB_CONSUMED_CAPACITY,
    TMP_AWS_DYNAMODB_COUNT,
    TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE,
    TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES,
    TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES,
    TMP_AWS_DYNAMODB_INDEX_NAME,
    TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS,
    TMP_AWS_DYNAMODB_LIMIT,
    TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES,
    TMP_AWS_DYNAMODB_PROJECTION,
    TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY,
    TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY,
    TMP_AWS_DYNAMODB_SCAN_FORWARD,
    TMP_AWS_DYNAMODB_SCANNED_COUNT,
    TMP_AWS_DYNAMODB_SEGMENT,
    TMP_AWS_DYNAMODB_SELECT,
    TMP_AWS_DYNAMODB_TABLE_COUNT,
    TMP_AWS_DYNAMODB_TABLE_NAMES,
    TMP_AWS_DYNAMODB_TOTAL_SEGMENTS,
    TMP_BROWSER_BRANDS,
    TMP_BROWSER_LANGUAGE,
    TMP_BROWSER_MOBILE,
    TMP_BROWSER_PLATFORM,
    TMP_CLIENT_ADDRESS,
    TMP_CLIENT_PORT,
    TMP_CLOUD_ACCOUNT_ID,
    TMP_CLOUD_AVAILABILITY_ZONE,
    TMP_CLOUD_PLATFORM,
    TMP_CLOUD_PROVIDER,
    TMP_CLOUD_REGION,
    TMP_CLOUD_RESOURCE_ID,
    TMP_CLOUDEVENTS_EVENT_ID,
    TMP_CLOUDEVENTS_EVENT_SOURCE,
    TMP_CLOUDEVENTS_EVENT_SPEC_VERSION,
    TMP_CLOUDEVENTS_EVENT_SUBJECT,
    TMP_CLOUDEVENTS_EVENT_TYPE,
    TMP_CODE_COLUMN,
    TMP_CODE_FILEPATH,
    TMP_CODE_FUNCTION,
    TMP_CODE_LINENO,
    TMP_CODE_NAMESPACE,
    TMP_CODE_STACKTRACE,
    TMP_CONTAINER_COMMAND,
    TMP_CONTAINER_COMMAND_ARGS,
    TMP_CONTAINER_COMMAND_LINE,
    TMP_CONTAINER_CPU_STATE,
    TMP_CONTAINER_ID,
    TMP_CONTAINER_IMAGE_ID,
    TMP_CONTAINER_IMAGE_NAME,
    TMP_CONTAINER_IMAGE_REPO_DIGESTS,
    TMP_CONTAINER_IMAGE_TAGS,
    TMP_CONTAINER_NAME,
    TMP_CONTAINER_RUNTIME,
    TMP_DB_CASSANDRA_CONSISTENCY_LEVEL,
    TMP_DB_CASSANDRA_COORDINATOR_DC,
    TMP_DB_CASSANDRA_COORDINATOR_ID,
    TMP_DB_CASSANDRA_IDEMPOTENCE,
    TMP_DB_CASSANDRA_PAGE_SIZE,
    TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT,
    TMP_DB_CASSANDRA_TABLE,
    TMP_DB_COSMOSDB_CLIENT_ID,
    TMP_DB_COSMOSDB_CONNECTION_MODE,
    TMP_DB_COSMOSDB_CONTAINER,
    TMP_DB_COSMOSDB_OPERATION_TYPE,
    TMP_DB_COSMOSDB_REQUEST_CHARGE,
    TMP_DB_COSMOSDB_REQUEST_CONTENT_LENGTH,
    TMP_DB_COSMOSDB_STATUS_CODE,
    TMP_DB_COSMOSDB_SUB_STATUS_CODE,
    TMP_DB_ELASTICSEARCH_CLUSTER_NAME,
    TMP_DB_INSTANCE_ID,
    TMP_DB_MONGODB_COLLECTION,
    TMP_DB_MSSQL_INSTANCE_NAME,
    TMP_DB_NAME,
    TMP_DB_OPERATION,
    TMP_DB_REDIS_DATABASE_INDEX,
    TMP_DB_SQL_TABLE,
    TMP_DB_STATEMENT,
    TMP_DB_SYSTEM,
    TMP_DB_USER,
    TMP_DEPLOYMENT_ENVIRONMENT,
    TMP_DB_CONNECTION_STRING,
    TMP_DB_ELASTICSEARCH_NODE_NAME,
    TMP_DB_JDBC_DRIVER_CLASSNAME,
    TMP_HTTP_FLAVOR,
    TMP_HTTP_METHOD,
    TMP_HTTP_REQUEST_CONTENT_LENGTH,
    TMP_HTTP_RESPONSE_CONTENT_LENGTH,
    TMP_HTTP_SCHEME,
    TMP_HTTP_STATUS_CODE,
    TMP_HTTP_TARGET,
    TMP_HTTP_URL,
    TMP_HTTP_USER_AGENT,
    TMP_MESSAGING_KAFKA_DESTINATION_PARTITION,
    TMP_NET_HOST_NAME,
    TMP_NET_HOST_PORT,
    TMP_NET_PEER_NAME,
    TMP_NET_PEER_PORT,
    TMP_NET_PROTOCOL_NAME,
    TMP_NET_PROTOCOL_VERSION,
    TMP_NET_SOCK_FAMILY,
    TMP_NET_SOCK_HOST_ADDR,
    TMP_NET_SOCK_HOST_PORT,
    TMP_NET_SOCK_PEER_ADDR,
    TMP_NET_SOCK_PEER_NAME,
    TMP_NET_SOCK_PEER_PORT,
    TMP_NET_TRANSPORT,
    TMP_SYSTEM_PROCESSES_STATUS,
    TMP_DESTINATION_ADDRESS,
    TMP_DESTINATION_PORT,
    TMP_DEVICE_ID,
    TMP_DEVICE_MANUFACTURER,
    TMP_DEVICE_MODEL_IDENTIFIER,
    TMP_DEVICE_MODEL_NAME,
    TMP_DISK_IO_DIRECTION,
    TMP_DNS_QUESTION_NAME,
    TMP_ENDUSER_ID,
    TMP_ENDUSER_ROLE,
    TMP_ENDUSER_SCOPE,
    TMP_ERROR_TYPE,
    TMP_EXCEPTION_ESCAPED,
    TMP_EXCEPTION_MESSAGE,
    TMP_EXCEPTION_STACKTRACE,
    TMP_EXCEPTION_TYPE,
    TMP_FAAS_COLDSTART,
    TMP_FAAS_CRON,
    TMP_FAAS_DOCUMENT_COLLECTION,
    TMP_FAAS_DOCUMENT_NAME,
    TMP_FAAS_DOCUMENT_OPERATION,
    TMP_FAAS_DOCUMENT_TIME,
    TMP_FAAS_INSTANCE,
    TMP_FAAS_INVOCATION_ID,
    TMP_FAAS_INVOKED_NAME,
    TMP_FAAS_INVOKED_PROVIDER,
    TMP_FAAS_INVOKED_REGION,
    TMP_FAAS_MAX_MEMORY,
    TMP_FAAS_NAME,
    TMP_FAAS_TIME,
    TMP_FAAS_TRIGGER,
    TMP_FAAS_VERSION,
    TMP_FEATURE_FLAG_KEY,
    TMP_FEATURE_FLAG_PROVIDER_NAME,
    TMP_FEATURE_FLAG_VARIANT,
    TMP_FILE_DIRECTORY,
    TMP_FILE_EXTENSION,
    TMP_FILE_NAME,
    TMP_FILE_PATH,
    TMP_FILE_SIZE,
    TMP_GCP_CLOUD_RUN_JOB_EXECUTION,
    TMP_GCP_CLOUD_RUN_JOB_TASK_INDEX,
    TMP_GCP_GCE_INSTANCE_HOSTNAME,
    TMP_GCP_GCE_INSTANCE_NAME,
    TMP_HOST_ARCH,
    TMP_HOST_CPU_CACHE_L2_SIZE,
    TMP_HOST_CPU_FAMILY,
    TMP_HOST_CPU_MODEL_ID,
    TMP_HOST_CPU_MODEL_NAME,
    TMP_HOST_CPU_STEPPING,
    TMP_HOST_CPU_VENDOR_ID,
    TMP_HOST_ID,
    TMP_HOST_IMAGE_ID,
    TMP_HOST_IMAGE_NAME,
    TMP_HOST_IMAGE_VERSION,
    TMP_HOST_IP,
    TMP_HOST_MAC,
    TMP_HOST_NAME,
    TMP_HOST_TYPE,
    TMP_HTTP_CONNECTION_STATE,
    TMP_HTTP_REQUEST_BODY_SIZE,
    TMP_HTTP_REQUEST_METHOD,
    TMP_HTTP_REQUEST_METHOD_ORIGINAL,
    TMP_HTTP_REQUEST_RESEND_COUNT,
    TMP_HTTP_REQUEST_SIZE,
    TMP_HTTP_RESPONSE_BODY_SIZE,
    TMP_HTTP_RESPONSE_SIZE,
    TMP_HTTP_RESPONSE_STATUS_CODE,
    TMP_HTTP_ROUTE,
    TMP_K8S_CLUSTER_NAME,
    TMP_K8S_CLUSTER_UID,
    TMP_K8S_CONTAINER_NAME,
    TMP_K8S_CONTAINER_RESTART_COUNT,
    TMP_K8S_CRONJOB_NAME,
    TMP_K8S_CRONJOB_UID,
    TMP_K8S_DAEMONSET_NAME,
    TMP_K8S_DAEMONSET_UID,
    TMP_K8S_DEPLOYMENT_NAME,
    TMP_K8S_DEPLOYMENT_UID,
    TMP_K8S_JOB_NAME,
    TMP_K8S_JOB_UID,
    TMP_K8S_NAMESPACE_NAME,
    TMP_K8S_NODE_NAME,
    TMP_K8S_NODE_UID,
    TMP_K8S_POD_NAME,
    TMP_K8S_POD_UID,
    TMP_K8S_REPLICASET_NAME,
    TMP_K8S_REPLICASET_UID,
    TMP_K8S_STATEFULSET_NAME,
    TMP_K8S_STATEFULSET_UID,
    TMP_MESSAGING_BATCH_MESSAGE_COUNT,
    TMP_MESSAGING_CLIENT_ID,
    TMP_MESSAGING_DESTINATION_ANONYMOUS,
    TMP_MESSAGING_DESTINATION_NAME,
    TMP_MESSAGING_DESTINATION_PARTITION_ID,
    TMP_MESSAGING_DESTINATION_TEMPLATE,
    TMP_MESSAGING_DESTINATION_TEMPORARY,
    TMP_MESSAGING_DESTINATION_PUBLISH_ANONYMOUS,
    TMP_MESSAGING_DESTINATION_PUBLISH_NAME,
    TMP_MESSAGING_EVENTHUBS_CONSUMER_GROUP,
    TMP_MESSAGING_EVENTHUBS_MESSAGE_ENQUEUED_TIME,
    TMP_MESSAGING_GCP_PUBSUB_MESSAGE_ORDERING_KEY,
    TMP_MESSAGING_KAFKA_CONSUMER_GROUP,
    TMP_MESSAGING_KAFKA_MESSAGE_KEY,
    TMP_MESSAGING_KAFKA_MESSAGE_OFFSET,
    TMP_MESSAGING_KAFKA_MESSAGE_TOMBSTONE,
    TMP_MESSAGING_MESSAGE_BODY_SIZE,
    TMP_MESSAGING_MESSAGE_CONVERSATION_ID,
    TMP_MESSAGING_MESSAGE_ENVELOPE_SIZE,
    TMP_MESSAGING_MESSAGE_ID,
    TMP_MESSAGING_OPERATION,
    TMP_MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY,
    TMP_MESSAGING_RABBITMQ_MESSAGE_DELIVERY_TAG,
    TMP_MESSAGING_ROCKETMQ_CLIENT_GROUP,
    TMP_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL,
    TMP_MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL,
    TMP_MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP,
    TMP_MESSAGING_ROCKETMQ_MESSAGE_GROUP,
    TMP_MESSAGING_ROCKETMQ_MESSAGE_KEYS,
    TMP_MESSAGING_ROCKETMQ_MESSAGE_TAG,
    TMP_MESSAGING_ROCKETMQ_MESSAGE_TYPE,
    TMP_MESSAGING_ROCKETMQ_NAMESPACE,
    TMP_MESSAGING_SERVICEBUS_DESTINATION_SUBSCRIPTION_NAME,
    TMP_MESSAGING_SERVICEBUS_DISPOSITION_STATUS,
    TMP_MESSAGING_SERVICEBUS_MESSAGE_DELIVERY_COUNT,
    TMP_MESSAGING_SERVICEBUS_MESSAGE_ENQUEUED_TIME,
    TMP_MESSAGING_SYSTEM,
    TMP_NETWORK_CARRIER_ICC,
    TMP_NETWORK_CARRIER_MCC,
    TMP_NETWORK_CARRIER_MNC,
    TMP_NETWORK_CARRIER_NAME,
    TMP_NETWORK_CONNECTION_SUBTYPE,
    TMP_NETWORK_CONNECTION_TYPE,
    TMP_NETWORK_IO_DIRECTION,
    TMP_NETWORK_LOCAL_ADDRESS,
    TMP_NETWORK_LOCAL_PORT,
    TMP_NETWORK_PEER_ADDRESS,
    TMP_NETWORK_PEER_PORT,
    TMP_NETWORK_PROTOCOL_NAME,
    TMP_NETWORK_PROTOCOL_VERSION,
    TMP_NETWORK_TRANSPORT,
    TMP_NETWORK_TYPE,
    TMP_OCI_MANIFEST_DIGEST,
    TMP_OS_BUILD_ID,
    TMP_OS_DESCRIPTION,
    TMP_OS_NAME,
    TMP_OS_TYPE,
    TMP_OS_VERSION,
    TMP_PEER_SERVICE,
    TMP_PROCESS_COMMAND,
    TMP_PROCESS_COMMAND_ARGS,
    TMP_PROCESS_COMMAND_LINE,
    TMP_PROCESS_EXECUTABLE_NAME,
    TMP_PROCESS_EXECUTABLE_PATH,
    TMP_PROCESS_OWNER,
    TMP_PROCESS_PARENT_PID,
    TMP_PROCESS_PID,
    TMP_PROCESS_RUNTIME_DESCRIPTION,
    TMP_PROCESS_RUNTIME_NAME,
    TMP_PROCESS_RUNTIME_VERSION,
    TMP_RPC_CONNECT_RPC_ERROR_CODE,
    TMP_RPC_GRPC_STATUS_CODE,
    TMP_RPC_JSONRPC_ERROR_CODE,
    TMP_RPC_JSONRPC_ERROR_MESSAGE,
    TMP_RPC_JSONRPC_REQUEST_ID,
    TMP_RPC_JSONRPC_VERSION,
    TMP_RPC_METHOD,
    TMP_RPC_SERVICE,
    TMP_RPC_SYSTEM,
    TMP_SERVER_ADDRESS,
    TMP_SERVER_PORT,
    TMP_SERVICE_INSTANCE_ID,
    TMP_SERVICE_NAME,
    TMP_SERVICE_NAMESPACE,
    TMP_SERVICE_VERSION,
    TMP_SESSION_ID,
    TMP_SESSION_PREVIOUS_ID,
    TMP_SOURCE_ADDRESS,
    TMP_SOURCE_PORT,
    TMP_TELEMETRY_SDK_LANGUAGE,
    TMP_TELEMETRY_SDK_NAME,
    TMP_TELEMETRY_SDK_VERSION,
    TMP_TELEMETRY_DISTRO_NAME,
    TMP_TELEMETRY_DISTRO_VERSION,
    TMP_THREAD_ID,
    TMP_THREAD_NAME,
    TMP_TLS_CIPHER,
    TMP_TLS_CLIENT_CERTIFICATE,
    TMP_TLS_CLIENT_CERTIFICATE_CHAIN,
    TMP_TLS_CLIENT_HASH_MD5,
    TMP_TLS_CLIENT_HASH_SHA1,
    TMP_TLS_CLIENT_HASH_SHA256,
    TMP_TLS_CLIENT_ISSUER,
    TMP_TLS_CLIENT_JA3,
    TMP_TLS_CLIENT_NOT_AFTER,
    TMP_TLS_CLIENT_NOT_BEFORE,
    TMP_TLS_CLIENT_SERVER_NAME,
    TMP_TLS_CLIENT_SUBJECT,
    TMP_TLS_CLIENT_SUPPORTED_CIPHERS,
    TMP_TLS_CURVE,
    TMP_TLS_ESTABLISHED,
    TMP_TLS_NEXT_PROTOCOL,
    TMP_TLS_PROTOCOL_NAME,
    TMP_TLS_PROTOCOL_VERSION,
    TMP_TLS_RESUMED,
    TMP_TLS_SERVER_CERTIFICATE,
    TMP_TLS_SERVER_CERTIFICATE_CHAIN,
    TMP_TLS_SERVER_HASH_MD5,
    TMP_TLS_SERVER_HASH_SHA1,
    TMP_TLS_SERVER_HASH_SHA256,
    TMP_TLS_SERVER_ISSUER,
    TMP_TLS_SERVER_JA3S,
    TMP_TLS_SERVER_NOT_AFTER,
    TMP_TLS_SERVER_NOT_BEFORE,
    TMP_TLS_SERVER_SUBJECT,
    TMP_URL_DOMAIN,
    TMP_URL_EXTENSION,
    TMP_URL_FRAGMENT,
    TMP_URL_FULL,
    TMP_URL_ORIGINAL,
    TMP_URL_PATH,
    TMP_URL_PORT,
    TMP_URL_QUERY,
    TMP_URL_REGISTERED_DOMAIN,
    TMP_URL_SCHEME,
    TMP_URL_SUBDOMAIN,
    TMP_URL_TOP_LEVEL_DOMAIN,
    TMP_USER_AGENT_NAME,
    TMP_USER_AGENT_ORIGINAL,
    TMP_USER_AGENT_VERSION,
    TMP_AWS_LAMBDA_INVOKED_ARN,
    TMP_OPENTRACING_REF_TYPE,
    TMP_OTEL_STATUS_CODE,
    TMP_OTEL_STATUS_DESCRIPTION,
    TMP_AWS_REQUEST_ID,
    TMP_AWS_S3_BUCKET,
    TMP_AWS_S3_COPY_SOURCE,
    TMP_AWS_S3_DELETE,
    TMP_AWS_S3_KEY,
    TMP_AWS_S3_PART_NUMBER,
    TMP_AWS_S3_UPLOAD_ID,
    TMP_GRAPHQL_DOCUMENT,
    TMP_GRAPHQL_OPERATION_NAME,
    TMP_GRAPHQL_OPERATION_TYPE,
    TMP_MESSAGE_COMPRESSED_SIZE,
    TMP_MESSAGE_ID,
    TMP_MESSAGE_TYPE,
    TMP_MESSAGE_UNCOMPRESSED_SIZE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for LogIostreamValues enum definition
 *
 * The stream associated with the log. See below for a list of well-known values.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_LOGIOSTREAMVALUES_STDOUT = 'stdout';
const TMP_LOGIOSTREAMVALUES_STDERR = 'stderr';

/**
 * The stream associated with the log. See below for a list of well-known values.
 */
export const LOGIOSTREAMVALUES_STDOUT = TMP_LOGIOSTREAMVALUES_STDOUT;

/**
 * The stream associated with the log. See below for a list of well-known values.
 */
export const LOGIOSTREAMVALUES_STDERR = TMP_LOGIOSTREAMVALUES_STDERR;

/**
 * Identifies the Values for LogIostreamValues enum definition
 *
 * The stream associated with the log. See below for a list of well-known values.
 * @deprecated Use the LOGIOSTREAMVALUES_XXXXX constants rather than the LogIostreamValues.XXXXX for bundle minification.
 */
export type LogIostreamValues = {
  /** Logs from stdout stream. */
  STDOUT: 'stdout';

  /** Events from stderr stream. */
  STDERR: 'stderr';
};

/**
 * The constant map of values for LogIostreamValues.
 * @deprecated Use the LOGIOSTREAMVALUES_XXXXX constants rather than the LogIostreamValues.XXXXX for bundle minification.
 */
export const LogIostreamValues: LogIostreamValues =
  /*#__PURE__*/ createConstMap<LogIostreamValues>([
    TMP_LOGIOSTREAMVALUES_STDOUT,
    TMP_LOGIOSTREAMVALUES_STDERR,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for IosStateValues enum definition
 *
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_IOSSTATEVALUES_ACTIVE = 'active';
const TMP_IOSSTATEVALUES_INACTIVE = 'inactive';
const TMP_IOSSTATEVALUES_BACKGROUND = 'background';
const TMP_IOSSTATEVALUES_FOREGROUND = 'foreground';
const TMP_IOSSTATEVALUES_TERMINATE = 'terminate';

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 */
export const IOSSTATEVALUES_ACTIVE = TMP_IOSSTATEVALUES_ACTIVE;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 */
export const IOSSTATEVALUES_INACTIVE = TMP_IOSSTATEVALUES_INACTIVE;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 */
export const IOSSTATEVALUES_BACKGROUND = TMP_IOSSTATEVALUES_BACKGROUND;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 */
export const IOSSTATEVALUES_FOREGROUND = TMP_IOSSTATEVALUES_FOREGROUND;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 */
export const IOSSTATEVALUES_TERMINATE = TMP_IOSSTATEVALUES_TERMINATE;

/**
 * Identifies the Values for IosStateValues enum definition
 *
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 * @deprecated Use the IOSSTATEVALUES_XXXXX constants rather than the IosStateValues.XXXXX for bundle minification.
 */
export type IosStateValues = {
  /** The app has become `active`. Associated with UIKit notification `applicationDidBecomeActive`. */
  ACTIVE: 'active';

  /** The app is now `inactive`. Associated with UIKit notification `applicationWillResignActive`. */
  INACTIVE: 'inactive';

  /** The app is now in the background. This value is associated with UIKit notification `applicationDidEnterBackground`. */
  BACKGROUND: 'background';

  /** The app is now in the foreground. This value is associated with UIKit notification `applicationWillEnterForeground`. */
  FOREGROUND: 'foreground';

  /** The app is about to terminate. Associated with UIKit notification `applicationWillTerminate`. */
  TERMINATE: 'terminate';
};

/**
 * The constant map of values for IosStateValues.
 * @deprecated Use the IOSSTATEVALUES_XXXXX constants rather than the IosStateValues.XXXXX for bundle minification.
 */
export const IosStateValues: IosStateValues =
  /*#__PURE__*/ createConstMap<IosStateValues>([
    TMP_IOSSTATEVALUES_ACTIVE,
    TMP_IOSSTATEVALUES_INACTIVE,
    TMP_IOSSTATEVALUES_BACKGROUND,
    TMP_IOSSTATEVALUES_FOREGROUND,
    TMP_IOSSTATEVALUES_TERMINATE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for AndroidStateValues enum definition
 *
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_ANDROIDSTATEVALUES_CREATED = 'created';
const TMP_ANDROIDSTATEVALUES_BACKGROUND = 'background';
const TMP_ANDROIDSTATEVALUES_FOREGROUND = 'foreground';

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 */
export const ANDROIDSTATEVALUES_CREATED = TMP_ANDROIDSTATEVALUES_CREATED;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 */
export const ANDROIDSTATEVALUES_BACKGROUND = TMP_ANDROIDSTATEVALUES_BACKGROUND;

/**
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 */
export const ANDROIDSTATEVALUES_FOREGROUND = TMP_ANDROIDSTATEVALUES_FOREGROUND;

/**
 * Identifies the Values for AndroidStateValues enum definition
 *
 * This attribute represents the state the application has transitioned into at the occurrence of the event.
 *
 * Note: The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 * @deprecated Use the ANDROIDSTATEVALUES_XXXXX constants rather than the AndroidStateValues.XXXXX for bundle minification.
 */
export type AndroidStateValues = {
  /** Any time before Activity.onResume() or, if the app has no Activity, Context.startService() has been called in the app for the first time. */
  CREATED: 'created';

  /** Any time after Activity.onPause() or, if the app has no Activity, Context.stopService() has been called when the app was in the foreground state. */
  BACKGROUND: 'background';

  /** Any time after Activity.onResume() or, if the app has no Activity, Context.startService() has been called when the app was in either the created or background states. */
  FOREGROUND: 'foreground';
};

/**
 * The constant map of values for AndroidStateValues.
 * @deprecated Use the ANDROIDSTATEVALUES_XXXXX constants rather than the AndroidStateValues.XXXXX for bundle minification.
 */
export const AndroidStateValues: AndroidStateValues =
  /*#__PURE__*/ createConstMap<AndroidStateValues>([
    TMP_ANDROIDSTATEVALUES_CREATED,
    TMP_ANDROIDSTATEVALUES_BACKGROUND,
    TMP_ANDROIDSTATEVALUES_FOREGROUND,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for StateValues enum definition
 *
 * The state of a connection in the pool.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_STATEVALUES_IDLE = 'idle';
const TMP_STATEVALUES_USED = 'used';

/**
 * The state of a connection in the pool.
 */
export const STATEVALUES_IDLE = TMP_STATEVALUES_IDLE;

/**
 * The state of a connection in the pool.
 */
export const STATEVALUES_USED = TMP_STATEVALUES_USED;

/**
 * Identifies the Values for StateValues enum definition
 *
 * The state of a connection in the pool.
 * @deprecated Use the STATEVALUES_XXXXX constants rather than the StateValues.XXXXX for bundle minification.
 */
export type StateValues = {
  /** idle. */
  IDLE: 'idle';

  /** used. */
  USED: 'used';
};

/**
 * The constant map of values for StateValues.
 * @deprecated Use the STATEVALUES_XXXXX constants rather than the StateValues.XXXXX for bundle minification.
 */
export const StateValues: StateValues =
  /*#__PURE__*/ createConstMap<StateValues>([
    TMP_STATEVALUES_IDLE,
    TMP_STATEVALUES_USED,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for AspnetcoreRateLimitingResultValues enum definition
 *
 * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_ASPNETCORERATELIMITINGRESULTVALUES_ACQUIRED = 'acquired';
const TMP_ASPNETCORERATELIMITINGRESULTVALUES_ENDPOINT_LIMITER =
  'endpoint_limiter';
const TMP_ASPNETCORERATELIMITINGRESULTVALUES_GLOBAL_LIMITER = 'global_limiter';
const TMP_ASPNETCORERATELIMITINGRESULTVALUES_REQUEST_CANCELED =
  'request_canceled';

/**
 * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
 */
export const ASPNETCORERATELIMITINGRESULTVALUES_ACQUIRED =
  TMP_ASPNETCORERATELIMITINGRESULTVALUES_ACQUIRED;

/**
 * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
 */
export const ASPNETCORERATELIMITINGRESULTVALUES_ENDPOINT_LIMITER =
  TMP_ASPNETCORERATELIMITINGRESULTVALUES_ENDPOINT_LIMITER;

/**
 * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
 */
export const ASPNETCORERATELIMITINGRESULTVALUES_GLOBAL_LIMITER =
  TMP_ASPNETCORERATELIMITINGRESULTVALUES_GLOBAL_LIMITER;

/**
 * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
 */
export const ASPNETCORERATELIMITINGRESULTVALUES_REQUEST_CANCELED =
  TMP_ASPNETCORERATELIMITINGRESULTVALUES_REQUEST_CANCELED;

/**
 * Identifies the Values for AspnetcoreRateLimitingResultValues enum definition
 *
 * Rate-limiting result, shows whether the lease was acquired or contains a rejection reason.
 * @deprecated Use the ASPNETCORERATELIMITINGRESULTVALUES_XXXXX constants rather than the AspnetcoreRateLimitingResultValues.XXXXX for bundle minification.
 */
export type AspnetcoreRateLimitingResultValues = {
  /** Lease was acquired. */
  ACQUIRED: 'acquired';

  /** Lease request was rejected by the endpoint limiter. */
  ENDPOINT_LIMITER: 'endpoint_limiter';

  /** Lease request was rejected by the global limiter. */
  GLOBAL_LIMITER: 'global_limiter';

  /** Lease request was canceled. */
  REQUEST_CANCELED: 'request_canceled';
};

/**
 * The constant map of values for AspnetcoreRateLimitingResultValues.
 * @deprecated Use the ASPNETCORERATELIMITINGRESULTVALUES_XXXXX constants rather than the AspnetcoreRateLimitingResultValues.XXXXX for bundle minification.
 */
export const AspnetcoreRateLimitingResultValues: AspnetcoreRateLimitingResultValues =
  /*#__PURE__*/ createConstMap<AspnetcoreRateLimitingResultValues>([
    TMP_ASPNETCORERATELIMITINGRESULTVALUES_ACQUIRED,
    TMP_ASPNETCORERATELIMITINGRESULTVALUES_ENDPOINT_LIMITER,
    TMP_ASPNETCORERATELIMITINGRESULTVALUES_GLOBAL_LIMITER,
    TMP_ASPNETCORERATELIMITINGRESULTVALUES_REQUEST_CANCELED,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SignalrConnectionStatusValues enum definition
 *
 * SignalR HTTP connection closure status.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SIGNALRCONNECTIONSTATUSVALUES_NORMAL_CLOSURE = 'normal_closure';
const TMP_SIGNALRCONNECTIONSTATUSVALUES_TIMEOUT = 'timeout';
const TMP_SIGNALRCONNECTIONSTATUSVALUES_APP_SHUTDOWN = 'app_shutdown';

/**
 * SignalR HTTP connection closure status.
 */
export const SIGNALRCONNECTIONSTATUSVALUES_NORMAL_CLOSURE =
  TMP_SIGNALRCONNECTIONSTATUSVALUES_NORMAL_CLOSURE;

/**
 * SignalR HTTP connection closure status.
 */
export const SIGNALRCONNECTIONSTATUSVALUES_TIMEOUT =
  TMP_SIGNALRCONNECTIONSTATUSVALUES_TIMEOUT;

/**
 * SignalR HTTP connection closure status.
 */
export const SIGNALRCONNECTIONSTATUSVALUES_APP_SHUTDOWN =
  TMP_SIGNALRCONNECTIONSTATUSVALUES_APP_SHUTDOWN;

/**
 * Identifies the Values for SignalrConnectionStatusValues enum definition
 *
 * SignalR HTTP connection closure status.
 * @deprecated Use the SIGNALRCONNECTIONSTATUSVALUES_XXXXX constants rather than the SignalrConnectionStatusValues.XXXXX for bundle minification.
 */
export type SignalrConnectionStatusValues = {
  /** The connection was closed normally. */
  NORMAL_CLOSURE: 'normal_closure';

  /** The connection was closed due to a timeout. */
  TIMEOUT: 'timeout';

  /** The connection was closed because the app is shutting down. */
  APP_SHUTDOWN: 'app_shutdown';
};

/**
 * The constant map of values for SignalrConnectionStatusValues.
 * @deprecated Use the SIGNALRCONNECTIONSTATUSVALUES_XXXXX constants rather than the SignalrConnectionStatusValues.XXXXX for bundle minification.
 */
export const SignalrConnectionStatusValues: SignalrConnectionStatusValues =
  /*#__PURE__*/ createConstMap<SignalrConnectionStatusValues>([
    TMP_SIGNALRCONNECTIONSTATUSVALUES_NORMAL_CLOSURE,
    TMP_SIGNALRCONNECTIONSTATUSVALUES_TIMEOUT,
    TMP_SIGNALRCONNECTIONSTATUSVALUES_APP_SHUTDOWN,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SignalrTransportValues enum definition
 *
 * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SIGNALRTRANSPORTVALUES_SERVER_SENT_EVENTS = 'server_sent_events';
const TMP_SIGNALRTRANSPORTVALUES_LONG_POLLING = 'long_polling';
const TMP_SIGNALRTRANSPORTVALUES_WEB_SOCKETS = 'web_sockets';

/**
 * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
 */
export const SIGNALRTRANSPORTVALUES_SERVER_SENT_EVENTS =
  TMP_SIGNALRTRANSPORTVALUES_SERVER_SENT_EVENTS;

/**
 * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
 */
export const SIGNALRTRANSPORTVALUES_LONG_POLLING =
  TMP_SIGNALRTRANSPORTVALUES_LONG_POLLING;

/**
 * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
 */
export const SIGNALRTRANSPORTVALUES_WEB_SOCKETS =
  TMP_SIGNALRTRANSPORTVALUES_WEB_SOCKETS;

/**
 * Identifies the Values for SignalrTransportValues enum definition
 *
 * [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md).
 * @deprecated Use the SIGNALRTRANSPORTVALUES_XXXXX constants rather than the SignalrTransportValues.XXXXX for bundle minification.
 */
export type SignalrTransportValues = {
  /** ServerSentEvents protocol. */
  SERVER_SENT_EVENTS: 'server_sent_events';

  /** LongPolling protocol. */
  LONG_POLLING: 'long_polling';

  /** WebSockets protocol. */
  WEB_SOCKETS: 'web_sockets';
};

/**
 * The constant map of values for SignalrTransportValues.
 * @deprecated Use the SIGNALRTRANSPORTVALUES_XXXXX constants rather than the SignalrTransportValues.XXXXX for bundle minification.
 */
export const SignalrTransportValues: SignalrTransportValues =
  /*#__PURE__*/ createConstMap<SignalrTransportValues>([
    TMP_SIGNALRTRANSPORTVALUES_SERVER_SENT_EVENTS,
    TMP_SIGNALRTRANSPORTVALUES_LONG_POLLING,
    TMP_SIGNALRTRANSPORTVALUES_WEB_SOCKETS,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for JvmMemoryTypeValues enum definition
 *
 * The type of memory.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_JVMMEMORYTYPEVALUES_HEAP = 'heap';
const TMP_JVMMEMORYTYPEVALUES_NON_HEAP = 'non_heap';

/**
 * The type of memory.
 */
export const JVMMEMORYTYPEVALUES_HEAP = TMP_JVMMEMORYTYPEVALUES_HEAP;

/**
 * The type of memory.
 */
export const JVMMEMORYTYPEVALUES_NON_HEAP = TMP_JVMMEMORYTYPEVALUES_NON_HEAP;

/**
 * Identifies the Values for JvmMemoryTypeValues enum definition
 *
 * The type of memory.
 * @deprecated Use the JVMMEMORYTYPEVALUES_XXXXX constants rather than the JvmMemoryTypeValues.XXXXX for bundle minification.
 */
export type JvmMemoryTypeValues = {
  /** Heap memory. */
  HEAP: 'heap';

  /** Non-heap memory. */
  NON_HEAP: 'non_heap';
};

/**
 * The constant map of values for JvmMemoryTypeValues.
 * @deprecated Use the JVMMEMORYTYPEVALUES_XXXXX constants rather than the JvmMemoryTypeValues.XXXXX for bundle minification.
 */
export const JvmMemoryTypeValues: JvmMemoryTypeValues =
  /*#__PURE__*/ createConstMap<JvmMemoryTypeValues>([
    TMP_JVMMEMORYTYPEVALUES_HEAP,
    TMP_JVMMEMORYTYPEVALUES_NON_HEAP,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for ProcessCpuStateValues enum definition
 *
 * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_PROCESSCPUSTATEVALUES_SYSTEM = 'system';
const TMP_PROCESSCPUSTATEVALUES_USER = 'user';
const TMP_PROCESSCPUSTATEVALUES_WAIT = 'wait';

/**
 * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
 */
export const PROCESSCPUSTATEVALUES_SYSTEM = TMP_PROCESSCPUSTATEVALUES_SYSTEM;

/**
 * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
 */
export const PROCESSCPUSTATEVALUES_USER = TMP_PROCESSCPUSTATEVALUES_USER;

/**
 * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
 */
export const PROCESSCPUSTATEVALUES_WAIT = TMP_PROCESSCPUSTATEVALUES_WAIT;

/**
 * Identifies the Values for ProcessCpuStateValues enum definition
 *
 * The CPU state for this data point. A process SHOULD be characterized _either_ by data points with no `state` labels, _or only_ data points with `state` labels.
 * @deprecated Use the PROCESSCPUSTATEVALUES_XXXXX constants rather than the ProcessCpuStateValues.XXXXX for bundle minification.
 */
export type ProcessCpuStateValues = {
  /** system. */
  SYSTEM: 'system';

  /** user. */
  USER: 'user';

  /** wait. */
  WAIT: 'wait';
};

/**
 * The constant map of values for ProcessCpuStateValues.
 * @deprecated Use the PROCESSCPUSTATEVALUES_XXXXX constants rather than the ProcessCpuStateValues.XXXXX for bundle minification.
 */
export const ProcessCpuStateValues: ProcessCpuStateValues =
  /*#__PURE__*/ createConstMap<ProcessCpuStateValues>([
    TMP_PROCESSCPUSTATEVALUES_SYSTEM,
    TMP_PROCESSCPUSTATEVALUES_USER,
    TMP_PROCESSCPUSTATEVALUES_WAIT,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemCpuStateValues enum definition
 *
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMCPUSTATEVALUES_USER = 'user';
const TMP_SYSTEMCPUSTATEVALUES_SYSTEM = 'system';
const TMP_SYSTEMCPUSTATEVALUES_NICE = 'nice';
const TMP_SYSTEMCPUSTATEVALUES_IDLE = 'idle';
const TMP_SYSTEMCPUSTATEVALUES_IOWAIT = 'iowait';
const TMP_SYSTEMCPUSTATEVALUES_INTERRUPT = 'interrupt';
const TMP_SYSTEMCPUSTATEVALUES_STEAL = 'steal';

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 */
export const SYSTEMCPUSTATEVALUES_USER = TMP_SYSTEMCPUSTATEVALUES_USER;

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 */
export const SYSTEMCPUSTATEVALUES_SYSTEM = TMP_SYSTEMCPUSTATEVALUES_SYSTEM;

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 */
export const SYSTEMCPUSTATEVALUES_NICE = TMP_SYSTEMCPUSTATEVALUES_NICE;

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 */
export const SYSTEMCPUSTATEVALUES_IDLE = TMP_SYSTEMCPUSTATEVALUES_IDLE;

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 */
export const SYSTEMCPUSTATEVALUES_IOWAIT = TMP_SYSTEMCPUSTATEVALUES_IOWAIT;

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 */
export const SYSTEMCPUSTATEVALUES_INTERRUPT =
  TMP_SYSTEMCPUSTATEVALUES_INTERRUPT;

/**
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 */
export const SYSTEMCPUSTATEVALUES_STEAL = TMP_SYSTEMCPUSTATEVALUES_STEAL;

/**
 * Identifies the Values for SystemCpuStateValues enum definition
 *
 * The CPU state for this data point. A system&#39;s CPU SHOULD be characterized *either* by data points with no `state` labels, *or only* data points with `state` labels.
 * @deprecated Use the SYSTEMCPUSTATEVALUES_XXXXX constants rather than the SystemCpuStateValues.XXXXX for bundle minification.
 */
export type SystemCpuStateValues = {
  /** user. */
  USER: 'user';

  /** system. */
  SYSTEM: 'system';

  /** nice. */
  NICE: 'nice';

  /** idle. */
  IDLE: 'idle';

  /** iowait. */
  IOWAIT: 'iowait';

  /** interrupt. */
  INTERRUPT: 'interrupt';

  /** steal. */
  STEAL: 'steal';
};

/**
 * The constant map of values for SystemCpuStateValues.
 * @deprecated Use the SYSTEMCPUSTATEVALUES_XXXXX constants rather than the SystemCpuStateValues.XXXXX for bundle minification.
 */
export const SystemCpuStateValues: SystemCpuStateValues =
  /*#__PURE__*/ createConstMap<SystemCpuStateValues>([
    TMP_SYSTEMCPUSTATEVALUES_USER,
    TMP_SYSTEMCPUSTATEVALUES_SYSTEM,
    TMP_SYSTEMCPUSTATEVALUES_NICE,
    TMP_SYSTEMCPUSTATEVALUES_IDLE,
    TMP_SYSTEMCPUSTATEVALUES_IOWAIT,
    TMP_SYSTEMCPUSTATEVALUES_INTERRUPT,
    TMP_SYSTEMCPUSTATEVALUES_STEAL,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemMemoryStateValues enum definition
 *
 * The memory state.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMMEMORYSTATEVALUES_USED = 'used';
const TMP_SYSTEMMEMORYSTATEVALUES_FREE = 'free';
const TMP_SYSTEMMEMORYSTATEVALUES_SHARED = 'shared';
const TMP_SYSTEMMEMORYSTATEVALUES_BUFFERS = 'buffers';
const TMP_SYSTEMMEMORYSTATEVALUES_CACHED = 'cached';

/**
 * The memory state.
 */
export const SYSTEMMEMORYSTATEVALUES_USED = TMP_SYSTEMMEMORYSTATEVALUES_USED;

/**
 * The memory state.
 */
export const SYSTEMMEMORYSTATEVALUES_FREE = TMP_SYSTEMMEMORYSTATEVALUES_FREE;

/**
 * The memory state.
 */
export const SYSTEMMEMORYSTATEVALUES_SHARED =
  TMP_SYSTEMMEMORYSTATEVALUES_SHARED;

/**
 * The memory state.
 */
export const SYSTEMMEMORYSTATEVALUES_BUFFERS =
  TMP_SYSTEMMEMORYSTATEVALUES_BUFFERS;

/**
 * The memory state.
 */
export const SYSTEMMEMORYSTATEVALUES_CACHED =
  TMP_SYSTEMMEMORYSTATEVALUES_CACHED;

/**
 * Identifies the Values for SystemMemoryStateValues enum definition
 *
 * The memory state.
 * @deprecated Use the SYSTEMMEMORYSTATEVALUES_XXXXX constants rather than the SystemMemoryStateValues.XXXXX for bundle minification.
 */
export type SystemMemoryStateValues = {
  /** used. */
  USED: 'used';

  /** free. */
  FREE: 'free';

  /** shared. */
  SHARED: 'shared';

  /** buffers. */
  BUFFERS: 'buffers';

  /** cached. */
  CACHED: 'cached';
};

/**
 * The constant map of values for SystemMemoryStateValues.
 * @deprecated Use the SYSTEMMEMORYSTATEVALUES_XXXXX constants rather than the SystemMemoryStateValues.XXXXX for bundle minification.
 */
export const SystemMemoryStateValues: SystemMemoryStateValues =
  /*#__PURE__*/ createConstMap<SystemMemoryStateValues>([
    TMP_SYSTEMMEMORYSTATEVALUES_USED,
    TMP_SYSTEMMEMORYSTATEVALUES_FREE,
    TMP_SYSTEMMEMORYSTATEVALUES_SHARED,
    TMP_SYSTEMMEMORYSTATEVALUES_BUFFERS,
    TMP_SYSTEMMEMORYSTATEVALUES_CACHED,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemPagingDirectionValues enum definition
 *
 * The paging access direction.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMPAGINGDIRECTIONVALUES_IN = 'in';
const TMP_SYSTEMPAGINGDIRECTIONVALUES_OUT = 'out';

/**
 * The paging access direction.
 */
export const SYSTEMPAGINGDIRECTIONVALUES_IN =
  TMP_SYSTEMPAGINGDIRECTIONVALUES_IN;

/**
 * The paging access direction.
 */
export const SYSTEMPAGINGDIRECTIONVALUES_OUT =
  TMP_SYSTEMPAGINGDIRECTIONVALUES_OUT;

/**
 * Identifies the Values for SystemPagingDirectionValues enum definition
 *
 * The paging access direction.
 * @deprecated Use the SYSTEMPAGINGDIRECTIONVALUES_XXXXX constants rather than the SystemPagingDirectionValues.XXXXX for bundle minification.
 */
export type SystemPagingDirectionValues = {
  /** in. */
  IN: 'in';

  /** out. */
  OUT: 'out';
};

/**
 * The constant map of values for SystemPagingDirectionValues.
 * @deprecated Use the SYSTEMPAGINGDIRECTIONVALUES_XXXXX constants rather than the SystemPagingDirectionValues.XXXXX for bundle minification.
 */
export const SystemPagingDirectionValues: SystemPagingDirectionValues =
  /*#__PURE__*/ createConstMap<SystemPagingDirectionValues>([
    TMP_SYSTEMPAGINGDIRECTIONVALUES_IN,
    TMP_SYSTEMPAGINGDIRECTIONVALUES_OUT,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemPagingStateValues enum definition
 *
 * The memory paging state.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMPAGINGSTATEVALUES_USED = 'used';
const TMP_SYSTEMPAGINGSTATEVALUES_FREE = 'free';

/**
 * The memory paging state.
 */
export const SYSTEMPAGINGSTATEVALUES_USED = TMP_SYSTEMPAGINGSTATEVALUES_USED;

/**
 * The memory paging state.
 */
export const SYSTEMPAGINGSTATEVALUES_FREE = TMP_SYSTEMPAGINGSTATEVALUES_FREE;

/**
 * Identifies the Values for SystemPagingStateValues enum definition
 *
 * The memory paging state.
 * @deprecated Use the SYSTEMPAGINGSTATEVALUES_XXXXX constants rather than the SystemPagingStateValues.XXXXX for bundle minification.
 */
export type SystemPagingStateValues = {
  /** used. */
  USED: 'used';

  /** free. */
  FREE: 'free';
};

/**
 * The constant map of values for SystemPagingStateValues.
 * @deprecated Use the SYSTEMPAGINGSTATEVALUES_XXXXX constants rather than the SystemPagingStateValues.XXXXX for bundle minification.
 */
export const SystemPagingStateValues: SystemPagingStateValues =
  /*#__PURE__*/ createConstMap<SystemPagingStateValues>([
    TMP_SYSTEMPAGINGSTATEVALUES_USED,
    TMP_SYSTEMPAGINGSTATEVALUES_FREE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemPagingTypeValues enum definition
 *
 * The memory paging type.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMPAGINGTYPEVALUES_MAJOR = 'major';
const TMP_SYSTEMPAGINGTYPEVALUES_MINOR = 'minor';

/**
 * The memory paging type.
 */
export const SYSTEMPAGINGTYPEVALUES_MAJOR = TMP_SYSTEMPAGINGTYPEVALUES_MAJOR;

/**
 * The memory paging type.
 */
export const SYSTEMPAGINGTYPEVALUES_MINOR = TMP_SYSTEMPAGINGTYPEVALUES_MINOR;

/**
 * Identifies the Values for SystemPagingTypeValues enum definition
 *
 * The memory paging type.
 * @deprecated Use the SYSTEMPAGINGTYPEVALUES_XXXXX constants rather than the SystemPagingTypeValues.XXXXX for bundle minification.
 */
export type SystemPagingTypeValues = {
  /** major. */
  MAJOR: 'major';

  /** minor. */
  MINOR: 'minor';
};

/**
 * The constant map of values for SystemPagingTypeValues.
 * @deprecated Use the SYSTEMPAGINGTYPEVALUES_XXXXX constants rather than the SystemPagingTypeValues.XXXXX for bundle minification.
 */
export const SystemPagingTypeValues: SystemPagingTypeValues =
  /*#__PURE__*/ createConstMap<SystemPagingTypeValues>([
    TMP_SYSTEMPAGINGTYPEVALUES_MAJOR,
    TMP_SYSTEMPAGINGTYPEVALUES_MINOR,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemFilesystemStateValues enum definition
 *
 * The filesystem state.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMFILESYSTEMSTATEVALUES_USED = 'used';
const TMP_SYSTEMFILESYSTEMSTATEVALUES_FREE = 'free';
const TMP_SYSTEMFILESYSTEMSTATEVALUES_RESERVED = 'reserved';

/**
 * The filesystem state.
 */
export const SYSTEMFILESYSTEMSTATEVALUES_USED =
  TMP_SYSTEMFILESYSTEMSTATEVALUES_USED;

/**
 * The filesystem state.
 */
export const SYSTEMFILESYSTEMSTATEVALUES_FREE =
  TMP_SYSTEMFILESYSTEMSTATEVALUES_FREE;

/**
 * The filesystem state.
 */
export const SYSTEMFILESYSTEMSTATEVALUES_RESERVED =
  TMP_SYSTEMFILESYSTEMSTATEVALUES_RESERVED;

/**
 * Identifies the Values for SystemFilesystemStateValues enum definition
 *
 * The filesystem state.
 * @deprecated Use the SYSTEMFILESYSTEMSTATEVALUES_XXXXX constants rather than the SystemFilesystemStateValues.XXXXX for bundle minification.
 */
export type SystemFilesystemStateValues = {
  /** used. */
  USED: 'used';

  /** free. */
  FREE: 'free';

  /** reserved. */
  RESERVED: 'reserved';
};

/**
 * The constant map of values for SystemFilesystemStateValues.
 * @deprecated Use the SYSTEMFILESYSTEMSTATEVALUES_XXXXX constants rather than the SystemFilesystemStateValues.XXXXX for bundle minification.
 */
export const SystemFilesystemStateValues: SystemFilesystemStateValues =
  /*#__PURE__*/ createConstMap<SystemFilesystemStateValues>([
    TMP_SYSTEMFILESYSTEMSTATEVALUES_USED,
    TMP_SYSTEMFILESYSTEMSTATEVALUES_FREE,
    TMP_SYSTEMFILESYSTEMSTATEVALUES_RESERVED,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemFilesystemTypeValues enum definition
 *
 * The filesystem type.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMFILESYSTEMTYPEVALUES_FAT32 = 'fat32';
const TMP_SYSTEMFILESYSTEMTYPEVALUES_EXFAT = 'exfat';
const TMP_SYSTEMFILESYSTEMTYPEVALUES_NTFS = 'ntfs';
const TMP_SYSTEMFILESYSTEMTYPEVALUES_REFS = 'refs';
const TMP_SYSTEMFILESYSTEMTYPEVALUES_HFSPLUS = 'hfsplus';
const TMP_SYSTEMFILESYSTEMTYPEVALUES_EXT4 = 'ext4';

/**
 * The filesystem type.
 */
export const SYSTEMFILESYSTEMTYPEVALUES_FAT32 =
  TMP_SYSTEMFILESYSTEMTYPEVALUES_FAT32;

/**
 * The filesystem type.
 */
export const SYSTEMFILESYSTEMTYPEVALUES_EXFAT =
  TMP_SYSTEMFILESYSTEMTYPEVALUES_EXFAT;

/**
 * The filesystem type.
 */
export const SYSTEMFILESYSTEMTYPEVALUES_NTFS =
  TMP_SYSTEMFILESYSTEMTYPEVALUES_NTFS;

/**
 * The filesystem type.
 */
export const SYSTEMFILESYSTEMTYPEVALUES_REFS =
  TMP_SYSTEMFILESYSTEMTYPEVALUES_REFS;

/**
 * The filesystem type.
 */
export const SYSTEMFILESYSTEMTYPEVALUES_HFSPLUS =
  TMP_SYSTEMFILESYSTEMTYPEVALUES_HFSPLUS;

/**
 * The filesystem type.
 */
export const SYSTEMFILESYSTEMTYPEVALUES_EXT4 =
  TMP_SYSTEMFILESYSTEMTYPEVALUES_EXT4;

/**
 * Identifies the Values for SystemFilesystemTypeValues enum definition
 *
 * The filesystem type.
 * @deprecated Use the SYSTEMFILESYSTEMTYPEVALUES_XXXXX constants rather than the SystemFilesystemTypeValues.XXXXX for bundle minification.
 */
export type SystemFilesystemTypeValues = {
  /** fat32. */
  FAT32: 'fat32';

  /** exfat. */
  EXFAT: 'exfat';

  /** ntfs. */
  NTFS: 'ntfs';

  /** refs. */
  REFS: 'refs';

  /** hfsplus. */
  HFSPLUS: 'hfsplus';

  /** ext4. */
  EXT4: 'ext4';
};

/**
 * The constant map of values for SystemFilesystemTypeValues.
 * @deprecated Use the SYSTEMFILESYSTEMTYPEVALUES_XXXXX constants rather than the SystemFilesystemTypeValues.XXXXX for bundle minification.
 */
export const SystemFilesystemTypeValues: SystemFilesystemTypeValues =
  /*#__PURE__*/ createConstMap<SystemFilesystemTypeValues>([
    TMP_SYSTEMFILESYSTEMTYPEVALUES_FAT32,
    TMP_SYSTEMFILESYSTEMTYPEVALUES_EXFAT,
    TMP_SYSTEMFILESYSTEMTYPEVALUES_NTFS,
    TMP_SYSTEMFILESYSTEMTYPEVALUES_REFS,
    TMP_SYSTEMFILESYSTEMTYPEVALUES_HFSPLUS,
    TMP_SYSTEMFILESYSTEMTYPEVALUES_EXT4,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemNetworkStateValues enum definition
 *
 * A stateless protocol MUST NOT set this attribute.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMNETWORKSTATEVALUES_CLOSE = 'close';
const TMP_SYSTEMNETWORKSTATEVALUES_CLOSE_WAIT = 'close_wait';
const TMP_SYSTEMNETWORKSTATEVALUES_CLOSING = 'closing';
const TMP_SYSTEMNETWORKSTATEVALUES_DELETE = 'delete';
const TMP_SYSTEMNETWORKSTATEVALUES_ESTABLISHED = 'established';
const TMP_SYSTEMNETWORKSTATEVALUES_FIN_WAIT_1 = 'fin_wait_1';
const TMP_SYSTEMNETWORKSTATEVALUES_FIN_WAIT_2 = 'fin_wait_2';
const TMP_SYSTEMNETWORKSTATEVALUES_LAST_ACK = 'last_ack';
const TMP_SYSTEMNETWORKSTATEVALUES_LISTEN = 'listen';
const TMP_SYSTEMNETWORKSTATEVALUES_SYN_RECV = 'syn_recv';
const TMP_SYSTEMNETWORKSTATEVALUES_SYN_SENT = 'syn_sent';
const TMP_SYSTEMNETWORKSTATEVALUES_TIME_WAIT = 'time_wait';

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_CLOSE =
  TMP_SYSTEMNETWORKSTATEVALUES_CLOSE;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_CLOSE_WAIT =
  TMP_SYSTEMNETWORKSTATEVALUES_CLOSE_WAIT;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_CLOSING =
  TMP_SYSTEMNETWORKSTATEVALUES_CLOSING;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_DELETE =
  TMP_SYSTEMNETWORKSTATEVALUES_DELETE;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_ESTABLISHED =
  TMP_SYSTEMNETWORKSTATEVALUES_ESTABLISHED;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_FIN_WAIT_1 =
  TMP_SYSTEMNETWORKSTATEVALUES_FIN_WAIT_1;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_FIN_WAIT_2 =
  TMP_SYSTEMNETWORKSTATEVALUES_FIN_WAIT_2;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_LAST_ACK =
  TMP_SYSTEMNETWORKSTATEVALUES_LAST_ACK;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_LISTEN =
  TMP_SYSTEMNETWORKSTATEVALUES_LISTEN;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_SYN_RECV =
  TMP_SYSTEMNETWORKSTATEVALUES_SYN_RECV;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_SYN_SENT =
  TMP_SYSTEMNETWORKSTATEVALUES_SYN_SENT;

/**
 * A stateless protocol MUST NOT set this attribute.
 */
export const SYSTEMNETWORKSTATEVALUES_TIME_WAIT =
  TMP_SYSTEMNETWORKSTATEVALUES_TIME_WAIT;

/**
 * Identifies the Values for SystemNetworkStateValues enum definition
 *
 * A stateless protocol MUST NOT set this attribute.
 * @deprecated Use the SYSTEMNETWORKSTATEVALUES_XXXXX constants rather than the SystemNetworkStateValues.XXXXX for bundle minification.
 */
export type SystemNetworkStateValues = {
  /** close. */
  CLOSE: 'close';

  /** close_wait. */
  CLOSE_WAIT: 'close_wait';

  /** closing. */
  CLOSING: 'closing';

  /** delete. */
  DELETE: 'delete';

  /** established. */
  ESTABLISHED: 'established';

  /** fin_wait_1. */
  FIN_WAIT_1: 'fin_wait_1';

  /** fin_wait_2. */
  FIN_WAIT_2: 'fin_wait_2';

  /** last_ack. */
  LAST_ACK: 'last_ack';

  /** listen. */
  LISTEN: 'listen';

  /** syn_recv. */
  SYN_RECV: 'syn_recv';

  /** syn_sent. */
  SYN_SENT: 'syn_sent';

  /** time_wait. */
  TIME_WAIT: 'time_wait';
};

/**
 * The constant map of values for SystemNetworkStateValues.
 * @deprecated Use the SYSTEMNETWORKSTATEVALUES_XXXXX constants rather than the SystemNetworkStateValues.XXXXX for bundle minification.
 */
export const SystemNetworkStateValues: SystemNetworkStateValues =
  /*#__PURE__*/ createConstMap<SystemNetworkStateValues>([
    TMP_SYSTEMNETWORKSTATEVALUES_CLOSE,
    TMP_SYSTEMNETWORKSTATEVALUES_CLOSE_WAIT,
    TMP_SYSTEMNETWORKSTATEVALUES_CLOSING,
    TMP_SYSTEMNETWORKSTATEVALUES_DELETE,
    TMP_SYSTEMNETWORKSTATEVALUES_ESTABLISHED,
    TMP_SYSTEMNETWORKSTATEVALUES_FIN_WAIT_1,
    TMP_SYSTEMNETWORKSTATEVALUES_FIN_WAIT_2,
    TMP_SYSTEMNETWORKSTATEVALUES_LAST_ACK,
    TMP_SYSTEMNETWORKSTATEVALUES_LISTEN,
    TMP_SYSTEMNETWORKSTATEVALUES_SYN_RECV,
    TMP_SYSTEMNETWORKSTATEVALUES_SYN_SENT,
    TMP_SYSTEMNETWORKSTATEVALUES_TIME_WAIT,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemProcessStatusValues enum definition
 *
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMPROCESSSTATUSVALUES_RUNNING = 'running';
const TMP_SYSTEMPROCESSSTATUSVALUES_SLEEPING = 'sleeping';
const TMP_SYSTEMPROCESSSTATUSVALUES_STOPPED = 'stopped';
const TMP_SYSTEMPROCESSSTATUSVALUES_DEFUNCT = 'defunct';

/**
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 */
export const SYSTEMPROCESSSTATUSVALUES_RUNNING =
  TMP_SYSTEMPROCESSSTATUSVALUES_RUNNING;

/**
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 */
export const SYSTEMPROCESSSTATUSVALUES_SLEEPING =
  TMP_SYSTEMPROCESSSTATUSVALUES_SLEEPING;

/**
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 */
export const SYSTEMPROCESSSTATUSVALUES_STOPPED =
  TMP_SYSTEMPROCESSSTATUSVALUES_STOPPED;

/**
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 */
export const SYSTEMPROCESSSTATUSVALUES_DEFUNCT =
  TMP_SYSTEMPROCESSSTATUSVALUES_DEFUNCT;

/**
 * Identifies the Values for SystemProcessStatusValues enum definition
 *
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES).
 * @deprecated Use the SYSTEMPROCESSSTATUSVALUES_XXXXX constants rather than the SystemProcessStatusValues.XXXXX for bundle minification.
 */
export type SystemProcessStatusValues = {
  /** running. */
  RUNNING: 'running';

  /** sleeping. */
  SLEEPING: 'sleeping';

  /** stopped. */
  STOPPED: 'stopped';

  /** defunct. */
  DEFUNCT: 'defunct';
};

/**
 * The constant map of values for SystemProcessStatusValues.
 * @deprecated Use the SYSTEMPROCESSSTATUSVALUES_XXXXX constants rather than the SystemProcessStatusValues.XXXXX for bundle minification.
 */
export const SystemProcessStatusValues: SystemProcessStatusValues =
  /*#__PURE__*/ createConstMap<SystemProcessStatusValues>([
    TMP_SYSTEMPROCESSSTATUSVALUES_RUNNING,
    TMP_SYSTEMPROCESSSTATUSVALUES_SLEEPING,
    TMP_SYSTEMPROCESSSTATUSVALUES_STOPPED,
    TMP_SYSTEMPROCESSSTATUSVALUES_DEFUNCT,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for CloudPlatformValues enum definition
 *
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = 'alibaba_cloud_ecs';
const TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = 'alibaba_cloud_fc';
const TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_OPENSHIFT =
  'alibaba_cloud_openshift';
const TMP_CLOUDPLATFORMVALUES_AWS_EC2 = 'aws_ec2';
const TMP_CLOUDPLATFORMVALUES_AWS_ECS = 'aws_ecs';
const TMP_CLOUDPLATFORMVALUES_AWS_EKS = 'aws_eks';
const TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA = 'aws_lambda';
const TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = 'aws_elastic_beanstalk';
const TMP_CLOUDPLATFORMVALUES_AWS_APP_RUNNER = 'aws_app_runner';
const TMP_CLOUDPLATFORMVALUES_AWS_OPENSHIFT = 'aws_openshift';
const TMP_CLOUDPLATFORMVALUES_AZURE_VM = 'azure_vm';
const TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_APPS = 'azure_container_apps';
const TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES =
  'azure_container_instances';
const TMP_CLOUDPLATFORMVALUES_AZURE_AKS = 'azure_aks';
const TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = 'azure_functions';
const TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = 'azure_app_service';
const TMP_CLOUDPLATFORMVALUES_AZURE_OPENSHIFT = 'azure_openshift';
const TMP_CLOUDPLATFORMVALUES_GCP_BARE_METAL_SOLUTION =
  'gcp_bare_metal_solution';
const TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = 'gcp_compute_engine';
const TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = 'gcp_cloud_run';
const TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = 'gcp_kubernetes_engine';
const TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = 'gcp_cloud_functions';
const TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE = 'gcp_app_engine';
const TMP_CLOUDPLATFORMVALUES_GCP_OPENSHIFT = 'gcp_openshift';
const TMP_CLOUDPLATFORMVALUES_IBM_CLOUD_OPENSHIFT = 'ibm_cloud_openshift';
const TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_CVM = 'tencent_cloud_cvm';
const TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_EKS = 'tencent_cloud_eks';
const TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_SCF = 'tencent_cloud_scf';

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS =
  TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC =
  TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_ALIBABA_CLOUD_OPENSHIFT =
  TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_OPENSHIFT;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_EC2 = TMP_CLOUDPLATFORMVALUES_AWS_EC2;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_ECS = TMP_CLOUDPLATFORMVALUES_AWS_ECS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_EKS = TMP_CLOUDPLATFORMVALUES_AWS_EKS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_LAMBDA =
  TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK =
  TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_APP_RUNNER =
  TMP_CLOUDPLATFORMVALUES_AWS_APP_RUNNER;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_OPENSHIFT =
  TMP_CLOUDPLATFORMVALUES_AWS_OPENSHIFT;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_VM = TMP_CLOUDPLATFORMVALUES_AZURE_VM;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_CONTAINER_APPS =
  TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_APPS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES =
  TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_AKS = TMP_CLOUDPLATFORMVALUES_AZURE_AKS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_FUNCTIONS =
  TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_APP_SERVICE =
  TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_OPENSHIFT =
  TMP_CLOUDPLATFORMVALUES_AZURE_OPENSHIFT;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_BARE_METAL_SOLUTION =
  TMP_CLOUDPLATFORMVALUES_GCP_BARE_METAL_SOLUTION;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE =
  TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_CLOUD_RUN =
  TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE =
  TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS =
  TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_APP_ENGINE =
  TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_OPENSHIFT =
  TMP_CLOUDPLATFORMVALUES_GCP_OPENSHIFT;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_IBM_CLOUD_OPENSHIFT =
  TMP_CLOUDPLATFORMVALUES_IBM_CLOUD_OPENSHIFT;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_TENCENT_CLOUD_CVM =
  TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_CVM;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_TENCENT_CLOUD_EKS =
  TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_EKS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_TENCENT_CLOUD_SCF =
  TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_SCF;

/**
 * Identifies the Values for CloudPlatformValues enum definition
 *
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 * @deprecated Use the CLOUDPLATFORMVALUES_XXXXX constants rather than the CloudPlatformValues.XXXXX for bundle minification.
 */
export type CloudPlatformValues = {
  /** Alibaba Cloud Elastic Compute Service. */
  ALIBABA_CLOUD_ECS: 'alibaba_cloud_ecs';

  /** Alibaba Cloud Function Compute. */
  ALIBABA_CLOUD_FC: 'alibaba_cloud_fc';

  /** Red Hat OpenShift on Alibaba Cloud. */
  ALIBABA_CLOUD_OPENSHIFT: 'alibaba_cloud_openshift';

  /** AWS Elastic Compute Cloud. */
  AWS_EC2: 'aws_ec2';

  /** AWS Elastic Container Service. */
  AWS_ECS: 'aws_ecs';

  /** AWS Elastic Kubernetes Service. */
  AWS_EKS: 'aws_eks';

  /** AWS Lambda. */
  AWS_LAMBDA: 'aws_lambda';

  /** AWS Elastic Beanstalk. */
  AWS_ELASTIC_BEANSTALK: 'aws_elastic_beanstalk';

  /** AWS App Runner. */
  AWS_APP_RUNNER: 'aws_app_runner';

  /** Red Hat OpenShift on AWS (ROSA). */
  AWS_OPENSHIFT: 'aws_openshift';

  /** Azure Virtual Machines. */
  AZURE_VM: 'azure_vm';

  /** Azure Container Apps. */
  AZURE_CONTAINER_APPS: 'azure_container_apps';

  /** Azure Container Instances. */
  AZURE_CONTAINER_INSTANCES: 'azure_container_instances';

  /** Azure Kubernetes Service. */
  AZURE_AKS: 'azure_aks';

  /** Azure Functions. */
  AZURE_FUNCTIONS: 'azure_functions';

  /** Azure App Service. */
  AZURE_APP_SERVICE: 'azure_app_service';

  /** Azure Red Hat OpenShift. */
  AZURE_OPENSHIFT: 'azure_openshift';

  /** Google Bare Metal Solution (BMS). */
  GCP_BARE_METAL_SOLUTION: 'gcp_bare_metal_solution';

  /** Google Cloud Compute Engine (GCE). */
  GCP_COMPUTE_ENGINE: 'gcp_compute_engine';

  /** Google Cloud Run. */
  GCP_CLOUD_RUN: 'gcp_cloud_run';

  /** Google Cloud Kubernetes Engine (GKE). */
  GCP_KUBERNETES_ENGINE: 'gcp_kubernetes_engine';

  /** Google Cloud Functions (GCF). */
  GCP_CLOUD_FUNCTIONS: 'gcp_cloud_functions';

  /** Google Cloud App Engine (GAE). */
  GCP_APP_ENGINE: 'gcp_app_engine';

  /** Red Hat OpenShift on Google Cloud. */
  GCP_OPENSHIFT: 'gcp_openshift';

  /** Red Hat OpenShift on IBM Cloud. */
  IBM_CLOUD_OPENSHIFT: 'ibm_cloud_openshift';

  /** Tencent Cloud Cloud Virtual Machine (CVM). */
  TENCENT_CLOUD_CVM: 'tencent_cloud_cvm';

  /** Tencent Cloud Elastic Kubernetes Service (EKS). */
  TENCENT_CLOUD_EKS: 'tencent_cloud_eks';

  /** Tencent Cloud Serverless Cloud Function (SCF). */
  TENCENT_CLOUD_SCF: 'tencent_cloud_scf';
};

/**
 * The constant map of values for CloudPlatformValues.
 * @deprecated Use the CLOUDPLATFORMVALUES_XXXXX constants rather than the CloudPlatformValues.XXXXX for bundle minification.
 */
export const CloudPlatformValues: CloudPlatformValues =
  /*#__PURE__*/ createConstMap<CloudPlatformValues>([
    TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS,
    TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC,
    TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_OPENSHIFT,
    TMP_CLOUDPLATFORMVALUES_AWS_EC2,
    TMP_CLOUDPLATFORMVALUES_AWS_ECS,
    TMP_CLOUDPLATFORMVALUES_AWS_EKS,
    TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA,
    TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK,
    TMP_CLOUDPLATFORMVALUES_AWS_APP_RUNNER,
    TMP_CLOUDPLATFORMVALUES_AWS_OPENSHIFT,
    TMP_CLOUDPLATFORMVALUES_AZURE_VM,
    TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_APPS,
    TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES,
    TMP_CLOUDPLATFORMVALUES_AZURE_AKS,
    TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS,
    TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE,
    TMP_CLOUDPLATFORMVALUES_AZURE_OPENSHIFT,
    TMP_CLOUDPLATFORMVALUES_GCP_BARE_METAL_SOLUTION,
    TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE,
    TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN,
    TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE,
    TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS,
    TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE,
    TMP_CLOUDPLATFORMVALUES_GCP_OPENSHIFT,
    TMP_CLOUDPLATFORMVALUES_IBM_CLOUD_OPENSHIFT,
    TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_CVM,
    TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_EKS,
    TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_SCF,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for CloudProviderValues enum definition
 *
 * Name of the cloud provider.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD = 'alibaba_cloud';
const TMP_CLOUDPROVIDERVALUES_AWS = 'aws';
const TMP_CLOUDPROVIDERVALUES_AZURE = 'azure';
const TMP_CLOUDPROVIDERVALUES_GCP = 'gcp';
const TMP_CLOUDPROVIDERVALUES_HEROKU = 'heroku';
const TMP_CLOUDPROVIDERVALUES_IBM_CLOUD = 'ibm_cloud';
const TMP_CLOUDPROVIDERVALUES_TENCENT_CLOUD = 'tencent_cloud';

/**
 * Name of the cloud provider.
 */
export const CLOUDPROVIDERVALUES_ALIBABA_CLOUD =
  TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD;

/**
 * Name of the cloud provider.
 */
export const CLOUDPROVIDERVALUES_AWS = TMP_CLOUDPROVIDERVALUES_AWS;

/**
 * Name of the cloud provider.
 */
export const CLOUDPROVIDERVALUES_AZURE = TMP_CLOUDPROVIDERVALUES_AZURE;

/**
 * Name of the cloud provider.
 */
export const CLOUDPROVIDERVALUES_GCP = TMP_CLOUDPROVIDERVALUES_GCP;

/**
 * Name of the cloud provider.
 */
export const CLOUDPROVIDERVALUES_HEROKU = TMP_CLOUDPROVIDERVALUES_HEROKU;

/**
 * Name of the cloud provider.
 */
export const CLOUDPROVIDERVALUES_IBM_CLOUD = TMP_CLOUDPROVIDERVALUES_IBM_CLOUD;

/**
 * Name of the cloud provider.
 */
export const CLOUDPROVIDERVALUES_TENCENT_CLOUD =
  TMP_CLOUDPROVIDERVALUES_TENCENT_CLOUD;

/**
 * Identifies the Values for CloudProviderValues enum definition
 *
 * Name of the cloud provider.
 * @deprecated Use the CLOUDPROVIDERVALUES_XXXXX constants rather than the CloudProviderValues.XXXXX for bundle minification.
 */
export type CloudProviderValues = {
  /** Alibaba Cloud. */
  ALIBABA_CLOUD: 'alibaba_cloud';

  /** Amazon Web Services. */
  AWS: 'aws';

  /** Microsoft Azure. */
  AZURE: 'azure';

  /** Google Cloud Platform. */
  GCP: 'gcp';

  /** Heroku Platform as a Service. */
  HEROKU: 'heroku';

  /** IBM Cloud. */
  IBM_CLOUD: 'ibm_cloud';

  /** Tencent Cloud. */
  TENCENT_CLOUD: 'tencent_cloud';
};

/**
 * The constant map of values for CloudProviderValues.
 * @deprecated Use the CLOUDPROVIDERVALUES_XXXXX constants rather than the CloudProviderValues.XXXXX for bundle minification.
 */
export const CloudProviderValues: CloudProviderValues =
  /*#__PURE__*/ createConstMap<CloudProviderValues>([
    TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD,
    TMP_CLOUDPROVIDERVALUES_AWS,
    TMP_CLOUDPROVIDERVALUES_AZURE,
    TMP_CLOUDPROVIDERVALUES_GCP,
    TMP_CLOUDPROVIDERVALUES_HEROKU,
    TMP_CLOUDPROVIDERVALUES_IBM_CLOUD,
    TMP_CLOUDPROVIDERVALUES_TENCENT_CLOUD,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for ContainerCpuStateValues enum definition
 *
 * The CPU state for this data point.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_CONTAINERCPUSTATEVALUES_USER = 'user';
const TMP_CONTAINERCPUSTATEVALUES_SYSTEM = 'system';
const TMP_CONTAINERCPUSTATEVALUES_KERNEL = 'kernel';

/**
 * The CPU state for this data point.
 */
export const CONTAINERCPUSTATEVALUES_USER = TMP_CONTAINERCPUSTATEVALUES_USER;

/**
 * The CPU state for this data point.
 */
export const CONTAINERCPUSTATEVALUES_SYSTEM =
  TMP_CONTAINERCPUSTATEVALUES_SYSTEM;

/**
 * The CPU state for this data point.
 */
export const CONTAINERCPUSTATEVALUES_KERNEL =
  TMP_CONTAINERCPUSTATEVALUES_KERNEL;

/**
 * Identifies the Values for ContainerCpuStateValues enum definition
 *
 * The CPU state for this data point.
 * @deprecated Use the CONTAINERCPUSTATEVALUES_XXXXX constants rather than the ContainerCpuStateValues.XXXXX for bundle minification.
 */
export type ContainerCpuStateValues = {
  /** When tasks of the cgroup are in user mode (Linux). When all container processes are in user mode (Windows). */
  USER: 'user';

  /** When CPU is used by the system (host OS). */
  SYSTEM: 'system';

  /** When tasks of the cgroup are in kernel mode (Linux). When all container processes are in kernel mode (Windows). */
  KERNEL: 'kernel';
};

/**
 * The constant map of values for ContainerCpuStateValues.
 * @deprecated Use the CONTAINERCPUSTATEVALUES_XXXXX constants rather than the ContainerCpuStateValues.XXXXX for bundle minification.
 */
export const ContainerCpuStateValues: ContainerCpuStateValues =
  /*#__PURE__*/ createConstMap<ContainerCpuStateValues>([
    TMP_CONTAINERCPUSTATEVALUES_USER,
    TMP_CONTAINERCPUSTATEVALUES_SYSTEM,
    TMP_CONTAINERCPUSTATEVALUES_KERNEL,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for DbCassandraConsistencyLevelValues enum definition
 *
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
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
 * Constant values for DbCosmosdbConnectionModeValues enum definition
 *
 * Cosmos client connection mode.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_DBCOSMOSDBCONNECTIONMODEVALUES_GATEWAY = 'gateway';
const TMP_DBCOSMOSDBCONNECTIONMODEVALUES_DIRECT = 'direct';

/**
 * Cosmos client connection mode.
 */
export const DBCOSMOSDBCONNECTIONMODEVALUES_GATEWAY =
  TMP_DBCOSMOSDBCONNECTIONMODEVALUES_GATEWAY;

/**
 * Cosmos client connection mode.
 */
export const DBCOSMOSDBCONNECTIONMODEVALUES_DIRECT =
  TMP_DBCOSMOSDBCONNECTIONMODEVALUES_DIRECT;

/**
 * Identifies the Values for DbCosmosdbConnectionModeValues enum definition
 *
 * Cosmos client connection mode.
 * @deprecated Use the DBCOSMOSDBCONNECTIONMODEVALUES_XXXXX constants rather than the DbCosmosdbConnectionModeValues.XXXXX for bundle minification.
 */
export type DbCosmosdbConnectionModeValues = {
  /** Gateway (HTTP) connections mode. */
  GATEWAY: 'gateway';

  /** Direct connection. */
  DIRECT: 'direct';
};

/**
 * The constant map of values for DbCosmosdbConnectionModeValues.
 * @deprecated Use the DBCOSMOSDBCONNECTIONMODEVALUES_XXXXX constants rather than the DbCosmosdbConnectionModeValues.XXXXX for bundle minification.
 */
export const DbCosmosdbConnectionModeValues: DbCosmosdbConnectionModeValues =
  /*#__PURE__*/ createConstMap<DbCosmosdbConnectionModeValues>([
    TMP_DBCOSMOSDBCONNECTIONMODEVALUES_GATEWAY,
    TMP_DBCOSMOSDBCONNECTIONMODEVALUES_DIRECT,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for DbCosmosdbOperationTypeValues enum definition
 *
 * CosmosDB Operation Type.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_INVALID = 'Invalid';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_CREATE = 'Create';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_PATCH = 'Patch';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_READ = 'Read';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_READ_FEED = 'ReadFeed';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_DELETE = 'Delete';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_REPLACE = 'Replace';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_EXECUTE = 'Execute';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_QUERY = 'Query';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_HEAD = 'Head';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_HEAD_FEED = 'HeadFeed';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_UPSERT = 'Upsert';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_BATCH = 'Batch';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_QUERY_PLAN = 'QueryPlan';
const TMP_DBCOSMOSDBOPERATIONTYPEVALUES_EXECUTE_JAVASCRIPT =
  'ExecuteJavaScript';

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_INVALID =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_INVALID;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_CREATE =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_CREATE;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_PATCH =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_PATCH;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_READ =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_READ;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_READ_FEED =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_READ_FEED;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_DELETE =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_DELETE;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_REPLACE =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_REPLACE;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_EXECUTE =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_EXECUTE;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_QUERY =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_QUERY;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_HEAD =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_HEAD;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_HEAD_FEED =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_HEAD_FEED;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_UPSERT =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_UPSERT;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_BATCH =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_BATCH;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_QUERY_PLAN =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_QUERY_PLAN;

/**
 * CosmosDB Operation Type.
 */
export const DBCOSMOSDBOPERATIONTYPEVALUES_EXECUTE_JAVASCRIPT =
  TMP_DBCOSMOSDBOPERATIONTYPEVALUES_EXECUTE_JAVASCRIPT;

/**
 * Identifies the Values for DbCosmosdbOperationTypeValues enum definition
 *
 * CosmosDB Operation Type.
 * @deprecated Use the DBCOSMOSDBOPERATIONTYPEVALUES_XXXXX constants rather than the DbCosmosdbOperationTypeValues.XXXXX for bundle minification.
 */
export type DbCosmosdbOperationTypeValues = {
  /** invalid. */
  INVALID: 'Invalid';

  /** create. */
  CREATE: 'Create';

  /** patch. */
  PATCH: 'Patch';

  /** read. */
  READ: 'Read';

  /** read_feed. */
  READ_FEED: 'ReadFeed';

  /** delete. */
  DELETE: 'Delete';

  /** replace. */
  REPLACE: 'Replace';

  /** execute. */
  EXECUTE: 'Execute';

  /** query. */
  QUERY: 'Query';

  /** head. */
  HEAD: 'Head';

  /** head_feed. */
  HEAD_FEED: 'HeadFeed';

  /** upsert. */
  UPSERT: 'Upsert';

  /** batch. */
  BATCH: 'Batch';

  /** query_plan. */
  QUERY_PLAN: 'QueryPlan';

  /** execute_javascript. */
  EXECUTE_JAVASCRIPT: 'ExecuteJavaScript';
};

/**
 * The constant map of values for DbCosmosdbOperationTypeValues.
 * @deprecated Use the DBCOSMOSDBOPERATIONTYPEVALUES_XXXXX constants rather than the DbCosmosdbOperationTypeValues.XXXXX for bundle minification.
 */
export const DbCosmosdbOperationTypeValues: DbCosmosdbOperationTypeValues = {
  INVALID: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_INVALID,
  CREATE: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_CREATE,
  PATCH: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_PATCH,
  READ: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_READ,
  READ_FEED: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_READ_FEED,
  DELETE: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_DELETE,
  REPLACE: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_REPLACE,
  EXECUTE: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_EXECUTE,
  QUERY: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_QUERY,
  HEAD: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_HEAD,
  HEAD_FEED: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_HEAD_FEED,
  UPSERT: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_UPSERT,
  BATCH: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_BATCH,
  QUERY_PLAN: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_QUERY_PLAN,
  EXECUTE_JAVASCRIPT: TMP_DBCOSMOSDBOPERATIONTYPEVALUES_EXECUTE_JAVASCRIPT,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for DbSystemValues enum definition
 *
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_DBSYSTEMVALUES_OTHER_SQL = 'other_sql';
const TMP_DBSYSTEMVALUES_MSSQL = 'mssql';
const TMP_DBSYSTEMVALUES_MSSQLCOMPACT = 'mssqlcompact';
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
const TMP_DBSYSTEMVALUES_OPENSEARCH = 'opensearch';
const TMP_DBSYSTEMVALUES_CLICKHOUSE = 'clickhouse';
const TMP_DBSYSTEMVALUES_SPANNER = 'spanner';
const TMP_DBSYSTEMVALUES_TRINO = 'trino';

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
export const DBSYSTEMVALUES_MSSQLCOMPACT = TMP_DBSYSTEMVALUES_MSSQLCOMPACT;

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
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_OPENSEARCH = TMP_DBSYSTEMVALUES_OPENSEARCH;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_CLICKHOUSE = TMP_DBSYSTEMVALUES_CLICKHOUSE;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_SPANNER = TMP_DBSYSTEMVALUES_SPANNER;

/**
 * An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
 */
export const DBSYSTEMVALUES_TRINO = TMP_DBSYSTEMVALUES_TRINO;

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

  /** Microsoft SQL Server Compact. */
  MSSQLCOMPACT: 'mssqlcompact';

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

  /** OpenSearch. */
  OPENSEARCH: 'opensearch';

  /** ClickHouse. */
  CLICKHOUSE: 'clickhouse';

  /** Cloud Spanner. */
  SPANNER: 'spanner';

  /** Trino. */
  TRINO: 'trino';
};

/**
 * The constant map of values for DbSystemValues.
 * @deprecated Use the DBSYSTEMVALUES_XXXXX constants rather than the DbSystemValues.XXXXX for bundle minification.
 */
export const DbSystemValues: DbSystemValues =
  /*#__PURE__*/ createConstMap<DbSystemValues>([
    TMP_DBSYSTEMVALUES_OTHER_SQL,
    TMP_DBSYSTEMVALUES_MSSQL,
    TMP_DBSYSTEMVALUES_MSSQLCOMPACT,
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
    TMP_DBSYSTEMVALUES_OPENSEARCH,
    TMP_DBSYSTEMVALUES_CLICKHOUSE,
    TMP_DBSYSTEMVALUES_SPANNER,
    TMP_DBSYSTEMVALUES_TRINO,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for HttpFlavorValues enum definition
 *
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_HTTPFLAVORVALUES_HTTP_1_0 = '1.0';
const TMP_HTTPFLAVORVALUES_HTTP_1_1 = '1.1';
const TMP_HTTPFLAVORVALUES_HTTP_2_0 = '2.0';
const TMP_HTTPFLAVORVALUES_HTTP_3_0 = '3.0';
const TMP_HTTPFLAVORVALUES_SPDY = 'SPDY';
const TMP_HTTPFLAVORVALUES_QUIC = 'QUIC';

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTPFLAVORVALUES_HTTP_1_0 = TMP_HTTPFLAVORVALUES_HTTP_1_0;

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTPFLAVORVALUES_HTTP_1_1 = TMP_HTTPFLAVORVALUES_HTTP_1_1;

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTPFLAVORVALUES_HTTP_2_0 = TMP_HTTPFLAVORVALUES_HTTP_2_0;

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTPFLAVORVALUES_HTTP_3_0 = TMP_HTTPFLAVORVALUES_HTTP_3_0;

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTPFLAVORVALUES_SPDY = TMP_HTTPFLAVORVALUES_SPDY;

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.
 */
export const HTTPFLAVORVALUES_QUIC = TMP_HTTPFLAVORVALUES_QUIC;

/**
 * Identifies the Values for HttpFlavorValues enum definition
 *
 * Deprecated, use `network.protocol.name` instead.
 *
 * @deprecated Replaced by `network.protocol.name`.  Use the HTTPFLAVORVALUES_XXXXX constants rather than the HttpFlavorValues.XXXXX for bundle minification.
 */
export type HttpFlavorValues = {
  /** HTTP/1.0. */
  HTTP_1_0: '1.0';

  /** HTTP/1.1. */
  HTTP_1_1: '1.1';

  /** HTTP/2. */
  HTTP_2_0: '2.0';

  /** HTTP/3. */
  HTTP_3_0: '3.0';

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
  HTTP_3_0: TMP_HTTPFLAVORVALUES_HTTP_3_0,
  SPDY: TMP_HTTPFLAVORVALUES_SPDY,
  QUIC: TMP_HTTPFLAVORVALUES_QUIC,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetSockFamilyValues enum definition
 *
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_NETSOCKFAMILYVALUES_INET = 'inet';
const TMP_NETSOCKFAMILYVALUES_INET6 = 'inet6';
const TMP_NETSOCKFAMILYVALUES_UNIX = 'unix';

/**
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const NETSOCKFAMILYVALUES_INET = TMP_NETSOCKFAMILYVALUES_INET;

/**
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const NETSOCKFAMILYVALUES_INET6 = TMP_NETSOCKFAMILYVALUES_INET6;

/**
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @deprecated Split to `network.transport` and `network.type`.
 */
export const NETSOCKFAMILYVALUES_UNIX = TMP_NETSOCKFAMILYVALUES_UNIX;

/**
 * Identifies the Values for NetSockFamilyValues enum definition
 *
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @deprecated Split to `network.transport` and `network.type`.  Use the NETSOCKFAMILYVALUES_XXXXX constants rather than the NetSockFamilyValues.XXXXX for bundle minification.
 */
export type NetSockFamilyValues = {
  /** IPv4 address. */
  INET: 'inet';

  /** IPv6 address. */
  INET6: 'inet6';

  /** Unix domain socket path. */
  UNIX: 'unix';
};

/**
 * The constant map of values for NetSockFamilyValues.
 * @deprecated Use the NETSOCKFAMILYVALUES_XXXXX constants rather than the NetSockFamilyValues.XXXXX for bundle minification.
 */
export const NetSockFamilyValues: NetSockFamilyValues =
  /*#__PURE__*/ createConstMap<NetSockFamilyValues>([
    TMP_NETSOCKFAMILYVALUES_INET,
    TMP_NETSOCKFAMILYVALUES_INET6,
    TMP_NETSOCKFAMILYVALUES_UNIX,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetTransportValues enum definition
 *
 * Deprecated, use `network.transport`.
 *
 * @deprecated Replaced by `network.transport`.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_NETTRANSPORTVALUES_IP_TCP = 'ip_tcp';
const TMP_NETTRANSPORTVALUES_IP_UDP = 'ip_udp';
const TMP_NETTRANSPORTVALUES_PIPE = 'pipe';
const TMP_NETTRANSPORTVALUES_INPROC = 'inproc';
const TMP_NETTRANSPORTVALUES_OTHER = 'other';

/**
 * Deprecated, use `network.transport`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NETTRANSPORTVALUES_IP_TCP = TMP_NETTRANSPORTVALUES_IP_TCP;

/**
 * Deprecated, use `network.transport`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NETTRANSPORTVALUES_IP_UDP = TMP_NETTRANSPORTVALUES_IP_UDP;

/**
 * Deprecated, use `network.transport`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NETTRANSPORTVALUES_PIPE = TMP_NETTRANSPORTVALUES_PIPE;

/**
 * Deprecated, use `network.transport`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NETTRANSPORTVALUES_INPROC = TMP_NETTRANSPORTVALUES_INPROC;

/**
 * Deprecated, use `network.transport`.
 *
 * @deprecated Replaced by `network.transport`.
 */
export const NETTRANSPORTVALUES_OTHER = TMP_NETTRANSPORTVALUES_OTHER;

/**
 * Identifies the Values for NetTransportValues enum definition
 *
 * Deprecated, use `network.transport`.
 *
 * @deprecated Replaced by `network.transport`.  Use the NETTRANSPORTVALUES_XXXXX constants rather than the NetTransportValues.XXXXX for bundle minification.
 */
export type NetTransportValues = {
  /** ip_tcp. */
  IP_TCP: 'ip_tcp';

  /** ip_udp. */
  IP_UDP: 'ip_udp';

  /** Named or anonymous pipe. */
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
    TMP_NETTRANSPORTVALUES_PIPE,
    TMP_NETTRANSPORTVALUES_INPROC,
    TMP_NETTRANSPORTVALUES_OTHER,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for SystemProcessesStatusValues enum definition
 *
 * Deprecated, use `system.process.status` instead.
 *
 * @deprecated Replaced by `system.process.status`.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_SYSTEMPROCESSESSTATUSVALUES_RUNNING = 'running';
const TMP_SYSTEMPROCESSESSTATUSVALUES_SLEEPING = 'sleeping';
const TMP_SYSTEMPROCESSESSTATUSVALUES_STOPPED = 'stopped';
const TMP_SYSTEMPROCESSESSTATUSVALUES_DEFUNCT = 'defunct';

/**
 * Deprecated, use `system.process.status` instead.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SYSTEMPROCESSESSTATUSVALUES_RUNNING =
  TMP_SYSTEMPROCESSESSTATUSVALUES_RUNNING;

/**
 * Deprecated, use `system.process.status` instead.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SYSTEMPROCESSESSTATUSVALUES_SLEEPING =
  TMP_SYSTEMPROCESSESSTATUSVALUES_SLEEPING;

/**
 * Deprecated, use `system.process.status` instead.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SYSTEMPROCESSESSTATUSVALUES_STOPPED =
  TMP_SYSTEMPROCESSESSTATUSVALUES_STOPPED;

/**
 * Deprecated, use `system.process.status` instead.
 *
 * @deprecated Replaced by `system.process.status`.
 */
export const SYSTEMPROCESSESSTATUSVALUES_DEFUNCT =
  TMP_SYSTEMPROCESSESSTATUSVALUES_DEFUNCT;

/**
 * Identifies the Values for SystemProcessesStatusValues enum definition
 *
 * Deprecated, use `system.process.status` instead.
 *
 * @deprecated Replaced by `system.process.status`.  Use the SYSTEMPROCESSESSTATUSVALUES_XXXXX constants rather than the SystemProcessesStatusValues.XXXXX for bundle minification.
 */
export type SystemProcessesStatusValues = {
  /** running. */
  RUNNING: 'running';

  /** sleeping. */
  SLEEPING: 'sleeping';

  /** stopped. */
  STOPPED: 'stopped';

  /** defunct. */
  DEFUNCT: 'defunct';
};

/**
 * The constant map of values for SystemProcessesStatusValues.
 * @deprecated Use the SYSTEMPROCESSESSTATUSVALUES_XXXXX constants rather than the SystemProcessesStatusValues.XXXXX for bundle minification.
 */
export const SystemProcessesStatusValues: SystemProcessesStatusValues =
  /*#__PURE__*/ createConstMap<SystemProcessesStatusValues>([
    TMP_SYSTEMPROCESSESSTATUSVALUES_RUNNING,
    TMP_SYSTEMPROCESSESSTATUSVALUES_SLEEPING,
    TMP_SYSTEMPROCESSESSTATUSVALUES_STOPPED,
    TMP_SYSTEMPROCESSESSTATUSVALUES_DEFUNCT,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for DiskIoDirectionValues enum definition
 *
 * The disk IO operation direction.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_DISKIODIRECTIONVALUES_READ = 'read';
const TMP_DISKIODIRECTIONVALUES_WRITE = 'write';

/**
 * The disk IO operation direction.
 */
export const DISKIODIRECTIONVALUES_READ = TMP_DISKIODIRECTIONVALUES_READ;

/**
 * The disk IO operation direction.
 */
export const DISKIODIRECTIONVALUES_WRITE = TMP_DISKIODIRECTIONVALUES_WRITE;

/**
 * Identifies the Values for DiskIoDirectionValues enum definition
 *
 * The disk IO operation direction.
 * @deprecated Use the DISKIODIRECTIONVALUES_XXXXX constants rather than the DiskIoDirectionValues.XXXXX for bundle minification.
 */
export type DiskIoDirectionValues = {
  /** read. */
  READ: 'read';

  /** write. */
  WRITE: 'write';
};

/**
 * The constant map of values for DiskIoDirectionValues.
 * @deprecated Use the DISKIODIRECTIONVALUES_XXXXX constants rather than the DiskIoDirectionValues.XXXXX for bundle minification.
 */
export const DiskIoDirectionValues: DiskIoDirectionValues =
  /*#__PURE__*/ createConstMap<DiskIoDirectionValues>([
    TMP_DISKIODIRECTIONVALUES_READ,
    TMP_DISKIODIRECTIONVALUES_WRITE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for ErrorTypeValues enum definition
 *
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
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_ERRORTYPEVALUES_OTHER = '_OTHER';

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
export const ERRORTYPEVALUES_OTHER = TMP_ERRORTYPEVALUES_OTHER;

/**
 * Identifies the Values for ErrorTypeValues enum definition
 *
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
 * @deprecated Use the ERRORTYPEVALUES_XXXXX constants rather than the ErrorTypeValues.XXXXX for bundle minification.
 */
export type ErrorTypeValues = {
  /** A fallback error value to be used when the instrumentation doesn&#39;t define a custom value. */
  OTHER: '_OTHER';
};

/**
 * The constant map of values for ErrorTypeValues.
 * @deprecated Use the ERRORTYPEVALUES_XXXXX constants rather than the ErrorTypeValues.XXXXX for bundle minification.
 */
export const ErrorTypeValues: ErrorTypeValues = {
  OTHER: TMP_ERRORTYPEVALUES_OTHER,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for FaasDocumentOperationValues enum definition
 *
 * Describes the type of the operation that was performed on the data.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
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
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = 'alibaba_cloud';
const TMP_FAASINVOKEDPROVIDERVALUES_AWS = 'aws';
const TMP_FAASINVOKEDPROVIDERVALUES_AZURE = 'azure';
const TMP_FAASINVOKEDPROVIDERVALUES_GCP = 'gcp';
const TMP_FAASINVOKEDPROVIDERVALUES_TENCENT_CLOUD = 'tencent_cloud';

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
 * The cloud provider of the invoked function.
 *
 * Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 */
export const FAASINVOKEDPROVIDERVALUES_TENCENT_CLOUD =
  TMP_FAASINVOKEDPROVIDERVALUES_TENCENT_CLOUD;

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

  /** Tencent Cloud. */
  TENCENT_CLOUD: 'tencent_cloud';
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
    TMP_FAASINVOKEDPROVIDERVALUES_TENCENT_CLOUD,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for FaasTriggerValues enum definition
 *
 * Type of the trigger which caused this function invocation.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_FAASTRIGGERVALUES_DATASOURCE = 'datasource';
const TMP_FAASTRIGGERVALUES_HTTP = 'http';
const TMP_FAASTRIGGERVALUES_PUBSUB = 'pubsub';
const TMP_FAASTRIGGERVALUES_TIMER = 'timer';
const TMP_FAASTRIGGERVALUES_OTHER = 'other';

/**
 * Type of the trigger which caused this function invocation.
 */
export const FAASTRIGGERVALUES_DATASOURCE = TMP_FAASTRIGGERVALUES_DATASOURCE;

/**
 * Type of the trigger which caused this function invocation.
 */
export const FAASTRIGGERVALUES_HTTP = TMP_FAASTRIGGERVALUES_HTTP;

/**
 * Type of the trigger which caused this function invocation.
 */
export const FAASTRIGGERVALUES_PUBSUB = TMP_FAASTRIGGERVALUES_PUBSUB;

/**
 * Type of the trigger which caused this function invocation.
 */
export const FAASTRIGGERVALUES_TIMER = TMP_FAASTRIGGERVALUES_TIMER;

/**
 * Type of the trigger which caused this function invocation.
 */
export const FAASTRIGGERVALUES_OTHER = TMP_FAASTRIGGERVALUES_OTHER;

/**
 * Identifies the Values for FaasTriggerValues enum definition
 *
 * Type of the trigger which caused this function invocation.
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
 * Constant values for HostArchValues enum definition
 *
 * The CPU architecture the host system is running on.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_HOSTARCHVALUES_AMD64 = 'amd64';
const TMP_HOSTARCHVALUES_ARM32 = 'arm32';
const TMP_HOSTARCHVALUES_ARM64 = 'arm64';
const TMP_HOSTARCHVALUES_IA64 = 'ia64';
const TMP_HOSTARCHVALUES_PPC32 = 'ppc32';
const TMP_HOSTARCHVALUES_PPC64 = 'ppc64';
const TMP_HOSTARCHVALUES_S390X = 's390x';
const TMP_HOSTARCHVALUES_X86 = 'x86';

/**
 * The CPU architecture the host system is running on.
 */
export const HOSTARCHVALUES_AMD64 = TMP_HOSTARCHVALUES_AMD64;

/**
 * The CPU architecture the host system is running on.
 */
export const HOSTARCHVALUES_ARM32 = TMP_HOSTARCHVALUES_ARM32;

/**
 * The CPU architecture the host system is running on.
 */
export const HOSTARCHVALUES_ARM64 = TMP_HOSTARCHVALUES_ARM64;

/**
 * The CPU architecture the host system is running on.
 */
export const HOSTARCHVALUES_IA64 = TMP_HOSTARCHVALUES_IA64;

/**
 * The CPU architecture the host system is running on.
 */
export const HOSTARCHVALUES_PPC32 = TMP_HOSTARCHVALUES_PPC32;

/**
 * The CPU architecture the host system is running on.
 */
export const HOSTARCHVALUES_PPC64 = TMP_HOSTARCHVALUES_PPC64;

/**
 * The CPU architecture the host system is running on.
 */
export const HOSTARCHVALUES_S390X = TMP_HOSTARCHVALUES_S390X;

/**
 * The CPU architecture the host system is running on.
 */
export const HOSTARCHVALUES_X86 = TMP_HOSTARCHVALUES_X86;

/**
 * Identifies the Values for HostArchValues enum definition
 *
 * The CPU architecture the host system is running on.
 * @deprecated Use the HOSTARCHVALUES_XXXXX constants rather than the HostArchValues.XXXXX for bundle minification.
 */
export type HostArchValues = {
  /** AMD64. */
  AMD64: 'amd64';

  /** ARM32. */
  ARM32: 'arm32';

  /** ARM64. */
  ARM64: 'arm64';

  /** Itanium. */
  IA64: 'ia64';

  /** 32-bit PowerPC. */
  PPC32: 'ppc32';

  /** 64-bit PowerPC. */
  PPC64: 'ppc64';

  /** IBM z/Architecture. */
  S390X: 's390x';

  /** 32-bit x86. */
  X86: 'x86';
};

/**
 * The constant map of values for HostArchValues.
 * @deprecated Use the HOSTARCHVALUES_XXXXX constants rather than the HostArchValues.XXXXX for bundle minification.
 */
export const HostArchValues: HostArchValues =
  /*#__PURE__*/ createConstMap<HostArchValues>([
    TMP_HOSTARCHVALUES_AMD64,
    TMP_HOSTARCHVALUES_ARM32,
    TMP_HOSTARCHVALUES_ARM64,
    TMP_HOSTARCHVALUES_IA64,
    TMP_HOSTARCHVALUES_PPC32,
    TMP_HOSTARCHVALUES_PPC64,
    TMP_HOSTARCHVALUES_S390X,
    TMP_HOSTARCHVALUES_X86,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for HttpConnectionStateValues enum definition
 *
 * State of the HTTP connection in the HTTP connection pool.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_HTTPCONNECTIONSTATEVALUES_ACTIVE = 'active';
const TMP_HTTPCONNECTIONSTATEVALUES_IDLE = 'idle';

/**
 * State of the HTTP connection in the HTTP connection pool.
 */
export const HTTPCONNECTIONSTATEVALUES_ACTIVE =
  TMP_HTTPCONNECTIONSTATEVALUES_ACTIVE;

/**
 * State of the HTTP connection in the HTTP connection pool.
 */
export const HTTPCONNECTIONSTATEVALUES_IDLE =
  TMP_HTTPCONNECTIONSTATEVALUES_IDLE;

/**
 * Identifies the Values for HttpConnectionStateValues enum definition
 *
 * State of the HTTP connection in the HTTP connection pool.
 * @deprecated Use the HTTPCONNECTIONSTATEVALUES_XXXXX constants rather than the HttpConnectionStateValues.XXXXX for bundle minification.
 */
export type HttpConnectionStateValues = {
  /** active state. */
  ACTIVE: 'active';

  /** idle state. */
  IDLE: 'idle';
};

/**
 * The constant map of values for HttpConnectionStateValues.
 * @deprecated Use the HTTPCONNECTIONSTATEVALUES_XXXXX constants rather than the HttpConnectionStateValues.XXXXX for bundle minification.
 */
export const HttpConnectionStateValues: HttpConnectionStateValues =
  /*#__PURE__*/ createConstMap<HttpConnectionStateValues>([
    TMP_HTTPCONNECTIONSTATEVALUES_ACTIVE,
    TMP_HTTPCONNECTIONSTATEVALUES_IDLE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for HttpRequestMethodValues enum definition
 *
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
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_HTTPREQUESTMETHODVALUES_CONNECT = 'CONNECT';
const TMP_HTTPREQUESTMETHODVALUES_DELETE = 'DELETE';
const TMP_HTTPREQUESTMETHODVALUES_GET = 'GET';
const TMP_HTTPREQUESTMETHODVALUES_HEAD = 'HEAD';
const TMP_HTTPREQUESTMETHODVALUES_OPTIONS = 'OPTIONS';
const TMP_HTTPREQUESTMETHODVALUES_PATCH = 'PATCH';
const TMP_HTTPREQUESTMETHODVALUES_POST = 'POST';
const TMP_HTTPREQUESTMETHODVALUES_PUT = 'PUT';
const TMP_HTTPREQUESTMETHODVALUES_TRACE = 'TRACE';
const TMP_HTTPREQUESTMETHODVALUES_OTHER = '_OTHER';

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
export const HTTPREQUESTMETHODVALUES_CONNECT =
  TMP_HTTPREQUESTMETHODVALUES_CONNECT;

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
export const HTTPREQUESTMETHODVALUES_DELETE =
  TMP_HTTPREQUESTMETHODVALUES_DELETE;

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
export const HTTPREQUESTMETHODVALUES_GET = TMP_HTTPREQUESTMETHODVALUES_GET;

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
export const HTTPREQUESTMETHODVALUES_HEAD = TMP_HTTPREQUESTMETHODVALUES_HEAD;

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
export const HTTPREQUESTMETHODVALUES_OPTIONS =
  TMP_HTTPREQUESTMETHODVALUES_OPTIONS;

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
export const HTTPREQUESTMETHODVALUES_PATCH = TMP_HTTPREQUESTMETHODVALUES_PATCH;

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
export const HTTPREQUESTMETHODVALUES_POST = TMP_HTTPREQUESTMETHODVALUES_POST;

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
export const HTTPREQUESTMETHODVALUES_PUT = TMP_HTTPREQUESTMETHODVALUES_PUT;

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
export const HTTPREQUESTMETHODVALUES_TRACE = TMP_HTTPREQUESTMETHODVALUES_TRACE;

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
export const HTTPREQUESTMETHODVALUES_OTHER = TMP_HTTPREQUESTMETHODVALUES_OTHER;

/**
 * Identifies the Values for HttpRequestMethodValues enum definition
 *
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
 * @deprecated Use the HTTPREQUESTMETHODVALUES_XXXXX constants rather than the HttpRequestMethodValues.XXXXX for bundle minification.
 */
export type HttpRequestMethodValues = {
  /** CONNECT method. */
  CONNECT: 'CONNECT';

  /** DELETE method. */
  DELETE: 'DELETE';

  /** GET method. */
  GET: 'GET';

  /** HEAD method. */
  HEAD: 'HEAD';

  /** OPTIONS method. */
  OPTIONS: 'OPTIONS';

  /** PATCH method. */
  PATCH: 'PATCH';

  /** POST method. */
  POST: 'POST';

  /** PUT method. */
  PUT: 'PUT';

  /** TRACE method. */
  TRACE: 'TRACE';

  /** Any HTTP method that the instrumentation has no prior knowledge of. */
  OTHER: '_OTHER';
};

/**
 * The constant map of values for HttpRequestMethodValues.
 * @deprecated Use the HTTPREQUESTMETHODVALUES_XXXXX constants rather than the HttpRequestMethodValues.XXXXX for bundle minification.
 */
export const HttpRequestMethodValues: HttpRequestMethodValues = {
  CONNECT: TMP_HTTPREQUESTMETHODVALUES_CONNECT,
  DELETE: TMP_HTTPREQUESTMETHODVALUES_DELETE,
  GET: TMP_HTTPREQUESTMETHODVALUES_GET,
  HEAD: TMP_HTTPREQUESTMETHODVALUES_HEAD,
  OPTIONS: TMP_HTTPREQUESTMETHODVALUES_OPTIONS,
  PATCH: TMP_HTTPREQUESTMETHODVALUES_PATCH,
  POST: TMP_HTTPREQUESTMETHODVALUES_POST,
  PUT: TMP_HTTPREQUESTMETHODVALUES_PUT,
  TRACE: TMP_HTTPREQUESTMETHODVALUES_TRACE,
  OTHER: TMP_HTTPREQUESTMETHODVALUES_OTHER,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingOperationValues enum definition
 *
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_MESSAGINGOPERATIONVALUES_PUBLISH = 'publish';
const TMP_MESSAGINGOPERATIONVALUES_CREATE = 'create';
const TMP_MESSAGINGOPERATIONVALUES_RECEIVE = 'receive';
const TMP_MESSAGINGOPERATIONVALUES_DELIVER = 'process';
const TMP_MESSAGINGOPERATIONVALUES_SETTLE = 'settle';

/**
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 */
export const MESSAGINGOPERATIONVALUES_PUBLISH =
  TMP_MESSAGINGOPERATIONVALUES_PUBLISH;

/**
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 */
export const MESSAGINGOPERATIONVALUES_CREATE =
  TMP_MESSAGINGOPERATIONVALUES_CREATE;

/**
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 */
export const MESSAGINGOPERATIONVALUES_RECEIVE =
  TMP_MESSAGINGOPERATIONVALUES_RECEIVE;

/**
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 */
export const MESSAGINGOPERATIONVALUES_DELIVER =
  TMP_MESSAGINGOPERATIONVALUES_DELIVER;

/**
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 */
export const MESSAGINGOPERATIONVALUES_SETTLE =
  TMP_MESSAGINGOPERATIONVALUES_SETTLE;

/**
 * Identifies the Values for MessagingOperationValues enum definition
 *
 * A string identifying the kind of messaging operation.
 *
 * Note: If a custom value is used, it MUST be of low cardinality.
 * @deprecated Use the MESSAGINGOPERATIONVALUES_XXXXX constants rather than the MessagingOperationValues.XXXXX for bundle minification.
 */
export type MessagingOperationValues = {
  /** One or more messages are provided for publishing to an intermediary. If a single message is published, the context of the &#34;Publish&#34; span can be used as the creation context and no &#34;Create&#34; span needs to be created. */
  PUBLISH: 'publish';

  /** A message is created. &#34;Create&#34; spans always refer to a single message and are used to provide a unique creation context for messages in batch publishing scenarios. */
  CREATE: 'create';

  /** One or more messages are requested by a consumer. This operation refers to pull-based scenarios, where consumers explicitly call methods of messaging SDKs to receive messages. */
  RECEIVE: 'receive';

  /** One or more messages are delivered to or processed by a consumer. */
  DELIVER: 'process';

  /** One or more messages are settled. */
  SETTLE: 'settle';
};

/**
 * The constant map of values for MessagingOperationValues.
 * @deprecated Use the MESSAGINGOPERATIONVALUES_XXXXX constants rather than the MessagingOperationValues.XXXXX for bundle minification.
 */
export const MessagingOperationValues: MessagingOperationValues = {
  PUBLISH: TMP_MESSAGINGOPERATIONVALUES_PUBLISH,
  CREATE: TMP_MESSAGINGOPERATIONVALUES_CREATE,
  RECEIVE: TMP_MESSAGINGOPERATIONVALUES_RECEIVE,
  DELIVER: TMP_MESSAGINGOPERATIONVALUES_DELIVER,
  SETTLE: TMP_MESSAGINGOPERATIONVALUES_SETTLE,
};

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingRocketmqConsumptionModelValues enum definition
 *
 * Model of message consumption. This only applies to consumer spans.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_CLUSTERING = 'clustering';
const TMP_MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_BROADCASTING = 'broadcasting';

/**
 * Model of message consumption. This only applies to consumer spans.
 */
export const MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_CLUSTERING =
  TMP_MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_CLUSTERING;

/**
 * Model of message consumption. This only applies to consumer spans.
 */
export const MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_BROADCASTING =
  TMP_MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_BROADCASTING;

/**
 * Identifies the Values for MessagingRocketmqConsumptionModelValues enum definition
 *
 * Model of message consumption. This only applies to consumer spans.
 * @deprecated Use the MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_XXXXX constants rather than the MessagingRocketmqConsumptionModelValues.XXXXX for bundle minification.
 */
export type MessagingRocketmqConsumptionModelValues = {
  /** Clustering consumption model. */
  CLUSTERING: 'clustering';

  /** Broadcasting consumption model. */
  BROADCASTING: 'broadcasting';
};

/**
 * The constant map of values for MessagingRocketmqConsumptionModelValues.
 * @deprecated Use the MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_XXXXX constants rather than the MessagingRocketmqConsumptionModelValues.XXXXX for bundle minification.
 */
export const MessagingRocketmqConsumptionModelValues: MessagingRocketmqConsumptionModelValues =
  /*#__PURE__*/ createConstMap<MessagingRocketmqConsumptionModelValues>([
    TMP_MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_CLUSTERING,
    TMP_MESSAGINGROCKETMQCONSUMPTIONMODELVALUES_BROADCASTING,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingRocketmqMessageTypeValues enum definition
 *
 * Type of message.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_NORMAL = 'normal';
const TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_FIFO = 'fifo';
const TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_DELAY = 'delay';
const TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_TRANSACTION = 'transaction';

/**
 * Type of message.
 */
export const MESSAGINGROCKETMQMESSAGETYPEVALUES_NORMAL =
  TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_NORMAL;

/**
 * Type of message.
 */
export const MESSAGINGROCKETMQMESSAGETYPEVALUES_FIFO =
  TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_FIFO;

/**
 * Type of message.
 */
export const MESSAGINGROCKETMQMESSAGETYPEVALUES_DELAY =
  TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_DELAY;

/**
 * Type of message.
 */
export const MESSAGINGROCKETMQMESSAGETYPEVALUES_TRANSACTION =
  TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_TRANSACTION;

/**
 * Identifies the Values for MessagingRocketmqMessageTypeValues enum definition
 *
 * Type of message.
 * @deprecated Use the MESSAGINGROCKETMQMESSAGETYPEVALUES_XXXXX constants rather than the MessagingRocketmqMessageTypeValues.XXXXX for bundle minification.
 */
export type MessagingRocketmqMessageTypeValues = {
  /** Normal message. */
  NORMAL: 'normal';

  /** FIFO message. */
  FIFO: 'fifo';

  /** Delay message. */
  DELAY: 'delay';

  /** Transaction message. */
  TRANSACTION: 'transaction';
};

/**
 * The constant map of values for MessagingRocketmqMessageTypeValues.
 * @deprecated Use the MESSAGINGROCKETMQMESSAGETYPEVALUES_XXXXX constants rather than the MessagingRocketmqMessageTypeValues.XXXXX for bundle minification.
 */
export const MessagingRocketmqMessageTypeValues: MessagingRocketmqMessageTypeValues =
  /*#__PURE__*/ createConstMap<MessagingRocketmqMessageTypeValues>([
    TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_NORMAL,
    TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_FIFO,
    TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_DELAY,
    TMP_MESSAGINGROCKETMQMESSAGETYPEVALUES_TRANSACTION,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingServicebusDispositionStatusValues enum definition
 *
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_COMPLETE = 'complete';
const TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_ABANDON = 'abandon';
const TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_DEAD_LETTER =
  'dead_letter';
const TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_DEFER = 'defer';

/**
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 */
export const MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_COMPLETE =
  TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_COMPLETE;

/**
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 */
export const MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_ABANDON =
  TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_ABANDON;

/**
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 */
export const MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_DEAD_LETTER =
  TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_DEAD_LETTER;

/**
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 */
export const MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_DEFER =
  TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_DEFER;

/**
 * Identifies the Values for MessagingServicebusDispositionStatusValues enum definition
 *
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 * @deprecated Use the MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_XXXXX constants rather than the MessagingServicebusDispositionStatusValues.XXXXX for bundle minification.
 */
export type MessagingServicebusDispositionStatusValues = {
  /** Message is completed. */
  COMPLETE: 'complete';

  /** Message is abandoned. */
  ABANDON: 'abandon';

  /** Message is sent to dead letter queue. */
  DEAD_LETTER: 'dead_letter';

  /** Message is deferred. */
  DEFER: 'defer';
};

/**
 * The constant map of values for MessagingServicebusDispositionStatusValues.
 * @deprecated Use the MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_XXXXX constants rather than the MessagingServicebusDispositionStatusValues.XXXXX for bundle minification.
 */
export const MessagingServicebusDispositionStatusValues: MessagingServicebusDispositionStatusValues =
  /*#__PURE__*/ createConstMap<MessagingServicebusDispositionStatusValues>([
    TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_COMPLETE,
    TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_ABANDON,
    TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_DEAD_LETTER,
    TMP_MESSAGINGSERVICEBUSDISPOSITIONSTATUSVALUES_DEFER,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessagingSystemValues enum definition
 *
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_MESSAGINGSYSTEMVALUES_ACTIVEMQ = 'activemq';
const TMP_MESSAGINGSYSTEMVALUES_AWS_SQS = 'aws_sqs';
const TMP_MESSAGINGSYSTEMVALUES_EVENTGRID = 'eventgrid';
const TMP_MESSAGINGSYSTEMVALUES_EVENTHUBS = 'eventhubs';
const TMP_MESSAGINGSYSTEMVALUES_SERVICEBUS = 'servicebus';
const TMP_MESSAGINGSYSTEMVALUES_GCP_PUBSUB = 'gcp_pubsub';
const TMP_MESSAGINGSYSTEMVALUES_JMS = 'jms';
const TMP_MESSAGINGSYSTEMVALUES_KAFKA = 'kafka';
const TMP_MESSAGINGSYSTEMVALUES_RABBITMQ = 'rabbitmq';
const TMP_MESSAGINGSYSTEMVALUES_ROCKETMQ = 'rocketmq';

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_ACTIVEMQ =
  TMP_MESSAGINGSYSTEMVALUES_ACTIVEMQ;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_AWS_SQS = TMP_MESSAGINGSYSTEMVALUES_AWS_SQS;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_EVENTGRID =
  TMP_MESSAGINGSYSTEMVALUES_EVENTGRID;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_EVENTHUBS =
  TMP_MESSAGINGSYSTEMVALUES_EVENTHUBS;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_SERVICEBUS =
  TMP_MESSAGINGSYSTEMVALUES_SERVICEBUS;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_GCP_PUBSUB =
  TMP_MESSAGINGSYSTEMVALUES_GCP_PUBSUB;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_JMS = TMP_MESSAGINGSYSTEMVALUES_JMS;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_KAFKA = TMP_MESSAGINGSYSTEMVALUES_KAFKA;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_RABBITMQ =
  TMP_MESSAGINGSYSTEMVALUES_RABBITMQ;

/**
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 */
export const MESSAGINGSYSTEMVALUES_ROCKETMQ =
  TMP_MESSAGINGSYSTEMVALUES_ROCKETMQ;

/**
 * Identifies the Values for MessagingSystemValues enum definition
 *
 * An identifier for the messaging system being used. See below for a list of well-known identifiers.
 * @deprecated Use the MESSAGINGSYSTEMVALUES_XXXXX constants rather than the MessagingSystemValues.XXXXX for bundle minification.
 */
export type MessagingSystemValues = {
  /** Apache ActiveMQ. */
  ACTIVEMQ: 'activemq';

  /** Amazon Simple Queue Service (SQS). */
  AWS_SQS: 'aws_sqs';

  /** Azure Event Grid. */
  EVENTGRID: 'eventgrid';

  /** Azure Event Hubs. */
  EVENTHUBS: 'eventhubs';

  /** Azure Service Bus. */
  SERVICEBUS: 'servicebus';

  /** Google Cloud Pub/Sub. */
  GCP_PUBSUB: 'gcp_pubsub';

  /** Java Message Service. */
  JMS: 'jms';

  /** Apache Kafka. */
  KAFKA: 'kafka';

  /** RabbitMQ. */
  RABBITMQ: 'rabbitmq';

  /** Apache RocketMQ. */
  ROCKETMQ: 'rocketmq';
};

/**
 * The constant map of values for MessagingSystemValues.
 * @deprecated Use the MESSAGINGSYSTEMVALUES_XXXXX constants rather than the MessagingSystemValues.XXXXX for bundle minification.
 */
export const MessagingSystemValues: MessagingSystemValues =
  /*#__PURE__*/ createConstMap<MessagingSystemValues>([
    TMP_MESSAGINGSYSTEMVALUES_ACTIVEMQ,
    TMP_MESSAGINGSYSTEMVALUES_AWS_SQS,
    TMP_MESSAGINGSYSTEMVALUES_EVENTGRID,
    TMP_MESSAGINGSYSTEMVALUES_EVENTHUBS,
    TMP_MESSAGINGSYSTEMVALUES_SERVICEBUS,
    TMP_MESSAGINGSYSTEMVALUES_GCP_PUBSUB,
    TMP_MESSAGINGSYSTEMVALUES_JMS,
    TMP_MESSAGINGSYSTEMVALUES_KAFKA,
    TMP_MESSAGINGSYSTEMVALUES_RABBITMQ,
    TMP_MESSAGINGSYSTEMVALUES_ROCKETMQ,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetworkConnectionSubtypeValues enum definition
 *
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_GPRS = 'gprs';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_EDGE = 'edge';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_UMTS = 'umts';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_CDMA = 'cdma';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_0 = 'evdo_0';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_A = 'evdo_a';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = 'cdma2000_1xrtt';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSDPA = 'hsdpa';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSUPA = 'hsupa';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSPA = 'hspa';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_IDEN = 'iden';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_B = 'evdo_b';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_LTE = 'lte';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_EHRPD = 'ehrpd';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSPAP = 'hspap';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_GSM = 'gsm';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_TD_SCDMA = 'td_scdma';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_IWLAN = 'iwlan';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_NR = 'nr';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_NRNSA = 'nrnsa';
const TMP_NETWORKCONNECTIONSUBTYPEVALUES_LTE_CA = 'lte_ca';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_GPRS =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_GPRS;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_EDGE =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_EDGE;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_UMTS =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_UMTS;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_CDMA =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_CDMA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_EVDO_0 =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_0;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_EVDO_A =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_A;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_HSDPA =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSDPA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_HSUPA =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSUPA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_HSPA =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSPA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_IDEN =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_IDEN;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_EVDO_B =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_B;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_LTE =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_LTE;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_EHRPD =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_EHRPD;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_HSPAP =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSPAP;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_GSM =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_GSM;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_TD_SCDMA =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_TD_SCDMA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_IWLAN =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_IWLAN;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_NR =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_NR;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_NRNSA =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_NRNSA;

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 */
export const NETWORKCONNECTIONSUBTYPEVALUES_LTE_CA =
  TMP_NETWORKCONNECTIONSUBTYPEVALUES_LTE_CA;

/**
 * Identifies the Values for NetworkConnectionSubtypeValues enum definition
 *
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 * @deprecated Use the NETWORKCONNECTIONSUBTYPEVALUES_XXXXX constants rather than the NetworkConnectionSubtypeValues.XXXXX for bundle minification.
 */
export type NetworkConnectionSubtypeValues = {
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
 * The constant map of values for NetworkConnectionSubtypeValues.
 * @deprecated Use the NETWORKCONNECTIONSUBTYPEVALUES_XXXXX constants rather than the NetworkConnectionSubtypeValues.XXXXX for bundle minification.
 */
export const NetworkConnectionSubtypeValues: NetworkConnectionSubtypeValues =
  /*#__PURE__*/ createConstMap<NetworkConnectionSubtypeValues>([
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_GPRS,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_EDGE,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_UMTS,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_CDMA,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_0,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_A,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSDPA,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSUPA,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSPA,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_IDEN,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_EVDO_B,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_LTE,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_EHRPD,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_HSPAP,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_GSM,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_TD_SCDMA,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_IWLAN,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_NR,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_NRNSA,
    TMP_NETWORKCONNECTIONSUBTYPEVALUES_LTE_CA,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetworkConnectionTypeValues enum definition
 *
 * The internet connection type.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_NETWORKCONNECTIONTYPEVALUES_WIFI = 'wifi';
const TMP_NETWORKCONNECTIONTYPEVALUES_WIRED = 'wired';
const TMP_NETWORKCONNECTIONTYPEVALUES_CELL = 'cell';
const TMP_NETWORKCONNECTIONTYPEVALUES_UNAVAILABLE = 'unavailable';
const TMP_NETWORKCONNECTIONTYPEVALUES_UNKNOWN = 'unknown';

/**
 * The internet connection type.
 */
export const NETWORKCONNECTIONTYPEVALUES_WIFI =
  TMP_NETWORKCONNECTIONTYPEVALUES_WIFI;

/**
 * The internet connection type.
 */
export const NETWORKCONNECTIONTYPEVALUES_WIRED =
  TMP_NETWORKCONNECTIONTYPEVALUES_WIRED;

/**
 * The internet connection type.
 */
export const NETWORKCONNECTIONTYPEVALUES_CELL =
  TMP_NETWORKCONNECTIONTYPEVALUES_CELL;

/**
 * The internet connection type.
 */
export const NETWORKCONNECTIONTYPEVALUES_UNAVAILABLE =
  TMP_NETWORKCONNECTIONTYPEVALUES_UNAVAILABLE;

/**
 * The internet connection type.
 */
export const NETWORKCONNECTIONTYPEVALUES_UNKNOWN =
  TMP_NETWORKCONNECTIONTYPEVALUES_UNKNOWN;

/**
 * Identifies the Values for NetworkConnectionTypeValues enum definition
 *
 * The internet connection type.
 * @deprecated Use the NETWORKCONNECTIONTYPEVALUES_XXXXX constants rather than the NetworkConnectionTypeValues.XXXXX for bundle minification.
 */
export type NetworkConnectionTypeValues = {
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
 * The constant map of values for NetworkConnectionTypeValues.
 * @deprecated Use the NETWORKCONNECTIONTYPEVALUES_XXXXX constants rather than the NetworkConnectionTypeValues.XXXXX for bundle minification.
 */
export const NetworkConnectionTypeValues: NetworkConnectionTypeValues =
  /*#__PURE__*/ createConstMap<NetworkConnectionTypeValues>([
    TMP_NETWORKCONNECTIONTYPEVALUES_WIFI,
    TMP_NETWORKCONNECTIONTYPEVALUES_WIRED,
    TMP_NETWORKCONNECTIONTYPEVALUES_CELL,
    TMP_NETWORKCONNECTIONTYPEVALUES_UNAVAILABLE,
    TMP_NETWORKCONNECTIONTYPEVALUES_UNKNOWN,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetworkIoDirectionValues enum definition
 *
 * The network IO operation direction.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_NETWORKIODIRECTIONVALUES_TRANSMIT = 'transmit';
const TMP_NETWORKIODIRECTIONVALUES_RECEIVE = 'receive';

/**
 * The network IO operation direction.
 */
export const NETWORKIODIRECTIONVALUES_TRANSMIT =
  TMP_NETWORKIODIRECTIONVALUES_TRANSMIT;

/**
 * The network IO operation direction.
 */
export const NETWORKIODIRECTIONVALUES_RECEIVE =
  TMP_NETWORKIODIRECTIONVALUES_RECEIVE;

/**
 * Identifies the Values for NetworkIoDirectionValues enum definition
 *
 * The network IO operation direction.
 * @deprecated Use the NETWORKIODIRECTIONVALUES_XXXXX constants rather than the NetworkIoDirectionValues.XXXXX for bundle minification.
 */
export type NetworkIoDirectionValues = {
  /** transmit. */
  TRANSMIT: 'transmit';

  /** receive. */
  RECEIVE: 'receive';
};

/**
 * The constant map of values for NetworkIoDirectionValues.
 * @deprecated Use the NETWORKIODIRECTIONVALUES_XXXXX constants rather than the NetworkIoDirectionValues.XXXXX for bundle minification.
 */
export const NetworkIoDirectionValues: NetworkIoDirectionValues =
  /*#__PURE__*/ createConstMap<NetworkIoDirectionValues>([
    TMP_NETWORKIODIRECTIONVALUES_TRANSMIT,
    TMP_NETWORKIODIRECTIONVALUES_RECEIVE,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetworkTransportValues enum definition
 *
 * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
 *
 * Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_NETWORKTRANSPORTVALUES_TCP = 'tcp';
const TMP_NETWORKTRANSPORTVALUES_UDP = 'udp';
const TMP_NETWORKTRANSPORTVALUES_PIPE = 'pipe';
const TMP_NETWORKTRANSPORTVALUES_UNIX = 'unix';

/**
 * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
 *
 * Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
 */
export const NETWORKTRANSPORTVALUES_TCP = TMP_NETWORKTRANSPORTVALUES_TCP;

/**
 * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
 *
 * Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
 */
export const NETWORKTRANSPORTVALUES_UDP = TMP_NETWORKTRANSPORTVALUES_UDP;

/**
 * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
 *
 * Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
 */
export const NETWORKTRANSPORTVALUES_PIPE = TMP_NETWORKTRANSPORTVALUES_PIPE;

/**
 * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
 *
 * Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
 */
export const NETWORKTRANSPORTVALUES_UNIX = TMP_NETWORKTRANSPORTVALUES_UNIX;

/**
 * Identifies the Values for NetworkTransportValues enum definition
 *
 * [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
 *
 * Note: The value SHOULD be normalized to lowercase.

Consider always setting the transport when setting a port number, since
a port number is ambiguous without knowing the transport. For example
different processes could be listening on TCP port 12345 and UDP port 12345.
 * @deprecated Use the NETWORKTRANSPORTVALUES_XXXXX constants rather than the NetworkTransportValues.XXXXX for bundle minification.
 */
export type NetworkTransportValues = {
  /** TCP. */
  TCP: 'tcp';

  /** UDP. */
  UDP: 'udp';

  /** Named or anonymous pipe. */
  PIPE: 'pipe';

  /** Unix domain socket. */
  UNIX: 'unix';
};

/**
 * The constant map of values for NetworkTransportValues.
 * @deprecated Use the NETWORKTRANSPORTVALUES_XXXXX constants rather than the NetworkTransportValues.XXXXX for bundle minification.
 */
export const NetworkTransportValues: NetworkTransportValues =
  /*#__PURE__*/ createConstMap<NetworkTransportValues>([
    TMP_NETWORKTRANSPORTVALUES_TCP,
    TMP_NETWORKTRANSPORTVALUES_UDP,
    TMP_NETWORKTRANSPORTVALUES_PIPE,
    TMP_NETWORKTRANSPORTVALUES_UNIX,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for NetworkTypeValues enum definition
 *
 * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
 *
 * Note: The value SHOULD be normalized to lowercase.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_NETWORKTYPEVALUES_IPV4 = 'ipv4';
const TMP_NETWORKTYPEVALUES_IPV6 = 'ipv6';

/**
 * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
 *
 * Note: The value SHOULD be normalized to lowercase.
 */
export const NETWORKTYPEVALUES_IPV4 = TMP_NETWORKTYPEVALUES_IPV4;

/**
 * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
 *
 * Note: The value SHOULD be normalized to lowercase.
 */
export const NETWORKTYPEVALUES_IPV6 = TMP_NETWORKTYPEVALUES_IPV6;

/**
 * Identifies the Values for NetworkTypeValues enum definition
 *
 * [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
 *
 * Note: The value SHOULD be normalized to lowercase.
 * @deprecated Use the NETWORKTYPEVALUES_XXXXX constants rather than the NetworkTypeValues.XXXXX for bundle minification.
 */
export type NetworkTypeValues = {
  /** IPv4. */
  IPV4: 'ipv4';

  /** IPv6. */
  IPV6: 'ipv6';
};

/**
 * The constant map of values for NetworkTypeValues.
 * @deprecated Use the NETWORKTYPEVALUES_XXXXX constants rather than the NetworkTypeValues.XXXXX for bundle minification.
 */
export const NetworkTypeValues: NetworkTypeValues =
  /*#__PURE__*/ createConstMap<NetworkTypeValues>([
    TMP_NETWORKTYPEVALUES_IPV4,
    TMP_NETWORKTYPEVALUES_IPV6,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for OsTypeValues enum definition
 *
 * The operating system type.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_OSTYPEVALUES_WINDOWS = 'windows';
const TMP_OSTYPEVALUES_LINUX = 'linux';
const TMP_OSTYPEVALUES_DARWIN = 'darwin';
const TMP_OSTYPEVALUES_FREEBSD = 'freebsd';
const TMP_OSTYPEVALUES_NETBSD = 'netbsd';
const TMP_OSTYPEVALUES_OPENBSD = 'openbsd';
const TMP_OSTYPEVALUES_DRAGONFLYBSD = 'dragonflybsd';
const TMP_OSTYPEVALUES_HPUX = 'hpux';
const TMP_OSTYPEVALUES_AIX = 'aix';
const TMP_OSTYPEVALUES_SOLARIS = 'solaris';
const TMP_OSTYPEVALUES_Z_OS = 'z_os';

/**
 * The operating system type.
 */
export const OSTYPEVALUES_WINDOWS = TMP_OSTYPEVALUES_WINDOWS;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_LINUX = TMP_OSTYPEVALUES_LINUX;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_DARWIN = TMP_OSTYPEVALUES_DARWIN;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_FREEBSD = TMP_OSTYPEVALUES_FREEBSD;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_NETBSD = TMP_OSTYPEVALUES_NETBSD;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_OPENBSD = TMP_OSTYPEVALUES_OPENBSD;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_DRAGONFLYBSD = TMP_OSTYPEVALUES_DRAGONFLYBSD;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_HPUX = TMP_OSTYPEVALUES_HPUX;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_AIX = TMP_OSTYPEVALUES_AIX;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_SOLARIS = TMP_OSTYPEVALUES_SOLARIS;

/**
 * The operating system type.
 */
export const OSTYPEVALUES_Z_OS = TMP_OSTYPEVALUES_Z_OS;

/**
 * Identifies the Values for OsTypeValues enum definition
 *
 * The operating system type.
 * @deprecated Use the OSTYPEVALUES_XXXXX constants rather than the OsTypeValues.XXXXX for bundle minification.
 */
export type OsTypeValues = {
  /** Microsoft Windows. */
  WINDOWS: 'windows';

  /** Linux. */
  LINUX: 'linux';

  /** Apple Darwin. */
  DARWIN: 'darwin';

  /** FreeBSD. */
  FREEBSD: 'freebsd';

  /** NetBSD. */
  NETBSD: 'netbsd';

  /** OpenBSD. */
  OPENBSD: 'openbsd';

  /** DragonFly BSD. */
  DRAGONFLYBSD: 'dragonflybsd';

  /** HP-UX (Hewlett Packard Unix). */
  HPUX: 'hpux';

  /** AIX (Advanced Interactive eXecutive). */
  AIX: 'aix';

  /** SunOS, Oracle Solaris. */
  SOLARIS: 'solaris';

  /** IBM z/OS. */
  Z_OS: 'z_os';
};

/**
 * The constant map of values for OsTypeValues.
 * @deprecated Use the OSTYPEVALUES_XXXXX constants rather than the OsTypeValues.XXXXX for bundle minification.
 */
export const OsTypeValues: OsTypeValues =
  /*#__PURE__*/ createConstMap<OsTypeValues>([
    TMP_OSTYPEVALUES_WINDOWS,
    TMP_OSTYPEVALUES_LINUX,
    TMP_OSTYPEVALUES_DARWIN,
    TMP_OSTYPEVALUES_FREEBSD,
    TMP_OSTYPEVALUES_NETBSD,
    TMP_OSTYPEVALUES_OPENBSD,
    TMP_OSTYPEVALUES_DRAGONFLYBSD,
    TMP_OSTYPEVALUES_HPUX,
    TMP_OSTYPEVALUES_AIX,
    TMP_OSTYPEVALUES_SOLARIS,
    TMP_OSTYPEVALUES_Z_OS,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for RpcConnectRpcErrorCodeValues enum definition
 *
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_RPCCONNECTRPCERRORCODEVALUES_CANCELLED = 'cancelled';
const TMP_RPCCONNECTRPCERRORCODEVALUES_UNKNOWN = 'unknown';
const TMP_RPCCONNECTRPCERRORCODEVALUES_INVALID_ARGUMENT = 'invalid_argument';
const TMP_RPCCONNECTRPCERRORCODEVALUES_DEADLINE_EXCEEDED = 'deadline_exceeded';
const TMP_RPCCONNECTRPCERRORCODEVALUES_NOT_FOUND = 'not_found';
const TMP_RPCCONNECTRPCERRORCODEVALUES_ALREADY_EXISTS = 'already_exists';
const TMP_RPCCONNECTRPCERRORCODEVALUES_PERMISSION_DENIED = 'permission_denied';
const TMP_RPCCONNECTRPCERRORCODEVALUES_RESOURCE_EXHAUSTED =
  'resource_exhausted';
const TMP_RPCCONNECTRPCERRORCODEVALUES_FAILED_PRECONDITION =
  'failed_precondition';
const TMP_RPCCONNECTRPCERRORCODEVALUES_ABORTED = 'aborted';
const TMP_RPCCONNECTRPCERRORCODEVALUES_OUT_OF_RANGE = 'out_of_range';
const TMP_RPCCONNECTRPCERRORCODEVALUES_UNIMPLEMENTED = 'unimplemented';
const TMP_RPCCONNECTRPCERRORCODEVALUES_INTERNAL = 'internal';
const TMP_RPCCONNECTRPCERRORCODEVALUES_UNAVAILABLE = 'unavailable';
const TMP_RPCCONNECTRPCERRORCODEVALUES_DATA_LOSS = 'data_loss';
const TMP_RPCCONNECTRPCERRORCODEVALUES_UNAUTHENTICATED = 'unauthenticated';

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_CANCELLED =
  TMP_RPCCONNECTRPCERRORCODEVALUES_CANCELLED;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_UNKNOWN =
  TMP_RPCCONNECTRPCERRORCODEVALUES_UNKNOWN;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_INVALID_ARGUMENT =
  TMP_RPCCONNECTRPCERRORCODEVALUES_INVALID_ARGUMENT;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_DEADLINE_EXCEEDED =
  TMP_RPCCONNECTRPCERRORCODEVALUES_DEADLINE_EXCEEDED;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_NOT_FOUND =
  TMP_RPCCONNECTRPCERRORCODEVALUES_NOT_FOUND;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_ALREADY_EXISTS =
  TMP_RPCCONNECTRPCERRORCODEVALUES_ALREADY_EXISTS;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_PERMISSION_DENIED =
  TMP_RPCCONNECTRPCERRORCODEVALUES_PERMISSION_DENIED;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_RESOURCE_EXHAUSTED =
  TMP_RPCCONNECTRPCERRORCODEVALUES_RESOURCE_EXHAUSTED;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_FAILED_PRECONDITION =
  TMP_RPCCONNECTRPCERRORCODEVALUES_FAILED_PRECONDITION;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_ABORTED =
  TMP_RPCCONNECTRPCERRORCODEVALUES_ABORTED;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_OUT_OF_RANGE =
  TMP_RPCCONNECTRPCERRORCODEVALUES_OUT_OF_RANGE;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_UNIMPLEMENTED =
  TMP_RPCCONNECTRPCERRORCODEVALUES_UNIMPLEMENTED;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_INTERNAL =
  TMP_RPCCONNECTRPCERRORCODEVALUES_INTERNAL;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_UNAVAILABLE =
  TMP_RPCCONNECTRPCERRORCODEVALUES_UNAVAILABLE;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_DATA_LOSS =
  TMP_RPCCONNECTRPCERRORCODEVALUES_DATA_LOSS;

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 */
export const RPCCONNECTRPCERRORCODEVALUES_UNAUTHENTICATED =
  TMP_RPCCONNECTRPCERRORCODEVALUES_UNAUTHENTICATED;

/**
 * Identifies the Values for RpcConnectRpcErrorCodeValues enum definition
 *
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 * @deprecated Use the RPCCONNECTRPCERRORCODEVALUES_XXXXX constants rather than the RpcConnectRpcErrorCodeValues.XXXXX for bundle minification.
 */
export type RpcConnectRpcErrorCodeValues = {
  /** cancelled. */
  CANCELLED: 'cancelled';

  /** unknown. */
  UNKNOWN: 'unknown';

  /** invalid_argument. */
  INVALID_ARGUMENT: 'invalid_argument';

  /** deadline_exceeded. */
  DEADLINE_EXCEEDED: 'deadline_exceeded';

  /** not_found. */
  NOT_FOUND: 'not_found';

  /** already_exists. */
  ALREADY_EXISTS: 'already_exists';

  /** permission_denied. */
  PERMISSION_DENIED: 'permission_denied';

  /** resource_exhausted. */
  RESOURCE_EXHAUSTED: 'resource_exhausted';

  /** failed_precondition. */
  FAILED_PRECONDITION: 'failed_precondition';

  /** aborted. */
  ABORTED: 'aborted';

  /** out_of_range. */
  OUT_OF_RANGE: 'out_of_range';

  /** unimplemented. */
  UNIMPLEMENTED: 'unimplemented';

  /** internal. */
  INTERNAL: 'internal';

  /** unavailable. */
  UNAVAILABLE: 'unavailable';

  /** data_loss. */
  DATA_LOSS: 'data_loss';

  /** unauthenticated. */
  UNAUTHENTICATED: 'unauthenticated';
};

/**
 * The constant map of values for RpcConnectRpcErrorCodeValues.
 * @deprecated Use the RPCCONNECTRPCERRORCODEVALUES_XXXXX constants rather than the RpcConnectRpcErrorCodeValues.XXXXX for bundle minification.
 */
export const RpcConnectRpcErrorCodeValues: RpcConnectRpcErrorCodeValues =
  /*#__PURE__*/ createConstMap<RpcConnectRpcErrorCodeValues>([
    TMP_RPCCONNECTRPCERRORCODEVALUES_CANCELLED,
    TMP_RPCCONNECTRPCERRORCODEVALUES_UNKNOWN,
    TMP_RPCCONNECTRPCERRORCODEVALUES_INVALID_ARGUMENT,
    TMP_RPCCONNECTRPCERRORCODEVALUES_DEADLINE_EXCEEDED,
    TMP_RPCCONNECTRPCERRORCODEVALUES_NOT_FOUND,
    TMP_RPCCONNECTRPCERRORCODEVALUES_ALREADY_EXISTS,
    TMP_RPCCONNECTRPCERRORCODEVALUES_PERMISSION_DENIED,
    TMP_RPCCONNECTRPCERRORCODEVALUES_RESOURCE_EXHAUSTED,
    TMP_RPCCONNECTRPCERRORCODEVALUES_FAILED_PRECONDITION,
    TMP_RPCCONNECTRPCERRORCODEVALUES_ABORTED,
    TMP_RPCCONNECTRPCERRORCODEVALUES_OUT_OF_RANGE,
    TMP_RPCCONNECTRPCERRORCODEVALUES_UNIMPLEMENTED,
    TMP_RPCCONNECTRPCERRORCODEVALUES_INTERNAL,
    TMP_RPCCONNECTRPCERRORCODEVALUES_UNAVAILABLE,
    TMP_RPCCONNECTRPCERRORCODEVALUES_DATA_LOSS,
    TMP_RPCCONNECTRPCERRORCODEVALUES_UNAUTHENTICATED,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for RpcGrpcStatusCodeValues enum definition
 *
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
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
 * Constant values for RpcSystemValues enum definition
 *
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_RPCSYSTEMVALUES_GRPC = 'grpc';
const TMP_RPCSYSTEMVALUES_JAVA_RMI = 'java_rmi';
const TMP_RPCSYSTEMVALUES_DOTNET_WCF = 'dotnet_wcf';
const TMP_RPCSYSTEMVALUES_APACHE_DUBBO = 'apache_dubbo';
const TMP_RPCSYSTEMVALUES_CONNECT_RPC = 'connect_rpc';

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 */
export const RPCSYSTEMVALUES_GRPC = TMP_RPCSYSTEMVALUES_GRPC;

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 */
export const RPCSYSTEMVALUES_JAVA_RMI = TMP_RPCSYSTEMVALUES_JAVA_RMI;

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 */
export const RPCSYSTEMVALUES_DOTNET_WCF = TMP_RPCSYSTEMVALUES_DOTNET_WCF;

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 */
export const RPCSYSTEMVALUES_APACHE_DUBBO = TMP_RPCSYSTEMVALUES_APACHE_DUBBO;

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 */
export const RPCSYSTEMVALUES_CONNECT_RPC = TMP_RPCSYSTEMVALUES_CONNECT_RPC;

/**
 * Identifies the Values for RpcSystemValues enum definition
 *
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 * @deprecated Use the RPCSYSTEMVALUES_XXXXX constants rather than the RpcSystemValues.XXXXX for bundle minification.
 */
export type RpcSystemValues = {
  /** gRPC. */
  GRPC: 'grpc';

  /** Java RMI. */
  JAVA_RMI: 'java_rmi';

  /** .NET WCF. */
  DOTNET_WCF: 'dotnet_wcf';

  /** Apache Dubbo. */
  APACHE_DUBBO: 'apache_dubbo';

  /** Connect RPC. */
  CONNECT_RPC: 'connect_rpc';
};

/**
 * The constant map of values for RpcSystemValues.
 * @deprecated Use the RPCSYSTEMVALUES_XXXXX constants rather than the RpcSystemValues.XXXXX for bundle minification.
 */
export const RpcSystemValues: RpcSystemValues =
  /*#__PURE__*/ createConstMap<RpcSystemValues>([
    TMP_RPCSYSTEMVALUES_GRPC,
    TMP_RPCSYSTEMVALUES_JAVA_RMI,
    TMP_RPCSYSTEMVALUES_DOTNET_WCF,
    TMP_RPCSYSTEMVALUES_APACHE_DUBBO,
    TMP_RPCSYSTEMVALUES_CONNECT_RPC,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for TelemetrySdkLanguageValues enum definition
 *
 * The language of the telemetry SDK.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_TELEMETRYSDKLANGUAGEVALUES_CPP = 'cpp';
const TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET = 'dotnet';
const TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG = 'erlang';
const TMP_TELEMETRYSDKLANGUAGEVALUES_GO = 'go';
const TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA = 'java';
const TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS = 'nodejs';
const TMP_TELEMETRYSDKLANGUAGEVALUES_PHP = 'php';
const TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON = 'python';
const TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY = 'ruby';
const TMP_TELEMETRYSDKLANGUAGEVALUES_RUST = 'rust';
const TMP_TELEMETRYSDKLANGUAGEVALUES_SWIFT = 'swift';
const TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS = 'webjs';

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_CPP =
  TMP_TELEMETRYSDKLANGUAGEVALUES_CPP;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_DOTNET =
  TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_ERLANG =
  TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_GO = TMP_TELEMETRYSDKLANGUAGEVALUES_GO;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_JAVA =
  TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_NODEJS =
  TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_PHP =
  TMP_TELEMETRYSDKLANGUAGEVALUES_PHP;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_PYTHON =
  TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_RUBY =
  TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_RUST =
  TMP_TELEMETRYSDKLANGUAGEVALUES_RUST;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_SWIFT =
  TMP_TELEMETRYSDKLANGUAGEVALUES_SWIFT;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_WEBJS =
  TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS;

/**
 * Identifies the Values for TelemetrySdkLanguageValues enum definition
 *
 * The language of the telemetry SDK.
 * @deprecated Use the TELEMETRYSDKLANGUAGEVALUES_XXXXX constants rather than the TelemetrySdkLanguageValues.XXXXX for bundle minification.
 */
export type TelemetrySdkLanguageValues = {
  /** cpp. */
  CPP: 'cpp';

  /** dotnet. */
  DOTNET: 'dotnet';

  /** erlang. */
  ERLANG: 'erlang';

  /** go. */
  GO: 'go';

  /** java. */
  JAVA: 'java';

  /** nodejs. */
  NODEJS: 'nodejs';

  /** php. */
  PHP: 'php';

  /** python. */
  PYTHON: 'python';

  /** ruby. */
  RUBY: 'ruby';

  /** rust. */
  RUST: 'rust';

  /** swift. */
  SWIFT: 'swift';

  /** webjs. */
  WEBJS: 'webjs';
};

/**
 * The constant map of values for TelemetrySdkLanguageValues.
 * @deprecated Use the TELEMETRYSDKLANGUAGEVALUES_XXXXX constants rather than the TelemetrySdkLanguageValues.XXXXX for bundle minification.
 */
export const TelemetrySdkLanguageValues: TelemetrySdkLanguageValues =
  /*#__PURE__*/ createConstMap<TelemetrySdkLanguageValues>([
    TMP_TELEMETRYSDKLANGUAGEVALUES_CPP,
    TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET,
    TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG,
    TMP_TELEMETRYSDKLANGUAGEVALUES_GO,
    TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA,
    TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS,
    TMP_TELEMETRYSDKLANGUAGEVALUES_PHP,
    TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON,
    TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY,
    TMP_TELEMETRYSDKLANGUAGEVALUES_RUST,
    TMP_TELEMETRYSDKLANGUAGEVALUES_SWIFT,
    TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for TlsProtocolNameValues enum definition
 *
 * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_TLSPROTOCOLNAMEVALUES_SSL = 'ssl';
const TMP_TLSPROTOCOLNAMEVALUES_TLS = 'tls';

/**
 * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 */
export const TLSPROTOCOLNAMEVALUES_SSL = TMP_TLSPROTOCOLNAMEVALUES_SSL;

/**
 * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 */
export const TLSPROTOCOLNAMEVALUES_TLS = TMP_TLSPROTOCOLNAMEVALUES_TLS;

/**
 * Identifies the Values for TlsProtocolNameValues enum definition
 *
 * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES).
 * @deprecated Use the TLSPROTOCOLNAMEVALUES_XXXXX constants rather than the TlsProtocolNameValues.XXXXX for bundle minification.
 */
export type TlsProtocolNameValues = {
  /** ssl. */
  SSL: 'ssl';

  /** tls. */
  TLS: 'tls';
};

/**
 * The constant map of values for TlsProtocolNameValues.
 * @deprecated Use the TLSPROTOCOLNAMEVALUES_XXXXX constants rather than the TlsProtocolNameValues.XXXXX for bundle minification.
 */
export const TlsProtocolNameValues: TlsProtocolNameValues =
  /*#__PURE__*/ createConstMap<TlsProtocolNameValues>([
    TMP_TLSPROTOCOLNAMEVALUES_SSL,
    TMP_TLSPROTOCOLNAMEVALUES_TLS,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for OpentracingRefTypeValues enum definition
 *
 * Parent-child Reference type.
 *
 * Note: The causal relationship between a child Span and a parent Span.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_OPENTRACINGREFTYPEVALUES_CHILD_OF = 'child_of';
const TMP_OPENTRACINGREFTYPEVALUES_FOLLOWS_FROM = 'follows_from';

/**
 * Parent-child Reference type.
 *
 * Note: The causal relationship between a child Span and a parent Span.
 */
export const OPENTRACINGREFTYPEVALUES_CHILD_OF =
  TMP_OPENTRACINGREFTYPEVALUES_CHILD_OF;

/**
 * Parent-child Reference type.
 *
 * Note: The causal relationship between a child Span and a parent Span.
 */
export const OPENTRACINGREFTYPEVALUES_FOLLOWS_FROM =
  TMP_OPENTRACINGREFTYPEVALUES_FOLLOWS_FROM;

/**
 * Identifies the Values for OpentracingRefTypeValues enum definition
 *
 * Parent-child Reference type.
 *
 * Note: The causal relationship between a child Span and a parent Span.
 * @deprecated Use the OPENTRACINGREFTYPEVALUES_XXXXX constants rather than the OpentracingRefTypeValues.XXXXX for bundle minification.
 */
export type OpentracingRefTypeValues = {
  /** The parent Span depends on the child Span in some capacity. */
  CHILD_OF: 'child_of';

  /** The parent Span doesn&#39;t depend in any way on the result of the child Span. */
  FOLLOWS_FROM: 'follows_from';
};

/**
 * The constant map of values for OpentracingRefTypeValues.
 * @deprecated Use the OPENTRACINGREFTYPEVALUES_XXXXX constants rather than the OpentracingRefTypeValues.XXXXX for bundle minification.
 */
export const OpentracingRefTypeValues: OpentracingRefTypeValues =
  /*#__PURE__*/ createConstMap<OpentracingRefTypeValues>([
    TMP_OPENTRACINGREFTYPEVALUES_CHILD_OF,
    TMP_OPENTRACINGREFTYPEVALUES_FOLLOWS_FROM,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for OtelStatusCodeValues enum definition
 *
 * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_OTELSTATUSCODEVALUES_OK = 'OK';
const TMP_OTELSTATUSCODEVALUES_ERROR = 'ERROR';

/**
 * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
 */
export const OTELSTATUSCODEVALUES_OK = TMP_OTELSTATUSCODEVALUES_OK;

/**
 * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
 */
export const OTELSTATUSCODEVALUES_ERROR = TMP_OTELSTATUSCODEVALUES_ERROR;

/**
 * Identifies the Values for OtelStatusCodeValues enum definition
 *
 * Name of the code, either &#34;OK&#34; or &#34;ERROR&#34;. MUST NOT be set if the status code is UNSET.
 * @deprecated Use the OTELSTATUSCODEVALUES_XXXXX constants rather than the OtelStatusCodeValues.XXXXX for bundle minification.
 */
export type OtelStatusCodeValues = {
  /** The operation has been validated by an Application developer or Operator to have completed successfully. */
  OK: 'OK';

  /** The operation contains an error. */
  ERROR: 'ERROR';
};

/**
 * The constant map of values for OtelStatusCodeValues.
 * @deprecated Use the OTELSTATUSCODEVALUES_XXXXX constants rather than the OtelStatusCodeValues.XXXXX for bundle minification.
 */
export const OtelStatusCodeValues: OtelStatusCodeValues =
  /*#__PURE__*/ createConstMap<OtelStatusCodeValues>([
    TMP_OTELSTATUSCODEVALUES_OK,
    TMP_OTELSTATUSCODEVALUES_ERROR,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for GraphqlOperationTypeValues enum definition
 *
 * The type of the operation being executed.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_GRAPHQLOPERATIONTYPEVALUES_QUERY = 'query';
const TMP_GRAPHQLOPERATIONTYPEVALUES_MUTATION = 'mutation';
const TMP_GRAPHQLOPERATIONTYPEVALUES_SUBSCRIPTION = 'subscription';

/**
 * The type of the operation being executed.
 */
export const GRAPHQLOPERATIONTYPEVALUES_QUERY =
  TMP_GRAPHQLOPERATIONTYPEVALUES_QUERY;

/**
 * The type of the operation being executed.
 */
export const GRAPHQLOPERATIONTYPEVALUES_MUTATION =
  TMP_GRAPHQLOPERATIONTYPEVALUES_MUTATION;

/**
 * The type of the operation being executed.
 */
export const GRAPHQLOPERATIONTYPEVALUES_SUBSCRIPTION =
  TMP_GRAPHQLOPERATIONTYPEVALUES_SUBSCRIPTION;

/**
 * Identifies the Values for GraphqlOperationTypeValues enum definition
 *
 * The type of the operation being executed.
 * @deprecated Use the GRAPHQLOPERATIONTYPEVALUES_XXXXX constants rather than the GraphqlOperationTypeValues.XXXXX for bundle minification.
 */
export type GraphqlOperationTypeValues = {
  /** GraphQL query. */
  QUERY: 'query';

  /** GraphQL mutation. */
  MUTATION: 'mutation';

  /** GraphQL subscription. */
  SUBSCRIPTION: 'subscription';
};

/**
 * The constant map of values for GraphqlOperationTypeValues.
 * @deprecated Use the GRAPHQLOPERATIONTYPEVALUES_XXXXX constants rather than the GraphqlOperationTypeValues.XXXXX for bundle minification.
 */
export const GraphqlOperationTypeValues: GraphqlOperationTypeValues =
  /*#__PURE__*/ createConstMap<GraphqlOperationTypeValues>([
    TMP_GRAPHQLOPERATIONTYPEVALUES_QUERY,
    TMP_GRAPHQLOPERATIONTYPEVALUES_MUTATION,
    TMP_GRAPHQLOPERATIONTYPEVALUES_SUBSCRIPTION,
  ]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for MessageTypeValues enum definition
 *
 * Whether this is a received or sent message.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
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
