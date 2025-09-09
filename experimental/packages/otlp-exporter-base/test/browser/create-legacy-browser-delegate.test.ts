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
import { inferExportDelegateToUse } from '../../src/configuration/create-legacy-browser-delegate';
import {
  createOtlpFetchExportDelegate,
  createOtlpSendBeaconExportDelegate,
  createOtlpXhrExportDelegate,
} from '../../src/otlp-browser-http-export-delegate';

describe('createLegacyBrowserDelegate', function () {
  describe('when beacon and fetch are available', function () {
    it('uses the beacon delegate when no headers are provided', function () {
      const delegate = inferExportDelegateToUse(undefined);
      assert.equal(delegate, createOtlpSendBeaconExportDelegate);
    });

    it('uses the fetch delegate when headers are provided', function () {
      const delegate = inferExportDelegateToUse({ foo: 'bar' });
      assert.equal(delegate, createOtlpFetchExportDelegate);
    });
  });

  describe('when beacon is unavailable', function () {
    const sendBeacon = window.navigator.sendBeacon;
    beforeEach(function () {
      // fake sendBeacon being unavailable
      (window.navigator as any).sendBeacon = undefined;
    });
    afterEach(() => {
      (window.navigator as any).sendBeacon = sendBeacon;
    });

    describe('when fetch is available', function () {
      it('uses the fetch delegate', function () {
        const delegate = inferExportDelegateToUse(undefined);
        assert.equal(delegate, createOtlpFetchExportDelegate);
      });
    });

    describe('when fetch is unavailable', function () {
      const fetch = window.fetch;
      beforeEach(function () {
        // fake fetch being unavailable
        (window as any).fetch = undefined;
      });
      afterEach(() => {
        window.fetch = fetch;
      });

      it('uses xhr delegate', function () {
        const delegate = inferExportDelegateToUse(undefined);
        assert.equal(delegate, createOtlpXhrExportDelegate);
      });
    });
  });

  describe('when fetch is unavailable but beacon and xhr are', function () {
    const fetch = window.fetch;
    beforeEach(function () {
      // fake fetch being unavailable
      (window as any).fetch = undefined;
    });
    afterEach(function () {
      window.fetch = fetch;
    });

    it('uses xhr when beacon is available but headers are provided', function () {
      const fetch = window.fetch;
      // @ts-expect-error one should not be able to mutate the window but this is a test.
      window.fetch = undefined;

      const delegate = inferExportDelegateToUse({ foo: 'bar' });
      assert.equal(delegate, createOtlpXhrExportDelegate);

      window.fetch = fetch;
    });
  });
});
