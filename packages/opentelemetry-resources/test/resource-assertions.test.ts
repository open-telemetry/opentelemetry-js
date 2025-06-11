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
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import {
  ATTR_CLOUD_ACCOUNT_ID,
  ATTR_CLOUD_AVAILABILITY_ZONE,
  ATTR_CLOUD_PROVIDER,
  ATTR_CLOUD_REGION,
  ATTR_CONTAINER_ID,
  ATTR_CONTAINER_IMAGE_NAME,
  ATTR_CONTAINER_IMAGE_TAGS,
  ATTR_CONTAINER_NAME,
  ATTR_HOST_ID,
  ATTR_HOST_IMAGE_ID,
  ATTR_HOST_IMAGE_NAME,
  ATTR_HOST_IMAGE_VERSION,
  ATTR_HOST_NAME,
  ATTR_HOST_TYPE,
  ATTR_K8S_CLUSTER_NAME,
  ATTR_K8S_DEPLOYMENT_NAME,
  ATTR_K8S_NAMESPACE_NAME,
  ATTR_K8S_POD_NAME,
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAMESPACE,
} from '../src/semconv';
import {
  assertCloudResource,
  assertContainerResource,
  assertHostResource,
  assertK8sResource,
  assertServiceResource,
  assertTelemetrySDKResource,
} from './util/resource-assertions';

describe('assertCloudResource', () => {
  it('requires one cloud label', () => {
    const resource = {
      attributes: {
        [ATTR_CLOUD_PROVIDER]: 'gcp',
      },
    };
    assertCloudResource(resource, {});
  });

  it('validates optional attributes', () => {
    const resource = {
      attributes: {
        [ATTR_CLOUD_PROVIDER]: 'gcp',
        [ATTR_CLOUD_ACCOUNT_ID]: 'opentelemetry',
        [ATTR_CLOUD_REGION]: 'us-central1',
        [ATTR_CLOUD_AVAILABILITY_ZONE]: 'us-central1-a',
      },
    };
    assertCloudResource(resource, {
      provider: 'gcp',
      accountId: 'opentelemetry',
      region: 'us-central1',
      zone: 'us-central1-a',
    });
  });
});

describe('assertContainerResource', () => {
  it('requires one container label', () => {
    const resource = {
      attributes: {
        [ATTR_CONTAINER_NAME]: 'opentelemetry-autoconf',
      },
    };
    assertContainerResource(resource, {});
  });

  it('validates optional attributes', () => {
    const resource = {
      attributes: {
        [ATTR_CONTAINER_NAME]: 'opentelemetry-autoconf',
        [ATTR_CONTAINER_ID]: 'abc',
        [ATTR_CONTAINER_IMAGE_NAME]: 'gcr.io/opentelemetry/operator',
        [ATTR_CONTAINER_IMAGE_TAGS]: ['0.1'],
      },
    };
    assertContainerResource(resource, {
      name: 'opentelemetry-autoconf',
      id: 'abc',
      imageName: 'gcr.io/opentelemetry/operator',
      imageTags: ['0.1'],
    });
  });
});

describe('assertHostResource', () => {
  it('requires one host label', () => {
    const resource = {
      attributes: {
        [ATTR_HOST_ID]: 'opentelemetry-test-id',
      },
    };
    assertHostResource(resource, {});
  });

  it('validates optional attributes', () => {
    const resource = {
      attributes: {
        [ATTR_HOST_ID]: 'opentelemetry-test-id',
        [ATTR_HOST_NAME]: 'opentelemetry-test-name',
        [ATTR_HOST_TYPE]: 'n1-standard-1',
        [ATTR_HOST_IMAGE_NAME]:
          'infra-ami-eks-worker-node-7d4ec78312, CentOS-8-x86_64-1905',
        [ATTR_HOST_IMAGE_ID]: 'ami-07b06b442921831e5',
        [ATTR_HOST_IMAGE_VERSION]: '0.1',
      },
    };
    assertHostResource(resource, {
      hostName: 'opentelemetry-test-hostname',
      id: 'opentelemetry-test-id',
      name: 'opentelemetry-test-name',
      hostType: 'n1-standard-1',
      imageName: 'infra-ami-eks-worker-node-7d4ec78312, CentOS-8-x86_64-1905',
      imageId: 'ami-07b06b442921831e5',
      imageVersion: '0.1',
    });
  });
});

describe('assertK8sResource', () => {
  it('requires one k8s label', () => {
    const resource = {
      attributes: {
        [ATTR_K8S_CLUSTER_NAME]: 'opentelemetry-cluster',
      },
    };
    assertK8sResource(resource, {});
  });

  it('validates optional attributes', () => {
    const resource = {
      attributes: {
        [ATTR_K8S_CLUSTER_NAME]: 'opentelemetry-cluster',
        [ATTR_K8S_NAMESPACE_NAME]: 'default',
        [ATTR_K8S_POD_NAME]: 'opentelemetry-pod-autoconf',
        [ATTR_K8S_DEPLOYMENT_NAME]: 'opentelemetry',
      },
    };
    assertK8sResource(resource, {
      clusterName: 'opentelemetry-cluster',
      namespaceName: 'default',
      podName: 'opentelemetry-pod-autoconf',
      deploymentName: 'opentelemetry',
    });
  });
});

describe('assertTelemetrySDKResource', () => {
  it('uses default validations', () => {
    const resource = {
      attributes: {
        [ATTR_TELEMETRY_SDK_NAME]: SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
        [ATTR_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
        [ATTR_TELEMETRY_SDK_VERSION]: SDK_INFO[ATTR_TELEMETRY_SDK_VERSION],
      },
    };
    assertTelemetrySDKResource(resource, {});
  });

  it('validates optional attributes', () => {
    const resource = {
      attributes: {
        [ATTR_TELEMETRY_SDK_NAME]: 'opentelemetry',
        [ATTR_TELEMETRY_SDK_LANGUAGE]: 'nodejs',
        [ATTR_TELEMETRY_SDK_VERSION]: '0.1.0',
      },
    };
    assertTelemetrySDKResource(resource, {
      name: 'opentelemetry',
      language: 'nodejs',
      version: '0.1.0',
    });
  });
});

describe('assertServiceResource', () => {
  it('validates required attributes', () => {
    const resource = {
      attributes: {
        [ATTR_SERVICE_NAME]: 'shoppingcart',
        [ATTR_SERVICE_INSTANCE_ID]: '627cc493-f310-47de-96bd-71410b7dec09',
      },
    };
    assertServiceResource(resource, {
      name: 'shoppingcart',
      instanceId: '627cc493-f310-47de-96bd-71410b7dec09',
    });
  });

  it('validates optional attributes', () => {
    const resource = {
      attributes: {
        [ATTR_SERVICE_NAME]: 'shoppingcart',
        [ATTR_SERVICE_INSTANCE_ID]: '627cc493-f310-47de-96bd-71410b7dec09',
        [ATTR_SERVICE_NAMESPACE]: 'shop',
        [ATTR_SERVICE_VERSION]: '0.1.0',
      },
    };
    assertServiceResource(resource, {
      name: 'shoppingcart',
      instanceId: '627cc493-f310-47de-96bd-71410b7dec09',
      namespace: 'shop',
      version: '0.1.0',
    });
  });
});
