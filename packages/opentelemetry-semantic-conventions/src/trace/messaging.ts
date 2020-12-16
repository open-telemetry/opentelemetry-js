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
 * messaging attribute names defined by the Opetelemetry Semantic Conventions specification
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/messaging.md
 */
export const MessagingAttribute = {
  /**
   * A string identifying the messaging system.
   * example: kafka, rabbitmq, sqs, sns
   *
   * @remarks
   * Required.
   */
  MESSAGING_SYSTEM: 'messaging.system',

  /**
   * The message destination name. This might be equal to the span name but is required nevertheless.
   * example: MyQueue, MyTopic
   *
   * @remarks
   * Required.
   */
  MESSAGING_DESTINATION: 'messaging.destination',

  /**
   * The kind of message destination
   * allowed values: queue, topic,
   *
   * @remarks
   * Required only if the message destination is either a queue or topic.
   */
  MESSAGING_DESTINATION_KIND: 'messaging.destination_kind',

  /**
   * A boolean that is true if the message destination is temporary
   *
   * @remarks
   * Conditional If missing, it is assumed to be false.
   */
  MESSAGING_TEMP_DESTINATION: 'messaging.temp_destination',

  /**
   * The kind of message destination
   * allowed values: queue, topic,
   *
   * @remarks
   * Required only if the message destination is either a queue or topic.
   */
  MESSAGING_PROTOCOL: 'messaging.protocol',

  /**
   * The version of the transport protocol.
   *
   * @remarks
   * Optional.
   */
  MESSAGING_PROTOCOL_VERSION: 'messaging.protocol_version',

  /**
   * Connection string.
   * example: https://queue.amazonaws.com/80398EXAMPLE/MyQueue
   *
   * @remarks
   * Optional.
   */
  MESSAGING_URL: 'messaging.url',

  /**
   * A value used by the messaging system as an identifier for the message, represented as a string.
   *
   * @remarks
   * Optional.
   */
  MESSAGING_MESSAGE_ID: 'messaging.message_id',

  /**
   * The conversation ID identifying the conversation to which the message belongs, represented as a string. Sometimes called "Correlation ID".
   *
   * @remarks
   * Optional.
   */
  MESSAGING_CONVERSATION_ID: 'messaging.conversation_id',

  /**
   * The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
   * Should be number.
   *
   * @remarks
   * Optional.
   */
  MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES: 'messaging.message_payload_size_bytes',

  /**
   * The compressed size of the message payload in bytes.
   * Should be number.
   *
   * @remarks
   * Optional.
   */
  MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES:
    'messaging.message_payload_compressed_size_bytes',

  /**
   * For message consumers only.
   * allowed values: receive, process,
   *
   * @remarks
   * Optional.
   */
  MESSAGING_OPERATION: 'messaging.operation',

  // System specific attributes
  MESSAGING_RABBITMQ_ROUTING_KEY: 'messaging.rabbitmq.routing_key',
  MESSAGING_KAFKA_MESSAGE_KEY: 'messaging.kafka.message_key',
  MESSAGING_KAFKA_CONSUMER_GROUP: 'messaging.kafka.consumer_group',
  MESSAGING_KAFKA_CLIENT_ID: 'messaging.kafka.client_id',
  MESSAGING_KAFKA_PARTITION: 'messaging.kafka.partition',
  MESSAGING_KAFKA_TOMBSTONE: 'messaging.kafka.tombstone',
};

export const MessagingOperationName = {
  /**
   *  A message is sent to a destination by a message producer/client.
   */
  SEND: 'send',

  /**
   *  A message is received from a destination by a message consumer/server.
   */
  RECEIVE: 'receive',

  /**
   *  A message that was previously received from a destination is processed by a message consumer/server.
   */
  PROCESS: 'process',
};
