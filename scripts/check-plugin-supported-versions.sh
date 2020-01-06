#!/usr/bin/env bash

# exit if any command fails
set -e

packages=$(lerna list -p --scope @opentelemetry/plugin-*)
for package in $packages
do
    node scripts/check-plugin-supported-versions.js $package
done
