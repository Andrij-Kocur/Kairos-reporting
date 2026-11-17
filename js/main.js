/* Builds the header and navigation on every page, and handles login/logout. */

const PAGES = [
  { file: "index.html",    label: "Home" },
  { file: "about.html",    label: "About Us" },
  { file: "systems.html",  label: "Systems" },
  { file: "how-automill-works.html", label: "How Automill Works" },
  { file: "contact.html",  label: "Contact Us" }
];
const PRODUCTION_PAGE = { file: "production.html", label: "Production Reports" };

function buildHeader() {
  const current = location.pathname.split("/").pop() || "index.html";
  const loggedIn = Auth.isLoggedIn();

  // The Production Reports tab is only added when someone is logged in
  const pages = loggedIn ? [...PAGES, PRODUCTION_PAGE] : PAGES;
  const links = pages.map(p =>
    `<a href="${p.file}" class="${p.file === current ? "active" : ""}">${p.label}</a>`).join("");

  const account = loggedIn
    ? `<span class="user">${Auth.currentUser()}</span><button class="btn btn-outline btn-sm" id="logout-btn">Log out</button>`
    : `<button class="btn btn-accent btn-sm" id="login-btn">Log in</button>`;

  document.getElementById("site-header").innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="logo" href="index.html"><img src="img/kairos-logo.webp" alt="Kairos" height="40"></a>
        <nav class="nav">${links}${account}</nav>
      </div>
    </header>
    <dialog id="login-dialog">
      <form id="login-form" class="login-form">
        <h2>Log in</h2>
        <label>Username or email <input id="login-user" autocomplete="username" required></label>
        <label>Password <input id="login-pass" type="password" autocomplete="current-password" required></label>
        <p class="error" id="login-error"></p>
        <div class="dialog-actions">
          <button class="btn btn-accent" type="submit">Log in</button>
          <button class="btn btn-outline-dark" type="button" id="login-cancel">Cancel</button>
        </div>
      </form>
    </dialog>`;
}

function wireLogin() {
  const dialog = document.getElementById("login-dialog");
  const error = document.getElementById("login-error");

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", () => dialog.showModal());

  document.getElementById("login-cancel").addEventListener("click", () => dialog.close());

  document.getElementById("login-form").addEventListener("submit", event => {
    event.preventDefault();
    const ok = Auth.login(
      document.getElementById("login-user").value,
      document.getElementById("login-pass").value);
    if (ok) {
      location.href = "production.html";   // go straight to the reports after login
    } else {
      error.textContent = "Username or password is incorrect.";
    }
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    Auth.logout();
    location.href = "index.html";
  });
}

// Contact form: opens the visitor's email program (no server needed)
function wireContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const d = new FormData(form);
    const body = `${d.get("message")}\n\nFrom: ${d.get("name")} (${d.get("email")})`;
    location.href = "mailto:info@yourcompany.com?subject=" +
      encodeURIComponent("Website enquiry") + "&body=" + encodeURIComponent(body);
  });
}

buildHeader();
wireLogin();
wireContactForm();
document.getElementById("year").textContent = new Date().getFullYear();

// Logo strip: repeat the logos twice more so the slow scroll loops without a gap
document.querySelectorAll(".logo-track").forEach(track => {
  const originals = [...track.children];
  for (let n = 0; n < 2; n++) {
    originals.forEach(img => {
      const copy = img.cloneNode(true);
      copy.alt = "";
      copy.setAttribute("aria-hidden", "true");
      track.appendChild(copy);
    });
  }
});
