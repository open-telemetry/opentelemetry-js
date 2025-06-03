const { register } = require('module');
const { pathToFileURL } = require('url');

require('ts-node/register');

const shouldPatchEsm = process.execArgv.every(arg => !arg.includes('loader'));
if (shouldPatchEsm) {
  register('ts-node/esm', pathToFileURL(__filename));
}
