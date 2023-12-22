#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# freeze the spec version to make SpanAttributess generation reproducible
SPEC_VERSION=v1.7.0
GENERATOR_VERSION=0.8.0

# When running on windows and your are getting references to ";C" (like Telemetry;C)
# then this is an issue with the bash shell, so first run the following in your shell:
# export MSYS_NO_PATHCONV=1

cd ${SCRIPT_DIR}

rm -rf opentelemetry-specification || true
mkdir opentelemetry-specification
cd opentelemetry-specification

git init
git remote add origin https://github.com/open-telemetry/opentelemetry-specification.git
git fetch origin "$SPEC_VERSION" --depth=1
git reset --hard FETCH_HEAD
cd ${SCRIPT_DIR}

docker run --rm \
  -v ${SCRIPT_DIR}/opentelemetry-specification/semantic_conventions/trace:/source \
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/trace/:/output \
  otel/semconvgen:${GENERATOR_VERSION} \
  -f /source \
  code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/SemanticAttributes.ts \
  -Dclass=SemanticAttributes \
  -Dcls_prefix=SEMATTRS

docker run --rm \
  -v ${SCRIPT_DIR}/opentelemetry-specification/semantic_conventions/resource:/source \
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/resource/:/output \
  otel/semconvgen:${GENERATOR_VERSION} \
  -f /source \
  code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/SemanticResourceAttributes.ts \
  -Dclass=SemanticResourceAttributes \
  -Dcls_prefix=SEMRESATTRS

# Run the automatic linting fixing task to ensure it will pass eslint
cd "$ROOT_DIR"

npm run lint:fix:changed

# Run the size checks for the generated files
cd "${ROOT_DIR}/packages/opentelemetry-semantic-conventions"
npm run size-check
