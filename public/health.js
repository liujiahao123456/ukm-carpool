'use strict';

const status = document.getElementById('status');
fetch('/api/health')
  .then((response) => {
    if (!response.ok) throw new Error('Backend health check failed');
    return response.json();
  })
  .then((result) => { status.textContent = result.message; })
  .catch(() => { status.textContent = 'The backend could not be reached.'; });

const databaseStatus = document.getElementById('database-status');
fetch('/api/db-health')
  .then((response) => {
    if (!response.ok) throw new Error('Database check failed');
    return response.json();
  })
  .then(() => { databaseStatus.textContent = 'Database connected.'; })
  .catch(() => { databaseStatus.textContent = 'Database unavailable. Check the local database and configuration.'; });
