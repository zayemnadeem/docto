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
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';
import Navbar from './components/Navbar';

function PrivateRoute({ children, role }) {
  const { user, loading, role: userRole } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Patient Routes */}
          <Route path="/" element={<Home />} />
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
