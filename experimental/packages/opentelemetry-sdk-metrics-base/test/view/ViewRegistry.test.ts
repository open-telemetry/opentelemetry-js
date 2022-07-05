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
import { InstrumentType } from '../../src';
import { ViewRegistry } from '../../src/view/ViewRegistry';
import { defaultInstrumentationScope, defaultInstrumentDescriptor } from '../util';
import { View } from '../../src';


describe('ViewRegistry', () => {
  describe('findViews', () => {
    it('should return default view if no view registered', () => {
      const registry = new ViewRegistry();
      const views = registry.findViews(defaultInstrumentDescriptor, defaultInstrumentationScope);
      assert.strictEqual(views.length, 1);
      assert.strictEqual(views[0], ViewRegistry['DEFAULT_VIEW']);
    });

    describe('InstrumentSelector', () => {
      it('should match view with instrument name', () => {
        const registry = new ViewRegistry();
        registry.addView(new View({ name: 'foo', instrumentName: 'foo' }));
        registry.addView(new View({ name: 'bar', instrumentName: 'bar' }));

        {
          const views = registry.findViews({
            ...defaultInstrumentDescriptor,
            name: 'foo'
          }, defaultInstrumentationScope);

          assert.strictEqual(views.length, 1);
          assert.strictEqual(views[0].name, 'foo');
        }

        {
          const views = registry.findViews({
            ...defaultInstrumentDescriptor,
            name: 'bar'
          }, defaultInstrumentationScope);

          assert.strictEqual(views.length, 1);
          assert.strictEqual(views[0].name, 'bar');
        }
      });

      it('should match view with instrument type', () => {
        const registry = new ViewRegistry();
        registry.addView(new View({
          name: 'counter',
          instrumentName: 'default_metric',
          instrumentType: InstrumentType.COUNTER
        }));
        registry.addView(new View({
          name: 'histogram',
          instrumentName: 'default_metric',
          instrumentType: InstrumentType.HISTOGRAM
        }));

        {
          const views = registry.findViews({
            ...defaultInstrumentDescriptor,
            type: InstrumentType.COUNTER
          }, defaultInstrumentationScope);

          assert.strictEqual(views.length, 1);
          assert.strictEqual(views[0].name, 'counter');
        }

        {
          const views = registry.findViews({
            ...defaultInstrumentDescriptor,
            type: InstrumentType.HISTOGRAM
          }, defaultInstrumentationScope);

          assert.strictEqual(views.length, 1);
          assert.strictEqual(views[0].name, 'histogram');
        }
      });
    });

    describe('MeterSelector', () => {
      it('should match view with meter name', () => {
        const registry = new ViewRegistry();
        registry.addView(new View({ name: 'foo', instrumentName: 'default_metric', meterName: 'foo' }));
        registry.addView(new View({ name: 'bar', instrumentName: 'default_metric', meterName: 'bar' }));

        {
          const views = registry.findViews(defaultInstrumentDescriptor, {
            ...defaultInstrumentationScope,
            name: 'foo',
          });

          assert.strictEqual(views.length, 1);
          assert.strictEqual(views[0].name, 'foo');
        }

        {
          const views = registry.findViews(defaultInstrumentDescriptor, {
            ...defaultInstrumentationScope,
            name: 'bar'
          });

          assert.strictEqual(views.length, 1);
          assert.strictEqual(views[0].name, 'bar');
        }
      });
    });
  });
});
