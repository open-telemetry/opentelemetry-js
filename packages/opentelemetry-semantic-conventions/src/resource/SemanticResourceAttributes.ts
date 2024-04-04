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
// Constant values for SemanticResourceAttributes
//----------------------------------------------------------------------------------------------------------

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_AWS_ECS_TASK_ID = 'aws.ecs.task.id';
const TMP_AWS_ECS_CLUSTER_ARN = 'aws.ecs.cluster.arn';
const TMP_AWS_ECS_CONTAINER_ARN = 'aws.ecs.container.arn';
const TMP_AWS_ECS_LAUNCHTYPE = 'aws.ecs.launchtype';
const TMP_AWS_ECS_TASK_ARN = 'aws.ecs.task.arn';
const TMP_AWS_ECS_TASK_FAMILY = 'aws.ecs.task.family';
const TMP_AWS_ECS_TASK_REVISION = 'aws.ecs.task.revision';
const TMP_AWS_EKS_CLUSTER_ARN = 'aws.eks.cluster.arn';
const TMP_AWS_LOG_GROUP_ARNS = 'aws.log.group.arns';
const TMP_AWS_LOG_GROUP_NAMES = 'aws.log.group.names';
const TMP_AWS_LOG_STREAM_ARNS = 'aws.log.stream.arns';
const TMP_AWS_LOG_STREAM_NAMES = 'aws.log.stream.names';
const TMP_HEROKU_APP_ID = 'heroku.app.id';
const TMP_HEROKU_RELEASE_COMMIT = 'heroku.release.commit';
const TMP_HEROKU_RELEASE_CREATION_TIMESTAMP = 'heroku.release.creation_timestamp';
const TMP_WEBENGINE_NAME = 'webengine.name';
const TMP_WEBENGINE_DESCRIPTION = 'webengine.description';
const TMP_WEBENGINE_VERSION = 'webengine.version';
const TMP_OTEL_SCOPE_NAME = 'otel.scope.name';
const TMP_OTEL_SCOPE_VERSION = 'otel.scope.version';
const TMP_OTEL_LIBRARY_NAME = 'otel.library.name';
const TMP_OTEL_LIBRARY_VERSION = 'otel.library.version';

/**
* The ID of a running ECS task. The ID MUST be extracted from `task.arn`.
*/
export const SEMRESATTRS_AWS_ECS_TASK_ID = TMP_AWS_ECS_TASK_ID;

/**
* The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
*/
export const SEMRESATTRS_AWS_ECS_CLUSTER_ARN = TMP_AWS_ECS_CLUSTER_ARN;

/**
* The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
*/
export const SEMRESATTRS_AWS_ECS_CONTAINER_ARN = TMP_AWS_ECS_CONTAINER_ARN;

/**
* The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
*/
export const SEMRESATTRS_AWS_ECS_LAUNCHTYPE = TMP_AWS_ECS_LAUNCHTYPE;

/**
* The ARN of a running [ECS task](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-account-settings.html#ecs-resource-ids).
*/
export const SEMRESATTRS_AWS_ECS_TASK_ARN = TMP_AWS_ECS_TASK_ARN;

/**
* The family name of the [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html) used to create the ECS task.
*/
export const SEMRESATTRS_AWS_ECS_TASK_FAMILY = TMP_AWS_ECS_TASK_FAMILY;

/**
* The revision for the task definition used to create the ECS task.
*/
export const SEMRESATTRS_AWS_ECS_TASK_REVISION = TMP_AWS_ECS_TASK_REVISION;

/**
* The ARN of an EKS cluster.
*/
export const SEMRESATTRS_AWS_EKS_CLUSTER_ARN = TMP_AWS_EKS_CLUSTER_ARN;

/**
* The Amazon Resource Name(s) (ARN) of the AWS log group(s).
*
* Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
*/
export const SEMRESATTRS_AWS_LOG_GROUP_ARNS = TMP_AWS_LOG_GROUP_ARNS;

/**
* The name(s) of the AWS log group(s) an application is writing to.
*
* Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
*/
export const SEMRESATTRS_AWS_LOG_GROUP_NAMES = TMP_AWS_LOG_GROUP_NAMES;

/**
* The ARN(s) of the AWS log stream(s).
*
* Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
*/
export const SEMRESATTRS_AWS_LOG_STREAM_ARNS = TMP_AWS_LOG_STREAM_ARNS;

/**
* The name(s) of the AWS log stream(s) an application is writing to.
*/
export const SEMRESATTRS_AWS_LOG_STREAM_NAMES = TMP_AWS_LOG_STREAM_NAMES;

