const { register } = require('module');
const { pathToFileURL } = require('url');

require('ts-node/register');

if (process.env.MOCHA_DONT_PATCH_ESM == null) {
  register('ts-node/esm', pathToFileURL(__filename));
}
