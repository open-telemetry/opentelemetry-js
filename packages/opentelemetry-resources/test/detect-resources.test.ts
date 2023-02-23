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

import { diag } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { Resource, Detector, detectResourcesSync, DetectorSync } from '../src';
import { describeNode } from './util';

describe('detectResourcesSync', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('handles resource detectors which return Promise<Resource>', async () => {
    const detector: Detector = {
      async detect() {
        return new Resource({ sync: 'fromsync' });
      },
    };
    const resource = detectResourcesSync({
      detectors: [detector],
    });

    await resource.waitForAsyncAttributes?.();
    assert.deepStrictEqual(resource.attributes, {
      sync: 'fromsync',
    });
  });

  it('handles resource detectors which return Resource with a promise inside', async () => {
    const detector: DetectorSync = {
      detect() {
        return new Resource(
          { sync: 'fromsync' },
          Promise.resolve({ async: 'fromasync' })
        );
      },
    };
    const resource = detectResourcesSync({
      detectors: [detector],
    });

    // before waiting, it should already have the sync resources
    assert.deepStrictEqual(resource.attributes, { sync: 'fromsync' });
    await resource.waitForAsyncAttributes?.();
    assert.deepStrictEqual(resource.attributes, {
      sync: 'fromsync',
      async: 'fromasync',
    });
  });

  describeNode('logging', () => {
    it("logs when a detector's async attributes promise rejects", async () => {
      const debugStub = sinon.spy(diag, 'debug');

      // use a class so it has a name
      class DetectorRejects implements DetectorSync {
        detect() {
          return new Resource(
            { sync: 'fromsync' },
            Promise.reject(new Error('reject'))
          );
        }
      }
      class DetectorOk implements DetectorSync {
        detect() {
          return new Resource(
            { sync: 'fromsync' },
            Promise.resolve({ async: 'fromasync' })
          );
        }
      }

      const resource = detectResourcesSync({
        detectors: [new DetectorRejects(), new DetectorOk()],
      });

      await resource.waitForAsyncAttributes?.();

      assert.ok(
        debugStub.calledWithMatch(
          "a resource's async attributes promise rejected"
        )
      );
    });
  });
});
