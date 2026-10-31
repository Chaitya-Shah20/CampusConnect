const API = '/api';

async function api(path, options = {}) {
  const response = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toast(message, type = 'info') {
  const existing = document.querySelector('.toast-notice');
  if (existing) existing.remove();

  const notice = document.createElement('div');
  notice.className = 'toast-notice';
  const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
  notice.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  document.body.appendChild(notice);

  setTimeout(() => {
    notice.style.transition = 'all 0.3s ease';
    notice.style.opacity = '0';
    notice.style.transform = 'translateY(20px)';
    setTimeout(() => notice.remove(), 300);
  }, 3500);
}

function showMessage(message, type = 'info') {
  const node = document.querySelector('[data-message]');
  if (node) {
    node.textContent = message;
    node.className = `message ${type}`;
    node.style.display = message ? 'block' : 'none';
  }
}

function setUser(user) {
  if (!user) return;
  document.querySelectorAll('[data-user-name]').forEach(node => node.textContent = user.name);
  document.querySelectorAll('[data-user-college]').forEach(node => node.textContent = user.college);
  document.querySelectorAll('[data-user-role]').forEach(node => node.textContent = user.role);
  document.querySelectorAll('[data-auth-only]').forEach(node => node.hidden = false);
}

async function loadUser() {
  try {
    const data = await api('/auth/me');
    setUser(data.user);
    return data.user;
  } catch {
    return null;
  }
}

function wireMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-nav-links]');
  if (toggle && menu) {
    toggle.onclick = () => menu.classList.toggle('open');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  wireMenu();
  document.querySelectorAll('[data-logout]').forEach(button => {
    button.addEventListener('click', async () => {
      await api('/auth/logout', { method: 'POST' });
      window.location.href = 'login.html';
    });
  });
});
