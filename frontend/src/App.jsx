import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import BookFlight from './pages/BookFlight'
import Payment from './pages/Payment'
import MyBookings from './pages/MyBookings'
import Register from './pages/Register'
import Login from './pages/Login'
import Admin from './pages/Admin'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/results"            element={<SearchResults />} />
          <Route path="/book/:flightId"     element={<BookFlight />} />
          <Route path="/payment/:bookingId" element={<Payment />} />
          <Route path="/my-bookings"        element={<MyBookings />} />
          <Route path="/register"           element={<Register />} />
          <Route path="/login"              element={<Login />} />
          <Route path="/admin"              element={<Admin />} />
        </Routes>
      </main>
    </>
  )
}
