import { useNavigate } from 'react-router-dom'
import { updateBookingStatus } from '../api'
import './BookingCard.css'

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function BookingCard({ booking, flight, onRefresh }) {
  const navigate = useNavigate()

  const handleCancel = async (e) => {
    e.stopPropagation()
    if (!confirm('Cancel this booking?')) return
    try {
      await updateBookingStatus(booking.BookingID, 'Cancelled')
      onRefresh?.()
    } catch (err) {
      alert('Failed to cancel booking.')
    }
  }

  const statusClass = booking.Status.toLowerCase()

  return (
    <div className="booking-card">
      <div className="bc-header">
        <div className="bc-id-block">
          <span className="label">Booking</span>
          <span className="mono bc-id">#{String(booking.BookingID).padStart(6, '0')}</span>
        </div>
        <span className={`tag ${statusClass}`}>{booking.Status}</span>
      </div>

      {flight && (
        <div className="bc-route">
          <div className="bc-airport">
            <span className="bc-code">{flight.DepartureAirport}</span>
            <span className="label mono">{fmtTime(flight.DeptTime)}</span>
          </div>
          <div className="bc-arrow">
            <div className="bc-line" />
            <span className="mono bc-flight-id">{flight.FlightID}</span>
            <div className="bc-line" />
          </div>
          <div className="bc-airport right">
            <span className="bc-code">{flight.ArrivalAirport}</span>
            <span className="label mono">{fmtTime(flight.ArrivalTime)}</span>
          </div>
        </div>
      )}

      <div className="bc-meta">
        <div className="bc-meta-item">
          <span className="label">Date</span>
          <span className="mono">{fmtDate(booking.BookingDate)}</span>
        </div>
        <div className="bc-meta-item">
          <span className="label">Seat</span>
          <span className="mono bc-seat">{booking.SeatNo}</span>
        </div>
        <div className="bc-meta-item">
          <span className="label">Co-pax</span>
          <span className="mono">{booking.co_passengers?.length ?? 0}</span>
        </div>
      </div>

      <div className="bc-actions">
        {booking.Status === 'Pending' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/payment/${booking.BookingID}`)}
          >
            Pay Now
          </button>
        )}
        {booking.Status !== 'Cancelled' && (
          <button className="btn btn-danger btn-sm" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
