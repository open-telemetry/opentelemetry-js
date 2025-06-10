require('ts-node/register');

if (process.env.MOCHA_PATCH_ESM != null) {
  const { register } = require('module');
  const { pathToFileURL } = require('url');

  register('ts-node/esm', pathToFileURL(__filename));
}
