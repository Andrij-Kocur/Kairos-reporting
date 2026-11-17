/* Production Reports dashboard.
   Reads data/production.csv and builds everything from it. */

/* ---------- Settings: match these to your CSV column headings ---------- */
const CSV_FILE = "data/production.csv";
const COLUMNS = { date: "date", site: "site", production: "production" };
const UNIT = "t";   // shown after numbers, e.g. "t" for tonnes
/* ------------------------------------------------------------------------ */

// Block the page if not logged in
if (!Auth.isLoggedIn()) location.replace("index.html");

const COLORS = ["#3b6a8f", "#f0a202", "#2e8b6e", "#b5483c", "#7a5ea8", "#5d6873", "#c97b2a", "#2b9db3"];
let allRows = [];
let hasDates = false;
const charts = {};

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString("en-ZA", { maximumFractionDigits: 1 }) + " " + UNIT;

/* ---------- Read and parse the CSV ---------- */
// Splits one CSV line into cells, handling "quoted, values"
function splitLine(line) {
  const cells = []; let cell = ""; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (quoted && line[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (ch === "," && !quoted) { cells.push(cell.trim()); cell = ""; }
    else cell += ch;
  }
  cells.push(cell.trim());
  return cells;
}

function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(l => l.trim() !== "");
  const headers = splitLine(lines[0]).map(h => h.toLowerCase());
  const col = name => headers.indexOf(name.toLowerCase());
  const iSite = col(COLUMNS.site), iProd = col(COLUMNS.production), iDate = col(COLUMNS.date);

  if (iSite < 0 || iProd < 0) {
    throw new Error(`The CSV must have "${COLUMNS.site}" and "${COLUMNS.production}" columns.`);
  }
  hasDates = iDate >= 0;

  return lines.slice(1).map(line => {
    const c = splitLine(line);
    return { date: hasDates ? c[iDate] : "", site: c[iSite], production: parseFloat(c[iProd]) };
  }).filter(r => r.site && !isNaN(r.production));
}

async function loadData() {
  try {
    // "?v=" + time stops the browser showing an old copy of the CSV
    const response = await fetch(`${CSV_FILE}?v=${Date.now()}`);
    if (!response.ok) throw new Error(`Could not find ${CSV_FILE}.`);
    allRows = parseCSV(await response.text());
    if (allRows.length === 0) throw new Error("The CSV file has no data rows.");
    setupFilters();
    render();
    $("status").hidden = true;
    $("dashboard").hidden = false;
  } catch (err) {
    $("status").textContent = "Could not load production data: " + err.message +
      " (If you opened the file directly, run a local web server instead. See README.)";
    $("status").classList.add("error-box");
  }
}

/* ---------- Date filter ---------- */
function setupFilters() {
  if (!hasDates) { $("date-filter").hidden = true; $("trend-panel").hidden = true; return; }
  const dates = allRows.map(r => r.date).sort();
  $("date-from").min = $("date-to").min = dates[0];
  $("date-from").max = $("date-to").max = dates[dates.length - 1];
  $("date-from").onchange = $("date-to").onchange = render;
  $("date-reset").onclick = () => { $("date-from").value = ""; $("date-to").value = ""; render(); };
}

function filteredRows() {
  if (!hasDates) return allRows;
  const from = $("date-from").value, to = $("date-to").value;
  return allRows.filter(r => (!from || r.date >= from) && (!to || r.date <= to));
}

/* ---------- Calculations ---------- */
function totalsBySite(rows) {
  const totals = {};
  rows.forEach(r => { totals[r.site] = (totals[r.site] || 0) + r.production; });
  return Object.entries(totals).map(([site, total]) => ({ site, total })).sort((a, b) => b.total - a.total);
}

/* ---------- Drawing ---------- */
function render() {
  const rows = filteredRows();
  const sites = totalsBySite(rows);
  const grand = sites.reduce((sum, s) => sum + s.total, 0);

  $("kpi-total").textContent = fmt(grand);
  $("kpi-sites").textContent = sites.length;
  $("kpi-top").textContent = sites.length ? sites[0].site : "–";
  $("kpi-avg").textContent = sites.length ? fmt(grand / sites.length) : "–";

  drawCharts(rows, sites);
  drawSummaryTable(sites, grand);
  drawDataTable(rows);
}

function makeChart(id, config) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart($(id), config);
}

function drawCharts(rows, sites) {
  const labels = sites.map(s => s.site);
  const colorOf = site => COLORS[labels.indexOf(site) % COLORS.length];
  const baseOptions = { responsive: true, maintainAspectRatio: false };

  makeChart("chart-sites", {
    type: "bar",
    data: { labels, datasets: [{ label: `Production (${UNIT})`, data: sites.map(s => s.total), backgroundColor: labels.map(colorOf) }] },
    options: { ...baseOptions, plugins: { legend: { display: false } } }
  });

  makeChart("chart-share", {
    type: "doughnut",
    data: { labels, datasets: [{ data: sites.map(s => s.total), backgroundColor: labels.map(colorOf) }] },
    options: { ...baseOptions, plugins: { legend: { position: "bottom" } } }
  });

  if (hasDates) {
    const dates = [...new Set(rows.map(r => r.date))].sort();
    const datasets = labels.map(site => ({
      label: site, borderColor: colorOf(site), backgroundColor: colorOf(site), tension: .2, pointRadius: 2,
      data: dates.map(d => rows.filter(r => r.site === site && r.date === d).reduce((s, r) => s + r.production, 0))
    }));
    makeChart("chart-trend", { type: "line", data: { labels: dates, datasets }, options: baseOptions });
  }
}

function drawSummaryTable(sites, grand) {
  const body = sites.map(s => `<tr><td>${s.site}</td><td class="num">${fmt(s.total)}</td>
    <td class="num">${grand ? (s.total / grand * 100).toFixed(1) : 0}%</td></tr>`).join("");
  $("table-summary").innerHTML = `<thead><tr><th>Site</th><th class="num">Total production</th><th class="num">Share</th></tr></thead>
    <tbody>${body}</tbody>
    <tfoot><tr><td>All sites</td><td class="num">${fmt(grand)}</td><td class="num">100%</td></tr></tfoot>`;
}

function drawDataTable(rows) {
  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date) || a.site.localeCompare(b.site));
  const dateHead = hasDates ? "<th>Date</th>" : "";
  const body = sorted.map(r => `<tr>${hasDates ? `<td>${r.date}</td>` : ""}<td>${r.site}</td>
    <td class="num">${fmt(r.production)}</td></tr>`).join("");
  $("table-data").innerHTML = `<thead><tr>${dateHead}<th>Site</th><th class="num">Production</th></tr></thead><tbody>${body}</tbody>`;
}

loadData();
