import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

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
