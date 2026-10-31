import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'

const UPCOMING = [
  { title: 'Build for Bharat', meta: 'Hackathon · Aug 28 · Innovation Lab' },
  { title: 'Design systems workshop', meta: 'Workshop · Sep 03 · Design Studio' },
  { title: 'Open source office hours', meta: 'Mentorship · Sep 07 · Library West' },
]

const ACTIVITY = [
  { title: 'Arjun Mehta joined your team invite', meta: 'Today · Product Lab' },
  { title: 'Your project received 6 likes', meta: 'Yesterday · Project Showcase' },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <AppLayout>
      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR CAMPUS, IN ONE PLACE</p>
            <h1>Welcome, {user?.name || 'student'}.</h1>
            <p className="lede">Pick up where you left off and find your next collaboration.</p>
          </div>
          <Link className="button" to="/project">Share a project</Link>
        </div>

        <section className="stats-grid">
          <article className="stat">
            <span>Profile completion</span>
            <strong>72%</strong>
            <div className="progress"><i style={{ width: '72%' }} /></div>
          </article>
          <article className="stat">
            <span>My teams</span>
            <strong>03</strong>
            <small>2 active projects</small>
          </article>
          <article className="stat">
            <span>Saved opportunities</span>
            <strong>08</strong>
            <small>3 closing this week</small>
          </article>
          <article className="stat">
            <span>Connections</span>
            <strong>24</strong>
            <small>5 new this month</small>
          </article>
        </section>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">DISCOVER</p>
                <h2>Upcoming on campus</h2>
              </div>
              <Link to="/opportunities">View all</Link>
            </div>
            <div className="activity-list">
              {UPCOMING.map((item) => (
                <div key={item.title}>
                  <b>{item.title}</b>
                  <span>{item.meta}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel dark-panel">
            <p className="eyebrow">CAMPUS ASSISTANT</p>
            <h2>Have a question?</h2>
            <p>Get ideas for projects, teammates, interviews and more.</p>
            <Link className="button light" to="/ai-assistant">Ask the assistant</Link>
          </section>
        </div>

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">YOUR MOMENTUM</p>
              <h2>Recent campus activity</h2>
            </div>
            <Link to="/teammates">Find people</Link>
          </div>
          <div className="activity-list compact">
            {ACTIVITY.map((item) => (
              <div key={item.title}>
                <b>{item.title}</b>
                <span>{item.meta}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppLayout>
  )
}
