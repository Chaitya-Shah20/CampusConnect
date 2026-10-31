import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { api } from '../api'

const CATEGORIES = ['Academics', 'Projects', 'Hackathons', 'Campus Life', 'Career', 'Technology']

export default function QA() {
  const [questions, setQuestions] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState(null)

  async function load() {
    try {
      const data = await api('/questions')
      setQuestions(data.questions || [])
    } catch (e) {
      setQuestions([])
      setLoadError('Log in to join Q&A.')
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    try {
      await api('/questions', { method: 'POST', body: JSON.stringify({ title, category, description }) })
      setTitle('')
      setDescription('')
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
            <p className="eyebrow">ASK THE CAMPUS</p>
            <h1>Campus Q&amp;A</h1>
            <p className="lede">Practical answers from people who have been there.</p>
          </div>
          <button className="button" onClick={() => setFormOpen((o) => !o)}>Ask a question</button>
        </div>

        {formOpen && (
          <form className="panel form-panel" onSubmit={handleSubmit}>
            <h2>Start a conversation</h2>
            <label>
              Question title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Description
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>
            <button className="button" type="submit">Post question</button>
            {message && <p className={message.type === 'error' ? 'error-message' : 'success-message'}>{message.text}</p>}
          </form>
        )}

        <section className="cards">
          {questions === null && <div className="panel"><h2>Loading questions...</h2></div>}
          {questions && questions.length === 0 && <div className="panel"><h2>{loadError || 'Be the first to ask.'}</h2></div>}
          {questions && questions.map((q) => (
            <article className="card" key={q._id}>
              <span className="eyebrow">{q.category}</span>
              <h2>{q.title}</h2>
              <p>{q.description}</p>
              <small>Asked by {q.author?.name || 'student'}</small>
            </article>
          ))}
        </section>
      </main>
    </AppLayout>
  )
}
