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

/**
 * Name of the cloud provider.
 */
export const CLOUD_PROVIDER = 'cloud.provider' as const;

/**
 * The cloud account ID the resource is assigned to.
 */
export const CLOUD_ACCOUNT_ID = 'cloud.account.id' as const;

/**
 * The geographical region the resource is running. Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/en-us/global-infrastructure/geographies/), or [Google Cloud regions](https://cloud.google.com/about/locations).
 */
export const CLOUD_REGION = 'cloud.region' as const;

/**
 * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
 *
 * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
 */
export const CLOUD_AVAILABILITY_ZONE = 'cloud.availability_zone' as const;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUD_PLATFORM = 'cloud.platform' as const;

/**
 * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
 */
export const AWS_ECS_CONTAINER_ARN = 'aws.ecs.container.arn' as const;

/**
 * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
 */
export const AWS_ECS_CLUSTER_ARN = 'aws.ecs.cluster.arn' as const;

/**
 * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
 */
export const AWS_ECS_LAUNCHTYPE = 'aws.ecs.launchtype' as const;

/**
 * The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
 */
export const AWS_ECS_TASK_ARN = 'aws.ecs.task.arn' as const;

/**
 * The task definition family this task definition is a member of.
 */
export const AWS_ECS_TASK_FAMILY = 'aws.ecs.task.family' as const;

/**
 * The revision for this task definition.
 */
export const AWS_ECS_TASK_REVISION = 'aws.ecs.task.revision' as const;

/**
 * The ARN of an EKS cluster.
 */
export const AWS_EKS_CLUSTER_ARN = 'aws.eks.cluster.arn' as const;

/**
 * The name(s) of the AWS log group(s) an application is writing to.
 *
 * Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
 */
export const AWS_LOG_GROUP_NAMES = 'aws.log.group.names' as const;

/**
 * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
 *
 * Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
 */
export const AWS_LOG_GROUP_ARNS = 'aws.log.group.arns' as const;

/**
 * The name(s) of the AWS log stream(s) an application is writing to.
 */
export const AWS_LOG_STREAM_NAMES = 'aws.log.stream.names' as const;

/**
 * The ARN(s) of the AWS log stream(s).
 *
 * Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
 */
export const AWS_LOG_STREAM_ARNS = 'aws.log.stream.arns' as const;

/**
 * Container name.
 */
export const CONTAINER_NAME = 'container.name' as const;

/**
 * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
 */
export const CONTAINER_ID = 'container.id' as const;

/**
 * The container runtime managing this container.
 */
export const CONTAINER_RUNTIME = 'container.runtime' as const;

/**
 * Name of the image the container was built on.
 */
export const CONTAINER_IMAGE_NAME = 'container.image.name' as const;

/**
 * Container image tag.
 */
export const CONTAINER_IMAGE_TAG = 'container.image.tag' as const;

/**
 * Name of the [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
 */
export const DEPLOYMENT_ENVIRONMENT = 'deployment.environment' as const;

/**
 * A unique identifier representing the device.
 *
 * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
 */
export const DEVICE_ID = 'device.id' as const;

/**
 * The model identifier for the device.
 *
 * Note: It&#39;s recommended this value represents a machine readable version of the model identifier rather than the market or consumer-friendly name of the device.
 */
export const DEVICE_MODEL_IDENTIFIER = 'device.model.identifier' as const;

/**
 * The marketing name for the device model.
 *
 * Note: It&#39;s recommended this value represents a human readable version of the device model rather than a machine readable alternative.
 */
export const DEVICE_MODEL_NAME = 'device.model.name' as const;

/**
 * The name of the single function that this runtime instance executes.
 *
 * Note: This is the name of the function as configured/deployed on the FaaS platform and is usually different from the name of the callback function (which may be stored in the [`code.namespace`/`code.function`](../../trace/semantic_conventions/span-general.md#source-code-attributes) span attributes).
 */
export const FAAS_NAME = 'faas.name' as const;

/**
* The unique ID of the single function that this runtime instance executes.
*
* Note: Depending on the cloud provider, use:

* **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
Take care not to use the &#34;invoked ARN&#34; directly but replace any
[alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html) with the resolved function version, as the same runtime instance may be invokable with multiple
different aliases.
* **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
* **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/en-us/rest/api/resources/resources/get-by-id).

On some providers, it may not be possible to determine the full ID at startup,
which is why this field cannot be made required. For example, on AWS the account ID
part of the ARN is not available without calling another AWS API
which may be deemed too slow for a short-running lambda function.
As an alternative, consider setting `faas.id` as a span attribute instead.
*/
export const FAAS_ID = 'faas.id' as const;

