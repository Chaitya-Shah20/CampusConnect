const API = '/api';
async function api(path, options = {}) { const response = await fetch(API + path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, credentials: 'include', ...options }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Request failed'); return data; }
function showMessage(message, type = 'info') { const node = document.querySelector('[data-message]'); if (node) { node.textContent = message; node.className = `message ${type}`; } }
function setUser(user) { document.querySelectorAll('[data-user-name]').forEach(node => node.textContent = user.name); document.querySelectorAll('[data-auth-only]').forEach(node => node.hidden = false); }
async function loadUser() { try { const data = await api('/auth/me'); setUser(data.user); return data.user; } catch { return null; } }
function wireMenu() { const toggle = document.querySelector('[data-menu-toggle]'); const menu = document.querySelector('[data-nav-links]'); if (toggle && menu) toggle.addEventListener('click', () => menu.classList.toggle('open')); }
document.addEventListener('DOMContentLoaded', () => { wireMenu(); document.querySelectorAll('[data-logout]').forEach(button => button.addEventListener('click', async () => { await api('/auth/logout', { method: 'POST' }); window.location.href = 'index.html'; })); loadUser(); });
