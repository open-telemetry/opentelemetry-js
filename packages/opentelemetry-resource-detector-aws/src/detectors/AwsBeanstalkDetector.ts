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
  SERVICE_RESOURCE,
  ResourceDetectionConfigWithLogger,
} from '@opentelemetry/resources';
import * as fs from 'fs';
import * as util from 'util';

/**
 * The AwsBeanstalkDetector can be used to detect if a process is running in AWS Elastic
 * Beanstalk and return a {@link Resource} populated with data about the beanstalk
 * plugins of AWS X-Ray. Returns an empty Resource if detection fails.
 *
 * See https://docs.amazonaws.cn/en_us/xray/latest/devguide/xray-guide.pdf
 * for more details about detecting information of Elastic Beanstalk plugins
 */

const DEFAULT_BEANSTALK_CONF_PATH =
  '/var/elasticbeanstalk/xray/environment.conf';
const WIN_OS_BEANSTALK_CONF_PATH =
  'C:\\Program Files\\Amazon\\XRay\\environment.conf';

export class AwsBeanstalkDetector implements Detector {
  BEANSTALK_CONF_PATH: string;
  private static readFileAsync = util.promisify(fs.readFile);
  private static fileAccessAsync = util.promisify(fs.access);

  constructor() {
    if (process.platform === 'win32') {
      this.BEANSTALK_CONF_PATH = WIN_OS_BEANSTALK_CONF_PATH;
    } else {
      this.BEANSTALK_CONF_PATH = DEFAULT_BEANSTALK_CONF_PATH;
    }
  }

  async detect(config: ResourceDetectionConfigWithLogger): Promise<Resource> {
    try {
      await AwsBeanstalkDetector.fileAccessAsync(
        this.BEANSTALK_CONF_PATH,
        fs.constants.R_OK
      );

      const rawData = await AwsBeanstalkDetector.readFileAsync(
        this.BEANSTALK_CONF_PATH,
        'utf8'
      );
      const parsedData = JSON.parse(rawData);

      return new Resource({
        [SERVICE_RESOURCE.NAME]: 'elastic_beanstalk',
        [SERVICE_RESOURCE.NAMESPACE]: parsedData.environment_name,
        [SERVICE_RESOURCE.VERSION]: parsedData.version_label,
        [SERVICE_RESOURCE.INSTANCE_ID]: parsedData.deployment_id,
      });
    } catch (e) {
      config.logger.debug(`AwsBeanstalkDetector failed: ${e.message}`);
      return Resource.empty();
    }
  }
}

export const awsBeanstalkDetector = new AwsBeanstalkDetector();
