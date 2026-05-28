function rollOnce() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollTheDice(rolls) {
  if (!Number.isInteger(rolls) || rolls <= 0) {
    throw new Error('rolls must be a positive integer');
  }

  if (rolls === 1) {
    return rollOnce();
  }

  const results = [];
  for (let i = 0; i < rolls; i++) {
    results.push(rollOnce());
  }

  return results;
}

module.exports = { rollTheDice };
