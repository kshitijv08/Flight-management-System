import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFlight, getBookedSeats, createBooking } from '../api'
import './BookFlight.css'

const ROWS = 30
const COLS = ['A', 'B', 'C', 'D', 'E', 'F']

const emptyCP = () => ({
  FirstName: '', LastName: '', IdentificationID: '', IDType: 'Aadhar',
  Age: '', Gender: 'Male', Class: 'Economy', SeatNo: ''
})

export default function BookFlight() {
  const { flightId } = useParams()
  const navigate = useNavigate()

  const [flight, setFlight]           = useState(null)
  const [bookedSeats, setBookedSeats] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const [form, setForm] = useState({
    IdentificationID: '',
    IDType: 'Aadhar',
    Class: 'Economy',
    SeatNo: '',
    co_passengers: [],
  })

  useEffect(() => {
    Promise.all([getFlight(flightId), getBookedSeats(flightId)])
      .then(([fr, sr]) => {
        setFlight(fr.data)
        setBookedSeats(sr.data.booked_seats)
      })
      .catch(() => setError('Failed to load flight details.'))
      .finally(() => setLoading(false))
  }, [flightId])

  const selectSeat = (seat) => {
    if (bookedSeats.includes(seat)) return
    setForm(f => ({ ...f, SeatNo: f.SeatNo === seat ? '' : seat }))
  }

  const addCP    = () => setForm(f => ({ ...f, co_passengers: [...f.co_passengers, emptyCP()] }))
  const removeCP = (i) => setForm(f => ({ ...f, co_passengers: f.co_passengers.filter((_, idx) => idx !== i) }))
  const updateCP = (i, k, v) => setForm(f => {
    const cps = [...f.co_passengers]
    cps[i] = { ...cps[i], [k]: v }
    return { ...f, co_passengers: cps }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.IdentificationID) { setError('Identification ID is required.'); return }
    if (!form.SeatNo)           { setError('Please select a seat.'); return }

    setSubmitting(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const payload = {
        BookingDate:      today,
        SeatNo:           form.SeatNo,
        Class:            form.Class,
        Status:           'Pending',
        FlightID:         flightId,
        IdentificationID: form.IdentificationID,
        co_passengers: form.co_passengers.map(cp => ({ ...cp, Age: Number(cp.Age) })),
      }
      const res = await createBooking(payload)
      navigate(`/payment/${res.data.BookingID}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container" style={{ padding: '80px 24px' }}><div className="state-box"><div className="spinner" /></div></div>
  if (!flight) return <div className="container" style={{ padding: 40 }}><div className="alert alert-error">Flight not found.</div></div>

  return (
    <div className="book-flight page-enter container">
      {/* Flight summary bar */}
      <div className="bf-summary">
        <div className="bf-sum-route">
          <span className="bf-code">{flight.DepartureAirport}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="bf-code">{flight.ArrivalAirport}</span>
        </div>
        <div className="bf-sum-info">
          <span className="label mono">{flight.FlightID}</span>
          <span className="bf-price mono">₹{Number(flight.Cost).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bf-layout">
        {/* LEFT: Passenger + co-passengers */}
        <div className="bf-left">
          <section className="card">
            <h3 className="bf-section-title">Passenger Details</h3>
            <div className="divider" style={{ margin: '12px 0 20px' }} />

            <div className="grid-2">
              <div className="field">
                <label>ID Type</label>
                <select value={form.IDType} onChange={e => setForm(f => ({ ...f, IDType: e.target.value }))}>
                  <option>Aadhar</option>
                  <option>Passport</option>
                  <option>Driving License</option>
                  <option>Voter ID</option>
                </select>
              </div>
              <div className="field">
                <label>Identification ID</label>
                <input
                  type="text"
                  placeholder={form.IDType === 'Aadhar' ? 'e.g. 1234 5678 9012' : 'e.g. P1234567'}
                  value={form.IdentificationID}
                  onChange={e => setForm(f => ({ ...f, IdentificationID: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="field" style={{ marginTop: 4 }}>
              <label>Travel Class</label>
              <select value={form.Class} onChange={e => setForm(f => ({ ...f, Class: e.target.value }))}>
                <option>Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
            </div>

            <p className="bf-hint">You must be registered as a passenger first.</p>
          </section>

          {/* Co-passengers */}
          <section className="card">
            <div className="bf-cp-header">
              <h3 className="bf-section-title">Co-Passengers</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addCP}>+ Add</button>
            </div>

            {form.co_passengers.length === 0 && (
              <p className="bf-hint" style={{ paddingTop: 8 }}>No co-passengers added.</p>
            )}

            {form.co_passengers.map((cp, i) => (
              <div key={i} className="cp-block">
                <div className="cp-block-header">
                  <span className="label mono">Co-Passenger {i + 1}</span>
                  <button type="button" className="cp-remove" onClick={() => removeCP(i)}>✕</button>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>First Name</label>
                    <input value={cp.FirstName} onChange={e => updateCP(i, 'FirstName', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Last Name</label>
                    <input value={cp.LastName} onChange={e => updateCP(i, 'LastName', e.target.value)} required />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>ID Type</label>
                    <select value={cp.IDType} onChange={e => updateCP(i, 'IDType', e.target.value)}>
                      <option>Aadhar</option>
                      <option>Passport</option>
                      <option>Driving License</option>
                      <option>Voter ID</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Identification ID</label>
                    <input value={cp.IdentificationID} onChange={e => updateCP(i, 'IdentificationID', e.target.value)} required />
                  </div>
                </div>
                <div className="grid-3">
                  <div className="field">
                    <label>Age</label>
                    <input type="number" min="1" value={cp.Age} onChange={e => updateCP(i, 'Age', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Gender</label>
                    <select value={cp.Gender} onChange={e => updateCP(i, 'Gender', e.target.value)}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Class</label>
                    <select value={cp.Class} onChange={e => updateCP(i, 'Class', e.target.value)}>
                      <option>Economy</option><option>Business</option><option>First</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Seat No</label>
                  <input placeholder="e.g. 5B" value={cp.SeatNo} onChange={e => updateCP(i, 'SeatNo', e.target.value)} required />
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* RIGHT: Seat map + submit */}
        <div className="bf-right">
          <section className="card">
            <h3 className="bf-section-title">Select Seat</h3>
            <div className="divider" style={{ margin: '12px 0 16px' }} />

            <div className="seat-legend">
              <div className="sl-item"><div className="sl-box available" /> Available</div>
              <div className="sl-item"><div className="sl-box selected" /> Selected</div>
              <div className="sl-item"><div className="sl-box taken" /> Taken</div>
            </div>

            <div className="seat-map">
              <div className="seat-map-cols">
                <span className="seat-col-label label"/>
                {COLS.map(c => <span key={c} className="seat-col-label label">{c}</span>)}
              </div>
              {Array.from({ length: ROWS }, (_, r) => r + 1).map(row => (
                <div key={row} className="seat-row">
                  <span className="seat-row-num label mono">{row}</span>
                  {COLS.map(col => {
                    const seat     = `${row}${col}`
                    const taken    = bookedSeats.includes(seat)
                    const selected = form.SeatNo === seat
                    return (
                      <button
                        key={seat}
                        type="button"
                        className={`seat ${taken ? 'taken' : selected ? 'selected' : 'available'}`}
                        onClick={() => selectSeat(seat)}
                        disabled={taken}
                        title={seat}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            {form.SeatNo && (
              <p className="bf-selected-seat">
                Selected: <span className="mono" style={{ color: 'var(--amber)' }}>{form.SeatNo}</span>
              </p>
            )}
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm Booking →'}
          </button>
        </div>
      </form>
    </div>
  )
}