/**
* The immutable version of the function being executed.
*
* Note: Depending on the cloud provider and platform, use:

* **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
  (an integer represented as a decimal string).
* **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
  (i.e., the function name plus the revision suffix).
* **Google Cloud Functions:** The value of the
  [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
* **Azure Functions:** Not applicable. Do not set this attribute.
*/
export const FAAS_VERSION = 'faas.version' as const;

/**
 * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
 *
 * Note: * **AWS Lambda:** Use the (full) log stream name.
 */
export const FAAS_INSTANCE = 'faas.instance' as const;

/**
 * The amount of memory available to the serverless function in MiB.
 *
 * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information.
 */
export const FAAS_MAX_MEMORY = 'faas.max_memory' as const;

/**
 * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider.
 */
export const HOST_ID = 'host.id' as const;

/**
 * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
 */
export const HOST_NAME = 'host.name' as const;

/**
 * Type of host. For Cloud, this must be the machine type.
 */
export const HOST_TYPE = 'host.type' as const;

/**
 * The CPU architecture the host system is running on.
 */
export const HOST_ARCH = 'host.arch' as const;

/**
 * Name of the VM image or OS install the host was instantiated from.
 */
export const HOST_IMAGE_NAME = 'host.image.name' as const;

/**
 * VM image ID. For Cloud, this value is from the provider.
 */
export const HOST_IMAGE_ID = 'host.image.id' as const;

/**
 * The version string of the VM image as defined in [Version Attributes](README.md#version-attributes).
 */
export const HOST_IMAGE_VERSION = 'host.image.version' as const;

/**
 * The name of the cluster.
 */
export const K8S_CLUSTER_NAME = 'k8s.cluster.name' as const;

/**
 * The name of the Node.
 */
export const K8S_NODE_NAME = 'k8s.node.name' as const;

/**
 * The UID of the Node.
 */
export const K8S_NODE_UID = 'k8s.node.uid' as const;

/**
 * The name of the namespace that the pod is running in.
 */
export const K8S_NAMESPACE_NAME = 'k8s.namespace.name' as const;

/**
 * The UID of the Pod.
 */
export const K8S_POD_UID = 'k8s.pod.uid' as const;

/**
 * The name of the Pod.
 */
export const K8S_POD_NAME = 'k8s.pod.name' as const;

/**
 * The name of the Container in a Pod template.
 */
export const K8S_CONTAINER_NAME = 'k8s.container.name' as const;

/**
 * The UID of the ReplicaSet.
 */
export const K8S_REPLICASET_UID = 'k8s.replicaset.uid' as const;

/**
 * The name of the ReplicaSet.
 */
export const K8S_REPLICASET_NAME = 'k8s.replicaset.name' as const;

/**
 * The UID of the Deployment.
 */
export const K8S_DEPLOYMENT_UID = 'k8s.deployment.uid' as const;

/**
 * The name of the Deployment.
 */
export const K8S_DEPLOYMENT_NAME = 'k8s.deployment.name' as const;

/**
 * The UID of the StatefulSet.
 */
export const K8S_STATEFULSET_UID = 'k8s.statefulset.uid' as const;

/**
 * The name of the StatefulSet.
 */
export const K8S_STATEFULSET_NAME = 'k8s.statefulset.name' as const;

/**
 * The UID of the DaemonSet.
 */
export const K8S_DAEMONSET_UID = 'k8s.daemonset.uid' as const;

/**
 * The name of the DaemonSet.
 */
export const K8S_DAEMONSET_NAME = 'k8s.daemonset.name' as const;

/**
 * The UID of the Job.
 */
export const K8S_JOB_UID = 'k8s.job.uid' as const;

/**
 * The name of the Job.
 */
export const K8S_JOB_NAME = 'k8s.job.name' as const;

/**
 * The UID of the CronJob.
 */
export const K8S_CRONJOB_UID = 'k8s.cronjob.uid' as const;

/**
 * The name of the CronJob.
 */
export const K8S_CRONJOB_NAME = 'k8s.cronjob.name' as const;

