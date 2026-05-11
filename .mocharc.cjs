const [major, minor] = process.versions.node.split('.').map(Number);
// `--no-experimental-strip-types` exists from Node 22.6+. Without it, Node's
// experimental strip-types takes precedence over ts-node and fails to load
// `.ts` test files. On older Node versions the flag is rejected as "bad
// option", so only set it where it's recognized.
const supportsStripTypesFlag = major > 22 || (major === 22 && minor >= 6);

module.exports = {
  require: 'ts-node/register',
  ...(supportsStripTypesFlag
    ? { 'node-option': ['no-experimental-strip-types'] }
    : {}),
};
