/*!
 * Copyright 2020, OpenTelemetry Authors
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

import * as os from 'os';
import * as gcpMetadata from 'gcp-metadata';
import { Resource, Labels } from '../../../Resource';
import {
  CLOUD_RESOURCE,
  HOST_RESOURCE,
  K8S_RESOURCE,
  CONTAINER_RESOURCE,
} from '../../../constants';

/**
 * The GcpDetector can be used to detect if a process is running in the Google
 * Cloud Platofrm and return a {@link Resource} populated with metadata about
 * the instance. Returns an empty Resource if detection fails.
 */
export class GcpDetector {
  /** Determine if the GCP metadata server is currently available. */
  static async isRunningOnComputeEngine(): Promise<Boolean> {
    return gcpMetadata.isAvailable();
  }
  static async detect(): Promise<Resource> {
    const isRunning = await GcpDetector.isRunningOnComputeEngine();
    if (!isRunning) return Resource.empty();

    const [projectId, instanceId, zoneId, clusterName] = await Promise.all([
      GcpDetector.getProjectId(),
      GcpDetector.getInstanceId(),
      GcpDetector.getZone(),
      GcpDetector.getClusterName(),
    ]);

    const labels: Labels = {};
    labels[CLOUD_RESOURCE.ACCOUNT_ID] = projectId;
    labels[HOST_RESOURCE.ID] = instanceId;
    labels[CLOUD_RESOURCE.ZONE] = zoneId;
    labels[CLOUD_RESOURCE.PROVIDER] = 'gcp';

    if (process.env.KUBERNETES_SERVICE_HOST)
      GcpDetector.addK8sLabels(labels, clusterName);

    return new Resource(labels);
  }

  private static addK8sLabels(labels: Labels, clusterName: string): void {
    labels[K8S_RESOURCE.CLUSTER_NAME] = clusterName;
    labels[K8S_RESOURCE.NAMESPACE_NAME] = process.env.NAMESPACE || '';
    labels[K8S_RESOURCE.POD_NAME] = process.env.HOSTNAME || os.hostname();
    labels[CONTAINER_RESOURCE.NAME] = process.env.CONTAINER_NAME || '';
  }

  /** Gets project id from GCP project metadata. */
  private static async getProjectId(): Promise<string> {
    try {
      return await gcpMetadata.project('project-id');
    } catch {
      return '';
    }
  }

  /** Gets instance id from GCP instance metadata. */
  private static async getInstanceId(): Promise<string> {
    try {
      const id = await gcpMetadata.instance('id');
      return id.toString();
    } catch {
      return '';
    }
  }

  /** Gets zone from GCP instance metadata. */
  private static async getZone(): Promise<string> {
    try {
      const zoneId = await gcpMetadata.instance('zone');
      if (zoneId) {
        return zoneId.split('/').pop();
      }
      return '';
    } catch {
      return '';
    }
  }

  /** Gets cluster name from GCP instance metadata. */
  private static async getClusterName(): Promise<string> {
    try {
      return await gcpMetadata.instance('attributes/cluster-name');
    } catch {
      return '';
    }
  }
}
