import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const patientLinks = [
    { to: '/', label: 'Find Doctors' },
    { to: '/pricing', label: 'For Doctors' },
  ];
  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/earnings', label: 'Earnings' },
    { to: '/doctor/settings', label: 'Settings' },
  ];
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/users', label: 'Users' },
  ];

  const navLinks = role === 'doctor' ? doctorLinks : role === 'admin' ? adminLinks : patientLinks;

  return (
    <nav className="bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="/docto-logo.jpg"
              alt="Docto"
              className="h-12 md:h-14 w-auto"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
            />
            <span className="hidden text-xl font-semibold text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>DOCTO</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="nav-avatar-btn"
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e7eb] hover:border-[#111827] transition-all text-sm font-medium text-[#111827]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-semibold">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user.full_name?.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 text-[#9ca3af] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e5e7eb] rounded-2xl shadow-lg py-1 overflow-hidden">
                    {role === 'patient' && (
                      <>
                        <Link to="/patient/bookings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8f9fb] transition-colors">My Bookings</Link>
                        <Link to="/patient/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8f9fb] transition-colors">Profile</Link>
                      </>
                    )}
                    {role === 'doctor' && doctorLinks.map(link => (
                      <Link key={link.to} to={link.to} onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8f9fb] transition-colors">{link.label}</Link>
                    ))}
                    {role === 'admin' && adminLinks.map(link => (
                      <Link key={link.to} to={link.to} onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8f9fb] transition-colors">{link.label}</Link>
                    ))}
                    <div className="border-t border-[#e5e7eb] mt-1">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-[#ef4444] hover:bg-[#f8f9fb] transition-colors">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className="border border-[#e5e7eb] text-[#111827] rounded-full px-6 py-2 text-sm font-medium hover:bg-[#f8f9fb] transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  id="nav-signup-btn"
                  className="bg-[#111827] text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-[#374151] transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            id="nav-mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-[#374151] hover:bg-[#f8f9fb] transition"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#e5e7eb] py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f8f9fb] rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {role === 'patient' && (
                  <>
                    <Link to="/patient/bookings" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f8f9fb] rounded-xl transition-colors">My Bookings</Link>
                    <Link to="/patient/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f8f9fb] rounded-xl transition-colors">Profile</Link>
                  </>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-[#ef4444] hover:bg-[#f8f9fb] rounded-xl transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 px-4">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="border border-[#e5e7eb] text-[#111827] rounded-full px-6 py-2 text-sm font-medium text-center hover:bg-[#f8f9fb] transition">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="bg-[#111827] text-white rounded-full px-6 py-2 text-sm font-medium text-center hover:bg-[#374151] transition">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
