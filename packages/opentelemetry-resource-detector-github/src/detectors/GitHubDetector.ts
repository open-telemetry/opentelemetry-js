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
  ResourceAttributes,
} from '@opentelemetry/resources';

/**
 * The GitHubDetector can be used to detect GitHub Actions environment variables and returns
 *  a {@link Resource} populated with GitHub-specific metadata that exists
 * in GitHub Actions environments.
 *
 * More information about GitHub Action environment variables is available here:
 * https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables
 *
 * Returns an empty Resource if detection fails.
 */
class GitHubDetector implements Detector {
  private _attributes: ResourceAttributes = {};

  /**
   * Adds an environment variable attribute if a non-empty string.
   * @param key
   * @param value
   */
  private addAttributeIfExists(key: string, value: string | undefined) {
    if (typeof value === 'string' && value.length > 0) {
      this._attributes[key] = value;
    }
  }

  /**
   * Attempts to obtain GitHub repository information from GitHub Actions
   * environment variables:
   * https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables
   *
   * If succesful it returns a promise containing a {@link Resource}
   * populated with GitHub metadata. Returns a promise containing an
   * empty {@link Resource} if the connection fails.
   *
   */
  async detect(): Promise<Resource> {
    this._attributes = {};
    this.addAttributeIfExists('github.workflow', process.env.GITHUB_WORKFLOW);
    this.addAttributeIfExists('github.run_id', process.env.GITHUB_RUN_ID);
    this.addAttributeIfExists(
      'github.run_number',
      process.env.GITHUB_RUN_NUMBER
    );
    this.addAttributeIfExists('github.actor', process.env.GITHUB_ACTOR);
    this.addAttributeIfExists('github.sha', process.env.GITHUB_SHA);
    this.addAttributeIfExists('github.ref', process.env.GITHUB_REF);
    this.addAttributeIfExists('github.head_ref', process.env.GITHUB_HEAD_REF);
    this.addAttributeIfExists('github.base_ref', process.env.GITHUB_BASE_REF);

    return new Resource(this._attributes);
  }
}

export const gitHubDetector = new GitHubDetector();
