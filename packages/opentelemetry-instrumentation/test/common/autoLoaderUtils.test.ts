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
import { InstrumentationBase } from '../../src';
import { parseInstrumentationOptions } from '../../src/autoLoaderUtils';
import { InstrumentationOption } from '../../src/types_internal';
import { OldClassPlugin } from '../../src/types_plugin_only';

class FooInstrumentation extends InstrumentationBase {
  constructor() {
    super('foo', '1', {});
  }

  init() {
    return [];
  }

  enable() {}

  disable() {}
}

class FooWebPlugin implements OldClassPlugin {
  moduleName = 'foo';

  enable() {}

  disable() {}
}

// const fooInstrumentation = new FooInstrumentation();

describe('autoLoaderUtils', () => {
  describe('parseInstrumentationOptions', () => {
    it('should create a new instrumentation from class', () => {
      const { instrumentations } = parseInstrumentationOptions([
        FooInstrumentation,
      ]);
      assert.strictEqual(instrumentations.length, 1);
      const instrumentation = instrumentations[0];
      assert.ok(instrumentation instanceof InstrumentationBase);
    });

    it('should return an instrumentation from Instrumentation', () => {
      const { instrumentations } = parseInstrumentationOptions([
        new FooInstrumentation(),
      ]);
      assert.strictEqual(instrumentations.length, 1);
      const instrumentation = instrumentations[0];
      assert.ok(instrumentation instanceof InstrumentationBase);
    });

    it('should return node old plugin', () => {
      const { pluginsNode } = parseInstrumentationOptions([
        {
          plugins: {
            http: { enabled: false },
          },
        },
      ]);
      assert.strictEqual(Object.keys(pluginsNode).length, 1);
    });

    it('should return web old plugin', () => {
      const { pluginsWeb } = parseInstrumentationOptions([new FooWebPlugin()]);
      assert.strictEqual(pluginsWeb.length, 1);
    });

    it('should handle mix of plugins and instrumentations', () => {
      const nodePlugins = {
        plugins: {
          http: { enabled: false },
          https: { enabled: false },
        },
      };
      const options: InstrumentationOption[] = [];

      options.push(new FooWebPlugin());
      options.push(nodePlugins);
      options.push([new FooInstrumentation(), new FooInstrumentation()]);
      options.push([new FooWebPlugin(), new FooWebPlugin()]);

      const {
        pluginsWeb,
        pluginsNode,
        instrumentations,
      } = parseInstrumentationOptions(options);

      assert.strictEqual(pluginsWeb.length, 3);
      assert.strictEqual(Object.keys(pluginsNode).length, 2);
      assert.strictEqual(instrumentations.length, 2);
    });
  });
});
