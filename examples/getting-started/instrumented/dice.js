const { trace, metrics } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

const rollCounter = meter.createCounter('dice.rolls', {
  description: 'Number of times rollTheDice is called',
});
const rollHistogram = meter.createHistogram('dice.value', {
  description: 'Distribution of dice roll outcomes (1-6)',
});
const rollsGauge = meter.createGauge('dice.rolls_last_value', {
  description: 'Last value of the rolls parameter',
});

function rollOnce() {
  return tracer.startActiveSpan('rollOnce', (span) => {
    const result = Math.floor(Math.random() * 6) + 1;
    span.setAttribute('dice.value', result);
    rollHistogram.record(result);
    span.end();
    return result;
  });
}

function rollTheDice(rolls) {
  return tracer.startActiveSpan('rollTheDice', (span) => {
    span.setAttribute('dice.rolls', rolls);
    rollCounter.add(1);
    rollsGauge.record(rolls);

    if (!Number.isInteger(rolls) || rolls <= 0) {
      const error = new Error('rolls must be a positive integer');
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      span.end();
      throw error;
    }

    let result;
    if (rolls === 1) {
      result = rollOnce();
    } else {
      result = [];
      for (let i = 0; i < rolls; i++) {
        result.push(rollOnce());
      }
    }

    span.end();
    return result;
  });
}

module.exports = { rollTheDice };