/**
 * The operating system type.
 */
export const OS_TYPE = 'os.type' as const;

/**
 * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
 */
export const OS_DESCRIPTION = 'os.description' as const;

/**
 * Human readable operating system name.
 */
export const OS_NAME = 'os.name' as const;

/**
 * The version string of the operating system as defined in [Version Attributes](../../resource/semantic_conventions/README.md#version-attributes).
 */
export const OS_VERSION = 'os.version' as const;

/**
 * Process identifier (PID).
 */
export const PROCESS_PID = 'process.pid' as const;

/**
 * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
 */
export const PROCESS_EXECUTABLE_NAME = 'process.executable.name' as const;

/**
 * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
 */
export const PROCESS_EXECUTABLE_PATH = 'process.executable.path' as const;

/**
 * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
 */
export const PROCESS_COMMAND = 'process.command' as const;

/**
 * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
 */
export const PROCESS_COMMAND_LINE = 'process.command_line' as const;

/**
 * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
 */
export const PROCESS_COMMAND_ARGS = 'process.command_args' as const;

/**
 * The username of the user that owns the process.
 */
export const PROCESS_OWNER = 'process.owner' as const;

/**
 * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
 */
export const PROCESS_RUNTIME_NAME = 'process.runtime.name' as const;

/**
 * The version of the runtime of this process, as returned by the runtime without modification.
 */
export const PROCESS_RUNTIME_VERSION = 'process.runtime.version' as const;

/**
 * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
 */
export const PROCESS_RUNTIME_DESCRIPTION =
  'process.runtime.description' as const;

/**
 * Logical name of the service.
 *
 * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
 */
export const SERVICE_NAME = 'service.name' as const;

/**
 * A namespace for `service.name`.
 *
 * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
 */
export const SERVICE_NAMESPACE = 'service.namespace' as const;

/**
 * The string ID of the service instance.
 *
 * Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
 */
export const SERVICE_INSTANCE_ID = 'service.instance.id' as const;

/**
 * The version string of the service API or implementation.
 */
export const SERVICE_VERSION = 'service.version' as const;

/**
 * The name of the telemetry SDK as defined above.
 */
export const TELEMETRY_SDK_NAME = 'telemetry.sdk.name' as const;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language' as const;

/**
 * The version string of the telemetry SDK.
 */
export const TELEMETRY_SDK_VERSION = 'telemetry.sdk.version' as const;

/**
 * The version string of the auto instrumentation agent, if used.
 */
export const TELEMETRY_AUTO_VERSION = 'telemetry.auto.version' as const;

/**
 * The name of the web engine.
 */
export const WEBENGINE_NAME = 'webengine.name' as const;

/**
 * The version of the web engine.
 */
export const WEBENGINE_VERSION = 'webengine.version' as const;

/**
 * Additional description of the web engine (e.g. detailed version and edition information).
 */
export const WEBENGINE_DESCRIPTION = 'webengine.description' as const;

