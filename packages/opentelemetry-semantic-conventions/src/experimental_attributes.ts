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

//----------------------------------------------------------------------------------------------------------
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
//----------------------------------------------------------------------------------------------------------

/**
 * The ID of a running ECS task. The ID **MUST** be extracted from `task.arn`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_ID = 'aws.ecs.task.id';

/**
 * Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found [here](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ANDROID_OS_API_LEVEL = 'android.os.api_level';

/**
 * Deprecated use the `device.app.lifecycle` event definition including `android.state` as a payload field instead.
 *
 * @note The Android lifecycle states are defined in [Activity lifecycle callbacks](https://developer.android.com/guide/components/activities/activity-lifecycle#lc), and from which the `OS identifiers` are derived.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ANDROID_STATE = 'android.state';

/**
  * Enum value "background" for attribute {@link ATTR_ANDROID_STATE}.
  */
export const ATTR_ANDROID_STATE_VALUE_BACKGROUND = "background";

/**
  * Enum value "created" for attribute {@link ATTR_ANDROID_STATE}.
  */
export const ATTR_ANDROID_STATE_VALUE_CREATED = "created";

/**
  * Enum value "foreground" for attribute {@link ATTR_ANDROID_STATE}.
  */
export const ATTR_ANDROID_STATE_VALUE_FOREGROUND = "foreground";

/**
 * The provenance filename of the built attestation which directly relates to the build artifact filename. This filename **SHOULD** accompany the artifact at publish time. See the [SLSA Relationship](https://slsa.dev/spec/v1.0/distributing-provenance#relationship-between-artifacts-and-attestations) specification for more information.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ARTIFACT_ATTESTATION_FILENAME = 'artifact.attestation.filename';

/**
 * The full [hash value (see glossary)](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf), of the built attestation. Some envelopes in the software attestation space also refer to this as the [digest](https://github.com/in-toto/attestation/blob/main/spec/README.md#in-toto-attestation-framework-spec).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ARTIFACT_ATTESTATION_HASH = 'artifact.attestation.hash';

/**
 * The id of the build [software attestation](https://slsa.dev/attestation-model).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ARTIFACT_ATTESTATION_ID = 'artifact.attestation.id';

/**
 * The human readable file name of the artifact, typically generated during build and release processes. Often includes the package name and version in the file name.
 *
 * @note This file name can also act as the [Package Name](https://slsa.dev/spec/v1.0/terminology#package-model)
 * in cases where the package ecosystem maps accordingly.
 * Additionally, the artifact [can be published](https://slsa.dev/spec/v1.0/terminology#software-supply-chain)
 * for others, but that is not a guarantee.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ARTIFACT_FILENAME = 'artifact.filename';

/**
 * The full [hash value (see glossary)](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf), often found in checksum.txt on a release of the artifact and used to verify package integrity.
 *
 * @note The specific algorithm used to create the cryptographic hash value is
 * not defined. In situations where an artifact has multiple
 * cryptographic hashes, it is up to the implementer to choose which
 * hash value to set here; this should be the most secure hash algorithm
 * that is suitable for the situation and consistent with the
 * corresponding attestation. The implementer can then provide the other
 * hash values through an additional set of attribute extensions as they
 * deem necessary.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ARTIFACT_HASH = 'artifact.hash';

/**
 * The [Package URL](https://github.com/package-url/purl-spec) of the [package artifact](https://slsa.dev/spec/v1.0/terminology#package-model) provides a standard way to identify and locate the packaged artifact.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ARTIFACT_PURL = 'artifact.purl';

/**
 * The version of the artifact.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_ARTIFACT_VERSION = 'artifact.version';

/**
 * The JSON-serialized value of each item in the `AttributeDefinitions` request field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = 'aws.dynamodb.attribute_definitions';

/**
 * The value of the `AttributesToGet` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ATTRIBUTES_TO_GET = 'aws.dynamodb.attributes_to_get';

/**
 * The value of the `ConsistentRead` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_CONSISTENT_READ = 'aws.dynamodb.consistent_read';

/**
 * The JSON-serialized value of each item in the `ConsumedCapacity` response field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_CONSUMED_CAPACITY = 'aws.dynamodb.consumed_capacity';

/**
 * The value of the `Count` response parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_COUNT = 'aws.dynamodb.count';

/**
 * The value of the `ExclusiveStartTableName` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = 'aws.dynamodb.exclusive_start_table';

/**
 * The JSON-serialized value of each item in the `GlobalSecondaryIndexUpdates` request field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = 'aws.dynamodb.global_secondary_index_updates';

/**
 * The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = 'aws.dynamodb.global_secondary_indexes';

/**
 * The value of the `IndexName` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_INDEX_NAME = 'aws.dynamodb.index_name';

/**
 * The JSON-serialized value of the `ItemCollectionMetrics` response field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = 'aws.dynamodb.item_collection_metrics';

/**
 * The value of the `Limit` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_LIMIT = 'aws.dynamodb.limit';

/**
 * The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = 'aws.dynamodb.local_secondary_indexes';

/**
 * The value of the `ProjectionExpression` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROJECTION = 'aws.dynamodb.projection';

/**
 * The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = 'aws.dynamodb.provisioned_read_capacity';

/**
 * The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = 'aws.dynamodb.provisioned_write_capacity';

/**
 * The value of the `ScanIndexForward` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SCAN_FORWARD = 'aws.dynamodb.scan_forward';

/**
 * The value of the `ScannedCount` response parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SCANNED_COUNT = 'aws.dynamodb.scanned_count';

/**
 * The value of the `Segment` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SEGMENT = 'aws.dynamodb.segment';

/**
 * The value of the `Select` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_SELECT = 'aws.dynamodb.select';

/**
 * The number of items in the `TableNames` response parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TABLE_COUNT = 'aws.dynamodb.table_count';

/**
 * The keys in the `RequestItems` object field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TABLE_NAMES = 'aws.dynamodb.table_names';

/**
 * The value of the `TotalSegments` request parameter.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_DYNAMODB_TOTAL_SEGMENTS = 'aws.dynamodb.total_segments';

/**
 * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_CLUSTER_ARN = 'aws.ecs.cluster.arn';

/**
 * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_CONTAINER_ARN = 'aws.ecs.container.arn';

/**
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_LAUNCHTYPE = 'aws.ecs.launchtype';

/**
  * Enum value "ec2" for attribute {@link ATTR_AWS_ECS_LAUNCHTYPE}.
  */
export const ATTR_AWS_ECS_LAUNCHTYPE_VALUE_EC2 = "ec2";

/**
  * Enum value "fargate" for attribute {@link ATTR_AWS_ECS_LAUNCHTYPE}.
  */
export const ATTR_AWS_ECS_LAUNCHTYPE_VALUE_FARGATE = "fargate";

/**
 * The ARN of a running [ECS task](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-account-settings.html#ecs-resource-ids).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_ARN = 'aws.ecs.task.arn';

/**
 * The family name of the [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html) used to create the ECS task.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_FAMILY = 'aws.ecs.task.family';

/**
 * The revision for the task definition used to create the ECS task.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_ECS_TASK_REVISION = 'aws.ecs.task.revision';

/**
 * The ARN of an EKS cluster.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_EKS_CLUSTER_ARN = 'aws.eks.cluster.arn';

/**
 * The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
 *
 * @note This may be different from `cloud.resource_id` if an alias is involved.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LAMBDA_INVOKED_ARN = 'aws.lambda.invoked_arn';

/**
 * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
 *
 * @note See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_GROUP_ARNS = 'aws.log.group.arns';

/**
 * The name(s) of the AWS log group(s) an application is writing to.
 *
 * @note Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_GROUP_NAMES = 'aws.log.group.names';

/**
 * The ARN(s) of the AWS log stream(s).
 *
 * @note See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_STREAM_ARNS = 'aws.log.stream.arns';

/**
 * The name(s) of the AWS log stream(s) an application is writing to.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_LOG_STREAM_NAMES = 'aws.log.stream.names';

/**
 * The AWS request ID as returned in the response headers `x-amz-request-id` or `x-amz-requestid`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_REQUEST_ID = 'aws.request_id';

/**
 * The S3 bucket name the request refers to. Corresponds to the `--bucket` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
 *
 * @note The `bucket` attribute is applicable to all S3 operations that reference a bucket, i.e. that require the bucket name as a mandatory parameter.
 * This applies to almost all S3 operations except `list-buckets`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_BUCKET = 'aws.s3.bucket';

/**
 * The source object (in the form `bucket`/`key`) for the copy operation.
 *
 * @note The `copy_source` attribute applies to S3 copy operations and corresponds to the `--copy-source` parameter
 * of the [copy-object operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html).
 * This applies in particular to the following operations:
 * 
 * - [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
 * - [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_COPY_SOURCE = 'aws.s3.copy_source';

/**
 * The delete request container that specifies the objects to be deleted.
 *
 * @note The `delete` attribute is only applicable to the [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html) operation.
 * The `delete` attribute corresponds to the `--delete` parameter of the
 * [delete-objects operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-objects.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_DELETE = 'aws.s3.delete';

/**
 * The S3 object key the request refers to. Corresponds to the `--key` parameter of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) operations.
 *
 * @note The `key` attribute is applicable to all object-related S3 operations, i.e. that require the object key as a mandatory parameter.
 * This applies in particular to the following operations:
 * 
 * - [copy-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/copy-object.html)
 * - [delete-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-object.html)
 * - [get-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/get-object.html)
 * - [head-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/head-object.html)
 * - [put-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/put-object.html)
 * - [restore-object](https://docs.aws.amazon.com/cli/latest/reference/s3api/restore-object.html)
 * - [select-object-content](https://docs.aws.amazon.com/cli/latest/reference/s3api/select-object-content.html)
 * - [abort-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/abort-multipart-upload.html)
 * - [complete-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/complete-multipart-upload.html)
 * - [create-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/create-multipart-upload.html)
 * - [list-parts](https://docs.aws.amazon.com/cli/latest/reference/s3api/list-parts.html)
 * - [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
 * - [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_KEY = 'aws.s3.key';

/**
 * The part number of the part being uploaded in a multipart-upload operation. This is a positive integer between 1 and 10,000.
 *
 * @note The `part_number` attribute is only applicable to the [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
 * and [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html) operations.
 * The `part_number` attribute corresponds to the `--part-number` parameter of the
 * [upload-part operation within the S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_PART_NUMBER = 'aws.s3.part_number';

/**
 * Upload ID that identifies the multipart upload.
 *
 * @note The `upload_id` attribute applies to S3 multipart-upload operations and corresponds to the `--upload-id` parameter
 * of the [S3 API](https://docs.aws.amazon.com/cli/latest/reference/s3api/index.html) multipart operations.
 * This applies in particular to the following operations:
 * 
 * - [abort-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/abort-multipart-upload.html)
 * - [complete-multipart-upload](https://docs.aws.amazon.com/cli/latest/reference/s3api/complete-multipart-upload.html)
 * - [list-parts](https://docs.aws.amazon.com/cli/latest/reference/s3api/list-parts.html)
 * - [upload-part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html)
 * - [upload-part-copy](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part-copy.html)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AWS_S3_UPLOAD_ID = 'aws.s3.upload_id';

/**
 * The unique identifier of the service request. It's generated by the Azure service and returned with the response.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_AZ_SERVICE_REQUEST_ID = 'az.service_request_id';

/**
 * Array of brand name and version separated by a space
 *
 * @note This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_BRANDS = 'browser.brands';

/**
 * Preferred language of the user using the browser
 *
 * @note This value is intended to be taken from the Navigator API `navigator.language`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_LANGUAGE = 'browser.language';

/**
 * A boolean that is true if the browser is running on a mobile device
 *
 * @note This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute **SHOULD** be left unset.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_MOBILE = 'browser.mobile';

/**
 * The platform on which the browser is running
 *
 * @note This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API **SHOULD** **NOT** be used instead and this attribute **SHOULD** be left unset in order for the values to be consistent.
 * The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_BROWSER_PLATFORM = 'browser.platform';

/**
 * The human readable name of the pipeline within a CI/CD system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CICD_PIPELINE_NAME = 'cicd.pipeline.name';

/**
 * The unique identifier of a pipeline run within a CI/CD system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CICD_PIPELINE_RUN_ID = 'cicd.pipeline.run.id';

/**
 * The human readable name of a task within a pipeline. Task here most closely aligns with a [computing process](https://en.wikipedia.org/wiki/Pipeline_(computing)) in a pipeline. Other terms for tasks include commands, steps, and procedures.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CICD_PIPELINE_TASK_NAME = 'cicd.pipeline.task.name';

/**
 * The unique identifier of a task run within a pipeline.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CICD_PIPELINE_TASK_RUN_ID = 'cicd.pipeline.task.run.id';

/**
 * The [URL](https://en.wikipedia.org/wiki/URL) of the pipeline run providing the complete address in order to locate and identify the pipeline run.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CICD_PIPELINE_TASK_RUN_URL_FULL = 'cicd.pipeline.task.run.url.full';

/**
 * The type of the task within a pipeline.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CICD_PIPELINE_TASK_TYPE = 'cicd.pipeline.task.type';

/**
  * Enum value "build" for attribute {@link ATTR_CICD_PIPELINE_TASK_TYPE}.
  */
export const ATTR_CICD_PIPELINE_TASK_TYPE_VALUE_BUILD = "build";

/**
  * Enum value "deploy" for attribute {@link ATTR_CICD_PIPELINE_TASK_TYPE}.
  */
export const ATTR_CICD_PIPELINE_TASK_TYPE_VALUE_DEPLOY = "deploy";

/**
  * Enum value "test" for attribute {@link ATTR_CICD_PIPELINE_TASK_TYPE}.
  */
export const ATTR_CICD_PIPELINE_TASK_TYPE_VALUE_TEST = "test";

/**
 * The cloud account ID the resource is assigned to.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_ACCOUNT_ID = 'cloud.account.id';

/**
 * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
 *
 * @note Availability zones are called "zones" on Alibaba Cloud and Google Cloud.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_AVAILABILITY_ZONE = 'cloud.availability_zone';

/**
 * The cloud platform in use.
 *
 * @note The prefix of the service **SHOULD** match the one specified in `cloud.provider`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_PLATFORM = 'cloud.platform';

/**
  * Enum value "alibaba_cloud_ecs" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_ECS = "alibaba_cloud_ecs";

/**
  * Enum value "alibaba_cloud_fc" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_FC = "alibaba_cloud_fc";

/**
  * Enum value "alibaba_cloud_openshift" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_OPENSHIFT = "alibaba_cloud_openshift";

/**
  * Enum value "aws_app_runner" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AWS_APP_RUNNER = "aws_app_runner";

/**
  * Enum value "aws_ec2" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AWS_EC2 = "aws_ec2";

/**
  * Enum value "aws_ecs" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AWS_ECS = "aws_ecs";

/**
  * Enum value "aws_eks" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AWS_EKS = "aws_eks";

/**
  * Enum value "aws_elastic_beanstalk" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AWS_ELASTIC_BEANSTALK = "aws_elastic_beanstalk";

/**
  * Enum value "aws_lambda" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AWS_LAMBDA = "aws_lambda";

/**
  * Enum value "aws_openshift" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AWS_OPENSHIFT = "aws_openshift";

/**
  * Enum value "azure_aks" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AZURE_AKS = "azure_aks";

/**
  * Enum value "azure_app_service" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AZURE_APP_SERVICE = "azure_app_service";

/**
  * Enum value "azure_container_apps" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AZURE_CONTAINER_APPS = "azure_container_apps";

/**
  * Enum value "azure_container_instances" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AZURE_CONTAINER_INSTANCES = "azure_container_instances";

/**
  * Enum value "azure_functions" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AZURE_FUNCTIONS = "azure_functions";

/**
  * Enum value "azure_openshift" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AZURE_OPENSHIFT = "azure_openshift";

/**
  * Enum value "azure_vm" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_AZURE_VM = "azure_vm";

/**
  * Enum value "gcp_app_engine" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_GCP_APP_ENGINE = "gcp_app_engine";

/**
  * Enum value "gcp_bare_metal_solution" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_GCP_BARE_METAL_SOLUTION = "gcp_bare_metal_solution";

/**
  * Enum value "gcp_cloud_functions" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_GCP_CLOUD_FUNCTIONS = "gcp_cloud_functions";

/**
  * Enum value "gcp_cloud_run" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_GCP_CLOUD_RUN = "gcp_cloud_run";

/**
  * Enum value "gcp_compute_engine" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_GCP_COMPUTE_ENGINE = "gcp_compute_engine";

/**
  * Enum value "gcp_kubernetes_engine" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_GCP_KUBERNETES_ENGINE = "gcp_kubernetes_engine";

/**
  * Enum value "gcp_openshift" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_GCP_OPENSHIFT = "gcp_openshift";

/**
  * Enum value "ibm_cloud_openshift" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_IBM_CLOUD_OPENSHIFT = "ibm_cloud_openshift";

/**
  * Enum value "tencent_cloud_cvm" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_TENCENT_CLOUD_CVM = "tencent_cloud_cvm";

/**
  * Enum value "tencent_cloud_eks" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_TENCENT_CLOUD_EKS = "tencent_cloud_eks";

/**
  * Enum value "tencent_cloud_scf" for attribute {@link ATTR_CLOUD_PLATFORM}.
  */
export const ATTR_CLOUD_PLATFORM_VALUE_TENCENT_CLOUD_SCF = "tencent_cloud_scf";

/**
 * Name of the cloud provider.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_PROVIDER = 'cloud.provider';

/**
  * Enum value "alibaba_cloud" for attribute {@link ATTR_CLOUD_PROVIDER}.
  */
export const ATTR_CLOUD_PROVIDER_VALUE_ALIBABA_CLOUD = "alibaba_cloud";

