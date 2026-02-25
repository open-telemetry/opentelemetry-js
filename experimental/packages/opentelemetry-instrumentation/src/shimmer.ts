/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 * BSD 2-Clause License
 *
 * Copyright (c) 2013-2019, Forrest L Norvell
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* Modified by OpenTelemetry Authors
 *  - converted to TypeScript
 *  - aligned with style-guide
 */

import { ShimWrapped } from './types';

// Default to complaining loudly when things don't go according to plan.
// eslint-disable-next-line no-console
let logger: typeof console.error = console.error.bind(console);

// Sets a property on an object, preserving its enumerability.
// This function assumes that the property is already writable.
function defineProperty(obj: object, name: PropertyKey, value: unknown): void {
  const enumerable =
    !!obj[name as keyof typeof obj] &&
    Object.prototype.propertyIsEnumerable.call(obj, name);

  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable,
    writable: true,
    value,
  });
}

export const wrap = <Nodule extends object, FieldName extends keyof Nodule>(
  nodule: Nodule,
  name: FieldName,
  wrapper: (original: Nodule[FieldName], name: FieldName) => Nodule[FieldName]
): ShimWrapped | undefined => {
  if (!nodule || !nodule[name]) {
    logger('no original function ' + String(name) + ' to wrap');
    return;
  }

  if (!wrapper) {
    logger('no wrapper function');
    logger(new Error().stack);
    return;
  }

  const original = nodule[name];

  if (typeof original !== 'function' || typeof wrapper !== 'function') {
    logger('original object and wrapper must be functions');
    return;
  }

  const wrapped = wrapper(original, name) as object;

  defineProperty(wrapped, '__original', original);
  defineProperty(wrapped, '__unwrap', () => {
    if (nodule[name] === wrapped) {
      defineProperty(nodule, name, original);
    }
  });
  defineProperty(wrapped, '__wrapped', true);
  defineProperty(nodule, name, wrapped);
  return wrapped as ShimWrapped;
};

export const massWrap = <Nodule extends object, FieldName extends keyof Nodule>(
  nodules: Nodule[],
  names: FieldName[],
  wrapper: (original: Nodule[FieldName]) => Nodule[FieldName]
): void => {
  if (!nodules) {
    logger('must provide one or more modules to patch');
    logger(new Error().stack);
    return;
  } else if (!Array.isArray(nodules)) {
    nodules = [nodules];
  }

  if (!(names && Array.isArray(names))) {
    logger('must provide one or more functions to wrap on modules');
    return;
  }

  nodules.forEach(nodule => {
    names.forEach(name => {
      wrap(nodule, name, wrapper);
    });
  });
};

export const unwrap = <Nodule extends object>(
  nodule: Nodule,
  name: keyof Nodule
): void => {
  if (!nodule || !nodule[name]) {
    logger('no function to unwrap.');
    logger(new Error().stack);
    return;
  }

  const wrapped = nodule[name] as unknown as ShimWrapped;

  if (!wrapped.__unwrap) {
    logger(
      'no original to unwrap to -- has ' +
        String(name) +
        ' already been unwrapped?'
    );
  } else {
    wrapped.__unwrap();
    return;
  }
};

export const massUnwrap = <Nodule extends object>(
  nodules: Nodule[],
  names: Array<keyof Nodule>
): void => {
  if (!nodules) {
    logger('must provide one or more modules to patch');
    logger(new Error().stack);
    return;
  } else if (!Array.isArray(nodules)) {
    nodules = [nodules];
  }

  if (!(names && Array.isArray(names))) {
    logger('must provide one or more functions to unwrap on modules');
    return;
  }

  nodules.forEach(nodule => {
    names.forEach(name => {
      unwrap(nodule, name);
    });
  });
};

export interface ShimmerOptions {
  logger?: typeof console.error;
}

export default function shimmer(options: ShimmerOptions): void {
  if (options && options.logger) {
    if (typeof options.logger !== 'function') {
      logger("new logger isn't a function, not replacing");
    } else {
      logger = options.logger;
    }
  }
}

shimmer.wrap = wrap;
shimmer.massWrap = massWrap;
shimmer.unwrap = unwrap;
shimmer.massUnwrap = massUnwrap;
