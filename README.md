# Kairos Company Website

Static company website for Kairos — production automation and reporting for the agricultural feed industry.

## Run it locally

Browsers block reading the CSV when you open `index.html` directly from the file system. Use a local server instead:

```bash
python -m http.server 8000
```

Then open http://localhost:8000

(Alternatively use the VS Code "Live Server" extension.)

## Pages

- **Home** (`index.html`) — Hero and overview
- **Systems** (`systems.html`) — Control, electrical, networks and vision systems
- **How Automill Works** (`how-automill-works.html`) — End-to-end feed mill process
- **Projects** (`projects.html`) — Example project cards
- **Production Reports** (`production.html`) — Live dashboard driven by CSV data
- **About** (`about.html`) — Company story and client sites
- **Contact** (`contact.html`) — Address, hours and contact form

## Update production figures

Replace `data/production.csv` and refresh the page.

**Required columns:** `date,site,production`  
(date format: `YYYY-MM-DD`)

If your column names differ, edit the `COLUMNS` object at the top of `js/production.js`.  
Remove the date column entirely if you do not need date filtering.

## Test logins

Edit the `USERS` list at the top of `js/login.js` to change accounts.

This is prototype-level login only — passwords are visible in the source, so do not put sensitive data behind it.

| Username              | Password        |
|-----------------------|-----------------|
| admin@company.com     | change-me       |
| staff                 | production2026  |

## Deploy

Upload the whole folder to GitHub Pages, Netlify or Vercel. No build step is required.
