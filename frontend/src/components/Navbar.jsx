import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const [passenger, setPassenger] = useState(null)

  // Listen to localStorage changes and set initial state
  useEffect(() => {
    const p = localStorage.getItem('passenger')
    if (p) setPassenger(JSON.parse(p))

    // Optional: listen to storage event if login happens in another tab
    const handleStorage = () => {
      const p = localStorage.getItem('passenger')
      setPassenger(p ? JSON.parse(p) : null)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('passenger')
    setPassenger(null)
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span className="logo-mark">✦</span>
          <span className="logo-text">AERO</span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Search
          </NavLink>
          <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            My Bookings
          </NavLink>
          {!passenger ? (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <span className="nav-link" style={{ color: 'var(--amber)' }}>Hi, {passenger.FirstName}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ margin: 0 }}>
                Logout
              </button>
            </>
          )}
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active nav-link-admin' : 'nav-link nav-link-admin'}>
            Admin
          </NavLink>
        </nav>
      </div>
      <div className="navbar-line" />
    </header>
  )
}
