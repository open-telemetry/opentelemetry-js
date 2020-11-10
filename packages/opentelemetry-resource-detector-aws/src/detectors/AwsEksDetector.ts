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

import {
<<<<<<< HEAD
  Detector,
  Resource,
  CONTAINER_RESOURCE,
  K8S_RESOURCE,
  ResourceDetectionConfigWithLogger,
} from '@opentelemetry/resources';
import * as https from 'https';
import * as fs from 'fs';
import * as util from 'util';
=======
    Detector,
    Resource,
    CONTAINER_RESOURCE,
    K8S_RESOURCE,
    ResourceDetectionConfigWithLogger,
  } from '@opentelemetry/resources';
  import * as https from 'https';
  import * as fs from 'fs';
  import * as util from 'util';
>>>>>>> b9e63372f... feat: update implementation of https requests

/**
 * The AwsEksDetector can be used to detect if a process is running in AWS Elastic
 * Kubernetes and return a {@link Resource} populated with data about the Kubernetes
 * plugins of AWS X-Ray. Returns an empty Resource if detection fails.
 *
 * See https://docs.amazonaws.cn/en_us/xray/latest/devguide/xray-guide.pdf
 * for more details about detecting information for Elastic Kubernetes plugins
 */

export class AwsEksDetector implements Detector {
  readonly K8S_SVC_URL = 'kubernetes.default.svc';
  readonly K8S_TOKEN_PATH =
    '/var/run/secrets/kubernetes.io/serviceaccount/token';
  readonly K8S_CERT_PATH =
    '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt';
  readonly AUTH_CONFIGMAP_PATH =
    '/api/v1/namespaces/kube-system/configmaps/aws-auth';
  readonly CW_CONFIGMAP_PATH =
    '/api/v1/namespaces/amazon-cloudwatch/configmaps/cluster-info';
  readonly CONTAINER_ID_LENGTH = 64;
  readonly DEFAULT_CGROUP_PATH = '/proc/self/cgroup';
  readonly TIMEOUT_MS = 2000;
  readonly UTF8_UNICODE = 'utf8';

<<<<<<< HEAD
  private static readFileAsync = util.promisify(fs.readFile);
  private static fileAccessAsync = util.promisify(fs.access);

