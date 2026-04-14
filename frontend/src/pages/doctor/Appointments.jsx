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
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setAppointments(res.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAppts(); }, []);

  const markComplete = async (id) => {
    try {
      await axios.patch(`${API_URL}/doctors/me/appointments/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchAppts();
    } catch (e) { alert("Error updating status"); }
  };

  const applyDelay = async (id) => {
    const minStr = window.prompt("Enter delay (in minutes, max 30). The patient gets 10% off for waiting:");
    if (!minStr) return;
    const min = parseInt(minStr, 10);
    if (isNaN(min) || min <= 0 || min > 30) {
      alert("Invalid delay amount. Must be between 1 and 30.");
      return;
    }
    try {
      await axios.patch(`${API_URL}/doctors/me/appointments/${id}/delay?delay_minutes=${min}`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchAppts();
    } catch (e) { alert(e.response?.data?.detail || "Error applying delay"); }
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
                    {formatDate(a.slot?.date)} · {formatTime(a.slot?.start_time)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[a.booking.status] || STATUS_STYLES.confirmed}`}>
                      {a.booking.status}
                    </span>
                    {a.booking.is_emergency && <span className="ml-2 text-[10px] font-bold bg-[#fee2e2] text-[#991b1b] px-2 py-0.5 rounded uppercase align-middle">Emergency</span>}
                    {a.booking.delay_minutes > 0 && <span className="ml-2 text-[10px] font-bold bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded uppercase align-middle">Delayed {a.booking.delay_minutes}m</span>}
                    {a.slot?.is_online && <span className="ml-2 text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] px-2 py-0.5 rounded uppercase align-middle">Online</span>}
                  </td>
                  <td className="px-6 py-4">
                    {a.booking.status === 'confirmed' && (
                      <div className="flex flex-wrap gap-2 items-center">
                        {a.slot?.is_online && (
                          <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="text-white bg-[#2563eb] border border-[#1e40af] hover:bg-[#1d4ed8] px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Join
                          </a>
                        )}
                        <button
                          id={`complete-appt-${a.booking.id}`}
                          onClick={() => markComplete(a.booking.id)}
                          className="bg-[#1a9e8f] text-white rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#158577] transition"
                        >
                          Mark Complete
                        </button>
                        {!a.booking.is_emergency && !a.booking.delay_minutes && (
                          <button
                            onClick={() => applyDelay(a.booking.id)}
                            className="border border-[#e5e7eb] text-[#374151] bg-[#f9fafb] rounded-full px-3 py-1.5 text-xs font-medium hover:bg-[#f3f4f6]"
                          >
                            Set Delay
                          </button>
                        )}
                      </div>
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
                  <p className="text-xs text-[#9ca3af] mt-1">{formatDate(a.slot?.date)} · {formatTime(a.slot?.start_time)}</p>
                </div>
                <div>
                  <span className={`inline-block mb-1 text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[a.booking.status] || STATUS_STYLES.confirmed}`}>
                    {a.booking.status}
                  </span>
                  {a.booking.is_emergency && <span className="ml-2 inline-block text-[10px] font-bold bg-[#fee2e2] text-[#991b1b] px-2 py-0.5 rounded uppercase">Emergency</span>}
                  {a.booking.delay_minutes > 0 && <span className="ml-2 inline-block text-[10px] font-bold bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded uppercase">Delayed {a.booking.delay_minutes}m</span>}
                  {a.slot?.is_online && <span className="ml-2 inline-block text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] px-2 py-0.5 rounded uppercase">Online</span>}
                </div>
              </div>
              {a.booking.status === 'confirmed' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.slot?.is_online && (
                    <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="w-full justify-center flex items-center gap-1.5 text-white bg-[#2563eb] rounded-full py-2 text-xs font-medium hover:bg-[#1d4ed8] transition shadow-sm mb-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Join Video Call
                    </a>
                  )}
                  <button
                    onClick={() => markComplete(a.booking.id)}
                    className="flex-1 bg-[#1a9e8f] text-white rounded-full py-2 text-xs font-medium hover:bg-[#158577] transition"
                  >
                    Mark Complete
                  </button>
                  {!a.booking.is_emergency && !a.booking.delay_minutes && (
                    <button
                      onClick={() => applyDelay(a.booking.id)}
                      className="border border-[#e5e7eb] text-[#374151] bg-[#f9fafb] rounded-full px-4 py-2 text-xs font-medium hover:bg-[#f3f4f6]"
                    >
                      Delay
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


