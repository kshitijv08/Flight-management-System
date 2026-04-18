import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAirports } from '../api'
import DatePicker from '../components/DatePicker'
import './Home.css'

export default function Home() {
  const [airports, setAirports] = useState([])
  const [form, setForm] = useState({ from: '', to: '', date: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getAirports()
      .then(r => setAirports(r.data))
      .catch(() => {})
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSearch = (e) => {
    e.preventDefault()
    setError('')
    if (!form.from || !form.to) { setError('Please select departure and arrival airports.'); return }
    if (form.from === form.to)  { setError('Departure and arrival must differ.'); return }
    const params = new URLSearchParams()
    if (form.from) params.set('from', form.from)
    if (form.to)   params.set('to', form.to)
    if (form.date) params.set('date', form.date)
    navigate(`/results?${params.toString()}`)
  }

  return (
    <div className="home page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
        </div>
        <div className="container hero-content">
          <div className="hero-eyebrow">
            <span className="label">Flight Management System</span>
            <span className="hero-dot" />
            <span className="label">VIT Pune — DBMS Project</span>
          </div>
          <h1 className="hero-title">
            Where do you<br />
            <span className="hero-accent">want to fly?</span>
          </h1>
        </div>
      </section>

      {/* Search form */}
      <div className="container">
        <div className="search-card">
          <form onSubmit={handleSearch}>
            <div className="search-fields">
              <div className="field">
                <label>From</label>
                <select value={form.from} onChange={set('from')} required>
                  <option value="">Select airport</option>
                  {airports.map(a => (
                    <option key={a.AirportCode} value={a.AirportCode}>
                      {a.AirportCode} — {a.City}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-swap" onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="field">
                <label>To</label>
                <select value={form.to} onChange={set('to')} required>
                  <option value="">Select airport</option>
                  {airports.map(a => (
                    <option key={a.AirportCode} value={a.AirportCode}>
                      {a.AirportCode} — {a.City}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Date</label>
                <DatePicker
                  value={form.date}
                  onChange={(val) => setForm(f => ({ ...f, date: val }))}
                  placeholder="Any date"
                />
              </div>

              <button type="submit" className="btn btn-primary search-btn">
                Search Flights
              </button>
            </div>
            {error && <p className="alert alert-error" style={{ marginTop: 12 }}>{error}</p>}
          </form>
        </div>

        {/* Info strip */}
        <div className="info-strip">
          {[
            { icon: '✦', label: 'Real-time availability' },
            { icon: '✦', label: 'Instant booking' },
            { icon: '✦', label: 'Secure payments' },
          ].map((item, i) => (
            <div key={i} className="info-item">
              <span className="info-icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
