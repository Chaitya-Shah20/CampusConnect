import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import { useRequireAuth } from '../components/ProtectedAction'

export default function ProjectShowcase() {
  const requireAuth = useRequireAuth()
  const [panel, setPanel] = useState(null)

  return (
    <AppLayout>
      <main className="page-wrap narrow">
        <div className="page-heading">
          <div>
            <p className="eyebrow">SHOW WHAT YOU'VE BUILT</p>
            <h1>Project Showcase</h1>
            <p className="lede">Explore student projects and showcase your own work.</p>
          </div>
        </div>

        <section className="cards">
          <article className="card">
            <h2>Upload Project</h2>
            <p>Showcase your project to other students.</p>
            <button className="button" onClick={() => requireAuth(() => setPanel('upload'))}>Upload</button>
          </article>
          <article className="card">
            <h2>Browse Projects</h2>
            <p>Explore interesting projects made by students.</p>
            <button className="button" onClick={() => setPanel('browse')}>Browse</button>
          </article>
          <article className="card">
            <h2>My Projects</h2>
            <p>View projects you have uploaded.</p>
            <button className="button" onClick={() => requireAuth(() => setPanel('mine'))}>View</button>
          </article>
        </section>

        {panel === 'upload' && <div className="inline-banner">Project upload section opened.</div>}
        {panel === 'browse' && <div className="inline-banner">Student projects will appear here.</div>}
        {panel === 'mine' && <div className="inline-banner">Your projects will appear here.</div>}
      </main>
    </AppLayout>
  )
}
