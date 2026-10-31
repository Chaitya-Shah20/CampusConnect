import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import { useRequireAuth } from '../components/ProtectedAction'

export default function Teammates() {
  const requireAuth = useRequireAuth()
  const [panel, setPanel] = useState(null)

  return (
    <AppLayout>
      <main className="page-wrap narrow">
        <div className="page-heading">
          <div>
            <p className="eyebrow">BUILD YOUR CREW</p>
            <h1>Find Teammates</h1>
            <p className="lede">Find students with the right skills for your project, hackathon or competition.</p>
          </div>
        </div>

        <section className="cards">
          <article className="card">
            <h2>Find by Skills</h2>
            <p>Search students based on their technical skills.</p>
            <button className="button" onClick={() => requireAuth(() => setPanel('search'))}>Search</button>
          </article>
          <article className="card">
            <h2>Create Team</h2>
            <p>Create your own team and invite students.</p>
            <button className="button" onClick={() => requireAuth(() => setPanel('create'))}>Create Team</button>
          </article>
          <article className="card">
            <h2>My Teams</h2>
            <p>View the teams you have joined.</p>
            <button className="button" onClick={() => requireAuth(() => setPanel('mine'))}>View Teams</button>
          </article>
        </section>

        {panel === 'search' && <div className="inline-banner">Skill search section opened.</div>}
        {panel === 'create' && <div className="inline-banner">Create Team section opened.</div>}
        {panel === 'mine' && <div className="inline-banner">Your teams will appear here.</div>}
      </main>
    </AppLayout>
  )
}
