
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

let shutDownListeners: Array<() => void> = [];
process.on('SIGTERM', function () {
  shutDownListeners.forEach(listener => listener());
  shutDownListeners = [];
});

/**
 * Adds an event listener to trigger a callback when a SIGTERM is detected in the process
 */
export function notifyOnGlobalShutdown(cb: () => void): () => void {
  function removeCallbackFromGlobalShutdown() {
    const i = shutDownListeners.findIndex((v) => v === cb);
    if (i !== -1) {
      shutDownListeners.splice(i, 1);
    }
  };
  removeCallbackFromGlobalShutdown();
  shutDownListeners.push(cb);
  return removeCallbackFromGlobalShutdown;
}

/**
 * Warning: meant for internal use only! Sends a SIGTERM to the current process
 */
export function _invokeGlobalShutdown() {
  process.kill(process.pid, 'SIGTERM');
}
