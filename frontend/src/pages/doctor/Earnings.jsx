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

  if(!data) return <div className="p-6">Loading earnings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Earnings Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
           <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Earned</h3>
           <p className="text-4xl font-bold text-gray-900 mt-2">₹{data.total_earned}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500">
           <h3 className="text-gray-500 text-sm uppercase tracking-wider">Pending Payouts</h3>
           <p className="text-4xl font-bold text-gray-900 mt-2">₹{data.pending_payouts}</p>
        </div>
      </div>
    </div>
  );
}
