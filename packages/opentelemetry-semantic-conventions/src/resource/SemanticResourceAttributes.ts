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
const TMP_CLOUD_ACCOUNT_ID = 'cloud.account.id';
const TMP_CLOUD_AVAILABILITY_ZONE = 'cloud.availability_zone';
const TMP_CLOUD_PLATFORM = 'cloud.platform';
const TMP_CLOUD_PROVIDER = 'cloud.provider';
const TMP_CLOUD_REGION = 'cloud.region';
const TMP_CLOUD_RESOURCE_ID = 'cloud.resource_id';
const TMP_CONTAINER_COMMAND = 'container.command';
const TMP_CONTAINER_COMMAND_ARGS = 'container.command_args';
const TMP_CONTAINER_COMMAND_LINE = 'container.command_line';
const TMP_CONTAINER_ID = 'container.id';
const TMP_CONTAINER_IMAGE_ID = 'container.image.id';
const TMP_CONTAINER_IMAGE_NAME = 'container.image.name';
const TMP_CONTAINER_IMAGE_REPO_DIGESTS = 'container.image.repo_digests';
const TMP_CONTAINER_IMAGE_TAGS = 'container.image.tags';
const TMP_CONTAINER_NAME = 'container.name';
const TMP_CONTAINER_RUNTIME = 'container.runtime';
const TMP_DEVICE_ID = 'device.id';
const TMP_DEVICE_MANUFACTURER = 'device.manufacturer';
const TMP_DEVICE_MODEL_IDENTIFIER = 'device.model.identifier';
const TMP_DEVICE_MODEL_NAME = 'device.model.name';
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
const TMP_OCI_MANIFEST_DIGEST = 'oci.manifest.digest';
const TMP_OS_BUILD_ID = 'os.build_id';
const TMP_OS_DESCRIPTION = 'os.description';
const TMP_OS_NAME = 'os.name';
const TMP_OS_TYPE = 'os.type';
const TMP_OS_VERSION = 'os.version';
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
const TMP_ANDROID_OS_API_LEVEL = 'android.os.api_level';
const TMP_BROWSER_BRANDS = 'browser.brands';
const TMP_BROWSER_LANGUAGE = 'browser.language';
const TMP_BROWSER_MOBILE = 'browser.mobile';
const TMP_BROWSER_PLATFORM = 'browser.platform';
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
const TMP_GCP_CLOUD_RUN_JOB_EXECUTION = 'gcp.cloud_run.job.execution';
const TMP_GCP_CLOUD_RUN_JOB_TASK_INDEX = 'gcp.cloud_run.job.task_index';
const TMP_GCP_GCE_INSTANCE_HOSTNAME = 'gcp.gce.instance.hostname';
const TMP_GCP_GCE_INSTANCE_NAME = 'gcp.gce.instance.name';
const TMP_HEROKU_APP_ID = 'heroku.app.id';
const TMP_HEROKU_RELEASE_COMMIT = 'heroku.release.commit';
const TMP_HEROKU_RELEASE_CREATION_TIMESTAMP = 'heroku.release.creation_timestamp';
const TMP_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
const TMP_FAAS_INSTANCE = 'faas.instance';
const TMP_FAAS_MAX_MEMORY = 'faas.max_memory';
const TMP_FAAS_NAME = 'faas.name';
const TMP_FAAS_VERSION = 'faas.version';
const TMP_SERVICE_NAME = 'service.name';
const TMP_SERVICE_VERSION = 'service.version';
const TMP_SERVICE_INSTANCE_ID = 'service.instance.id';
const TMP_SERVICE_NAMESPACE = 'service.namespace';
const TMP_TELEMETRY_SDK_LANGUAGE = 'telemetry.sdk.language';
const TMP_TELEMETRY_SDK_NAME = 'telemetry.sdk.name';
const TMP_TELEMETRY_SDK_VERSION = 'telemetry.sdk.version';
const TMP_TELEMETRY_DISTRO_NAME = 'telemetry.distro.name';
const TMP_TELEMETRY_DISTRO_VERSION = 'telemetry.distro.version';
const TMP_WEBENGINE_DESCRIPTION = 'webengine.description';
const TMP_WEBENGINE_NAME = 'webengine.name';
const TMP_WEBENGINE_VERSION = 'webengine.version';
const TMP_OTEL_SCOPE_NAME = 'otel.scope.name';
const TMP_OTEL_SCOPE_VERSION = 'otel.scope.version';
const TMP_OTEL_LIBRARY_NAME = 'otel.library.name';
const TMP_OTEL_LIBRARY_VERSION = 'otel.library.version';

/**
* The cloud account ID the resource is assigned to.
*/
export const SEMRESATTRS_CLOUD_ACCOUNT_ID = TMP_CLOUD_ACCOUNT_ID;

/**
* Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
*
* Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
*/
export const SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = TMP_CLOUD_AVAILABILITY_ZONE;

/**
* The cloud platform in use.
*
* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
*/
export const SEMRESATTRS_CLOUD_PLATFORM = TMP_CLOUD_PLATFORM;

/**
* Name of the cloud provider.
*/
export const SEMRESATTRS_CLOUD_PROVIDER = TMP_CLOUD_PROVIDER;

/**
* The geographical region the resource is running.
*
* Note: Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://www.tencentcloud.com/document/product/213/6091).
*/
export const SEMRESATTRS_CLOUD_REGION = TMP_CLOUD_REGION;

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
export const SEMRESATTRS_CLOUD_RESOURCE_ID = TMP_CLOUD_RESOURCE_ID;

/**
* The command used to run the container (i.e. the command name).
*
* Note: If using embedded credentials or sensitive data, it is recommended to remove them to prevent potential leakage.
*/
export const SEMRESATTRS_CONTAINER_COMMAND = TMP_CONTAINER_COMMAND;

/**
* All the command arguments (including the command/executable itself) run by the container. [2].
*/
export const SEMRESATTRS_CONTAINER_COMMAND_ARGS = TMP_CONTAINER_COMMAND_ARGS;

/**
* The full command run by the container as a single string representing the full command. [2].
*/
export const SEMRESATTRS_CONTAINER_COMMAND_LINE = TMP_CONTAINER_COMMAND_LINE;

/**
* Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
*/
export const SEMRESATTRS_CONTAINER_ID = TMP_CONTAINER_ID;

/**
* Runtime specific image identifier. Usually a hash algorithm followed by a UUID.
*
* Note: Docker defines a sha256 of the image id; `container.image.id` corresponds to the `Image` field from the Docker container inspect [API](https://docs.docker.com/engine/api/v1.43/#tag/Container/operation/ContainerInspect) endpoint.
K8s defines a link to the container registry repository with digest `&#34;imageID&#34;: &#34;registry.azurecr.io /namespace/service/dockerfile@sha256:bdeabd40c3a8a492eaf9e8e44d0ebbb84bac7ee25ac0cf8a7159d25f62555625&#34;`.
The ID is assinged by the container runtime and can vary in different environments. Consider using `oci.manifest.digest` if it is important to identify the same image in different environments/runtimes.
*/
export const SEMRESATTRS_CONTAINER_IMAGE_ID = TMP_CONTAINER_IMAGE_ID;

