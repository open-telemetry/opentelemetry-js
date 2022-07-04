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
import { AttributesProcessor } from '../../src/view/AttributesProcessor';
import { UserView } from '../../src/view/UserView';
import { InstrumentType, Aggregation} from '../../src';

describe('View', () => {
  describe('constructor', () => {
    it('should construct view without arguments', () => {
      const view = new UserView({});
      assert.strictEqual(view.name, undefined);
      assert.strictEqual(view.description, undefined);
      assert.strictEqual(view.aggregation, Aggregation.Default());
      assert.strictEqual(view.attributesProcessor, AttributesProcessor.Noop());
    });

    it('with named view and no instrument selector should throw', () => {
      assert.throws(() => new UserView({
        name: 'named-view'
      }));
    });

    it('with named view and instrument wildcard should throw', () => {
      // Throws with wildcard character only.
      assert.throws(() => new UserView({ name: 'renamed-instrument' },
        {
          instrument: {
            name: '*'
          }
        }
      ));

      // Throws with wildcard character in instrument name.
      assert.throws(() => new UserView({ name: 'renamed-instrument' },
        {
          instrument: {
            name: 'instrument.name.*'
          }
        }
      ));
    });

    it('with named view and instrument type selector should throw', () => {
      assert.throws(() => new UserView({ name: 'renamed-instrument' },
        {
          instrument: {
            type: InstrumentType.COUNTER
          }
        }
      ));
    });
  });
});
