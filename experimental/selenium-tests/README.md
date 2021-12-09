## Selenium Tests

Selenium tests are to help verify the working of opentelemetry in different browsers. For that the nightwatch is used.
This can be run either locally or in github actions with usage of browserstack.
Browser stack also gives possibility of running tests in browserstack on different browsers using our local environment.
This helps to test and debug things locally using any browser we want.  

## Running tests locally using local browser - this is also useful when adding new test

1. run server

```shell
npm run server
```

1. run local test for example for xhr

```shell
npm run local:xhr
```

Please wait a bit it should run selenium tests using our local version of chrome

## Running tests locally using browser stack account - for that you need to have a browser stack account

If you have it please create a file ".env" based on "example.env"

1. run server

```shell
npm run server
```

1. Run local test for example for xhr

```shell
npm run local:bs:xhr
```

## Architecture

1. Folder pages contains all the pages that can be entered after running `npn run server` at <http://localhost:8090/> .
These are fully functioning pages and can be run without running tests.

2. To be able to test it automatically instead of manually we have to create a test. Tests are kept in folder "tests".
For each page there is a corresponding folder with exactly the same name. There are additional 2 files

- helper.js - this file keeps some helpers functions that are included in page automatically and they are available in tests only in section "execute".
This is because this section is being sent to the browser and executed automatically. This is the only way of "sending" and "reading" data back to test
When data is being sent between browser and selenium it needs to be stringified that's why we have one more helper for that called "JSONSafeStringify"
The last helper is the one that helps to verify test has finished successfully "OTELSeleniumDone".

- tracing.js - this file contains the skeleton for tracing and export function "loadOtel" this is a helper function that accepts instrumentations as param.
This way it is easy to add different tests that has different lists of instrumentations.
