/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as yaml from 'yaml';
import { substituteEnvVars } from '../src/utils';

describe('substituteEnvVars', function () {
  const envCache = { ...process.env };
  function setEnv(env: Record<string, string>) {
    for (const [k, v] of Object.entries(env)) {
      process.env[k] = v;
    }
  }
  function restoreEnv(env: Record<string, string>) {
    for (const k of Object.keys(env)) {
      if (k in envCache) {
        process.env[k] = envCache[k];
      } else {
        delete process.env[k];
      }
    }
  }

  // See examples at https://opentelemetry.io/docs/specs/otel/configuration/data-model/#environment-variable-substitution
  const specExampleEnv: Record<string, string> = {
    STRING_VALUE: 'value',
    BOOL_VALUE: 'true',
    INT_VALUE: '1',
    FLOAT_VALUE: '1.1',
    HEX_VALUE: '0xdeadbeef', // A valid integer value (i.e. 3735928559) written in hexadecimal
    INVALID_MAP_VALUE: 'value\nkey:value', // An invalid attempt to inject a map key into the YAML
    DO_NOT_REPLACE_ME: 'Never use this value', // An unused environment variable
    REPLACE_ME: '${DO_NOT_REPLACE_ME}', // A valid replacement text, used verbatim, not replaced with "Never use this value"
    VALUE_WITH_ESCAPE: 'value$$', // A valid variable substituted without escaping
  };

  const corpus: {
    env: Record<string, string>;
    inputYaml: string;
    outputObj?: unknown;
    errMessage?: string;
    only?: boolean;
  }[] = [
    // Basic sanity test.
    {
      env: { FOO: 'bar' },
      inputYaml: 'foo: ${FOO}',
      outputObj: { foo: 'bar' },
    },

    // Edge cases.
    {
      // Ensure "TRUE" (with caps) is interpreted as a boolean.
      env: { FOO: 'TRUE' },
      inputYaml: 'foo: ${FOO}',
      outputObj: { foo: true },
    },
    {
      // Ensure that YAML sequence in envvar is *not* parsed into a sequence.
      env: { FOO: '[a,b,c]' },
      inputYaml: 'foo: ${FOO}',
      outputObj: { foo: '[a,b,c]' },
    },
    {
      // Ensure that YAML mapping in envvar is *not* parsed into a mapping.
      env: { FOO: '{a:1,  b:2, c:3}' },
      inputYaml: 'foo: ${FOO}',
      outputObj: { foo: '{a:1,  b:2, c:3}' },
    },
    {
      // Ensure that YAML mapping in envvar is *not* parsed into a mapping.
      // Ensure values in YAML sequences are processed.
      env: { BOOL: 'true', NUM: '42' },
      inputYaml: '- ${BOOL}\n- ${NUM}',
      outputObj: [true, 42],
    },

    // Cases from https://opentelemetry.io/docs/specs/otel/configuration/data-model/#environment-variable-substitution
    // key: ${STRING_VALUE}	key: value	tag:yaml.org,2002:str	YAML parser resolves to string
    {
      env: specExampleEnv,
      inputYaml: 'key: ${STRING_VALUE}',
      outputObj: { key: 'value' },
    },
    // key: ${BOOL_VALUE}	key: true	tag:yaml.org,2002:bool	YAML parser resolves to true
    {
      env: specExampleEnv,
      inputYaml: 'key: ${BOOL_VALUE}',
      outputObj: { key: true },
    },
    // key: ${INT_VALUE}	key: 1	tag:yaml.org,2002:int	YAML parser resolves to int
    {
      env: specExampleEnv,
      inputYaml: 'key: ${INT_VALUE}',
      outputObj: { key: 1 },
    },
    // key: ${FLOAT_VALUE}	key: 1.1	tag:yaml.org,2002:float	YAML parser resolves to float
    {
      env: specExampleEnv,
      inputYaml: 'key: ${FLOAT_VALUE}',
      outputObj: { key: 1.1 },
    },
    // key: ${HEX_VALUE}	key: 0xdeadbeef	tag:yaml.org,2002:int	YAML parser resolves to int 3735928559
    {
      env: specExampleEnv,
      inputYaml: 'key: ${HEX_VALUE}',
      outputObj: { key: 3735928559 },
    },
    // key: "${STRING_VALUE}"	key: "value"	tag:yaml.org,2002:str	Double quoted to force coercion to string "value"
    {
      env: specExampleEnv,
      inputYaml: 'key: "${STRING_VALUE}"',
      outputObj: { key: 'value' },
    },
    // key: "${BOOL_VALUE}"	key: "true"	tag:yaml.org,2002:str	Double quoted to force coercion to string "true"
    {
      env: specExampleEnv,
      inputYaml: 'key: "${BOOL_VALUE}"',
      outputObj: { key: 'true' },
    },
    // // key: "${INT_VALUE}"	key: "1"	tag:yaml.org,2002:str	Double quoted to force coercion to string "1"
    // {
    //   env: specExampleEnv,
    //   inputYaml: 'key: "${INT_VALUE}"',
    //   outputObj: { key: '1' },
    // },
    // // key: "${FLOAT_VALUE}"	key: "1.1"	tag:yaml.org,2002:str	Double quoted to force coercion to string "1.1"
    // {
    //   env: specExampleEnv,
    //   inputYaml: 'key: "${FLOAT_VALUE}"',
    //   outputObj: { key: '1.1' },
    // },
    // // key: "${HEX_VALUE}"	key: "0xdeadbeef"	tag:yaml.org,2002:str	Double quoted to force coercion to string "0xdeadbeef"
    // {
    //   env: specExampleEnv,
    //   inputYaml: 'key: "${HEX_VALUE}"',
    //   outputObj: { key: '0xdeadbeef' },
    // },
    // key: ${env:STRING_VALUE}	key: value	tag:yaml.org,2002:str	Alternative env: syntax
    {
      env: specExampleEnv,
      inputYaml: 'key: "${env:STRING_VALUE}"',
      outputObj: { key: 'value' },
    },
    // key: ${INVALID_MAP_VALUE}	key: value\nkey:value	tag:yaml.org,2002:str	Map structure resolves to string and not expanded
    {
      env: specExampleEnv,
      inputYaml: 'key: "${INVALID_MAP_VALUE}"',
      outputObj: { key: 'value\nkey:value' },
    },
    // key: foo ${STRING_VALUE} ${FLOAT_VALUE}	key: foo value 1.1	tag:yaml.org,2002:str	Multiple references are injected and resolved to string
    {
      env: specExampleEnv,
      inputYaml: 'key: foo ${STRING_VALUE} ${FLOAT_VALUE}',
      outputObj: { key: 'foo value 1.1' },
    },
    // key: ${UNDEFINED_KEY}	key:	tag:yaml.org,2002:null	Undefined env var is replaced with "" and resolves to null
    {
      env: specExampleEnv,
      inputYaml: 'key: ${UNDEFINED_KEY}',
      outputObj: { key: null },
    },
    // key: ${UNDEFINED_KEY:-fallback}	key: fallback	tag:yaml.org,2002:str	Undefined env var results in substitution of default value fallback
    {
      env: specExampleEnv,
      inputYaml: 'key: ${UNDEFINED_KEY:-fallback}',
      outputObj: { key: 'fallback' },
    },
    // ${STRING_VALUE}: value	key: ${STRING_VALUE}: value	tag:yaml.org,2002:str	Usage of substitution syntax in keys is ignored
    {
      env: specExampleEnv,
      inputYaml: '${STRING_VALUE}: value',
      outputObj: { '${STRING_VALUE}': 'value' },
    },
    // key: ${REPLACE_ME}	key: ${DO_NOT_REPLACE_ME}	tag:yaml.org,2002:str	Value of env var REPLACE_ME is ${DO_NOT_REPLACE_ME}, and is not substituted recursively
    {
      env: specExampleEnv,
      inputYaml: 'key: ${REPLACE_ME}',
      outputObj: { key: '${DO_NOT_REPLACE_ME}' },
    },
    // key: ${UNDEFINED_KEY:-${STRING_VALUE}}	key: ${STRING_VALUE}	tag:yaml.org,2002:str	Undefined env var results in substitution of default value ${STRING_VALUE}, and is not substituted recursively
    {
      env: specExampleEnv,
      inputYaml: 'key: ${UNDEFINED_KEY:-${STRING_VALUE}}',
      outputObj: { key: '${STRING_VALUE}' },
    },
    // key: ${STRING_VALUE:?error}	n/a	n/a	Invalid substitution reference produces parse error
    {
      env: specExampleEnv,
      inputYaml: 'key: ${STRING_VALUE:?error}',
      errMessage:
        'parse error: invalid env var substitution: ${STRING_VALUE:?error}',
    },
    // key: $${STRING_VALUE}	key: ${STRING_VALUE}	tag:yaml.org,2002:str	$$ escape sequence is replaced with $, {STRING_VALUE} does not match substitution syntax
    {
      env: specExampleEnv,
      inputYaml: 'key: $${STRING_VALUE}',
      outputObj: { key: '${STRING_VALUE}' },
    },
    // key: $$${STRING_VALUE}	key: $value	tag:yaml.org,2002:str	$$ escape sequence is replaced with $, ${STRING_VALUE} is replaced with value
    {
      env: specExampleEnv,
      inputYaml: 'key: $$${STRING_VALUE}',
      outputObj: { key: '$value' },
    },
    // key: $$$${STRING_VALUE}	key: $${STRING_VALUE}	tag:yaml.org,2002:str	$$ escape sequence is replaced with $, $$ escape sequence is replaced with $, {STRING_VALUE} does not match substitution syntax
    {
      env: specExampleEnv,
      inputYaml: 'key: $$$${STRING_VALUE}',
      outputObj: { key: '$${STRING_VALUE}' },
    },
    // key: $${STRING_VALUE:-fallback}	key: ${STRING_VALUE:-fallback}	tag:yaml.org,2002:str	$$ escape sequence is replaced with $, {STRING_VALUE:-fallback} does not match substitution syntax
    {
      env: specExampleEnv,
      inputYaml: 'key: $${STRING_VALUE:-fallback}',
      outputObj: { key: '${STRING_VALUE:-fallback}' },
    },
    // key: $${STRING_VALUE:-${STRING_VALUE}}	key: ${STRING_VALUE:-value}	tag:yaml.org,2002:str	$$ escape sequence is replaced with $, leaving {STRING_VALUE:-${STRING_VALUE}}, ${STRING_VALUE} is replaced with value
    {
      env: specExampleEnv,
      inputYaml: 'key: $${STRING_VALUE:-${STRING_VALUE}}',
      outputObj: { key: '${STRING_VALUE:-value}' },
    },
    // key: ${UNDEFINED_KEY:-$${UNDEFINED_KEY}}	key: ${UNDEFINED_KEY:-${UNDEFINED_KEY}}	tag:yaml.org,2002:str	$$ escape sequence is replaced with $, leaving ${UNDEFINED_KEY:- before and {UNDEFINED_KEY}} after which do not match substitution syntax
    {
      env: specExampleEnv,
      inputYaml: 'key: ${UNDEFINED_KEY:-$${UNDEFINED_KEY}}',
      outputObj: { key: '${UNDEFINED_KEY:-${UNDEFINED_KEY}}' },
    },
    // key: ${VALUE_WITH_ESCAPE}	key: value$$	tag:yaml.org,2002:str	Value of env var VALUE_WITH_ESCAPE is value$$, which is substituted without escaping
    {
      env: specExampleEnv,
      inputYaml: 'key: ${VALUE_WITH_ESCAPE}',
      outputObj: { key: 'value$$' },
    },
    // key: a $$ b	key: a $ b	tag:yaml.org,2002:str	$$ escape sequence is replaced with $
    {
      env: specExampleEnv,
      inputYaml: 'key: a $$ b',
      outputObj: { key: 'a $ b' },
    },
    // key: a $ b	key: a $ b	tag:yaml.org,2002:str	No escape sequence, no substitution references, value is left unchanged
    {
      env: specExampleEnv,
      inputYaml: 'key: a $ b',
      outputObj: { key: 'a $ b' },
    },
  ];

  for (const item of corpus) {
    const testName = item.inputYaml.replace(/\n/g, '\\n');
    (item.only ? it.only : it)(testName, function () {
      let outputObj, err;
      setEnv(item.env);
      try {
        const doc = yaml.parseDocument(item.inputYaml, { version: '1.2' });
        substituteEnvVars(doc);
        outputObj = doc.toJS();
      } catch (err_) {
        err = err_;
      } finally {
        restoreEnv(item.env);
      }
      if ('outputObj' in item) {
        assert.deepStrictEqual(outputObj, item.outputObj);
      } else if ('errMessage' in item) {
        assert.strictEqual(item.errMessage, err.message);
      }
    });
  }
});
