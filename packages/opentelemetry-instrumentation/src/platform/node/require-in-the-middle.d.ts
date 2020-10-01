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

declare module 'require-in-the-middle' {
  namespace hook {
    type Options = {
      internals?: boolean;
    };
    type OnRequireFn = <T>(exports: T, name: string, basedir?: string) => T;
    type Hooked = { unhook(): void };
  }
  function hook(
    modules: string[] | null,
    options: hook.Options | null,
    onRequire: hook.OnRequireFn
  ): hook.Hooked;
  function hook(
    modules: string[] | null,
    onRequire: hook.OnRequireFn
  ): hook.Hooked;
  function hook(onRequire: hook.OnRequireFn): hook.Hooked;
  export = hook;
}
