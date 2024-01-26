#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# Path whre to place the new semanticon conventions
# empty if you want to run the old genarator code
SRC_PATH=$1

echo "Path is ${SRC_PATH}"

# With no path we're generating the leaacy semconv in its package
if [ "$SRC_PATH" == "" ]; then
  # freeze the spec version to make SpanAttributess generation reproducible
  SPEC_VERSION=v1.7.0
  GENERATOR_VERSION=0.7.0

  echo "Generating semantic conventions for spec version ${SPEC_VERSION}";

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
    -Dclass=SemanticAttributes

  docker run --rm \
    -v ${SCRIPT_DIR}/opentelemetry-specification/semantic_conventions/resource:/source \
    -v ${SCRIPT_DIR}/templates:/templates \
    -v ${ROOT_DIR}/packages/opentelemetry-semantic-conventions/src/resource/:/output \
    otel/semconvgen:${GENERATOR_VERSION} \
    -f /source \
    code \
    --template /templates/SemanticAttributes.ts.j2 \
    --output /output/SemanticResourceAttributes.ts \
    -Dclass=SemanticResourceAttributes
fi

# TODO: add comments here. REfs
# - https://github.com/open-telemetry/build-tools/pull/157/files
# - https://github.com/open-telemetry/semantic-conventions-java/blob/2be178a7fd62d1073fa9b4f0f0520772a6496e0b/build.gradle.kts#L107
if [ "$SRC_PATH" != "" ]; then
# freeze the spec version to make SpanAttributess generation reproducible
  SPEC_VERSION=v1.24.0
  GENERATOR_VERSION=0.23.0
  REPO=semantic-conventions

  echo "Generating semantic conventions for spec version ${SPEC_VERSION}";

  cd ${SCRIPT_DIR}

  rm -rf ${REPO} || true
  mkdir ${REPO}
  cd ${REPO}

  git init
  git remote add origin https://github.com/open-telemetry/${REPO}.git
  git fetch origin "$SPEC_VERSION" --depth=1
  git reset --hard FETCH_HEAD
  cd ${SCRIPT_DIR}

  docker run --rm \
    -v ${SCRIPT_DIR}/${REPO}/model:/source \
    -v ${SCRIPT_DIR}/templates:/templates \
    -v ${ROOT_DIR}/${SRC_PATH}/:/output \
    otel/semconvgen:${GENERATOR_VERSION} \
    --only span,event,attribute_group,scope,metric\
    --yaml-root /source \
    code \
    --template /templates/SemanticAttributes.ts.j2 \
    --output /output/SemanticAttributes.ts \
    -Dclass=SemanticAttributes

  docker run --rm \
    -v ${SCRIPT_DIR}/${REPO}/model:/source \
    -v ${SCRIPT_DIR}/templates:/templates \
    -v ${ROOT_DIR}/${SRC_PATH}/:/output \
    otel/semconvgen:${GENERATOR_VERSION} \
    --only resource\
    --yaml-root /source \
    code \
    --template /templates/SemanticAttributes.ts.j2 \
    --output /output/SemanticResourceAttributes.ts \
    -Dclass=SemanticResourceAttributes
fi


# Run the automatic linting fixing task to ensure it will pass eslint
cd "$ROOT_DIR"

npm run lint:fix:changed
