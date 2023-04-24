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
import { RAW_ENVIRONMENT } from '@opentelemetry/core';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { envDetector, IResource } from '../../../src';
import {
  assertEmptyResource,
  assertWebEngineResource,
} from '../../util/resource-assertions';
import { describeBrowser } from '../../util';

describeBrowser('envDetector() on web browser', () => {
  describe('with valid env', () => {
    before(() => {
      (
        globalThis as typeof globalThis & RAW_ENVIRONMENT
      ).OTEL_RESOURCE_ATTRIBUTES =
        'webengine.name="chromium",webengine.version="99",webengine.description="Chromium",custom.key="custom%20value"';
    });

    after(() => {
      delete (globalThis as typeof globalThis & RAW_ENVIRONMENT)
        .OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should return resource information from environment variable', async () => {
      const resource: IResource = await envDetector.detect();
      assertWebEngineResource(resource, {
        [SemanticResourceAttributes.WEBENGINE_NAME]: 'chromium',
        [SemanticResourceAttributes.WEBENGINE_VERSION]: '99',
        [SemanticResourceAttributes.WEBENGINE_DESCRIPTION]: 'Chromium',
      });
      assert.strictEqual(resource.attributes['custom.key'], 'custom value');
    });
  });

  describe('with invalid env', () => {
    const values = ['webengine.description="with spaces"'];

    for (const value of values) {
      describe(`value: '${value}'`, () => {
        before(() => {
          (
            globalThis as typeof globalThis & RAW_ENVIRONMENT
          ).OTEL_RESOURCE_ATTRIBUTES = value;
        });

        after(() => {
          delete (globalThis as typeof globalThis & RAW_ENVIRONMENT)
            .OTEL_RESOURCE_ATTRIBUTES;
        });

        it('should return empty resource', async () => {
          const resource: IResource = await envDetector.detect();
          assertEmptyResource(resource);
        });
      });
    }
  });

  describe('with empty env', () => {
    it('should return empty resource', async () => {
      const resource: IResource = await envDetector.detect();
      assertEmptyResource(resource);
    });
  });

  describe('with empty env', () => {
    it('should return empty resource', async () => {
      const resource: IResource = await envDetector.detect();
      assertEmptyResource(resource);
    });
  });
});
