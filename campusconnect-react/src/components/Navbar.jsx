import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/teammates', label: 'Find Teammates' },
  { to: '/hackathons', label: 'Hackathons' },
  { to: '/project', label: 'Projects' },
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/mentorship', label: 'Mentorship' },
  { to: '/resources', label: 'Resources' },
  { to: '/qa', label: 'Q&A' },
]

export default function Navbar({ onHero = false }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    setOpen(false)
    navigate('/login')
  }

  return (
    <nav className={`site-nav${onHero ? ' on-hero' : ''}`}>
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-mark">CC</span>
        CampusConnect
      </Link>

      <div className={`nav-links${open ? ' open' : ''}`}>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/ai-assistant" onClick={() => setOpen(false)}>AI Assistant</NavLink>

        {user ? (
          <>
            <Link to="/dashboard" className="nav-user" onClick={() => setOpen(false)}>
              {user.name ? user.name.split(' ')[0] : 'Dashboard'}
            </Link>
            <button type="button" className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
        )}
      </div>

      <button
        type="button"
        className="menu-toggle"
        aria-label="Toggle navigation menu"
        onClick={() => setOpen((o) => !o)}
      >
        ☰
      </button>
    </nav>
  )
}
