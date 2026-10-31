import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null) // { text, type: 'error' | 'success' }
  const [submitting, setSubmitting] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setUser(data.user)
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
        <p className="tagline message">Connect. Collaborate. Grow.</p>

        <h2>Welcome Back</h2>
        <p className="message">Login to connect with your campus community.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />

          {message && <p className={message.type === 'error' ? 'error-message' : 'success-message'}>{message.text}</p>}

          <button type="submit" className="button" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p>
          Don&apos;t have an account? <Link to="/register">Create Account</Link>
        </p>

        <Link to="/" className="home">← Back to Home</Link>
      </div>
    </div>
  )
}