/**
* Unique identifier for the application.
*/
export const SEMRESATTRS_HEROKU_APP_ID = TMP_HEROKU_APP_ID;

/**
* Commit hash for the current release.
*/
export const SEMRESATTRS_HEROKU_RELEASE_COMMIT = TMP_HEROKU_RELEASE_COMMIT;

/**
* Time and date the release was created.
*/
export const SEMRESATTRS_HEROKU_RELEASE_CREATION_TIMESTAMP = TMP_HEROKU_RELEASE_CREATION_TIMESTAMP;

/**
* The name of the web engine.
*/
export const SEMRESATTRS_WEBENGINE_NAME = TMP_WEBENGINE_NAME;

/**
* Additional description of the web engine (e.g. detailed version and edition information).
*/
export const SEMRESATTRS_WEBENGINE_DESCRIPTION = TMP_WEBENGINE_DESCRIPTION;

/**
* The version of the web engine.
*/
export const SEMRESATTRS_WEBENGINE_VERSION = TMP_WEBENGINE_VERSION;

/**
* The name of the instrumentation scope - (`InstrumentationScope.Name` in OTLP).
*/
export const SEMRESATTRS_OTEL_SCOPE_NAME = TMP_OTEL_SCOPE_NAME;

/**
* The version of the instrumentation scope - (`InstrumentationScope.Version` in OTLP).
*/
export const SEMRESATTRS_OTEL_SCOPE_VERSION = TMP_OTEL_SCOPE_VERSION;

/**
* None.
*
* @deprecated use the `otel.scope.name` attribute.
*/
export const SEMRESATTRS_OTEL_LIBRARY_NAME = TMP_OTEL_LIBRARY_NAME;

/**
* None.
*
* @deprecated use the `otel.scope.version` attribute.
*/
export const SEMRESATTRS_OTEL_LIBRARY_VERSION = TMP_OTEL_LIBRARY_VERSION;

/**
 * Definition of available values for SemanticResourceAttributes
 * This type is used for backward compatibility, you should use the individual exported
 * constants SemanticResourceAttributes_XXXXX rather than the exported constant map. As any single reference
 * to a constant map value will result in all strings being included into your bundle.
 * @deprecated Use the SEMRESATTRS_XXXXX constants rather than the SemanticResourceAttributes.XXXXX for bundle minification.
 */
export type SemanticResourceAttributes = {

  /**
  * The ID of a running ECS task. The ID MUST be extracted from `task.arn`.
  */
  AWS_ECS_TASK_ID: 'aws.ecs.task.id',

  /**
  * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
  */
  AWS_ECS_CLUSTER_ARN: 'aws.ecs.cluster.arn',

  /**
  * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
  */
  AWS_ECS_CONTAINER_ARN: 'aws.ecs.container.arn',

  /**
  * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
  */
  AWS_ECS_LAUNCHTYPE: 'aws.ecs.launchtype',

  /**
  * The ARN of a running [ECS task](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-account-settings.html#ecs-resource-ids).
  */
  AWS_ECS_TASK_ARN: 'aws.ecs.task.arn',

  /**
  * The family name of the [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html) used to create the ECS task.
  */
  AWS_ECS_TASK_FAMILY: 'aws.ecs.task.family',

  /**
  * The revision for the task definition used to create the ECS task.
  */
  AWS_ECS_TASK_REVISION: 'aws.ecs.task.revision',

  /**
  * The ARN of an EKS cluster.
  */
  AWS_EKS_CLUSTER_ARN: 'aws.eks.cluster.arn',

  /**
  * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
  *
  * Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
  */
  AWS_LOG_GROUP_ARNS: 'aws.log.group.arns',

  /**
  * The name(s) of the AWS log group(s) an application is writing to.
  *
  * Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
  */
  AWS_LOG_GROUP_NAMES: 'aws.log.group.names',

  /**
  * The ARN(s) of the AWS log stream(s).
  *
  * Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
  */
  AWS_LOG_STREAM_ARNS: 'aws.log.stream.arns',

  /**
  * The name(s) of the AWS log stream(s) an application is writing to.
  */
  AWS_LOG_STREAM_NAMES: 'aws.log.stream.names',

  /**
  * Unique identifier for the application.
  */
  HEROKU_APP_ID: 'heroku.app.id',

  /**
  * Commit hash for the current release.
  */
  HEROKU_RELEASE_COMMIT: 'heroku.release.commit',

  /**
  * Time and date the release was created.
  */
  HEROKU_RELEASE_CREATION_TIMESTAMP: 'heroku.release.creation_timestamp',

  /**
  * The name of the web engine.
  */
  WEBENGINE_NAME: 'webengine.name',

  /**
  * Additional description of the web engine (e.g. detailed version and edition information).
  */
  WEBENGINE_DESCRIPTION: 'webengine.description',

  /**
  * The version of the web engine.
  */
  WEBENGINE_VERSION: 'webengine.version',

  /**
  * The name of the instrumentation scope - (`InstrumentationScope.Name` in OTLP).
  */
  OTEL_SCOPE_NAME: 'otel.scope.name',

  /**
  * The version of the instrumentation scope - (`InstrumentationScope.Version` in OTLP).
  */
  OTEL_SCOPE_VERSION: 'otel.scope.version',

  /**
  * None.
  *
  * @deprecated use the `otel.scope.name` attribute.
  */
  OTEL_LIBRARY_NAME: 'otel.library.name',

  /**
  * None.
  *
  * @deprecated use the `otel.scope.version` attribute.
  */
  OTEL_LIBRARY_VERSION: 'otel.library.version',
};

