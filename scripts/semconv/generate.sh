#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# freeze the spec version to make SpanAttributess generation reproducible
SPEC_VERSION=v1.24.0
GENERATOR_VERSION=0.23.0

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
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/trace/:/output \
  otel/semconvgen:${GENERATOR_VERSION} \
  --only span,event,attribute_group,scope \
  --yaml-root /source \
  code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/SemanticAttributes.ts \
  -Dclass=SemanticAttributes \
  -Dcls_prefix=SEMATTRS

docker run --rm --platform linux/amd64 \
  -v ${SCRIPT_DIR}/semantic-conventions/model:/source \
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/resource/:/output \
  otel/semconvgen:${GENERATOR_VERSION} \
  --only resource \
  --yaml-root /source \
  code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/SemanticResourceAttributes.ts \
  -Dclass=SemanticResourceAttributes \
  -Dcls_prefix=SEMRESATTRS

docker run --rm --platform linux/amd64 \
  -v ${SCRIPT_DIR}/semantic-conventions/model:/source \
  -v ${SCRIPT_DIR}/templates:/templates \
  -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/metrics/:/output \
  otel/semconvgen:${GENERATOR_VERSION} \
  --only metric \
  --yaml-root /source \
  code \
  --template /templates/SemanticAttributes.ts.j2 \
  --output /output/SemanticMetricsAttributes.ts \
  -Dclass=SemanticMetricsAttributes \
  -Dcls_prefix=SEMMTRCSATTRS

# Run the automatic linting fixing task to ensure it will pass eslint
# cd "$ROOT_DIR"

# npm run lint:fix:changed

# # Run the size checks for the generated files
# cd "${ROOT_DIR}/packages/opentelemetry-semantic-conventions"
# npm run size-check
