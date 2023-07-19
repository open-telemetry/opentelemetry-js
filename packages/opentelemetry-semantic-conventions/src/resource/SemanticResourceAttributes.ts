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
export const SemanticResourceAttributes = {
  /**
   * Array of brand name and version separated by a space.
   *
   * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
   */
  BROWSER_BRANDS: 'browser.brands',

  /**
  * The platform on which the browser is running.
  *
  * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API SHOULD NOT be used instead and this attribute SHOULD be left unset in order for the values to be consistent.
The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
  */
  BROWSER_PLATFORM: 'browser.platform',

  /**
   * A boolean that is true if the browser is running on a mobile device.
   *
   * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute SHOULD be left unset.
   */
  BROWSER_MOBILE: 'browser.mobile',

  /**
   * Full user-agent string provided by the browser.
   *
   * Note: The user-agent value SHOULD be provided only from browsers that do not have a mechanism to retrieve brands and platform individually from the User-Agent Client Hints API. To retrieve the value, the legacy `navigator.userAgent` API can be used.
   */
  BROWSER_USER_AGENT: 'browser.user_agent',

  /**
   * Preferred language of the user using the browser.
   *
   * Note: This value is intended to be taken from the Navigator API `navigator.language`.
   */
  BROWSER_LANGUAGE: 'browser.language',

  /**
   * Name of the cloud provider.
   */
  CLOUD_PROVIDER: 'cloud.provider',

  /**
   * The cloud account ID the resource is assigned to.
   */
  CLOUD_ACCOUNT_ID: 'cloud.account.id',

  /**
   * The geographical region the resource is running.
   *
   * Note: Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/en-us/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://intl.cloud.tencent.com/document/product/213/6091).
   */
  CLOUD_REGION: 'cloud.region',

  /**
   * Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
   *
   * Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
   */
  CLOUD_AVAILABILITY_ZONE: 'cloud.availability_zone',

  /**
   * The cloud platform in use.
   *
   * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
   */
  CLOUD_PLATFORM: 'cloud.platform',

  /**
   * The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
   */
  AWS_ECS_CONTAINER_ARN: 'aws.ecs.container.arn',

  /**
   * The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
   */
  AWS_ECS_CLUSTER_ARN: 'aws.ecs.cluster.arn',

  /**
   * The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
   */
  AWS_ECS_LAUNCHTYPE: 'aws.ecs.launchtype',

  /**
   * The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
   */
  AWS_ECS_TASK_ARN: 'aws.ecs.task.arn',

  /**
   * The task definition family this task definition is a member of.
   */
  AWS_ECS_TASK_FAMILY: 'aws.ecs.task.family',

  /**
   * The revision for this task definition.
   */
  AWS_ECS_TASK_REVISION: 'aws.ecs.task.revision',

  /**
   * The ARN of an EKS cluster.
   */
  AWS_EKS_CLUSTER_ARN: 'aws.eks.cluster.arn',

  /**
   * The name(s) of the AWS log group(s) an application is writing to.
   *
   * Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
   */
  AWS_LOG_GROUP_NAMES: 'aws.log.group.names',

  /**
   * The Amazon Resource Name(s) (ARN) of the AWS log group(s).
   *
   * Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
   */
  AWS_LOG_GROUP_ARNS: 'aws.log.group.arns',

  /**
   * The name(s) of the AWS log stream(s) an application is writing to.
   */
  AWS_LOG_STREAM_NAMES: 'aws.log.stream.names',

  /**
   * The ARN(s) of the AWS log stream(s).
   *
   * Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
   */
  AWS_LOG_STREAM_ARNS: 'aws.log.stream.arns',

  /**
   * Container name used by container runtime.
   */
  CONTAINER_NAME: 'container.name',

  /**
   * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
   */
  CONTAINER_ID: 'container.id',

  /**
   * The container runtime managing this container.
   */
  CONTAINER_RUNTIME: 'container.runtime',

  /**
   * Name of the image the container was built on.
   */
  CONTAINER_IMAGE_NAME: 'container.image.name',

  /**
   * Container image tag.
   */
  CONTAINER_IMAGE_TAG: 'container.image.tag',

  /**
   * Name of the [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
   */
  DEPLOYMENT_ENVIRONMENT: 'deployment.environment',

  /**
   * A unique identifier representing the device.
   *
   * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
   */
  DEVICE_ID: 'device.id',

  /**
   * The model identifier for the device.
   *
   * Note: It&#39;s recommended this value represents a machine readable version of the model identifier rather than the market or consumer-friendly name of the device.
   */
  DEVICE_MODEL_IDENTIFIER: 'device.model.identifier',

  /**
   * The marketing name for the device model.
   *
   * Note: It&#39;s recommended this value represents a human readable version of the device model rather than a machine readable alternative.
   */
  DEVICE_MODEL_NAME: 'device.model.name',

  /**
   * The name of the device manufacturer.
   *
   * Note: The Android OS provides this field via [Build](https://developer.android.com/reference/android/os/Build#MANUFACTURER). iOS apps SHOULD hardcode the value `Apple`.
   */
  DEVICE_MANUFACTURER: 'device.manufacturer',

  /**
  * The name of the single function that this runtime instance executes.
  *
  * Note: This is the name of the function as configured/deployed on the FaaS
platform and is usually different from the name of the callback
function (which may be stored in the
[`code.namespace`/`code.function`](../../trace/semantic_conventions/span-general.md#source-code-attributes)
span attributes).

For some cloud providers, the above definition is ambiguous. The following
definition of function name MUST be used for this attribute
(and consequently the span name) for the listed cloud providers/products:

* **Azure:**  The full name `&lt;FUNCAPP&gt;/&lt;FUNC&gt;`, i.e., function app name
  followed by a forward slash followed by the function name (this form
  can also be seen in the resource JSON for the function).
  This means that a span attribute MUST be used, as an Azure function
  app can host multiple functions that would usually share
  a TracerProvider (see also the `faas.id` attribute).
  */
  FAAS_NAME: 'faas.name',

  /**
  * The unique ID of the single function that this runtime instance executes.
  *
  * Note: On some cloud providers, it may not be possible to determine the full ID at startup,
so consider setting `faas.id` as a span attribute instead.

The exact value to use for `faas.id` depends on the cloud provider:

* **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
  Take care not to use the &#34;invoked ARN&#34; directly but replace any
  [alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html)
  with the resolved function version, as the same runtime instance may be invokable with
  multiple different aliases.
* **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
* **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/en-us/rest/api/resources/resources/get-by-id) of the invoked function,
  *not* the function app, having the form
  `/subscriptions/&lt;SUBSCIPTION_GUID&gt;/resourceGroups/&lt;RG&gt;/providers/Microsoft.Web/sites/&lt;FUNCAPP&gt;/functions/&lt;FUNC&gt;`.
  This means that a span attribute MUST be used, as an Azure function app can host multiple functions that would usually share
  a TracerProvider.
  */
  FAAS_ID: 'faas.id',

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
  FAAS_VERSION: 'faas.version',

  /**
   * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
   *
   * Note: * **AWS Lambda:** Use the (full) log stream name.
   */
  FAAS_INSTANCE: 'faas.instance',

  /**
   * The amount of memory available to the serverless function in MiB.
   *
   * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information.
   */
  FAAS_MAX_MEMORY: 'faas.max_memory',

  /**
   * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized Linux systems, the `machine-id` located in `/etc/machine-id` or `/var/lib/dbus/machine-id` may be used.
   */
  HOST_ID: 'host.id',

  /**
   * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
   */
  HOST_NAME: 'host.name',

  /**
   * Type of host. For Cloud, this must be the machine type.
   */
  HOST_TYPE: 'host.type',

  /**
   * The CPU architecture the host system is running on.
   */
  HOST_ARCH: 'host.arch',

  /**
   * Name of the VM image or OS install the host was instantiated from.
   */
  HOST_IMAGE_NAME: 'host.image.name',

  /**
   * VM image ID. For Cloud, this value is from the provider.
   */
  HOST_IMAGE_ID: 'host.image.id',

  /**
   * The version string of the VM image as defined in [Version Attributes](README.md#version-attributes).
   */
  HOST_IMAGE_VERSION: 'host.image.version',

  /**
   * The name of the cluster.
   */
  K8S_CLUSTER_NAME: 'k8s.cluster.name',

  /**
   * The name of the Node.
   */
  K8S_NODE_NAME: 'k8s.node.name',

  /**
   * The UID of the Node.
   */
  K8S_NODE_UID: 'k8s.node.uid',

  /**
   * The name of the namespace that the pod is running in.
   */
  K8S_NAMESPACE_NAME: 'k8s.namespace.name',

  /**
   * The UID of the Pod.
   */
  K8S_POD_UID: 'k8s.pod.uid',

  /**
   * The name of the Pod.
   */
  K8S_POD_NAME: 'k8s.pod.name',

  /**
   * The name of the Container from Pod specification, must be unique within a Pod. Container runtime usually uses different globally unique name (`container.name`).
   */
  K8S_CONTAINER_NAME: 'k8s.container.name',

  /**
   * Number of times the container was restarted. This attribute can be used to identify a particular container (running or stopped) within a container spec.
   */
  K8S_CONTAINER_RESTART_COUNT: 'k8s.container.restart_count',

  /**
   * The UID of the ReplicaSet.
   */
  K8S_REPLICASET_UID: 'k8s.replicaset.uid',

  /**
   * The name of the ReplicaSet.
   */
  K8S_REPLICASET_NAME: 'k8s.replicaset.name',

  /**
   * The UID of the Deployment.
   */
  K8S_DEPLOYMENT_UID: 'k8s.deployment.uid',

  /**
   * The name of the Deployment.
   */
  K8S_DEPLOYMENT_NAME: 'k8s.deployment.name',

  /**
   * The UID of the StatefulSet.
   */
  K8S_STATEFULSET_UID: 'k8s.statefulset.uid',

  /**
   * The name of the StatefulSet.
   */
  K8S_STATEFULSET_NAME: 'k8s.statefulset.name',

  /**
   * The UID of the DaemonSet.
   */
  K8S_DAEMONSET_UID: 'k8s.daemonset.uid',

  /**
   * The name of the DaemonSet.
   */
  K8S_DAEMONSET_NAME: 'k8s.daemonset.name',

  /**
   * The UID of the Job.
   */
  K8S_JOB_UID: 'k8s.job.uid',

  /**
   * The name of the Job.
   */
  K8S_JOB_NAME: 'k8s.job.name',

  /**
   * The UID of the CronJob.
   */
  K8S_CRONJOB_UID: 'k8s.cronjob.uid',

  /**
   * The name of the CronJob.
   */
  K8S_CRONJOB_NAME: 'k8s.cronjob.name',

  /**
   * The operating system type.
   */
  OS_TYPE: 'os.type',

  /**
   * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
   */
  OS_DESCRIPTION: 'os.description',

  /**
   * Human readable operating system name.
   */
  OS_NAME: 'os.name',

  /**
   * The version string of the operating system as defined in [Version Attributes](../../resource/semantic_conventions/README.md#version-attributes).
   */
  OS_VERSION: 'os.version',

  /**
   * Process identifier (PID).
   */
  PROCESS_PID: 'process.pid',

  /**
   * Parent Process identifier (PID).
   */
  PROCESS_PARENT_PID: 'process.parent_pid',

  /**
   * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
   */
  PROCESS_EXECUTABLE_NAME: 'process.executable.name',

  /**
   * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
   */
  PROCESS_EXECUTABLE_PATH: 'process.executable.path',

  /**
   * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
   */
  PROCESS_COMMAND: 'process.command',

  /**
   * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
   */
  PROCESS_COMMAND_LINE: 'process.command_line',

  /**
   * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
   */
  PROCESS_COMMAND_ARGS: 'process.command_args',

  /**
   * The username of the user that owns the process.
   */
  PROCESS_OWNER: 'process.owner',

  /**
   * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
   */
  PROCESS_RUNTIME_NAME: 'process.runtime.name',

  /**
   * The version of the runtime of this process, as returned by the runtime without modification.
   */
  PROCESS_RUNTIME_VERSION: 'process.runtime.version',

  /**
   * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
   */
  PROCESS_RUNTIME_DESCRIPTION: 'process.runtime.description',

  /**
   * Logical name of the service.
   *
   * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
   */
  SERVICE_NAME: 'service.name',

  /**
   * A namespace for `service.name`.
   *
   * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
   */
  SERVICE_NAMESPACE: 'service.namespace',

  /**
   * The string ID of the service instance.
   *
   * Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
   */
  SERVICE_INSTANCE_ID: 'service.instance.id',

  /**
   * The version string of the service API or implementation.
   */
  SERVICE_VERSION: 'service.version',

  /**
   * The name of the telemetry SDK as defined above.
   */
  TELEMETRY_SDK_NAME: 'telemetry.sdk.name',

  /**
   * The language of the telemetry SDK.
   */
  TELEMETRY_SDK_LANGUAGE: 'telemetry.sdk.language',

  /**
   * The version string of the telemetry SDK.
   */
  TELEMETRY_SDK_VERSION: 'telemetry.sdk.version',

  /**
   * The version string of the auto instrumentation agent, if used.
   */
  TELEMETRY_AUTO_VERSION: 'telemetry.auto.version',

  /**
   * The name of the web engine.
   */
  WEBENGINE_NAME: 'webengine.name',

  /**
   * The version of the web engine.
   */
  WEBENGINE_VERSION: 'webengine.version',

  /**
   * Additional description of the web engine (e.g. detailed version and edition information).
   */
  WEBENGINE_DESCRIPTION: 'webengine.description',

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
  /** IBM Cloud. */
  IBM_CLOUD: 'ibm_cloud',
  /** Tencent Cloud. */
  TENCENT_CLOUD: 'tencent_cloud',
} as const;
export type CloudProviderValues =
  (typeof CloudProviderValues)[keyof typeof CloudProviderValues];