/**
 * Create exported Value Map for SemanticResourceAttributes values
 * @deprecated Use the SEMRESATTRS_XXXXX constants rather than the SemanticResourceAttributes.XXXXX for bundle minification
 */
export const SemanticResourceAttributes:SemanticResourceAttributes = /*#__PURE__*/createConstMap<SemanticResourceAttributes>([
  TMP_AWS_ECS_TASK_ID,
  TMP_AWS_ECS_CLUSTER_ARN,
  TMP_AWS_ECS_CONTAINER_ARN,
  TMP_AWS_ECS_LAUNCHTYPE,
  TMP_AWS_ECS_TASK_ARN,
  TMP_AWS_ECS_TASK_FAMILY,
  TMP_AWS_ECS_TASK_REVISION,
  TMP_AWS_EKS_CLUSTER_ARN,
  TMP_AWS_LOG_GROUP_ARNS,
  TMP_AWS_LOG_GROUP_NAMES,
  TMP_AWS_LOG_STREAM_ARNS,
  TMP_AWS_LOG_STREAM_NAMES,
  TMP_HEROKU_APP_ID,
  TMP_HEROKU_RELEASE_COMMIT,
  TMP_HEROKU_RELEASE_CREATION_TIMESTAMP,
  TMP_WEBENGINE_NAME,
  TMP_WEBENGINE_DESCRIPTION,
  TMP_WEBENGINE_VERSION,
  TMP_OTEL_SCOPE_NAME,
  TMP_OTEL_SCOPE_VERSION,
  TMP_OTEL_LIBRARY_NAME,
  TMP_OTEL_LIBRARY_VERSION,
]);

/* ----------------------------------------------------------------------------------------------------------
 * Constant values for AwsEcsLaunchtypeValues enum definition
 *
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 * ---------------------------------------------------------------------------------------------------------- */

// Temporary local constants to assign to the individual exports and the namespaced version
// Required to avoid the namespace exports using the unminifiable export names for some package types
const TMP_AWSECSLAUNCHTYPEVALUES_EC2 = 'ec2';
const TMP_AWSECSLAUNCHTYPEVALUES_FARGATE = 'fargate';

/**
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 */
export const AWSECSLAUNCHTYPEVALUES_EC2 = TMP_AWSECSLAUNCHTYPEVALUES_EC2;

/**
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 */
export const AWSECSLAUNCHTYPEVALUES_FARGATE = TMP_AWSECSLAUNCHTYPEVALUES_FARGATE;

/**
 * Identifies the Values for AwsEcsLaunchtypeValues enum definition
 *
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 * @deprecated Use the AWSECSLAUNCHTYPEVALUES_XXXXX constants rather than the AwsEcsLaunchtypeValues.XXXXX for bundle minification.
 */
export type AwsEcsLaunchtypeValues = {

  /** ec2. */
  EC2: 'ec2',

  /** fargate. */
  FARGATE: 'fargate',
}

/**
 * The constant map of values for AwsEcsLaunchtypeValues.
 * @deprecated Use the AWSECSLAUNCHTYPEVALUES_XXXXX constants rather than the AwsEcsLaunchtypeValues.XXXXX for bundle minification.
 */
export const AwsEcsLaunchtypeValues:AwsEcsLaunchtypeValues = /*#__PURE__*/createConstMap<AwsEcsLaunchtypeValues>([
  TMP_AWSECSLAUNCHTYPEVALUES_EC2,
  TMP_AWSECSLAUNCHTYPEVALUES_FARGATE,
]);

