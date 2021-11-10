#!/usr/bin/env node

const Nightwatch = require('nightwatch');
const browserstack = require('browserstack-local');
require('dotenv').config();

let bs_local;

try {
  require.main.filename = './node_modules/.bin/nightwatch';
  // Code to start browserstack local before start of test
  console.log('Connecting local');
  Nightwatch.bs_local = bs_local = new browserstack.Local();
  bs_local.start({ key: process.env.BROWSERSTACK_KEY }, function (error) {
    if (error) {
      bs_local.stop(function () {});
      throw error;
    }

    console.log('Connected. Now testing...');
    Nightwatch.cli(function (argv) {
      Nightwatch.CliRunner(argv)
        .setup()
        .runTests()
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          // Code to stop browserstack local after end of single test
          bs_local.stop(function () {});
        });
    });
  });
} catch (ex) {
  console.log('There was an error while starting the test runner:\n\n');
  process.stderr.write(ex.stack + '\n');
  process.exit(2);
}
