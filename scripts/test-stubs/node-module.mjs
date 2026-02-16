// Browser stub for node:module
// createRequire is used by rolldown runtime for CommonJS interop
// This stub resolves known CommonJS modules for browser testing
import protobufMinimal from 'protobufjs/minimal';

const moduleCache = {
  'protobufjs/minimal': protobufMinimal,
};

export function createRequire(url) {
  return function require(id) {
    if (moduleCache[id]) {
      return moduleCache[id];
    }
    throw new Error(
      `Cannot require "${id}" in browser. ` +
      `Add it to scripts/test-stubs/node-module.mjs if needed. ` +
      `Module was loaded from ${url}`
    );
  };
}
