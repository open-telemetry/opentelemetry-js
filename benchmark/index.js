'use strict';

const execSync = require('child_process').execSync;
const exec = cmd => execSync(cmd, { stdio: [0, 1, 2] });

exec('node benchmark/tracer');
exec('node benchmark/propagator');