/**
* Name of the image the container was built on.
*/
export const SEMRESATTRS_CONTAINER_IMAGE_NAME = TMP_CONTAINER_IMAGE_NAME;

/**
* Repo digests of the container image as provided by the container runtime.
*
* Note: [Docker](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect) and [CRI](https://github.com/kubernetes/cri-api/blob/c75ef5b473bbe2d0a4fc92f82235efd665ea8e9f/pkg/apis/runtime/v1/api.proto#L1237-L1238) report those under the `RepoDigests` field.
*/
export const SEMRESATTRS_CONTAINER_IMAGE_REPO_DIGESTS = TMP_CONTAINER_IMAGE_REPO_DIGESTS;

/**
* Container image tags. An example can be found in [Docker Image Inspect](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect). Should be only the `&lt;tag&gt;` section of the full name for example from `registry.example.com/my-org/my-image:&lt;tag&gt;`.
*/
export const SEMRESATTRS_CONTAINER_IMAGE_TAGS = TMP_CONTAINER_IMAGE_TAGS;

/**
* Container name used by container runtime.
*/
export const SEMRESATTRS_CONTAINER_NAME = TMP_CONTAINER_NAME;

/**
* The container runtime managing this container.
*/
export const SEMRESATTRS_CONTAINER_RUNTIME = TMP_CONTAINER_RUNTIME;

/**
* A unique identifier representing the device.
*
* Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
*/
export const SEMRESATTRS_DEVICE_ID = TMP_DEVICE_ID;

/**
* The name of the device manufacturer.
*
* Note: The Android OS provides this field via [Build](https://developer.android.com/reference/android/os/Build#MANUFACTURER). iOS apps SHOULD hardcode the value `Apple`.
*/
export const SEMRESATTRS_DEVICE_MANUFACTURER = TMP_DEVICE_MANUFACTURER;

/**
* The model identifier for the device.
*
* Note: It&#39;s recommended this value represents a machine-readable version of the model identifier rather than the market or consumer-friendly name of the device.
*/
export const SEMRESATTRS_DEVICE_MODEL_IDENTIFIER = TMP_DEVICE_MODEL_IDENTIFIER;

/**
* The marketing name for the device model.
*
* Note: It&#39;s recommended this value represents a human-readable version of the device model rather than a machine-readable alternative.
*/
export const SEMRESATTRS_DEVICE_MODEL_NAME = TMP_DEVICE_MODEL_NAME;

/**
* The CPU architecture the host system is running on.
*/
export const SEMRESATTRS_HOST_ARCH = TMP_HOST_ARCH;

/**
* The amount of level 2 memory cache available to the processor (in Bytes).
*/
export const SEMRESATTRS_HOST_CPU_CACHE_L2_SIZE = TMP_HOST_CPU_CACHE_L2_SIZE;

/**
* Family or generation of the CPU.
*/
export const SEMRESATTRS_HOST_CPU_FAMILY = TMP_HOST_CPU_FAMILY;

/**
* Model identifier. It provides more granular information about the CPU, distinguishing it from other CPUs within the same family.
*/
export const SEMRESATTRS_HOST_CPU_MODEL_ID = TMP_HOST_CPU_MODEL_ID;

/**
* Model designation of the processor.
*/
export const SEMRESATTRS_HOST_CPU_MODEL_NAME = TMP_HOST_CPU_MODEL_NAME;

/**
* Stepping or core revisions.
*/
export const SEMRESATTRS_HOST_CPU_STEPPING = TMP_HOST_CPU_STEPPING;

/**
* Processor manufacturer identifier. A maximum 12-character string.
*
* Note: [CPUID](https://wiki.osdev.org/CPUID) command returns the vendor ID string in EBX, EDX and ECX registers. Writing these to memory in this order results in a 12-character string.
*/
export const SEMRESATTRS_HOST_CPU_VENDOR_ID = TMP_HOST_CPU_VENDOR_ID;

/**
* Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized systems, this should be the `machine-id`. See the table below for the sources to use to determine the `machine-id` based on operating system.
*/
export const SEMRESATTRS_HOST_ID = TMP_HOST_ID;

/**
* VM image ID or host OS image ID. For Cloud, this value is from the provider.
*/
export const SEMRESATTRS_HOST_IMAGE_ID = TMP_HOST_IMAGE_ID;

/**
* Name of the VM image or OS install the host was instantiated from.
*/
export const SEMRESATTRS_HOST_IMAGE_NAME = TMP_HOST_IMAGE_NAME;

/**
* The version string of the VM image or host OS as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
*/
export const SEMRESATTRS_HOST_IMAGE_VERSION = TMP_HOST_IMAGE_VERSION;

/**
* Available IP addresses of the host, excluding loopback interfaces.
*
* Note: IPv4 Addresses MUST be specified in dotted-quad notation. IPv6 addresses MUST be specified in the [RFC 5952](https://www.rfc-editor.org/rfc/rfc5952.html) format.
*/
export const SEMRESATTRS_HOST_IP = TMP_HOST_IP;

/**
* Available MAC addresses of the host, excluding loopback interfaces.
*
* Note: MAC Addresses MUST be represented in [IEEE RA hexadecimal form](https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf): as hyphen-separated octets in uppercase hexadecimal form from most to least significant.
*/
export const SEMRESATTRS_HOST_MAC = TMP_HOST_MAC;

/**
* Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
*/
export const SEMRESATTRS_HOST_NAME = TMP_HOST_NAME;

/**
* Type of host. For Cloud, this must be the machine type.
*/
export const SEMRESATTRS_HOST_TYPE = TMP_HOST_TYPE;

/**
* The name of the cluster.
*/
export const SEMRESATTRS_K8S_CLUSTER_NAME = TMP_K8S_CLUSTER_NAME;

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
export const SEMRESATTRS_K8S_CLUSTER_UID = TMP_K8S_CLUSTER_UID;

/**
* The name of the Container from Pod specification, must be unique within a Pod. Container runtime usually uses different globally unique name (`container.name`).
*/
export const SEMRESATTRS_K8S_CONTAINER_NAME = TMP_K8S_CONTAINER_NAME;

/**
* Number of times the container was restarted. This attribute can be used to identify a particular container (running or stopped) within a container spec.
*/
export const SEMRESATTRS_K8S_CONTAINER_RESTART_COUNT = TMP_K8S_CONTAINER_RESTART_COUNT;

