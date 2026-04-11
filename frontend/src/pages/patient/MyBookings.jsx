import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
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
