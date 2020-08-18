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

/**
 * Adds an event listener to trigger a callback when an unload event in the window is detected
 */
export function notifyOnGlobalShutdown(cb: () => void): () => void {
  window.addEventListener('unload', cb, { once: true });
  return function removeCallbackFromGlobalShutdown() {
    window.removeEventListener('unload', cb, false);
  };
}

/**
 * Warning: meant for internal use only! Closes the current window, triggering the unload event
 */
export function _invokeGlobalShutdown() {
  window.close();
}
