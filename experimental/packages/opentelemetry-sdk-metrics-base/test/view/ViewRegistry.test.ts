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
import { InstrumentType } from '../../src/Instruments';
import { ViewRegistry } from '../../src/view/ViewRegistry';
import { View } from '../../src/view/View';
import { InstrumentSelector } from '../../src/view/InstrumentSelector';
import { MeterSelector } from '../../src/view/MeterSelector';
import { defaultInstrumentationLibrary, defaultInstrumentDescriptor } from '../util';


describe('ViewRegistry', () => {
  describe('findViews', () => {
    it('should return default view if no view registered', () => {
      const registry = new ViewRegistry();
      const views = registry.findViews(defaultInstrumentDescriptor, defaultInstrumentationLibrary);
      assert.strictEqual(views.length, 1);
      assert.strictEqual(views[0], ViewRegistry['DEFAULT_VIEW']);
    });

    describe('InstrumentSelector', () => {
      it('should match view with instrument name', () => {
        const registry = new ViewRegistry();
        registry.addView(new View({ name: 'no-filter' }));
        registry.addView(new View({ name: 'foo' }), new InstrumentSelector({
          name: 'foo',
        }));
        registry.addView(new View({ name: 'bar' }), new InstrumentSelector({
          name: 'bar'
        }));

        {
          const views = registry.findViews({
            ...defaultInstrumentDescriptor,
            name: 'foo'
          }, defaultInstrumentationLibrary);

          assert.strictEqual(views.length, 2);
          assert.strictEqual(views[0].name, 'no-filter');
          assert.strictEqual(views[1].name, 'foo');
        }

        {
          const views = registry.findViews({
            ...defaultInstrumentDescriptor,
            name: 'bar'
          }, defaultInstrumentationLibrary);

          assert.strictEqual(views.length, 2);
          assert.strictEqual(views[0].name, 'no-filter');
          assert.strictEqual(views[1].name, 'bar');
        }
      });

      it('should match view with instrument type', () => {
        const registry = new ViewRegistry();
        registry.addView(new View({ name: 'no-filter' }));
        registry.addView(new View({ name: 'counter' }), new InstrumentSelector({
          type: InstrumentType.COUNTER,
        }));
        registry.addView(new View({ name: 'histogram' }), new InstrumentSelector({
          type: InstrumentType.HISTOGRAM,
        }));

        {
          const views = registry.findViews({
            ...defaultInstrumentDescriptor,
            type: InstrumentType.COUNTER
          }, defaultInstrumentationLibrary);

          assert.strictEqual(views.length, 2);
          assert.strictEqual(views[0].name, 'no-filter');
          assert.strictEqual(views[1].name, 'counter');
        }

        {
          const views = registry.findViews({
            ...defaultInstrumentDescriptor,
            type: InstrumentType.HISTOGRAM
          }, defaultInstrumentationLibrary);

          assert.strictEqual(views.length, 2);
          assert.strictEqual(views[0].name, 'no-filter');
          assert.strictEqual(views[1].name, 'histogram');
        }
      });
    });

    describe('MeterSelector', () => {
      it('should match view with meter name', () => {
        const registry = new ViewRegistry();
        registry.addView(new View({ name: 'no-filter' }));
        registry.addView(new View({ name: 'foo' }), undefined, new MeterSelector({
          name: 'foo'
        }));
        registry.addView(new View({ name: 'bar' }), undefined, new MeterSelector({
          name: 'bar'
        }));

        {
          const views = registry.findViews(defaultInstrumentDescriptor, {
            ...defaultInstrumentationLibrary,
            name: 'foo',
          });

          assert.strictEqual(views.length, 2);
          assert.strictEqual(views[0].name, 'no-filter');
          assert.strictEqual(views[1].name, 'foo');
        }

        {
          const views = registry.findViews(defaultInstrumentDescriptor, {
            ...defaultInstrumentationLibrary,
            name: 'bar'
          });

          assert.strictEqual(views.length, 2);
          assert.strictEqual(views[0].name, 'no-filter');
          assert.strictEqual(views[1].name, 'bar');
        }
      });
    });
  });
});
