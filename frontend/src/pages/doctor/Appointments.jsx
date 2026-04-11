import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

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
