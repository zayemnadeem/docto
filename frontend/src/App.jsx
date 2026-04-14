import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/patient/Home';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookingConfirm from './pages/patient/BookingConfirm';
import MyBookings from './pages/patient/MyBookings';
import PatientProfile from './pages/patient/PatientProfile';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ManageSlots from './pages/doctor/ManageSlots';
import Appointments from './pages/doctor/Appointments';
import Earnings from './pages/doctor/Earnings';
import Analytics from './pages/doctor/Analytics';
import DoctorSettings from './pages/doctor/DoctorSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';

function PrivateRoute({ children, role }) {
  const { user, loading, role: userRole } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <img src="/doctonewlogo.jpeg" alt="Docto" className="h-16 md:h-20 opacity-80 animate-pulse" />
        <div className="w-6 h-6 border-2 border-[#1a9e8f] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />

          {/* Protected Patient Routes */}
          <Route path="/patient/bookings" element={<PrivateRoute role="patient"><MyBookings /></PrivateRoute>} />
          <Route path="/patient/profile" element={<PrivateRoute role="patient"><PatientProfile /></PrivateRoute>} />
          <Route path="/booking/:id/confirm" element={<PrivateRoute role="patient"><BookingConfirm /></PrivateRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
          <Route path="/doctor/slots" element={<PrivateRoute role="doctor"><ManageSlots /></PrivateRoute>} />
          <Route path="/doctor/appointments" element={<PrivateRoute role="doctor"><Appointments /></PrivateRoute>} />
          <Route path="/doctor/earnings" element={<PrivateRoute role="doctor"><Earnings /></PrivateRoute>} />
          <Route path="/doctor/analytics" element={<PrivateRoute role="doctor"><Analytics /></PrivateRoute>} />
          <Route path="/doctor/settings" element={<PrivateRoute role="doctor"><DoctorSettings /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/doctors" element={<PrivateRoute role="admin"><ManageDoctors /></PrivateRoute>} />
          <Route path="/admin/bookings" element={<PrivateRoute role="admin"><ManageBookings /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute role="admin"><ManageUsers /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

