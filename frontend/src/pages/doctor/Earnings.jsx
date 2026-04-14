import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

export default function Earnings() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(`${API_URL}/doctors/me/earnings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data.data);
      } catch (e) { console.error(e); }
    };
    fetchEarnings();
  }, []);

  if (!data) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#1a9e8f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const summaryCards = [
    { label: 'Total Earned', value: `₹${data.total_earned || 0}`, icon: '💰', color: 'border-[#10b981]' },
    { label: 'Platform Commission', value: `₹${data.platform_commission || 0}`, icon: '🏢', color: 'border-[#f59e0b]' },
    { label: 'Net Payout', value: `₹${data.net_earnings || 0}`, icon: '💳', color: 'border-[#1a9e8f]' },
    { label: 'Pending Payouts', value: `₹${data.pending_payouts || 0}`, icon: '⏳', color: 'border-[#9ca3af]' },
  ];

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          Earnings
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {summaryCards.map((c, i) => (
            <div key={i} className={`bg-white rounded-2xl border-t-4 ${c.color} border border-[#e5e7eb] shadow-sm p-5`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide">{c.label}</p>
              <p className="text-2xl font-semibold text-[#0d2b28] mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Analytics blurred (free plan) */}
        <div className="relative bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 overflow-hidden">
          {/* Blurred chart placeholder */}
          <div className="filter blur-sm pointer-events-none select-none">
            <h2 className="text-xl text-[#0d2b28] mb-4">Monthly Earnings</h2>
            <div className="flex items-end gap-3 h-40 px-4">
              {[40, 65, 35, 80, 55, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-[#e5e7eb] rounded-t-lg" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex gap-3 mt-2 px-4">
              {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map(m => (
                <div key={m} className="flex-1 text-center text-xs text-[#9ca3af]">{m}</div>
              ))}
            </div>
          </div>

          {/* Upgrade Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]">
            <div className="text-center p-6">
              <p className="text-[#0d2b28] font-medium mb-1">
                Analytics Locked
              </p>
              <p className="text-sm text-[#9ca3af] mb-4">Upgrade your plan to access detailed earnings analytics.</p>
              <button
                id="earnings-upgrade-btn"
                className="bg-[#1a9e8f] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#158577] transition"
              >
                Upgrade to Unlock
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