export const SemanticResourceAttributes = {
  /**
   * Name of the cloud provider.
   */
  CLOUD_PROVIDER,

  /**
   * The cloud account ID the resource is assigned to.
   */
  CLOUD_ACCOUNT_ID,

  /**
   * The geographical region the resource is running. Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/en-us/global-infrastructure/geographies/), or [Google Cloud regions](https://cloud.google.com/about/locations).
   */
  CLOUD_REGION,

  /**
   * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
   *
   * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
   */
  CLOUD_AVAILABILITY_ZONE,

  /**
   * The cloud platform in use.
   *
   * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
   */
  CLOUD_PLATFORM,

  /**
   * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
   */
  AWS_ECS_CONTAINER_ARN,

  /**
   * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
   */
  AWS_ECS_CLUSTER_ARN,

  /**
   * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
   */
  AWS_ECS_LAUNCHTYPE,

  /**
   * The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
   */
  AWS_ECS_TASK_ARN,

  /**
   * The task definition family this task definition is a member of.
   */
  AWS_ECS_TASK_FAMILY,

  /**
   * The revision for this task definition.
   */
  AWS_ECS_TASK_REVISION,

  /**
   * The ARN of an EKS cluster.
   */
  AWS_EKS_CLUSTER_ARN,

  /**
   * The name(s) of the AWS log group(s) an application is writing to.
   *
   * Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
   */
  AWS_LOG_GROUP_NAMES,

  /**
   * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
   *
   * Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
   */
  AWS_LOG_GROUP_ARNS,

  /**
   * The name(s) of the AWS log stream(s) an application is writing to.
   */
  AWS_LOG_STREAM_NAMES,

  /**
   * The ARN(s) of the AWS log stream(s).
   *
   * Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
   */
  AWS_LOG_STREAM_ARNS,

  /**
   * Container name.
   */
  CONTAINER_NAME,

  /**
   * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
   */
  CONTAINER_ID,

  /**
   * The container runtime managing this container.
   */
  CONTAINER_RUNTIME,

  /**
   * Name of the image the container was built on.
   */
  CONTAINER_IMAGE_NAME,

  /**
   * Container image tag.
   */
  CONTAINER_IMAGE_TAG,

  /**
   * Name of the [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
   */
  DEPLOYMENT_ENVIRONMENT,

  /**
   * A unique identifier representing the device.
   *
   * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
   */
  DEVICE_ID,

  /**
   * The model identifier for the device.
   *
   * Note: It&#39;s recommended this value represents a machine readable version of the model identifier rather than the market or consumer-friendly name of the device.
   */
  DEVICE_MODEL_IDENTIFIER,

  /**
   * The marketing name for the device model.
   *
   * Note: It&#39;s recommended this value represents a human readable version of the device model rather than a machine readable alternative.
   */
  DEVICE_MODEL_NAME,

  /**
   * The name of the single function that this runtime instance executes.
   *
   * Note: This is the name of the function as configured/deployed on the FaaS platform and is usually different from the name of the callback function (which may be stored in the [`code.namespace`/`code.function`](../../trace/semantic_conventions/span-general.md#source-code-attributes) span attributes).
   */
  FAAS_NAME,

  /**
  * The unique ID of the single function that this runtime instance executes.
  *
  * Note: Depending on the cloud provider, use:

* **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
Take care not to use the &#34;invoked ARN&#34; directly but replace any
[alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html) with the resolved function version, as the same runtime instance may be invokable with multiple
different aliases.
* **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
* **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/en-us/rest/api/resources/resources/get-by-id).

On some providers, it may not be possible to determine the full ID at startup,
which is why this field cannot be made required. For example, on AWS the account ID
part of the ARN is not available without calling another AWS API
which may be deemed too slow for a short-running lambda function.
As an alternative, consider setting `faas.id` as a span attribute instead.
  */
  FAAS_ID,

  /**
  * The immutable version of the function being executed.
  *
  * Note: Depending on the cloud provider and platform, use:

* **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
  (an integer represented as a decimal string).
* **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
  (i.e., the function name plus the revision suffix).
* **Google Cloud Functions:** The value of the
  [`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
* **Azure Functions:** Not applicable. Do not set this attribute.
  */
  FAAS_VERSION,

  /**
   * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
   *
   * Note: * **AWS Lambda:** Use the (full) log stream name.
   */
  FAAS_INSTANCE,

  /**
   * The amount of memory available to the serverless function in MiB.
   *
   * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information.
   */
  FAAS_MAX_MEMORY,

  /**
   * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider.
   */
  HOST_ID,

  /**
   * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
   */
  HOST_NAME,

  /**
   * Type of host. For Cloud, this must be the machine type.
   */
  HOST_TYPE,

  /**
   * The CPU architecture the host system is running on.
   */
  HOST_ARCH,

  /**
   * Name of the VM image or OS install the host was instantiated from.
   */
  HOST_IMAGE_NAME,

  /**
   * VM image ID. For Cloud, this value is from the provider.
   */
  HOST_IMAGE_ID,

  /**
   * The version string of the VM image as defined in [Version Attributes](README.md#version-attributes).
   */
  HOST_IMAGE_VERSION,

  /**
   * The name of the cluster.
   */
  K8S_CLUSTER_NAME,

  /**
   * The name of the Node.
   */
  K8S_NODE_NAME,

  /**
   * The UID of the Node.
   */
  K8S_NODE_UID,

  /**
   * The name of the namespace that the pod is running in.
   */
  K8S_NAMESPACE_NAME,

  /**
   * The UID of the Pod.
   */
  K8S_POD_UID,

  /**
   * The name of the Pod.
   */
  K8S_POD_NAME,

  /**
   * The name of the Container in a Pod template.
   */
  K8S_CONTAINER_NAME,

  /**
   * The UID of the ReplicaSet.
   */
  K8S_REPLICASET_UID,

  /**
   * The name of the ReplicaSet.
   */
  K8S_REPLICASET_NAME,

  /**
   * The UID of the Deployment.
   */
  K8S_DEPLOYMENT_UID,

  /**
   * The name of the Deployment.
   */
  K8S_DEPLOYMENT_NAME,

  /**
   * The UID of the StatefulSet.
   */
  K8S_STATEFULSET_UID,

  /**
   * The name of the StatefulSet.
   */
  K8S_STATEFULSET_NAME,

  /**
   * The UID of the DaemonSet.
   */
  K8S_DAEMONSET_UID,

  /**
   * The name of the DaemonSet.
   */
  K8S_DAEMONSET_NAME,

  /**
   * The UID of the Job.
   */
  K8S_JOB_UID,

  /**
   * The name of the Job.
   */
  K8S_JOB_NAME,

  /**
   * The UID of the CronJob.
   */
  K8S_CRONJOB_UID,

  /**
   * The name of the CronJob.
   */
  K8S_CRONJOB_NAME,

  /**
   * The operating system type.
   */
  OS_TYPE,

  /**
   * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
   */
  OS_DESCRIPTION,

  /**
   * Human readable operating system name.
   */
  OS_NAME,

  /**
   * The version string of the operating system as defined in [Version Attributes](../../resource/semantic_conventions/README.md#version-attributes).
   */
  OS_VERSION,

  /**
   * Process identifier (PID).
   */
  PROCESS_PID,

  /**
   * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
   */
  PROCESS_EXECUTABLE_NAME,

  /**
   * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
   */
  PROCESS_EXECUTABLE_PATH,

  /**
   * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
   */
  PROCESS_COMMAND,

  /**
   * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
   */
  PROCESS_COMMAND_LINE,

  /**
   * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
   */
  PROCESS_COMMAND_ARGS,

  /**
   * The username of the user that owns the process.
   */
  PROCESS_OWNER,

  /**
   * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
   */
  PROCESS_RUNTIME_NAME,

  /**
   * The version of the runtime of this process, as returned by the runtime without modification.
   */
  PROCESS_RUNTIME_VERSION,

  /**
   * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
   */
  PROCESS_RUNTIME_DESCRIPTION,

  /**
   * Logical name of the service.
   *
   * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
   */
  SERVICE_NAME,

  /**
   * A namespace for `service.name`.
   *
   * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
   */
  SERVICE_NAMESPACE,

  /**
   * The string ID of the service instance.
   *
   * Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
   */
  SERVICE_INSTANCE_ID,

  /**
   * The version string of the service API or implementation.
   */
  SERVICE_VERSION,

  /**
   * The name of the telemetry SDK as defined above.
   */
  TELEMETRY_SDK_NAME,

  /**
   * The language of the telemetry SDK.
   */
  TELEMETRY_SDK_LANGUAGE,

  /**
   * The version string of the telemetry SDK.
   */
  TELEMETRY_SDK_VERSION,

  /**
   * The version string of the auto instrumentation agent, if used.
   */
  TELEMETRY_AUTO_VERSION,

  /**
   * The name of the web engine.
   */
  WEBENGINE_NAME,

  /**
   * The version of the web engine.
   */
  WEBENGINE_VERSION,

  /**
   * Additional description of the web engine (e.g. detailed version and edition information).
   */
  WEBENGINE_DESCRIPTION,
};

