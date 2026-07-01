// Node >= 22.6 supports (and >= 22.18 defaults to) native TypeScript type
// stripping, which conflicts with `ts-node/register`. Disable it there so
// ts-node owns .ts loading. Older Node rejects the unknown flag, so only add
// it where it exists.
const [major, minor] = process.versions.node.split('.').map(Number);
const supportsStripTypes = major > 22 || (major === 22 && minor >= 6);

module.exports = {
  require: 'ts-node/register',
  ...(supportsStripTypes ? { 'node-option': ['no-experimental-strip-types'] } : {}),
};
