
import { Route, Routes } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import DashboardLayout from './layouts/DashboardLayout'
import { RequireAdmin, RequireUser } from './routes/RequireAuth'

import Home from './pages/site/Home'
import Login from './pages/site/Login'
import Register from './pages/site/Register'
import {
  About, BookingSuccess, NotFound, Support,
} from './pages/site/stubs'
import Account from './pages/site/Account'
import Results from './pages/site/Results'
import Booking from './pages/site/Booking'
import AdminLogin from './pages/dashboard/AdminLogin'
import Cities from './pages/dashboard/Cities'
import Overview from './pages/dashboard/Overview'
import AdminTrips from './pages/dashboard/Trips'
import AdminBookings from './pages/dashboard/Bookings'
import AdminCompanies from './pages/dashboard/Companies'
import AdminUsers from './pages/dashboard/Users'
import Companies from "./pages/site/Companies";
import MyBookings from './pages/site/MyBookings'
import Tracking from './pages/site/Tracking'
export default function App() {
  return (
    <Routes>
      {/* ===== الموقع ===== */}
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="trips" element={<Results />} />
        <Route path="companies" element={<Companies />} />
        <Route path="about" element={<About />} />
        <Route path="support" element={<Support />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* بدها تسجيل دخول */}
        <Route element={<RequireUser />}>
          <Route path="trips/:id/book" element={<Booking />} />
          <Route path="booking/success/:id" element={<BookingSuccess />} />
          <Route
          path="/my-bookings"
          element={<MyBookings />}
        />
        <Route path="companies" element={<Companies />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="account" element={<Account />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ===== الداشبورد ===== */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<RequireAdmin />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="trips" element={<AdminTrips />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="cities" element={<Cities />} />
        </Route>
      </Route>
    </Routes>
  )
}
