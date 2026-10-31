import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'

export default function Achievements() {
  return (
    <AppLayout>
      <main className="page-wrap narrow">
        <div className="page-heading">
          <div>
            <p className="eyebrow">SHOW YOUR PROGRESS</p>
            <h1>Student achievements</h1>
            <p className="lede">Keep the milestones that make your journey yours.</p>
          </div>
        </div>

        <section className="cards">
          <article className="card">
            <span className="eyebrow">PROJECT</span>
            <h2>Build in public</h2>
            <p>Add projects, certificates, internships and competition wins to your profile so the right collaborators can find you.</p>
            <Link className="button" to="/profile">Update profile</Link>
          </article>
          <article className="card">
            <span className="eyebrow">NEXT MILESTONE</span>
            <h2>Complete your profile</h2>
            <p>A complete profile makes teammate recommendations more relevant.</p>
            <Link className="button outline" to="/dashboard">Back to dashboard</Link>
          </article>
        </section>
      </main>
    </AppLayout>
  )
}
