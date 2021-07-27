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
  ResourceDetectionConfig,
} from '@opentelemetry/resources';
import {
  CloudProviderValues,
  CloudPlatformValues,
  SemanticResourceAttributes,
} from '@opentelemetry/semantic-conventions';
import * as http from 'http';

/**
 * The AliyunEcsDetector can be used to detect if a process is running in Aliyun ECS
 * and return a {@link Resource} populated with metadata about the ECS
 * instance. Returns an empty Resource if detection fails.
 */
class AliyunEcsDetector implements Detector {
  /**
   * See https://help.aliyun.com/document_detail/67254.html, also
   * https://www.alibabacloud.com/help/doc-detail/67254.htm for documentation
   * about the Aliyun instance identity document.
   */
  readonly ALIYUN_IDMS_ENDPOINT = '100.100.100.200';
  readonly ALIYUN_INSTANCE_IDENTITY_DOCUMENT_PATH =
    '/latest/dynamic/instance-identity/document';
  readonly ALIYUN_INSTANCE_HOST_DOCUMENT_PATH = '/latest/meta-data/hostname';
  readonly MILLISECOND_TIME_OUT = 1000;

  /**
   * Attempts to connect and obtain an Aliyun instance Identity document. If the
   * connection is successful it returns a promise containing a {@link Resource}
   * populated with instance metadata. Returns a promise containing an
   * empty {@link Resource} if the connection or parsing of the identity
   * document fails.
   *
   * @param config (unused) The resource detection config
   */
  async detect(_config?: ResourceDetectionConfig): Promise<Resource> {
    const {
      'owner-account-id': accountId,
      'instance-id': instanceId,
      'instance-type': instanceType,
      'region-id': region,
      'zone-id': availabilityZone,
    } = await this._fetchIdentity();
    const hostname = await this._fetchHost();

    return new Resource({
      [SemanticResourceAttributes.CLOUD_PROVIDER]: CloudProviderValues.ALIYUN,
      [SemanticResourceAttributes.CLOUD_PLATFORM]: CloudPlatformValues.ALIYUN_ECS,
      [SemanticResourceAttributes.CLOUD_ACCOUNT_ID]: accountId,
      [SemanticResourceAttributes.CLOUD_REGION]: region,
      [SemanticResourceAttributes.CLOUD_AVAILABILITY_ZONE]: availabilityZone,
      [SemanticResourceAttributes.HOST_ID]: instanceId,
      [SemanticResourceAttributes.HOST_TYPE]: instanceType,
      [SemanticResourceAttributes.HOST_NAME]: hostname,
    });
  }

  /**
   * Fetch Aliyun instance document url with http requests. If the application
   * is running on an ECS instance, we should be able to get back a valid JSON
   * document. Parses that document and stores the identity properties in a
   * local map.
   */
  private async _fetchIdentity(): Promise<any> {
    const options = {
      host: this.ALIYUN_IDMS_ENDPOINT,
      path: this.ALIYUN_INSTANCE_IDENTITY_DOCUMENT_PATH,
      method: 'GET',
      timeout: this.MILLISECOND_TIME_OUT,
    };
    const identity = await this._fetchString(options);
    return JSON.parse(identity);
  }

  private async _fetchHost(): Promise<string> {
    const options = {
      host: this.ALIYUN_IDMS_ENDPOINT,
      path: this.ALIYUN_INSTANCE_HOST_DOCUMENT_PATH,
      method: 'GET',
      timeout: this.MILLISECOND_TIME_OUT,
    };
    return await this._fetchString(options);
  }

  private async _fetchString(options: http.RequestOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        req.abort();
        reject(new Error('ECS metadata api request timed out.'));
      }, 1000);

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

export const aliyunEcsDetector = new AliyunEcsDetector();
