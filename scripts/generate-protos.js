'use strict';

const cp = require('child_process');
const path = require('path');

const appRoot = process.cwd();
const rootBinDir = path.resolve(__dirname, '..', 'node_modules', '.bin');

const generatedPath = path.resolve(appRoot, './src/generated');
const protosPath = path.resolve(appRoot, './protos');
const protos = [
  'opentelemetry/proto/common/v1/common.proto',
  'opentelemetry/proto/resource/v1/resource.proto',
  'opentelemetry/proto/trace/v1/trace.proto',
  'opentelemetry/proto/collector/trace/v1/trace_service.proto',
  'opentelemetry/proto/metrics/v1/metrics.proto',
  'opentelemetry/proto/collector/metrics/v1/metrics_service.proto',
  'opentelemetry/proto/logs/v1/logs.proto',
  'opentelemetry/proto/collector/logs/v1/logs_service.proto',
].map(it => {
  return path.join(protosPath, it);
});

function exec(command, argv) {
  return new Promise((resolve, reject) => {
    let spawnCmd = command;
    let spawnArgs = argv;
    if (process.platform === 'win32' && command.endsWith('.cmd')) {
      spawnCmd = 'cmd.exe';
      spawnArgs = ['/c', command, ...argv];
    }
    const child = cp.spawn(spawnCmd, spawnArgs, {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    child.on('exit', (code, signal) => {
      if (code !== 0) {
        reject(new Error(`${command} exited with non-zero code(${code}, ${signal})`));
        return;
      }
      resolve();
    });
  });
}

function pbts(pbjsOutFile) {
  const pbtsOptions = [
    '-o', path.join(generatedPath, 'root.d.ts'),
  ];
  // on windows, scripts in node_modules/.bin/ are suffixed with .cmd
  return exec(path.resolve(rootBinDir, process.platform !== 'win32' ? 'pbts': 'pbts.cmd'), [...pbtsOptions, pbjsOutFile]);
}

async function pbjs(files) {
  const outFile = path.join(generatedPath, 'root.js');
  const pbjsOptions = [
    '-t', 'static-module',
    '-p', protosPath,
    '-w', 'commonjs',
    '--null-defaults',
    '-o', outFile,
  ];
  // on windows, scripts in node_modules/.bin/ suffixed with .cmd
  await exec(path.resolve(rootBinDir, process.platform !== 'win32' ? 'pbjs': 'pbjs.cmd'), [...pbjsOptions, ...files]);
  return outFile;
}

(async function main() {
  const pbjsOut = await pbjs(protos);
  await pbts(pbjsOut);
})();
