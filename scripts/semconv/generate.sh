#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# freeze the spec version to make SemanticAttributes generation reproducible
SPEC_VERSION=main

cd ${SCRIPT_DIR}

rm -rf opentelemetry-specification || true
mkdir opentelemetry-specification
cd opentelemetry-specification

git init
git remote add origin https://github.com/open-telemetry/opentelemetry-specification.git
git fetch origin "$SPEC_VERSION"
git reset --hard FETCH_HEAD
cd ${SCRIPT_DIR}

docker run --rm \
  -v ${SCRIPT_DIR}/opentelemetry-specification/semantic_conventions/trace:/source \
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/trace/:/output \
  otel/semconvgen \
  -f /source code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/SemanticAttribute.ts \
  -Dclass=SemanticAttribute

docker run --rm \
  -v ${SCRIPT_DIR}/opentelemetry-specification/semantic_conventions/resource:/source \
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/resource/:/output \
  otel/semconvgen \
  -f /source code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/ResourceAttribute.ts \
  -Dclass=ResourceAttribute

# Run the automatic linting fixing task to ensure it will pass eslint
cd "$ROOT_DIR/packages/opentelemetry-semantic-conventions"

npm run lint:fix

cd "$ROOT_DIR"
