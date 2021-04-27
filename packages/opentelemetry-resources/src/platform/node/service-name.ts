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

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

export function serviceName(): string {
  return getPJsonName() ?? getExecPathName();
}

function getPJsonName(): string | undefined {
  try {
    const pJsonPath = join(cwd(), 'package.json');
    if (existsSync(pJsonPath)) {
      const pJsonBuf = readFileSync(pJsonPath);
      const pJson = JSON.parse(pJsonBuf.toString('utf-8'));
      const name = pJson.name;
      if (typeof name == 'string') {
        return name;
      }
    }
  } catch {
    /* don't care */
  }
  return undefined;
}

function getExecPathName(): string {
  // If the node CLI is invoked argv[1] is undefined
  return `${process.argv0} ${process.argv[1] ?? '<cli>'}`;
}
