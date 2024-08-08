#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# freeze the spec version to make SpanAttributess generation reproducible
SPEC_VERSION=v1.27.0
GENERATOR_VERSION=0.8.0

# When running on windows and your are getting references to ";C" (like Telemetry;C)
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

docker run --rm --platform linux/amd64 \
  -v ${SCRIPT_DIR}/semantic-conventions/model:/source \
  -v ${SCRIPT_DIR}/templates:/weaver/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/:/output \
  otel/weaver:$GENERATOR_VERSION \
  registry generate \
  --registry=/source \
  --templates=/weaver/templates \
  stable \
  /output/

# Ensure semconv compiles
cd "${ROOT_DIR}/packages/opentelemetry-semantic-conventions"
npm run compile
