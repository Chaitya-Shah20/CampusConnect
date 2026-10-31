import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AIAssistant from './pages/AIAssistant'
import Achievements from './pages/Achievements'
import Hackathons from './pages/Hackathons'
import Mentorship from './pages/Mentorship'
import Opportunities from './pages/Opportunities'
import QA from './pages/QA'
import Profile from './pages/Profile'
import ProjectShowcase from './pages/ProjectShowcase'
import Resources from './pages/Resources'
import Teammates from './pages/Teammates'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ai-assistant" element={<AIAssistant />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/hackathons" element={<Hackathons />} />
      <Route path="/mentorship" element={<Mentorship />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/qa" element={<QA />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/project" element={<ProjectShowcase />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/teammates" element={<Teammates />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
