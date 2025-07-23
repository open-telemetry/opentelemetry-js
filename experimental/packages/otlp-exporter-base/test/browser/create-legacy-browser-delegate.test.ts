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
import { JsonLogsSerializer } from '@opentelemetry/otlp-transformer';
import {
  convertLegacyBrowserHttpOptions,
  createLegacyOtlpBrowserExportDelegate,
} from '../../src/index-browser-http';
import {
  createOtlpFetchExportDelegate,
  createOtlpSendBeaconExportDelegate,
  createOtlpXhrExportDelegate,
} from '../../src/otlp-browser-http-export-delegate';
import { OTLPExporterConfigBase } from '../../src';

describe.only('createLegacyBrowserDelegate', function () {
  const config = {
    url: 'https://example.com',
    headers: () => ({ test: 'custom-header' }),
  } as unknown as OTLPExporterConfigBase;
  const serializer = JsonLogsSerializer;
  const signalResourcePath = 'example/of/path';
  const requiredHeaders = { test: 'custom-header' };
  const options = convertLegacyBrowserHttpOptions(
    config,
    signalResourcePath,
    requiredHeaders
  );
  const fetchDelegate = createOtlpFetchExportDelegate(options, serializer);
  const xhrDelegate = createOtlpXhrExportDelegate(options, serializer);
  const beaconDelegate = createOtlpSendBeaconExportDelegate(
    options,
    serializer
  );
  function createDelegate() {
    return createLegacyOtlpBrowserExportDelegate(
      config,
      serializer,
      signalResourcePath,
      requiredHeaders
    );
  }

  describe('when beacon is available', function () {
    it('uses the beacon delegate', function () {
      const delegate = createDelegate();
      assert.ok(delegate instanceof beaconDelegate.constructor);
    });
  });

  describe('when beacon is not available', function () {
    beforeEach(function () {
      // fake sendBeacon being available
      (window.navigator as any).sendBeacon = undefined;
    });

    it('uses the xhr delegate', function () {
      const delegate = createDelegate();
      assert.ok(delegate instanceof xhrDelegate.constructor);
    });
  });

  describe('when beacon and xhr are not available', function () {
    beforeEach(function () {
      // fake sendBeacon being available
      (window.navigator as any).sendBeacon = undefined;
      // @ts-expect-error one should not be able to mutate the window but this is a test.
      window.XMLHttpRequest = undefined;
    });

    it('uses the fetch delegate', function () {
      const delegate = createDelegate();
      assert.ok(delegate instanceof fetchDelegate.constructor);
    });
  });
});
