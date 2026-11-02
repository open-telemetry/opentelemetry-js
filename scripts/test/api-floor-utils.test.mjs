/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Tests for the `@opentelemetry/api` peer range lower-bound lint.
 *
 * Run with `npm run test:scripts`.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  API_VALUE_EXPORTS_BY_VERSION,
  apiVersionIntroducing,
  collectRuntimeImports,
  findApiFloorViolations,
  listValueExports,
  lowestReleaseAdmitted,
  workspacePackageFor,
} from '../lib/api-floor-utils.mjs';

const TOP = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');

const imports = sourceText => {
  const { apiValues, apiEntryPoints, specifiers } = collectRuntimeImports(
    'x.ts',
    sourceText
  );
  return {
    apiValues: [...apiValues].sort(),
    apiEntryPoints: [...apiEntryPoints].sort(),
    specifiers: [...specifiers].sort(),
  };
};

describe('collectRuntimeImports: other ways of reaching the API', function () {
  it('records values read through a default import', function () {
    assert.deepStrictEqual(
      imports(`import api from '@opentelemetry/api'; api.logs.getLogger('x');`)
        .apiValues,
      ['default', 'logs']
    );
  });

  it('records values read through import-equals and require', function () {
    assert.deepStrictEqual(
      imports(`
        import api = require('@opentelemetry/api');
        const severity = api.SeverityNumber.INFO;
        const otel = require('@opentelemetry/api');
        otel['createNoopLogger']();
      `).apiValues,
      ['SeverityNumber', 'createNoopLogger']
    );
  });

  it('records destructured values', function () {
    assert.deepStrictEqual(
      imports(`
        const { logs, SeverityNumber: Severity } = require('@opentelemetry/api');
        import * as api from '@opentelemetry/api';
        const { metrics } = api;
      `).apiValues,
      ['SeverityNumber', 'logs', 'metrics']
    );
  });

  it('does not treat a star re-export of the API as needing every value', function () {
    assert.deepStrictEqual(
      imports(`export * from '@opentelemetry/api';`).apiValues,
      []
    );
  });

  it('records API entry points other than the root', function () {
    assert.deepStrictEqual(
      imports(`import { wrapTracer } from '@opentelemetry/api/experimental';`)
        .apiEntryPoints,
      ['@opentelemetry/api/experimental']
    );
  });

  it('records import-equals and template-literal requires of other packages', function () {
    assert.deepStrictEqual(
      imports(`
        import foo = require('@opentelemetry/foo');
        const bar = require(\`@opentelemetry/bar\`);
      `).specifiers,
      ['@opentelemetry/bar', '@opentelemetry/foo']
    );
  });
});

describe('lowestReleaseAdmitted', function () {
  it('ignores the pre-release clause added while the API is a pre-release', function () {
    assert.strictEqual(
      lowestReleaseAdmitted('^1.10.0 || 1.10.0-rc.0'),
      '1.10.0'
    );
    assert.strictEqual(
      lowestReleaseAdmitted('>=1.10.0 <1.11.0 || 1.10.0-rc.1'),
      '1.10.0'
    );
    assert.strictEqual(lowestReleaseAdmitted('^1.3.0 || 1.10.0-rc.0'), '1.3.0');
  });

  it('returns the lower bound of ordinary ranges', function () {
    assert.strictEqual(lowestReleaseAdmitted('^1.3.0'), '1.3.0');
    assert.strictEqual(lowestReleaseAdmitted('>=1.0.0 <1.10.0'), '1.0.0');
  });
});

