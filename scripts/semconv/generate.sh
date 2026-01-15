#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# Get latest version by running `git tag -l --sort=version:refname | tail -1`
# ... in git@github.com:open-telemetry/semantic-conventions.git
SPEC_VERSION=v1.39.0
# ... in git@github.com:open-telemetry/weaver.git
GENERATOR_VERSION=v0.20.0

# When running on windows and you are getting references to ";C" (like Telemetry;C)
# then this is an issue with the bash shell, so first run the following in your shell:
# export MSYS_NO_PATHCONV=1

cd ${SCRIPT_DIR}

rm -rf semantic-conventions || true
mkdir semantic-conventions
cd semantic-conventions

git init
git remote add origin https://github.com/open-telemetry/semantic-conventions.git
git fetch origin "${SPEC_VERSION}" --depth=1
git reset --hard FETCH_HEAD
cd ${SCRIPT_DIR}

# Generate "semantic-conventions/src/stable_*.ts".
docker run --rm --platform linux/amd64 \
  -v ${SCRIPT_DIR}/semantic-conventions/model:/source \
  -v ${SCRIPT_DIR}/templates:/weaver/templates \
  -v ${ROOT_DIR}/semantic-conventions/src/:/output \
  otel/weaver:$GENERATOR_VERSION \
  registry generate \
  --registry=/source \
  --templates=/weaver/templates \
  ts-stable \
  /output/

# Generate "semantic-conventions/src/experimental_*.ts".
docker run --rm --platform linux/amd64 \
  -v ${SCRIPT_DIR}/semantic-conventions/model:/source \
  -v ${SCRIPT_DIR}/templates:/weaver/templates \
  -v ${ROOT_DIR}/semantic-conventions/src/:/output \
  otel/weaver:$GENERATOR_VERSION \
  registry generate \
  --registry=/source \
  --templates=/weaver/templates \
  ts-experimental \
  /output/

# Ensure semconv compiles
cd "${ROOT_DIR}/semantic-conventions"
npm run compile
