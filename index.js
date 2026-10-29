const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/health', (_request, response) => {
  response.json({ message: 'Backend is working' });
});

app.listen(port, () => {
  console.log(`Backend is listening on port ${port}`);
});

