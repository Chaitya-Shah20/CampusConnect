import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { api } from '../api'

const CATEGORIES = ['Notes', 'Study Material', 'Previous Papers', 'Tutorials', 'Useful Links']

export default function Resources() {
  const [resources, setResources] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState(null)

  async function load() {
    try {
      const data = await api('/resources')
      setResources(data.resources || [])
    } catch (e) {
      setResources([])
      setLoadError('Log in to view resources.')
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    try {
      await api('/resources', { method: 'POST', body: JSON.stringify({ title, subject, category, url }) })
      setTitle(''); setSubject(''); setUrl('')
      setFormOpen(false)
      load()
    } catch (error) {
      setMessage({ text: error.message, type: 'error' })
    }
  }

  return (
    <AppLayout>
      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">SHARED KNOWLEDGE</p>
            <h1>Campus resources</h1>
            <p className="lede">Notes, papers and links shared by students.</p>
          </div>
          <button className="button" onClick={() => setFormOpen((o) => !o)}>Upload resource</button>
        </div>

        {formOpen && (
          <form className="panel form-panel inline-form" onSubmit={handleSubmit}>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Subject
              <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Link
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </label>
            <button className="button" type="submit">Publish</button>
            {message && <p className={message.type === 'error' ? 'error-message' : 'success-message'}>{message.text}</p>}
          </form>
        )}

        <section className="cards resource-grid">
          {resources === null && <div className="panel"><h2>Loading resources...</h2></div>}
          {resources && resources.length === 0 && <div className="panel"><h2>{loadError || 'No resources yet'}</h2></div>}
          {resources && resources.map((r) => (
            <article className="resource-card" key={r._id}>
              <span className="eyebrow">{r.category || 'RESOURCE'}</span>
              <h2>{r.title}</h2>
              <p>{r.subject}</p>
              <small>Shared by {r.uploadedBy?.name || 'student'}</small>
              <a className="text-link" href={r.url || '#'} target="_blank" rel="noreferrer">Download resource ↗</a>
            </article>
          ))}
        </section>
      </main>
    </AppLayout>
  )
}
