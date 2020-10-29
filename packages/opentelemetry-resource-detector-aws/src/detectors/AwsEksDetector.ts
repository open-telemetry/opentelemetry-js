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
    Detector,
    Resource,
    CONTAINER_RESOURCE,
    K8S_RESOURCE,
    ResourceDetectionConfigWithLogger,
  } from '@opentelemetry/resources';
  import * as http from 'http';
  import * as fs from 'fs';
  import * as util from 'util';
  import * as tls from 'tls';

  /**
 * The AwsEksDetector can be used to detect if a process is running in AWS Elastic
 * Kubernetes and return a {@link Resource} populated with data about the Kubernetes
 * plugins of AWS X-Ray. Returns an empty Resource if detection fails.
 *
 * See https://docs.amazonaws.cn/en_us/xray/latest/devguide/xray-guide.pdf
 * for more details about detecting information for Elastic Kubernetes plugins
 */
  
  class AwsEksDetector implements Detector {
    readonly K8S_SVC_URL = "https://kubernetes.default.svc";
    readonly K8S_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token";
    readonly K8S_CERT_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt";
    readonly AUTH_CONFIGMAP_PATH ="/api/v1/namespaces/kube-system/configmaps/aws-auth";
    readonly CW_CONFIGMAP_PATH = "/api/v1/namespaces/amazon-cloudwatch/configmaps/cluster-info";
    readonly CONTAINER_ID_LENGTH = 64;
    readonly DEFAULT_CGROUP_PATH = "/proc/self/cgroup";
    readonly MILLISECOND_TIME_OUT = 2000;

    private static readFileAsync = util.promisify(fs.readFile);
  
    async detect(config: ResourceDetectionConfigWithLogger): Promise<Resource> {
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
    }

    private async _isEks(config: ResourceDetectionConfigWithLogger): Promise<boolean> {
      fs.access(this.K8S_TOKEN_PATH, (err) => {
        config.logger.debug('Not running on K8S');
        return false;
      });
      fs.access(this.K8S_CERT_PATH, (err) => {
        config.logger.debug('Not running on K8S');
        return false;
      });
      const secureContext = tls.createSecureContext({
        ca: fs.readFileSync(this.K8S_CERT_PATH),
      });
      const options = {
        host: this.K8S_SVC_URL,
        path: this.AUTH_CONFIGMAP_PATH,
        method: 'GET',
        timeout: this.MILLISECOND_TIME_OUT,
        HEADERS: {
          "Authorization" : this._getK8sCredHeader(config),
        },
        ca: secureContext,
      }
      const awsAuth = this._fetchString(options);
      return !!awsAuth;
    }

     private async _getClusterName(config: ResourceDetectionConfigWithLogger): Promise<string | undefined> {
        const secureContext = tls.createSecureContext({
          ca: fs.readFileSync(this.K8S_CERT_PATH),
        });
        const options = {
        host: this.K8S_SVC_URL,
        path: this.AUTH_CONFIGMAP_PATH,
        method: 'GET',
        timeout: this.MILLISECOND_TIME_OUT,
        HEADERS: {
          "Authorization" : this._getK8sCredHeader(config),
        },
        ca: secureContext,
      }
        const clusterName = this._fetchString(options);
        return clusterName;
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
          const content = await AwsEksDetector.readFileAsync(
            this.DEFAULT_CGROUP_PATH,
            'utf8'
          );
          const splitData = content.trim().split('\n');
          for (const str of splitData) {
            if (str.length > this.CONTAINER_ID_LENGTH) {
              return str.substring(str.length - this.CONTAINER_ID_LENGTH);
              }
            }
          }
          catch (e) {
            config.logger.warn(`AwsEksDetector failed to read container ID: ${e.message}`);
          }
        return undefined;
      }

  /**
   * Establishes an HTTP connection to AWS instance document url.
   * If the application is running on an Eks instance, we should be able
   * to get back a valid JSON document. Parses that document and stores
   * the identity properties in a local map.
   */
  private async _fetchString(options: http.RequestOptions): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        req.abort();
        reject(new Error('Eks metadata api request timed out.'));
      }, 2000);

      const req = http.request(options, res => {
        clearTimeout(timeoutId);
        const { statusCode } = res;
        res.setEncoding('utf8');
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