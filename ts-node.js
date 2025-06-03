const { register } = require('module');
const { pathToFileURL } = require('url');

require('ts-node/register');
register('ts-node/esm', pathToFileURL(__filename));
