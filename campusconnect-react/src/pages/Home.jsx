import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CampusSlider from '../components/CampusSlider'
import CampusMap from '../components/CampusMap'

const FEATURES = [
  { title: 'Find Teammates', desc: 'Find students with the right skills for projects and hackathons.' },
  { title: 'Hackathon Teams', desc: 'Create teams and connect with students who have different skills.' },
  { title: 'Project Showcase', desc: 'Share your projects and explore student projects.' },
  { title: 'Campus Opportunities', desc: 'Discover internships, workshops, competitions and hackathons.' },
  { title: 'Mentorship', desc: 'Connect with seniors and alumni for guidance.' },
  { title: 'Resource Sharing', desc: 'Share notes, tutorials and study material.' },
  { title: 'Campus Q&A', desc: 'Ask questions and get answers from your campus community.' },
  { title: 'Campus AI Assistant', desc: 'Get suggestions for projects, teammates and opportunities.' },
  { title: 'Student Achievements', desc: 'Showcase your projects, certificates and skills.' },
]

export default function Home() {
  return (
    <div>
      <section className="hero">
        <Navbar onHero />

        <div className="hero-content">
          <p className="eyebrow">A BETTER WAY TO FIND YOUR PEOPLE</p>
          <h1>Connect. Collaborate. Grow.</h1>
          <p>
            One campus. Endless connections. Find teammates, discover opportunities, showcase your work and grow together.
          </p>
          <Link to="/login" className="button">Get Started</Link>
          <a href="#features" className="button dark-button">Explore Campus</a>
        </div>

        <div className="scene" aria-label="Students walking through campus">
          <div className="building" />
          <div className="tree one" />
          <div className="tree two" />
          <div className="bench" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="student" key={i}>
              <i className="head" /><i className="body" /><i className="arm" /><i className="arm right" /><i className="leg" /><i className="leg right" />
            </div>
          ))}
        </div>
      </section>

      <CampusSlider />

      <section className="features" id="features">
        <h2>Everything You Need on Campus</h2>
        <p>CampusConnect brings students, ideas and opportunities together.</p>
        <div className="cards">
          {FEATURES.map((f) => (
            <div className="card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CampusMap />

      <section className="about" id="about">
        <h2>About CampusConnect</h2>
        <p>
          CampusConnect is a student collaboration platform designed to make campus life more connected.
          Students can build teams, showcase their work, find mentors, discover opportunities and share
          useful resources.
        </p>
        <Link to="/login" className="button dark-button">Join CampusConnect</Link>
      </section>

      <Footer />
    </div>
  )
}
