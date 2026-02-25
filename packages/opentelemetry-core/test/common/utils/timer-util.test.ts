/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { unrefTimer } from '../../../src';
import * as sinon from 'sinon';

describe('timer-util', function () {
  it('does not throw on number', function () {
    unrefTimer(1);
  });

  it('does call unref', function () {
    const unrefStub = sinon.stub();
    unrefTimer({ unref: unrefStub });
    sinon.assert.calledOnce(unrefStub);
  });
});
