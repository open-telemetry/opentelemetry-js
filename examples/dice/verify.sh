#!/usr/bin/env bash
# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VARIANT="${1:?Usage: $0 <uninstrumented|instrumented>}"
APP_DIR="$SCRIPT_DIR/$VARIANT"
PORT="${APPLICATION_PORT:-8080}"

cd "$APP_DIR"

if [ -f instrumentation.mjs ]; then
  node --import ./instrumentation.mjs app.js > app.log 2>&1 &
else
  node app.js > app.log 2>&1 &
fi
app_pid=$!
trap 'kill "$app_pid" 2>/dev/null || true; wait "$app_pid" 2>/dev/null || true' EXIT

ready=false
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/rolldice" > /dev/null; then
    ready=true
    break
  fi
  sleep 1
done

if [ "$ready" != "true" ]; then
  echo "Application failed to start:"
  cat app.log
  exit 1
fi

echo "Application is running on port ${PORT}"
