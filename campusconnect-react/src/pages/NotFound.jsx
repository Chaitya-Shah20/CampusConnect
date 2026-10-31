import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'

export default function NotFound() {
  return (
    <AppLayout>
      <main className="page-wrap narrow" style={{ textAlign: 'center' }}>
        <h1>404</h1>
        <p className="lede">This page doesn't exist.</p>
        <Link className="button" to="/">Back to Home</Link>
      </main>
    </AppLayout>
  )
}
