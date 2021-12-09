const { TIMEOUT_ELEMENT_MS } = require('../../tests-helpers/constants');
module.exports = {
  'XHR instrumentation': function (browser) {
    browser
      .url('http://localhost:8090/xhr')
      .waitForElementVisible('body', TIMEOUT_ELEMENT_MS)
      .waitForElementVisible('#button1', TIMEOUT_ELEMENT_MS)
      .click('#button1')
      .waitForElementVisible('#otelSeleniumDone', TIMEOUT_ELEMENT_MS)
      .execute(
        function() {
          const spans = otel.memoryExporter.getFinishedSpans();
          return otel.JSONSafeStringify(spans);
        },
        [],
        function(result) {
          const spans = JSON.parse(result.value);
          browser.assert.equal(spans.length, 2, 'Should export 2 spans');
        },
      )

    browser.end(() => {
      console.log('end');
    });
  },
};
