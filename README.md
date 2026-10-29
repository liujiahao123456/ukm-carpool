# UKM Carpool

Local S1 foundation and static Figma previews for UKM Carpool. Ten screens are available; four are pending access to their Figma design context. All controls are visual only and do not submit data.

Install Node.js 24 LTS, then run `npm install` and `npm start` in this folder.
Visit http://localhost:3000/ for the static sign-in design and http://localhost:3000/screens.html for the screen catalogue. The original environment check is at http://localhost:3000/s1-health.html, and the API is at http://localhost:3000/api/health.

Run the health test with `npm test`.

The S1 migration and fictional seed data are in `database/`; the design and verification requirements are in `docs/s1-database.md`. XAMPP uses MariaDB, which is compatible with much of MySQL but is a different database engine. Booking and feedback tables and carpool features belong to later sprints.

## Local database setup

Start the database in XAMPP. The default connection uses `127.0.0.1:3306`, database `ukm_carpool_s1`, and user `root` with an empty password. These defaults are for local development only. Override them using the shell variables in `.env.example`; that file is an example and is not loaded automatically. Never commit real passwords.

Run `npm run db:init` once to create a new database and apply the migration and fictional seed data. It refuses to overwrite an existing database. Run `npm run db:verify` to create a separate randomly named temporary database, test the constraints and two connections, and remove only that temporary database. Then start the app with `npm start` and check `/api/db-health` or the local environment page.

The project-local Node runtime is under `.local/node-v24.22.1-win-x64` on this machine. For example, in PowerShell from this folder, run `& '.\.local\node-v24.22.1-win-x64\node.exe' index.js` to start the app, or run `& '.\.local\node-v24.22.1-win-x64\node.exe' scripts\verify-db.js` to repeat database verification. For a fresh checkout, install Node.js and run `npm install`; `.local`, `node_modules`, and credentials are ignored by Git.
