import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function PatientProfile() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          My Profile
        </h1>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[#e6f7f5] border-2 border-[#c8e8e5] flex items-center justify-center text-3xl font-medium text-[#1a9e8f] mb-3">
            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button className="text-sm text-[#6b7280] hover:text-[#1a9e8f] underline underline-offset-2 transition">
            Change photo
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              defaultValue={user.full_name}
              className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#9ca3af] bg-[#f8f9fb] cursor-not-allowed pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              defaultValue={user.phone || ''}
              placeholder="Enter phone number"
              className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white"
            />
          </div>

          {/* Save */}
          <button
            id="profile-save-btn"
            className="w-full bg-[#1a9e8f] text-white rounded-full py-3 text-sm font-medium hover:bg-[#158577] transition mt-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}


