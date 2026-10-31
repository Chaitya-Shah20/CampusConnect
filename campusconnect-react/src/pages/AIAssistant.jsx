import { useRef, useState } from 'react'
import AppLayout from '../components/AppLayout'

const RESPONSES = {
  project: 'Try a study planner for your department, a campus navigation tool, or a peer skill-swap platform.',
  teammate: 'Start with the Find Teammates page and search by the skill your idea needs most. A clear brief gets better replies.',
  hackathon: 'Look for events whose problem statement interests you, then build a small team with one builder, one designer and one storyteller.',
  internship: 'Filter opportunities by your course and deadline, then save two roles and tailor your portfolio to each.',
  skill: 'Learn one practical skill that compounds with your current strengths: Git, APIs, testing or presenting.',
  interview: 'Prepare three project stories using context, your contribution, the tradeoff and the result.',
}

const SUGGESTIONS = [
  { label: 'Project ideas', text: 'Suggest project ideas' },
  { label: 'Find teammates', text: 'Find teammates' },
  { label: 'Interview prep', text: 'Help me prepare for an interview' },
]

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const listEndRef = useRef(null)

  function respond(text) {
    const lower = text.toLowerCase()
    const key = Object.keys(RESPONSES).find((k) => lower.includes(k)) || 'skill'
    setMessages((prev) => [...prev, { from: 'you', text }, { from: 'bot', text: RESPONSES[key] }])
    setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    respond(prompt)
    setPrompt('')
  }

  return (
    <AppLayout>
      <main className="page-wrap narrow">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CAMPUS AI ASSISTANT</p>
            <h1>What are you working on?</h1>
            <p className="lede">A lightweight guide for your next campus move.</p>
          </div>
        </div>

        <section className="panel" id="chat">
          <div className="activity-list">
            <div>
              <b>Campus Assistant</b>
              <span>Try asking for project ideas, teammates, hackathons, internships, skills or interview prep.</span>
            </div>
            {messages.map((m, i) => (
              <div key={i}>
                <b>{m.from === 'you' ? 'You' : 'Campus Assistant'}</b>
                <span>{m.text}</span>
              </div>
            ))}
            <div ref={listEndRef} />
          </div>

          <div className="tag-list">
            {SUGGESTIONS.map((s) => (
              <button key={s.label} type="button" className="button outline" onClick={() => respond(s.text)}>
                {s.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask your campus assistant..."
              required
            />
            <button className="button" type="submit">Ask</button>
          </form>
        </section>
      </main>
    </AppLayout>
  )
}
