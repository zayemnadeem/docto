import os

files = {
    # PATIENT PAGES
    r"frontend\src\pages\patient\MyBookings.jsx": """import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_URL}/patients/me/bookings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBookings(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Appointments</h2>
      {bookings.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center border">
          <p className="text-gray-500 mb-4">You have no upcoming appointments.</p>
          <Link to="/" className="text-blue-600 hover:underline">Find a Doctor</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{b.doctor.full_name}</h3>
                <p className="text-blue-600 text-sm">{b.doctor.specialization}</p>
                <div className="mt-2 text-sm text-gray-600">
                   <p>Date: <span className="font-medium text-gray-800">{b.slot.date}</span></p>
                   <p>Time: <span className="font-medium text-gray-800">{b.slot.start_time.slice(0,5)}</span></p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {b.status.toUpperCase()}
                </span>
                <p className="mt-2 text-sm text-gray-500">Paid: ₹{b.advance_amount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
""",
    r"frontend\src\pages\patient\PatientProfile.jsx": """import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function PatientProfile() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Full Name</label>
          <p className="mt-1 text-lg text-gray-900 border border-gray-200 px-4 py-2 rounded-md bg-gray-50">{user.full_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Email Address</label>
          <p className="mt-1 text-lg text-gray-900 border border-gray-200 px-4 py-2 rounded-md bg-gray-50">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Phone</label>
          <p className="mt-1 text-lg text-gray-900 border border-gray-200 px-4 py-2 rounded-md bg-gray-50">{user.phone || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}
""",

    # DOCTOR PAGES
    r"frontend\src\pages\doctor\ManageSlots.jsx": """import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../contexts/AuthContext';

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/doctors/me/slots`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSlots(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/doctors/me/slots`, { date, start_time: startTime, end_time: endTime }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchSlots();
    } catch (e) {
      alert("Error adding slot");
    }
  };

  const deleteSlot = async (id) => {
    try {
      await axios.delete(`${API_URL}/doctors/me/slots/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchSlots();
    } catch (e) {
      alert("Cannot delete booked slot");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Availability</h2>
      <form onSubmit={addSlot} className="bg-white p-4 rounded shadow flex space-x-4 mb-8">
         <input type="date" required value={date} onChange={e=>setDate(e.target.value)} className="border p-2 rounded"/>
         <input type="time" required value={startTime} onChange={e=>setStartTime(e.target.value)} className="border p-2 rounded"/>
         <input type="time" required value={endTime} onChange={e=>setEndTime(e.target.value)} className="border p-2 rounded"/>
         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Slot</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {slots.map(s => (
          <div key={s.id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
            <div>
              <p className="font-bold">{s.date}</p>
              <p className="text-sm text-gray-600">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</p>
              <span className={`text-xs ${s.is_booked ? 'text-red-500' : 'text-green-500'}`}>{s.is_booked ? 'Booked' : 'Free'}</span>
            </div>
            {!s.is_booked && (
              <button onClick={() => deleteSlot(s.id)} className="text-red-500 hover:text-red-700">Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
""",
    r"frontend\src\pages\doctor\Appointments.jsx": """import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../contexts/AuthContext';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

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
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Patient Appointments</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map(a => (
              <tr key={a.id}>
                <td className="px-6 py-4 whitespace-nowrap">{a.patient.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{a.slot.date} {a.slot.start_time.slice(0,5)}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{a.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {a.status === 'confirmed' && (
                    <button onClick={() => markComplete(a.id)} className="text-green-600 hover:underline">Complete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
""",
    r"frontend\src\pages\doctor\Earnings.jsx": """import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../contexts/AuthContext';

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
""",
    r"frontend\src\pages\admin\AdminDashboard.jsx": """import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../contexts/AuthContext';
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
"""
}

# Ensure directories exist and write files
for filepath, content in files.items():
    full_path = os.path.join(r"d:\docto", filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

print("Scaffold complete.")
