const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../index');

test('the Figma preview and health endpoint are served together', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Your campus/);
  const healthPage = await fetch(`${base}/s1-health.html`);
  assert.equal(healthPage.status, 200);
  assert.match(await healthPage.text(), /S1 development environment check/);
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { message: 'Backend is working' });
});
