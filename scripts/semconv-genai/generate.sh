#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/../../"

# The GenAI semantic conventions repository has no tags or releases yet, so this
# pins a commit on `main` instead of a version tag. Get the current commit by
# running `gh api repos/open-telemetry/semantic-conventions-genai/commits/main --jq .sha`
# ... in git@github.com:open-telemetry/semantic-conventions-genai.git
SPEC_VERSION=8d3e4a0f3c34a46f6edb9c71e8666e02e6bf3958
# ... in git@github.com:open-telemetry/weaver.git
# Note: This intentionally differs from the version used by "scripts/semconv/generate.sh".
# It matches `WEAVER_VERSION` in the GenAI spec repo's "versions.env", and the
# registry's `definition/2` file format requires `registry generate --v2`.
GENERATOR_VERSION=v0.25.1

# When running on windows and you are getting references to ";C" (like Telemetry;C)
# then this is an issue with the bash shell, so first run the following in your shell:
# export MSYS_NO_PATHCONV=1

cd ${SCRIPT_DIR}

rm -rf semantic-conventions-genai || true
mkdir semantic-conventions-genai
cd semantic-conventions-genai

git init
git remote add origin https://github.com/open-telemetry/semantic-conventions-genai.git
git fetch origin "${SPEC_VERSION}" --depth=1
git reset --hard FETCH_HEAD
cd ${SCRIPT_DIR}

# Note: Weaver resolves this registry's dependency on the core semantic
# conventions registry by cloning it into a cache under `$HOME`. The container
# therefore needs a writable `HOME` and network access.

# Generate "semantic-conventions-genai/src/stable_*.ts".
docker run --rm --platform linux/amd64 \
  -u $(id -u):$(id -g) -e HOME=/tmp \
  -v ${SCRIPT_DIR}/semantic-conventions-genai/model:/source \
  -v ${SCRIPT_DIR}/templates:/weaver/templates \
  -v ${ROOT_DIR}/semantic-conventions-genai/src/:/output \
  otel/weaver:$GENERATOR_VERSION \
  registry generate \
  --v2 \
  --registry=/source \
  --templates=/weaver/templates \
  ts-stable \
  /output/

# Generate "semantic-conventions-genai/src/experimental_*.ts".
docker run --rm --platform linux/amd64 \
  -u $(id -u):$(id -g) -e HOME=/tmp \
  -v ${SCRIPT_DIR}/semantic-conventions-genai/model:/source \
  -v ${SCRIPT_DIR}/templates:/weaver/templates \
  -v ${ROOT_DIR}/semantic-conventions-genai/src/:/output \
  otel/weaver:$GENERATOR_VERSION \
  registry generate \
  --v2 \
  --registry=/source \
  --templates=/weaver/templates \
  ts-experimental \
  /output/

# Ensure semconv-genai compiles
cd "${ROOT_DIR}/semantic-conventions-genai"
npm run compile
