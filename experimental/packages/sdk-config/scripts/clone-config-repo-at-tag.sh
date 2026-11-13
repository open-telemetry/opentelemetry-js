#!/bin/bash
#
# Clone the opentelemetry-configuration.git repo to the "build/" dir at the
# given tag. Usage:
#   bash clone-config-repo-at-tag.sh GIT_TAG
#

set -o errexit
set -o pipefail

function fatal {
    echo "$(basename $0): error: $*"
    exit 1
}

GIT_TAG="$1"
[[ -n "$GIT_TAG" ]] || fatal "missing GIT_TAG argument"

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
git fetch origin "${GIT_TAG}" --depth=1
git checkout FETCH_HEAD