/**
  * Enum value "aws" for attribute {@link ATTR_CLOUD_PROVIDER}.
  */
export const ATTR_CLOUD_PROVIDER_VALUE_AWS = "aws";

/**
  * Enum value "azure" for attribute {@link ATTR_CLOUD_PROVIDER}.
  */
export const ATTR_CLOUD_PROVIDER_VALUE_AZURE = "azure";

/**
  * Enum value "gcp" for attribute {@link ATTR_CLOUD_PROVIDER}.
  */
export const ATTR_CLOUD_PROVIDER_VALUE_GCP = "gcp";

/**
  * Enum value "heroku" for attribute {@link ATTR_CLOUD_PROVIDER}.
  */
export const ATTR_CLOUD_PROVIDER_VALUE_HEROKU = "heroku";

/**
  * Enum value "ibm_cloud" for attribute {@link ATTR_CLOUD_PROVIDER}.
  */
export const ATTR_CLOUD_PROVIDER_VALUE_IBM_CLOUD = "ibm_cloud";

/**
  * Enum value "tencent_cloud" for attribute {@link ATTR_CLOUD_PROVIDER}.
  */
export const ATTR_CLOUD_PROVIDER_VALUE_TENCENT_CLOUD = "tencent_cloud";

/**
 * The geographical region the resource is running.
 *
 * @note Refer to your provider's docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://www.tencentcloud.com/document/product/213/6091).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_REGION = 'cloud.region';

/**
 * Cloud provider-specific native identifier of the monitored cloud resource (e.g. an [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) on AWS, a [fully qualified resource ID](https://learn.microsoft.com/rest/api/resources/resources/get-by-id) on Azure, a [full resource name](https://cloud.google.com/apis/design/resource_names#full_resource_name) on GCP)
 *
 * @note On some cloud providers, it may not be possible to determine the full ID at startup,
 * so it may be necessary to set `cloud.resource_id` as a span attribute instead.
 * 
 * The exact value to use for `cloud.resource_id` depends on the cloud provider.
 * The following well-known definitions **MUST** be used if you set this attribute and they apply:
 * 
 * * **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
 *   Take care not to use the "invoked ARN" directly but replace any
 *   [alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html)
 *   with the resolved function version, as the same runtime instance may be invocable with
 *   multiple different aliases.
 * * **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
 * * **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/rest/api/resources/resources/get-by-id) of the invoked function,
 *   *not* the function app, having the form
 *   `/subscriptions/<SUBSCIPTION_GUID>/resourceGroups/<RG>/providers/Microsoft.Web/sites/<FUNCAPP>/functions/<FUNC>`.
 *   This means that a span attribute **MUST** be used, as an Azure function app can host multiple functions that would usually share
 *   a TracerProvider.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUD_RESOURCE_ID = 'cloud.resource_id';

/**
 * The [event_id](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#id) uniquely identifies the event.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_ID = 'cloudevents.event_id';

/**
 * The [source](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#source-1) identifies the context in which an event happened.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_SOURCE = 'cloudevents.event_source';

/**
 * The [version of the CloudEvents specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#specversion) which the event uses.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_SPEC_VERSION = 'cloudevents.event_spec_version';

/**
 * The [subject](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#subject) of the event in the context of the event producer (identified by source).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_SUBJECT = 'cloudevents.event_subject';

/**
 * The [event_type](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#type) contains a value describing the type of event related to the originating occurrence.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CLOUDEVENTS_EVENT_TYPE = 'cloudevents.event_type';

/**
 * The column number in `code.filepath` best representing the operation. It **SHOULD** point within the code unit named in `code.function`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_COLUMN = 'code.column';

/**
 * The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_FILEPATH = 'code.filepath';

/**
 * The method or function name, or equivalent (usually rightmost part of the code unit's name).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_FUNCTION = 'code.function';

/**
 * The line number in `code.filepath` best representing the operation. It **SHOULD** point within the code unit named in `code.function`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_LINENO = 'code.lineno';

/**
 * The "namespace" within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_NAMESPACE = 'code.namespace';

/**
 * A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CODE_STACKTRACE = 'code.stacktrace';

/**
 * The command used to run the container (i.e. the command name).
 *
 * @note If using embedded credentials or sensitive data, it is recommended to remove them to prevent potential leakage.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMAND = 'container.command';

/**
 * All the command arguments (including the command/executable itself) run by the container. [2]
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMAND_ARGS = 'container.command_args';

/**
 * The full command run by the container as a single string representing the full command. [2]
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_COMMAND_LINE = 'container.command_line';

/**
 * Deprecated, use `cpu.mode` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `cpu.mode`
 */
export const ATTR_CONTAINER_CPU_STATE = 'container.cpu.state';

/**
  * Enum value "kernel" for attribute {@link ATTR_CONTAINER_CPU_STATE}.
  */
export const ATTR_CONTAINER_CPU_STATE_VALUE_KERNEL = "kernel";

/**
  * Enum value "system" for attribute {@link ATTR_CONTAINER_CPU_STATE}.
  */
export const ATTR_CONTAINER_CPU_STATE_VALUE_SYSTEM = "system";

/**
  * Enum value "user" for attribute {@link ATTR_CONTAINER_CPU_STATE}.
  */
export const ATTR_CONTAINER_CPU_STATE_VALUE_USER = "user";

/**
 * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_ID = 'container.id';

/**
 * Runtime specific image identifier. Usually a hash algorithm followed by a UUID.
 *
 * @note Docker defines a sha256 of the image id; `container.image.id` corresponds to the `Image` field from the Docker container inspect [API](https://docs.docker.com/engine/api/v1.43/#tag/Container/operation/ContainerInspect) endpoint.
 * K8s defines a link to the container registry repository with digest `"imageID": "registry.azurecr.io /namespace/service/dockerfile@sha256:bdeabd40c3a8a492eaf9e8e44d0ebbb84bac7ee25ac0cf8a7159d25f62555625"`.
 * The ID is assigned by the container runtime and can vary in different environments. Consider using `oci.manifest.digest` if it is important to identify the same image in different environments/runtimes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_ID = 'container.image.id';

/**
 * Name of the image the container was built on.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_NAME = 'container.image.name';

/**
 * Repo digests of the container image as provided by the container runtime.
 *
 * @note [Docker](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect) and [CRI](https://github.com/kubernetes/cri-api/blob/c75ef5b473bbe2d0a4fc92f82235efd665ea8e9f/pkg/apis/runtime/v1/api.proto#L1237-L1238) report those under the `RepoDigests` field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_REPO_DIGESTS = 'container.image.repo_digests';

/**
 * Container image tags. An example can be found in [Docker Image Inspect](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect). Should be only the `<tag>` section of the full name for example from `registry.example.com/my-org/my-image:<tag>`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_IMAGE_TAGS = 'container.image.tags';

/**
 * Container labels, `<key>` being the label name, the value being the label value.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_LABEL = (key: string) => `container.label.${key}`;

/**
 * Deprecated, use `container.label` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `container.label`.
 */
export const ATTR_CONTAINER_LABELS = (key: string) => `container.labels.${key}`;

/**
 * Container name used by container runtime.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_NAME = 'container.name';

/**
 * The container runtime managing this container.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CONTAINER_RUNTIME = 'container.runtime';

/**
 * The mode of the CPU
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_CPU_MODE = 'cpu.mode';

/**
  * Enum value "idle" for attribute {@link ATTR_CPU_MODE}.
  */
export const ATTR_CPU_MODE_VALUE_IDLE = "idle";

/**
  * Enum value "interrupt" for attribute {@link ATTR_CPU_MODE}.
  */
export const ATTR_CPU_MODE_VALUE_INTERRUPT = "interrupt";

/**
  * Enum value "iowait" for attribute {@link ATTR_CPU_MODE}.
  */
export const ATTR_CPU_MODE_VALUE_IOWAIT = "iowait";

/**
  * Enum value "kernel" for attribute {@link ATTR_CPU_MODE}.
  */
export const ATTR_CPU_MODE_VALUE_KERNEL = "kernel";

/**
  * Enum value "nice" for attribute {@link ATTR_CPU_MODE}.
  */
export const ATTR_CPU_MODE_VALUE_NICE = "nice";

/**
  * Enum value "steal" for attribute {@link ATTR_CPU_MODE}.
  */
export const ATTR_CPU_MODE_VALUE_STEAL = "steal";

/**
  * Enum value "system" for attribute {@link ATTR_CPU_MODE}.
  */
export const ATTR_CPU_MODE_VALUE_SYSTEM = "system";

/**
  * Enum value "user" for attribute {@link ATTR_CPU_MODE}.
  */
export const ATTR_CPU_MODE_VALUE_USER = "user";

/**
 * The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL = 'db.cassandra.consistency_level';

/**
  * Enum value "all" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ALL = "all";

/**
  * Enum value "any" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ANY = "any";

/**
  * Enum value "each_quorum" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_EACH_QUORUM = "each_quorum";

/**
  * Enum value "local_one" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_ONE = "local_one";

/**
  * Enum value "local_quorum" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_QUORUM = "local_quorum";

/**
  * Enum value "local_serial" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_SERIAL = "local_serial";

/**
  * Enum value "one" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ONE = "one";

/**
  * Enum value "quorum" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_QUORUM = "quorum";

/**
  * Enum value "serial" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_SERIAL = "serial";

/**
  * Enum value "three" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_THREE = "three";

/**
  * Enum value "two" for attribute {@link ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL}.
  */
export const ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_TWO = "two";

/**
 * The data center of the coordinating node for a query.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_COORDINATOR_DC = 'db.cassandra.coordinator.dc';

/**
 * The ID of the coordinating node for a query.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_COORDINATOR_ID = 'db.cassandra.coordinator.id';

/**
 * Whether or not the query is idempotent.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_IDEMPOTENCE = 'db.cassandra.idempotence';

/**
 * The fetch size used for paging, i.e. how many rows will be returned at once.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_PAGE_SIZE = 'db.cassandra.page_size';

/**
 * The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = 'db.cassandra.speculative_execution_count';

/**
 * Deprecated, use `db.collection.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.collection.name`.
 */
export const ATTR_DB_CASSANDRA_TABLE = 'db.cassandra.table';

/**
 * The name of the connection pool; unique within the instrumented application. In case the connection pool implementation doesn't provide a name, instrumentation **SHOULD** use a combination of parameters that would make the name unique, for example, combining attributes `server.address`, `server.port`, and `db.namespace`, formatted as `server.address:server.port/db.namespace`. Instrumentations that generate connection pool name following different patterns **SHOULD** document it.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CLIENT_CONNECTION_POOL_NAME = 'db.client.connection.pool.name';

/**
 * The state of a connection in the pool
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_CLIENT_CONNECTION_STATE = 'db.client.connection.state';

/**
  * Enum value "idle" for attribute {@link ATTR_DB_CLIENT_CONNECTION_STATE}.
  */
export const ATTR_DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = "idle";

/**
  * Enum value "used" for attribute {@link ATTR_DB_CLIENT_CONNECTION_STATE}.
  */
export const ATTR_DB_CLIENT_CONNECTION_STATE_VALUE_USED = "used";

/**
 * Deprecated, use `db.client.connection.pool.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.client.connection.pool.name`.
 */
export const ATTR_DB_CLIENT_CONNECTIONS_POOL_NAME = 'db.client.connections.pool.name';

/**
 * Deprecated, use `db.client.connection.state` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.client.connection.state`.
 */
export const ATTR_DB_CLIENT_CONNECTIONS_STATE = 'db.client.connections.state';

/**
  * Enum value "idle" for attribute {@link ATTR_DB_CLIENT_CONNECTIONS_STATE}.
  */
export const ATTR_DB_CLIENT_CONNECTIONS_STATE_VALUE_IDLE = "idle";

/**
  * Enum value "used" for attribute {@link ATTR_DB_CLIENT_CONNECTIONS_STATE}.
  */
export const ATTR_DB_CLIENT_CONNECTIONS_STATE_VALUE_USED = "used";

/**
 * The name of a collection (table, container) within the database.
 *
 * @note It is RECOMMENDED to capture the value as provided by the application without attempting to do any case normalization.
 * If the collection name is parsed from the query text, it **SHOULD** be the first collection name found in the query and it **SHOULD** match the value provided in the query text including any schema and database name prefix.
 * For batch operations, if the individual operations are known to have the same collection name then that collection name **SHOULD** be used, otherwise `db.collection.name` **SHOULD** **NOT** be captured.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COLLECTION_NAME = 'db.collection.name';

/**
 * Deprecated, use `server.address`, `server.port` attributes instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * "Replaced by `server.address` and `server.port`."
 */
export const ATTR_DB_CONNECTION_STRING = 'db.connection_string';

/**
 * Unique Cosmos client instance id.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_CLIENT_ID = 'db.cosmosdb.client_id';

/**
 * Cosmos client connection mode.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_CONNECTION_MODE = 'db.cosmosdb.connection_mode';

/**
  * Enum value "direct" for attribute {@link ATTR_DB_COSMOSDB_CONNECTION_MODE}.
  */
export const ATTR_DB_COSMOSDB_CONNECTION_MODE_VALUE_DIRECT = "direct";

/**
  * Enum value "gateway" for attribute {@link ATTR_DB_COSMOSDB_CONNECTION_MODE}.
  */
export const ATTR_DB_COSMOSDB_CONNECTION_MODE_VALUE_GATEWAY = "gateway";

/**
 * Deprecated, use `db.collection.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.collection.name`.
 */
export const ATTR_DB_COSMOSDB_CONTAINER = 'db.cosmosdb.container';

/**
 * CosmosDB Operation Type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE = 'db.cosmosdb.operation_type';

/**
  * Enum value "Batch" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_BATCH = "Batch";

/**
  * Enum value "Create" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_CREATE = "Create";

/**
  * Enum value "Delete" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_DELETE = "Delete";

/**
  * Enum value "Execute" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_EXECUTE = "Execute";

/**
  * Enum value "ExecuteJavaScript" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_EXECUTE_JAVASCRIPT = "ExecuteJavaScript";

/**
  * Enum value "Head" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_HEAD = "Head";

/**
  * Enum value "HeadFeed" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_HEAD_FEED = "HeadFeed";

/**
  * Enum value "Invalid" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_INVALID = "Invalid";

/**
  * Enum value "Patch" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_PATCH = "Patch";

/**
  * Enum value "Query" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_QUERY = "Query";

/**
  * Enum value "QueryPlan" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_QUERY_PLAN = "QueryPlan";

/**
  * Enum value "Read" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_READ = "Read";

/**
  * Enum value "ReadFeed" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_READ_FEED = "ReadFeed";

/**
  * Enum value "Replace" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_REPLACE = "Replace";

/**
  * Enum value "Upsert" for attribute {@link ATTR_DB_COSMOSDB_OPERATION_TYPE}.
  */
export const ATTR_DB_COSMOSDB_OPERATION_TYPE_VALUE_UPSERT = "Upsert";

/**
 * RU consumed for that operation
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_REQUEST_CHARGE = 'db.cosmosdb.request_charge';

/**
 * Request payload size in bytes
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_REQUEST_CONTENT_LENGTH = 'db.cosmosdb.request_content_length';

/**
 * Cosmos DB status code.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_STATUS_CODE = 'db.cosmosdb.status_code';

/**
 * Cosmos DB sub status code.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_COSMOSDB_SUB_STATUS_CODE = 'db.cosmosdb.sub_status_code';

/**
 * Deprecated, use `db.namespace` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.namespace`.
 */
export const ATTR_DB_ELASTICSEARCH_CLUSTER_NAME = 'db.elasticsearch.cluster.name';

/**
 * Represents the human-readable identifier of the node/instance to which a request was routed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_ELASTICSEARCH_NODE_NAME = 'db.elasticsearch.node.name';

/**
 * A dynamic value in the url path.
 *
 * @note Many Elasticsearch url paths allow dynamic values. These **SHOULD** be recorded in span attributes in the format `db.elasticsearch.path_parts.<key>`, where `<key>` is the url path part name. The implementation **SHOULD** reference the [elasticsearch schema](https://raw.githubusercontent.com/elastic/elasticsearch-specification/main/output/schema/schema.json) in order to map the path part values to their names.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_ELASTICSEARCH_PATH_PARTS = (key: string) => `db.elasticsearch.path_parts.${key}`;

/**
 * Deprecated, no general replacement at this time. For Elasticsearch, use `db.elasticsearch.node.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Deprecated, no general replacement at this time. For Elasticsearch, use `db.elasticsearch.node.name` instead.
 */
export const ATTR_DB_INSTANCE_ID = 'db.instance.id';

/**
 * Removed, no replacement at this time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Removed as not used.
 */
export const ATTR_DB_JDBC_DRIVER_CLASSNAME = 'db.jdbc.driver_classname';

/**
 * Deprecated, use `db.collection.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.collection.name`.
 */
export const ATTR_DB_MONGODB_COLLECTION = 'db.mongodb.collection';

/**
 * Deprecated, SQL Server instance is now populated as a part of `db.namespace` attribute.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Deprecated, no replacement at this time.
 */
export const ATTR_DB_MSSQL_INSTANCE_NAME = 'db.mssql.instance_name';

/**
 * Deprecated, use `db.namespace` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.namespace`.
 */
export const ATTR_DB_NAME = 'db.name';

/**
 * The name of the database, fully qualified within the server address and port.
 *
 * @note If a database system has multiple namespace components, they **SHOULD** be concatenated (potentially using database system specific conventions) from most general to most specific namespace component, and more specific namespaces **SHOULD** **NOT** be captured without the more general namespaces, to ensure that "startswith" queries for the more general namespaces will be valid.
 * Semantic conventions for individual database systems **SHOULD** document what `db.namespace` means in the context of that system.
 * It is RECOMMENDED to capture the value as provided by the application without attempting to do any case normalization.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_NAMESPACE = 'db.namespace';

/**
 * Deprecated, use `db.operation.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.operation.name`.
 */
