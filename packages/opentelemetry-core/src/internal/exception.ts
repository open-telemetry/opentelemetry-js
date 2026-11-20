/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Maximum number of nested errors (causes and `AggregateError` children)
 * rendered into a single stacktrace. Guards against pathological error
 * graphs; cycles are detected separately.
 */
const MAX_NESTED_ERRORS = 100;

const INDENT = '    ';

interface ErrorLike {
  name?: unknown;
  message?: unknown;
  stack?: unknown;
  cause?: unknown;
  errors?: unknown;
}

function isObjectLike(value: unknown): value is ErrorLike {
  return (
    (typeof value === 'object' || typeof value === 'function') && value !== null
  );
}

/**
 * Only the `errors` of `AggregateError`s (and subclasses) are rendered, other
 * errors may use an `errors` property for unrelated data. The name check
 * covers errors created in another realm (e.g. an iframe or `vm` context).
 */
function isAggregateError(error: ErrorLike): boolean {
  return (
    (typeof AggregateError === 'function' && error instanceof AggregateError) ||
    error.name === 'AggregateError'
  );
}

/**
 * Returns the `Name: message` header for a nested error, mirroring
 * `Error.prototype.toString()`.
 */
function errorHeader(error: ErrorLike): string {
  const name = typeof error.name === 'string' ? error.name : 'Error';
  const message = typeof error.message === 'string' ? error.message : '';
  if (!name) return message;
  if (!message) return name;
  return `${name}: ${message}`;
}

/**
 * Renders a nested error (a `cause` or an `AggregateError` child) as text.
 * V8 stacks already start with the `Name: message` header; other engines
 * (e.g. SpiderMonkey, JavaScriptCore) only contain frames, so the header is
 * prepended to keep the message visible.
 */
function renderNested(value: unknown): string {
  if (!isObjectLike(value)) {
    return String(value);
  }
  const header = errorHeader(value);
  if (typeof value.stack === 'string' && value.stack) {
    return value.stack.startsWith(header)
      ? value.stack
      : `${header}\n${value.stack}`;
  }
  return header;
}

function indentLines(text: string, indent: string): string {
  return indent ? text.replace(/\n/g, `\n${indent}`) : text;
}

/**
 * @internal
 *
 * Builds the value of the `exception.stacktrace` attribute for an exception.
 *
 * The stack of the exception itself is returned unchanged, followed by the
 * stacks of any nested errors, similar to how Java's
 * `Throwable.printStackTrace()` renders cause chains:
 *
 * - each error in the `errors` array of an `AggregateError` is appended on a
 *   new line, indented one level and prefixed with `[errors][<index>]: `;
 * - an error's `cause` is appended on a new line at the same indentation as
 *   the error it belongs to, prefixed with `Caused by: `.
 *
 * Cycles are rendered as `[Circular]` and at most {@link MAX_NESTED_ERRORS}
 * nested errors are rendered.
 *
 * @param exception the recorded exception
 * @returns the stacktrace, or `undefined` if the exception has no `stack`
 */
export function _buildExceptionStacktrace(exception: {
  stack?: unknown;
}): string | undefined {
  if (typeof exception.stack !== 'string' || !exception.stack) {
    return undefined;
  }

  // errors currently being rendered, used to detect cycles
  const ancestors = new Set<unknown>([exception]);
  let rendered = 0;
  let truncated = false;
  let out = exception.stack;

  const appendNested = (owner: ErrorLike, indent: string): void => {
    const children: Array<[string, string, unknown]> = [];
    if (isAggregateError(owner) && Array.isArray(owner.errors)) {
      owner.errors.forEach((child, index) => {
        children.push([indent + INDENT, `[errors][${index}]: `, child]);
      });
    }
    if (owner.cause !== undefined && owner.cause !== null) {
      children.push([indent, 'Caused by: ', owner.cause]);
    }

    for (const [childIndent, prefix, child] of children) {
      if (truncated) return;
      if (rendered >= MAX_NESTED_ERRORS) {
        truncated = true;
        out += `\n${childIndent}... (more nested errors omitted)`;
        return;
      }
      rendered++;
      if (ancestors.has(child)) {
        out += `\n${childIndent}${prefix}[Circular]`;
        continue;
      }
      out += `\n${childIndent}${prefix}${indentLines(
        renderNested(child),
        childIndent
      )}`;
      if (isObjectLike(child)) {
        ancestors.add(child);
        appendNested(child, childIndent);
        ancestors.delete(child);
      }
    }
  };

  appendNested(exception, '');
  return out;
}
