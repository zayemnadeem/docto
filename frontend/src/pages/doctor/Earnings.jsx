import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Earnings() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isFree = !user?.subscription_plan || user?.subscription_plan === 'free';

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(`${API_URL}/doctors/me/earnings`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        setData(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return (
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

        {/* Analytics Section */}
        <div className="relative bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 overflow-hidden">
          <div className={`flex items-center justify-between mb-8 ${isFree ? 'filter blur-[4px] pointer-events-none' : ''}`}>
            <h2 className="text-xl text-[#0d2b28]">Monthly Trend Preview</h2>
            <Link to="/doctor/analytics" className="text-sm font-medium text-[#1a9e8f] hover:underline">
              Full Analytics &rarr;
            </Link>
          </div>

          <div className={`flex items-end gap-3 h-40 px-4 mb-2 ${isFree ? 'filter blur-[4px] pointer-events-none' : ''}`}>
            {[35, 55, 45, 70, 60, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-[#e6f7f5] to-[#1a9e8f] rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className={`flex gap-3 px-4 ${isFree ? 'filter blur-[4px] pointer-events-none' : ''}`}>
             {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
               <div key={m} className="flex-1 text-center text-[10px] text-[#9ca3af] font-medium tracking-wider uppercase">{m}</div>
             ))}
          </div>

          {/* Upgrade Overlay for Free Users */}
          {isFree && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
              <div className="text-center p-8 bg-white/90 rounded-2xl shadow-sm border border-[#e5e7eb] max-w-sm">
                <p className="text-[#0d2b28] font-semibold text-lg mb-1">
                  Analytics Ready
                </p>
                <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">Detailed monthly reports and growth charts are available as a premium benefit.</p>
                <Link
                  to="/doctor/dashboard"
                  className="bg-[#0d2b28] text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-black transition shadow-md inline-block"
                >
                  Upgrade Plans
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


