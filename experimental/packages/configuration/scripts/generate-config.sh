#!/bin/bash

set -o errexit
set -o pipefail

# Get latest version by running `git tag -l --sort=version:refname | tail -1`
# ... in git@github.com:open-telemetry/opentelemetry-configuration.git
CONFIG_VERSION=v1.0.0

# When running on windows and you are getting references to ";C" (like Telemetry;C)
# then this is an issue with the bash shell, so first run the following in your shell:
# export MSYS_NO_PATHCONV=1

TOP=$(cd "$(dirname $0)/../" >/dev/null; pwd)
REPO_DIR="$TOP/build/opentelemetry-configuration"

rm -rf "${REPO_DIR}"
mkdir -p "${REPO_DIR}"
cd "${REPO_DIR}"

git init
git remote add origin https://github.com/open-telemetry/opentelemetry-configuration.git
git fetch origin "${CONFIG_VERSION}" --depth=1
git checkout FETCH_HEAD
