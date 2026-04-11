import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      try {
        const aps = await axios.get(`${API_URL}/doctors/me/appointments`, { headers: { Authorization: `Bearer ${token}` }});
        setAppointments(aps.data.data);
        const ern = await axios.get(`${API_URL}/doctors/me/earnings`, { headers: { Authorization: `Bearer ${token}` }});
        setEarnings(ern.data.data);
      } catch(e) {
        console.error(e);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
           <h3 className="text-gray-500 font-semibold mb-2">Total Earnings</h3>
           <p className="text-2xl font-bold">₹{earnings?.total_earned || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
           <h3 className="text-gray-500 font-semibold mb-2">Platform Commission</h3>
           <p className="text-2xl font-bold">₹{earnings?.platform_commission || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
           <h3 className="text-gray-500 font-semibold mb-2">Net Earnings</h3>
           <p className="text-2xl font-bold text-green-600">₹{earnings?.net_earnings || 0}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Today's Appointments</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {appointments.length === 0 && <li className="px-6 py-4 text-gray-500">No appointments scheduled.</li>}
          {appointments.map((a, i) => (
             <li key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                   <p className="font-semibold">{a.patient.full_name}</p>
                   <p className="text-sm text-gray-500">{a.slot.start_time} - {a.slot.end_time}</p>
                </div>
                <div>
                   <span className={`px-2 py-1 text-xs rounded font-semibold ${a.booking.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{a.booking.status}</span>
                </div>
             </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
