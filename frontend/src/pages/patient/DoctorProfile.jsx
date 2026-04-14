import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import SlotPicker from '../../components/SlotPicker';
import StarRating from '../../components/StarRating';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [reviews, setReviews] = useState([]);

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
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/doctors/${id}/reviews`);
        setReviews(res.data.data || []);
      } catch (e) {
        console.error("Error fetching reviews", e);
      }
    };
    fetchDoc();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setSelectedSlot(null);
        const res = await axios.get(`${API_URL}/doctors/${id}/slots${isEmergency ? '?emergency=true' : ''}`);
        setSlots(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSlots();
  }, [id, isEmergency]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#1a9e8f] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#9ca3af]">Loading doctor profile…</p>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#0d2b28] font-medium">Doctor not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 border border-[#c8e8e5] text-[#1a9e8f] rounded-full px-6 py-2 text-sm font-medium hover:bg-[#e6f7f5] transition">
          Back to Search
        </button>
      </div>
    </div>
  );

  const initials = doctor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DR';
  const photoUrl = doctor.profile_photo
    ? (doctor.profile_photo.startsWith('http') ? doctor.profile_photo : `${API_URL}${doctor.profile_photo}`)
    : null;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Strip */}
      <div className="bg-[#f0faf9] border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#e5e7eb] bg-white shadow-sm">
                {photoUrl ? (
                  <img src={photoUrl} alt={doctor.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#374151] text-3xl font-medium">
                    {initials}
                  </div>
                )}
              </div>
              {doctor.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#10b981] flex items-center justify-center border-2 border-white shadow-sm" title="Verified">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl text-[#0d2b28]">
                  {doctor.full_name}
                </h1>
                {['annual', 'quarterly', 'enterprise'].includes(doctor.subscription_plan) && (
                  <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[11px] font-bold tracking-wider shadow-sm mt-1" title="Premium Plan">
                    <svg className="w-3.5 h-3.5 text-amber-100" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    PRO
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#e6f7f5] text-[#1a9e8f]">
                  {doctor.specialization}
                </span>
                {doctor.experience_years && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#e6f7f5] text-[#1a9e8f]">
                    {doctor.experience_years} yrs experience
                  </span>
                )}
              </div>
              <div className="mt-3">
                <StarRating rating={doctor.avg_rating || 0} readOnly totalReviews={doctor.total_reviews || 0} />
              </div>
            </div>

            {/* Book CTA */}
            <div className="flex-shrink-0">
              <a href="#availability" className="bg-[#1a9e8f] text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-[#158577] transition inline-block">
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {doctor.bio && (
              <section>
                <h2 className="text-xl text-[#0d2b28] mb-3">About</h2>
                <p className="text-[#374151] leading-relaxed text-sm">{doctor.bio}</p>
              </section>
            )}

            {/* Qualifications */}
            {doctor.qualifications && (
              <section>
                <h2 className="text-xl text-[#0d2b28] mb-3">Qualifications</h2>
                <p className="text-[#374151] text-sm">{doctor.qualifications}</p>
              </section>
            )}

            {/* Clinic Info + Directions */}
            {(doctor.clinic_name || doctor.clinic_address) && (
              <section>
                <h2 className="text-xl text-[#0d2b28] mb-3">Clinic</h2>
                <div className="bg-[#f8f9fb] rounded-2xl border border-[#e5e7eb] p-5">
                  {doctor.clinic_name && <p className="font-medium text-[#0d2b28]">{doctor.clinic_name}</p>}
                  {doctor.clinic_address && (
                    <p className="text-sm text-[#6b7280] mt-1 flex items-start gap-1.5">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {doctor.clinic_address}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      doctor.clinic_lat && doctor.clinic_lng
                        ? `${doctor.clinic_lat},${doctor.clinic_lng}`
                        : doctor.clinic_address || doctor.clinic_name
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 bg-[#1a9e8f] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#158577] transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Get Directions
                  </a>
                </div>
              </section>
            )}

            {/* Patient Reviews */}
            {reviews.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl text-[#0d2b28]">Patient Reviews</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f8f9fb] text-[#6b7280] border border-[#e5e7eb]">{reviews.length}</span>
                </div>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-white p-5 rounded-2xl border border-[#e5e7eb]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#f8f9fb] text-[#6b7280] border border-[#e5e7eb] flex items-center justify-center font-medium text-sm flex-shrink-0 uppercase">
                            {r.patient_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-medium text-[#0d2b28] text-sm capitalize">{r.patient_name}</p>
                            <p className="text-xs text-[#9ca3af] mt-0.5">{new Date(r.created_at).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</p>
                          </div>
                        </div>
                        <StarRating rating={r.rating} readOnly />
                      </div>
                      {r.review_text && (
                        <p className="text-sm text-[#374151] mt-4 leading-relaxed bg-[#f8f9fb] p-3.5 rounded-xl">"{r.review_text}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Fee Card */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
              <p className="text-sm text-[#6b7280] font-medium uppercase tracking-wide">Consultation Fee</p>
              <p className="text-4xl font-semibold text-[#0d2b28] mt-1">
                &#8377;{isEmergency ? Math.round(doctor.consultation_fee * 1.25) : doctor.consultation_fee}
              </p>
              <p className="text-xs text-[#9ca3af] mt-1">{isEmergency ? 'Includes 25% emergency premium' : 'Same price as clinic — no markup'}</p>
              <button
                id="fee-card-book-btn"
                onClick={() => {
                  if (!user) navigate('/login');
                  else if (selectedSlot) navigate(`/booking/${id}/confirm`, { state: { doctor, selectedSlot, isEmergency } });
                  else document.getElementById('availability')?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={!selectedSlot && !!user}
                className={`w-full mt-5 rounded-full py-3 text-sm font-medium transition ${
                  selectedSlot ? 'bg-[#1a9e8f] text-white hover:bg-[#158577]' : 'bg-[#f3f4f6] text-[#9ca3af] cursor-default'
                }`}
              >
                {!user ? 'Login to Book' : selectedSlot ? 'Book Appointment' : 'Select a slot below'}
              </button>

              <div className="mt-5 p-4 bg-[#f8f9fb] rounded-xl border border-[#e5e7eb]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-[#0d2b28] flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Emergency Booking
                    </span>
                    <p className="text-xs text-[#6b7280] mt-0.5">Bypass 12-hour advance booking limit</p>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEmergency ? 'bg-[#ef4444]' : 'bg-[#d1d5db]'}`}>
                    <input type="checkbox" className="sr-only" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} />
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEmergency ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
              </div>
            </div>

            {/* Slot Picker */}
            <div id="availability">
              <h2 className="text-xl text-[#0d2b28] mb-4">Availability</h2>
              <SlotPicker slots={slots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
              
              {slots.length === 0 && !isEmergency && (
                <div className="mt-4 p-3.5 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-[#3b82f6] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  <p className="text-sm text-[#1e3a8a] leading-relaxed">
                    <strong>Appointments must be booked 12 hours in advance.</strong> For immediate emergency availability, please toggle the Emergency Booking option above.
                  </p>
                </div>
              )}

              {selectedSlot && (
                <button
                  id="proceed-booking-btn"
                  onClick={() => {
                    if (!user) navigate('/login');
                    else navigate(`/booking/${id}/confirm`, { state: { doctor, selectedSlot, isEmergency } });
                  }}
                  className="w-full mt-4 bg-[#1a9e8f] text-white rounded-full py-3 text-sm font-medium hover:bg-[#158577] transition"
                >
                  Proceed to Book
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


