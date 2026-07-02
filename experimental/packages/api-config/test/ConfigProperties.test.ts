/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { createConfigProperties } from '../src';

describe('ConfigProperties', function () {
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
        const properties = createConfigProperties(block);
        assert.strictEqual(properties.getBoolean('any'), undefined);
        assert.strictEqual(properties.getString('any'), undefined);
        assert.strictEqual(properties.getNumber('any'), undefined);
        assert.strictEqual(properties.getStringArray('any'), undefined);
        assert.strictEqual(properties.getStructured('any'), undefined);
        assert.strictEqual(properties.getStructuredList('any'), undefined);
        assert.deepStrictEqual(properties.getPropertyKeys(), []);
        sinon.assert.notCalled(warn);
      });
    }
  });

  describe('getBoolean', function () {
    it('returns the value when present and boolean', function () {
      const properties = createConfigProperties({ enabled: false });
      assert.strictEqual(properties.getBoolean('enabled'), false);
      sinon.assert.notCalled(warn);
    });

    it('returns undefined and is silent when absent', function () {
      assert.strictEqual(
        createConfigProperties({}).getBoolean('enabled'),
        undefined
      );
      sinon.assert.notCalled(warn);
    });

    it('returns undefined and warns on type mismatch', function () {
      assert.strictEqual(
        createConfigProperties({ enabled: 'yes' }).getBoolean('enabled'),
        undefined
      );
      sinon.assert.calledOnce(warn);
      assert.ok(
        /enabled.*expected boolean.*got string/.test(warn.firstCall.args[0])
      );
    });
  });

  describe('getString', function () {
    it('returns the value when present and string', function () {
      assert.strictEqual(
        createConfigProperties({ name: 'x' }).getString('name'),
        'x'
      );
    });

    it('warns on type mismatch', function () {
      assert.strictEqual(
        createConfigProperties({ name: 5 }).getString('name'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });
  });

  describe('getNumber', function () {
    it('returns the value when present and number', function () {
      assert.strictEqual(
        createConfigProperties({ max: 100 }).getNumber('max'),
        100
      );
    });

    it('treats NaN as a type mismatch', function () {
      assert.strictEqual(
        createConfigProperties({ max: NaN }).getNumber('max'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });

    it('warns on type mismatch', function () {
      assert.strictEqual(
        createConfigProperties({ max: '100' }).getNumber('max'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });
  });

  describe('getStringArray', function () {
    it('returns the value when present and a string array', function () {
      assert.deepStrictEqual(
        createConfigProperties({ keys: ['a', 'b'] }).getStringArray('keys'),
        ['a', 'b']
      );
    });

    it('accepts an empty array', function () {
      assert.deepStrictEqual(
        createConfigProperties({ keys: [] }).getStringArray('keys'),
        []
      );
    });

    it('warns when not an array', function () {
      assert.strictEqual(
        createConfigProperties({ keys: 'a' }).getStringArray('keys'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });

    it('warns when an element is not a string', function () {
      assert.strictEqual(
        createConfigProperties({ keys: ['a', 2] }).getStringArray('keys'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });
  });

  describe('getStructured', function () {
    it('returns a nested accessor', function () {
      const properties = createConfigProperties({
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
        createConfigProperties({}).getStructured('http'),
        undefined
      );
      sinon.assert.notCalled(warn);
    });

    it('warns when the value is not an object', function () {
      assert.strictEqual(
        createConfigProperties({ http: 'x' }).getStructured('http'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });

    it('warns when the value is an array', function () {
      assert.strictEqual(
        createConfigProperties({ http: [] }).getStructured('http'),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });

    it('returns the same accessor for repeated calls', function () {
      const properties = createConfigProperties({ http: {} });
      assert.strictEqual(
        properties.getStructured('http'),
        properties.getStructured('http')
      );
    });
  });

  describe('getStructuredList', function () {
    it('returns an accessor per mapping in the sequence', function () {
      const list = createConfigProperties({
        rules: [{ name: 'a' }, { name: 'b' }],
      }).getStructuredList('rules');
      assert.strictEqual(list?.length, 2);
      assert.strictEqual(list?.[0].getString('name'), 'a');
      assert.strictEqual(list?.[1].getString('name'), 'b');
      sinon.assert.notCalled(warn);
    });

    it('accepts an empty sequence', function () {
      assert.deepStrictEqual(
        createConfigProperties({ rules: [] }).getStructuredList('rules'),
        []
      );
    });

    it('returns undefined and is silent when absent', function () {
      assert.strictEqual(
        createConfigProperties({}).getStructuredList('rules'),
        undefined
      );
      sinon.assert.notCalled(warn);
    });

    it('warns when not a sequence', function () {
      assert.strictEqual(
        createConfigProperties({ rules: { name: 'a' } }).getStructuredList(
          'rules'
        ),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });

    it('warns when an element is not a mapping', function () {
      assert.strictEqual(
        createConfigProperties({ rules: [{ name: 'a' }, 2] }).getStructuredList(
          'rules'
        ),
        undefined
      );
      sinon.assert.calledOnce(warn);
    });
  });

  describe('getPropertyKeys', function () {
    it('returns every key present, including null-valued keys', function () {
      const properties = createConfigProperties({ a: 1, b: null });
      assert.deepStrictEqual(properties.getPropertyKeys().sort(), ['a', 'b']);
    });

    it('distinguishes a key set to null from an absent key', function () {
      const properties = createConfigProperties({ enabled: null });
      // Present (so getPropertyKeys reports it) but reads as undefined.
      assert.ok(properties.getPropertyKeys().includes('enabled'));
      assert.strictEqual(properties.getBoolean('enabled'), undefined);
      assert.ok(!properties.getPropertyKeys().includes('missing'));
    });
  });

  it('treats an explicit null value as absent (silent)', function () {
    const properties = createConfigProperties({ enabled: null });
    assert.strictEqual(properties.getBoolean('enabled'), undefined);
    sinon.assert.notCalled(warn);
  });

  describe('unreadKeys', function () {
    it('returns only the keys no getter read', function () {
      const properties = createConfigProperties({
        enabled: true,
        a: 1,
        b: 2,
      });
      properties.getBoolean('enabled');
      assert.deepStrictEqual(properties.unreadKeys().sort(), ['a', 'b']);
      sinon.assert.notCalled(warn);
    });

    it('counts a key as read even when absent or the wrong type', function () {
      const properties = createConfigProperties({ enabled: 'x' });
      assert.strictEqual(properties.getBoolean('enabled'), undefined);
      assert.deepStrictEqual(properties.unreadKeys(), []);
    });

    it('reports nested unread keys with a dotted path', function () {
      const properties = createConfigProperties({
        http: { client: {}, stray: 1 },
      });
      const http = properties.getStructured('http');
      http?.getStructured('client');
      assert.deepStrictEqual(properties.unreadKeys(), ['http.stray']);
      assert.deepStrictEqual(http?.unreadKeys(), ['stray']);
    });

    it('recurses more than one level deep', function () {
      const properties = createConfigProperties({
        http: { client: { bad: 1 } },
      });
      properties.getStructured('http')?.getStructured('client');
      assert.deepStrictEqual(properties.unreadKeys(), ['http.client.bad']);
    });

    it('reports a never-read nested block as a single key', function () {
      const properties = createConfigProperties({ http: { client: {} } });
      // never descend into `http`
      assert.deepStrictEqual(properties.unreadKeys(), ['http']);
    });
  });

  describe('warnUnreadKeys', function () {
    it('warns about keys no getter read', function () {
      const properties = createConfigProperties({
        enabled: true,
        typo_key: 1,
      });
      properties.getBoolean('enabled');
      properties.warnUnreadKeys();
      sinon.assert.calledOnce(warn);
      assert.ok(/unrecognized.*typo_key/.test(warn.firstCall.args[0]));
    });

    it('is silent when every key was read', function () {
      const properties = createConfigProperties({ enabled: true });
      properties.getBoolean('enabled');
      properties.warnUnreadKeys();
      sinon.assert.notCalled(warn);
    });

    it('is silent on an empty accessor', function () {
      createConfigProperties(undefined).warnUnreadKeys();
      sinon.assert.notCalled(warn);
    });
  });
});
