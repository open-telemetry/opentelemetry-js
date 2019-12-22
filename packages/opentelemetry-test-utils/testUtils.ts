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
export function startDocker(db: 'redis' | 'mysql' | 'postgres') {
  let dockerRunCmd;
  switch (db) {
    case 'redis':
      dockerRunCmd = `docker run -d -p 63790:6379 --name ot${db} ${db}:alpine`;
      break;

    case 'mysql':
      dockerRunCmd = `docker run --rm -d -e MYSQL_ROOT_PASSWORD=rootpw -e MYSQL_DATABASE=test_db -e MYSQL_USER=otel -e MYSQL_PASSWORD=secret -p 33306:3306 --name ot${db} circleci/${db}:5.7`;
      break;

    case 'postgres':
      dockerRunCmd = `docker run -d -p 54320:5432 --name ot${db} ${db}:alpine`;
      break;
  }

  const tasks = [run(dockerRunCmd)];

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

export function cleanUpDocker(db: 'redis' | 'mysql' | 'postgres') {
  run(`docker stop ot${db}`);
  run(`docker rm ot${db}`);
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