export const ATTR_DB_OPERATION = 'db.operation';

/**
 * The number of queries included in a [batch operation](/docs/database/database-spans.md#batch-operations).
 *
 * @note Operations are only considered batches when they contain two or more operations, and so `db.operation.batch.size` **SHOULD** never be `1`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_OPERATION_BATCH_SIZE = 'db.operation.batch.size';

/**
 * The name of the operation or command being executed.
 *
 * @note It is RECOMMENDED to capture the value as provided by the application without attempting to do any case normalization.
 * If the operation name is parsed from the query text, it **SHOULD** be the first operation name found in the query.
 * For batch operations, if the individual operations are known to have the same operation name then that operation name **SHOULD** be used prepended by `BATCH `, otherwise `db.operation.name` **SHOULD** be `BATCH` or some other database system specific term if more applicable.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_OPERATION_NAME = 'db.operation.name';

/**
 * A query parameter used in `db.query.text`, with `<key>` being the parameter name, and the attribute value being a string representation of the parameter value.
 *
 * @note Query parameters should only be captured when `db.query.text` is parameterized with placeholders.
 * If a parameter has no name and instead is referenced only by index, then `<key>` **SHOULD** be the 0-based index.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_QUERY_PARAMETER = (key: string) => `db.query.parameter.${key}`;

/**
 * The database query being executed.
 *
 * @note For sanitization see [Sanitization of `db.query.text`](../../docs/database/database-spans.md#sanitization-of-dbquerytext).
 * For batch operations, if the individual operations are known to have the same query text then that query text **SHOULD** be used, otherwise all of the individual query texts **SHOULD** be concatenated with separator `; ` or some other database system specific separator if more applicable.
 * Even though parameterized query text can potentially have sensitive data, by using a parameterized query the user is giving a strong signal that any sensitive data will be passed as parameter values, and the benefit to observability of capturing the static part of the query text by default outweighs the risk.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_QUERY_TEXT = 'db.query.text';

/**
 * Deprecated, use `db.namespace` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.namespace`.
 */
export const ATTR_DB_REDIS_DATABASE_INDEX = 'db.redis.database_index';

/**
 * Deprecated, use `db.collection.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.collection.name`.
 */
export const ATTR_DB_SQL_TABLE = 'db.sql.table';

/**
 * The database statement being executed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.query.text`.
 */
export const ATTR_DB_STATEMENT = 'db.statement';

/**
 * The database management system (DBMS) product as identified by the client instrumentation.
 *
 * @note The actual DBMS may differ from the one identified by the client. For example, when using PostgreSQL client libraries to connect to a CockroachDB, the `db.system` is set to `postgresql` based on the instrumentation's best knowledge.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DB_SYSTEM = 'db.system';

/**
  * Enum value "adabas" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_ADABAS = "adabas";

/**
  * Enum value "cache" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_CACHE = "cache";

/**
  * Enum value "cassandra" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_CASSANDRA = "cassandra";

/**
  * Enum value "clickhouse" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_CLICKHOUSE = "clickhouse";

/**
  * Enum value "cloudscape" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_CLOUDSCAPE = "cloudscape";

/**
  * Enum value "cockroachdb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_COCKROACHDB = "cockroachdb";

/**
  * Enum value "coldfusion" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_COLDFUSION = "coldfusion";

/**
  * Enum value "cosmosdb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_COSMOSDB = "cosmosdb";

/**
  * Enum value "couchbase" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_COUCHBASE = "couchbase";

/**
  * Enum value "couchdb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_COUCHDB = "couchdb";

/**
  * Enum value "db2" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_DB2 = "db2";

/**
  * Enum value "derby" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_DERBY = "derby";

/**
  * Enum value "dynamodb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_DYNAMODB = "dynamodb";

/**
  * Enum value "edb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_EDB = "edb";

/**
  * Enum value "elasticsearch" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_ELASTICSEARCH = "elasticsearch";

/**
  * Enum value "filemaker" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_FILEMAKER = "filemaker";

/**
  * Enum value "firebird" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_FIREBIRD = "firebird";

/**
  * Enum value "firstsql" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_FIRSTSQL = "firstsql";

/**
  * Enum value "geode" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_GEODE = "geode";

/**
  * Enum value "h2" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_H2 = "h2";

/**
  * Enum value "hanadb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_HANADB = "hanadb";

/**
  * Enum value "hbase" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_HBASE = "hbase";

/**
  * Enum value "hive" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_HIVE = "hive";

/**
  * Enum value "hsqldb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_HSQLDB = "hsqldb";

/**
  * Enum value "influxdb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_INFLUXDB = "influxdb";

/**
  * Enum value "informix" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_INFORMIX = "informix";

/**
  * Enum value "ingres" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_INGRES = "ingres";

/**
  * Enum value "instantdb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_INSTANTDB = "instantdb";

/**
  * Enum value "interbase" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_INTERBASE = "interbase";

/**
  * Enum value "intersystems_cache" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_INTERSYSTEMS_CACHE = "intersystems_cache";

/**
  * Enum value "mariadb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_MARIADB = "mariadb";

/**
  * Enum value "maxdb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_MAXDB = "maxdb";

/**
  * Enum value "memcached" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_MEMCACHED = "memcached";

/**
  * Enum value "mongodb" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_MONGODB = "mongodb";

/**
  * Enum value "mssql" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_MSSQL = "mssql";

/**
  * Enum value "mssqlcompact" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_MSSQLCOMPACT = "mssqlcompact";

/**
  * Enum value "mysql" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_MYSQL = "mysql";

/**
  * Enum value "neo4j" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_NEO4J = "neo4j";

/**
  * Enum value "netezza" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_NETEZZA = "netezza";

/**
  * Enum value "opensearch" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_OPENSEARCH = "opensearch";

/**
  * Enum value "oracle" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_ORACLE = "oracle";

/**
  * Enum value "other_sql" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_OTHER_SQL = "other_sql";

/**
  * Enum value "pervasive" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_PERVASIVE = "pervasive";

/**
  * Enum value "pointbase" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_POINTBASE = "pointbase";

/**
  * Enum value "postgresql" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_POSTGRESQL = "postgresql";

/**
  * Enum value "progress" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_PROGRESS = "progress";

/**
  * Enum value "redis" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_REDIS = "redis";

/**
  * Enum value "redshift" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_REDSHIFT = "redshift";

/**
  * Enum value "spanner" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_SPANNER = "spanner";

/**
  * Enum value "sqlite" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_SQLITE = "sqlite";

/**
  * Enum value "sybase" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_SYBASE = "sybase";

/**
  * Enum value "teradata" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_TERADATA = "teradata";

/**
  * Enum value "trino" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_TRINO = "trino";

/**
  * Enum value "vertica" for attribute {@link ATTR_DB_SYSTEM}.
  */
export const ATTR_DB_SYSTEM_VALUE_VERTICA = "vertica";

/**
 * Deprecated, no replacement at this time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * No replacement at this time.
 */
export const ATTR_DB_USER = 'db.user';

/**
 * 'Deprecated, use `deployment.environment.name` instead.'
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Deprecated, use `deployment.environment.name` instead.
 */
export const ATTR_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';

/**
 * Name of the [deployment environment](https://wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
 *
 * @note `deployment.environment.name` does not affect the uniqueness constraints defined through
 * the `service.namespace`, `service.name` and `service.instance.id` resource attributes.
 * This implies that resources carrying the following attribute combinations **MUST** be
 * considered to be identifying the same service:
 * 
 * * `service.name=frontend`, `deployment.environment.name=production`
 * * `service.name=frontend`, `deployment.environment.name=staging`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEPLOYMENT_ENVIRONMENT_NAME = 'deployment.environment.name';

/**
 * The id of the deployment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEPLOYMENT_ID = 'deployment.id';

/**
 * The name of the deployment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEPLOYMENT_NAME = 'deployment.name';

/**
 * The status of the deployment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEPLOYMENT_STATUS = 'deployment.status';

/**
  * Enum value "failed" for attribute {@link ATTR_DEPLOYMENT_STATUS}.
  */
export const ATTR_DEPLOYMENT_STATUS_VALUE_FAILED = "failed";

/**
  * Enum value "succeeded" for attribute {@link ATTR_DEPLOYMENT_STATUS}.
  */
export const ATTR_DEPLOYMENT_STATUS_VALUE_SUCCEEDED = "succeeded";

/**
 * Destination address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * @note When observed from the source side, and when communicating through an intermediary, `destination.address` **SHOULD** represent the destination address behind any intermediaries, for example proxies, if it's available.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DESTINATION_ADDRESS = 'destination.address';

/**
 * Destination port number
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DESTINATION_PORT = 'destination.port';

/**
 * A unique identifier representing the device
 *
 * @note The device identifier **MUST** only be defined using the values outlined below. This value is not an advertising identifier and **MUST** **NOT** be used as such. On iOS (Swift or Objective-C), this value **MUST** be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value **MUST** be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_ID = 'device.id';

/**
 * The name of the device manufacturer
 *
 * @note The Android OS provides this field via [Build](https://developer.android.com/reference/android/os/Build#MANUFACTURER). iOS apps **SHOULD** hardcode the value `Apple`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MANUFACTURER = 'device.manufacturer';

/**
 * The model identifier for the device
 *
 * @note It's recommended this value represents a machine-readable version of the model identifier rather than the market or consumer-friendly name of the device.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MODEL_IDENTIFIER = 'device.model.identifier';

/**
 * The marketing name for the device model
 *
 * @note It's recommended this value represents a human-readable version of the device model rather than a machine-readable alternative.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DEVICE_MODEL_NAME = 'device.model.name';

/**
 * The disk IO operation direction.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DISK_IO_DIRECTION = 'disk.io.direction';

/**
  * Enum value "read" for attribute {@link ATTR_DISK_IO_DIRECTION}.
  */
export const ATTR_DISK_IO_DIRECTION_VALUE_READ = "read";

/**
  * Enum value "write" for attribute {@link ATTR_DISK_IO_DIRECTION}.
  */
export const ATTR_DISK_IO_DIRECTION_VALUE_WRITE = "write";

/**
 * The name being queried.
 *
 * @note If the name field contains non-printable characters (below 32 or above 126), those characters should be represented as escaped base 10 integers (\DDD). Back slashes and quotes should be escaped. Tabs, carriage returns, and line feeds should be converted to \t, \r, and \n respectively.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_DNS_QUESTION_NAME = 'dns.question.name';

/**
 * Deprecated, use `user.id` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `user.id` attribute.
 */
export const ATTR_ENDUSER_ID = 'enduser.id';

/**
 * Deprecated, use `user.roles` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `user.roles` attribute.
 */
export const ATTR_ENDUSER_ROLE = 'enduser.role';

/**
 * Deprecated, no replacement at this time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Removed.
 */
export const ATTR_ENDUSER_SCOPE = 'enduser.scope';

/**
 * Identifies the class / type of event.
 *
 * @note Event names are subject to the same rules as [attribute names](/docs/general/attribute-naming.md). Notably, event names are namespaced to avoid collisions and provide a clean separation of semantics for events in separate domains like browser, mobile, and kubernetes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_EVENT_NAME = 'event.name';

/**
 * A boolean that is true if the serverless function is executed for the first time (aka cold-start).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_COLDSTART = 'faas.coldstart';

/**
 * A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_CRON = 'faas.cron';

/**
 * The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_COLLECTION = 'faas.document.collection';

/**
 * The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_NAME = 'faas.document.name';

/**
 * Describes the type of the operation that was performed on the data.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_OPERATION = 'faas.document.operation';

/**
  * Enum value "delete" for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
  */
export const ATTR_FAAS_DOCUMENT_OPERATION_VALUE_DELETE = "delete";

/**
  * Enum value "edit" for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
  */
export const ATTR_FAAS_DOCUMENT_OPERATION_VALUE_EDIT = "edit";

/**
  * Enum value "insert" for attribute {@link ATTR_FAAS_DOCUMENT_OPERATION}.
  */
export const ATTR_FAAS_DOCUMENT_OPERATION_VALUE_INSERT = "insert";

/**
 * A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_DOCUMENT_TIME = 'faas.document.time';

/**
 * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
 *
 * @note * **AWS Lambda:** Use the (full) log stream name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INSTANCE = 'faas.instance';

/**
 * The invocation ID of the current function invocation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOCATION_ID = 'faas.invocation_id';

/**
 * The name of the invoked function.
 *
 * @note SHOULD be equal to the `faas.name` resource attribute of the invoked function.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKED_NAME = 'faas.invoked_name';

/**
 * The cloud provider of the invoked function.
 *
 * @note SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKED_PROVIDER = 'faas.invoked_provider';

/**
  * Enum value "alibaba_cloud" for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
  */
export const ATTR_FAAS_INVOKED_PROVIDER_VALUE_ALIBABA_CLOUD = "alibaba_cloud";

/**
  * Enum value "aws" for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
  */
export const ATTR_FAAS_INVOKED_PROVIDER_VALUE_AWS = "aws";

/**
  * Enum value "azure" for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
  */
export const ATTR_FAAS_INVOKED_PROVIDER_VALUE_AZURE = "azure";

/**
  * Enum value "gcp" for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
  */
export const ATTR_FAAS_INVOKED_PROVIDER_VALUE_GCP = "gcp";

/**
  * Enum value "tencent_cloud" for attribute {@link ATTR_FAAS_INVOKED_PROVIDER}.
  */
export const ATTR_FAAS_INVOKED_PROVIDER_VALUE_TENCENT_CLOUD = "tencent_cloud";

/**
 * The cloud region of the invoked function.
 *
 * @note SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_INVOKED_REGION = 'faas.invoked_region';

/**
 * The amount of memory available to the serverless function converted to Bytes.
 *
 * @note It's recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information (which must be multiplied by 1,048,576).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_MAX_MEMORY = 'faas.max_memory';

/**
 * The name of the single function that this runtime instance executes.
 *
 * @note This is the name of the function as configured/deployed on the FaaS
 * platform and is usually different from the name of the callback
 * function (which may be stored in the
 * [`code.namespace`/`code.function`](/docs/general/attributes.md#source-code-attributes)
 * span attributes).
 * 
 * For some cloud providers, the above definition is ambiguous. The following
 * definition of function name **MUST** be used for this attribute
 * (and consequently the span name) for the listed cloud providers/products:
 * 
 * * **Azure:**  The full name `<FUNCAPP>/<FUNC>`, i.e., function app name
 *   followed by a forward slash followed by the function name (this form
 *   can also be seen in the resource JSON for the function).
 *   This means that a span attribute **MUST** be used, as an Azure function
 *   app can host multiple functions that would usually share
 *   a TracerProvider (see also the `cloud.resource_id` attribute).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_NAME = 'faas.name';

/**
 * A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_TIME = 'faas.time';

/**
 * Type of the trigger which caused this function invocation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_TRIGGER = 'faas.trigger';

/**
  * Enum value "datasource" for attribute {@link ATTR_FAAS_TRIGGER}.
  */
export const ATTR_FAAS_TRIGGER_VALUE_DATASOURCE = "datasource";

/**
  * Enum value "http" for attribute {@link ATTR_FAAS_TRIGGER}.
  */
export const ATTR_FAAS_TRIGGER_VALUE_HTTP = "http";

/**
  * Enum value "other" for attribute {@link ATTR_FAAS_TRIGGER}.
  */
export const ATTR_FAAS_TRIGGER_VALUE_OTHER = "other";

/**
  * Enum value "pubsub" for attribute {@link ATTR_FAAS_TRIGGER}.
  */
export const ATTR_FAAS_TRIGGER_VALUE_PUBSUB = "pubsub";

/**
  * Enum value "timer" for attribute {@link ATTR_FAAS_TRIGGER}.
  */
export const ATTR_FAAS_TRIGGER_VALUE_TIMER = "timer";

