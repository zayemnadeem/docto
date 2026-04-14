import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isFree = !user?.subscription_plan || user?.subscription_plan === 'free';
  const plan = user?.subscription_plan || 'free';
  const hasBasic = ['monthly', 'quarterly', 'annual', 'enterprise'].includes(plan);
  const hasAdvanced = ['quarterly', 'annual', 'enterprise'].includes(plan);
  const hasFull = ['annual', 'enterprise'].includes(plan);
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_URL}/doctors/me/analytics`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading…</div>;
  }

  const trend = data?.trend || [];
  const maxRev = Math.max(...trend.map(t => t.revenue), 100);

  const StatBlock = ({ icon, label, value }) => (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#1a9e8f]/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="w-12 h-12 rounded-full bg-[#e6f7f5] text-[#1a9e8f] flex items-center justify-center text-xl mb-3">
        {icon}
      </div>
      <p className="text-3xl font-semibold text-[#0d2b28]">{value}</p>
      <p className="text-xs uppercase tracking-wide text-[#9ca3af] font-medium mt-1">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-10 px-4 relative">
      <div className="max-w-6xl mx-auto relative">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl text-[#0d2b28]">Advanced Analytics</h1>
            <p className="text-[#9ca3af] text-sm mt-1">Monitor your growth and platform performance.</p>
          </div>
          {['annual', 'enterprise', 'quarterly'].includes(user?.subscription_plan) && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#10b981]/10 text-[#10b981] font-bold text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Premium Sync Active
            </span>
          )}
        </div>

        {/* Outer content container - conditionally blurred */}
        <div className={`relative ${isFree ? 'pointer-events-none' : ''}`}>
          
          {/* Blur Overlay for Free Users */}
          {isFree && (
            <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/40 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-white p-8 rounded-3xl border border-[#e5e7eb] shadow-xl max-w-sm pointer-events-auto">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-[#0d2b28] mb-2">Upgrade to Analytics</h3>
                <p className="text-[#6b7280] text-sm mb-6">Upgrade your subscription to access performance charts, revenue tracking, and patient insights.</p>
                <Link to="/doctor/dashboard" className="w-full inline-block bg-[#1a9e8f] text-white rounded-full py-3 text-sm font-medium hover:bg-[#158577] transition shadow-md">
                  View Upgrade Plans
                </Link>
              </div>
            </div>
          )}

          {/* Stats Row Base */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-0">
            <StatBlock icon="📈" label="Total Bookings" value={data?.total_bookings || 0} />
            <StatBlock icon="💰" label="Lifetime Revenue" value={`₹${data?.total_revenue || 0}`} />
            
            <div className="relative">
              {!hasAdvanced && (
                <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/30 flex flex-col items-center justify-end pb-3">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase translate-y-3">Quarterly+</span>
                </div>
              )}
              <StatBlock icon="👁️" label="Profile Views" value={data?.profile_views || 0} />
            </div>

            <div className="relative">
              {!hasFull && (
                <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/30 flex flex-col items-center justify-end pb-3">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase translate-y-3">Annual+</span>
                </div>
              )}
              <StatBlock icon="🔄" label="Patient Retention" value={`${data?.retention_rate || 0}%`} />
            </div>
          </div>

          {/* Chart Section */}
          <div className="relative">
            {!hasAdvanced && (
              <div className="absolute inset-0 z-20 backdrop-blur-sm bg-white/40 flex items-center justify-center">
                 <div className="bg-white px-6 py-4 rounded-2xl border border-[#e5e7eb] shadow-sm text-center">
                    <p className="text-sm font-semibold text-[#0d2b28]">Revenue Charts Locked</p>
                    <p className="text-xs text-[#9ca3af] mb-3">Available on Quarterly plans and above.</p>
                    <Link to="/doctor/dashboard" className="text-xs font-bold text-[#1a9e8f] underline">Upgrade Now</Link>
                 </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl text-[#0d2b28]">Revenue Trend (Last 6 Months)</h2>
              <span className="text-xs text-[#9ca3af] font-medium border border-[#e5e7eb] px-3 py-1.5 rounded-full">Net Earnings (INR)</span>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 overflow-hidden border-b border-[#e5e7eb] pb-2 relative">
              {/* Fake Y lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-[#e5e7eb] w-full" />
                <div className="border-t border-[#e5e7eb] w-full" />
                <div className="border-t border-[#e5e7eb] w-full" />
                <div className="border-t border-[#e5e7eb] w-full" />
              </div>

              {trend.map((t, idx) => {
                const heightPct = Math.max((t.revenue / maxRev) * 100, 2); // Min 2% height
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end group z-10">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#0d2b28] text-white text-[10px] py-1 px-2 rounded mb-2 whitespace-nowrap shadow-md">
                      ₹{t.revenue}
                    </div>
                    <div 
                      className="w-full max-w-[60px] bg-gradient-to-t from-[#1a9e8f] to-[#2fd1bf] rounded-t-lg transition-all duration-500 ease-out hover:opacity-80" 
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between mt-3 px-2">
              {trend.map((t, idx) => (
                <div key={idx} className="flex-1 text-center text-xs text-[#9ca3af] font-medium">
                  {t.month}
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
