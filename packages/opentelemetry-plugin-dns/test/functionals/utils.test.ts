/*!
 * Copyright 2019, OpenTelemetry Authors
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
import { CanonicalCode, SpanKind } from '@opentelemetry/types';
import * as utils from '../../src/utils';
import { Span, BasicTracer } from '@opentelemetry/tracing';
import { AttributeNames } from '../../src/enums/AttributeNames';

describe('Utility', () => {
  describe('parseResponseStatus()', () => {
    it('should return UNKNOWN code by default', () => {
      [(undefined as unknown) as string, '', 'DSHKJSAD'].forEach(code => {
        const status = utils.parseErrorCode(code);
        assert.deepStrictEqual(status, { code: CanonicalCode.UNKNOWN });
      });
    });
  });

  describe('setError()', () => {
    it('should have error attributes', () => {
      const errorMessage = 'test error';
      const span = new Span(
        new BasicTracer(),
        'test',
        { spanId: '', traceId: '' },
        SpanKind.INTERNAL
      );
      utils.setError(new Error(errorMessage), span, process.versions.node);
      const attributes = span.toReadableSpan().attributes;
      assert.strictEqual(
        attributes[AttributeNames.DNS_ERROR_MESSAGE],
        errorMessage
      );
      assert.ok(attributes[AttributeNames.DNS_ERROR_NAME]);
    });
  });
});
