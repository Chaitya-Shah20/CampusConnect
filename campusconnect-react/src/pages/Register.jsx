import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const COURSES = ['B.Tech', 'BCA', 'BBA', 'MCA', 'M.Tech', 'Other']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', college: '', course: '', year: '', skills: '', interests: '',
  })
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(form) })
      if (data && data.user) setUser(data.user)
      navigate('/dashboard')
    } catch (error) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <Navbar onHero />
      <div className="box center">
        <h1>CampusConnect</h1>
        <p className="message">Connect. Collaborate. Grow.</p>

        <h2>Create Your Account</h2>
        <p className="message">Join your campus community today.</p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input type="text" value={form.name} onChange={update('name')} placeholder="Enter your full name" required />

          <label>Email</label>
          <input type="email" value={form.email} onChange={update('email')} placeholder="Enter your email" required />

          <label>Password</label>
          <input type="password" value={form.password} onChange={update('password')} placeholder="Create a password" required />

          <label>College / University</label>
          <input type="text" value={form.college} onChange={update('college')} placeholder="Your college or university" required />

          <label>Course</label>
          <select value={form.course} onChange={update('course')} required>
            <option value="">Select your course</option>
            {COURSES.map((c) => <option key={c}>{c}</option>)}
          </select>

          <label>Year</label>
          <select value={form.year} onChange={update('year')} required>
            <option value="">Select your year</option>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>

          <label>Skills</label>
          <input type="text" value={form.skills} onChange={update('skills')} placeholder="Python, Web Development, UI/UX" />

          <label>Interests</label>
          <input type="text" value={form.interests} onChange={update('interests')} placeholder="Startups, music, sustainability" />

          {message && <p className={message.type === 'error' ? 'error-message' : 'success-message'}>{message.text}</p>}

          <button type="submit" className="button" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login"><b>Login</b></Link>
        </p>

        <Link to="/">← Back to Home</Link>
      </div>
    </div>
  )
}
