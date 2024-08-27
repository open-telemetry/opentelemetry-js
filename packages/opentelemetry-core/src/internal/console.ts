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

export type ConsoleLogFunction = (message: string, ...args: unknown[]) => void;

/**
 * Internal API to encapsulate console related calls to manage them from a single point.
 *
 * @since 1.25.2
 */
export interface ConsoleConfig {
  log?: ConsoleLogFunction;
  error?: ConsoleLogFunction;
  warn?: ConsoleLogFunction;
  info?: ConsoleLogFunction;
  debug?: ConsoleLogFunction;
  trace?: ConsoleLogFunction;
  dir?: (item?: any, options?: any) => void;
}

export type ConsoleFunctionNames =
  | 'log'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'trace'
  | 'dir';

let activeConfig: ConsoleConfig = {};
let scopeObj: any;

export class Console {
  private constructor() {}

  static configure(config: ConsoleConfig, obj: any): void {
    // Copy the properties onto our own config,
    // because properties in the given config object might change, but we want snapshot of them.
    activeConfig = { ...config };
    scopeObj = obj;
  }

  private static _callFunction(
    funcName: ConsoleFunctionNames,
    fallbackFuncName?: ConsoleFunctionNames,
    ...args: any[]
  ): void {
    let theFunc: Function | undefined = activeConfig[funcName];
    let theFuncObj: any = scopeObj;
    if (!(typeof theFunc === 'function')) {
      theFunc =
        console &&
        // eslint-disable-next-line no-console
        (console[funcName] || (fallbackFuncName && console[fallbackFuncName]));
      theFuncObj = console;
    }
    if (typeof theFunc === 'function') {
      theFunc.apply(theFuncObj, args as any);
    }
  }

  static getFunction(
    funcName: ConsoleFunctionNames,
    fallbackFuncName?: ConsoleFunctionNames
  ): Function {
    return function (...args: any[]): void {
      Console._callFunction(funcName, fallbackFuncName, ...args);
    };
  }

  static log(message?: any, ...optionalParams: any[]): void {
    Console._callFunction('log', undefined, message, ...optionalParams);
  }

  static error(message?: any, ...optionalParams: any[]): void {
    Console._callFunction('error', undefined, message, ...optionalParams);
  }

  static warn(message?: any, ...optionalParams: any[]): void {
    Console._callFunction('warn', undefined, message, ...optionalParams);
  }

  static info(message?: any, ...optionalParams: any[]): void {
    Console._callFunction('info', undefined, message, ...optionalParams);
  }

  static debug(message?: any, ...optionalParams: any[]): void {
    Console._callFunction('debug', undefined, message, ...optionalParams);
  }

  static dir(item?: any, options?: any): void {
    Console._callFunction('dir', undefined, item, options);
  }
}