/**
 * The immutable version of the function being executed.
 *
 * @note Depending on the cloud provider and platform, use:
 * 
 * * **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
 *   (an integer represented as a decimal string).
 * * **Google Cloud Run (Services):** The [revision](https://cloud.google.com/run/docs/managing/revisions)
 *   (i.e., the function name plus the revision suffix).
 * * **Google Cloud Functions:** The value of the
 *   [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
 * * **Azure Functions:** Not applicable. Do not set this attribute.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FAAS_VERSION = 'faas.version';

/**
 * The unique identifier of the feature flag.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FEATURE_FLAG_KEY = 'feature_flag.key';

/**
 * The name of the service provider that performs the flag evaluation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FEATURE_FLAG_PROVIDER_NAME = 'feature_flag.provider_name';

/**
 * **SHOULD** be a semantic identifier for a value. If one is unavailable, a stringified version of the value can be used.
 *
 * @note A semantic identifier, commonly referred to as a variant, provides a means
 * for referring to a value without including the value itself. This can
 * provide additional context for understanding the meaning behind a value.
 * For example, the variant `red` maybe be used for the value `#c05543`.
 * 
 * A stringified version of the value can be used in situations where a
 * semantic identifier is unavailable. String representation of the value
 * should be determined by the implementer.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FEATURE_FLAG_VARIANT = 'feature_flag.variant';

/**
 * Directory where the file is located. It should include the drive letter, when appropriate.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_DIRECTORY = 'file.directory';

/**
 * File extension, excluding the leading dot.
 *
 * @note When the file name has multiple extensions (example.tar.gz), only the last one should be captured ("gz", not "tar.gz").
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_EXTENSION = 'file.extension';

/**
 * Name of the file including the extension, without the directory.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_NAME = 'file.name';

/**
 * Full path to the file, including the file name. It should include the drive letter, when appropriate.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_PATH = 'file.path';

/**
 * File size in bytes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_FILE_SIZE = 'file.size';

/**
 * Identifies the Google Cloud service for which the official client library is intended.
 *
 * @note Intended to be a stable identifier for Google Cloud client libraries that is uniform across implementation languages. The value should be derived from the canonical service domain for the service; for example, 'foo.googleapis.com' should result in a value of 'foo'.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_CLIENT_SERVICE = 'gcp.client.service';

/**
 * The name of the Cloud Run [execution](https://cloud.google.com/run/docs/managing/job-executions) being run for the Job, as set by the [`CLOUD_RUN_EXECUTION`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_CLOUD_RUN_JOB_EXECUTION = 'gcp.cloud_run.job.execution';

/**
 * The index for a task within an execution as provided by the [`CLOUD_RUN_TASK_INDEX`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_CLOUD_RUN_JOB_TASK_INDEX = 'gcp.cloud_run.job.task_index';

/**
 * The hostname of a GCE instance. This is the full value of the default or [custom hostname](https://cloud.google.com/compute/docs/instances/custom-hostname-vm).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_GCE_INSTANCE_HOSTNAME = 'gcp.gce.instance.hostname';

/**
 * The instance name of a GCE instance. This is the value provided by `host.name`, the visible name of the instance in the Cloud Console UI, and the prefix for the default hostname of the instance as defined by the [default internal DNS name](https://cloud.google.com/compute/docs/internal-dns#instance-fully-qualified-domain-names).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GCP_GCE_INSTANCE_NAME = 'gcp.gce.instance.name';

/**
 * The full response received from the GenAI model.
 *
 * @note It's RECOMMENDED to format completions as JSON string matching [OpenAI messages format](https://platform.openai.com/docs/guides/text-generation)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_COMPLETION = 'gen_ai.completion';

/**
 * The name of the operation being performed.
 *
 * @note If one of the predefined values applies, but specific system uses a different name it's RECOMMENDED to document it in the semantic conventions for specific GenAI system and use system-specific name in the instrumentation. If a different name is not documented, instrumentation libraries **SHOULD** use applicable predefined value.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_OPERATION_NAME = 'gen_ai.operation.name';

/**
  * Enum value "chat" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
  */
export const ATTR_GEN_AI_OPERATION_NAME_VALUE_CHAT = "chat";

/**
  * Enum value "text_completion" for attribute {@link ATTR_GEN_AI_OPERATION_NAME}.
  */
export const ATTR_GEN_AI_OPERATION_NAME_VALUE_TEXT_COMPLETION = "text_completion";

/**
 * The full prompt sent to the GenAI model.
 *
 * @note It's RECOMMENDED to format prompts as JSON string matching [OpenAI messages format](https://platform.openai.com/docs/guides/text-generation)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_PROMPT = 'gen_ai.prompt';

/**
 * The frequency penalty setting for the GenAI request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_REQUEST_FREQUENCY_PENALTY = 'gen_ai.request.frequency_penalty';

/**
 * The maximum number of tokens the model generates for a request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_REQUEST_MAX_TOKENS = 'gen_ai.request.max_tokens';

/**
 * The name of the GenAI model a request is being made to.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_REQUEST_MODEL = 'gen_ai.request.model';

/**
 * The presence penalty setting for the GenAI request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_REQUEST_PRESENCE_PENALTY = 'gen_ai.request.presence_penalty';

/**
 * List of sequences that the model will use to stop generating further tokens.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_REQUEST_STOP_SEQUENCES = 'gen_ai.request.stop_sequences';

/**
 * The temperature setting for the GenAI request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_REQUEST_TEMPERATURE = 'gen_ai.request.temperature';

/**
 * The top_k sampling setting for the GenAI request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_REQUEST_TOP_K = 'gen_ai.request.top_k';

/**
 * The top_p sampling setting for the GenAI request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_REQUEST_TOP_P = 'gen_ai.request.top_p';

/**
 * Array of reasons the model stopped generating tokens, corresponding to each generation received.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_RESPONSE_FINISH_REASONS = 'gen_ai.response.finish_reasons';

/**
 * The unique identifier for the completion.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_RESPONSE_ID = 'gen_ai.response.id';

/**
 * The name of the model that generated the response.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_RESPONSE_MODEL = 'gen_ai.response.model';

/**
 * The Generative AI product as identified by the client or server instrumentation.
 *
 * @note The `gen_ai.system` describes a family of GenAI models with specific model identified
 * by `gen_ai.request.model` and `gen_ai.response.model` attributes.
 * 
 * The actual GenAI product may differ from the one identified by the client.
 * For example, when using OpenAI client libraries to communicate with Mistral, the `gen_ai.system`
 * is set to `openai` based on the instrumentation's best knowledge.
 * 
 * For custom model, a custom friendly name **SHOULD** be used.
 * If none of these options apply, the `gen_ai.system` **SHOULD** be set to `_OTHER`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_SYSTEM = 'gen_ai.system';

/**
  * Enum value "anthropic" for attribute {@link ATTR_GEN_AI_SYSTEM}.
  */
export const ATTR_GEN_AI_SYSTEM_VALUE_ANTHROPIC = "anthropic";

/**
  * Enum value "cohere" for attribute {@link ATTR_GEN_AI_SYSTEM}.
  */
export const ATTR_GEN_AI_SYSTEM_VALUE_COHERE = "cohere";

/**
  * Enum value "openai" for attribute {@link ATTR_GEN_AI_SYSTEM}.
  */
export const ATTR_GEN_AI_SYSTEM_VALUE_OPENAI = "openai";

/**
  * Enum value "vertex_ai" for attribute {@link ATTR_GEN_AI_SYSTEM}.
  */
export const ATTR_GEN_AI_SYSTEM_VALUE_VERTEX_AI = "vertex_ai";

/**
 * The type of token being counted.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_TOKEN_TYPE = 'gen_ai.token.type';

/**
  * Enum value "input" for attribute {@link ATTR_GEN_AI_TOKEN_TYPE}.
  */
export const ATTR_GEN_AI_TOKEN_TYPE_VALUE_INPUT = "input";

/**
  * Enum value "output" for attribute {@link ATTR_GEN_AI_TOKEN_TYPE}.
  */
export const ATTR_GEN_AI_TOKEN_TYPE_VALUE_COMPLETION = "output";

/**
 * Deprecated, use `gen_ai.usage.output_tokens` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `gen_ai.usage.output_tokens` attribute.
 */
export const ATTR_GEN_AI_USAGE_COMPLETION_TOKENS = 'gen_ai.usage.completion_tokens';

/**
 * The number of tokens used in the GenAI input (prompt).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_USAGE_INPUT_TOKENS = 'gen_ai.usage.input_tokens';

/**
 * The number of tokens used in the GenAI response (completion).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GEN_AI_USAGE_OUTPUT_TOKENS = 'gen_ai.usage.output_tokens';

/**
 * Deprecated, use `gen_ai.usage.input_tokens` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `gen_ai.usage.input_tokens` attribute.
 */
export const ATTR_GEN_AI_USAGE_PROMPT_TOKENS = 'gen_ai.usage.prompt_tokens';

/**
 * The type of memory.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GO_MEMORY_TYPE = 'go.memory.type';

/**
  * Enum value "other" for attribute {@link ATTR_GO_MEMORY_TYPE}.
  */
export const ATTR_GO_MEMORY_TYPE_VALUE_OTHER = "other";

/**
  * Enum value "stack" for attribute {@link ATTR_GO_MEMORY_TYPE}.
  */
export const ATTR_GO_MEMORY_TYPE_VALUE_STACK = "stack";

/**
 * The GraphQL document being executed.
 *
 * @note The value may be sanitized to exclude sensitive information.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_DOCUMENT = 'graphql.document';

/**
 * The name of the operation being executed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_OPERATION_NAME = 'graphql.operation.name';

/**
 * The type of the operation being executed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_GRAPHQL_OPERATION_TYPE = 'graphql.operation.type';

/**
  * Enum value "mutation" for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
  */
export const ATTR_GRAPHQL_OPERATION_TYPE_VALUE_MUTATION = "mutation";

/**
  * Enum value "query" for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
  */
export const ATTR_GRAPHQL_OPERATION_TYPE_VALUE_QUERY = "query";

/**
  * Enum value "subscription" for attribute {@link ATTR_GRAPHQL_OPERATION_TYPE}.
  */
export const ATTR_GRAPHQL_OPERATION_TYPE_VALUE_SUBSCRIPTION = "subscription";

/**
 * Unique identifier for the application
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_APP_ID = 'heroku.app.id';

/**
 * Commit hash for the current release
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_RELEASE_COMMIT = 'heroku.release.commit';

/**
 * Time and date the release was created
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HEROKU_RELEASE_CREATION_TIMESTAMP = 'heroku.release.creation_timestamp';

/**
 * The CPU architecture the host system is running on.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_ARCH = 'host.arch';

/**
  * Enum value "amd64" for attribute {@link ATTR_HOST_ARCH}.
  */
export const ATTR_HOST_ARCH_VALUE_AMD64 = "amd64";

/**
  * Enum value "arm32" for attribute {@link ATTR_HOST_ARCH}.
  */
export const ATTR_HOST_ARCH_VALUE_ARM32 = "arm32";

/**
  * Enum value "arm64" for attribute {@link ATTR_HOST_ARCH}.
  */
export const ATTR_HOST_ARCH_VALUE_ARM64 = "arm64";

/**
  * Enum value "ia64" for attribute {@link ATTR_HOST_ARCH}.
  */
export const ATTR_HOST_ARCH_VALUE_IA64 = "ia64";

/**
  * Enum value "ppc32" for attribute {@link ATTR_HOST_ARCH}.
  */
export const ATTR_HOST_ARCH_VALUE_PPC32 = "ppc32";

/**
  * Enum value "ppc64" for attribute {@link ATTR_HOST_ARCH}.
  */
export const ATTR_HOST_ARCH_VALUE_PPC64 = "ppc64";

/**
  * Enum value "s390x" for attribute {@link ATTR_HOST_ARCH}.
  */
export const ATTR_HOST_ARCH_VALUE_S390X = "s390x";

/**
  * Enum value "x86" for attribute {@link ATTR_HOST_ARCH}.
  */
export const ATTR_HOST_ARCH_VALUE_X86 = "x86";

/**
 * The amount of level 2 memory cache available to the processor (in Bytes).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_CACHE_L2_SIZE = 'host.cpu.cache.l2.size';

/**
 * Family or generation of the CPU.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_FAMILY = 'host.cpu.family';

/**
 * Model identifier. It provides more granular information about the CPU, distinguishing it from other CPUs within the same family.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_MODEL_ID = 'host.cpu.model.id';

/**
 * Model designation of the processor.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_MODEL_NAME = 'host.cpu.model.name';

/**
 * Stepping or core revisions.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_STEPPING = 'host.cpu.stepping';

/**
 * Processor manufacturer identifier. A maximum 12-character string.
 *
 * @note [CPUID](https://wiki.osdev.org/CPUID) command returns the vendor ID string in EBX, EDX and ECX registers. Writing these to memory in this order results in a 12-character string.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_CPU_VENDOR_ID = 'host.cpu.vendor.id';

/**
 * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized systems, this should be the `machine-id`. See the table below for the sources to use to determine the `machine-id` based on operating system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_ID = 'host.id';

/**
 * VM image ID or host OS image ID. For Cloud, this value is from the provider.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_ID = 'host.image.id';

/**
 * Name of the VM image or OS install the host was instantiated from.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_NAME = 'host.image.name';

/**
 * The version string of the VM image or host OS as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IMAGE_VERSION = 'host.image.version';

/**
 * Available IP addresses of the host, excluding loopback interfaces.
 *
 * @note IPv4 Addresses **MUST** be specified in dotted-quad notation. IPv6 addresses **MUST** be specified in the [RFC 5952](https://www.rfc-editor.org/rfc/rfc5952.html) format.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_IP = 'host.ip';

/**
 * Available MAC addresses of the host, excluding loopback interfaces.
 *
 * @note MAC Addresses **MUST** be represented in [IEEE RA hexadecimal form](https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf): as hyphen-separated octets in uppercase hexadecimal form from most to least significant.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_MAC = 'host.mac';

/**
 * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_NAME = 'host.name';

/**
 * Type of host. For Cloud, this must be the machine type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HOST_TYPE = 'host.type';

/**
 * Deprecated, use `client.address` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `client.address`.
 */
export const ATTR_HTTP_CLIENT_IP = 'http.client_ip';

/**
 * State of the HTTP connection in the HTTP connection pool.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_CONNECTION_STATE = 'http.connection.state';

/**
  * Enum value "active" for attribute {@link ATTR_HTTP_CONNECTION_STATE}.
  */
export const ATTR_HTTP_CONNECTION_STATE_VALUE_ACTIVE = "active";

/**
  * Enum value "idle" for attribute {@link ATTR_HTTP_CONNECTION_STATE}.
  */
export const ATTR_HTTP_CONNECTION_STATE_VALUE_IDLE = "idle";

/**
 * Deprecated, use `network.protocol.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.protocol.name`.
 */
export const ATTR_HTTP_FLAVOR = 'http.flavor';

/**
  * Enum value "1.0" for attribute {@link ATTR_HTTP_FLAVOR}.
  */
export const ATTR_HTTP_FLAVOR_VALUE_HTTP_1_0 = "1.0";

/**
  * Enum value "1.1" for attribute {@link ATTR_HTTP_FLAVOR}.
  */
export const ATTR_HTTP_FLAVOR_VALUE_HTTP_1_1 = "1.1";

/**
  * Enum value "2.0" for attribute {@link ATTR_HTTP_FLAVOR}.
  */
export const ATTR_HTTP_FLAVOR_VALUE_HTTP_2_0 = "2.0";

/**
  * Enum value "3.0" for attribute {@link ATTR_HTTP_FLAVOR}.
  */
export const ATTR_HTTP_FLAVOR_VALUE_HTTP_3_0 = "3.0";

/**
  * Enum value "QUIC" for attribute {@link ATTR_HTTP_FLAVOR}.
  */
export const ATTR_HTTP_FLAVOR_VALUE_QUIC = "QUIC";

/**
  * Enum value "SPDY" for attribute {@link ATTR_HTTP_FLAVOR}.
  */
export const ATTR_HTTP_FLAVOR_VALUE_SPDY = "SPDY";

/**
 * Deprecated, use one of `server.address`, `client.address` or `http.request.header.host` instead, depending on the usage.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by one of `server.address`, `client.address` or `http.request.header.host`, depending on the usage.
 */
export const ATTR_HTTP_HOST = 'http.host';

/**
 * Deprecated, use `http.request.method` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `http.request.method`.
 */
export const ATTR_HTTP_METHOD = 'http.method';

/**
 * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_REQUEST_BODY_SIZE = 'http.request.body.size';

/**
 * The total size of the request in bytes. This should be the total number of bytes sent over the wire, including the request line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and request body if any.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_REQUEST_SIZE = 'http.request.size';

/**
 * Deprecated, use `http.request.header.content-length` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `http.request.header.content-length`.
 */
export const ATTR_HTTP_REQUEST_CONTENT_LENGTH = 'http.request_content_length';

/**
 * Deprecated, use `http.request.body.size` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `http.request.body.size`.
 */
export const ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = 'http.request_content_length_uncompressed';

/**
 * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_RESPONSE_BODY_SIZE = 'http.response.body.size';

/**
 * The total size of the response in bytes. This should be the total number of bytes sent over the wire, including the status line (HTTP/1.1), framing (HTTP/2 and HTTP/3), headers, and response body and trailers if any.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_HTTP_RESPONSE_SIZE = 'http.response.size';

/**
 * Deprecated, use `http.response.header.content-length` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `http.response.header.content-length`.
 */
export const ATTR_HTTP_RESPONSE_CONTENT_LENGTH = 'http.response_content_length';

/**
 * Deprecated, use `http.response.body.size` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replace by `http.response.body.size`.
 */
export const ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = 'http.response_content_length_uncompressed';

/**
 * Deprecated, use `url.scheme` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `url.scheme` instead.
 */
export const ATTR_HTTP_SCHEME = 'http.scheme';

/**
 * Deprecated, use `server.address` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `server.address`.
 */
export const ATTR_HTTP_SERVER_NAME = 'http.server_name';

/**
 * Deprecated, use `http.response.status_code` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `http.response.status_code`.
 */
export const ATTR_HTTP_STATUS_CODE = 'http.status_code';

/**
 * Deprecated, use `url.path` and `url.query` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Split to `url.path` and `url.query.
 */
export const ATTR_HTTP_TARGET = 'http.target';

/**
 * Deprecated, use `url.full` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `url.full`.
 */
export const ATTR_HTTP_URL = 'http.url';

/**
 * Deprecated, use `user_agent.original` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `user_agent.original`.
 */
export const ATTR_HTTP_USER_AGENT = 'http.user_agent';

/**
 * Deprecated use the `device.app.lifecycle` event definition including `ios.state` as a payload field instead.
 *
 * @note The iOS lifecycle states are defined in the [UIApplicationDelegate documentation](https://developer.apple.com/documentation/uikit/uiapplicationdelegate#1656902), and from which the `OS terminology` column values are derived.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Moved to a payload field of `device.app.lifecycle`.
 */
export const ATTR_IOS_STATE = 'ios.state';

/**
  * Enum value "active" for attribute {@link ATTR_IOS_STATE}.
  */
export const ATTR_IOS_STATE_VALUE_ACTIVE = "active";

/**
  * Enum value "background" for attribute {@link ATTR_IOS_STATE}.
  */
export const ATTR_IOS_STATE_VALUE_BACKGROUND = "background";

/**
  * Enum value "foreground" for attribute {@link ATTR_IOS_STATE}.
  */
export const ATTR_IOS_STATE_VALUE_FOREGROUND = "foreground";

