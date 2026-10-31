import AppLayout from '../components/AppLayout'
import { useRequireAuth } from '../components/ProtectedAction'

const OPTIONS = [
  { title: 'Career Guidance', desc: 'Get guidance about career paths and opportunities.', cta: 'Find Mentor' },
  { title: 'Project Guidance', desc: 'Get help from experienced students.', cta: 'Find Mentor' },
  { title: 'Interview Preparation', desc: 'Prepare for interviews with experienced mentors.', cta: 'Get Help' },
]

export default function Mentorship() {
  const requireAuth = useRequireAuth()

  function openMentor() {
    requireAuth(() => alert('Available mentors will appear here.'))
  }

  return (
    <AppLayout>
      <main className="page-wrap narrow">
        <div className="page-heading">
          <div>
            <p className="eyebrow">GUIDANCE FROM THOSE WHO'VE BEEN THERE</p>
            <h1>Mentorship</h1>
            <p className="lede">Connect with seniors and alumni for guidance and career advice.</p>
          </div>
        </div>

        <section className="cards">
          {OPTIONS.map((o) => (
            <article className="card" key={o.title}>
              <h2>{o.title}</h2>
              <p>{o.desc}</p>
              <button className="button" onClick={openMentor}>{o.cta}</button>
            </article>
          ))}
        </section>
      </main>
    </AppLayout>
  )
}
