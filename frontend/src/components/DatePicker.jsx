import { useState, useRef, useEffect } from 'react'
import './DatePicker.css'

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

export default function DatePicker({ value, onChange, placeholder = 'Select date' }) {
  const today     = new Date()
  const initDate  = value ? new Date(value + 'T00:00:00') : null
  const initView  = initDate || today

  const [open,     setOpen]     = useState(false)
  const [viewYear, setViewYear] = useState(initView.getFullYear())
  const [viewMonth,setViewMonth]= useState(initView.getMonth())
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Build calendar grid
  const firstDay  = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const selectDay = (day) => {
    if (!day) return
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${viewYear}-${m}-${d}`)
    setOpen(false)
  }

  const isSelected = (day) => {
    if (!day || !value) return false
    const [y, m, d] = value.split('-').map(Number)
    return y === viewYear && m - 1 === viewMonth && d === day
  }

  const isToday = (day) => {
    if (!day) return false
    return today.getFullYear() === viewYear &&
           today.getMonth()    === viewMonth &&
           today.getDate()     === day
  }

  const isPast = (day) => {
    if (!day) return false
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0,0,0,0)
    const t = new Date(); t.setHours(0,0,0,0)
    return d < t
  }

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className="dp-wrap" ref={ref}>
      <button
        type="button"
        className={`dp-trigger ${open ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg className="dp-cal-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
        </svg>
        <span className={displayValue ? 'dp-value' : 'dp-placeholder'}>
          {displayValue || placeholder}
        </span>
        {value && (
          <span className="dp-clear" onClick={(e) => { e.stopPropagation(); onChange('') }}>✕</span>
        )}
      </button>

      {open && (
        <div className="dp-popover">
          {/* Header */}
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="dp-month-label">
              {MONTHS[viewMonth]} <span className="dp-year">{viewYear}</span>
            </span>
            <button type="button" className="dp-nav" onClick={nextMonth}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="dp-day-names">
            {DAYS.map(d => <span key={d} className="dp-day-name">{d}</span>)}
          </div>

          {/* Grid */}
          <div className="dp-grid">
            {cells.map((day, i) => (
              <button
                key={i}
                type="button"
                className={`dp-cell
                  ${!day ? 'empty' : ''}
                  ${isSelected(day) ? 'selected' : ''}
                  ${isToday(day) && !isSelected(day) ? 'today' : ''}
                  ${isPast(day) ? 'past' : ''}
                `}
                onClick={() => selectDay(day)}
                disabled={!day || isPast(day)}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="dp-footer">
            <button type="button" className="dp-today-btn" onClick={() => {
              setViewYear(today.getFullYear())
              setViewMonth(today.getMonth())
              selectDay(today.getDate())
            }}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