/**
  * Enum value "inactive" for attribute {@link ATTR_IOS_STATE}.
  */
export const ATTR_IOS_STATE_VALUE_INACTIVE = "inactive";

/**
  * Enum value "terminate" for attribute {@link ATTR_IOS_STATE}.
  */
export const ATTR_IOS_STATE_VALUE_TERMINATE = "terminate";

/**
 * Name of the buffer pool.
 *
 * @note Pool names are generally obtained via [BufferPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/BufferPoolMXBean.html#getName()).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_JVM_BUFFER_POOL_NAME = 'jvm.buffer.pool.name';

/**
 * The name of the cluster.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CLUSTER_NAME = 'k8s.cluster.name';

/**
 * A pseudo-ID for the cluster, set to the UID of the `kube-system` namespace.
 *
 * @note K8s doesn't have support for obtaining a cluster ID. If this is ever
 * added, we will recommend collecting the `k8s.cluster.uid` through the
 * official APIs. In the meantime, we are able to use the `uid` of the
 * `kube-system` namespace as a proxy for cluster ID. Read on for the
 * rationale.
 * 
 * Every object created in a K8s cluster is assigned a distinct UID. The
 * `kube-system` namespace is used by Kubernetes itself and will exist
 * for the lifetime of the cluster. Using the `uid` of the `kube-system`
 * namespace is a reasonable proxy for the K8s ClusterID as it will only
 * change if the cluster is rebuilt. Furthermore, Kubernetes UIDs are
 * UUIDs as standardized by
 * [ISO/IEC 9834-8 and ITU-T X.667](https://www.itu.int/ITU-T/studygroups/com17/oid.html).
 * Which states:
 * 
 * > If generated according to one of the mechanisms defined in Rec.
 *   ITU-T X.667 | ISO/IEC 9834-8, a UUID is either guaranteed to be
 *   different from all other UUIDs generated before 3603 A.D., or is
 *   extremely likely to be different (depending on the mechanism chosen).
 * 
 * Therefore, UIDs between clusters should be extremely unlikely to
 * conflict.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CLUSTER_UID = 'k8s.cluster.uid';

/**
 * The name of the Container from Pod specification, must be unique within a Pod. Container runtime usually uses different globally unique name (`container.name`).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CONTAINER_NAME = 'k8s.container.name';

/**
 * Number of times the container was restarted. This attribute can be used to identify a particular container (running or stopped) within a container spec.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CONTAINER_RESTART_COUNT = 'k8s.container.restart_count';

/**
 * Last terminated reason of the Container.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CONTAINER_STATUS_LAST_TERMINATED_REASON = 'k8s.container.status.last_terminated_reason';

/**
 * The name of the CronJob.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CRONJOB_NAME = 'k8s.cronjob.name';

/**
 * The UID of the CronJob.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_CRONJOB_UID = 'k8s.cronjob.uid';

/**
 * The name of the DaemonSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DAEMONSET_NAME = 'k8s.daemonset.name';

/**
 * The UID of the DaemonSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DAEMONSET_UID = 'k8s.daemonset.uid';

/**
 * The name of the Deployment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DEPLOYMENT_NAME = 'k8s.deployment.name';

/**
 * The UID of the Deployment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_DEPLOYMENT_UID = 'k8s.deployment.uid';

/**
 * The name of the Job.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_JOB_NAME = 'k8s.job.name';

/**
 * The UID of the Job.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_JOB_UID = 'k8s.job.uid';

/**
 * The name of the namespace that the pod is running in.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NAMESPACE_NAME = 'k8s.namespace.name';

/**
 * The name of the Node.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NODE_NAME = 'k8s.node.name';

/**
 * The UID of the Node.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_NODE_UID = 'k8s.node.uid';

/**
 * The annotation key-value pairs placed on the Pod, the `<key>` being the annotation name, the value being the annotation value.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_POD_ANNOTATION = (key: string) => `k8s.pod.annotation.${key}`;

/**
 * The label key-value pairs placed on the Pod, the `<key>` being the label name, the value being the label value.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_POD_LABEL = (key: string) => `k8s.pod.label.${key}`;

/**
 * Deprecated, use `k8s.pod.label` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `k8s.pod.label`.
 */
export const ATTR_K8S_POD_LABELS = (key: string) => `k8s.pod.labels.${key}`;

/**
 * The name of the Pod.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_POD_NAME = 'k8s.pod.name';

/**
 * The UID of the Pod.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_POD_UID = 'k8s.pod.uid';

/**
 * The name of the ReplicaSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_REPLICASET_NAME = 'k8s.replicaset.name';

/**
 * The UID of the ReplicaSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_REPLICASET_UID = 'k8s.replicaset.uid';

/**
 * The name of the StatefulSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_STATEFULSET_NAME = 'k8s.statefulset.name';

/**
 * The UID of the StatefulSet.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_K8S_STATEFULSET_UID = 'k8s.statefulset.uid';

/**
 * The Linux Slab memory state
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LINUX_MEMORY_SLAB_STATE = 'linux.memory.slab.state';

/**
  * Enum value "reclaimable" for attribute {@link ATTR_LINUX_MEMORY_SLAB_STATE}.
  */
export const ATTR_LINUX_MEMORY_SLAB_STATE_VALUE_RECLAIMABLE = "reclaimable";

/**
  * Enum value "unreclaimable" for attribute {@link ATTR_LINUX_MEMORY_SLAB_STATE}.
  */
export const ATTR_LINUX_MEMORY_SLAB_STATE_VALUE_UNRECLAIMABLE = "unreclaimable";

/**
 * The basename of the file.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_NAME = 'log.file.name';

/**
 * The basename of the file, with symlinks resolved.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_NAME_RESOLVED = 'log.file.name_resolved';

/**
 * The full path to the file.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_PATH = 'log.file.path';

/**
 * The full path to the file, with symlinks resolved.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_FILE_PATH_RESOLVED = 'log.file.path_resolved';

/**
 * The stream associated with the log. See below for a list of well-known values.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_IOSTREAM = 'log.iostream';

/**
  * Enum value "stderr" for attribute {@link ATTR_LOG_IOSTREAM}.
  */
export const ATTR_LOG_IOSTREAM_VALUE_STDERR = "stderr";

/**
  * Enum value "stdout" for attribute {@link ATTR_LOG_IOSTREAM}.
  */
export const ATTR_LOG_IOSTREAM_VALUE_STDOUT = "stdout";

/**
 * The complete orignal Log Record.
 *
 * @note This value **MAY** be added when processing a Log Record which was originally transmitted as a string or equivalent data type AND the Body field of the Log Record does not contain the same value. (e.g. a syslog or a log record read from a file.)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_RECORD_ORIGINAL = 'log.record.original';

/**
 * A unique identifier for the Log Record.
 *
 * @note If an id is provided, other log records with the same id will be considered duplicates and can be removed safely. This means, that two distinguishable log records **MUST** have different values.
 * The id **MAY** be an [Universally Unique Lexicographically Sortable Identifier (ULID)](https://github.com/ulid/spec), but other identifiers (e.g. UUID) may be used as needed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_LOG_RECORD_UID = 'log.record.uid';

/**
 * Deprecated, use `rpc.message.compressed_size` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `rpc.message.compressed_size`.
 */
export const ATTR_MESSAGE_COMPRESSED_SIZE = 'message.compressed_size';

/**
 * Deprecated, use `rpc.message.id` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `rpc.message.id`.
 */
export const ATTR_MESSAGE_ID = 'message.id';

/**
 * Deprecated, use `rpc.message.type` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `rpc.message.type`.
 */
export const ATTR_MESSAGE_TYPE = 'message.type';

/**
  * Enum value "RECEIVED" for attribute {@link ATTR_MESSAGE_TYPE}.
  */
export const ATTR_MESSAGE_TYPE_VALUE_RECEIVED = "RECEIVED";

/**
  * Enum value "SENT" for attribute {@link ATTR_MESSAGE_TYPE}.
  */
export const ATTR_MESSAGE_TYPE_VALUE_SENT = "SENT";

/**
 * Deprecated, use `rpc.message.uncompressed_size` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `rpc.message.uncompressed_size`.
 */
export const ATTR_MESSAGE_UNCOMPRESSED_SIZE = 'message.uncompressed_size';

/**
 * The number of messages sent, received, or processed in the scope of the batching operation.
 *
 * @note Instrumentations **SHOULD** **NOT** set `messaging.batch.message_count` on spans that operate with a single message. When a messaging client library supports both batch and single-message API for the same operation, instrumentations **SHOULD** use `messaging.batch.message_count` for batching APIs and **SHOULD** **NOT** use it for single-message APIs.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_BATCH_MESSAGE_COUNT = 'messaging.batch.message_count';

/**
 * A unique identifier for the client that consumes or produces a message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_CLIENT_ID = 'messaging.client.id';

/**
 * The name of the consumer group with which a consumer is associated.
 *
 * @note Semantic conventions for individual messaging systems **SHOULD** document whether `messaging.consumer.group.name` is applicable and what it means in the context of that system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_CONSUMER_GROUP_NAME = 'messaging.consumer.group.name';

/**
 * A boolean that is true if the message destination is anonymous (could be unnamed or have auto-generated name).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_ANONYMOUS = 'messaging.destination.anonymous';

/**
 * The message destination name
 *
 * @note Destination name **SHOULD** uniquely identify a specific queue, topic or other entity within the broker. If
 * the broker doesn't have such notion, the destination name **SHOULD** uniquely identify the broker.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_NAME = 'messaging.destination.name';

/**
 * The identifier of the partition messages are sent to or received from, unique within the `messaging.destination.name`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_PARTITION_ID = 'messaging.destination.partition.id';

/**
 * The name of the destination subscription from which a message is consumed.
 *
 * @note Semantic conventions for individual messaging systems **SHOULD** document whether `messaging.destination.subscription.name` is applicable and what it means in the context of that system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_SUBSCRIPTION_NAME = 'messaging.destination.subscription.name';

/**
 * Low cardinality representation of the messaging destination name
 *
 * @note Destination names could be constructed from templates. An example would be a destination name involving a user name or product id. Although the destination name in this case is of high cardinality, the underlying template is of low cardinality and can be effectively used for grouping and aggregation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_TEMPLATE = 'messaging.destination.template';

/**
 * A boolean that is true if the message destination is temporary and might not exist anymore after messages are processed.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_DESTINATION_TEMPORARY = 'messaging.destination.temporary';

/**
 * Deprecated, no replacement at this time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * No replacement at this time.
 */
export const ATTR_MESSAGING_DESTINATION_PUBLISH_ANONYMOUS = 'messaging.destination_publish.anonymous';

/**
 * Deprecated, no replacement at this time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * No replacement at this time.
 */
export const ATTR_MESSAGING_DESTINATION_PUBLISH_NAME = 'messaging.destination_publish.name';

/**
 * Deprecated, use `messaging.consumer.group.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `messaging.consumer.group.name`.
 */
export const ATTR_MESSAGING_EVENTHUBS_CONSUMER_GROUP = 'messaging.eventhubs.consumer.group';

/**
 * The UTC epoch seconds at which the message has been accepted and stored in the entity.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_EVENTHUBS_MESSAGE_ENQUEUED_TIME = 'messaging.eventhubs.message.enqueued_time';

/**
 * The ack deadline in seconds set for the modify ack deadline request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_GCP_PUBSUB_MESSAGE_ACK_DEADLINE = 'messaging.gcp_pubsub.message.ack_deadline';

/**
 * The ack id for a given message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_GCP_PUBSUB_MESSAGE_ACK_ID = 'messaging.gcp_pubsub.message.ack_id';

/**
 * The delivery attempt for a given message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_GCP_PUBSUB_MESSAGE_DELIVERY_ATTEMPT = 'messaging.gcp_pubsub.message.delivery_attempt';

/**
 * The ordering key for a given message. If the attribute is not present, the message does not have an ordering key.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_GCP_PUBSUB_MESSAGE_ORDERING_KEY = 'messaging.gcp_pubsub.message.ordering_key';

/**
 * Deprecated, use `messaging.consumer.group.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `messaging.consumer.group.name`.
 */
export const ATTR_MESSAGING_KAFKA_CONSUMER_GROUP = 'messaging.kafka.consumer.group';

/**
 * Deprecated, use `messaging.destination.partition.id` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `messaging.destination.partition.id`.
 */
export const ATTR_MESSAGING_KAFKA_DESTINATION_PARTITION = 'messaging.kafka.destination.partition';

/**
 * Message keys in Kafka are used for grouping alike messages to ensure they're processed on the same partition. They differ from `messaging.message.id` in that they're not unique. If the key is `null`, the attribute **MUST** **NOT** be set.
 *
 * @note If the key type is not string, it's string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don't include its value.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_KEY = 'messaging.kafka.message.key';

/**
 * Deprecated, use `messaging.kafka.offset` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `messaging.kafka.offset`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_OFFSET = 'messaging.kafka.message.offset';

/**
 * A boolean that is true if the message is a tombstone.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = 'messaging.kafka.message.tombstone';

/**
 * The offset of a record in the corresponding Kafka partition.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_KAFKA_OFFSET = 'messaging.kafka.offset';

/**
 * The size of the message body in bytes.
 *
 * @note This can refer to both the compressed or uncompressed body size. If both sizes are known, the uncompressed
 * body size should be used.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_BODY_SIZE = 'messaging.message.body.size';

/**
 * The conversation ID identifying the conversation to which the message belongs, represented as a string. Sometimes called "Correlation ID".
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_CONVERSATION_ID = 'messaging.message.conversation_id';

/**
 * The size of the message body and metadata in bytes.
 *
 * @note This can refer to both the compressed or uncompressed size. If both sizes are known, the uncompressed
 * size should be used.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_ENVELOPE_SIZE = 'messaging.message.envelope.size';

/**
 * A value used by the messaging system as an identifier for the message, represented as a string.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_MESSAGE_ID = 'messaging.message.id';

/**
 * Deprecated, use `messaging.operation.type` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `messaging.operation.type`.
 */
export const ATTR_MESSAGING_OPERATION = 'messaging.operation';

/**
 * The system-specific name of the messaging operation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_OPERATION_NAME = 'messaging.operation.name';

/**
 * A string identifying the type of the messaging operation.
 *
 * @note If a custom value is used, it **MUST** be of low cardinality.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_OPERATION_TYPE = 'messaging.operation.type';

/**
  * Enum value "create" for attribute {@link ATTR_MESSAGING_OPERATION_TYPE}.
  */
export const ATTR_MESSAGING_OPERATION_TYPE_VALUE_CREATE = "create";

/**
  * Enum value "deliver" for attribute {@link ATTR_MESSAGING_OPERATION_TYPE}.
  */
export const ATTR_MESSAGING_OPERATION_TYPE_VALUE_DELIVER = "deliver";

/**
  * Enum value "process" for attribute {@link ATTR_MESSAGING_OPERATION_TYPE}.
  */
export const ATTR_MESSAGING_OPERATION_TYPE_VALUE_PROCESS = "process";

/**
  * Enum value "publish" for attribute {@link ATTR_MESSAGING_OPERATION_TYPE}.
  */
export const ATTR_MESSAGING_OPERATION_TYPE_VALUE_PUBLISH = "publish";

/**
  * Enum value "receive" for attribute {@link ATTR_MESSAGING_OPERATION_TYPE}.
  */
export const ATTR_MESSAGING_OPERATION_TYPE_VALUE_RECEIVE = "receive";

/**
  * Enum value "settle" for attribute {@link ATTR_MESSAGING_OPERATION_TYPE}.
  */
export const ATTR_MESSAGING_OPERATION_TYPE_VALUE_SETTLE = "settle";

/**
 * RabbitMQ message routing key.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY = 'messaging.rabbitmq.destination.routing_key';

/**
 * RabbitMQ message delivery tag
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_RABBITMQ_MESSAGE_DELIVERY_TAG = 'messaging.rabbitmq.message.delivery_tag';

/**
 * Deprecated, use `messaging.consumer.group.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `messaging.consumer.group.name` on the consumer spans. No replacement for producer spans.
 */
export const ATTR_MESSAGING_ROCKETMQ_CLIENT_GROUP = 'messaging.rocketmq.client_group';

/**
 * Model of message consumption. This only applies to consumer spans.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL = 'messaging.rocketmq.consumption_model';

/**
  * Enum value "broadcasting" for attribute {@link ATTR_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL}.
  */
export const ATTR_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL_VALUE_BROADCASTING = "broadcasting";

/**
  * Enum value "clustering" for attribute {@link ATTR_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL}.
  */
export const ATTR_MESSAGING_ROCKETMQ_CONSUMPTION_MODEL_VALUE_CLUSTERING = "clustering";

/**
 * The delay time level for delay message, which determines the message delay time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_DELAY_TIME_LEVEL = 'messaging.rocketmq.message.delay_time_level';

/**
 * The timestamp in milliseconds that the delay message is expected to be delivered to consumer.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_DELIVERY_TIMESTAMP = 'messaging.rocketmq.message.delivery_timestamp';

/**
 * It is essential for FIFO message. Messages that belong to the same message group are always processed one by one within the same consumer group.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_GROUP = 'messaging.rocketmq.message.group';

/**
 * Key(s) of message, another way to mark message besides message id.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_KEYS = 'messaging.rocketmq.message.keys';

/**
 * The secondary classifier of message besides topic.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TAG = 'messaging.rocketmq.message.tag';

/**
 * Type of message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE = 'messaging.rocketmq.message.type';

/**
  * Enum value "delay" for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
  */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_DELAY = "delay";

/**
  * Enum value "fifo" for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
  */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_FIFO = "fifo";

/**
  * Enum value "normal" for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
  */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_NORMAL = "normal";

/**
  * Enum value "transaction" for attribute {@link ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE}.
  */
export const ATTR_MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_TRANSACTION = "transaction";

