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
import * as assert from 'assert';
import { sendBeaconRequest } from '../../../src/platform/browser/internal';
import { assertRejects } from '../../test-utils';

describe('sendBeaconRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should call sendBeacon with json payload', async () => {
    const stub = sinon.stub(navigator, 'sendBeacon');
    stub.returns(true);

    await sendBeaconRequest('https://example.com', '{"my": "payload"}', {
      contentType: 'application/json',
    });
    assert.strictEqual(stub.callCount, 1);
    const args = stub.args[0];

    assert.strictEqual(args[0], 'https://example.com');
    const blob = args[1];
    assert.ok(blob instanceof Blob);
    assert.strictEqual(blob.type, 'application/json');
    const text = await blob.text();
    assert.strictEqual(text, '{"my": "payload"}');
  });

  it('should reject if sendBeacon returns false', async () => {
    const stub = sinon.stub(navigator, 'sendBeacon');
    stub.returns(false);

    await assertRejects(
      sendBeaconRequest('https://example.com', '{"my": "payload"}', {
        contentType: 'application/json',
      }),
      /HttpClientError: sendBeacon - cannot send/
    );
  });
});
