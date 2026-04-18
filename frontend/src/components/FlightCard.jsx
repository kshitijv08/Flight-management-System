import { useNavigate } from 'react-router-dom'
import './FlightCard.css'

function fmtTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function duration(dept, arr) {
  const diff = new Date(arr) - new Date(dept)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

export default function FlightCard({ flight }) {
  const navigate = useNavigate()

  return (
    <div className="flight-card" onClick={() => navigate(`/book/${flight.FlightID}`)}>
      <div className="fc-airline-row">
        <span className="label">{flight.AirlineID}</span>
        <span className="mono fc-flight-id">{flight.FlightID}</span>
      </div>

      <div className="fc-route">
        <div className="fc-endpoint">
          <span className="fc-code">{flight.DepartureAirport}</span>
          <span className="fc-time mono">{fmtTime(flight.DeptTime)}</span>
        </div>

        <div className="fc-duration-track">
          <div className="fc-dot" />
          <div className="fc-line" />
          <span className="fc-dur label">{duration(flight.DeptTime, flight.ArrivalTime)}</span>
          <div className="fc-line" />
          <svg className="fc-plane" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h0A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
          </svg>
        </div>

        <div className="fc-endpoint right">
          <span className="fc-code">{flight.ArrivalAirport}</span>
          <span className="fc-time mono">{fmtTime(flight.ArrivalTime)}</span>
        </div>
      </div>

      <div className="fc-footer">
        <span className="label">{fmtDate(flight.DeptTime)}</span>
        <div className="fc-price-row">
          <span className="label">from</span>
          <span className="fc-price mono">₹{Number(flight.Cost).toLocaleString('en-IN')}</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/book/${flight.FlightID}`) }}>
          Select →
        </button>
      </div>
    </div>
  )
}