/**
* The name of the CronJob.
*/
export const SEMRESATTRS_K8S_CRONJOB_NAME = TMP_K8S_CRONJOB_NAME;

/**
* The UID of the CronJob.
*/
export const SEMRESATTRS_K8S_CRONJOB_UID = TMP_K8S_CRONJOB_UID;

/**
* The name of the DaemonSet.
*/
export const SEMRESATTRS_K8S_DAEMONSET_NAME = TMP_K8S_DAEMONSET_NAME;

/**
* The UID of the DaemonSet.
*/
export const SEMRESATTRS_K8S_DAEMONSET_UID = TMP_K8S_DAEMONSET_UID;

/**
* The name of the Deployment.
*/
export const SEMRESATTRS_K8S_DEPLOYMENT_NAME = TMP_K8S_DEPLOYMENT_NAME;

/**
* The UID of the Deployment.
*/
export const SEMRESATTRS_K8S_DEPLOYMENT_UID = TMP_K8S_DEPLOYMENT_UID;

/**
* The name of the Job.
*/
export const SEMRESATTRS_K8S_JOB_NAME = TMP_K8S_JOB_NAME;

/**
* The UID of the Job.
*/
export const SEMRESATTRS_K8S_JOB_UID = TMP_K8S_JOB_UID;

/**
* The name of the namespace that the pod is running in.
*/
export const SEMRESATTRS_K8S_NAMESPACE_NAME = TMP_K8S_NAMESPACE_NAME;

/**
* The name of the Node.
*/
export const SEMRESATTRS_K8S_NODE_NAME = TMP_K8S_NODE_NAME;

/**
* The UID of the Node.
*/
export const SEMRESATTRS_K8S_NODE_UID = TMP_K8S_NODE_UID;

/**
* The name of the Pod.
*/
export const SEMRESATTRS_K8S_POD_NAME = TMP_K8S_POD_NAME;

/**
* The UID of the Pod.
*/
export const SEMRESATTRS_K8S_POD_UID = TMP_K8S_POD_UID;

/**
* The name of the ReplicaSet.
*/
export const SEMRESATTRS_K8S_REPLICASET_NAME = TMP_K8S_REPLICASET_NAME;

/**
* The UID of the ReplicaSet.
*/
export const SEMRESATTRS_K8S_REPLICASET_UID = TMP_K8S_REPLICASET_UID;

/**
* The name of the StatefulSet.
*/
export const SEMRESATTRS_K8S_STATEFULSET_NAME = TMP_K8S_STATEFULSET_NAME;

/**
* The UID of the StatefulSet.
*/
export const SEMRESATTRS_K8S_STATEFULSET_UID = TMP_K8S_STATEFULSET_UID;

/**
* The digest of the OCI image manifest. For container images specifically is the digest by which the container image is known.
*
* Note: Follows [OCI Image Manifest Specification](https://github.com/opencontainers/image-spec/blob/main/manifest.md), and specifically the [Digest property](https://github.com/opencontainers/image-spec/blob/main/descriptor.md#digests).
An example can be found in [Example Image Manifest](https://docs.docker.com/registry/spec/manifest-v2-2/#example-image-manifest).
*/
export const SEMRESATTRS_OCI_MANIFEST_DIGEST = TMP_OCI_MANIFEST_DIGEST;

/**
* Unique identifier for a particular build or compilation of the operating system.
*/
export const SEMRESATTRS_OS_BUILD_ID = TMP_OS_BUILD_ID;

/**
* Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
*/
export const SEMRESATTRS_OS_DESCRIPTION = TMP_OS_DESCRIPTION;

/**
* Human readable operating system name.
*/
export const SEMRESATTRS_OS_NAME = TMP_OS_NAME;

/**
* The operating system type.
*/
export const SEMRESATTRS_OS_TYPE = TMP_OS_TYPE;

/**
* The version string of the operating system as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
*/
export const SEMRESATTRS_OS_VERSION = TMP_OS_VERSION;

/**
* The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
*/
export const SEMRESATTRS_PROCESS_COMMAND = TMP_PROCESS_COMMAND;

/**
* All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
*/
export const SEMRESATTRS_PROCESS_COMMAND_ARGS = TMP_PROCESS_COMMAND_ARGS;

/**
* The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
*/
export const SEMRESATTRS_PROCESS_COMMAND_LINE = TMP_PROCESS_COMMAND_LINE;

/**
* The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
*/
export const SEMRESATTRS_PROCESS_EXECUTABLE_NAME = TMP_PROCESS_EXECUTABLE_NAME;

/**
* The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
*/
export const SEMRESATTRS_PROCESS_EXECUTABLE_PATH = TMP_PROCESS_EXECUTABLE_PATH;

/**
* The username of the user that owns the process.
*/
export const SEMRESATTRS_PROCESS_OWNER = TMP_PROCESS_OWNER;

/**
* Parent Process identifier (PPID).
*/
export const SEMRESATTRS_PROCESS_PARENT_PID = TMP_PROCESS_PARENT_PID;

/**
* Process identifier (PID).
*/
export const SEMRESATTRS_PROCESS_PID = TMP_PROCESS_PID;

/**
* An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
*/
export const SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION = TMP_PROCESS_RUNTIME_DESCRIPTION;

/**
* The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
*/
export const SEMRESATTRS_PROCESS_RUNTIME_NAME = TMP_PROCESS_RUNTIME_NAME;

/**
* The version of the runtime of this process, as returned by the runtime without modification.
*/
export const SEMRESATTRS_PROCESS_RUNTIME_VERSION = TMP_PROCESS_RUNTIME_VERSION;

/**
* Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found [here](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
*/
export const SEMRESATTRS_ANDROID_OS_API_LEVEL = TMP_ANDROID_OS_API_LEVEL;

/**
* Array of brand name and version separated by a space.
*
* Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
*/
export const SEMRESATTRS_BROWSER_BRANDS = TMP_BROWSER_BRANDS;

/**
* Preferred language of the user using the browser.
*
* Note: This value is intended to be taken from the Navigator API `navigator.language`.
*/
export const SEMRESATTRS_BROWSER_LANGUAGE = TMP_BROWSER_LANGUAGE;

/**
* A boolean that is true if the browser is running on a mobile device.
*
* Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute SHOULD be left unset.
*/
export const SEMRESATTRS_BROWSER_MOBILE = TMP_BROWSER_MOBILE;

/**
* The platform on which the browser is running.
*
* Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API SHOULD NOT be used instead and this attribute SHOULD be left unset in order for the values to be consistent.
The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
*/
export const SEMRESATTRS_BROWSER_PLATFORM = TMP_BROWSER_PLATFORM;

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
* The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
*/
export const SEMRESATTRS_AWS_ECS_TASK_ARN = TMP_AWS_ECS_TASK_ARN;

