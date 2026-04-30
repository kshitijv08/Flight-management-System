import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Flights ──────────────────────────────────────────────────
export const searchFlights = (from, to, date) =>
  api.get('/flights', { params: { from_airport: from, to_airport: to, travel_date: date } })

export const getFlight = (id) => api.get(`/flights/${id}`)
export const getFlights = () => api.get('/flights')
export const getBookedSeats = (flightId) => api.get(`/flights/${flightId}/seats`)
export const createFlight = (data) => api.post('/flights', data)
export const updateFlight = (id, data) => api.put(`/flights/${id}`, data)
export const deleteFlight = (id) => api.delete(`/flights/${id}`)
export const getAircraft = () => api.get('/aircraft')
export const updateAircraft = (id, data) => api.put(`/aircraft/${id}`, data)
export const deleteAircraft = (id) => api.delete(`/aircraft/${id}`)

// ── Passengers ───────────────────────────────────────────────
export const registerPassenger = (data) => api.post('/passengers', data)
export const loginPassenger = (data) => api.post('/passengers/login', data)
export const getPassenger = (id) => api.get(`/passengers/${id}`)
export const getPassengerBookings = (id) => api.get(`/passengers/${id}/bookings`)

// ── Bookings ─────────────────────────────────────────────────
export const createBooking = (data) => api.post('/bookings', data)
export const getBooking = (id) => api.get(`/bookings/${id}`)
export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { Status: status })

// ── Payments ─────────────────────────────────────────────────
export const createPayment = (data) => api.post('/payments', data)
export const getPaymentByBooking = (bookingId) => api.get(`/payments/booking/${bookingId}`)

// ── Airports ─────────────────────────────────────────────────
export const getAirports = () => api.get('/airports')
export const updateAirport = (code, data) => api.put(`/airports/${code}`, data)
export const deleteAirport = (code) => api.delete(`/airports/${code}`)

// ── Airlines ─────────────────────────────────────────────────
export const getAirlines = () => api.get('/airlines')
export const updateAirline = (id, data) => api.put(`/airlines/${id}`, data)
export const deleteAirline = (id) => api.delete(`/airlines/${id}`)

export default api
