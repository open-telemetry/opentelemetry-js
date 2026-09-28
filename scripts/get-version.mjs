#!/usr/bin/env node
/**
 * This extracts the first version of a non-private package in a directory if the provided path is a directory
 * OR the version inside the `package.json` the provided path is a file.
 *
 * Usage (from project root):
 * - node scripts/get-version.js [PATH TO DIRECTORY | PATH TO FILE]
 * Examples:
 * - node scripts/get-version.js ./experimental/packages/
 * - node scripts/get-version.js ./api/package.json
 */

import { determineVersionFromPath } from './lib/version-utils.mjs';

console.log(determineVersionFromPath(process.argv[2]));
