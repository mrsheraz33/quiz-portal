// frontend/js/config.js
const API_BASE = "https://quiz-portal-t2fe.onrender.com/api";

// Token helpers
function saveToken(role, token) {
  localStorage.setItem(`${role}_token`, token);
}

function getToken(role) {
  return localStorage.getItem(`${role}_token`);
}

function saveUser(role, user) {
  localStorage.setItem(`${role}_user`, JSON.stringify(user));
}

function getUser(role) {
  const u = localStorage.getItem(`${role}_user`);
  return u ? JSON.parse(u) : null;
}

function logout(role) {
  localStorage.removeItem(`${role}_token`);
  localStorage.removeItem(`${role}_user`);
  window.location.href = role === "teacher" ? "login.html" : "login.html";
}

// API call helper
async function apiCall(endpoint, method = "GET", body = null, role = null) {
  const headers = { "Content-Type": "application/json" };

  if (role) {
    const token = getToken(role);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

// Show alert
function showAlert(id, message, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove("show"), 4000);
}