/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import {
  declarativeConfigProperties,
  readConfig,
} from '../src/DeclarativeConfigProperties';

describe('declarativeConfigProperties', function () {
  let warn: sinon.SinonStub;

  beforeEach(function () {
    warn = sinon.stub();
    diag.setLogger(
      {
        verbose: () => {},
        debug: () => {},
        info: () => {},
        warn,
        error: () => {},
      },
      DiagLogLevel.WARN
    );
  });

  afterEach(function () {
    diag.disable();
    sinon.restore();
  });

  describe('factory null-safety', function () {
    for (const block of [undefined, null, 42, 'str', ['a'], true]) {
      it(`yields an empty accessor for ${JSON.stringify(block)}`, function () {
        const properties = declarativeConfigProperties(block);
        assert.strictEqual(properties.getBoolean('any'), undefined);
        assert.strictEqual(properties.getString('any'), undefined);
        assert.strictEqual(properties.getNumber('any'), undefined);
        assert.strictEqual(properties.getStringArray('any'), undefined);
        assert.strictEqual(properties.getStructured('any'), undefined);
        sinon.assert.notCalled(warn);
      });
    }
  });

  describe('getBoolean', function () {
    it('returns the value when present and boolean', function () {
      const properties = declarativeConfigProperties({ enabled: false });
      assert.strictEqual(properties.getBoolean('enabled'), false);
      sinon.assert.notCalled(warn);
    });

    it('returns undefined and is silent when absent', function () {
      assert.strictEqual(
        declarativeConfigProperties({}).getBoolean('enabled'),
        undefined
      );
      sinon.assert.notCalled(warn);
    });

    it('returns undefined and warns on type mismatch', function () {
      assert.strictEqual(
        declarativeConfigProperties({ enabled: 'yes' }).getBoolean('enabled'),
        undefined
      );
      sinon.assert.calledOnce(warn);
      assert.match(
        warn.firstCall.args[0],
        /enabled.*expected boolean.*got string/
      );
    });
  });

  describe('getString', function () {
    it('returns the value when present and string', function () {
      assert.strictEqual(
        declarativeConfigProperties({ name: 'x' }).getString('name'),
        'x'
      );
    });

    it('warns on type mismatch', function () {
      assert.strictEqual(
        declarativeConfigProperties({ name: 5 }).getString('name'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });
  });

  describe('getNumber', function () {
    it('returns the value when present and number', function () {
      assert.strictEqual(
        declarativeConfigProperties({ max: 100 }).getNumber('max'),
        100
      );
    });

    it('treats NaN as a type mismatch', function () {
      assert.strictEqual(
        declarativeConfigProperties({ max: NaN }).getNumber('max'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });

    it('warns on type mismatch', function () {
      assert.strictEqual(
        declarativeConfigProperties({ max: '100' }).getNumber('max'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });
  });

  describe('getStringArray', function () {
    it('returns the value when present and a string array', function () {
      assert.deepStrictEqual(
        declarativeConfigProperties({ keys: ['a', 'b'] }).getStringArray(
          'keys'
        ),
        ['a', 'b']
      );
    });

    it('accepts an empty array', function () {
      assert.deepStrictEqual(
        declarativeConfigProperties({ keys: [] }).getStringArray('keys'),
        []
      );
    });

    it('warns when not an array', function () {
      assert.strictEqual(
        declarativeConfigProperties({ keys: 'a' }).getStringArray('keys'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });

    it('warns when an element is not a string', function () {
      assert.strictEqual(
        declarativeConfigProperties({ keys: ['a', 2] }).getStringArray('keys'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });
  });

  describe('getStructured', function () {
    it('returns a nested accessor', function () {
      const properties = declarativeConfigProperties({
        http: { client: { request_captured_headers: ['x-req-id'] } },
      });
      const headers = properties
        .getStructured('http')
        ?.getStructured('client')
        ?.getStringArray('request_captured_headers');
      assert.deepStrictEqual(headers, ['x-req-id']);
      sinon.assert.notCalled(warn);
    });

    it('returns undefined and is silent when absent', function () {
      assert.strictEqual(
        declarativeConfigProperties({}).getStructured('http'),
        undefined
      );
      sinon.assert.notCalled(warn);
    });

    it('warns when the value is not an object', function () {
      assert.strictEqual(
        declarativeConfigProperties({ http: 'x' }).getStructured('http'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });

    it('warns when the value is an array', function () {
      assert.strictEqual(
        declarativeConfigProperties({ http: [] }).getStructured('http'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });
  });

  it('treats an explicit null value as absent (silent)', function () {
    const properties = declarativeConfigProperties({ enabled: null });
    assert.strictEqual(properties.getBoolean('enabled'), undefined);
    sinon.assert.notCalled(warn);
  });

  describe('warnUnreadKeys', function () {
    it('warns about keys no getter read', function () {
      const properties = declarativeConfigProperties({
        enabled: true,
        server_name: 'x',
        typo_key: 1,
      });
      properties.getBoolean('enabled');
      properties.getString('server_name');
      properties.warnUnreadKeys();
      sinon.assert.calledOnce(warn);
      assert.match(warn.firstCall.args[0], /unrecognized.*typo_key/);
      assert.doesNotMatch(warn.firstCall.args[0], /enabled|server_name/);
    });

    it('is silent when every key was read', function () {
      const properties = declarativeConfigProperties({ enabled: true });
      properties.getBoolean('enabled');
      properties.warnUnreadKeys();
      sinon.assert.notCalled(warn);
    });

    it('counts a key as read even when it is absent or the wrong type', function () {
      const properties = declarativeConfigProperties({ enabled: 'x' });
      // Wrong type: warns once for the mismatch and marks the key read.
      assert.strictEqual(properties.getBoolean('enabled'), undefined);
      properties.warnUnreadKeys();
      sinon.assert.calledOnce(warn);
    });

    it('is silent on an empty accessor', function () {
      declarativeConfigProperties(undefined).warnUnreadKeys();
      sinon.assert.notCalled(warn);
    });

    it('tracks reads per accessor level', function () {
      const properties = declarativeConfigProperties({
        http: { client: {}, stray: 1 },
      });
      const http = properties.getStructured('http');
      http?.getStructured('client');
      // Parent level: `http` was read, so the parent is clean.
      properties.warnUnreadKeys();
      sinon.assert.notCalled(warn);
      // Nested level: `stray` was never read.
      http?.warnUnreadKeys();
      sinon.assert.calledOnce(warn);
      assert.match(warn.firstCall.args[0], /unrecognized.*stray/);
    });
  });

  describe('readConfig', function () {
    it('returns the reader result and warns about unread keys', function () {
      const result = readConfig({ enabled: true, stray: 1 }, p => ({
        enabled: p.getBoolean('enabled'),
      }));
      assert.deepStrictEqual(result, { enabled: true });
      sinon.assert.calledOnce(warn);
      assert.match(warn.firstCall.args[0], /unrecognized.*stray/);
    });

    it('is silent when the reader touches every key', function () {
      const result = readConfig({ enabled: false }, p => ({
        enabled: p.getBoolean('enabled'),
      }));
      assert.deepStrictEqual(result, { enabled: false });
      sinon.assert.notCalled(warn);
    });

    it('is null-safe for a nullish block', function () {
      const result = readConfig(undefined, p => ({
        enabled: p.getBoolean('enabled'),
      }));
      assert.deepStrictEqual(result, { enabled: undefined });
      sinon.assert.notCalled(warn);
    });
  });
});
