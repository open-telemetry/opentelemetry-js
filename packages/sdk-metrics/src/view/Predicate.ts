/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// https://tc39.es/proposal-regex-escaping
// escape ^ $ \ .  + ? ( ) [ ] { } |
// do not need to escape * as we interpret it as wildcard
const ESCAPE = /[\^$\\.+?()[\]{}|]/g;

export interface Predicate {
  match(str: string): boolean;
}

/**
 * Wildcard pattern predicate, supports patterns like `*`, `foo*`, `*bar`.
 */
export class PatternPredicate implements Predicate {
  private _matchAll: boolean;
  private _regexp: RegExp;

  constructor(pattern: string) {
    if (pattern === '*') {
      this._matchAll = true;
      this._regexp = /.*/;
    } else {
      this._matchAll = false;
      this._regexp = new RegExp(PatternPredicate.escapePattern(pattern));
    }
  }

  match(str: string): boolean {
    if (this._matchAll) {
      return true;
    }

    return this._regexp.test(str);
  }

  static escapePattern(pattern: string): string {
    return `^${pattern.replace(ESCAPE, '\\$&').replace('*', '.*')}$`;
  }

  static hasWildcard(pattern: string): boolean {
    return pattern.includes('*');
  }
}

export class ExactPredicate implements Predicate {
  private _matchAll: boolean;
  private _pattern?: string;

  constructor(pattern?: string) {
    this._matchAll = pattern === undefined;
    this._pattern = pattern;
  }

  match(str: string): boolean {
    if (this._matchAll) {
      return true;
    }
    if (str === this._pattern) {
      return true;
    }
    return false;
  }
}
