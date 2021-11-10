/**
 * These are all needed to make otel to work correctly for IE
 */
window.__Zone_enable_cross_context_check = true;
import 'babel-polyfill';
import 'zone.js';

const safeStringify = require('fast-safe-stringify');

/**
 * Function to stringify data between browser and selenium
 * It works fine for circular dependency
 * @param obj
 * @return {*|string}
 * @constructor
 */
function JSONSafeStringify(obj) {
  return safeStringify(
    obj,
    function replacer(key, value) {
      // Remove the circular structure
      if (value === '[Circular]') {
        return;
      }
      return value;
    },
    2,
  );
}

/**
 * Function helper to mark action on page as finished. This way selenium understands that test is finished
 */
function OTELSeleniumDone() {
  const element = document.createElement('div');
  element.setAttribute('id', 'otelSeleniumDone');
  element.innerHTML = 'OTELSeleniumDone';
  window.setTimeout(() => {
    document.body.appendChild(element);
  }, 1000);
}

window.otel = Object.assign({}, window.otel, {
  JSONSafeStringify: JSONSafeStringify,
  OTELSeleniumDone: OTELSeleniumDone,
});
