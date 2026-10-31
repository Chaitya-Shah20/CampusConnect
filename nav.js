document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.getElementById('app-nav');
  if (!mount) return;

  const user = await loadUser();
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  // If user is not logged in
  if (!user) {
    const protectedPages = ['dashboard.html', 'admin-dashboard.html', 'profile.html'];
    if (protectedPages.includes(currentPath)) {
      window.location.href = 'login.html';
      return;
    }

    // Guest navigation bar for public browsing
    mount.innerHTML = `
      <nav class="site-nav">
        <a class="brand" href="index.html">
          <span class="brand-mark">AU</span>
          <div class="brand-text-wrap">
            <span class="brand-title">CampusConnect</span>
            <span class="brand-sub">Adani University</span>
          </div>
        </a>
        <button class="menu-toggle" data-menu-toggle aria-label="Open menu">☰</button>
        <div class="nav-links" data-nav-links>
          <a href="index.html" class="${currentPath === 'index.html' ? 'active' : ''}">🏠 Home</a>
          <a href="hackathons.html" class="${currentPath === 'hackathons.html' ? 'active' : ''}">⚡ Hackathons</a>
          <a href="events.html" class="${currentPath === 'events.html' ? 'active' : ''}">🎉 Events</a>
          <a href="project.html" class="${currentPath === 'project.html' ? 'active' : ''}">🚀 Projects</a>
          <a href="opportunities.html" class="${currentPath === 'opportunities.html' ? 'active' : ''}">💼 Opportunities</a>
          <a href="resources.html" class="${currentPath === 'resources.html' ? 'active' : ''}">📚 Resources</a>
          <a href="login.html" class="button" style="padding: 6px 14px; margin: 0; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #fff !important; font-weight: 600;">🔑 Login</a>
          <a href="register.html" class="button" style="padding: 6px 14px; margin: 0; background: #d7f05a; color: #0f172a !important; font-weight: 700;">Get Started</a>
        </div>
      </nav>
    `;
    wireMenu();
    return;
  }

  // User is authenticated
  let navLinksHtml = '';
  if (user.role === 'admin') {
    navLinksHtml = `
      <a href="admin-dashboard.html" class="${currentPath === 'admin-dashboard.html' ? 'active' : ''}">🛡️ Admin CMS</a>
      <a href="dashboard.html" class="${currentPath === 'dashboard.html' ? 'active' : ''}">🎓 Student View</a>
      <a href="hackathons.html" class="${currentPath === 'hackathons.html' ? 'active' : ''}">⚡ Hackathons</a>
      <a href="events.html" class="${currentPath === 'events.html' ? 'active' : ''}">🎉 Events</a>
      <a href="project.html" class="${currentPath === 'project.html' ? 'active' : ''}">🚀 Projects</a>
      <a href="opportunities.html" class="${currentPath === 'opportunities.html' ? 'active' : ''}">💼 Opportunities</a>
      <a href="teammates.html" class="${currentPath === 'teammates.html' ? 'active' : ''}">👥 Students</a>
      <a href="resources.html" class="${currentPath === 'resources.html' ? 'active' : ''}">📚 Resources</a>
      <a href="/api/database/export" download="adani_university_database.json" style="color:#d7f05a !important; font-weight:600;">📥 DB Export</a>
    `;
  } else {
    navLinksHtml = `
      <a href="dashboard.html" class="${currentPath === 'dashboard.html' ? 'active' : ''}">📊 Dashboard</a>
      <a href="hackathons.html" class="${currentPath === 'hackathons.html' ? 'active' : ''}">⚡ Hackathons</a>
      <a href="events.html" class="${currentPath === 'events.html' ? 'active' : ''}">🎉 Events</a>
      <a href="project.html" class="${currentPath === 'project.html' ? 'active' : ''}">🚀 Projects</a>
      <a href="teammates.html" class="${currentPath === 'teammates.html' ? 'active' : ''}">👥 Find Teammates</a>
      <a href="opportunities.html" class="${currentPath === 'opportunities.html' ? 'active' : ''}">💼 Opportunities</a>
      <a href="mentorship.html" class="${currentPath === 'mentorship.html' ? 'active' : ''}">🎓 Mentorship</a>
      <a href="resources.html" class="${currentPath === 'resources.html' ? 'active' : ''}">📚 Resources</a>
      <a href="profile.html" class="${currentPath === 'profile.html' ? 'active' : ''}">👤 Profile</a>
    `;
  }

  let roleBadgeHtml = '';
  if (user.role === 'admin') {
    roleBadgeHtml = '<span class="role-badge role-badge-admin">🛡️ Admin</span>';
  } else if (user.verificationStatus === 'approved') {
    roleBadgeHtml = '<span class="role-badge role-badge-verified">✅ Verified</span>';
  } else if (user.verificationStatus === 'rejected') {
    roleBadgeHtml = '<span class="role-badge role-badge-pending" style="color:#f87171; border-color:rgba(248,113,113,0.4); background:rgba(248,113,113,0.15);">❌ Rejected</span>';
  } else {
    roleBadgeHtml = '<span class="role-badge role-badge-pending">⏳ Pending</span>';
  }

  mount.innerHTML = `
    <nav class="site-nav">
      <a class="brand" href="index.html">
        <span class="brand-mark">AU</span>
        <div class="brand-text-wrap">
          <span class="brand-title">CampusConnect</span>
          <span class="brand-sub">Adani University</span>
        </div>
      </a>
      <button class="menu-toggle" data-menu-toggle aria-label="Open menu">☰</button>
      <div class="nav-links" data-nav-links>
        ${navLinksHtml}
        <div class="nav-user-menu">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="nav-user-name" data-user-name title="${user.name || 'User'}">${user.name || 'User'}</span>
            ${roleBadgeHtml}
          </div>
          <button class="nav-logout" data-logout>Logout</button>
        </div>
      </div>
    </nav>
  `;

  wireMenu();
  document.querySelectorAll('[data-logout]').forEach(button => {
    button.addEventListener('click', async () => {
      await api('/auth/logout', { method: 'POST' });
      window.location.href = 'login.html';
    });
  });
});
