import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { api } from '../api'

export default function Hackathons() {
  const [hackathons, setHackathons] = useState(null) // null = loading
  const [error, setError] = useState(null)

  async function load() {
    setError(null)
    try {
      const data = await api('/hackathons')
      setHackathons(data.hackathons || [])
    } catch (e) {
      setHackathons([])
      setError('Log in to browse hackathons.')
    }
  }

  useEffect(() => { load() }, [])

  async function join(id) {
    try {
      await api(`/hackathons/${id}/join`, { method: 'POST' })
      alert('You joined the hackathon team.')
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <AppLayout>
      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">BUILD TOGETHER</p>
            <h1>Hackathons</h1>
            <p className="lede">Find a challenge, meet your team and make something useful.</p>
          </div>
        </div>

        <section className="cards">
          {hackathons === null && <div className="panel"><h2>Loading hackathons...</h2></div>}
          {hackathons && hackathons.length === 0 && (
            <div className="panel"><h2>{error || 'No hackathons posted yet.'}</h2></div>
          )}
          {hackathons && hackathons.map((h) => (
            <article className="card" key={h._id}>
              <span className="eyebrow">{h.date || 'UPCOMING'}</span>
              <h2>{h.name}</h2>
              <p>{h.description || 'Bring your curiosity and build with other students.'}</p>
              <p><b>{h.location || 'Campus'}</b> · {h.members?.length || 0}/{h.teamSize || 5} members</p>
              <button className="button" onClick={() => join(h._id)}>Request to join</button>
            </article>
          ))}
        </section>
      </main>
    </AppLayout>
  )
}