  /**
   * The AwsEksDetector can be used to detect if a process is running on Amazon
   * Elastic Kubernetes and returns a promise containing a {@link Resource}
   * populated with instance metadata. Returns a promise containing an
   * empty {@link Resource} if the connection to kubernetes process
   * or aws config maps fails
   * @param config The resource detection config with a required logger
   */
  async detect(config: ResourceDetectionConfigWithLogger): Promise<Resource> {
    try {
      await AwsEksDetector.fileAccessAsync(this.K8S_TOKEN_PATH);
      const k8scert = await AwsEksDetector.readFileAsync(this.K8S_CERT_PATH);

      if (!this._isEks(config, k8scert)) {
        return Resource.empty();
      }

      const containerId = await this._getContainerId(config);
      const clusterName = await this._getClusterName(config, k8scert);

      return !containerId && !clusterName
        ? Resource.empty()
        : new Resource({
            [K8S_RESOURCE.CLUSTER_NAME]: clusterName || '',
            [CONTAINER_RESOURCE.ID]: containerId || '',
          });
    } catch (e) {
<<<<<<< HEAD
      config.logger.warn('Process is not running on K8S', e);
=======
      config.logger.warn('This process is not running on Kubernetes because either the token path or certificate path cannot be accessed ', e);
>>>>>>> 21e3884b1... fix: update naming conventions consistentcy
      return Resource.empty();
=======
    private static readFileAsync = util.promisify(fs.readFile);
    private static fileAccessAsync = util.promisify(fs.access);
  
    async detect(config: ResourceDetectionConfigWithLogger): Promise<Resource> {
      try {
        await AwsEksDetector.fileAccessAsync(this.K8S_TOKEN_PATH);
        await AwsEksDetector.fileAccessAsync(this.K8S_CERT_PATH);
        
        if (!this._isEks(config)) {
          config.logger.debug('AwsEcsDetector failed: Process is not running on Eks');
          return Resource.empty();
        }
      
        const containerId = await this._getContainerId(config);
        const clusterName = await this._getClusterName(config);

        return !containerId && !clusterName
        ? Resource.empty()
        : new Resource({
          [K8S_RESOURCE.CLUSTER_NAME]: clusterName || '',
          [CONTAINER_RESOURCE.ID]: containerId || '',
        });
      } catch (e) {
        config.logger.warn('Not running on K8S');
        return Resource.empty();
      }
>>>>>>> 7d354c340... fix: use file read async instead of sync
    }
  }

<<<<<<< HEAD
  /**
   * Attempts to make a connection to AWS Config map which will
   * determine whether the process is running on an EKS
   * process if the config map is empty or not
   * @param config The resource detection config with a required logger
   */
  private async _isEks(
    config: ResourceDetectionConfigWithLogger,
    cert: Buffer
  ): Promise<boolean> {
    const options = {
      ca: cert,
      headers: {
        Authorization: await this._getK8sCredHeader(config),
      },
<<<<<<< HEAD
      hostname: this.K8S_SVC_URL,
      method: 'GET',
      path: this.AUTH_CONFIGMAP_PATH,
      timeout: this.TIMEOUT_MS,
=======
      ca: cert,
>>>>>>> 21e3884b1... fix: update naming conventions consistentcy
    };
    return !!(await this._fetchString(options));
  }

  /**
   * Attempts to make a connection to Amazon Cloudwatch
   * Config Maps to grab cluster name
   * @param config The resource detection config with a required logger
   */
  private async _getClusterName(
    config: ResourceDetectionConfigWithLogger,
    cert: Buffer
  ): Promise<string | undefined> {
    const options = {
      ca: cert,
      headers: {
        Authorization: await this._getK8sCredHeader(config),
      },
<<<<<<< HEAD
      host: this.K8S_SVC_URL,
      method: 'GET',
      path: this.CW_CONFIGMAP_PATH,
      timeout: this.TIMEOUT_MS,
=======
      ca: cert,
>>>>>>> 21e3884b1... fix: update naming conventions consistentcy
    };
    const response = await this._fetchString(options);
    try {
      return JSON.parse(response).data['cluster.name'];
    } catch (e) {
      config.logger.warn('Cannot get cluster name on EKS', e);
    }
    return '';
  }
  /**
   * Reads the Kubernetes token path and returns kubernetes
   * credential header
   * @param config The resource detection config with a required logger
   */
  private async _getK8sCredHeader(
    config: ResourceDetectionConfigWithLogger
  ): Promise<string> {
    try {
      const content = await AwsEksDetector.readFileAsync(
        this.K8S_TOKEN_PATH,
        this.UTF8_UNICODE
      );
      return 'Bearer ' + content;
    } catch (e) {
      config.logger.warn('Unable to read Kubernetes client token.', e);
<<<<<<< HEAD
=======
    private async _isEks(config: ResourceDetectionConfigWithLogger): Promise<boolean> {
      const options = {
        hostname: this.K8S_SVC_URL,
        path: this.AUTH_CONFIGMAP_PATH,
        method: 'GET',
        timeout: this.MILLISECOND_TIME_OUT,
        HEADERS: {
          "Authorization" : this._getK8sCredHeader(config),
        },
        ca: JSON.stringify(AwsEksDetector.readFileAsync(this.K8S_CERT_PATH)),
      }
      const awsAuth = this._fetchString(options);
      return !!awsAuth;
>>>>>>> 7d354c340... fix: use file read async instead of sync
=======
>>>>>>> 21e3884b1... fix: update naming conventions consistentcy
    }
    return '';
  }

<<<<<<< HEAD
  /**
   * Read container ID from cgroup file
   * In EKS, even if we fail to find target file
   * or target file does not contain container ID
   * we do not throw an error but throw warning message
   * and then return null string
   */
  private async _getContainerId(
    config: ResourceDetectionConfigWithLogger
  ): Promise<string | undefined> {
    try {
      const rawData = await AwsEksDetector.readFileAsync(
        this.DEFAULT_CGROUP_PATH,
        this.UTF8_UNICODE
      );
      const splitData = rawData.trim().split('\n');
      for (const str of splitData) {
        if (str.length > this.CONTAINER_ID_LENGTH) {
          return str.substring(str.length - this.CONTAINER_ID_LENGTH);
        }
      }
    } catch (e) {
      config.logger.warn(
        `AwsEksDetector failed to read container ID: ${e.message}`
      );
    }
    return undefined;
  }
=======
     private async _getClusterName(config: ResourceDetectionConfigWithLogger): Promise<string | undefined> {
        const options = {
        host: this.K8S_SVC_URL,
        path: this.CW_CONFIGMAP_PATH,
        method: 'GET',
        timeout: this.MILLISECOND_TIME_OUT,
        HEADERS: {
          "Authorization" : this._getK8sCredHeader(config),
        },
        ca: JSON.stringify(AwsEksDetector.readFileAsync(this.K8S_CERT_PATH)),
      }
        return this._fetchString(options);
     }

     private async _getK8sCredHeader(config: ResourceDetectionConfigWithLogger): Promise<string> {
        try {
          const content = await AwsEksDetector.readFileAsync(
              this.K8S_TOKEN_PATH,
              'utf8'
          );
          return "Bearer " + content;
        } catch (e) {
            config.logger.warn(`AwsEksDetector failed to read container ID: ${e.message}`);
        }
        return "";
    }

    /**
    * Read container ID from cgroup file
    * In EKS, even if we fail to find target file
    * or target file does not contain container ID
    * we do not throw an error but throw warning message
    * and then return null string
    */
    private async _getContainerId(config: ResourceDetectionConfigWithLogger): Promise<string | undefined> {
        try {
          const rawData = await AwsEksDetector.readFileAsync(
            this.DEFAULT_CGROUP_PATH,
            'utf8'
          );
          const splitData = rawData.trim().split('\n');
          for (const str of splitData) {
            if (str.length > this.CONTAINER_ID_LENGTH) {
              return str.substring(str.length - this.CONTAINER_ID_LENGTH);
              }
            }
          } catch (e) {
            config.logger.warn(`AwsEksDetector failed to read container ID: ${e.message}`);
          }
        return undefined;
      }
>>>>>>> 7d354c340... fix: use file read async instead of sync

  /**
   * Establishes an HTTP connection to AWS instance document url.
   * If the application is running on an Eks instance, we should be able
   * to get back a valid JSON document. Parses that document and stores
   * the identity properties in a local map.
   */
<<<<<<< HEAD
  private async _fetchString(options: https.RequestOptions): Promise<string> {
    return await new Promise((resolve, reject) => {
=======
  private async _fetchString(options: https.RequestOptions): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
>>>>>>> b9e63372f... feat: update implementation of https requests
      const timeoutId = setTimeout(() => {
        req.abort();
        reject(new Error('EKS metadata api request timed out.'));
      }, 2000);

      const req = https.request(options, res => {
        clearTimeout(timeoutId);
        const { statusCode } = res;
        res.setEncoding(this.UTF8_UNICODE);
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => {
          if (statusCode && statusCode >= 200 && statusCode < 300) {
            try {
              resolve(rawData);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(
              new Error('Failed to load page, status code: ' + statusCode)
            );
          }
        });
      });
      req.on('error', err => {
        clearTimeout(timeoutId);
        reject(err);
      });
      req.end();
    });
  }
}

export const awsEksDetector = new AwsEksDetector();
