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
import { detectResources, Resource, ResourceDetector } from '../src';
import { describeNode } from './util';
import { isPromiseLike } from '../src/utils';

describe('detectResources', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('reliably detects promises', () => {
    assert.ok(isPromiseLike(Promise.resolve()));
  })

  it('handles resource detectors which return Promise<Resource>', async () => {
    const detector: ResourceDetector = {
      detect() {
        return new Resource({
          attributes: {
            sync: 'fromsync',
            async: Promise.resolve().then(() => 'fromasync'),
          },
        });
      },
    };
    const resource = detectResources({
      detectors: [detector],
    });

    await resource.waitForAsyncAttributes?.();
    assert.deepStrictEqual(resource.attributes, {
      sync: 'fromsync',
      async: 'fromasync',
    });
  });

  it('handles resource detectors which return Resource with a promise inside', async () => {
    const detector: ResourceDetector = {
      detect() {
        return new Resource({
          attributes: {
            sync: 'fromsync',
            async: Promise.resolve('fromasync'),
          },
        });
      },
    };
    const resource = detectResources({
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
      class DetectorRejects implements ResourceDetector {
        detect() {
          return new Resource({
            attributes: {
              sync: 'fromsync',
              async: Promise.reject(new Error('reject')),
            },
          });
        }
      }
      class DetectorOk implements ResourceDetector {
        detect() {
          return new Resource({
            attributes: {
              sync: 'fromsync',
              async: Promise.resolve('fromasync'),
            },
          });
        }
      }

      const resource = detectResources({
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
