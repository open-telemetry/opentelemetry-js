/**
 * Integration test to verify that relative URLs now work with OTLP HTTP exporters
 * This addresses the customer issue: "Relative logging-url ('./api/logs) no longer supported"
 */

const assert = require('assert');

// Test the configuration validation directly
const { mergeOtlpHttpConfigurationWithDefaults } = require('../src/configuration/otlp-http-configuration');

console.log('Testing relative URL support in OTLP HTTP configuration...\n');

// Create a minimal test configuration
const testDefaults = {
  url: 'http://default.example.test',
  timeoutMillis: 1,
  compression: 'none',
  concurrencyLimit: 2,
  headers: () => ({ 'User-Agent': 'default-user-agent' }),
  agentOptions: { keepAlive: true },
};

// Test cases that should work (the customer's use case)
const validRelativeUrls = [
  './api/logs',
  '../logs',
  '/api/logs',
  'api/logs',
  './v1/logs'
];

console.log('✅ Testing valid relative URLs:');
validRelativeUrls.forEach(url => {
  try {
    const config = mergeOtlpHttpConfigurationWithDefaults(
      { url },
      {},
      testDefaults
    );
    console.log(`  ✓ "${url}" -> accepted (resolved to: ${config.url})`);
  } catch (error) {
    console.log(`  ✗ "${url}" -> rejected: ${error.message}`);
    process.exit(1);
  }
});

// Test cases that should still be rejected (invalid URLs)
const invalidUrls = [
  'this is not a URL',
  'http://',
  'https://[invalid'
];

console.log('\n✅ Testing invalid URLs (should be rejected):');
invalidUrls.forEach(url => {
  try {
    mergeOtlpHttpConfigurationWithDefaults(
      { url },
      {},
      testDefaults
    );
    console.log(`  ✗ "${url}" -> incorrectly accepted (should have been rejected)`);
    process.exit(1);
  } catch (error) {
    console.log(`  ✓ "${url}" -> correctly rejected: ${error.message}`);
  }
});

// Test that valid absolute URLs still work
const validAbsoluteUrls = [
  'http://localhost:4318/v1/logs',
  'https://collector.example.com/logs'
];

console.log('\n✅ Testing valid absolute URLs:');
validAbsoluteUrls.forEach(url => {
  try {
    const config = mergeOtlpHttpConfigurationWithDefaults(
      { url },
      {},
      testDefaults
    );
    console.log(`  ✓ "${url}" -> accepted`);
  } catch (error) {
    console.log(`  ✗ "${url}" -> rejected: ${error.message}`);
    process.exit(1);
  }
});

console.log('\n🎉 All tests passed! The customer issue has been resolved.');
console.log('\nCustomers can now use relative URLs like "./api/logs" in their OTLP HTTP exporters.');
