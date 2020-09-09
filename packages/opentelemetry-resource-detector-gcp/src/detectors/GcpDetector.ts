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

import * as os from 'os';
import * as semver from 'semver';
import * as gcpMetadata from 'gcp-metadata';
import {
  Detector,
  ResourceDetectionConfigWithLogger,
  Resource,
  ResourceAttributes,
  CLOUD_RESOURCE,
  HOST_RESOURCE,
  K8S_RESOURCE,
  CONTAINER_RESOURCE,
} from '@opentelemetry/resources';

/**
 * The GcpDetector can be used to detect if a process is running in the Google
 * Cloud Platofrm and return a {@link Resource} populated with metadata about
 * the instance. Returns an empty Resource if detection fails.
 */
class GcpDetector implements Detector {
  /**
   * Attempts to connect and obtain instance configuration data from the GCP metadata service.
   * If the connection is succesful it returns a promise containing a {@link Resource}
   * populated with instance metadata. Returns a promise containing an
   * empty {@link Resource} if the connection or parsing of the metadata fails.
   *
   * @param config The resource detection config with a required logger
   */
  async detect(config: ResourceDetectionConfigWithLogger): Promise<Resource> {
    if (
      !semver.satisfies(process.version, '>=10') ||
      !(await gcpMetadata.isAvailable())
    ) {
      config.logger.debug('GcpDetector failed: GCP Metadata unavailable.');
      return Resource.empty();
    }

    const [projectId, instanceId, zoneId, clusterName] = await Promise.all([
      this._getProjectId(),
      this._getInstanceId(),
      this._getZone(),
      this._getClusterName(),
    ]);

    const attributes: ResourceAttributes = {};
    attributes[CLOUD_RESOURCE.ACCOUNT_ID] = projectId;
    attributes[HOST_RESOURCE.ID] = instanceId;
    attributes[CLOUD_RESOURCE.ZONE] = zoneId;
    attributes[CLOUD_RESOURCE.PROVIDER] = 'gcp';

    if (process.env.KUBERNETES_SERVICE_HOST)
      this._addK8sAttributes(attributes, clusterName);

    return new Resource(attributes);
  }

  /** Add resource attributes for K8s */
  private _addK8sAttributes(
    attributes: ResourceAttributes,
    clusterName: string
  ): void {
    attributes[K8S_RESOURCE.CLUSTER_NAME] = clusterName;
    attributes[K8S_RESOURCE.NAMESPACE_NAME] = process.env.NAMESPACE || '';
    attributes[K8S_RESOURCE.POD_NAME] = process.env.HOSTNAME || os.hostname();
    attributes[CONTAINER_RESOURCE.NAME] = process.env.CONTAINER_NAME || '';
  }

  /** Gets project id from GCP project metadata. */
  private async _getProjectId(): Promise<string> {
    try {
      return await gcpMetadata.project('project-id');
    } catch {
      return '';
    }
  }

  /** Gets instance id from GCP instance metadata. */
  private async _getInstanceId(): Promise<string> {
    try {
      const id = await gcpMetadata.instance('id');
      return id.toString();
    } catch {
      return '';
    }
  }

  /** Gets zone from GCP instance metadata. */
  private async _getZone(): Promise<string> {
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
  private async _getClusterName(): Promise<string> {
    try {
      return await gcpMetadata.instance('attributes/cluster-name');
    } catch {
      return '';
    }
  }
}

export const gcpDetector = new GcpDetector();
