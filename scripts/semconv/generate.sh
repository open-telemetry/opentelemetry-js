#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# freeze the spec version to make SpanAttributess generation reproducible
SPEC_VERSION=v1.16.0
GENERATOR_VERSION=0.16.0

cd ${SCRIPT_DIR}

rm -rf semantic-conventions || true
mkdir semantic-conventions
cd semantic-conventions

git init
git remote add origin https://github.com/open-telemetry/specification.git
git fetch origin "$SPEC_VERSION" --depth=1
git reset --hard FETCH_HEAD
cd ${SCRIPT_DIR}

docker run --rm \
  -v ${SCRIPT_DIR}/semantic-conventions/semantic_conventions:/source \
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/trace/:/output \
  otel/semconvgen:$GENERATOR_VERSION \
  --exclude resource/** \
  --yaml-root /source code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/SemanticAttributes.ts \
  -Dclass=SemanticAttributes \

docker run --rm \
  -v ${SCRIPT_DIR}/semantic-conventions/semantic_conventions:/source \
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/resource/:/output \
  otel/semconvgen:$GENERATOR_VERSION \
  --only resource \
  --yaml-root /source code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/SemanticResourceAttributes.ts \
  -Dclass=SemanticResourceAttributes

# Run the automatic linting fixing task to ensure it will pass eslint
cd "$ROOT_DIR"

npm run lint:fix:changed
