import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import DoctorCard from '../../components/DoctorCard';
import MapView from '../../components/MapView';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Search parameters
  const [lat, setLat] = useState(13.0827); // Chennai
  const [lng, setLng] = useState(80.2707);
  const [radius, setRadius] = useState(20);
  const [specialty, setSpecialty] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxFee, setMaxFee] = useState(5000);
  const [sortBy, setSortBy] = useState('distance');

  const specialties = ["General Physician", "Pediatrician", "Gynecologist", "Surgeon", "Cardiologist", "Dermatologist", "Orthopedic", "Neurologist", "Psychiatrist", "Ophthalmologist", "ENT", "Dentist"];

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        () => console.warn("Geolocation denied.")
      );
    }
  };

  useEffect(() => getLocation(), []);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/doctors/search`, {
          params: { 
            lat, lng, radius_km: radius,
            ...(specialty && { specialty }),
            ...(minRating > 0 && { min_rating: minRating }),
            ...(maxFee < 5000 && { max_fee: maxFee }),
            ...(sortBy && { sort_by: sortBy })
          }
        });
        setDoctors(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    // Debounce slightly if needed, but simple dependency triggers work here.
    const timer = setTimeout(() => fetchDocs(), 300);
    return () => clearTimeout(timer);
  }, [lat, lng, radius, specialty, minRating, maxFee, sortBy]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50">
      {/* Scrollable List & Filters */}
      <div className="w-full md:w-1/2 flex flex-col h-full border-r border-gray-200">
        
        {/* Filters Area */}
        <div className="bg-white p-4 shadow-sm z-10 sticky top-0">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-bold text-gray-800">Find Doctors</h1>
             <button onClick={getLocation} className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
               ⌖ Use My Location
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
             <select value={specialty} onChange={e=>setSpecialty(e.target.value)} className="border border-gray-300 rounded p-2 text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500">
               <option value="">All Specialties</option>
               {specialties.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             
             <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border border-gray-300 rounded p-2 text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500">
               <option value="distance">Sort: Nearest</option>
               <option value="rating">Sort: Top Rated</option>
               <option value="experience">Sort: Experience</option>
               <option value="fee">Sort: Lowest Fee</option>
             </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3 items-center text-sm">
             <div>
               <label className="block text-gray-500 mb-1">Max Fee: ₹{maxFee}</label>
               <input type="range" min="100" max="5000" step="100" value={maxFee} onChange={e=>setMaxFee(e.target.value)} className="w-full accent-blue-600"/>
             </div>
             <div>
                <label className="block text-gray-500 mb-1">Min Rating: {minRating}★</label>
                <input type="range" min="0" max="5" step="1" value={minRating} onChange={e=>setMinRating(e.target.value)} className="w-full accent-blue-600"/>
             </div>
          </div>
        </div>

        {/* Doctor List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : doctors.length > 0 ? (
            doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)
          ) : (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-lg">No doctors found matching filters.</p>
              <button onClick={() => { setSpecialty(''); setMinRating(0); setMaxFee(5000); }} className="mt-2 text-blue-600 underline">Clear Filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="hidden md:block md:w-1/2 p-4 h-full">
         <MapView 
            lat={lat} 
            lng={lng} 
            markers={doctors} 
            className="w-full h-full shadow-inner"
            onMarkerClick={(doc) => navigate(`/doctor/${doc.id}`)}
         />
      </div>
    </div>
  );
}
