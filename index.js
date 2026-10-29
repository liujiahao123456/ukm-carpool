const express = require('express');
const path = require('node:path');
const { getPool } = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

app.get('/api/health', (_request, response) => {
  response.json({ message: 'Backend is working' });
});

app.get('/api/db-health', async (_request, response) => {
  try {
    await getPool().query('SELECT 1');
    response.json({ database: 'connected' });
  } catch {
    response.status(503).json({ database: 'unavailable' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

if (require.main === module) {
  app.listen(port, host, () => {
    console.log(`Backend is listening on http://${host}:${port}`);
  });
}

module.exports = app;