describe('collectRuntimeImports', function () {
  it('records named value imports from the API', function () {
    assert.deepStrictEqual(
      imports(`import { logs, trace } from '@opentelemetry/api';`).apiValues,
      ['logs', 'trace']
    );
  });

  it('ignores type-only imports and type-only specifiers', function () {
    assert.deepStrictEqual(
      imports(`
        import type { SeverityNumber } from '@opentelemetry/api';
        import { type LogRecord, trace } from '@opentelemetry/api';
      `).apiValues,
      ['trace']
    );
  });

  it('reads multi-line and aliased imports', function () {
    assert.deepStrictEqual(
      imports(`
        import {
          SeverityNumber as Severity,
          context,
        } from '@opentelemetry/api';
      `).apiValues,
      ['SeverityNumber', 'context']
    );
  });

  it('records values used through a namespace import', function () {
    assert.deepStrictEqual(
      imports(`
        import * as api from '@opentelemetry/api';
        api.logs.getLogger('x');
        const kind = api.SpanKind.CLIENT;
      `).apiValues,
      ['SpanKind', 'logs']
    );
  });

  it('records value re-exports and ignores type re-exports', function () {
    assert.deepStrictEqual(
      imports(`
        export { SeverityNumber } from '@opentelemetry/api';
        export type { Logger } from '@opentelemetry/api';
      `).apiValues,
      ['SeverityNumber']
    );
  });

  it('records runtime imports of other packages, not type-only ones', function () {
    assert.deepStrictEqual(
      imports(`
        import { a } from '@opentelemetry/foo';
        import type { B } from '@opentelemetry/bar';
        import { type C } from '@opentelemetry/baz';
        import '@opentelemetry/side-effect';
        export * from '@opentelemetry/reexported';
        const lazy = () => import('@opentelemetry/lazy');
        const cjs = require('@opentelemetry/cjs');
      `).specifiers,
      [
        '@opentelemetry/cjs',
        '@opentelemetry/foo',
        '@opentelemetry/lazy',
        '@opentelemetry/reexported',
        '@opentelemetry/side-effect',
      ]
    );
  });
});

describe('workspacePackageFor', function () {
  const names = new Set(['@opentelemetry/core', 'semver']);

  it('maps package names and subpaths to the package', function () {
    assert.strictEqual(
      workspacePackageFor('@opentelemetry/core', names),
      '@opentelemetry/core'
    );
    assert.strictEqual(
      workspacePackageFor('@opentelemetry/core/platform', names),
      '@opentelemetry/core'
    );
    assert.strictEqual(
      workspacePackageFor('semver/functions/gt', names),
      'semver'
    );
  });

  it('returns undefined for packages outside the workspace', function () {
    assert.strictEqual(
      workspacePackageFor('@opentelemetry/other', names),
      undefined
    );
    assert.strictEqual(workspacePackageFor('./local', names), undefined);
  });
});

