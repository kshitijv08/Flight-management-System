import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBooking, getFlight, createPayment, getPaymentByBooking } from '../api'
import './Payment.css'

const METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash']

export default function Payment() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking]   = useState(null)
  const [flight, setFlight]     = useState(null)
  const [existing, setExisting] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')
  const [method, setMethod]     = useState('UPI')

  useEffect(() => {
    const load = async () => {
      try {
        const br = await getBooking(bookingId)
        setBooking(br.data)
        const fr = await getFlight(br.data.FlightID)
        setFlight(fr.data)
        try {
          const pr = await getPaymentByBooking(bookingId)
          setExisting(pr.data)
        } catch (_) { /* no payment yet, that's fine */ }
      } catch {
        setError('Failed to load booking.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [bookingId])

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createPayment({
        Amount: flight.Cost,
        Method: method,
        PaymentDate: new Date().toISOString().split('T')[0],
        BookingID: Number(bookingId),
      })
      navigate(`/my-bookings?success=1`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="container" style={{ padding: '80px 24px' }}>
      <div className="state-box"><div className="spinner" /></div>
    </div>
  )

  if (error && !booking) return (
    <div className="container" style={{ padding: 40 }}>
      <div className="alert alert-error">{error}</div>
    </div>
  )

  if (existing) return (
    <div className="payment page-enter container">
      <div className="pay-already">
        <div className="pay-check">✓</div>
        <h2>Already Paid</h2>
        <p className="label">Payment #{existing.PaymentID} — {existing.Method}</p>
        <p className="label mono" style={{ color: 'var(--green)' }}>
          ₹{Number(existing.Amount).toLocaleString('en-IN')}
        </p>
        <button className="btn btn-ghost" onClick={() => navigate('/my-bookings')}>
          View My Bookings
        </button>
      </div>
    </div>
  )

  return (
    <div className="payment page-enter container">
      <div className="pay-layout">
        {/* Order summary */}
        <div className="pay-summary card">
          <h3 className="pay-section-title">Order Summary</h3>
          <div className="divider" style={{ margin: '12px 0 20px' }} />

          {flight && (
            <div className="pay-route">
              <span className="pay-airport">{flight.DepartureAirport}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="pay-airport">{flight.ArrivalAirport}</span>
            </div>
          )}

          <div className="pay-meta-list">
            <div className="pay-meta-row">
              <span className="label">Booking ID</span>
              <span className="mono">#{String(booking.BookingID).padStart(6, '0')}</span>
            </div>
            <div className="pay-meta-row">
              <span className="label">Flight</span>
              <span className="mono">{booking.FlightID}</span>
            </div>
            <div className="pay-meta-row">
              <span className="label">Seat</span>
              <span className="mono" style={{ color: 'var(--amber)' }}>{booking.SeatNo}</span>
            </div>
            <div className="pay-meta-row">
              <span className="label">Passport</span>
              <span className="mono">{booking.PassportID}</span>
            </div>
            {booking.co_passengers?.length > 0 && (
              <div className="pay-meta-row">
                <span className="label">Co-passengers</span>
                <span className="mono">{booking.co_passengers.length}</span>
              </div>
            )}
          </div>

          <div className="pay-total-row">
            <span className="label">Total Amount</span>
            <span className="pay-total mono">
              ₹{flight ? Number(flight.Cost).toLocaleString('en-IN') : '—'}
            </span>
          </div>
        </div>

        {/* Payment form */}
        <div className="pay-form-col">
          <form onSubmit={handlePay} className="card">
            <h3 className="pay-section-title">Payment Method</h3>
            <div className="divider" style={{ margin: '12px 0 20px' }} />

            <div className="pay-methods">
              {METHODS.map(m => (
                <label key={m} className={`pay-method-opt ${method === m ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                  />
                  <span className="pay-method-icon">{methodIcon(m)}</span>
                  <span>{m}</span>
                </label>
              ))}
            </div>

            {/* Simulated input — demo only */}
            {(method === 'Credit Card' || method === 'Debit Card') && (
              <div className="pay-card-inputs">
                <div className="field">
                  <label>Card Number</label>
                  <input placeholder="•••• •••• •••• ••••" maxLength={19} />
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Expiry</label>
                    <input placeholder="MM / YY" maxLength={7} />
                  </div>
                  <div className="field">
                    <label>CVV</label>
                    <input placeholder="•••" maxLength={3} type="password" />
                  </div>
                </div>
              </div>
            )}

            {method === 'UPI' && (
              <div className="pay-card-inputs">
                <div className="field">
                  <label>UPI ID</label>
                  <input placeholder="yourname@upi" />
                </div>
              </div>
            )}

            {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
              {submitting ? 'Processing…' : `Pay ₹${flight ? Number(flight.Cost).toLocaleString('en-IN') : '—'} →`}
            </button>

            <p className="pay-disclaimer">
              This is a demo project. No real payment is processed.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function methodIcon(m) {
  const map = { UPI: '⬡', 'Credit Card': '▭', 'Debit Card': '▭', 'Net Banking': '⊞', Cash: '◈' }
  return map[m] || '◈'
}
