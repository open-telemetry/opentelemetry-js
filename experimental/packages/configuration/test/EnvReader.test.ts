/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as Sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import { readEnvVar, readAllEnvVars } from '../src/EnvReader';
import type { BooleanEnvVar, StringEnvVar } from '../src/EnvReader';
import { SamplerType } from '../src/EnvDefinition';

describe('EnvReader', function () {
  const _origEnvVariables = { ...process.env };

  afterEach(function () {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    for (const [key, value] of Object.entries(_origEnvVariables)) {
      process.env[key] = value;
    }
    Sinon.restore();
  });

  describe('readEnvVar', function () {
    it('should return undefined when env var is not set', function () {
      const def: StringEnvVar = {
        key: 'TEST_UNSET_VAR',
        type: 'string',
        description: 'test var',
      };
      assert.strictEqual(readEnvVar(def), undefined);
    });

    it('should return the value when env var is set', function () {
      process.env.TEST_VAR = 'hello';
      const def: StringEnvVar = {
        key: 'TEST_VAR',
        type: 'string',
        description: 'test var',
      };
      assert.strictEqual(readEnvVar(def), 'hello');
    });

    it('should return defaultValue when env var is not set and defaultValue is provided', function () {
      const def: StringEnvVar = {
        key: 'TEST_MISSING_VAR',
        type: 'string',
        description: 'test var',
        defaultValue: 'fallback',
      };
      assert.strictEqual(readEnvVar(def), 'fallback');
    });

    it('should return the value when it matches allowedValues', function () {
      process.env.TEST_ALLOWED = 'b';
      const def: StringEnvVar = {
        key: 'TEST_ALLOWED',
        type: 'string',
        description: 'test var',
        allowedValues: ['a', 'b', 'c'],
      };
      assert.strictEqual(readEnvVar(def), 'b');
    });

    it('should warn and return undefined for invalid value with no defaultValue', function () {
      const warnSpy = Sinon.spy(diag, 'warn');
      process.env.TEST_INVALID = 'bad';
      const def: StringEnvVar = {
        key: 'TEST_INVALID',
        type: 'string',
        description: 'My setting',
        allowedValues: ['good', 'fine'],
      };
      const result = readEnvVar(def);
      assert.strictEqual(result, undefined);
      Sinon.assert.calledOnce(warnSpy);
      Sinon.assert.calledWith(
        warnSpy,
        'Invalid value "bad" for My setting (env: TEST_INVALID). Expected one of: good, fine. Value will be ignored.'
      );
    });

    it('should warn and return defaultValue for invalid value with defaultValue', function () {
      const warnSpy = Sinon.spy(diag, 'warn');
      process.env.TEST_INVALID_DEFAULT = 'bad';
      const def: StringEnvVar = {
        key: 'TEST_INVALID_DEFAULT',
        type: 'string',
        description: 'My setting',
        allowedValues: ['good', 'fine'],
        defaultValue: 'good',
      };
      const result = readEnvVar(def);
      assert.strictEqual(result, 'good');
      Sinon.assert.calledOnce(warnSpy);
      Sinon.assert.calledWith(
        warnSpy,
        'Invalid value "bad" for My setting (env: TEST_INVALID_DEFAULT). Expected one of: good, fine. Falling back to "good".'
      );
    });

    it('should not warn when no allowedValues is defined', function () {
      const warnSpy = Sinon.spy(diag, 'warn');
      process.env.TEST_NO_ALLOWED = 'anything';
      const def: StringEnvVar = {
        key: 'TEST_NO_ALLOWED',
        type: 'string',
        description: 'test var',
      };
      assert.strictEqual(readEnvVar(def), 'anything');
      Sinon.assert.notCalled(warnSpy);
    });

    it('should return true for boolean env var set to "true"', function () {
      process.env.TEST_BOOL_TRUE = 'true';
      const def: BooleanEnvVar = {
        key: 'TEST_BOOL_TRUE',
        type: 'boolean',
        description: 'test bool var',
        defaultValue: false,
      };
      assert.strictEqual(readEnvVar(def), true);
    });

    it('should return false for boolean env var set to "false"', function () {
      process.env.TEST_BOOL_FALSE = 'false';
      const def: BooleanEnvVar = {
        key: 'TEST_BOOL_FALSE',
        type: 'boolean',
        description: 'test bool var',
        defaultValue: true,
      };
      assert.strictEqual(readEnvVar(def), false);
    });

    it('should return defaultValue for boolean env var when not set', function () {
      const def: BooleanEnvVar = {
        key: 'TEST_BOOL_UNSET',
        type: 'boolean',
        description: 'test bool var',
        defaultValue: false,
      };
      assert.strictEqual(readEnvVar(def), false);
    });
  });

  describe('readAllEnvVars', function () {
    it('should read OTEL_TRACES_SAMPLER when set to a valid value', function () {
      process.env.OTEL_TRACES_SAMPLER = 'always_off';
      const env = readAllEnvVars();
      assert.strictEqual(env.OTEL_TRACES_SAMPLER, SamplerType.AlwaysOff);
    });

    it('should read OTEL_SDK_DISABLED as true when set to "true"', function () {
      process.env.OTEL_SDK_DISABLED = 'true';
      const env = readAllEnvVars();
      assert.strictEqual(env.OTEL_SDK_DISABLED, true);
    });

    it('should read OTEL_SDK_DISABLED as false when set to "false"', function () {
      process.env.OTEL_SDK_DISABLED = 'false';
      const env = readAllEnvVars();
      assert.strictEqual(env.OTEL_SDK_DISABLED, false);
    });

    it('should read OTEL_SDK_DISABLED as false when not set', function () {
      delete process.env.OTEL_SDK_DISABLED;
      const env = readAllEnvVars();
      assert.strictEqual(env.OTEL_SDK_DISABLED, false);
    });
  });
});
