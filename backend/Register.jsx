import { useState } from 'react'
import { registerPassenger } from '../api'
import './Register.css'

const empty = {
  IdentificationID: '', IDType: 'Aadhar',
  FirstName: '', LastName: '', Email: '', Phone: '', Age: '', Gender: 'Male'
}

export default function Register() {
  const [form, setForm]       = useState(empty)
  const [submitting, setSub]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSub(true)
    try {
      await registerPassenger({ ...form, Age: Number(form.Age) })
      setSuccess(true)
      setForm(empty)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setSub(false)
    }
  }

  return (
    <div className="register page-enter container">
      <div className="reg-layout">
        {/* Left: info panel */}
        <div className="reg-info">
          <div className="reg-eyebrow label">New Passenger</div>
          <h1 className="reg-title">Create your<br />passenger profile.</h1>
          <p className="reg-sub">
            Register once with your Aadhar, Passport, or any valid ID to book any flight on the system.
          </p>
          <div className="reg-bullets">
            {[
              'Supports Aadhar, Passport, Driving License & Voter ID',
              'Book flights with co-passengers',
              'Track all your bookings in one place',
            ].map((txt, i) => (
              <div key={i} className="reg-bullet">
                <span className="reg-bullet-dot">✦</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>
          <div className="reg-deco" />
        </div>

        {/* Right: form */}
        <div className="reg-form-col">
          {success && (
            <div className="reg-success">
              <div className="reg-success-icon">✓</div>
              <div>
                <p className="reg-success-title">Registered successfully!</p>
                <p className="label" style={{ marginTop: 4 }}>You can now search and book flights.</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSuccess(false)}>
                Register another
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card reg-form">
            <h3 className="reg-form-title">Passenger Details</h3>
            <div className="divider" style={{ margin: '12px 0 20px' }} />

            <div className="grid-2">
              <div className="field">
                <label>ID Type</label>
                <select value={form.IDType} onChange={set('IDType')}>
                  <option>Aadhar</option>
                  <option>Passport</option>
                  <option>Driving License</option>
                  <option>Voter ID</option>
                </select>
              </div>
              <div className="field">
                <label>Identification ID</label>
                <input
                  placeholder={form.IDType === 'Aadhar' ? '1234 5678 9012' : form.IDType === 'Passport' ? 'P1234567' : 'Enter ID'}
                  value={form.IdentificationID}
                  onChange={set('IdentificationID')}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>First Name</label>
                <input placeholder="Kshitij" value={form.FirstName} onChange={set('FirstName')} required />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input placeholder="Verma" value={form.LastName} onChange={set('LastName')} required />
              </div>
            </div>

            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="you@email.com" value={form.Email} onChange={set('Email')} required />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Phone</label>
                <input placeholder="9876543210" value={form.Phone} onChange={set('Phone')} required />
              </div>
              <div className="field">
                <label>Age</label>
                <input type="number" min="1" max="120" placeholder="20" value={form.Age} onChange={set('Age')} required />
              </div>
            </div>

            <div className="field">
              <label>Gender</label>
              <select value={form.Gender} onChange={set('Gender')}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={submitting}>
              {submitting ? 'Registering…' : 'Register Passenger →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