describe('findApiFloorViolations', function () {
  const file = sourceText => [{ fileName: 'src/index.ts', sourceText }];
  const transformer = {
    name: '@opentelemetry/transformer',
    apiPeerRange: '>=1.10.0 <1.11.0',
    files: file(`import { SeverityNumber } from '@opentelemetry/api';`),
  };

  it('flags a package whose runtime dependency needs a newer API', function () {
    const violations = findApiFloorViolations([
      transformer,
      {
        name: '@opentelemetry/exporter',
        apiPeerRange: '^1.3.0',
        files: file(
          `import { createSerializer } from '@opentelemetry/transformer';`
        ),
      },
    ]);
    assert.deepStrictEqual(violations, [
      {
        name: '@opentelemetry/exporter',
        apiPeerRange: '^1.3.0',
        lowestAllowed: '1.3.0',
        required: '1.10.0',
        value: 'SeverityNumber',
        chain: ['@opentelemetry/exporter', '@opentelemetry/transformer'],
        fileName: 'src/index.ts',
      },
    ]);
  });

  it('follows runtime imports through several packages', function () {
    const violations = findApiFloorViolations([
      transformer,
      {
        name: '@opentelemetry/exporter-base',
        apiPeerRange: '>=1.10.0 <1.11.0',
        files: file(`export * from '@opentelemetry/transformer';`),
      },
      {
        name: '@opentelemetry/exporter',
        apiPeerRange: '^1.0.0',
        files: file(`import { a } from '@opentelemetry/exporter-base';`),
      },
    ]);
    assert.deepStrictEqual(
      violations.map(v => [v.name, v.chain.length]),
      [['@opentelemetry/exporter', 3]]
    );
  });

  it('does not follow type-only imports', function () {
    const violations = findApiFloorViolations([
      transformer,
      {
        name: '@opentelemetry/exporter-base',
        apiPeerRange: '^1.3.0',
        files: file(`
          import type { ISerializer } from '@opentelemetry/transformer';
          import { type IHelper } from '@opentelemetry/transformer';
        `),
      },
    ]);
    assert.deepStrictEqual(violations, []);
  });

  it('accepts a range whose lower bound exports everything needed', function () {
    for (const apiPeerRange of [
      '^1.10.0',
      '>=1.10.0 <1.11.0',
      '^1.10.0 || 1.11.0-rc.0',
      // While API 1.10.0 itself is a pre-release, align-api-deps adds its exact
      // version as an alternative, and peer-api-check requires it.
      '^1.10.0 || 1.10.0-rc.0',
      '>=1.10.0 <1.11.0 || 1.10.0-rc.1',
    ]) {
      const violations = findApiFloorViolations([
        transformer,
        {
          name: '@opentelemetry/exporter',
          apiPeerRange,
          files: file(`import { a } from '@opentelemetry/transformer';`),
        },
      ]);
      assert.deepStrictEqual(violations, [], apiPeerRange);
    }
  });

  it('reports the newest value needed when several are used', function () {
    const [violation] = findApiFloorViolations([
      {
        name: '@opentelemetry/pkg',
        apiPeerRange: '^1.0.0',
        files: file(
          `import { createTraceState, metrics, logs } from '@opentelemetry/api';`
        ),
      },
    ]);
    assert.strictEqual(violation.required, '1.10.0');
    assert.strictEqual(violation.value, 'logs');
  });

  it('requires the version that added an API entry point', function () {
    const [violation] = findApiFloorViolations([
      {
        name: '@opentelemetry/pkg',
        apiPeerRange: '^1.3.0',
        files: file(
          `import { wrapTracer } from '@opentelemetry/api/experimental';`
        ),
      },
    ]);
    assert.strictEqual(violation.required, '1.8.0');
    assert.strictEqual(violation.value, '@opentelemetry/api/experimental');
  });

  it('does not check packages without an API peer dependency', function () {
    const violations = findApiFloorViolations([
      transformer,
      {
        name: '@opentelemetry/example',
        files: file(`import { a } from '@opentelemetry/transformer';`),
      },
    ]);
    assert.deepStrictEqual(violations, []);
  });

  it('terminates on import cycles', function () {
    const violations = findApiFloorViolations([
      {
        name: '@opentelemetry/a',
        apiPeerRange: '^1.3.0',
        files: file(
          `import { b } from '@opentelemetry/b'; import { logs } from '@opentelemetry/api';`
        ),
      },
      {
        name: '@opentelemetry/b',
        apiPeerRange: '^1.10.0',
        files: file(`import { a } from '@opentelemetry/a';`),
      },
    ]);
    assert.deepStrictEqual(
      violations.map(v => v.name),
      ['@opentelemetry/a']
    );
  });
});

describe('listValueExports', function () {
  it('skips types and const enums', function () {
    assert.deepStrictEqual(
      [
        ...listValueExports(
          'x.ts',
          `
        export { a, type B } from './a';
        export type { C } from './c';
        export const d = 1;
        export enum E { X }
        export const enum F { Y }
        export interface G {}
        export default {};
      `
        ),
      ].sort(),
      ['E', 'a', 'd', 'default']
    );
  });

  it('throws on export forms it cannot list', function () {
    assert.throws(
      () => listValueExports('x.ts', `export * from './a';`),
      /cannot list/
    );
    assert.throws(
      () => listValueExports('x.ts', `export * as ns from './a';`),
      /cannot list/
    );
  });
});

describe('API_VALUE_EXPORTS_BY_VERSION', function () {
  it('lists every value export of api/src/index.ts', function () {
    const apiIndex = path.join(TOP, 'api/src/index.ts');
    const exported = listValueExports(
      apiIndex,
      fs.readFileSync(apiIndex, 'utf8')
    );
    const missing = [...exported].filter(name => !apiVersionIntroducing(name));
    assert.deepStrictEqual(
      missing,
      [],
      'Add new @opentelemetry/api value exports to API_VALUE_EXPORTS_BY_VERSION ' +
        'in scripts/lib/api-floor-utils.mjs, under the version that adds them.'
    );
  });

  it('only lists values that api/src/index.ts exports', function () {
    const apiIndex = path.join(TOP, 'api/src/index.ts');
    const exported = listValueExports(
      apiIndex,
      fs.readFileSync(apiIndex, 'utf8')
    );
    const listed = Object.values(API_VALUE_EXPORTS_BY_VERSION).flat();
    assert.deepStrictEqual(
      listed.filter(name => !exported.has(name)),
      []
    );
  });
});
