/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { isPlainObject } from './lodash.merge';

const MAX_LEVEL = 20;

interface ObjectInto {
  obj: any;
  key: string;
}

/**
 * Merges objects together
 * @param args - objects / values to be merged
 */
export function merge(...args: any[]): any {
  let result: any = args.shift();
  const objects: WeakMap<any, ObjectInto[]> | undefined = new WeakMap<
    any,
    ObjectInto[]
  >();
  while (args.length > 0) {
    result = mergeTwoObjects(result, args.shift(), 0, objects);
  }

  return result;
}

function takeValue(value: any): any {
  if (isArray(value)) {
    return value.slice();
  }
  return value;
}

/**
 * Merges two objects
 * @param one - first object
 * @param two - second object
 * @param level - current deep level
 * @param objects - objects holder that has been already referenced - to prevent
 * cyclic dependency
 */
function mergeTwoObjects(
  one: any,
  two: any,
  level = 0,
  objects: WeakMap<any, ObjectInto[]>
): any {
  let result: any;
  if (level > MAX_LEVEL) {
    return undefined;
  }
  level++;
  if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) {
    result = takeValue(two);
  } else if (isArray(one)) {
    result = one.slice();
    if (isArray(two)) {
      for (let i = 0, j = two.length; i < j; i++) {
        result.push(takeValue(two[i]));
      }
    } else if (isObject(two)) {
      const keys = Object.keys(two);
      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        result[key] = takeValue(two[key]);
      }
    }
  } else if (isObject(one)) {
    if (isObject(two)) {
      if (!shouldMerge(one, two)) {
        return two;
      }
      result = Object.assign({}, one);
      const keys = Object.keys(two);

      for (let i = 0, j = keys.length; i < j; i++) {
        const key = keys[i];
        const twoValue = two[key];

        if (isPrimitive(twoValue)) {
          if (typeof twoValue === 'undefined') {
            delete result[key];
          } else {
            // result[key] = takeValue(twoValue);
            result[key] = twoValue;
          }
        } else {
          const obj1 = result[key];
          const obj2 = twoValue;

          if (
            wasObjectReferenced(one, key, objects) ||
            wasObjectReferenced(two, key, objects)
          ) {
            delete result[key];
          } else {
            if (isObject(obj1) && isObject(obj2)) {
              const arr1 = objects.get(obj1) || [];
              const arr2 = objects.get(obj2) || [];
              arr1.push({ obj: one, key });
              arr2.push({ obj: two, key });
              objects.set(obj1, arr1);
              objects.set(obj2, arr2);
            }

            result[key] = mergeTwoObjects(
              result[key],
              twoValue,
              level,
              objects
            );
          }
        }
      }
    } else {
      result = two;
    }
  }

  return result;
}

/**
 * Function to check if object has been already reference
 * @param obj
 * @param key
 * @param objects
 */
function wasObjectReferenced(
  obj: any,
  key: string,
  objects: WeakMap<any, ObjectInto[]>
): boolean {
  const arr = objects.get(obj[key]) || [];
  for (let i = 0, j = arr.length; i < j; i++) {
    const info = arr[i];
    if (info.key === key && info.obj === obj) {
      return true;
    }
  }
  return false;
}

function isArray(value: any): boolean {
  return Array.isArray(value);
}

function isFunction(value: any): boolean {
  return typeof value === 'function';
}

function isObject(value: any): boolean {
  return (
    !isPrimitive(value) &&
    !isArray(value) &&
    !isFunction(value) &&
    typeof value === 'object'
  );
}

function isPrimitive(value: any): boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined' ||
    value instanceof Date ||
    value instanceof RegExp ||
    value === null
  );
}

function shouldMerge(one: any, two: any): boolean {
  if (!isPlainObject(one) || !isPlainObject(two)) {
    return false;
  }

  return true;
}
