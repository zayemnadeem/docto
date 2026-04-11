import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import SlotPicker from '../../components/SlotPicker';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, role } = useAuth();

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get(`${API_URL}/doctors/${id}`);
        setDoctor(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const fetchSlots = async () => {
      try {
        const res = await axios.get(`${API_URL}/doctors/${id}/slots`);
        setSlots(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDoc();
    fetchSlots();
  }, [id]);

  const [selectedSlot, setSelectedSlot] = useState(null);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!doctor) return <div className="p-8">Doctor not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
             {doctor.profile_photo ? (
               <img src={doctor.profile_photo} alt={doctor.full_name} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">P</div>
             )}
          </div>
          <div className="mt-4 md:mt-0 md:ml-6 flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{doctor.full_name}</h1>
            <p className="text-xl text-blue-600 font-medium mt-1">{doctor.specialization}</p>
            <p className="text-gray-500 mt-2">{doctor.qualifications} | {doctor.experience_years} years experience</p>
            
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-800 rounded">
               <span className="font-semibold mr-2">Consultation Fee:</span> 
               <span>₹{doctor.consultation_fee}</span>
               <span className="ml-2 text-xs text-gray-500">(Same price as clinic — no markup)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-gray-700">{doctor.bio || "No bio available."}</p>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold mb-4">Availability</h2>
          <SlotPicker slots={slots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
          
          <button 
             disabled={!selectedSlot}
             onClick={() => {
                if(!user) navigate('/login');
                else navigate(`/booking/${id}/confirm`, { state: { doctor, selectedSlot } });
             }}
             className={`w-full md:w-auto px-6 py-3 mt-6 font-bold rounded-lg shadow transition-all ${
                selectedSlot 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
             }`}>
            {selectedSlot ? 'Book Selected Slot' : 'Select a Slot to Book'}
          </button>
        </div>
      </div>
    </div>
  );
}
