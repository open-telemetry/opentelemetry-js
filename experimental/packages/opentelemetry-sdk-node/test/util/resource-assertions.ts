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

import { SDK_INFO } from '@opentelemetry/core';
import * as assert from 'assert';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_CLOUD_ACCOUNT_ID,
  SEMRESATTRS_CLOUD_AVAILABILITY_ZONE,
  SEMRESATTRS_CLOUD_PROVIDER,
  SEMRESATTRS_CLOUD_REGION,
  SEMRESATTRS_CONTAINER_ID,
  SEMRESATTRS_CONTAINER_IMAGE_NAME,
  SEMRESATTRS_CONTAINER_IMAGE_TAG,
  SEMRESATTRS_CONTAINER_NAME,
  SEMRESATTRS_HOST_ID,
  SEMRESATTRS_HOST_IMAGE_ID,
  SEMRESATTRS_HOST_IMAGE_NAME,
  SEMRESATTRS_HOST_IMAGE_VERSION,
  SEMRESATTRS_HOST_NAME,
  SEMRESATTRS_HOST_TYPE,
  SEMRESATTRS_K8S_CLUSTER_NAME,
  SEMRESATTRS_K8S_DEPLOYMENT_NAME,
  SEMRESATTRS_K8S_NAMESPACE_NAME,
  SEMRESATTRS_K8S_POD_NAME,
  SEMRESATTRS_PROCESS_COMMAND,
  SEMRESATTRS_PROCESS_COMMAND_LINE,
  SEMRESATTRS_PROCESS_EXECUTABLE_NAME,
  SEMRESATTRS_PROCESS_PID,
  SEMRESATTRS_SERVICE_INSTANCE_ID,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_NAMESPACE,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_TELEMETRY_SDK_LANGUAGE,
  SEMRESATTRS_TELEMETRY_SDK_NAME,
  SEMRESATTRS_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import * as semconv from '@opentelemetry/semantic-conventions';

/**
 * Test utility method to validate a cloud resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource attributes
 */
export const assertCloudResource = (
  resource: Resource,
  validations: {
    provider?: string;
    accountId?: string;
    region?: string;
    zone?: string;
  }
) => {
  assertHasOneLabel('CLOUD', resource);
  if (validations.provider)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_CLOUD_PROVIDER],
      validations.provider
    );
  if (validations.accountId)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_CLOUD_ACCOUNT_ID],
      validations.accountId
    );
  if (validations.region)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_CLOUD_REGION],
      validations.region
    );
  if (validations.zone)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_CLOUD_AVAILABILITY_ZONE],
      validations.zone
    );
};

/**
 * Test utility method to validate a container resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource attributes
 */
export const assertContainerResource = (
  resource: Resource,
  validations: {
    name?: string;
    id?: string;
    imageName?: string;
    imageTag?: string;
  }
) => {
  assertHasOneLabel('CONTAINER', resource);
  if (validations.name)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_CONTAINER_NAME],
      validations.name
    );
  if (validations.id)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_CONTAINER_ID],
      validations.id
    );
  if (validations.imageName)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_CONTAINER_IMAGE_NAME],
      validations.imageName
    );
  if (validations.imageTag)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_CONTAINER_IMAGE_TAG],
      validations.imageTag
    );
};

/**
 * Test utility method to validate a host resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource attributes
 */
export const assertHostResource = (
  resource: Resource,
  validations: {
    hostName?: string;
    id?: string;
    name?: string;
    hostType?: string;
    imageName?: string;
    imageId?: string;
    imageVersion?: string;
  }
) => {
  assertHasOneLabel('HOST', resource);
  if (validations.id)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_HOST_ID],
      validations.id
    );
  if (validations.name)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_HOST_NAME],
      validations.name
    );
  if (validations.hostType)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_HOST_TYPE],
      validations.hostType
    );
  if (validations.imageName)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_HOST_IMAGE_NAME],
      validations.imageName
    );
  if (validations.imageId)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_HOST_IMAGE_ID],
      validations.imageId
    );
  if (validations.imageVersion)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_HOST_IMAGE_VERSION],
      validations.imageVersion
    );
};

