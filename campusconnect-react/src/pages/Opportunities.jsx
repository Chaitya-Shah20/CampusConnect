import { useState } from 'react'
import AppLayout from '../components/AppLayout'

const OPTIONS = [
  { title: 'Internships', desc: 'Find internship opportunities.' },
  { title: 'Workshops', desc: 'Discover useful campus workshops.' },
  { title: 'Hackathons', desc: 'Find upcoming hackathons.' },
  { title: 'Competitions', desc: 'Participate in student competitions.' },
]

export default function Opportunities() {
  const [active, setActive] = useState(null)

  return (
    <AppLayout>
      <main className="page-wrap narrow">
        <div className="page-heading">
          <div>
            <p className="eyebrow">GROW BEYOND THE CLASSROOM</p>
            <h1>Campus Opportunities</h1>
            <p className="lede">Discover internships, workshops, competitions and hackathons.</p>
          </div>
        </div>

        <section className="cards">
          {OPTIONS.map((o) => (
            <article className="card" key={o.title}>
              <h2>{o.title}</h2>
              <p>{o.desc}</p>
              <button className="button" onClick={() => setActive(o.title)}>Explore</button>
            </article>
          ))}
        </section>

        {active && (
          <div className="inline-banner">{active} opportunities will appear here.</div>
        )}
      </main>
    </AppLayout>
  )
}