export const CloudProviderValues = {
  /** Alibaba Cloud. */
  ALIBABA_CLOUD: 'alibaba_cloud',
  /** Amazon Web Services. */
  AWS: 'aws',
  /** Microsoft Azure. */
  AZURE: 'azure',
  /** Google Cloud Platform. */
  GCP: 'gcp',
} as const;
export type CloudProviderValues =
  typeof CloudProviderValues[keyof typeof CloudProviderValues];

export const CloudPlatformValues = {
  /** Alibaba Cloud Elastic Compute Service. */
  ALIBABA_CLOUD_ECS: 'alibaba_cloud_ecs',
  /** Alibaba Cloud Function Compute. */
  ALIBABA_CLOUD_FC: 'alibaba_cloud_fc',
  /** AWS Elastic Compute Cloud. */
  AWS_EC2: 'aws_ec2',
  /** AWS Elastic Container Service. */
  AWS_ECS: 'aws_ecs',
  /** AWS Elastic Kubernetes Service. */
  AWS_EKS: 'aws_eks',
  /** AWS Lambda. */
  AWS_LAMBDA: 'aws_lambda',
  /** AWS Elastic Beanstalk. */
  AWS_ELASTIC_BEANSTALK: 'aws_elastic_beanstalk',
  /** Azure Virtual Machines. */
  AZURE_VM: 'azure_vm',
  /** Azure Container Instances. */
  AZURE_CONTAINER_INSTANCES: 'azure_container_instances',
  /** Azure Kubernetes Service. */
  AZURE_AKS: 'azure_aks',
  /** Azure Functions. */
  AZURE_FUNCTIONS: 'azure_functions',
  /** Azure App Service. */
  AZURE_APP_SERVICE: 'azure_app_service',
  /** Google Cloud Compute Engine (GCE). */
  GCP_COMPUTE_ENGINE: 'gcp_compute_engine',
  /** Google Cloud Run. */
  GCP_CLOUD_RUN: 'gcp_cloud_run',
  /** Google Cloud Kubernetes Engine (GKE). */
  GCP_KUBERNETES_ENGINE: 'gcp_kubernetes_engine',
  /** Google Cloud Functions (GCF). */
  GCP_CLOUD_FUNCTIONS: 'gcp_cloud_functions',
  /** Google Cloud App Engine (GAE). */
  GCP_APP_ENGINE: 'gcp_app_engine',
} as const;
export type CloudPlatformValues =
  typeof CloudPlatformValues[keyof typeof CloudPlatformValues];

