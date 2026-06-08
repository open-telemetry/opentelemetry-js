function rollOnce(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollTheDice(rolls: number): number | number[] {
  if (!Number.isInteger(rolls) || rolls <= 0) {
    throw new Error('rolls must be a positive integer');
  }

  if (rolls === 1) {
    return rollOnce();
  }

  const results: number[] = [];
  for (let i = 0; i < rolls; i++) {
    results.push(rollOnce());
  }

  return results;
}
