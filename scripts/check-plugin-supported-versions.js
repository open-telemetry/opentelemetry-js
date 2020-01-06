const [node, script, pack] = process.argv;

const child_process = require("child_process");

const plugin = require(pack).plugin;
const isSupportedVersion = require("../packages/opentelemetry-node/build/src/instrumentation/utils").isSupportedVersion;

if (plugin && plugin.supportedVersions) {
  const version = child_process.execSync(`npm show ${plugin.moduleName} version`).toString("utf-8").trim();
  if (!isSupportedVersion(version, plugin.supportedVersions)) {
    console.log(`${plugin.moduleName} does not support ${version}. Supported versions: ${JSON.stringify(plugin.supportedVersions)}`);
    process.exit(1);
  } else {
    console.log(`${plugin.moduleName} supports the latest version`);
  }
}