export const AwsEcsLaunchtypeValues = {
  /** ec2. */
  EC2: 'ec2',
  /** fargate. */
  FARGATE: 'fargate',
} as const;
export type AwsEcsLaunchtypeValues =
  typeof AwsEcsLaunchtypeValues[keyof typeof AwsEcsLaunchtypeValues];

export const HostArchValues = {
  /** AMD64. */
  AMD64: 'amd64',
  /** ARM32. */
  ARM32: 'arm32',
  /** ARM64. */
  ARM64: 'arm64',
  /** Itanium. */
  IA64: 'ia64',
  /** 32-bit PowerPC. */
  PPC32: 'ppc32',
  /** 64-bit PowerPC. */
  PPC64: 'ppc64',
  /** 32-bit x86. */
  X86: 'x86',
} as const;
export type HostArchValues = typeof HostArchValues[keyof typeof HostArchValues];

export const OsTypeValues = {
  /** Microsoft Windows. */
  WINDOWS: 'windows',
  /** Linux. */
  LINUX: 'linux',
  /** Apple Darwin. */
  DARWIN: 'darwin',
  /** FreeBSD. */
  FREEBSD: 'freebsd',
  /** NetBSD. */
  NETBSD: 'netbsd',
  /** OpenBSD. */
  OPENBSD: 'openbsd',
  /** DragonFly BSD. */
  DRAGONFLYBSD: 'dragonflybsd',
  /** HP-UX (Hewlett Packard Unix). */
  HPUX: 'hpux',
  /** AIX (Advanced Interactive eXecutive). */
  AIX: 'aix',
  /** Oracle Solaris. */
  SOLARIS: 'solaris',
  /** IBM z/OS. */
  Z_OS: 'z_os',
} as const;
export type OsTypeValues = typeof OsTypeValues[keyof typeof OsTypeValues];

export const TelemetrySdkLanguageValues = {
  /** cpp. */
  CPP: 'cpp',
  /** dotnet. */
  DOTNET: 'dotnet',
  /** erlang. */
  ERLANG: 'erlang',
  /** go. */
  GO: 'go',
  /** java. */
  JAVA: 'java',
  /** nodejs. */
  NODEJS: 'nodejs',
  /** php. */
  PHP: 'php',
  /** python. */
  PYTHON: 'python',
  /** ruby. */
  RUBY: 'ruby',
  /** webjs. */
  WEBJS: 'webjs',
} as const;
export type TelemetrySdkLanguageValues =
  typeof TelemetrySdkLanguageValues[keyof typeof TelemetrySdkLanguageValues];