export const CloudPlatformValues = {
  /** Alibaba Cloud Elastic Compute Service. */
  ALIBABA_CLOUD_ECS: 'alibaba_cloud_ecs',
  /** Alibaba Cloud Function Compute. */
  ALIBABA_CLOUD_FC: 'alibaba_cloud_fc',
  /** Red Hat OpenShift on Alibaba Cloud. */
  ALIBABA_CLOUD_OPENSHIFT: 'alibaba_cloud_openshift',
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
  /** AWS App Runner. */
  AWS_APP_RUNNER: 'aws_app_runner',
  /** Red Hat OpenShift on AWS (ROSA). */
  AWS_OPENSHIFT: 'aws_openshift',
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
  /** Azure Red Hat OpenShift. */
  AZURE_OPENSHIFT: 'azure_openshift',
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
  /** Red Hat OpenShift on Google Cloud. */
  GOOGLE_CLOUD_OPENSHIFT: 'google_cloud_openshift',
  /** Red Hat OpenShift on IBM Cloud. */
  IBM_CLOUD_OPENSHIFT: 'ibm_cloud_openshift',
  /** Tencent Cloud Cloud Virtual Machine (CVM). */
  TENCENT_CLOUD_CVM: 'tencent_cloud_cvm',
  /** Tencent Cloud Elastic Kubernetes Service (EKS). */
  TENCENT_CLOUD_EKS: 'tencent_cloud_eks',
  /** Tencent Cloud Serverless Cloud Function (SCF). */
  TENCENT_CLOUD_SCF: 'tencent_cloud_scf',
} as const;
export type CloudPlatformValues =
  (typeof CloudPlatformValues)[keyof typeof CloudPlatformValues];

export const AwsEcsLaunchtypeValues = {
  /** ec2. */
  EC2: 'ec2',
  /** fargate. */
  FARGATE: 'fargate',
} as const;
export type AwsEcsLaunchtypeValues =
  (typeof AwsEcsLaunchtypeValues)[keyof typeof AwsEcsLaunchtypeValues];

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
  /** IBM z/Architecture. */
  S390X: 's390x',
  /** 32-bit x86. */
  X86: 'x86',
} as const;
export type HostArchValues =
  (typeof HostArchValues)[keyof typeof HostArchValues];

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
  /** SunOS, Oracle Solaris. */
  SOLARIS: 'solaris',
  /** IBM z/OS. */
  Z_OS: 'z_os',
} as const;
export type OsTypeValues = (typeof OsTypeValues)[keyof typeof OsTypeValues];

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
  /** swift. */
  SWIFT: 'swift',
} as const;
export type TelemetrySdkLanguageValues =
  (typeof TelemetrySdkLanguageValues)[keyof typeof TelemetrySdkLanguageValues];
