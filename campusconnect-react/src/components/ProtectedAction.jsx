import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Small helper hook: wraps a callback so it only runs when a user is logged
// in, otherwise it nudges them to the login page (mirrors the original
// `if (!localStorage.getItem("campusUser")) { alert(...); redirect }` guards).
export function useRequireAuth() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return function requireAuth(action) {
    if (!user) {
      alert('Please login first.')
      navigate('/login')
      return
    }
    action()
  }
}
