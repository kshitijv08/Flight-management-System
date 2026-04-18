import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPassengerBookings, getFlight } from '../api'
import BookingCard from '../components/BookingCard'
import './MyBookings.css'

export default function MyBookings() {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success')

  const [identificationId, setIdentificationId] = useState('')
  const [inputVal, setInputVal]                 = useState('')
  const [bookings, setBookings]                 = useState([])
  const [flightMap, setFlightMap]               = useState({})
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState('')
  const [searched, setSearched]                 = useState(false)

  const fetchBookings = useCallback(async (id) => {
    setLoading(true)
    setError('')
    try {
      const res = await getPassengerBookings(id)
      const bks = res.data
      setBookings(bks)

      const uniqueFlights = [...new Set(bks.map(b => b.FlightID))]
      const flightEntries = await Promise.all(
        uniqueFlights.map(fid => getFlight(fid).then(r => [fid, r.data]).catch(() => [fid, null]))
      )
      setFlightMap(Object.fromEntries(flightEntries))
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No passenger found with this ID.')
      } else {
        setError('Failed to fetch bookings. Make sure the backend is running.')
      }
      setBookings([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    setIdentificationId(inputVal.trim())
    fetchBookings(inputVal.trim())
  }

  const statusOrder = { Pending: 0, Confirmed: 1, Cancelled: 2 }
  const sorted = [...bookings].sort((a, b) => statusOrder[a.Status] - statusOrder[b.Status])

  return (
    <div className="my-bookings page-enter container">
      {success && (
        <div className="alert alert-success mb-bookings-success">
          ✓ Booking confirmed and payment recorded successfully!
        </div>
      )}

      <div className="mb-header">
        <h1 className="mb-title">My Bookings</h1>
        <p className="label" style={{ marginTop: 4 }}>Enter your Identification ID to view all bookings</p>
      </div>

      <form onSubmit={handleSearch} className="mb-search">
        <div className="field" style={{ flex: 1 }}>
          <label>Identification ID (Aadhar / Passport / etc.)</label>
          <input
            type="text"
            placeholder="e.g. 1234 5678 9012 or P1234567"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary mb-search-btn">
          Fetch Bookings
        </button>
      </form>

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span>Loading bookings…</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && searched && bookings.length === 0 && (
        <div className="state-box">
          <span style={{ fontSize: 28 }}>✦</span>
          <span>No bookings found.</span>
          <span style={{ color: 'var(--text-mute)' }}>Search for a flight to make your first booking.</span>
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <>
          <div className="mb-stats">
            <div className="mb-stat">
              <span className="mb-stat-num mono">{bookings.length}</span>
              <span className="label">Total</span>
            </div>
            <div className="mb-stat">
              <span className="mb-stat-num mono" style={{ color: 'var(--green)' }}>
                {bookings.filter(b => b.Status === 'Confirmed').length}
              </span>
              <span className="label">Confirmed</span>
            </div>
            <div className="mb-stat">
              <span className="mb-stat-num mono" style={{ color: 'var(--amber)' }}>
                {bookings.filter(b => b.Status === 'Pending').length}
              </span>
              <span className="label">Pending</span>
            </div>
            <div className="mb-stat">
              <span className="mb-stat-num mono" style={{ color: 'var(--red)' }}>
                {bookings.filter(b => b.Status === 'Cancelled').length}
              </span>
              <span className="label">Cancelled</span>
            </div>
          </div>

          <div className="mb-list">
            {sorted.map((booking, i) => (
              <div key={booking.BookingID} style={{ animationDelay: `${i * 60}ms` }}>
                <BookingCard
                  booking={booking}
                  flight={flightMap[booking.FlightID]}
                  onRefresh={() => fetchBookings(identificationId)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
