import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/patient/Home';
import DoctorList from './pages/patient/DoctorList';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookingConfirm from './pages/patient/BookingConfirm';
import MyBookings from './pages/patient/MyBookings';
import PatientProfile from './pages/patient/PatientProfile';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<DoctorList />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          
          <Route path="/patient/bookings" element={<PrivateRoute role="patient"><MyBookings /></PrivateRoute>} />
          <Route path="/patient/profile" element={<PrivateRoute role="patient"><PatientProfile /></PrivateRoute>} />
          <Route path="/booking/:id/confirm" element={<PrivateRoute role="patient"><BookingConfirm /></PrivateRoute>} />
          
          <Route path="/doctor/dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
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
