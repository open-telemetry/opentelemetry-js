import { setupOpenTelemetry } from './opentelemetry.js';
import { logs } from '@opentelemetry/api-logs';

// Setup SDK and register with API, then obtain logger from API.
setupOpenTelemetry();
const logger = logs.getLogger('bundle-test-webpack');

window.addEventListener('load', () => {
  console.log('loaded');
  const emitEventButton = document.getElementById('emit-event-button');
  emitEventButton.addEventListener('click', () => {
    console.log('clicked');
    logger.emit({
      body: 'test-event-body',
      eventName: 'custom.event',
    });
  });
});
