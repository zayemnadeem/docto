import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const specialties = ["General Physician", "Pediatrician", "Gynecologist", "Surgeon", "Cardiologist", "Dermatologist", "Orthopedic", "Neurologist", "Psychiatrist", "Ophthalmologist", "ENT", "Dentist"];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/admin/doctors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDoctors(res.data.data || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = doctors.filter(d => {
    const matchSearch = d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !specialty || d.specialization === specialty;
    return matchSearch && matchSpec;
  });

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl text-[#111827] mb-8" style={{ fontFamily: 'Instrument Serif, serif' }}>
          Manage Doctors
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-grow max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="manage-doctors-search"
              type="text"
              placeholder="Search doctors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 border border-[#e5e7eb] rounded-full px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
            />
          </div>
          <select
            id="manage-doctors-specialty"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            className="border border-[#e5e7eb] rounded-full px-4 py-2.5 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]"
          >
            <option value="">All Specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {['Doctor', 'Specialty', 'Status', 'Plan', 'Joined', 'Action'].map(h => (
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
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-[#9ca3af]">No doctors found.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center text-xs font-medium text-[#374151]" style={{ fontFamily: 'Instrument Serif, serif' }}>
                        {d.full_name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{d.full_name}</p>
                        <p className="text-xs text-[#9ca3af]">{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f3f4f6] text-[#374151]">{d.specialization}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${d.is_verified ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fef3c7] text-[#92400e]'}`}>
                      {d.is_verified ? '✓ Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f3f4f6] text-[#374151]">
                      {d.subscription_plan || 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#9ca3af]">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      id={`view-doctor-admin-${d.id}`}
                      className="border border-[#e5e7eb] text-[#374151] rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#f8f9fb] transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
