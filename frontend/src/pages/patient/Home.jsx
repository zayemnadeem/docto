import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import DoctorCard from '../../components/DoctorCard';

import StarRating from '../../components/StarRating';
import { useNavigate } from 'react-router-dom';

const specialties = ["General Physician", "Pediatrician", "Gynecologist", "Surgeon", "Cardiologist", "Dermatologist", "Orthopedic", "Neurologist", "Psychiatrist", "Ophthalmologist", "ENT", "Dentist"];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full skeleton" />
        <div className="flex-grow space-y-2">
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-3 w-1/2 skeleton rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 skeleton rounded-full" />
        <div className="flex-1 h-9 skeleton rounded-full" />
      </div>
    </div>
  );
}

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Search parameters
  const [lat, setLat] = useState(13.0827); // Chennai default
  const [lng, setLng] = useState(80.2707);
  const [radius, setRadius] = useState(20);
  const [specialty, setSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [locationStatus, setLocationStatus] = useState('default');
  const [locationLabel, setLocationLabel] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setLocationStatus('set');
        // Reverse geocode to get area name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          // Skip suburb if it looks like a zone/administrative label
          const suburb = addr.suburb && !/zone|ward|division/i.test(addr.suburb) ? addr.suburb : null;
          const area = addr.neighbourhood || addr.quarter || suburb || addr.city_district || addr.town || addr.village || addr.city || '';
          const city = addr.city || addr.state_district || '';
          setLocationLabel(area ? `${area}${city && city !== area ? ', ' + city : ''}` : data.display_name?.split(',')[0] || '');
        } catch { setLocationLabel(''); }
      },
      () => { setLocationStatus('denied'); setLocationLabel(''); },
      { timeout: 8000 }
    );
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
            ...(searchQuery && { query: searchQuery }),
            ...(sortBy && { sort_by: sortBy }),
            offers_online: isOnline,
            emergency_available: isEmergency
          }
        });
        setDoctors(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => fetchDocs(), 300);
    return () => clearTimeout(timer);
  }, [lat, lng, radius, specialty, searchQuery, sortBy, isOnline, isEmergency]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section
        className="relative py-24 px-6 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, #c8ede9 0%, transparent 55%),
                       radial-gradient(ellipse at 80% 20%, #d0f0ec 0%, transparent 55%), #fff`
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="text-5xl md:text-6xl text-[#0d2b28] leading-tight tracking-tight"
           
          >
            Find the right doctor,<br />right near you.
          </h1>
          <p className="mt-5 text-lg text-[#6b7280] max-w-xl mx-auto leading-relaxed">
            Search by specialty, location, rating and fee — instantly.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#doctors"
              id="hero-find-doctors-btn"
              className="bg-[#1a9e8f] text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-[#158577] transition"
            >
              Find Doctors
            </a>
            <button
              id="hero-location-btn"
              onClick={getLocation}
              className="border border-[#c8e8e5] text-[#1a9e8f] rounded-full px-7 py-3 text-sm font-medium hover:bg-[#e6f7f5] transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div id="doctors" className="sticky top-16 z-40 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Specialty */}
            <select
              id="filter-specialty"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="border border-[#e5e7eb] rounded-full px-4 py-2 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] cursor-pointer appearance-none pr-8 relative"
            >
              <option value="">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Sort By */}
            <select
              id="filter-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-[#e5e7eb] rounded-full px-4 py-2 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] cursor-pointer"
            >
              <option value="distance">Nearest first</option>
              <option value="rating">Top rated</option>
              <option value="experience">Most experienced</option>
              <option value="fee">Lowest fee</option>
            </select>

            {/* Hybrid/Emergency Toggles */}
            <div className="flex items-center gap-2 border-l border-[#e5e7eb] pl-3 h-8 my-auto">
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                  isOnline 
                  ? 'bg-[#e6f7f5] text-[#1a9e8f] border border-[#1a9e8f]' 
                  : 'text-[#6b7280] border border-[#e5e7eb] hover:border-[#1a9e8f] hover:text-[#1a9e8f]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Consult
              </button>
              
              <button
                onClick={() => setIsEmergency(!isEmergency)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                  isEmergency 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : 'text-[#6b7280] border border-[#e5e7eb] hover:border-red-400 hover:text-red-500'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Emergency
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-grow max-w-sm">
              <input
                type="text"
                placeholder="Search by name or area..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-full px-4 py-2 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a9e8f]"
              />
            </div>

            {/* Use My Location */}
            <button
              id="filter-location-btn"
              onClick={getLocation}
              disabled={locationStatus === 'detecting'}
              className={`rounded-full px-4 py-2 text-sm font-medium transition flex items-center gap-1.5 ml-auto border ${
                locationStatus === 'set'
                  ? 'border-[#10b981] text-[#10b981] bg-[#f0fdf4]'
                  : locationStatus === 'denied'
                  ? 'border-[#ef4444] text-[#ef4444] bg-[#fef2f2]'
                  : locationStatus === 'detecting'
                  ? 'border-[#f59e0b] text-[#f59e0b] bg-[#fffbeb]'
                  : 'border-[#e5e7eb] text-[#0d2b28] hover:bg-[#e6f7f5]'
              }`}
            >
              {locationStatus === 'detecting' ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {locationStatus === 'detecting' ? 'Detecting…'
                : locationStatus === 'set' ? `📍 ${locationLabel || 'Location set ✓'}`
                : locationStatus === 'denied' ? 'Allow location access'
                : 'My Location'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">


        {/* Section heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#0d2b28]">
            {loading ? 'Finding doctors…' : `${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} nearby`}
          </h2>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#f8f9fb] border border-[#e5e7eb] flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl text-[#0d2b28]">No doctors found</h3>
            <p className="text-[#9ca3af] mt-2 text-sm max-w-xs">
              Try adjusting your filters or expanding your search area.
            </p>
            <button
              id="clear-filters-btn"
              onClick={() => { setSpecialty(''); setSearchQuery(''); setIsOnline(false); setIsEmergency(false); }}
              className="mt-5 border border-[#c8e8e5] text-[#1a9e8f] rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#e6f7f5] transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


