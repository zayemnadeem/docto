import React from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../contexts/AuthContext';

export default function DoctorCard({ doctor }) {
  const initials = doctor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DR';
  const photoUrl = doctor.profile_photo
    ? (doctor.profile_photo.startsWith('http') ? doctor.profile_photo : `${API_URL}${doctor.profile_photo}`)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Header: Avatar + Name + Specialty */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#e6f7f5] border border-[#c8e8e5]">
          {photoUrl ? (
            <img src={photoUrl} alt={doctor.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1a9e8f] text-lg font-semibold">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[#0d2b28] font-semibold text-base leading-tight truncate">
              {doctor.full_name}
            </h3>
            {doctor.is_verified && (
              <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10b981]/10" title="Verified">
                <svg className="w-3.5 h-3.5 text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          <span className="inline-block mt-1 text-xs font-medium px-3 py-1 rounded-full bg-[#e6f7f5] text-[#1a9e8f]">
            {doctor.specialization}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-col gap-1.5 text-sm text-[#6b7280]">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#f59e0b]">★</span>
          <span className="font-semibold text-[#0d2b28]">{doctor.avg_rating?.toFixed(1) || '—'}</span>
          <span className="text-[#9ca3af]">({doctor.total_reviews || 0} reviews)</span>
        </div>
        {/* Distance + Clinic */}
        {doctor.distance_km !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="text-[#9ca3af]">📍</span>
            <span>{doctor.distance_km?.toFixed(1)} km away</span>
            {doctor.clinic_name && <span className="text-[#9ca3af]">· {doctor.clinic_name}</span>}
          </div>
        )}
        {/* Fee */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#9ca3af]">💰</span>
          <span className="font-medium text-[#0d2b28]">₹{doctor.consultation_fee}</span>
          <span className="text-[#9ca3af]">consultation</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link
          to={`/doctor/${doctor.id}`}
          id={`view-doctor-${doctor.id}`}
          className="flex-1 text-center border border-[#c8e8e5] text-[#1a9e8f] rounded-full px-4 py-2 text-sm font-medium hover:bg-[#e6f7f5] transition"
        >
          View Profile
        </Link>
        <Link
          to={`/doctor/${doctor.id}`}
          id={`book-doctor-${doctor.id}`}
          className="flex-1 text-center bg-[#1a9e8f] text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-[#158577] transition"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

