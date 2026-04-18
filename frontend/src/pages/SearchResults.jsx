import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchFlights } from '../api'
import FlightCard from '../components/FlightCard'
import './SearchResults.css'

export default function SearchResults() {
  const [params] = useSearchParams()
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const from = params.get('from') || ''
  const to   = params.get('to')   || ''
  const date = params.get('date') || ''

  useEffect(() => {
    setLoading(true)
    setError('')
    searchFlights(from || undefined, to || undefined, date || undefined)
      .then(r => setFlights(r.data))
      .catch(() => setError('Failed to fetch flights. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [from, to, date])

  return (
    <div className="search-results page-enter container">
      <div className="sr-header">
        <div className="sr-route">
          {from && <span className="sr-airport">{from}</span>}
          {from && to && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {to && <span className="sr-airport">{to}</span>}
          {!from && !to && <span className="sr-airport">All Flights</span>}
        </div>
        {date && <span className="label mono">{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>}
      </div>

      <div className="divider" />

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span>Searching flights…</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && flights.length === 0 && (
        <div className="state-box">
          <span style={{ fontSize: 28 }}>✦</span>
          <span>No flights found for this route.</span>
          <span style={{ color: 'var(--text-mute)' }}>Try a different date or airport.</span>
        </div>
      )}

      {!loading && !error && flights.length > 0 && (
        <>
          <p className="label sr-count">{flights.length} flight{flights.length !== 1 ? 's' : ''} found</p>
          <div className="sr-list">
            {flights.map((f, i) => (
              <div key={f.FlightID} style={{ animationDelay: `${i * 60}ms` }}>
                <FlightCard flight={f} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
