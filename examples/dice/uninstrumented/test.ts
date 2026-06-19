import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';

test('app starts and responds to /rolldice', async () => {
  const port = 18000 + Math.floor(Math.random() * 1000);
  const app: ChildProcess = spawn('node', ['build/app.js'], {
    env: { ...process.env, APPLICATION_PORT: String(port) },
    stdio: 'pipe',
  });

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('App failed to start within 10s')), 10_000);
      app.stdout?.on('data', (chunk: Buffer) => {
        if (chunk.toString().includes('Listening')) {
          clearTimeout(timeout);
          resolve();
        }
      });
      app.on('exit', (code) => {
        clearTimeout(timeout);
        reject(new Error(`App exited with code ${code}`));
      });
    });

    const res = await fetch(`http://127.0.0.1:${port}/rolldice`);
    assert.equal(res.status, 200);
  } finally {
    app.kill();
  }
});
