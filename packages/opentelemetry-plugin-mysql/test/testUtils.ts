/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as childProcess from 'child_process';
export function startDocker() {
  const tasks = [
    run(
      'docker run --rm -d -e MYSQL_ROOT_PASSWORD=rootpw -e MYSQL_DATABASE=test_db -e MYSQL_USER=otel -e MYSQL_PASSWORD=secret -p 33306:3306 --name otmysql circleci/mysql:5.7'
    ),
  ];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (task && task.code !== 0) {
      console.error('Failed to start container!');
      console.error(task.output);
      return false;
    }
  }
  return true;
}

export function cleanUpDocker() {
  run('docker stop otmysql');
}

function run(cmd: string) {
  try {
    const proc = childProcess.spawnSync(cmd, {
      shell: true,
    });
    return {
      code: proc.status,
      output: proc.output
        .map(v => String.fromCharCode.apply(null, v as any))
        .join(''),
    };
  } catch (e) {
    console.log(e);
    return;
  }
}
