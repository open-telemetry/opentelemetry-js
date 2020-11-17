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

import * as assert from 'assert';
import * as sinon from 'sinon';

import { gitHubDetector } from '../../src/detectors';

describe('GitHubResourceDetector', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    process.env.GITHUB_WORKFLOW = '';
    process.env.GITHUB_RUN_ID = '';
    process.env.GITHUB_RUN_NUMBER = '';
    process.env.GITHUB_ACTOR = '';
    process.env.GITHUB_SHA = '';
    process.env.GITHUB_REF = '';
    process.env.GITHUB_HEAD_REF = '';
    process.env.GITHUB_BASE_REF = '';
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully return github resource data', async () => {
    process.env.GITHUB_WORKFLOW = 'workflow-foo';
    process.env.GITHUB_RUN_ID = 'run-id-foo';
    process.env.GITHUB_RUN_NUMBER = '42';
    process.env.GITHUB_ACTOR = 'octocat';
    process.env.GITHUB_SHA = 'git-sha';
    process.env.GITHUB_REF = 'git-ref';
    process.env.GITHUB_HEAD_REF = 'ref/foo';
    process.env.GITHUB_BASE_REF = 'ref/bar';

    const resource = await gitHubDetector.detect();

    assert.ok(resource);
    assert.deepStrictEqual(resource.attributes, {
      'github.workflow': 'workflow-foo',
      'github.run_id': 'run-id-foo',
      'github.run_number': '42',
      'github.actor': 'octocat',
      'github.sha': 'git-sha',
      'github.ref': 'git-ref',
      'github.head_ref': 'ref/foo',
      'github.base_ref': 'ref/bar',
    });
  });

  it('should return empty resource when no GitHub env vars exists', async () => {
    const resource = await gitHubDetector.detect();

    assert.ok(resource);
    assert.deepStrictEqual(resource.attributes, {});
  });
});
