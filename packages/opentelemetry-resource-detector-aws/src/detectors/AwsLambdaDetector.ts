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
  CLOUD_RESOURCE,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';

/**
 * The AwsLambdaDetector can be used to detect if a process is running in AWS Lambda
 * and return a {@link Resource} populated with data about the environment.
 * Returns an empty Resource if detection fails.
 */
export class AwsLambdaDetector implements Detector {
  async detect(_config?: ResourceDetectionConfig): Promise<Resource> {
    const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
    if (!functionName) {
      return Resource.empty();
    }

    const functionVersion = process.env.AWS_LAMBDA_FUNCTION_VERSION;
    const region = process.env.AWS_REGION;

    const attributes = {
      [CLOUD_RESOURCE.PROVIDER]: 'aws',
    };
    if (region) {
      attributes[CLOUD_RESOURCE.REGION] = region;
    }

    // TODO(https://github.com/open-telemetry/opentelemetry-js/issues/2123): Migrate to FAAS_RESOURCE when defined.
    if (functionName) {
      attributes['faas.name'] = functionName;
    }
    if (functionVersion) {
      attributes['faas.version'] = functionVersion;
    }

    return new Resource(attributes);
  }
}

export const awsLambdaDetector = new AwsLambdaDetector();