/**
 * Namespace of RocketMQ resources, resources in different namespaces are individual.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_ROCKETMQ_NAMESPACE = 'messaging.rocketmq.namespace';

/**
 * Deprecated, use `messaging.servicebus.destination.subscription_name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `messaging.servicebus.destination.subscription_name`.
 */
export const ATTR_MESSAGING_SERVICEBUS_DESTINATION_SUBSCRIPTION_NAME = 'messaging.servicebus.destination.subscription_name';

/**
 * Describes the [settlement type](https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS = 'messaging.servicebus.disposition_status';

/**
  * Enum value "abandon" for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS}.
  */
export const ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS_VALUE_ABANDON = "abandon";

/**
  * Enum value "complete" for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS}.
  */
export const ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS_VALUE_COMPLETE = "complete";

/**
  * Enum value "dead_letter" for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS}.
  */
export const ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS_VALUE_DEAD_LETTER = "dead_letter";

/**
  * Enum value "defer" for attribute {@link ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS}.
  */
export const ATTR_MESSAGING_SERVICEBUS_DISPOSITION_STATUS_VALUE_DEFER = "defer";

/**
 * Number of deliveries that have been attempted for this message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_MESSAGE_DELIVERY_COUNT = 'messaging.servicebus.message.delivery_count';

/**
 * The UTC epoch seconds at which the message has been accepted and stored in the entity.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SERVICEBUS_MESSAGE_ENQUEUED_TIME = 'messaging.servicebus.message.enqueued_time';

/**
 * The messaging system as identified by the client instrumentation.
 *
 * @note The actual messaging system may differ from the one known by the client. For example, when using Kafka client libraries to communicate with Azure Event Hubs, the `messaging.system` is set to `kafka` based on the instrumentation's best knowledge.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_MESSAGING_SYSTEM = 'messaging.system';

/**
  * Enum value "activemq" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_ACTIVEMQ = "activemq";

/**
  * Enum value "aws_sqs" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_AWS_SQS = "aws_sqs";

/**
  * Enum value "eventgrid" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_EVENTGRID = "eventgrid";

/**
  * Enum value "eventhubs" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_EVENTHUBS = "eventhubs";

/**
  * Enum value "gcp_pubsub" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_GCP_PUBSUB = "gcp_pubsub";

/**
  * Enum value "jms" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_JMS = "jms";

/**
  * Enum value "kafka" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_KAFKA = "kafka";

/**
  * Enum value "pulsar" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_PULSAR = "pulsar";

/**
  * Enum value "rabbitmq" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_RABBITMQ = "rabbitmq";

/**
  * Enum value "rocketmq" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_ROCKETMQ = "rocketmq";

/**
  * Enum value "servicebus" for attribute {@link ATTR_MESSAGING_SYSTEM}.
  */
export const ATTR_MESSAGING_SYSTEM_VALUE_SERVICEBUS = "servicebus";

/**
 * Deprecated, use `network.local.address`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.local.address`.
 */
export const ATTR_NET_HOST_IP = 'net.host.ip';

/**
 * Deprecated, use `server.address`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `server.address`.
 */
export const ATTR_NET_HOST_NAME = 'net.host.name';

/**
 * Deprecated, use `server.port`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `server.port`.
 */
export const ATTR_NET_HOST_PORT = 'net.host.port';

/**
 * Deprecated, use `network.peer.address`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.peer.address`.
 */
export const ATTR_NET_PEER_IP = 'net.peer.ip';

/**
 * Deprecated, use `server.address` on client spans and `client.address` on server spans.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `server.address` on client spans and `client.address` on server spans.
 */
export const ATTR_NET_PEER_NAME = 'net.peer.name';

/**
 * Deprecated, use `server.port` on client spans and `client.port` on server spans.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `server.port` on client spans and `client.port` on server spans.
 */
export const ATTR_NET_PEER_PORT = 'net.peer.port';

/**
 * Deprecated, use `network.protocol.name`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.protocol.name`.
 */
export const ATTR_NET_PROTOCOL_NAME = 'net.protocol.name';

/**
 * Deprecated, use `network.protocol.version`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.protocol.version`.
 */
export const ATTR_NET_PROTOCOL_VERSION = 'net.protocol.version';

/**
 * Deprecated, use `network.transport` and `network.type`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Split to `network.transport` and `network.type`.
 */
export const ATTR_NET_SOCK_FAMILY = 'net.sock.family';

/**
  * Enum value "inet" for attribute {@link ATTR_NET_SOCK_FAMILY}.
  */
export const ATTR_NET_SOCK_FAMILY_VALUE_INET = "inet";

/**
  * Enum value "inet6" for attribute {@link ATTR_NET_SOCK_FAMILY}.
  */
export const ATTR_NET_SOCK_FAMILY_VALUE_INET6 = "inet6";

/**
  * Enum value "unix" for attribute {@link ATTR_NET_SOCK_FAMILY}.
  */
export const ATTR_NET_SOCK_FAMILY_VALUE_UNIX = "unix";

/**
 * Deprecated, use `network.local.address`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.local.address`.
 */
export const ATTR_NET_SOCK_HOST_ADDR = 'net.sock.host.addr';

/**
 * Deprecated, use `network.local.port`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.local.port`.
 */
export const ATTR_NET_SOCK_HOST_PORT = 'net.sock.host.port';

/**
 * Deprecated, use `network.peer.address`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.peer.address`.
 */
export const ATTR_NET_SOCK_PEER_ADDR = 'net.sock.peer.addr';

/**
 * Deprecated, no replacement at this time.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Removed.
 */
export const ATTR_NET_SOCK_PEER_NAME = 'net.sock.peer.name';

/**
 * Deprecated, use `network.peer.port`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.peer.port`.
 */
export const ATTR_NET_SOCK_PEER_PORT = 'net.sock.peer.port';

/**
 * Deprecated, use `network.transport`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `network.transport`.
 */
export const ATTR_NET_TRANSPORT = 'net.transport';

/**
  * Enum value "inproc" for attribute {@link ATTR_NET_TRANSPORT}.
  */
export const ATTR_NET_TRANSPORT_VALUE_INPROC = "inproc";

/**
  * Enum value "ip_tcp" for attribute {@link ATTR_NET_TRANSPORT}.
  */
export const ATTR_NET_TRANSPORT_VALUE_IP_TCP = "ip_tcp";

/**
  * Enum value "ip_udp" for attribute {@link ATTR_NET_TRANSPORT}.
  */
export const ATTR_NET_TRANSPORT_VALUE_IP_UDP = "ip_udp";

/**
  * Enum value "other" for attribute {@link ATTR_NET_TRANSPORT}.
  */
export const ATTR_NET_TRANSPORT_VALUE_OTHER = "other";

/**
  * Enum value "pipe" for attribute {@link ATTR_NET_TRANSPORT}.
  */
export const ATTR_NET_TRANSPORT_VALUE_PIPE = "pipe";

/**
 * The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_ICC = 'network.carrier.icc';

/**
 * The mobile carrier country code.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_MCC = 'network.carrier.mcc';

/**
 * The mobile carrier network code.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_MNC = 'network.carrier.mnc';

/**
 * The name of the mobile carrier.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CARRIER_NAME = 'network.carrier.name';

/**
 * This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CONNECTION_SUBTYPE = 'network.connection.subtype';

/**
  * Enum value "cdma" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_CDMA = "cdma";

/**
  * Enum value "cdma2000_1xrtt" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_CDMA2000_1XRTT = "cdma2000_1xrtt";

/**
  * Enum value "edge" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_EDGE = "edge";

/**
  * Enum value "ehrpd" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_EHRPD = "ehrpd";

/**
  * Enum value "evdo_0" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_0 = "evdo_0";

/**
  * Enum value "evdo_a" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_A = "evdo_a";

/**
  * Enum value "evdo_b" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_B = "evdo_b";

/**
  * Enum value "gprs" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_GPRS = "gprs";

/**
  * Enum value "gsm" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_GSM = "gsm";

/**
  * Enum value "hsdpa" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_HSDPA = "hsdpa";

/**
  * Enum value "hspa" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_HSPA = "hspa";

/**
  * Enum value "hspap" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_HSPAP = "hspap";

/**
  * Enum value "hsupa" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_HSUPA = "hsupa";

/**
  * Enum value "iden" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_IDEN = "iden";

/**
  * Enum value "iwlan" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_IWLAN = "iwlan";

/**
  * Enum value "lte" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_LTE = "lte";

/**
  * Enum value "lte_ca" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_LTE_CA = "lte_ca";

/**
  * Enum value "nr" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_NR = "nr";

/**
  * Enum value "nrnsa" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_NRNSA = "nrnsa";

/**
  * Enum value "td_scdma" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_TD_SCDMA = "td_scdma";

/**
  * Enum value "umts" for attribute {@link ATTR_NETWORK_CONNECTION_SUBTYPE}.
  */
export const ATTR_NETWORK_CONNECTION_SUBTYPE_VALUE_UMTS = "umts";

/**
 * The internet connection type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_CONNECTION_TYPE = 'network.connection.type';

/**
  * Enum value "cell" for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
  */
export const ATTR_NETWORK_CONNECTION_TYPE_VALUE_CELL = "cell";

/**
  * Enum value "unavailable" for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
  */
export const ATTR_NETWORK_CONNECTION_TYPE_VALUE_UNAVAILABLE = "unavailable";

/**
  * Enum value "unknown" for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
  */
export const ATTR_NETWORK_CONNECTION_TYPE_VALUE_UNKNOWN = "unknown";

/**
  * Enum value "wifi" for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
  */
export const ATTR_NETWORK_CONNECTION_TYPE_VALUE_WIFI = "wifi";

/**
  * Enum value "wired" for attribute {@link ATTR_NETWORK_CONNECTION_TYPE}.
  */
export const ATTR_NETWORK_CONNECTION_TYPE_VALUE_WIRED = "wired";

/**
 * The network IO operation direction.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_NETWORK_IO_DIRECTION = 'network.io.direction';

/**
  * Enum value "receive" for attribute {@link ATTR_NETWORK_IO_DIRECTION}.
  */
export const ATTR_NETWORK_IO_DIRECTION_VALUE_RECEIVE = "receive";

/**
  * Enum value "transmit" for attribute {@link ATTR_NETWORK_IO_DIRECTION}.
  */
export const ATTR_NETWORK_IO_DIRECTION_VALUE_TRANSMIT = "transmit";

/**
 * The digest of the OCI image manifest. For container images specifically is the digest by which the container image is known.
 *
 * @note Follows [OCI Image Manifest Specification](https://github.com/opencontainers/image-spec/blob/main/manifest.md), and specifically the [Digest property](https://github.com/opencontainers/image-spec/blob/main/descriptor.md#digests).
 * An example can be found in [Example Image Manifest](https://docs.docker.com/registry/spec/manifest-v2-2/#example-image-manifest).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OCI_MANIFEST_DIGEST = 'oci.manifest.digest';

/**
 * Parent-child Reference type
 *
 * @note The causal relationship between a child Span and a parent Span.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OPENTRACING_REF_TYPE = 'opentracing.ref_type';

/**
  * Enum value "child_of" for attribute {@link ATTR_OPENTRACING_REF_TYPE}.
  */
export const ATTR_OPENTRACING_REF_TYPE_VALUE_CHILD_OF = "child_of";

/**
  * Enum value "follows_from" for attribute {@link ATTR_OPENTRACING_REF_TYPE}.
  */
export const ATTR_OPENTRACING_REF_TYPE_VALUE_FOLLOWS_FROM = "follows_from";

/**
 * Unique identifier for a particular build or compilation of the operating system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_BUILD_ID = 'os.build_id';

/**
 * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_DESCRIPTION = 'os.description';

/**
 * Human readable operating system name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_NAME = 'os.name';

/**
 * The operating system type.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_TYPE = 'os.type';

/**
  * Enum value "aix" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_AIX = "aix";

/**
  * Enum value "darwin" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_DARWIN = "darwin";

/**
  * Enum value "dragonflybsd" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_DRAGONFLYBSD = "dragonflybsd";

/**
  * Enum value "freebsd" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_FREEBSD = "freebsd";

/**
  * Enum value "hpux" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_HPUX = "hpux";

/**
  * Enum value "linux" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_LINUX = "linux";

/**
  * Enum value "netbsd" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_NETBSD = "netbsd";

/**
  * Enum value "openbsd" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_OPENBSD = "openbsd";

/**
  * Enum value "solaris" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_SOLARIS = "solaris";

/**
  * Enum value "windows" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_WINDOWS = "windows";

/**
  * Enum value "z_os" for attribute {@link ATTR_OS_TYPE}.
  */
export const ATTR_OS_TYPE_VALUE_Z_OS = "z_os";

/**
 * The version string of the operating system as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_OS_VERSION = 'os.version';

/**

 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * use the `otel.scope.name` attribute.
 */
export const ATTR_OTEL_LIBRARY_NAME = 'otel.library.name';

/**

 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * use the `otel.scope.version` attribute.
 */
export const ATTR_OTEL_LIBRARY_VERSION = 'otel.library.version';

/**
 * The [`service.name`](/docs/resource/README.md#service) of the remote service. **SHOULD** be equal to the actual `service.name` resource attribute of the remote service if any.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PEER_SERVICE = 'peer.service';

/**
 * Deprecated, use `db.client.connection.pool.name` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.client.connection.pool.name`.
 */
export const ATTR_POOL_NAME = 'pool.name';

/**
 * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMAND = 'process.command';

/**
 * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMAND_ARGS = 'process.command_args';

/**
 * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_COMMAND_LINE = 'process.command_line';

/**
 * Specifies whether the context switches for this data point were voluntary or involuntary.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_CONTEXT_SWITCH_TYPE = 'process.context_switch_type';

/**
  * Enum value "involuntary" for attribute {@link ATTR_PROCESS_CONTEXT_SWITCH_TYPE}.
  */
export const ATTR_PROCESS_CONTEXT_SWITCH_TYPE_VALUE_INVOLUNTARY = "involuntary";

/**
  * Enum value "voluntary" for attribute {@link ATTR_PROCESS_CONTEXT_SWITCH_TYPE}.
  */
export const ATTR_PROCESS_CONTEXT_SWITCH_TYPE_VALUE_VOLUNTARY = "voluntary";

/**
 * Deprecated, use `cpu.mode` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `cpu.mode`
 */
export const ATTR_PROCESS_CPU_STATE = 'process.cpu.state';

/**
  * Enum value "system" for attribute {@link ATTR_PROCESS_CPU_STATE}.
  */
export const ATTR_PROCESS_CPU_STATE_VALUE_SYSTEM = "system";

/**
  * Enum value "user" for attribute {@link ATTR_PROCESS_CPU_STATE}.
  */
export const ATTR_PROCESS_CPU_STATE_VALUE_USER = "user";

/**
  * Enum value "wait" for attribute {@link ATTR_PROCESS_CPU_STATE}.
  */
export const ATTR_PROCESS_CPU_STATE_VALUE_WAIT = "wait";

/**
 * The date and time the process was created, in ISO 8601 format.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_CREATION_TIME = 'process.creation.time';

/**
 * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_EXECUTABLE_NAME = 'process.executable.name';

/**
 * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_EXECUTABLE_PATH = 'process.executable.path';

/**
 * The exit code of the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_EXIT_CODE = 'process.exit.code';

/**
 * The date and time the process exited, in ISO 8601 format.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_EXIT_TIME = 'process.exit.time';

/**
 * The PID of the process's group leader. This is also the process group ID (PGID) of the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_GROUP_LEADER_PID = 'process.group_leader.pid';

/**
 * Whether the process is connected to an interactive shell.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_INTERACTIVE = 'process.interactive';

/**
 * The username of the user that owns the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_OWNER = 'process.owner';

/**
 * The type of page fault for this data point. Type `major` is for major/hard page faults, and `minor` is for minor/soft page faults.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PAGING_FAULT_TYPE = 'process.paging.fault_type';

/**
  * Enum value "major" for attribute {@link ATTR_PROCESS_PAGING_FAULT_TYPE}.
  */
export const ATTR_PROCESS_PAGING_FAULT_TYPE_VALUE_MAJOR = "major";

/**
  * Enum value "minor" for attribute {@link ATTR_PROCESS_PAGING_FAULT_TYPE}.
  */
export const ATTR_PROCESS_PAGING_FAULT_TYPE_VALUE_MINOR = "minor";

