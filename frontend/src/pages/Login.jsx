import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginPassenger } from '../api'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [submitting, setSub] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSub(true)
    try {
      const res = await loginPassenger(form)
      localStorage.setItem('passenger', JSON.stringify(res.data))
      // Redirect to home page or my bookings
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setSub(false)
    }
  }

  return (
    <div className="login page-enter container">
      <div className="login-layout">
        <div className="login-info">
          <div className="login-eyebrow label">Welcome Back</div>
          <h1 className="login-title">Access your<br />passenger account.</h1>
          <p className="login-sub">
            Log in to quickly book flights, manage your reservations, and track your travel history.
          </p>
          <div className="login-deco" />
        </div>

        <div className="login-form-col">
          <form onSubmit={handleSubmit} className="card login-form">
            <h3 className="login-form-title">Login Details</h3>
            <div className="divider" style={{ margin: '12px 0 20px' }} />

            <div className="field">
              <label>Username (First Name)</label>
              <input 
                placeholder="e.g. Kshitij" 
                value={form.username} 
                onChange={set('username')} 
                required 
              />
            </div>

            <div className="field" style={{ marginTop: '16px' }}>
              <label>Password (Identification ID)</label>
              <input 
                type="password"
                placeholder="e.g. 1234 5678 9012" 
                value={form.password} 
                onChange={set('password')} 
                required 
              />
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: '16px' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }} disabled={submitting}>
              {submitting ? 'Logging in…' : 'Login →'}
            </button>
            
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-mute)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
