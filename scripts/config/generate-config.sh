#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# Get latest version by running `git tag -l --sort=version:refname | tail -1`
# ... in git@github.com:open-telemetry/opentelemetry-configuration.git
CONFIG_VERSION=v0.4.0

# When running on windows and you are getting references to ";C" (like Telemetry;C)
# then this is an issue with the bash shell, so first run the following in your shell:
# export MSYS_NO_PATHCONV=1

cd ${SCRIPT_DIR}

rm -rf opentelemetry-configuration || true
mkdir opentelemetry-configuration
cd opentelemetry-configuration

git init
# git remote add origin https://github.com/open-telemetry/opentelemetry-configuration.git
# this branch has the fix that removes patternProperties
git remote add origin https://github.com/dol/opentelemetry-configuration
git fetch origin fix/wildcard-pattern
git checkout fix/wildcard-pattern
# git fetch origin "${CONFIG_VERSION}" --depth=1
git reset --hard FETCH_HEAD
cd ${SCRIPT_DIR}