/**
 * Parent Process identifier (PPID).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PARENT_PID = 'process.parent_pid';

/**
 * Process identifier (PID).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_PID = 'process.pid';

/**
 * The real user ID (RUID) of the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_REAL_USER_ID = 'process.real_user.id';

/**
 * The username of the real user of the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_REAL_USER_NAME = 'process.real_user.name';

/**
 * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_DESCRIPTION = 'process.runtime.description';

/**
 * The name of the runtime of this process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_NAME = 'process.runtime.name';

/**
 * The version of the runtime of this process, as returned by the runtime without modification.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_RUNTIME_VERSION = 'process.runtime.version';

/**
 * The saved user ID (SUID) of the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_SAVED_USER_ID = 'process.saved_user.id';

/**
 * The username of the saved user.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_SAVED_USER_NAME = 'process.saved_user.name';

/**
 * The PID of the process's session leader. This is also the session ID (SID) of the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_SESSION_LEADER_PID = 'process.session_leader.pid';

/**
 * The effective user ID (EUID) of the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_USER_ID = 'process.user.id';

/**
 * The username of the effective user of the process.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_USER_NAME = 'process.user.name';

/**
 * Virtual process identifier.
 *
 * @note The process ID within a PID namespace. This is not necessarily unique across all processes on the host but it is unique within the process namespace that the process exists within.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_PROCESS_VPID = 'process.vpid';

/**
 * The [error codes](https://connect.build/docs/protocol/#error-codes) of the Connect request. Error codes are always string values.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE = 'rpc.connect_rpc.error_code';

/**
  * Enum value "aborted" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_ABORTED = "aborted";

/**
  * Enum value "already_exists" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_ALREADY_EXISTS = "already_exists";

/**
  * Enum value "cancelled" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_CANCELLED = "cancelled";

/**
  * Enum value "data_loss" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_DATA_LOSS = "data_loss";

/**
  * Enum value "deadline_exceeded" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_DEADLINE_EXCEEDED = "deadline_exceeded";

/**
  * Enum value "failed_precondition" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_FAILED_PRECONDITION = "failed_precondition";

/**
  * Enum value "internal" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_INTERNAL = "internal";

/**
  * Enum value "invalid_argument" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_INVALID_ARGUMENT = "invalid_argument";

/**
  * Enum value "not_found" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_NOT_FOUND = "not_found";

/**
  * Enum value "out_of_range" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_OUT_OF_RANGE = "out_of_range";

/**
  * Enum value "permission_denied" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_PERMISSION_DENIED = "permission_denied";

/**
  * Enum value "resource_exhausted" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_RESOURCE_EXHAUSTED = "resource_exhausted";

/**
  * Enum value "unauthenticated" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_UNAUTHENTICATED = "unauthenticated";

/**
  * Enum value "unavailable" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_UNAVAILABLE = "unavailable";

/**
  * Enum value "unimplemented" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_UNIMPLEMENTED = "unimplemented";

/**
  * Enum value "unknown" for attribute {@link ATTR_RPC_CONNECT_RPC_ERROR_CODE}.
  */
export const ATTR_RPC_CONNECT_RPC_ERROR_CODE_VALUE_UNKNOWN = "unknown";

/**
 * Connect request metadata, `<key>` being the normalized Connect Metadata key (lowercase), the value being the metadata values.
 *
 * @note Instrumentations **SHOULD** require an explicit configuration of which metadata values are to be captured. Including all request metadata values can be a security risk - explicit configuration helps avoid leaking sensitive information.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_CONNECT_RPC_REQUEST_METADATA = (key: string) => `rpc.connect_rpc.request.metadata.${key}`;

/**
 * Connect response metadata, `<key>` being the normalized Connect Metadata key (lowercase), the value being the metadata values.
 *
 * @note Instrumentations **SHOULD** require an explicit configuration of which metadata values are to be captured. Including all response metadata values can be a security risk - explicit configuration helps avoid leaking sensitive information.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_CONNECT_RPC_RESPONSE_METADATA = (key: string) => `rpc.connect_rpc.response.metadata.${key}`;

/**
 * gRPC request metadata, `<key>` being the normalized gRPC Metadata key (lowercase), the value being the metadata values.
 *
 * @note Instrumentations **SHOULD** require an explicit configuration of which metadata values are to be captured. Including all request metadata values can be a security risk - explicit configuration helps avoid leaking sensitive information.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_GRPC_REQUEST_METADATA = (key: string) => `rpc.grpc.request.metadata.${key}`;

/**
 * gRPC response metadata, `<key>` being the normalized gRPC Metadata key (lowercase), the value being the metadata values.
 *
 * @note Instrumentations **SHOULD** require an explicit configuration of which metadata values are to be captured. Including all response metadata values can be a security risk - explicit configuration helps avoid leaking sensitive information.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_GRPC_RESPONSE_METADATA = (key: string) => `rpc.grpc.response.metadata.${key}`;

/**
 * The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_GRPC_STATUS_CODE = 'rpc.grpc.status_code';

/**
  * Enum value 0 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_OK = 0;

/**
  * Enum value 1 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_CANCELLED = 1;

/**
  * Enum value 2 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_UNKNOWN = 2;

/**
  * Enum value 3 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_INVALID_ARGUMENT = 3;

/**
  * Enum value 4 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_DEADLINE_EXCEEDED = 4;

/**
  * Enum value 5 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_NOT_FOUND = 5;

/**
  * Enum value 6 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_ALREADY_EXISTS = 6;

/**
  * Enum value 7 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_PERMISSION_DENIED = 7;

/**
  * Enum value 8 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_RESOURCE_EXHAUSTED = 8;

/**
  * Enum value 9 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_FAILED_PRECONDITION = 9;

/**
  * Enum value 10 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_ABORTED = 10;

/**
  * Enum value 11 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_OUT_OF_RANGE = 11;

/**
  * Enum value 12 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_UNIMPLEMENTED = 12;

/**
  * Enum value 13 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_INTERNAL = 13;

/**
  * Enum value 14 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_UNAVAILABLE = 14;

/**
  * Enum value 15 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_DATA_LOSS = 15;

/**
  * Enum value 16 for attribute {@link ATTR_RPC_GRPC_STATUS_CODE}.
  */
export const ATTR_RPC_GRPC_STATUS_CODE_VALUE_UNAUTHENTICATED = 16;

/**
 * `error.code` property of response if it is an error response.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_ERROR_CODE = 'rpc.jsonrpc.error_code';

/**
 * `error.message` property of response if it is an error response.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_ERROR_MESSAGE = 'rpc.jsonrpc.error_message';

/**
 * `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_REQUEST_ID = 'rpc.jsonrpc.request_id';

/**
 * Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 doesn't specify this, the value can be omitted.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_JSONRPC_VERSION = 'rpc.jsonrpc.version';

/**
 * Compressed size of the message in bytes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_MESSAGE_COMPRESSED_SIZE = 'rpc.message.compressed_size';

/**
 * **MUST** be calculated as two different counters starting from `1` one for sent messages and one for received message.
 *
 * @note This way we guarantee that the values will be consistent between different implementations.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_MESSAGE_ID = 'rpc.message.id';

/**
 * Whether this is a received or sent message.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_MESSAGE_TYPE = 'rpc.message.type';

/**
  * Enum value "RECEIVED" for attribute {@link ATTR_RPC_MESSAGE_TYPE}.
  */
export const ATTR_RPC_MESSAGE_TYPE_VALUE_RECEIVED = "RECEIVED";

/**
  * Enum value "SENT" for attribute {@link ATTR_RPC_MESSAGE_TYPE}.
  */
export const ATTR_RPC_MESSAGE_TYPE_VALUE_SENT = "SENT";

/**
 * Uncompressed size of the message in bytes.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_MESSAGE_UNCOMPRESSED_SIZE = 'rpc.message.uncompressed_size';

/**
 * The name of the (logical) method being called, must be equal to the $method part in the span name.
 *
 * @note This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_METHOD = 'rpc.method';

/**
 * The full (logical) name of the service being called, including its package name, if applicable.
 *
 * @note This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_SERVICE = 'rpc.service';

/**
 * A string identifying the remoting system. See below for a list of well-known identifiers.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_RPC_SYSTEM = 'rpc.system';

/**
  * Enum value "apache_dubbo" for attribute {@link ATTR_RPC_SYSTEM}.
  */
export const ATTR_RPC_SYSTEM_VALUE_APACHE_DUBBO = "apache_dubbo";

/**
  * Enum value "connect_rpc" for attribute {@link ATTR_RPC_SYSTEM}.
  */
export const ATTR_RPC_SYSTEM_VALUE_CONNECT_RPC = "connect_rpc";

/**
  * Enum value "dotnet_wcf" for attribute {@link ATTR_RPC_SYSTEM}.
  */
export const ATTR_RPC_SYSTEM_VALUE_DOTNET_WCF = "dotnet_wcf";

/**
  * Enum value "grpc" for attribute {@link ATTR_RPC_SYSTEM}.
  */
export const ATTR_RPC_SYSTEM_VALUE_GRPC = "grpc";

/**
  * Enum value "java_rmi" for attribute {@link ATTR_RPC_SYSTEM}.
  */
export const ATTR_RPC_SYSTEM_VALUE_JAVA_RMI = "java_rmi";

/**
 * The string ID of the service instance.
 *
 * @note MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words
 * `service.namespace,service.name,service.instance.id` triplet **MUST** be globally unique). The ID helps to
 * distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled
 * service).
 * 
 * Implementations, such as SDKs, are recommended to generate a random Version 1 or Version 4 [RFC
 * 4122](https://www.ietf.org/rfc/rfc4122.txt) UUID, but are free to use an inherent unique ID as the source of
 * this value if stability is desirable. In that case, the ID **SHOULD** be used as source of a UUID Version 5 and
 * SHOULD use the following UUID as the namespace: `4d63009a-8d0f-11ee-aad7-4c796ed8e320`.
 * 
 * UUIDs are typically recommended, as only an opaque value for the purposes of identifying a service instance is
 * needed. Similar to what can be seen in the man page for the
 * [`/etc/machine-id`](https://www.freedesktop.org/software/systemd/man/machine-id.html) file, the underlying
 * data, such as pod name and namespace should be treated as confidential, being the user's choice to expose it
 * or not via another resource attribute.
 * 
 * For applications running behind an application server (like unicorn), we do not recommend using one identifier
 * for all processes participating in the application. Instead, it's recommended each division (e.g. a worker
 * thread in unicorn) to have its own instance.id.
 * 
 * It's not recommended for a Collector to set `service.instance.id` if it can't unambiguously determine the
 * service instance that is generating that telemetry. For instance, creating an UUID based on `pod.name` will
 * likely be wrong, as the Collector might not know from which container within that pod the telemetry originated.
 * However, Collectors can set the `service.instance.id` if they can unambiguously determine the service instance
 * for that telemetry. This is typically the case for scraping receivers, as they know the target address and
 * port.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SERVICE_INSTANCE_ID = 'service.instance.id';

/**
 * A namespace for `service.name`.
 *
 * @note A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SERVICE_NAMESPACE = 'service.namespace';

/**
 * A unique id to identify a session.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SESSION_ID = 'session.id';

/**
 * The previous `session.id` for this user, when known.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SESSION_PREVIOUS_ID = 'session.previous_id';

/**
 * Source address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
 *
 * @note When observed from the destination side, and when communicating through an intermediary, `source.address` **SHOULD** represent the source address behind any intermediaries, for example proxies, if it's available.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SOURCE_ADDRESS = 'source.address';

/**
 * Source port number
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SOURCE_PORT = 'source.port';

/**
 * Deprecated, use `db.client.connection.state` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `db.client.connection.state`.
 */
export const ATTR_STATE = 'state';

/**
  * Enum value "idle" for attribute {@link ATTR_STATE}.
  */
export const ATTR_STATE_VALUE_IDLE = "idle";

/**
  * Enum value "used" for attribute {@link ATTR_STATE}.
  */
export const ATTR_STATE_VALUE_USED = "used";

/**
 * The logical CPU number [0..n-1]
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_CPU_LOGICAL_NUMBER = 'system.cpu.logical_number';

/**
 * Deprecated, use `cpu.mode` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `cpu.mode`
 */
export const ATTR_SYSTEM_CPU_STATE = 'system.cpu.state';

/**
  * Enum value "idle" for attribute {@link ATTR_SYSTEM_CPU_STATE}.
  */
export const ATTR_SYSTEM_CPU_STATE_VALUE_IDLE = "idle";

/**
  * Enum value "interrupt" for attribute {@link ATTR_SYSTEM_CPU_STATE}.
  */
export const ATTR_SYSTEM_CPU_STATE_VALUE_INTERRUPT = "interrupt";

/**
  * Enum value "iowait" for attribute {@link ATTR_SYSTEM_CPU_STATE}.
  */
export const ATTR_SYSTEM_CPU_STATE_VALUE_IOWAIT = "iowait";

/**
  * Enum value "nice" for attribute {@link ATTR_SYSTEM_CPU_STATE}.
  */
export const ATTR_SYSTEM_CPU_STATE_VALUE_NICE = "nice";

/**
  * Enum value "steal" for attribute {@link ATTR_SYSTEM_CPU_STATE}.
  */
export const ATTR_SYSTEM_CPU_STATE_VALUE_STEAL = "steal";

/**
  * Enum value "system" for attribute {@link ATTR_SYSTEM_CPU_STATE}.
  */
export const ATTR_SYSTEM_CPU_STATE_VALUE_SYSTEM = "system";

/**
  * Enum value "user" for attribute {@link ATTR_SYSTEM_CPU_STATE}.
  */
export const ATTR_SYSTEM_CPU_STATE_VALUE_USER = "user";

/**
 * The device identifier
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_DEVICE = 'system.device';

/**
 * The filesystem mode
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_MODE = 'system.filesystem.mode';

/**
 * The filesystem mount path
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_MOUNTPOINT = 'system.filesystem.mountpoint';

/**
 * The filesystem state
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_STATE = 'system.filesystem.state';

/**
  * Enum value "free" for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_STATE_VALUE_FREE = "free";

/**
  * Enum value "reserved" for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_STATE_VALUE_RESERVED = "reserved";

/**
  * Enum value "used" for attribute {@link ATTR_SYSTEM_FILESYSTEM_STATE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_STATE_VALUE_USED = "used";

/**
 * The filesystem type
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_FILESYSTEM_TYPE = 'system.filesystem.type';

/**
  * Enum value "exfat" for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_TYPE_VALUE_EXFAT = "exfat";

/**
  * Enum value "ext4" for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_TYPE_VALUE_EXT4 = "ext4";

/**
  * Enum value "fat32" for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_TYPE_VALUE_FAT32 = "fat32";

/**
  * Enum value "hfsplus" for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_TYPE_VALUE_HFSPLUS = "hfsplus";

/**
  * Enum value "ntfs" for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_TYPE_VALUE_NTFS = "ntfs";

/**
  * Enum value "refs" for attribute {@link ATTR_SYSTEM_FILESYSTEM_TYPE}.
  */
export const ATTR_SYSTEM_FILESYSTEM_TYPE_VALUE_REFS = "refs";

/**
 * The memory state
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_MEMORY_STATE = 'system.memory.state';

/**
  * Enum value "buffers" for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
  */
export const ATTR_SYSTEM_MEMORY_STATE_VALUE_BUFFERS = "buffers";

/**
  * Enum value "cached" for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
  */
export const ATTR_SYSTEM_MEMORY_STATE_VALUE_CACHED = "cached";

/**
  * Enum value "free" for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
  */
export const ATTR_SYSTEM_MEMORY_STATE_VALUE_FREE = "free";

/**
  * Enum value "shared" for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
  */
export const ATTR_SYSTEM_MEMORY_STATE_VALUE_SHARED = "shared";

/**
  * Enum value "used" for attribute {@link ATTR_SYSTEM_MEMORY_STATE}.
  */
export const ATTR_SYSTEM_MEMORY_STATE_VALUE_USED = "used";

/**
 * A stateless protocol **MUST** **NOT** set this attribute
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_NETWORK_STATE = 'system.network.state';

/**
  * Enum value "close" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_CLOSE = "close";

/**
  * Enum value "close_wait" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_CLOSE_WAIT = "close_wait";

/**
  * Enum value "closing" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_CLOSING = "closing";

/**
  * Enum value "delete" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_DELETE = "delete";

/**
  * Enum value "established" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_ESTABLISHED = "established";

/**
  * Enum value "fin_wait_1" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_FIN_WAIT_1 = "fin_wait_1";

/**
  * Enum value "fin_wait_2" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_FIN_WAIT_2 = "fin_wait_2";

/**
  * Enum value "last_ack" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_LAST_ACK = "last_ack";

/**
  * Enum value "listen" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_LISTEN = "listen";

/**
  * Enum value "syn_recv" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_SYN_RECV = "syn_recv";

/**
  * Enum value "syn_sent" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_SYN_SENT = "syn_sent";

/**
  * Enum value "time_wait" for attribute {@link ATTR_SYSTEM_NETWORK_STATE}.
  */
export const ATTR_SYSTEM_NETWORK_STATE_VALUE_TIME_WAIT = "time_wait";

/**
 * The paging access direction
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_DIRECTION = 'system.paging.direction';

/**
  * Enum value "in" for attribute {@link ATTR_SYSTEM_PAGING_DIRECTION}.
  */
export const ATTR_SYSTEM_PAGING_DIRECTION_VALUE_IN = "in";

/**
  * Enum value "out" for attribute {@link ATTR_SYSTEM_PAGING_DIRECTION}.
  */
export const ATTR_SYSTEM_PAGING_DIRECTION_VALUE_OUT = "out";

/**
 * The memory paging state
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_STATE = 'system.paging.state';

/**
  * Enum value "free" for attribute {@link ATTR_SYSTEM_PAGING_STATE}.
  */
export const ATTR_SYSTEM_PAGING_STATE_VALUE_FREE = "free";

/**
  * Enum value "used" for attribute {@link ATTR_SYSTEM_PAGING_STATE}.
  */
export const ATTR_SYSTEM_PAGING_STATE_VALUE_USED = "used";

/**
 * The memory paging type
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PAGING_TYPE = 'system.paging.type';

/**
  * Enum value "major" for attribute {@link ATTR_SYSTEM_PAGING_TYPE}.
  */
export const ATTR_SYSTEM_PAGING_TYPE_VALUE_MAJOR = "major";

/**
  * Enum value "minor" for attribute {@link ATTR_SYSTEM_PAGING_TYPE}.
  */
export const ATTR_SYSTEM_PAGING_TYPE_VALUE_MINOR = "minor";

/**
 * The process state, e.g., [Linux Process State Codes](https://man7.org/linux/man-pages/man1/ps.1.html#PROCESS_STATE_CODES)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_SYSTEM_PROCESS_STATUS = 'system.process.status';

/**
  * Enum value "defunct" for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
  */
export const ATTR_SYSTEM_PROCESS_STATUS_VALUE_DEFUNCT = "defunct";

/**
  * Enum value "running" for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
  */
export const ATTR_SYSTEM_PROCESS_STATUS_VALUE_RUNNING = "running";

/**
  * Enum value "sleeping" for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
  */
