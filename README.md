# Company website

## Run it locally
Browsers block reading the CSV when you double-click index.html. Use a small local server instead:
    python -m http.server 8000
then open http://localhost:8000 (or use the VS Code "Live Server" extension).

## Update production figures
Replace `data/production.csv` and refresh the page. Required columns: `date,site,production`
(date format YYYY-MM-DD). If your column names differ, edit `COLUMNS` at the top of `js/production.js`.
Remove the date column entirely if you don't need date filtering.

## Change logins
Edit the `USERS` list at the top of `js/login.js`. This is prototype-level login only:
passwords are visible to anyone who views the site's source, so don't put sensitive data behind it.

Username: admin@company.com / Password: change-me
Username: staff / Password: production2026

## Deploy
Upload the whole folder to GitHub Pages, Netlify or Vercel. No build step needed.

CHecking
