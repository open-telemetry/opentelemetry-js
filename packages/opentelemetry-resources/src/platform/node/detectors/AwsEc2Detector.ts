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

import * as http from 'http';
import { Resource } from '../../../Resource';
import { CLOUD_RESOURCE, HOST_RESOURCE } from '../../../constants';
import { Detector } from '../../../types';

/**
 * The AwsEc2Detector can be used to detect if a process is running in AWS EC2
 * and return a {@link Resource} populated with metadata about the EC2
 * instance. Returns an empty Resource if detection fails.
 */
class AwsEc2Detector implements Detector {
  /**
   * See https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-identity-documents.html
   * for documentation about the AWS instance identity document endpoint.
   */
  readonly AWS_INSTANCE_IDENTITY_DOCUMENT_URI =
    'http://169.254.169.254/latest/dynamic/instance-identity/document';

  /**
   * Attempts to connect and obtain an AWS instance Identity document. If the
   * connection is succesful it returns a promise containing a {@link Resource}
   * populated with instance metadata as labels. Returns a promise containing an
   * empty {@link Resource} if the connection or parsing of the identity
   * document fails.
   */
  async detect(): Promise<Resource> {
    try {
      const {
        accountId,
        instanceId,
        instanceType,
        region,
        availabilityZone,
      } = await this._awsMetadataAccessor();
      return new Resource({
        [CLOUD_RESOURCE.PROVIDER]: 'aws',
        [CLOUD_RESOURCE.ACCOUNT_ID]: accountId,
        [CLOUD_RESOURCE.REGION]: region,
        [CLOUD_RESOURCE.ZONE]: availabilityZone,
        [HOST_RESOURCE.ID]: instanceId,
        [HOST_RESOURCE.TYPE]: instanceType,
      });
    } catch {
      return Resource.empty();
    }
  }

  /**
   * Establishes an HTTP connection to AWS instance identity document url.
   * If the application is running on an EC2 instance, we should be able
   * to get back a valid JSON document. Parses that document and stores
   * the identity properties in a local map.
   */
  private async _awsMetadataAccessor<T>(): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        req.abort();
        reject(new Error('EC2 metadata api request timed out.'));
      }, 1000);

      const req = http.get(this.AWS_INSTANCE_IDENTITY_DOCUMENT_URI, res => {
        clearTimeout(timeoutId);
        const { statusCode } = res;
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => {
          if (statusCode && statusCode >= 200 && statusCode < 300) {
            try {
              resolve(JSON.parse(rawData));
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
    });
  }
}

export const awsEc2Detector = new AwsEc2Detector();
