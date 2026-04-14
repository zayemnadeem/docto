import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

const STATUS_STYLES = {
  confirmed: 'bg-[#fef3c7] text-[#92400e]',
  completed: 'bg-[#d1fae5] text-[#065f46]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  no_show: 'bg-[#e6f7f5] text-[#1a9e8f]',
};

const TABS = ['Today', 'Upcoming', 'All'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('Today');

  const fetchAppts = async () => {
    try {
      const res = await axios.get(`${API_URL}/doctors/me/appointments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(res.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAppts(); }, []);

  const markComplete = async (id) => {
    try {
      await axios.patch(`${API_URL}/doctors/me/appointments/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAppts();
    } catch (e) { alert("Error updating status"); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const filterAppts = (tab) => {
    const today = new Date().toISOString().split('T')[0];
    if (tab === 'Today') return appointments.filter(a => a.slot?.date === today);
    if (tab === 'Upcoming') return appointments.filter(a => a.slot?.date >= today && a.booking.status === 'confirmed');
    return appointments;
  };

  const filtered = filterAppts(activeTab);

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          Appointments
        </h1>

        {/* Tab Strip */}
        <div className="flex gap-1 bg-[#f8f9fb] rounded-full p-1 w-fit mb-6 border border-[#e5e7eb]">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`appts-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[#1a9e8f] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#1a9e8f]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {['Patient', 'Date & Time', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#9ca3af]">
                    No appointments in this category.
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr key={a.booking.id} className="hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e6f7f5] border border-[#c8e8e5] flex items-center justify-center text-xs font-medium text-[#1a9e8f]">
                        {a.patient?.full_name?.charAt(0) || 'P'}
                      </div>
                      <span className="text-sm font-medium text-[#0d2b28]">{a.patient?.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151]">
                    {formatDate(a.slot?.date)} Â· {formatTime(a.slot?.start_time)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[a.booking.status] || STATUS_STYLES.confirmed}`}>
                      {a.booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {a.booking.status === 'confirmed' && (
                      <button
                        id={`complete-appt-${a.booking.id}`}
                        onClick={() => markComplete(a.booking.id)}
                        className="bg-[#1a9e8f] text-white rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#158577] transition"
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Stack */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[#9ca3af]">No appointments in this category.</p>
            </div>
          ) : filtered.map(a => (
            <div key={a.booking.id} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[#0d2b28] text-sm">{a.patient?.full_name}</p>
                  <p className="text-xs text-[#9ca3af] mt-1">{formatDate(a.slot?.date)} Â· {formatTime(a.slot?.start_time)}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[a.booking.status] || STATUS_STYLES.confirmed}`}>
                  {a.booking.status}
                </span>
              </div>
              {a.booking.status === 'confirmed' && (
                <button
                  onClick={() => markComplete(a.booking.id)}
                  className="mt-3 bg-[#1a9e8f] text-white rounded-full px-4 py-2 text-xs font-medium hover:bg-[#158577] transition w-full"
                >
                  Mark Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


