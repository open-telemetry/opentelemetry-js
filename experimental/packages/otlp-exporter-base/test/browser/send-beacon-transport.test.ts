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
import * as sinon from 'sinon';
import { createSendBeaconTransport } from '../../src/transport/send-beacon-transport';
import * as assert from 'assert';

describe('SendBeaconTransport', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('send', function () {
    it('returns failure when sendBeacon fails', async function () {
      // arrange
      const sendStub = sinon.stub(navigator, 'sendBeacon').returns(false);
      const transport = createSendBeaconTransport({
        url: 'http://example.test',
        blobType: 'application/json',
      });

      // act
      const result = await transport.send(Uint8Array.from([1, 2, 3]), 1000);

      // assert
      sinon.assert.calledOnceWithMatch(
        sendStub,
        'http://example.test',
        sinon.match
          .instanceOf(Blob)
          .and(
            sinon.match(
              actual => actual.type === 'application/json',
              'Expected Blob type to match.'
            )
          )
      );
      assert.strictEqual(result.status, 'failure');
    });

    it('returns success when sendBeacon succeeds', async function () {
      // arrange
      const sendStub = sinon.stub(navigator, 'sendBeacon').returns(true);
      const transport = createSendBeaconTransport({
        url: 'http://example.test',
        blobType: 'application/json',
      });

      // act
      const result = await transport.send(Uint8Array.from([1, 2, 3]), 1000);

      // assert
      sinon.assert.calledOnceWithMatch(
        sendStub,
        'http://example.test',
        sinon.match
          .instanceOf(Blob)
          .and(
            sinon.match(
              actual => actual.type === 'application/json',
              'Expected Blob type to match.'
            )
          )
      );
      assert.strictEqual(result.status, 'success');
    });
  });
});
