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

// Logo ribbon: scrolls slowly by itself and can also be scrolled by hand
// (swipe, drag with the mouse, shift + mouse wheel, or the arrow buttons)
(function () {
  const ribbon = document.querySelector(".logo-ribbon");
  if (!ribbon) return;
  const scroller = ribbon.querySelector(".logo-scroller");
  const track = ribbon.querySelector(".logo-track");

  // Repeat the logos twice more so the ribbon can loop in either direction
  const originals = [...track.children];
  for (let n = 0; n < 2; n++) {
    originals.forEach(tile => {
      const copy = tile.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelector("img").alt = "";
      track.appendChild(copy);
    });
  }

  const SPEED = 30;   // pixels per second. Raise this number to move faster.
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let setWidth = track.offsetWidth / 3;
  let pos = setWidth;
  let paused = false, resumeTimer, last = performance.now();
  scroller.scrollLeft = pos;

  const pause = () => { paused = true; clearTimeout(resumeTimer); };
  const resume = delay => { clearTimeout(resumeTimer); resumeTimer = setTimeout(() => { paused = false; }, delay); };
  const wrap = () => {            // jump back by one set of logos: it looks identical
    if (pos > setWidth * 1.75) pos -= setWidth;
    else if (pos < setWidth * 0.25) pos += setWidth;
  };

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!paused && !reduceMotion) {
      pos += SPEED * dt;
      wrap();
      scroller.scrollLeft = pos;
    } else {
      pos = scroller.scrollLeft;
      const before = pos;
      wrap();
      if (pos !== before) scroller.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  ribbon.addEventListener("mouseenter", pause);
  ribbon.addEventListener("mouseleave", () => resume(300));
  ribbon.addEventListener("touchstart", pause, { passive: true });
  ribbon.addEventListener("touchend", () => resume(2500));
  ribbon.addEventListener("focusin", pause);
  ribbon.addEventListener("focusout", () => resume(1500));
  scroller.addEventListener("wheel", () => { pause(); resume(2500); }, { passive: true });
  window.addEventListener("resize", () => { setWidth = track.offsetWidth / 3; });

  // Drag with the mouse
  let down = false, startX = 0, startLeft = 0;
  scroller.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse") return;
    down = true; startX = e.clientX; startLeft = scroller.scrollLeft;
    scroller.classList.add("dragging");
  });
  window.addEventListener("pointermove", e => { if (down) scroller.scrollLeft = startLeft - (e.clientX - startX); });
  window.addEventListener("pointerup", () => { down = false; scroller.classList.remove("dragging"); });

  // Arrow buttons
  const step = 460;
  ribbon.querySelector(".prev").addEventListener("click", () => { pause(); scroller.scrollBy({ left: -step, behavior: "smooth" }); resume(3000); });
  ribbon.querySelector(".next").addEventListener("click", () => { pause(); scroller.scrollBy({ left: step, behavior: "smooth" }); resume(3000); });
})();