/**
* The task definition family this task definition is a member of.
*/
export const SEMRESATTRS_AWS_ECS_TASK_FAMILY = TMP_AWS_ECS_TASK_FAMILY;

/**
* The revision for this task definition.
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
* The name of the Cloud Run [execution](https://cloud.google.com/run/docs/managing/job-executions) being run for the Job, as set by the [`CLOUD_RUN_EXECUTION`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
*/
export const SEMRESATTRS_GCP_CLOUD_RUN_JOB_EXECUTION = TMP_GCP_CLOUD_RUN_JOB_EXECUTION;

/**
* The index for a task within an execution as provided by the [`CLOUD_RUN_TASK_INDEX`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
*/
export const SEMRESATTRS_GCP_CLOUD_RUN_JOB_TASK_INDEX = TMP_GCP_CLOUD_RUN_JOB_TASK_INDEX;

/**
* The hostname of a GCE instance. This is the full value of the default or [custom hostname](https://cloud.google.com/compute/docs/instances/custom-hostname-vm).
*/
export const SEMRESATTRS_GCP_GCE_INSTANCE_HOSTNAME = TMP_GCP_GCE_INSTANCE_HOSTNAME;

/**
* The instance name of a GCE instance. This is the value provided by `host.name`, the visible name of the instance in the Cloud Console UI, and the prefix for the default hostname of the instance as defined by the [default internal DNS name](https://cloud.google.com/compute/docs/internal-dns#instance-fully-qualified-domain-names).
*/
export const SEMRESATTRS_GCP_GCE_INSTANCE_NAME = TMP_GCP_GCE_INSTANCE_NAME;

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
* Name of the [deployment environment](https://wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
*
* Note: `deployment.environment` does not affect the uniqueness constraints defined through
the `service.namespace`, `service.name` and `service.instance.id` resource attributes.
This implies that resources carrying the following attribute combinations MUST be
considered to be identifying the same service:

* `service.name=frontend`, `deployment.environment=production`
* `service.name=frontend`, `deployment.environment=staging`.
*/
export const SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = TMP_DEPLOYMENT_ENVIRONMENT;

/**
* The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
*
* Note: * **AWS Lambda:** Use the (full) log stream name.
*/
export const SEMRESATTRS_FAAS_INSTANCE = TMP_FAAS_INSTANCE;

/**
* The amount of memory available to the serverless function converted to Bytes.
*
* Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information (which must be multiplied by 1,048,576).
*/
export const SEMRESATTRS_FAAS_MAX_MEMORY = TMP_FAAS_MAX_MEMORY;

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
export const SEMRESATTRS_FAAS_NAME = TMP_FAAS_NAME;

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
export const SEMRESATTRS_FAAS_VERSION = TMP_FAAS_VERSION;

/**
* Logical name of the service.
*
* Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
*/
export const SEMRESATTRS_SERVICE_NAME = TMP_SERVICE_NAME;

/**
* The version string of the service API or implementation. The format is not defined by these conventions.
*/
export const SEMRESATTRS_SERVICE_VERSION = TMP_SERVICE_VERSION;

/**
* The string ID of the service instance.
*
* Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
*/
export const SEMRESATTRS_SERVICE_INSTANCE_ID = TMP_SERVICE_INSTANCE_ID;

/**
* A namespace for `service.name`.
*
* Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
*/
export const SEMRESATTRS_SERVICE_NAMESPACE = TMP_SERVICE_NAMESPACE;

/**
* The language of the telemetry SDK.
*/
export const SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = TMP_TELEMETRY_SDK_LANGUAGE;

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
export const SEMRESATTRS_TELEMETRY_SDK_NAME = TMP_TELEMETRY_SDK_NAME;

/**
* The version string of the telemetry SDK.
*/
export const SEMRESATTRS_TELEMETRY_SDK_VERSION = TMP_TELEMETRY_SDK_VERSION;

/**
* The name of the auto instrumentation agent or distribution, if used.
*
* Note: Official auto instrumentation agents and distributions SHOULD set the `telemetry.distro.name` attribute to
a string starting with `opentelemetry-`, e.g. `opentelemetry-java-instrumentation`.
*/
export const SEMRESATTRS_TELEMETRY_DISTRO_NAME = TMP_TELEMETRY_DISTRO_NAME;

/**
* The version string of the auto instrumentation agent or distribution, if used.
*/
export const SEMRESATTRS_TELEMETRY_DISTRO_VERSION = TMP_TELEMETRY_DISTRO_VERSION;

/**
* Additional description of the web engine (e.g. detailed version and edition information).
*/
export const SEMRESATTRS_WEBENGINE_DESCRIPTION = TMP_WEBENGINE_DESCRIPTION;

/**
* The name of the web engine.
*/
export const SEMRESATTRS_WEBENGINE_NAME = TMP_WEBENGINE_NAME;

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
* Deprecated, use the `otel.scope.name` attribute.
*/
export const SEMRESATTRS_OTEL_LIBRARY_NAME = TMP_OTEL_LIBRARY_NAME;

/**
* Deprecated, use the `otel.scope.version` attribute.
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
  * The cloud account ID the resource is assigned to.
  */
  CLOUD_ACCOUNT_ID: 'cloud.account.id',

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
  * Name of the cloud provider.
  */
  CLOUD_PROVIDER: 'cloud.provider',

  /**
  * The geographical region the resource is running.
  *
  * Note: Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/global-infrastructure/geographies/), [Google Cloud regions](https://cloud.google.com/about/locations), or [Tencent Cloud regions](https://www.tencentcloud.com/document/product/213/6091).
  */
  CLOUD_REGION: 'cloud.region',

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
  CLOUD_RESOURCE_ID: 'cloud.resource_id',

  /**
  * The command used to run the container (i.e. the command name).
  *
  * Note: If using embedded credentials or sensitive data, it is recommended to remove them to prevent potential leakage.
  */
  CONTAINER_COMMAND: 'container.command',

  /**
  * All the command arguments (including the command/executable itself) run by the container. [2].
  */
  CONTAINER_COMMAND_ARGS: 'container.command_args',

  /**
  * The full command run by the container as a single string representing the full command. [2].
  */
  CONTAINER_COMMAND_LINE: 'container.command_line',

  /**
  * Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
  */
  CONTAINER_ID: 'container.id',

  /**
  * Runtime specific image identifier. Usually a hash algorithm followed by a UUID.
  *
  * Note: Docker defines a sha256 of the image id; `container.image.id` corresponds to the `Image` field from the Docker container inspect [API](https://docs.docker.com/engine/api/v1.43/#tag/Container/operation/ContainerInspect) endpoint.
K8s defines a link to the container registry repository with digest `&#34;imageID&#34;: &#34;registry.azurecr.io /namespace/service/dockerfile@sha256:bdeabd40c3a8a492eaf9e8e44d0ebbb84bac7ee25ac0cf8a7159d25f62555625&#34;`.
The ID is assinged by the container runtime and can vary in different environments. Consider using `oci.manifest.digest` if it is important to identify the same image in different environments/runtimes.
  */
  CONTAINER_IMAGE_ID: 'container.image.id',

  /**
  * Name of the image the container was built on.
  */
  CONTAINER_IMAGE_NAME: 'container.image.name',

  /**
  * Repo digests of the container image as provided by the container runtime.
  *
  * Note: [Docker](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect) and [CRI](https://github.com/kubernetes/cri-api/blob/c75ef5b473bbe2d0a4fc92f82235efd665ea8e9f/pkg/apis/runtime/v1/api.proto#L1237-L1238) report those under the `RepoDigests` field.
  */
  CONTAINER_IMAGE_REPO_DIGESTS: 'container.image.repo_digests',

  /**
  * Container image tags. An example can be found in [Docker Image Inspect](https://docs.docker.com/engine/api/v1.43/#tag/Image/operation/ImageInspect). Should be only the `&lt;tag&gt;` section of the full name for example from `registry.example.com/my-org/my-image:&lt;tag&gt;`.
  */
  CONTAINER_IMAGE_TAGS: 'container.image.tags',

  /**
  * Container name used by container runtime.
  */
  CONTAINER_NAME: 'container.name',

  /**
  * The container runtime managing this container.
  */
  CONTAINER_RUNTIME: 'container.runtime',

  /**
  * A unique identifier representing the device.
  *
  * Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
  */
  DEVICE_ID: 'device.id',

  /**
  * The name of the device manufacturer.
  *
  * Note: The Android OS provides this field via [Build](https://developer.android.com/reference/android/os/Build#MANUFACTURER). iOS apps SHOULD hardcode the value `Apple`.
  */
  DEVICE_MANUFACTURER: 'device.manufacturer',

  /**
  * The model identifier for the device.
  *
  * Note: It&#39;s recommended this value represents a machine-readable version of the model identifier rather than the market or consumer-friendly name of the device.
  */
  DEVICE_MODEL_IDENTIFIER: 'device.model.identifier',

  /**
  * The marketing name for the device model.
  *
  * Note: It&#39;s recommended this value represents a human-readable version of the device model rather than a machine-readable alternative.
  */
  DEVICE_MODEL_NAME: 'device.model.name',

  /**
  * The CPU architecture the host system is running on.
  */
  HOST_ARCH: 'host.arch',

  /**
  * The amount of level 2 memory cache available to the processor (in Bytes).
  */
  HOST_CPU_CACHE_L2_SIZE: 'host.cpu.cache.l2.size',

  /**
  * Family or generation of the CPU.
  */
  HOST_CPU_FAMILY: 'host.cpu.family',

  /**
  * Model identifier. It provides more granular information about the CPU, distinguishing it from other CPUs within the same family.
  */
  HOST_CPU_MODEL_ID: 'host.cpu.model.id',

  /**
  * Model designation of the processor.
  */
  HOST_CPU_MODEL_NAME: 'host.cpu.model.name',

  /**
  * Stepping or core revisions.
  */
  HOST_CPU_STEPPING: 'host.cpu.stepping',

  /**
  * Processor manufacturer identifier. A maximum 12-character string.
  *
  * Note: [CPUID](https://wiki.osdev.org/CPUID) command returns the vendor ID string in EBX, EDX and ECX registers. Writing these to memory in this order results in a 12-character string.
  */
  HOST_CPU_VENDOR_ID: 'host.cpu.vendor.id',

  /**
  * Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider. For non-containerized systems, this should be the `machine-id`. See the table below for the sources to use to determine the `machine-id` based on operating system.
  */
  HOST_ID: 'host.id',

  /**
  * VM image ID or host OS image ID. For Cloud, this value is from the provider.
  */
  HOST_IMAGE_ID: 'host.image.id',

  /**
  * Name of the VM image or OS install the host was instantiated from.
  */
  HOST_IMAGE_NAME: 'host.image.name',

  /**
  * The version string of the VM image or host OS as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
  */
  HOST_IMAGE_VERSION: 'host.image.version',

  /**
  * Available IP addresses of the host, excluding loopback interfaces.
  *
  * Note: IPv4 Addresses MUST be specified in dotted-quad notation. IPv6 addresses MUST be specified in the [RFC 5952](https://www.rfc-editor.org/rfc/rfc5952.html) format.
  */
  HOST_IP: 'host.ip',

  /**
  * Available MAC addresses of the host, excluding loopback interfaces.
  *
  * Note: MAC Addresses MUST be represented in [IEEE RA hexadecimal form](https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf): as hyphen-separated octets in uppercase hexadecimal form from most to least significant.
  */
  HOST_MAC: 'host.mac',

  /**
  * Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
  */
  HOST_NAME: 'host.name',

  /**
  * Type of host. For Cloud, this must be the machine type.
  */
  HOST_TYPE: 'host.type',

  /**
  * The name of the cluster.
  */
  K8S_CLUSTER_NAME: 'k8s.cluster.name',

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
  K8S_CLUSTER_UID: 'k8s.cluster.uid',

  /**
  * The name of the Container from Pod specification, must be unique within a Pod. Container runtime usually uses different globally unique name (`container.name`).
  */
  K8S_CONTAINER_NAME: 'k8s.container.name',

  /**
  * Number of times the container was restarted. This attribute can be used to identify a particular container (running or stopped) within a container spec.
  */
  K8S_CONTAINER_RESTART_COUNT: 'k8s.container.restart_count',

  /**
  * The name of the CronJob.
  */
  K8S_CRONJOB_NAME: 'k8s.cronjob.name',

  /**
  * The UID of the CronJob.
  */
  K8S_CRONJOB_UID: 'k8s.cronjob.uid',

  /**
  * The name of the DaemonSet.
  */
  K8S_DAEMONSET_NAME: 'k8s.daemonset.name',

  /**
  * The UID of the DaemonSet.
  */
  K8S_DAEMONSET_UID: 'k8s.daemonset.uid',

  /**
  * The name of the Deployment.
  */
  K8S_DEPLOYMENT_NAME: 'k8s.deployment.name',

  /**
  * The UID of the Deployment.
  */
  K8S_DEPLOYMENT_UID: 'k8s.deployment.uid',

  /**
  * The name of the Job.
  */
  K8S_JOB_NAME: 'k8s.job.name',

  /**
  * The UID of the Job.
  */
  K8S_JOB_UID: 'k8s.job.uid',

  /**
  * The name of the namespace that the pod is running in.
  */
  K8S_NAMESPACE_NAME: 'k8s.namespace.name',

  /**
  * The name of the Node.
  */
  K8S_NODE_NAME: 'k8s.node.name',

  /**
  * The UID of the Node.
  */
  K8S_NODE_UID: 'k8s.node.uid',

  /**
  * The name of the Pod.
  */
  K8S_POD_NAME: 'k8s.pod.name',

  /**
  * The UID of the Pod.
  */
  K8S_POD_UID: 'k8s.pod.uid',

  /**
  * The name of the ReplicaSet.
  */
  K8S_REPLICASET_NAME: 'k8s.replicaset.name',

  /**
  * The UID of the ReplicaSet.
  */
  K8S_REPLICASET_UID: 'k8s.replicaset.uid',

  /**
  * The name of the StatefulSet.
  */
  K8S_STATEFULSET_NAME: 'k8s.statefulset.name',

  /**
  * The UID of the StatefulSet.
  */
  K8S_STATEFULSET_UID: 'k8s.statefulset.uid',

  /**
  * The digest of the OCI image manifest. For container images specifically is the digest by which the container image is known.
  *
  * Note: Follows [OCI Image Manifest Specification](https://github.com/opencontainers/image-spec/blob/main/manifest.md), and specifically the [Digest property](https://github.com/opencontainers/image-spec/blob/main/descriptor.md#digests).
An example can be found in [Example Image Manifest](https://docs.docker.com/registry/spec/manifest-v2-2/#example-image-manifest).
  */
  OCI_MANIFEST_DIGEST: 'oci.manifest.digest',

  /**
  * Unique identifier for a particular build or compilation of the operating system.
  */
  OS_BUILD_ID: 'os.build_id',

  /**
  * Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
  */
  OS_DESCRIPTION: 'os.description',

  /**
  * Human readable operating system name.
  */
  OS_NAME: 'os.name',

  /**
  * The operating system type.
  */
  OS_TYPE: 'os.type',

  /**
  * The version string of the operating system as defined in [Version Attributes](/docs/resource/README.md#version-attributes).
  */
  OS_VERSION: 'os.version',

  /**
  * The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
  */
  PROCESS_COMMAND: 'process.command',

  /**
  * All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
  */
  PROCESS_COMMAND_ARGS: 'process.command_args',

  /**
  * The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
  */
  PROCESS_COMMAND_LINE: 'process.command_line',

  /**
  * The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
  */
  PROCESS_EXECUTABLE_NAME: 'process.executable.name',

  /**
  * The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
  */
  PROCESS_EXECUTABLE_PATH: 'process.executable.path',

  /**
  * The username of the user that owns the process.
  */
  PROCESS_OWNER: 'process.owner',

  /**
  * Parent Process identifier (PPID).
  */
  PROCESS_PARENT_PID: 'process.parent_pid',

  /**
  * Process identifier (PID).
  */
  PROCESS_PID: 'process.pid',

  /**
  * An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
  */
  PROCESS_RUNTIME_DESCRIPTION: 'process.runtime.description',

  /**
  * The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
  */
  PROCESS_RUNTIME_NAME: 'process.runtime.name',

  /**
  * The version of the runtime of this process, as returned by the runtime without modification.
  */
  PROCESS_RUNTIME_VERSION: 'process.runtime.version',

  /**
  * Uniquely identifies the framework API revision offered by a version (`os.version`) of the android operating system. More information can be found [here](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels).
  */
  ANDROID_OS_API_LEVEL: 'android.os.api_level',

  /**
  * Array of brand name and version separated by a space.
  *
  * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.brands`).
  */
  BROWSER_BRANDS: 'browser.brands',

  /**
  * Preferred language of the user using the browser.
  *
  * Note: This value is intended to be taken from the Navigator API `navigator.language`.
  */
  BROWSER_LANGUAGE: 'browser.language',

  /**
  * A boolean that is true if the browser is running on a mobile device.
  *
  * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.mobile`). If unavailable, this attribute SHOULD be left unset.
  */
  BROWSER_MOBILE: 'browser.mobile',

  /**
  * The platform on which the browser is running.
  *
  * Note: This value is intended to be taken from the [UA client hints API](https://wicg.github.io/ua-client-hints/#interface) (`navigator.userAgentData.platform`). If unavailable, the legacy `navigator.platform` API SHOULD NOT be used instead and this attribute SHOULD be left unset in order for the values to be consistent.
The list of possible values is defined in the [W3C User-Agent Client Hints specification](https://wicg.github.io/ua-client-hints/#sec-ch-ua-platform). Note that some (but not all) of these values can overlap with values in the [`os.type` and `os.name` attributes](./os.md). However, for consistency, the values in the `browser.platform` attribute should capture the exact value that the user agent provides.
  */
  BROWSER_PLATFORM: 'browser.platform',

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
  * The name of the Cloud Run [execution](https://cloud.google.com/run/docs/managing/job-executions) being run for the Job, as set by the [`CLOUD_RUN_EXECUTION`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
  */
  GCP_CLOUD_RUN_JOB_EXECUTION: 'gcp.cloud_run.job.execution',

  /**
  * The index for a task within an execution as provided by the [`CLOUD_RUN_TASK_INDEX`](https://cloud.google.com/run/docs/container-contract#jobs-env-vars) environment variable.
  */
  GCP_CLOUD_RUN_JOB_TASK_INDEX: 'gcp.cloud_run.job.task_index',

  /**
  * The hostname of a GCE instance. This is the full value of the default or [custom hostname](https://cloud.google.com/compute/docs/instances/custom-hostname-vm).
  */
  GCP_GCE_INSTANCE_HOSTNAME: 'gcp.gce.instance.hostname',

  /**
  * The instance name of a GCE instance. This is the value provided by `host.name`, the visible name of the instance in the Cloud Console UI, and the prefix for the default hostname of the instance as defined by the [default internal DNS name](https://cloud.google.com/compute/docs/internal-dns#instance-fully-qualified-domain-names).
  */
  GCP_GCE_INSTANCE_NAME: 'gcp.gce.instance.name',

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
  * Name of the [deployment environment](https://wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
  *
  * Note: `deployment.environment` does not affect the uniqueness constraints defined through
the `service.namespace`, `service.name` and `service.instance.id` resource attributes.
This implies that resources carrying the following attribute combinations MUST be
considered to be identifying the same service:

* `service.name=frontend`, `deployment.environment=production`
* `service.name=frontend`, `deployment.environment=staging`.
  */
  DEPLOYMENT_ENVIRONMENT: 'deployment.environment',

  /**
  * The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
  *
  * Note: * **AWS Lambda:** Use the (full) log stream name.
  */
  FAAS_INSTANCE: 'faas.instance',

  /**
  * The amount of memory available to the serverless function converted to Bytes.
  *
  * Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information (which must be multiplied by 1,048,576).
  */
  FAAS_MAX_MEMORY: 'faas.max_memory',

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
  FAAS_NAME: 'faas.name',

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
  FAAS_VERSION: 'faas.version',

  /**
  * Logical name of the service.
  *
  * Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
  */
  SERVICE_NAME: 'service.name',

  /**
  * The version string of the service API or implementation. The format is not defined by these conventions.
  */
  SERVICE_VERSION: 'service.version',

  /**
  * The string ID of the service instance.
  *
  * Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
  */
  SERVICE_INSTANCE_ID: 'service.instance.id',

  /**
  * A namespace for `service.name`.
  *
  * Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
  */
  SERVICE_NAMESPACE: 'service.namespace',

  /**
  * The language of the telemetry SDK.
  */
  TELEMETRY_SDK_LANGUAGE: 'telemetry.sdk.language',

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
  TELEMETRY_SDK_NAME: 'telemetry.sdk.name',

  /**
  * The version string of the telemetry SDK.
  */
  TELEMETRY_SDK_VERSION: 'telemetry.sdk.version',

  /**
  * The name of the auto instrumentation agent or distribution, if used.
  *
  * Note: Official auto instrumentation agents and distributions SHOULD set the `telemetry.distro.name` attribute to
a string starting with `opentelemetry-`, e.g. `opentelemetry-java-instrumentation`.
  */
  TELEMETRY_DISTRO_NAME: 'telemetry.distro.name',

  /**
  * The version string of the auto instrumentation agent or distribution, if used.
  */
  TELEMETRY_DISTRO_VERSION: 'telemetry.distro.version',

  /**
  * Additional description of the web engine (e.g. detailed version and edition information).
  */
  WEBENGINE_DESCRIPTION: 'webengine.description',

  /**
  * The name of the web engine.
  */
  WEBENGINE_NAME: 'webengine.name',

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
  * Deprecated, use the `otel.scope.name` attribute.
  */
  OTEL_LIBRARY_NAME: 'otel.library.name',

  /**
  * Deprecated, use the `otel.scope.version` attribute.
  */
  OTEL_LIBRARY_VERSION: 'otel.library.version',
};

/**
 * Create exported Value Map for SemanticResourceAttributes values
 * @deprecated Use the SEMRESATTRS_XXXXX constants rather than the SemanticResourceAttributes.XXXXX for bundle minification
 */
export const SemanticResourceAttributes:SemanticResourceAttributes = /*#__PURE__*/createConstMap<SemanticResourceAttributes>([
  TMP_CLOUD_ACCOUNT_ID,
  TMP_CLOUD_AVAILABILITY_ZONE,
  TMP_CLOUD_PLATFORM,
  TMP_CLOUD_PROVIDER,
  TMP_CLOUD_REGION,
  TMP_CLOUD_RESOURCE_ID,
  TMP_CONTAINER_COMMAND,
  TMP_CONTAINER_COMMAND_ARGS,
  TMP_CONTAINER_COMMAND_LINE,
  TMP_CONTAINER_ID,
  TMP_CONTAINER_IMAGE_ID,
  TMP_CONTAINER_IMAGE_NAME,
  TMP_CONTAINER_IMAGE_REPO_DIGESTS,
  TMP_CONTAINER_IMAGE_TAGS,
  TMP_CONTAINER_NAME,
  TMP_CONTAINER_RUNTIME,
  TMP_DEVICE_ID,
  TMP_DEVICE_MANUFACTURER,
  TMP_DEVICE_MODEL_IDENTIFIER,
  TMP_DEVICE_MODEL_NAME,
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
  TMP_OCI_MANIFEST_DIGEST,
  TMP_OS_BUILD_ID,
  TMP_OS_DESCRIPTION,
  TMP_OS_NAME,
  TMP_OS_TYPE,
  TMP_OS_VERSION,
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
  TMP_ANDROID_OS_API_LEVEL,
  TMP_BROWSER_BRANDS,
  TMP_BROWSER_LANGUAGE,
  TMP_BROWSER_MOBILE,
  TMP_BROWSER_PLATFORM,
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
  TMP_GCP_CLOUD_RUN_JOB_EXECUTION,
  TMP_GCP_CLOUD_RUN_JOB_TASK_INDEX,
  TMP_GCP_GCE_INSTANCE_HOSTNAME,
  TMP_GCP_GCE_INSTANCE_NAME,
  TMP_HEROKU_APP_ID,
  TMP_HEROKU_RELEASE_COMMIT,
  TMP_HEROKU_RELEASE_CREATION_TIMESTAMP,
  TMP_DEPLOYMENT_ENVIRONMENT,
  TMP_FAAS_INSTANCE,
  TMP_FAAS_MAX_MEMORY,
  TMP_FAAS_NAME,
  TMP_FAAS_VERSION,
  TMP_SERVICE_NAME,
  TMP_SERVICE_VERSION,
  TMP_SERVICE_INSTANCE_ID,
  TMP_SERVICE_NAMESPACE,
  TMP_TELEMETRY_SDK_LANGUAGE,
  TMP_TELEMETRY_SDK_NAME,
  TMP_TELEMETRY_SDK_VERSION,
  TMP_TELEMETRY_DISTRO_NAME,
  TMP_TELEMETRY_DISTRO_VERSION,
  TMP_WEBENGINE_DESCRIPTION,
  TMP_WEBENGINE_NAME,
  TMP_WEBENGINE_VERSION,
  TMP_OTEL_SCOPE_NAME,
  TMP_OTEL_SCOPE_VERSION,
  TMP_OTEL_LIBRARY_NAME,
  TMP_OTEL_LIBRARY_VERSION,
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
const TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_OPENSHIFT = 'alibaba_cloud_openshift';
const TMP_CLOUDPLATFORMVALUES_AWS_EC2 = 'aws_ec2';
const TMP_CLOUDPLATFORMVALUES_AWS_ECS = 'aws_ecs';
const TMP_CLOUDPLATFORMVALUES_AWS_EKS = 'aws_eks';
const TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA = 'aws_lambda';
const TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = 'aws_elastic_beanstalk';
const TMP_CLOUDPLATFORMVALUES_AWS_APP_RUNNER = 'aws_app_runner';
const TMP_CLOUDPLATFORMVALUES_AWS_OPENSHIFT = 'aws_openshift';
const TMP_CLOUDPLATFORMVALUES_AZURE_VM = 'azure_vm';
const TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = 'azure_container_instances';
const TMP_CLOUDPLATFORMVALUES_AZURE_AKS = 'azure_aks';
const TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = 'azure_functions';
const TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = 'azure_app_service';
const TMP_CLOUDPLATFORMVALUES_AZURE_OPENSHIFT = 'azure_openshift';
const TMP_CLOUDPLATFORMVALUES_GCP_BARE_METAL_SOLUTION = 'gcp_bare_metal_solution';
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
export const CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_ALIBABA_CLOUD_OPENSHIFT = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_OPENSHIFT;

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
export const CLOUDPLATFORMVALUES_AWS_LAMBDA = TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_APP_RUNNER = TMP_CLOUDPLATFORMVALUES_AWS_APP_RUNNER;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AWS_OPENSHIFT = TMP_CLOUDPLATFORMVALUES_AWS_OPENSHIFT;

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
export const CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES;

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
export const CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_AZURE_OPENSHIFT = TMP_CLOUDPLATFORMVALUES_AZURE_OPENSHIFT;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_BARE_METAL_SOLUTION = TMP_CLOUDPLATFORMVALUES_GCP_BARE_METAL_SOLUTION;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_APP_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_GCP_OPENSHIFT = TMP_CLOUDPLATFORMVALUES_GCP_OPENSHIFT;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_IBM_CLOUD_OPENSHIFT = TMP_CLOUDPLATFORMVALUES_IBM_CLOUD_OPENSHIFT;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_TENCENT_CLOUD_CVM = TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_CVM;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_TENCENT_CLOUD_EKS = TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_EKS;

/**
 * The cloud platform in use.
 *
 * Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
 */
export const CLOUDPLATFORMVALUES_TENCENT_CLOUD_SCF = TMP_CLOUDPLATFORMVALUES_TENCENT_CLOUD_SCF;

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

  /** Google Bare Metal Solution (BMS). */
  GCP_BARE_METAL_SOLUTION: 'gcp_bare_metal_solution',

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
  GCP_OPENSHIFT: 'gcp_openshift',

  /** Red Hat OpenShift on IBM Cloud. */
  IBM_CLOUD_OPENSHIFT: 'ibm_cloud_openshift',

  /** Tencent Cloud Cloud Virtual Machine (CVM). */
  TENCENT_CLOUD_CVM: 'tencent_cloud_cvm',

  /** Tencent Cloud Elastic Kubernetes Service (EKS). */
  TENCENT_CLOUD_EKS: 'tencent_cloud_eks',

  /** Tencent Cloud Serverless Cloud Function (SCF). */
  TENCENT_CLOUD_SCF: 'tencent_cloud_scf',
}

/**
 * The constant map of values for CloudPlatformValues.
 * @deprecated Use the CLOUDPLATFORMVALUES_XXXXX constants rather than the CloudPlatformValues.XXXXX for bundle minification.
 */
export const CloudPlatformValues:CloudPlatformValues = /*#__PURE__*/createConstMap<CloudPlatformValues>([
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
export const CLOUDPROVIDERVALUES_ALIBABA_CLOUD = TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD;

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
export const CLOUDPROVIDERVALUES_TENCENT_CLOUD = TMP_CLOUDPROVIDERVALUES_TENCENT_CLOUD;

/**
 * Identifies the Values for CloudProviderValues enum definition
 *
 * Name of the cloud provider.
 * @deprecated Use the CLOUDPROVIDERVALUES_XXXXX constants rather than the CloudProviderValues.XXXXX for bundle minification.
 */
export type CloudProviderValues = {

  /** Alibaba Cloud. */
  ALIBABA_CLOUD: 'alibaba_cloud',

  /** Amazon Web Services. */
  AWS: 'aws',

  /** Microsoft Azure. */
  AZURE: 'azure',

  /** Google Cloud Platform. */
  GCP: 'gcp',

  /** Heroku Platform as a Service. */
  HEROKU: 'heroku',

  /** IBM Cloud. */
  IBM_CLOUD: 'ibm_cloud',

  /** Tencent Cloud. */
  TENCENT_CLOUD: 'tencent_cloud',
}

/**
 * The constant map of values for CloudProviderValues.
 * @deprecated Use the CLOUDPROVIDERVALUES_XXXXX constants rather than the CloudProviderValues.XXXXX for bundle minification.
 */
export const CloudProviderValues:CloudProviderValues = /*#__PURE__*/createConstMap<CloudProviderValues>([
  TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD,
  TMP_CLOUDPROVIDERVALUES_AWS,
  TMP_CLOUDPROVIDERVALUES_AZURE,
  TMP_CLOUDPROVIDERVALUES_GCP,
  TMP_CLOUDPROVIDERVALUES_HEROKU,
  TMP_CLOUDPROVIDERVALUES_IBM_CLOUD,
  TMP_CLOUDPROVIDERVALUES_TENCENT_CLOUD,
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
}

/**
 * The constant map of values for HostArchValues.
 * @deprecated Use the HOSTARCHVALUES_XXXXX constants rather than the HostArchValues.XXXXX for bundle minification.
 */
export const HostArchValues:HostArchValues = /*#__PURE__*/createConstMap<HostArchValues>([
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
}

/**
 * The constant map of values for OsTypeValues.
 * @deprecated Use the OSTYPEVALUES_XXXXX constants rather than the OsTypeValues.XXXXX for bundle minification.
 */
export const OsTypeValues:OsTypeValues = /*#__PURE__*/createConstMap<OsTypeValues>([
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
export const TELEMETRYSDKLANGUAGEVALUES_CPP = TMP_TELEMETRYSDKLANGUAGEVALUES_CPP;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_DOTNET = TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_ERLANG = TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_GO = TMP_TELEMETRYSDKLANGUAGEVALUES_GO;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_JAVA = TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_NODEJS = TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_PHP = TMP_TELEMETRYSDKLANGUAGEVALUES_PHP;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_PYTHON = TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_RUBY = TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_RUST = TMP_TELEMETRYSDKLANGUAGEVALUES_RUST;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_SWIFT = TMP_TELEMETRYSDKLANGUAGEVALUES_SWIFT;

/**
 * The language of the telemetry SDK.
 */
export const TELEMETRYSDKLANGUAGEVALUES_WEBJS = TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS;

/**
 * Identifies the Values for TelemetrySdkLanguageValues enum definition
 *
 * The language of the telemetry SDK.
 * @deprecated Use the TELEMETRYSDKLANGUAGEVALUES_XXXXX constants rather than the TelemetrySdkLanguageValues.XXXXX for bundle minification.
 */
export type TelemetrySdkLanguageValues = {

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

  /** rust. */
  RUST: 'rust',

  /** swift. */
  SWIFT: 'swift',

  /** webjs. */
  WEBJS: 'webjs',
}

/**
 * The constant map of values for TelemetrySdkLanguageValues.
 * @deprecated Use the TELEMETRYSDKLANGUAGEVALUES_XXXXX constants rather than the TelemetrySdkLanguageValues.XXXXX for bundle minification.
 */
export const TelemetrySdkLanguageValues:TelemetrySdkLanguageValues = /*#__PURE__*/createConstMap<TelemetrySdkLanguageValues>([
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