/**
 * Test utility method to validate a K8s resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource attributes
 */
export const assertK8sResource = (
  resource: Resource,
  validations: {
    clusterName?: string;
    namespaceName?: string;
    podName?: string;
    deploymentName?: string;
  }
) => {
  assertHasOneLabel('K8S', resource);
  if (validations.clusterName)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_K8S_CLUSTER_NAME],
      validations.clusterName
    );
  if (validations.namespaceName)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_K8S_NAMESPACE_NAME],
      validations.namespaceName
    );
  if (validations.podName)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_K8S_POD_NAME],
      validations.podName
    );
  if (validations.deploymentName)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_K8S_DEPLOYMENT_NAME],
      validations.deploymentName
    );
};

/**
 * Test utility method to validate a telemetry sdk resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource attributes
 */
export const assertTelemetrySDKResource = (
  resource: Resource,
  validations: {
    name?: string;
    language?: string;
    version?: string;
  }
) => {
  const defaults = {
    name: SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_NAME],
    language: SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE],
    version: SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_VERSION],
  };
  validations = { ...defaults, ...validations };

  if (validations.name)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_TELEMETRY_SDK_NAME],
      validations.name
    );
  if (validations.language)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE],
      validations.language
    );
  if (validations.version)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_TELEMETRY_SDK_VERSION],
      validations.version
    );
};

/**
 * Test utility method to validate a service resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource attributes
 */
export const assertServiceResource = (
  resource: Resource,
  validations: {
    name: string;
    instanceId?: string;
    namespace?: string;
    version?: string;
  }
) => {
  assert.strictEqual(
    resource.attributes[SEMRESATTRS_SERVICE_NAME],
    validations.name
  );
  assert.strictEqual(
    resource.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID],
    validations.instanceId
  );
  if (validations.namespace)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_SERVICE_NAMESPACE],
      validations.namespace
    );
  if (validations.version)
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_SERVICE_VERSION],
      validations.version
    );
};

/**
 * Test utility method to validate a process resources
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource attributes
 */
export const assertProcessResource = (
  resource: Resource,
  validations: {
    pid?: number;
    name?: string;
    command?: string;
    commandLine?: string;
  }
) => {
  assert.strictEqual(
    resource.attributes[SEMRESATTRS_PROCESS_PID],
    validations.pid
  );
  if (validations.name) {
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_PROCESS_EXECUTABLE_NAME],
      validations.name
    );
  }
  if (validations.command) {
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_PROCESS_COMMAND],
      validations.command
    );
  }
  if (validations.commandLine) {
    assert.strictEqual(
      resource.attributes[SEMRESATTRS_PROCESS_COMMAND_LINE],
      validations.commandLine
    );
  }
};

/**
 * Test utility method to validate an empty resource
 *
 * @param resource the Resource to validate
 */
export const assertEmptyResource = (resource: Resource) => {
  assert.strictEqual(Object.keys(resource.attributes).length, 0);
};

/**
 * Assert that the `resource` has at least one known attribute with the given
 * `prefix`. By "known", we mean it is an attribute defined in semconv.
 */
const assertHasOneLabel = (prefix: string, resource: Resource): void => {
  const semconvModPrefix = `SEMRESATTRS_${prefix.toUpperCase()}_`;
  const knownAttrs: Set<string> = new Set(
    Object.entries(semconv)
      .filter(
        ([k, v]) => typeof v === 'string' && k.startsWith(semconvModPrefix)
      )
      .map(([, v]) => v as string)
  );
  const hasAttrs = Object.keys(resource.attributes).filter(k =>
    knownAttrs.has(k)
  );
  assert.ok(
    hasAttrs.length > 0,
    'Must have one Resource(s) starting with [' +
      prefix +
      '] matching the following attributes: ' +
      Array.from(knownAttrs).join(', ') +
      JSON.stringify(Object.keys(semconv))
  );
};

export const assertServiceInstanceIdIsUUID = (resource: Resource): void => {
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.equal(
    UUID_REGEX.test(
      resource.attributes[SEMRESATTRS_SERVICE_INSTANCE_ID]?.toString() || ''
    ),
    true
  );
};
