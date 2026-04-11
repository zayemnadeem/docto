import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">Docto</Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hello, {user.full_name}</span>
                {role === 'patient' && <Link to="/patient/bookings" className="text-gray-500 hover:text-gray-700">My Bookings</Link>}
                {role === 'doctor' && <Link to="/doctor/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>}
                <button onClick={handleLogout} className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Temporary quick login button for testing */}
                <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-gray-700">Login</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
