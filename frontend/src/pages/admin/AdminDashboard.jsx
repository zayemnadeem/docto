import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/stats`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(res.data.data);
      } catch (e) { console.error(e); }
    };
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/doctors/pending`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPendingDoctors(res.data.data || []);
      } catch (e) { console.error(e); }
    };
    fetchStats();
    fetchPending();
  }, []);

  const approve = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/doctors/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingDoctors(prev => prev.filter(d => d.id !== id));
    } catch (e) { alert("Error approving doctor"); }
  };

  const reject = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/doctors/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingDoctors(prev => prev.filter(d => d.id !== id));
    } catch (e) { alert("Error rejecting doctor"); }
  };

  if (!stats) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Doctors', value: stats.total_doctors, icon: '🩺' },
    { label: 'Pending Approvals', value: stats.pending_verifications, icon: '⏳', danger: stats.pending_verifications > 0 },
    { label: 'Bookings Today', value: stats.bookings_today, icon: '📅' },
    { label: 'Revenue (All Time)', value: `₹${stats.revenue_total}`, icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Admin Operations
          </h1>
          <div className="flex gap-2">
            {[
              { to: '/admin/doctors', label: 'Doctors' },
              { to: '/admin/bookings', label: 'Bookings' },
              { to: '/admin/users', label: 'Users' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="border border-[#e5e7eb] text-[#374151] rounded-full px-4 py-2 text-sm font-medium hover:bg-[#f8f9fb] transition">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((c, i) => (
            <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 ${c.danger ? 'border-[#fecaca]' : 'border-[#e5e7eb]'}`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide">{c.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl font-semibold ${c.danger ? 'text-[#ef4444]' : 'text-[#111827]'}`} style={{ fontFamily: 'Instrument Serif, serif' }}>
                  {c.value}
                </p>
                {c.danger && c.value > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#ef4444] font-medium">
                    Action needed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>
              Pending Doctor Approvals
            </h2>
            {pendingDoctors.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full bg-[#fee2e2] text-[#ef4444] font-medium">
                {pendingDoctors.length} pending
              </span>
            )}
          </div>
          {pendingDoctors.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#9ca3af]">No pending approvals. All caught up! ✓</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  {['Doctor', 'Specialization', 'Registered', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {pendingDoctors.map(d => (
                  <tr key={d.id} className="hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center text-xs font-medium text-[#374151]" style={{ fontFamily: 'Instrument Serif, serif' }}>
                          {d.full_name?.charAt(0) || 'D'}
                        </div>
                        <span className="text-sm font-medium text-[#111827]">{d.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f3f4f6] text-[#374151]">{d.specialization}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#9ca3af]">{d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          id={`approve-doctor-${d.id}`}
                          onClick={() => approve(d.id)}
                          className="bg-[#10b981] text-white rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#059669] transition"
                        >
                          ✓ Approve
                        </button>
                        <button
                          id={`reject-doctor-${d.id}`}
                          onClick={() => reject(d.id)}
                          className="border border-[#fecaca] text-[#ef4444] rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#fef2f2] transition"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
