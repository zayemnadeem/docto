import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

const STATUS_STYLES = {
  confirmed: 'bg-[#d1fae5] text-[#065f46]',
  pending: 'bg-[#fef3c7] text-[#92400e]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  completed: 'bg-[#e6f7f5] text-[#1a9e8f]',
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/admin/bookings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBookings(res.data.data || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          All Bookings
        </h1>

        {/* Filters */}
        <div className="flex gap-1 bg-[#f8f9fb] rounded-full p-1 w-fit mb-6 border border-[#e5e7eb]">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              id={`bookings-filter-${s}`}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-[#1a9e8f] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#1a9e8f]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {['Booking ID', 'Patient', 'Doctor', 'Date', 'Status', 'Amount'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 skeleton rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-[#9ca3af]">No bookings found.</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-[#9ca3af]">
                    {String(b.id).slice(0, 8)}…
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0d2b28] font-medium">{b.patient?.full_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-[#374151]">{b.doctor?.full_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-[#374151]">{formatDate(b.slot?.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#0d2b28]">₹{b.advance_amount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


