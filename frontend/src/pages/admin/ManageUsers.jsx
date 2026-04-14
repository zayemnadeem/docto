import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(res.data.data || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          Manage Users
        </h1>

        {/* Search */}
        <div className="relative max-w-xs mb-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="manage-users-search"
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 border border-[#e5e7eb] rounded-full px-4 py-2.5 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {['Name', 'Email', 'Phone', 'Joined', 'Bookings'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 skeleton rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-[#9ca3af]">No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e6f7f5] border border-[#c8e8e5] flex items-center justify-center text-xs font-medium text-[#1a9e8f]">
                        {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-[#0d2b28]">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151]">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-[#374151]">{u.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-[#9ca3af]">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151]">{u.booking_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


