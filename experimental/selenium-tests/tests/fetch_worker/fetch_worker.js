const { TIMEOUT_ELEMENT_MS } = require('../../tests-helpers/constants');

module.exports = {
  'Fetch instrumentation in Worker': function (browser) {
    browser
      .url('http://localhost:8090/fetch/worker.html')
      .waitForElementVisible('body', TIMEOUT_ELEMENT_MS)
      .waitForElementVisible('#button1', TIMEOUT_ELEMENT_MS)
      .click('#button1')
      .waitForElementVisible('#otelSeleniumDone', TIMEOUT_ELEMENT_MS)
      .execute(
        () => {
          return otel.finishedSpans;
        },
        [],
        (spans) => {
          browser.assert.equal(spans.length, 2, 'Should export 2 spans');
        },
      )

    browser.end(() => {
      console.log('end');
    });
  },
};
