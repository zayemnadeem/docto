import React from 'react';
import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 flex">
      <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
        {doctor.profile_photo ? (
          <img src={doctor.profile_photo} alt={doctor.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">P</div>
        )}
      </div>
      <div className="ml-4 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{doctor.full_name}</h3>
            <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
          </div>
          {doctor.is_verified && <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Verified</span>}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <p>{doctor.experience_years} years experience</p>
          <p className="mt-1">Fee: ₹{doctor.consultation_fee}</p>
          {doctor.distance_km !== undefined && (
            <p className="mt-1 text-xs text-gray-400">{doctor.distance_km.toFixed(2)} km away</p>
          )}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-sm font-semibold">{doctor.avg_rating.toFixed(1)}</span>
            <span className="ml-1 text-xs text-gray-500">({doctor.total_reviews} reviews)</span>
          </div>
          <Link to={`/doctor/${doctor.id}`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
