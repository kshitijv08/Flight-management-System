import { useState, useEffect } from 'react'
import {
  createFlight, getFlights, deleteFlight, updateFlight,
  getAirlines, updateAirline, deleteAirline,
  getAirports, updateAirport, deleteAirport,
  getAircraft, updateAircraft, deleteAircraft
} from '../api'
import api from '../api'
import './Admin.css'

const ADMIN_PASSWORD = 'admin123'

const emptyFlight = {
  FlightID: '', DeptTime: '', ArrivalTime: '',
  Cost: '', AirlineID: '', AircraftID: '',
  DepartureAirport: '', ArrivalAirport: ''
}
const emptyAirline  = { AirlineID: '', AirlineName: '', Owner: '' }
const emptyAirport  = { AirportCode: '', AirportName: '', City: '', Country: '', Terminal: '' }
const emptyAircraft = { AircraftID: '', Model: '', Capacity: '', AirlineID: '' }

export default function Admin() {
  const [authed,  setAuthed]  = useState(false)
  const [pw,      setPw]      = useState('')
  const [pwError, setPwError] = useState(false)
  const [tab,     setTab]     = useState('flight')

  const [airlines,  setAirlines]  = useState([])
  const [airports,  setAirports]  = useState([])
  const [aircrafts, setAircrafts] = useState([])
  const [flights,   setFlights]   = useState([])
  const [editingFlight, setEditingFlight] = useState(null)
  const [editingAirline, setEditingAirline] = useState(null)
  const [editingAirport, setEditingAirport] = useState(null)
  const [editingAircraft, setEditingAircraft] = useState(null)

  const [flightForm,  setFlightForm]  = useState(emptyFlight)
  const [airlineForm, setAirlineForm] = useState(emptyAirline)
  const [airportForm, setAirportForm] = useState(emptyAirport)
  const [aircraftForm,setAircraftForm]= useState(emptyAircraft)

  const [msg, setMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authed) return
    Promise.all([getAirlines(), getAirports(), getAircraft(), getFlights()])
      .then(([al, ap, ac, fl]) => {
        setAirlines(al.data)
        setAirports(ap.data)
        setAircrafts(ac.data)
        setFlights(fl.data)
      })
  }, [authed])

  const login = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else { setPwError(true) }
  }

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  const setF  = (setter) => (k) => (e) => setter(f => ({ ...f, [k]: e.target.value }))

  // ── Submit handlers ──────────────────────────────────────────
  const submitFlight = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await createFlight({
        ...flightForm,
        Cost: Number(flightForm.Cost),
        DeptTime:    flightForm.DeptTime    + ':00',
        ArrivalTime: flightForm.ArrivalTime + ':00',
      })
      flash('success', `Flight ${flightForm.FlightID} added successfully.`)
      setFlightForm(emptyFlight)
      const fl = await getFlights(); setFlights(fl.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to add flight.')
    } finally { setLoading(false) }
  }

  const submitAirline = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/airlines', airlineForm)
      flash('success', `Airline ${airlineForm.AirlineName} added.`)
      setAirlineForm(emptyAirline)
      const r = await getAirlines(); setAirlines(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to add airline.')
    } finally { setLoading(false) }
  }

  const submitAirport = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/airports', airportForm)
      flash('success', `Airport ${airportForm.AirportCode} added.`)
      setAirportForm(emptyAirport)
      const r = await getAirports(); setAirports(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to add airport.')
    } finally { setLoading(false) }
  }

  const submitAircraft = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/aircraft', { ...aircraftForm, Capacity: Number(aircraftForm.Capacity) })
      flash('success', `Aircraft ${aircraftForm.AircraftID} added.`)
      setAircraftForm(emptyAircraft)
      const r = await getAircraft(); setAircrafts(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to add aircraft.')
    } finally { setLoading(false) }
  }

  const handleDeleteFlight = async (id) => {
    if (!window.confirm(`Are you sure you want to delete flight ${id}?`)) return
    try {
      await deleteFlight(id)
      flash('success', `Flight ${id} deleted.`)
      const fl = await getFlights(); setFlights(fl.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to delete flight.')
    }
  }

  const startEditFlight = (f) => {
    setEditingFlight({
      ...f,
      DeptTime: f.DeptTime ? String(f.DeptTime).slice(0, 16) : '',
      ArrivalTime: f.ArrivalTime ? String(f.ArrivalTime).slice(0, 16) : '',
    })
  }

  const submitEditFlight = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await updateFlight(editingFlight.FlightID, {
        ...editingFlight,
        Cost: Number(editingFlight.Cost),
        DeptTime: editingFlight.DeptTime + ':00',
        ArrivalTime: editingFlight.ArrivalTime + ':00'
      })
      flash('success', `Flight ${editingFlight.FlightID} updated successfully.`)
      setEditingFlight(null)
      const fl = await getFlights(); setFlights(fl.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to update flight.')
    } finally { setLoading(false) }
  }

  // ── Airline CRUD ─────────────────────────────────────────────
  const handleDeleteAirline = async (id) => {
    if (!window.confirm(`Delete airline ${id}? This may fail if flights/aircraft reference it.`)) return
    try {
      await deleteAirline(id)
      flash('success', `Airline ${id} deleted.`)
      const r = await getAirlines(); setAirlines(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to delete airline.')
    }
  }

  const startEditAirline = (a) => setEditingAirline({ ...a })

  const submitEditAirline = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await updateAirline(editingAirline.AirlineID, {
        AirlineName: editingAirline.AirlineName,
        Owner: editingAirline.Owner
      })
      flash('success', `Airline ${editingAirline.AirlineID} updated.`)
      setEditingAirline(null)
      const r = await getAirlines(); setAirlines(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to update airline.')
    } finally { setLoading(false) }
  }

  // ── Airport CRUD ────────────────────────────────────────────
  const handleDeleteAirport = async (code) => {
    if (!window.confirm(`Delete airport ${code}? This may fail if flights reference it.`)) return
    try {
      await deleteAirport(code)
      flash('success', `Airport ${code} deleted.`)
      const r = await getAirports(); setAirports(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to delete airport.')
    }
  }

  const startEditAirport = (a) => setEditingAirport({ ...a })

  const submitEditAirport = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await updateAirport(editingAirport.AirportCode, {
        AirportName: editingAirport.AirportName,
        City: editingAirport.City,
        Country: editingAirport.Country,
        Terminal: editingAirport.Terminal
      })
      flash('success', `Airport ${editingAirport.AirportCode} updated.`)
      setEditingAirport(null)
      const r = await getAirports(); setAirports(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to update airport.')
    } finally { setLoading(false) }
  }

  // ── Aircraft CRUD ───────────────────────────────────────────
  const handleDeleteAircraft = async (id) => {
    if (!window.confirm(`Delete aircraft ${id}? This may fail if flights reference it.`)) return
    try {
      await deleteAircraft(id)
      flash('success', `Aircraft ${id} deleted.`)
      const r = await getAircraft(); setAircrafts(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to delete aircraft.')
    }
  }

  const startEditAircraft = (a) => setEditingAircraft({ ...a })

  const submitEditAircraft = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await updateAircraft(editingAircraft.AircraftID, {
        Model: editingAircraft.Model,
        Capacity: Number(editingAircraft.Capacity),
        AirlineID: editingAircraft.AirlineID
      })
      flash('success', `Aircraft ${editingAircraft.AircraftID} updated.`)
      setEditingAircraft(null)
      const r = await getAircraft(); setAircrafts(r.data)
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to update aircraft.')
    } finally { setLoading(false) }
  }

  // ── Auth gate ────────────────────────────────────────────────
  if (!authed) return (
    <div className="admin-gate page-enter">
      <form onSubmit={login} className="gate-card">
        <div className="gate-icon">⬡</div>
        <h2 className="gate-title">Admin Access</h2>
        <p className="label" style={{ textAlign: 'center', marginBottom: 20 }}>
          Enter admin password to continue
        </p>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="••••••••"
            autoFocus
          />
        </div>
        {pwError && <div className="alert alert-error">Incorrect password.</div>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Enter →
        </button>
        <p className="gate-hint label">Default: admin123 — change in Admin.jsx</p>
      </form>
    </div>
  )

  const TABS = [
    { id: 'flight',   label: 'Add Flight' },
    { id: 'airline',  label: 'Add Airline' },
    { id: 'airport',  label: 'Add Airport' },
    { id: 'aircraft', label: 'Add Aircraft' },
    { id: 'view',     label: 'View All' },
  ]

  return (
    <div className="admin page-enter container">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Panel</h1>
          <p className="label" style={{ marginTop: 4 }}>Manage flights, airlines, airports and aircraft</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setAuthed(false)}>
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Flash message */}
      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: 20 }}>
          {msg.text}
        </div>
      )}

      {/* ── Add Flight ── */}
      {tab === 'flight' && (
        <form onSubmit={submitFlight} className="admin-form card">
          <h3 className="admin-form-title">New Flight</h3>
          <div className="divider" style={{ margin: '12px 0 20px' }} />
          <div className="grid-2">
            <div className="field">
              <label>Flight ID</label>
              <input placeholder="e.g. AI203" value={flightForm.FlightID}
                onChange={setF(setFlightForm)('FlightID')} required />
            </div>
            <div className="field">
              <label>Cost (₹)</label>
              <input type="number" min="0" placeholder="4500" value={flightForm.Cost}
                onChange={setF(setFlightForm)('Cost')} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Departure Time</label>
              <input type="datetime-local" value={flightForm.DeptTime}
                onChange={setF(setFlightForm)('DeptTime')} required />
            </div>
            <div className="field">
              <label>Arrival Time</label>
              <input type="datetime-local" value={flightForm.ArrivalTime}
                onChange={setF(setFlightForm)('ArrivalTime')} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Airline</label>
              <select value={flightForm.AirlineID} onChange={setF(setFlightForm)('AirlineID')} required>
                <option value="">Select airline</option>
                {airlines.map(a => <option key={a.AirlineID} value={a.AirlineID}>{a.AirlineID} — {a.AirlineName}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Aircraft</label>
              <select value={flightForm.AircraftID} onChange={setF(setFlightForm)('AircraftID')} required>
                <option value="">Select aircraft</option>
                {aircrafts.map(a => <option key={a.AircraftID} value={a.AircraftID}>{a.AircraftID} — {a.Model}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Departure Airport</label>
              <select value={flightForm.DepartureAirport} onChange={setF(setFlightForm)('DepartureAirport')} required>
                <option value="">Select airport</option>
                {airports.map(a => <option key={a.AirportCode} value={a.AirportCode}>{a.AirportCode} — {a.City}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Arrival Airport</label>
              <select value={flightForm.ArrivalAirport} onChange={setF(setFlightForm)('ArrivalAirport')} required>
                <option value="">Select airport</option>
                {airports.map(a => <option key={a.AirportCode} value={a.AirportCode}>{a.AirportCode} — {a.City}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add Flight →'}
          </button>
        </form>
      )}

      {/* ── Add Airline ── */}
      {tab === 'airline' && (
        <form onSubmit={submitAirline} className="admin-form card">
          <h3 className="admin-form-title">New Airline</h3>
          <div className="divider" style={{ margin: '12px 0 20px' }} />
          <div className="grid-3">
            <div className="field">
              <label>Airline ID</label>
              <input placeholder="e.g. UK" value={airlineForm.AirlineID}
                onChange={setF(setAirlineForm)('AirlineID')} required />
            </div>
            <div className="field">
              <label>Airline Name</label>
              <input placeholder="Vistara" value={airlineForm.AirlineName}
                onChange={setF(setAirlineForm)('AirlineName')} required />
            </div>
            <div className="field">
              <label>Owner</label>
              <input placeholder="Tata SIA Airlines" value={airlineForm.Owner}
                onChange={setF(setAirlineForm)('Owner')} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add Airline →'}
          </button>
        </form>
      )}

      {/* ── Add Airport ── */}
      {tab === 'airport' && (
        <form onSubmit={submitAirport} className="admin-form card">
          <h3 className="admin-form-title">New Airport</h3>
          <div className="divider" style={{ margin: '12px 0 20px' }} />
          <div className="grid-2">
            <div className="field">
              <label>IATA Code</label>
              <input placeholder="HYD" maxLength={3} value={airportForm.AirportCode}
                onChange={setF(setAirportForm)('AirportCode')} required />
            </div>
            <div className="field">
              <label>Terminal</label>
              <input placeholder="T1" value={airportForm.Terminal}
                onChange={setF(setAirportForm)('Terminal')} />
            </div>
          </div>
          <div className="field">
            <label>Airport Name</label>
            <input placeholder="Rajiv Gandhi International Airport" value={airportForm.AirportName}
              onChange={setF(setAirportForm)('AirportName')} required />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>City</label>
              <input placeholder="Hyderabad" value={airportForm.City}
                onChange={setF(setAirportForm)('City')} required />
            </div>
            <div className="field">
              <label>Country</label>
              <input placeholder="India" value={airportForm.Country}
                onChange={setF(setAirportForm)('Country')} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add Airport →'}
          </button>
        </form>
      )}

      {/* ── Add Aircraft ── */}
      {tab === 'aircraft' && (
        <form onSubmit={submitAircraft} className="admin-form card">
          <h3 className="admin-form-title">New Aircraft</h3>
          <div className="divider" style={{ margin: '12px 0 20px' }} />
          <div className="grid-2">
            <div className="field">
              <label>Aircraft ID (Tail No.)</label>
              <input placeholder="VT-XYZ" value={aircraftForm.AircraftID}
                onChange={setF(setAircraftForm)('AircraftID')} required />
            </div>
            <div className="field">
              <label>Model</label>
              <input placeholder="Airbus A321" value={aircraftForm.Model}
                onChange={setF(setAircraftForm)('Model')} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Capacity</label>
              <input type="number" min="1" placeholder="200" value={aircraftForm.Capacity}
                onChange={setF(setAircraftForm)('Capacity')} required />
            </div>
            <div className="field">
              <label>Airline</label>
              <select value={aircraftForm.AirlineID} onChange={setF(setAircraftForm)('AirlineID')} required>
                <option value="">Select airline</option>
                {airlines.map(a => <option key={a.AirlineID} value={a.AirlineID}>{a.AirlineID} — {a.AirlineName}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add Aircraft →'}
          </button>
        </form>
      )}

      {/* ── View All ── */}
      {tab === 'view' && (
        <div className="admin-view">
          <div className="admin-view-section">
            <h3 className="admin-form-title">Flights ({flights.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Airline</th><th>Aircraft</th><th>Dep</th><th>Arr</th><th>Dep Time</th><th>Arr Time</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  {flights.map(f => (
                    <tr key={f.FlightID}>
                      <td className="mono" style={{ color: 'var(--amber)' }}>{f.FlightID}</td>
                      <td className="mono">{f.AirlineID}</td>
                      <td className="mono">{f.AircraftID}</td>
                      <td className="mono">{f.DepartureAirport}</td>
                      <td className="mono">{f.ArrivalAirport}</td>
                      <td>{new Date(f.DeptTime).toLocaleString()}</td>
                      <td>{new Date(f.ArrivalTime).toLocaleString()}</td>
                      <td>₹{f.Cost}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEditFlight(f)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{color: 'var(--red)'}} onClick={() => handleDeleteFlight(f.FlightID)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-view-section">
            <h3 className="admin-form-title">Airlines ({airlines.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Name</th><th>Owner</th><th>Actions</th></tr></thead>
                <tbody>
                  {airlines.map(a => (
                    <tr key={a.AirlineID}>
                      <td className="mono">{a.AirlineID}</td>
                      <td>{a.AirlineName}</td>
                      <td>{a.Owner}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEditAirline(a)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{color: 'var(--red)'}} onClick={() => handleDeleteAirline(a.AirlineID)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-view-section">
            <h3 className="admin-form-title">Airports ({airports.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Code</th><th>Name</th><th>City</th><th>Terminal</th><th>Actions</th></tr></thead>
                <tbody>
                  {airports.map(a => (
                    <tr key={a.AirportCode}>
                      <td className="mono" style={{ color: 'var(--amber)' }}>{a.AirportCode}</td>
                      <td>{a.AirportName}</td>
                      <td>{a.City}</td>
                      <td className="mono">{a.Terminal || '—'}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEditAirport(a)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{color: 'var(--red)'}} onClick={() => handleDeleteAirport(a.AirportCode)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-view-section">
            <h3 className="admin-form-title">Aircraft ({aircrafts.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Tail No.</th><th>Model</th><th>Capacity</th><th>Airline</th><th>Actions</th></tr></thead>
                <tbody>
                  {aircrafts.map(a => (
                    <tr key={a.AircraftID}>
                      <td className="mono">{a.AircraftID}</td>
                      <td>{a.Model}</td>
                      <td className="mono">{a.Capacity}</td>
                      <td className="mono">{a.AirlineID}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEditAircraft(a)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{color: 'var(--red)'}} onClick={() => handleDeleteAircraft(a.AircraftID)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingFlight && (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={submitEditFlight} className="admin-form card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-form-title">Edit Flight {editingFlight.FlightID}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingFlight(null)}>✕</button>
            </div>
            <div className="divider" style={{ margin: '12px 0 20px' }} />
            <div className="grid-2">
              <div className="field">
                <label>Cost (₹)</label>
                <input type="number" min="0" value={editingFlight.Cost}
                  onChange={e => setEditingFlight({...editingFlight, Cost: e.target.value})} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Departure Time</label>
                <input type="datetime-local" value={editingFlight.DeptTime}
                  onChange={e => setEditingFlight({...editingFlight, DeptTime: e.target.value})} required />
              </div>
              <div className="field">
                <label>Arrival Time</label>
                <input type="datetime-local" value={editingFlight.ArrivalTime}
                  onChange={e => setEditingFlight({...editingFlight, ArrivalTime: e.target.value})} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Airline</label>
                <select value={editingFlight.AirlineID} onChange={e => setEditingFlight({...editingFlight, AirlineID: e.target.value})} required>
                  <option value="">Select airline</option>
                  {airlines.map(a => <option key={a.AirlineID} value={a.AirlineID}>{a.AirlineID} — {a.AirlineName}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Aircraft</label>
                <select value={editingFlight.AircraftID} onChange={e => setEditingFlight({...editingFlight, AircraftID: e.target.value})} required>
                  <option value="">Select aircraft</option>
                  {aircrafts.map(a => <option key={a.AircraftID} value={a.AircraftID}>{a.AircraftID} — {a.Model}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Departure Airport</label>
                <select value={editingFlight.DepartureAirport} onChange={e => setEditingFlight({...editingFlight, DepartureAirport: e.target.value})} required>
                  <option value="">Select airport</option>
                  {airports.map(a => <option key={a.AirportCode} value={a.AirportCode}>{a.AirportCode} — {a.City}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Arrival Airport</label>
                <select value={editingFlight.ArrivalAirport} onChange={e => setEditingFlight({...editingFlight, ArrivalAirport: e.target.value})} required>
                  <option value="">Select airport</option>
                  {airports.map(a => <option key={a.AirportCode} value={a.AirportCode}>{a.AirportCode} — {a.City}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 20 }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ── Edit Airline Modal ── */}
      {editingAirline && (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={submitEditAirline} className="admin-form card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-form-title">Edit Airline {editingAirline.AirlineID}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingAirline(null)}>✕</button>
            </div>
            <div className="divider" style={{ margin: '12px 0 20px' }} />
            <div className="field">
              <label>Airline Name</label>
              <input value={editingAirline.AirlineName}
                onChange={e => setEditingAirline({...editingAirline, AirlineName: e.target.value})} required />
            </div>
            <div className="field">
              <label>Owner</label>
              <input value={editingAirline.Owner}
                onChange={e => setEditingAirline({...editingAirline, Owner: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 20 }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ── Edit Airport Modal ── */}
      {editingAirport && (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={submitEditAirport} className="admin-form card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-form-title">Edit Airport {editingAirport.AirportCode}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingAirport(null)}>✕</button>
            </div>
            <div className="divider" style={{ margin: '12px 0 20px' }} />
            <div className="field">
              <label>Airport Name</label>
              <input value={editingAirport.AirportName}
                onChange={e => setEditingAirport({...editingAirport, AirportName: e.target.value})} required />
            </div>
            <div className="grid-2">
              <div className="field">
                <label>City</label>
                <input value={editingAirport.City}
                  onChange={e => setEditingAirport({...editingAirport, City: e.target.value})} required />
              </div>
              <div className="field">
                <label>Country</label>
                <input value={editingAirport.Country}
                  onChange={e => setEditingAirport({...editingAirport, Country: e.target.value})} required />
              </div>
            </div>
            <div className="field">
              <label>Terminal</label>
              <input value={editingAirport.Terminal || ''}
                onChange={e => setEditingAirport({...editingAirport, Terminal: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 20 }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ── Edit Aircraft Modal ── */}
      {editingAircraft && (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={submitEditAircraft} className="admin-form card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-form-title">Edit Aircraft {editingAircraft.AircraftID}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingAircraft(null)}>✕</button>
            </div>
            <div className="divider" style={{ margin: '12px 0 20px' }} />
            <div className="field">
              <label>Model</label>
              <input value={editingAircraft.Model}
                onChange={e => setEditingAircraft({...editingAircraft, Model: e.target.value})} required />
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Capacity</label>
                <input type="number" min="1" value={editingAircraft.Capacity}
                  onChange={e => setEditingAircraft({...editingAircraft, Capacity: e.target.value})} required />
              </div>
              <div className="field">
                <label>Airline</label>
                <select value={editingAircraft.AirlineID} onChange={e => setEditingAircraft({...editingAircraft, AirlineID: e.target.value})} required>
                  <option value="">Select airline</option>
                  {airlines.map(a => <option key={a.AirlineID} value={a.AirlineID}>{a.AirlineID} — {a.AirlineName}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 20 }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
