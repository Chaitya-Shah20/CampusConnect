import Navbar from './Navbar'
import Footer from './Footer'

// Shared shell used by every interior (logged-in style) page.
export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
