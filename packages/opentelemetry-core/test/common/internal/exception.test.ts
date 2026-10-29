/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { _buildExceptionStacktrace } from '../../../src/internal/exception';

/**
 * Creates an error with a deterministic, V8-style stack.
 */
function makeError(
  message: string,
  options: { name?: string; cause?: unknown; frames?: string[] } = {}
): Error {
  const error = new Error(message, { cause: options.cause });
  if (options.cause === undefined) {
    delete (error as { cause?: unknown }).cause;
  }
  error.name = options.name ?? 'Error';
  const frames = options.frames ?? [`at ${message.replace(/\s/g, '_')}:1:1`];
  error.stack = [
    `${error.name}: ${message}`,
    ...frames.map(f => `    ${f}`),
  ].join('\n');
  return error;
}

describe('_buildExceptionStacktrace', () => {
  it('returns undefined when there is no stack', () => {
    assert.strictEqual(_buildExceptionStacktrace({}), undefined);
    assert.strictEqual(_buildExceptionStacktrace({ stack: '' }), undefined);
    assert.strictEqual(
      _buildExceptionStacktrace({ stack: 42 as unknown }),
      undefined
    );
  });

  it('returns the stack unchanged when there are no nested errors', () => {
    const error = makeError('boom');
    assert.strictEqual(_buildExceptionStacktrace(error), error.stack);
  });

  it('returns the stack unchanged for a real error without cause', () => {
    const error = new Error('boom');
    assert.strictEqual(_buildExceptionStacktrace(error), error.stack);
  });

  it('appends the cause chain', () => {
    const root = makeError('root');
    const mid = makeError('mid', { cause: root });
    const top = makeError('top', { cause: mid });

    assert.strictEqual(
      _buildExceptionStacktrace(top),
      [
        'Error: top',
        '    at top:1:1',
        'Caused by: Error: mid',
        '    at mid:1:1',
        'Caused by: Error: root',
        '    at root:1:1',
      ].join('\n')
    );
  });

  it('appends the errors of an AggregateError, including their causes', () => {
    const aggregate = new AggregateError(
      [
        makeError('test error 1'),
        makeError('test error 2', { cause: makeError('test error 3') }),
        makeError('test error 4'),
      ],
      'test error'
    );
    aggregate.stack = 'AggregateError: test error\n    at aggregate:1:1';

    assert.strictEqual(
      _buildExceptionStacktrace(aggregate),
      [
        'AggregateError: test error',
        '    at aggregate:1:1',
        '    [errors][0]: Error: test error 1',
        '        at test_error_1:1:1',
        '    [errors][1]: Error: test error 2',
        '        at test_error_2:1:1',
        '    Caused by: Error: test error 3',
        '        at test_error_3:1:1',
        '    [errors][2]: Error: test error 4',
        '        at test_error_4:1:1',
      ].join('\n')
    );
  });

  it('renders nested AggregateErrors and causes of an AggregateError', () => {
    const inner = new AggregateError([makeError('leaf')], 'inner');
    inner.stack = 'AggregateError: inner\n    at inner:1:1';
    const outer = new AggregateError([inner], 'outer', {
      cause: makeError('why'),
    });
    outer.stack = 'AggregateError: outer\n    at outer:1:1';

    assert.strictEqual(
      _buildExceptionStacktrace(outer),
      [
        'AggregateError: outer',
        '    at outer:1:1',
        '    [errors][0]: AggregateError: inner',
        '        at inner:1:1',
        '        [errors][0]: Error: leaf',
        '            at leaf:1:1',
        'Caused by: Error: why',
        '    at why:1:1',
      ].join('\n')
    );
  });

  it('prepends the header to stacks that do not include it', () => {
    // e.g. Firefox and Safari only include frames in `error.stack`
    const cause = new TypeError('inner');
    cause.stack = 'inner@file.js:1:1';
    const top = new Error('top', { cause });
    top.stack = 'top@file.js:2:2';

    assert.strictEqual(
      _buildExceptionStacktrace(top),
      'top@file.js:2:2\nCaused by: TypeError: inner\ninner@file.js:1:1'
    );
  });

  it('renders causes that are not errors', () => {
    assert.strictEqual(
      _buildExceptionStacktrace(makeError('top', { cause: 'just a string' })),
      'Error: top\n    at top:1:1\nCaused by: just a string'
    );
    assert.strictEqual(
      _buildExceptionStacktrace(makeError('top', { cause: 404 })),
      'Error: top\n    at top:1:1\nCaused by: 404'
    );
    assert.strictEqual(
      _buildExceptionStacktrace(
        makeError('top', { cause: { name: 'HttpError', message: 'nope' } })
      ),
      'Error: top\n    at top:1:1\nCaused by: HttpError: nope'
    );
  });

  it('ignores null causes and non-array errors', () => {
    const error = makeError('top', { cause: null });
    assert.strictEqual(_buildExceptionStacktrace(error), error.stack);

    const aggregate = new AggregateError([], 'agg');
    aggregate.stack = 'AggregateError: agg\n    at agg:1:1';
    aggregate.errors = 'not an array' as unknown as unknown[];
    assert.strictEqual(_buildExceptionStacktrace(aggregate), aggregate.stack);
  });

  it('ignores `errors` on errors that are not AggregateErrors', () => {
    const error = makeError('validation');
    (error as { errors?: unknown }).errors = [makeError('field')];
    assert.strictEqual(_buildExceptionStacktrace(error), error.stack);
  });

  it('renders `errors` of AggregateError subclasses and cross-realm AggregateErrors', () => {
    class MyAggregateError extends AggregateError {}
    const subclass = new MyAggregateError([makeError('a')], 'sub');
    subclass.stack = 'MyAggregateError: sub\n    at sub:1:1';
    assert.strictEqual(
      _buildExceptionStacktrace(subclass),
      [
        'MyAggregateError: sub',
        '    at sub:1:1',
        '    [errors][0]: Error: a',
        '        at a:1:1',
      ].join('\n')
    );

    const crossRealm = {
      name: 'AggregateError',
      message: 'other realm',
      stack: 'AggregateError: other realm\n    at realm:1:1',
      errors: [makeError('b')],
    };
    assert.strictEqual(
      _buildExceptionStacktrace(crossRealm),
      [
        'AggregateError: other realm',
        '    at realm:1:1',
        '    [errors][0]: Error: b',
        '        at b:1:1',
      ].join('\n')
    );
  });

  it('handles circular cause chains', () => {
    const a = makeError('a');
    const b = makeError('b', { cause: a });
    (a as { cause?: unknown }).cause = b;

    assert.strictEqual(
      _buildExceptionStacktrace(a),
      [
        'Error: a',
        '    at a:1:1',
        'Caused by: Error: b',
        '    at b:1:1',
        'Caused by: [Circular]',
      ].join('\n')
    );
  });

  it('handles an AggregateError containing itself', () => {
    const errors: unknown[] = [];
    const aggregate = new AggregateError(errors, 'self');
    aggregate.stack = 'AggregateError: self\n    at self:1:1';
    aggregate.errors.push(aggregate);

    assert.strictEqual(
      _buildExceptionStacktrace(aggregate),
      'AggregateError: self\n    at self:1:1\n    [errors][0]: [Circular]'
    );
  });

  it('renders an error shared by several branches each time', () => {
    const shared = makeError('shared');
    const aggregate = new AggregateError([shared, shared], 'dup');
    aggregate.stack = 'AggregateError: dup\n    at dup:1:1';

    const stacktrace = _buildExceptionStacktrace(aggregate) ?? '';
    assert.strictEqual(stacktrace.split('Error: shared').length - 1, 2);
    assert.ok(!stacktrace.includes('[Circular]'));
  });

  it('limits the number of nested errors rendered', () => {
    let error = makeError('e0');
    for (let i = 1; i <= 150; i++) {
      error = makeError(`e${i}`, { cause: error });
    }

    const stacktrace = _buildExceptionStacktrace(error) ?? '';
    assert.strictEqual(stacktrace.split('Caused by: ').length - 1, 100);
    assert.ok(stacktrace.endsWith('\n... (more nested errors omitted)'));
  });
});
