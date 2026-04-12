import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import DoctorCard from '../../components/DoctorCard';
import MapView from '../../components/MapView';
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
  const [minRating, setMinRating] = useState(0);
  const navigate = useNavigate();

  // Search parameters
  const [lat, setLat] = useState(13.0827); // Chennai
  const [lng, setLng] = useState(80.2707);
  const [radius, setRadius] = useState(20);
  const [specialty, setSpecialty] = useState('');
  const [maxFee, setMaxFee] = useState(5000);
  const [sortBy, setSortBy] = useState('distance');

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
    const timer = setTimeout(() => fetchDocs(), 300);
    return () => clearTimeout(timer);
  }, [lat, lng, radius, specialty, minRating, maxFee, sortBy]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section
        className="relative py-24 px-6 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, #dde8f8 0%, transparent 55%),
                       radial-gradient(ellipse at 80% 20%, #e8dff5 0%, transparent 55%), #fff`
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="text-5xl md:text-6xl text-[#111827] leading-tight tracking-tight"
            style={{ fontFamily: 'Instrument Serif, serif' }}
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
              className="bg-[#111827] text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-[#374151] transition"
            >
              Find Doctors
            </a>
            <button
              id="hero-location-btn"
              onClick={getLocation}
              className="border border-[#e5e7eb] text-[#111827] rounded-full px-7 py-3 text-sm font-medium hover:bg-[#f8f9fb] transition flex items-center gap-2"
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
              className="border border-[#e5e7eb] rounded-full px-4 py-2 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] cursor-pointer appearance-none pr-8 relative"
            >
              <option value="">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Sort By */}
            <select
              id="filter-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-[#e5e7eb] rounded-full px-4 py-2 text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] cursor-pointer"
            >
              <option value="distance">Nearest first</option>
              <option value="rating">Top rated</option>
              <option value="experience">Most experienced</option>
              <option value="fee">Lowest fee</option>
            </select>

            {/* Max Fee slider */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6b7280] whitespace-nowrap">Fee: ₹{maxFee === 5000 ? '5000+' : maxFee}</span>
              <input
                id="filter-fee"
                type="range"
                min="100"
                max="5000"
                step="100"
                value={maxFee}
                onChange={e => setMaxFee(Number(e.target.value))}
                className="w-28"
              />
            </div>

            {/* Min Rating Stars */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6b7280]">Min:</span>
              <StarRating rating={minRating} setRating={setMinRating} readOnly={false} totalReviews={null} />
            </div>

            {/* Use My Location */}
            <button
              id="filter-location-btn"
              onClick={getLocation}
              className="border border-[#e5e7eb] text-[#111827] rounded-full px-4 py-2 text-sm font-medium hover:bg-[#f8f9fb] transition flex items-center gap-1.5 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              My Location
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Map */}
        <MapView
          lat={lat}
          lng={lng}
          markers={doctors}
          className="w-full h-[420px] mb-10"
          onMarkerClick={(doc) => navigate(`/doctor/${doc.id}`)}
        />

        {/* Section heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>
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
            <h3 className="text-xl text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>No doctors found</h3>
            <p className="text-[#9ca3af] mt-2 text-sm max-w-xs">
              Try adjusting your filters or expanding your search area.
            </p>
            <button
              id="clear-filters-btn"
              onClick={() => { setSpecialty(''); setMinRating(0); setMaxFee(5000); }}
              className="mt-5 border border-[#e5e7eb] text-[#111827] rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#f8f9fb] transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