export const ATTR_SYSTEM_PROCESS_STATUS_VALUE_SLEEPING = "sleeping";

/**
  * Enum value "stopped" for attribute {@link ATTR_SYSTEM_PROCESS_STATUS}.
  */
export const ATTR_SYSTEM_PROCESS_STATUS_VALUE_STOPPED = "stopped";

/**
 * Deprecated, use `system.process.status` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `system.process.status`.
 */
export const ATTR_SYSTEM_PROCESSES_STATUS = 'system.processes.status';

/**
  * Enum value "defunct" for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
  */
export const ATTR_SYSTEM_PROCESSES_STATUS_VALUE_DEFUNCT = "defunct";

/**
  * Enum value "running" for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
  */
export const ATTR_SYSTEM_PROCESSES_STATUS_VALUE_RUNNING = "running";

/**
  * Enum value "sleeping" for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
  */
export const ATTR_SYSTEM_PROCESSES_STATUS_VALUE_SLEEPING = "sleeping";

/**
  * Enum value "stopped" for attribute {@link ATTR_SYSTEM_PROCESSES_STATUS}.
  */
export const ATTR_SYSTEM_PROCESSES_STATUS_VALUE_STOPPED = "stopped";

/**
 * The name of the auto instrumentation agent or distribution, if used.
 *
 * @note Official auto instrumentation agents and distributions **SHOULD** set the `telemetry.distro.name` attribute to
 * a string starting with `opentelemetry-`, e.g. `opentelemetry-java-instrumentation`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TELEMETRY_DISTRO_NAME = 'telemetry.distro.name';

/**
 * The version string of the auto instrumentation agent or distribution, if used.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TELEMETRY_DISTRO_VERSION = 'telemetry.distro.version';

/**
 * The fully qualified human readable name of the [test case](https://en.wikipedia.org/wiki/Test_case).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TEST_CASE_NAME = 'test.case.name';

/**
 * The status of the actual test case result from test execution.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TEST_CASE_RESULT_STATUS = 'test.case.result.status';

/**
  * Enum value "fail" for attribute {@link ATTR_TEST_CASE_RESULT_STATUS}.
  */
export const ATTR_TEST_CASE_RESULT_STATUS_VALUE_FAIL = "fail";

/**
  * Enum value "pass" for attribute {@link ATTR_TEST_CASE_RESULT_STATUS}.
  */
export const ATTR_TEST_CASE_RESULT_STATUS_VALUE_PASS = "pass";

/**
 * The human readable name of a [test suite](https://en.wikipedia.org/wiki/Test_suite).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TEST_SUITE_NAME = 'test.suite.name';

/**
 * The status of the test suite run.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TEST_SUITE_RUN_STATUS = 'test.suite.run.status';

/**
  * Enum value "aborted" for attribute {@link ATTR_TEST_SUITE_RUN_STATUS}.
  */
export const ATTR_TEST_SUITE_RUN_STATUS_VALUE_ABORTED = "aborted";

/**
  * Enum value "failure" for attribute {@link ATTR_TEST_SUITE_RUN_STATUS}.
  */
export const ATTR_TEST_SUITE_RUN_STATUS_VALUE_FAILURE = "failure";

/**
  * Enum value "in_progress" for attribute {@link ATTR_TEST_SUITE_RUN_STATUS}.
  */
export const ATTR_TEST_SUITE_RUN_STATUS_VALUE_IN_PROGRESS = "in_progress";

/**
  * Enum value "skipped" for attribute {@link ATTR_TEST_SUITE_RUN_STATUS}.
  */
export const ATTR_TEST_SUITE_RUN_STATUS_VALUE_SKIPPED = "skipped";

/**
  * Enum value "success" for attribute {@link ATTR_TEST_SUITE_RUN_STATUS}.
  */
export const ATTR_TEST_SUITE_RUN_STATUS_VALUE_SUCCESS = "success";

/**
  * Enum value "timed_out" for attribute {@link ATTR_TEST_SUITE_RUN_STATUS}.
  */
export const ATTR_TEST_SUITE_RUN_STATUS_VALUE_TIMED_OUT = "timed_out";

/**
 * Current "managed" thread ID (as opposed to OS thread ID).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_THREAD_ID = 'thread.id';

/**
 * Current thread name.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_THREAD_NAME = 'thread.name';

/**
 * String indicating the [cipher](https://datatracker.ietf.org/doc/html/rfc5246#appendix-A.5) used during the current connection.
 *
 * @note The values allowed for `tls.cipher` **MUST** be one of the `Descriptions` of the [registered TLS Cipher Suits](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#table-tls-parameters-4).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CIPHER = 'tls.cipher';

/**
 * PEM-encoded stand-alone certificate offered by the client. This is usually mutually-exclusive of `client.certificate_chain` since this value also exists in that list.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_CERTIFICATE = 'tls.client.certificate';

/**
 * Array of PEM-encoded certificates that make up the certificate chain offered by the client. This is usually mutually-exclusive of `client.certificate` since that value should be the first certificate in the chain.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_CERTIFICATE_CHAIN = 'tls.client.certificate_chain';

/**
 * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_MD5 = 'tls.client.hash.md5';

/**
 * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_SHA1 = 'tls.client.hash.sha1';

/**
 * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the client. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_HASH_SHA256 = 'tls.client.hash.sha256';

/**
 * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_ISSUER = 'tls.client.issuer';

/**
 * A hash that identifies clients based on how they perform an SSL/TLS handshake.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_JA3 = 'tls.client.ja3';

/**
 * Date/Time indicating when client certificate is no longer considered valid.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_NOT_AFTER = 'tls.client.not_after';

/**
 * Date/Time indicating when client certificate is first considered valid.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_NOT_BEFORE = 'tls.client.not_before';

/**
 * Deprecated, use `server.address` instead.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 *
 * @deprecated  * Replaced by `server.address.
 */
export const ATTR_TLS_CLIENT_SERVER_NAME = 'tls.client.server_name';

/**
 * Distinguished name of subject of the x.509 certificate presented by the client.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_SUBJECT = 'tls.client.subject';

/**
 * Array of ciphers offered by the client during the client hello.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CLIENT_SUPPORTED_CIPHERS = 'tls.client.supported_ciphers';

/**
 * String indicating the curve used for the given cipher, when applicable
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_CURVE = 'tls.curve';

/**
 * Boolean flag indicating if the TLS negotiation was successful and transitioned to an encrypted tunnel.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_ESTABLISHED = 'tls.established';

/**
 * String indicating the protocol being tunneled. Per the values in the [IANA registry](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids), this string should be lower case.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_NEXT_PROTOCOL = 'tls.next_protocol';

/**
 * Normalized lowercase protocol name parsed from original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_PROTOCOL_NAME = 'tls.protocol.name';

/**
  * Enum value "ssl" for attribute {@link ATTR_TLS_PROTOCOL_NAME}.
  */
export const ATTR_TLS_PROTOCOL_NAME_VALUE_SSL = "ssl";

/**
  * Enum value "tls" for attribute {@link ATTR_TLS_PROTOCOL_NAME}.
  */
export const ATTR_TLS_PROTOCOL_NAME_VALUE_TLS = "tls";

/**
 * Numeric part of the version parsed from the original string of the negotiated [SSL/TLS protocol version](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html#RETURN-VALUES)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_PROTOCOL_VERSION = 'tls.protocol.version';

/**
 * Boolean flag indicating if this TLS connection was resumed from an existing TLS negotiation.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_RESUMED = 'tls.resumed';

/**
 * PEM-encoded stand-alone certificate offered by the server. This is usually mutually-exclusive of `server.certificate_chain` since this value also exists in that list.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_CERTIFICATE = 'tls.server.certificate';

/**
 * Array of PEM-encoded certificates that make up the certificate chain offered by the server. This is usually mutually-exclusive of `server.certificate` since that value should be the first certificate in the chain.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_CERTIFICATE_CHAIN = 'tls.server.certificate_chain';

/**
 * Certificate fingerprint using the MD5 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_MD5 = 'tls.server.hash.md5';

/**
 * Certificate fingerprint using the SHA1 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_SHA1 = 'tls.server.hash.sha1';

/**
 * Certificate fingerprint using the SHA256 digest of DER-encoded version of certificate offered by the server. For consistency with other hash values, this value should be formatted as an uppercase hash.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_HASH_SHA256 = 'tls.server.hash.sha256';

/**
 * Distinguished name of [subject](https://datatracker.ietf.org/doc/html/rfc5280#section-4.1.2.6) of the issuer of the x.509 certificate presented by the client.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_ISSUER = 'tls.server.issuer';

/**
 * A hash that identifies servers based on how they perform an SSL/TLS handshake.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_JA3S = 'tls.server.ja3s';

/**
 * Date/Time indicating when server certificate is no longer considered valid.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_NOT_AFTER = 'tls.server.not_after';

/**
 * Date/Time indicating when server certificate is first considered valid.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_NOT_BEFORE = 'tls.server.not_before';

/**
 * Distinguished name of subject of the x.509 certificate presented by the server.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_TLS_SERVER_SUBJECT = 'tls.server.subject';

/**
 * Domain extracted from the `url.full`, such as "opentelemetry.io".
 *
 * @note In some cases a URL may refer to an IP and/or port directly, without a domain name. In this case, the IP address would go to the domain field. If the URL contains a [literal IPv6 address](https://www.rfc-editor.org/rfc/rfc2732#section-2) enclosed by `[` and `]`, the `[` and `]` characters should also be captured in the domain field.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_DOMAIN = 'url.domain';

/**
 * The file extension extracted from the `url.full`, excluding the leading dot.
 *
 * @note The file extension is only set if it exists, as not every url has a file extension. When the file name has multiple extensions `example.tar.gz`, only the last one should be captured `gz`, not `tar.gz`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_EXTENSION = 'url.extension';

/**
 * Unmodified original URL as seen in the event source.
 *
 * @note In network monitoring, the observed URL may be a full URL, whereas in access logs, the URL is often just represented as a path. This field is meant to represent the URL as it was observed, complete or not.
 * `url.original` might contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case password and username **SHOULD** **NOT** be redacted and attribute's value **SHOULD** remain the same.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_ORIGINAL = 'url.original';

/**
 * Port extracted from the `url.full`
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_PORT = 'url.port';

/**
 * The highest registered url domain, stripped of the subdomain.
 *
 * @note This value can be determined precisely with the [public suffix list](http://publicsuffix.org). For example, the registered domain for `foo.example.com` is `example.com`. Trying to approximate this by simply taking the last two labels will not work well for TLDs such as `co.uk`.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_REGISTERED_DOMAIN = 'url.registered_domain';

/**
 * The subdomain portion of a fully qualified domain name includes all of the names except the host name under the registered_domain. In a partially qualified domain, or if the qualification level of the full name cannot be determined, subdomain contains all of the names below the registered domain.
 *
 * @note The subdomain portion of `www.east.mydomain.co.uk` is `east`. If the domain has multiple levels of subdomain, such as `sub2.sub1.example.com`, the subdomain field should contain `sub2.sub1`, with no trailing period.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_SUBDOMAIN = 'url.subdomain';

/**
 * The low-cardinality template of an [absolute path reference](https://www.rfc-editor.org/rfc/rfc3986#section-4.2).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_TEMPLATE = 'url.template';

/**
 * The effective top level domain (eTLD), also known as the domain suffix, is the last part of the domain name. For example, the top level domain for example.com is `com`.
 *
 * @note This value can be determined precisely with the [public suffix list](http://publicsuffix.org).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_URL_TOP_LEVEL_DOMAIN = 'url.top_level_domain';

/**
 * User email address.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_EMAIL = 'user.email';

/**
 * User's full name
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_FULL_NAME = 'user.full_name';

/**
 * Unique user hash to correlate information for a user in anonymized form.
 *
 * @note Useful if `user.id` or `user.name` contain confidential information and cannot be used.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_HASH = 'user.hash';

/**
 * Unique identifier of the user.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_ID = 'user.id';

/**
 * Short name or login/username of the user.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_NAME = 'user.name';

/**
 * Array of user roles at the time of the event.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_ROLES = 'user.roles';

/**
 * Name of the user-agent extracted from original. Usually refers to the browser's name.
 *
 * @note [Example](https://www.whatsmyua.info) of extracting browser's name from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant name **SHOULD** be selected. In such a scenario it should align with `user_agent.version`
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_AGENT_NAME = 'user_agent.name';

/**
 * Version of the user-agent extracted from original. Usually refers to the browser's version
 *
 * @note [Example](https://www.whatsmyua.info) of extracting browser's version from original string. In the case of using a user-agent for non-browser products, such as microservices with multiple names/versions inside the `user_agent.original`, the most significant version **SHOULD** be selected. In such a scenario it should align with `user_agent.name`
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_USER_AGENT_VERSION = 'user_agent.version';

/**
 * The type of garbage collection.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_V8JS_GC_TYPE = 'v8js.gc.type';

/**
  * Enum value "incremental" for attribute {@link ATTR_V8JS_GC_TYPE}.
  */
export const ATTR_V8JS_GC_TYPE_VALUE_INCREMENTAL = "incremental";

/**
  * Enum value "major" for attribute {@link ATTR_V8JS_GC_TYPE}.
  */
export const ATTR_V8JS_GC_TYPE_VALUE_MAJOR = "major";

/**
  * Enum value "minor" for attribute {@link ATTR_V8JS_GC_TYPE}.
  */
export const ATTR_V8JS_GC_TYPE_VALUE_MINOR = "minor";

/**
  * Enum value "weakcb" for attribute {@link ATTR_V8JS_GC_TYPE}.
  */
export const ATTR_V8JS_GC_TYPE_VALUE_WEAKCB = "weakcb";

/**
 * The name of the space type of heap memory.
 *
 * @note Value can be retrieved from value `space_name` of [`v8.getHeapSpaceStatistics()`](https://nodejs.org/api/v8.html#v8getheapspacestatistics)
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_V8JS_HEAP_SPACE_NAME = 'v8js.heap.space.name';

/**
  * Enum value "code_space" for attribute {@link ATTR_V8JS_HEAP_SPACE_NAME}.
  */
export const ATTR_V8JS_HEAP_SPACE_NAME_VALUE_CODE_SPACE = "code_space";

/**
  * Enum value "large_object_space" for attribute {@link ATTR_V8JS_HEAP_SPACE_NAME}.
  */
export const ATTR_V8JS_HEAP_SPACE_NAME_VALUE_LARGE_OBJECT_SPACE = "large_object_space";

/**
  * Enum value "map_space" for attribute {@link ATTR_V8JS_HEAP_SPACE_NAME}.
  */
export const ATTR_V8JS_HEAP_SPACE_NAME_VALUE_MAP_SPACE = "map_space";

/**
  * Enum value "new_space" for attribute {@link ATTR_V8JS_HEAP_SPACE_NAME}.
  */
export const ATTR_V8JS_HEAP_SPACE_NAME_VALUE_NEW_SPACE = "new_space";

/**
  * Enum value "old_space" for attribute {@link ATTR_V8JS_HEAP_SPACE_NAME}.
  */
export const ATTR_V8JS_HEAP_SPACE_NAME_VALUE_OLD_SPACE = "old_space";

/**
 * The ID of the change (pull request/merge request) if applicable. This is usually a unique (within repository) identifier generated by the VCS system.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_VCS_REPOSITORY_CHANGE_ID = 'vcs.repository.change.id';

/**
 * The human readable title of the change (pull request/merge request). This title is often a brief summary of the change and may get merged in to a ref as the commit summary.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_VCS_REPOSITORY_CHANGE_TITLE = 'vcs.repository.change.title';

/**
 * The name of the [reference](https://git-scm.com/docs/gitglossary#def_ref) such as **branch** or **tag** in the repository.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_VCS_REPOSITORY_REF_NAME = 'vcs.repository.ref.name';

/**
 * The revision, literally [revised version](https://www.merriam-webster.com/dictionary/revision), The revision most often refers to a commit object in Git, or a revision number in SVN.
 *
 * @note The revision can be a full [hash value (see glossary)](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf),
 * of the recorded change to a ref within a repository pointing to a
 * commit [commit](https://git-scm.com/docs/git-commit) object. It does
 * not necessarily have to be a hash; it can simply define a
 * [revision number](https://svnbook.red-bean.com/en/1.7/svn.tour.revs.specifiers.html)
 * which is an integer that is monotonically increasing. In cases where
 * it is identical to the `ref.name`, it **SHOULD** still be included. It is
 * up to the implementer to decide which value to set as the revision
 * based on the VCS system and situational context.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_VCS_REPOSITORY_REF_REVISION = 'vcs.repository.ref.revision';

/**
 * The type of the [reference](https://git-scm.com/docs/gitglossary#def_ref) in the repository.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_VCS_REPOSITORY_REF_TYPE = 'vcs.repository.ref.type';

/**
  * Enum value "branch" for attribute {@link ATTR_VCS_REPOSITORY_REF_TYPE}.
  */
export const ATTR_VCS_REPOSITORY_REF_TYPE_VALUE_BRANCH = "branch";

/**
  * Enum value "tag" for attribute {@link ATTR_VCS_REPOSITORY_REF_TYPE}.
  */
export const ATTR_VCS_REPOSITORY_REF_TYPE_VALUE_TAG = "tag";

/**
 * The [URL](https://en.wikipedia.org/wiki/URL) of the repository providing the complete address in order to locate and identify the repository.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_VCS_REPOSITORY_URL_FULL = 'vcs.repository.url.full';

/**
 * Additional description of the web engine (e.g. detailed version and edition information).
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_DESCRIPTION = 'webengine.description';

/**
 * The name of the web engine.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_NAME = 'webengine.name';

/**
 * The version of the web engine.
 *
 * @experimental This attribute is experimental and is subject to change in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const ATTR_WEBENGINE_VERSION = 'webengine.version';

