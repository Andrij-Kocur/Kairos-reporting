/* ==========================================================
   LOGIN (prototype only)
   Usernames and passwords are stored in this file, so anyone
   who views the site's source can read them. This is fine for
   a simple prototype but is NOT real security.
   Add or remove users in the list below.
   ========================================================== */
const USERS = [
  { username: "admin@company.com", password: "change-me" },
  { username: "staff", password: "production2026" }
];

const Auth = {
  key: "loggedInUser",

  isLoggedIn() { return sessionStorage.getItem(this.key) !== null; },
  currentUser() { return sessionStorage.getItem(this.key); },

  // Returns true if the details match a user in the list
  login(username, password) {
    const match = USERS.find(u =>
      u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (match) sessionStorage.setItem(this.key, match.username);
    return Boolean(match);
  },

  logout() { sessionStorage.removeItem(this.key); }
};
