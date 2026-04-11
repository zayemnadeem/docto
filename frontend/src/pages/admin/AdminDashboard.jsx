import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/stats`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(res.data.data);
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Operations</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm font-medium text-gray-500">Total Doctors</p>
          <p className="text-3xl font-bold">{stats.total_doctors}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm font-medium text-gray-500">Pending Verification</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending_verifications}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm font-medium text-gray-500">Bookings Today</p>
          <p className="text-3xl font-bold text-blue-600">{stats.bookings_today}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm font-medium text-gray-500">Platform Revenue (All Time)</p>
          <p className="text-3xl font-bold text-green-600">₹{stats.revenue_total}</p>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Link to="/admin/verifications" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Verify Doctors</Link>
        <Link to="/admin/users" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Manage Users</Link>
      </div>
    </div>
  );
}
