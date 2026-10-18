/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  cleanAttributes,
  isAnyValue,
  isSimpleAttributeValue,
} from '../../src/common/attributes';

const NO_ATTR_LIMITS = {
  attributeCountLimit: Infinity,
  attributeValueLengthLimit: Infinity,
};

describe('Buffer attributes', () => {
  const buf = Buffer.from('hello');

  assert.equal(isAnyValue(buf), true);

  assert.equal(isSimpleAttributeValue(buf), false);

  const cleaned = cleanAttributes({ buf }, NO_ATTR_LIMITS);
  assert.deepStrictEqual(cleaned.attributes, { buf });
  assert.equal(cleaned.droppedAttributesCount, 0);

  const cleaned2 = cleanAttributes(
    {
      buf: Buffer.from('hello'), // truncate
      recursive: [
        {
          buf: Buffer.from('hello'), // truncate
        },
      ],
    },
    {
      attributeCountLimit: Infinity,
      attributeValueLengthLimit: 3,
    }
  );

  assert.deepEqual(cleaned2.attributes, {
    buf: Buffer.from('hel'),
    recursive: [
      {
        buf: Buffer.from('hel'),
      },
    ],
  });
  assert.equal(cleaned2.droppedAttributesCount, 0);
});
