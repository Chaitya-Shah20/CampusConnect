import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

function toList(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: '', college: '', course: '', year: '', skills: '', interests: '' })
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      college: user.college || '',
      course: user.course || '',
      year: user.year || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      interests: Array.isArray(user.interests) ? user.interests.join(', ') : (user.interests || ''),
    })
  }, [user])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      const data = await api('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          college: form.college,
          course: form.course,
          year: form.year,
          skills: form.skills,
          interests: form.interests,
        }),
      })
      setUser(data.user)
      setMessage({ text: 'Profile updated successfully.', type: 'success' })
    } catch (error) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <main className="page-wrap narrow">
          <div className="panel"><h2>Log in to view and edit your profile.</h2></div>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="page-wrap narrow">
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR PROFILE</p>
            <h1>Make your work discoverable.</h1>
          </div>
        </div>

        <section className="profile-layout">
          <div className="profile-card">
            <div className="avatar large">
              {(user.name || 'CC').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <h2>{form.name || 'Student'}</h2>
            <p>{form.course || 'Course'}</p>
            <div className="tag-list">
              {toList(form.skills).map((s) => <span className="map-chip" key={s}>{s}</span>)}
            </div>
            <a className="button" href="#edit">Edit profile</a>
          </div>

          <form className="panel form-panel" id="edit" onSubmit={handleSubmit}>
            <h2>Profile details</h2>
            <label>
              Full name
              <input value={form.name} onChange={update('name')} required />
            </label>
            <label>
              College / University
              <input value={form.college} onChange={update('college')} required />
            </label>
            <label>
              Course
              <input value={form.course} onChange={update('course')} required />
            </label>
            <label>
              Year
              <input value={form.year} onChange={update('year')} required />
            </label>
            <label>
              Skills
              <input value={form.skills} onChange={update('skills')} placeholder="Python, UI/UX, Web Development" />
            </label>
            <label>
              Interests
              <input value={form.interests} onChange={update('interests')} placeholder="Startups, climate, design" />
            </label>
            <button className="button" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
            {message && <p className={message.type === 'error' ? 'error-message' : 'success-message'}>{message.text}</p>}
          </form>
        </section>
      </main>
    </AppLayout>
  )
}
