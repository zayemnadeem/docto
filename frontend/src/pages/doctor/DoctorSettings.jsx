import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function DoctorSettings() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#111827] mb-8" style={{ fontFamily: 'Instrument Serif, serif' }}>
          Settings
        </h1>

        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[#f3f4f6] border-2 border-[#e5e7eb] flex items-center justify-center text-3xl font-medium text-[#374151] mb-3" style={{ fontFamily: 'Instrument Serif, serif' }}>
            {user.full_name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <button className="text-sm text-[#6b7280] hover:text-[#111827] underline underline-offset-2 transition">
            Change profile photo
          </button>
        </div>

        {/* Personal Info Section */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 mb-5">
          <h2 className="text-lg font-medium text-[#111827] mb-5" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Full Name</label>
              <input
                id="settings-name"
                type="text"
                defaultValue={user.full_name}
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#9ca3af] bg-[#f8f9fb] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Phone</label>
              <input
                id="settings-phone"
                type="tel"
                defaultValue={user.phone || ''}
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Bio</label>
              <textarea
                id="settings-bio"
                defaultValue={user.bio || ''}
                placeholder="Tell patients about yourself…"
                rows={4}
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Clinic Info Section */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 mb-5">
          <h2 className="text-lg font-medium text-[#111827] mb-5" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Clinic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Clinic Name</label>
              <input
                id="settings-clinic-name"
                type="text"
                defaultValue={user.clinic_name || ''}
                placeholder="Apollo Clinic"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Clinic Address</label>
              <input
                id="settings-clinic-address"
                type="text"
                defaultValue={user.clinic_address || ''}
                placeholder="123, Anna Salai, Chennai"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Consultation Fee (₹)</label>
              <input
                id="settings-fee"
                type="number"
                defaultValue={user.consultation_fee || ''}
                placeholder="500"
                min="0"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          id="settings-save-btn"
          className="w-full bg-[#111827] text-white rounded-full py-3 text-sm font-medium hover:bg-[#374151] transition"
        >
          Save Changes
        </button>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 mt-6">
          <h2 className="text-lg font-medium text-[#111827] mb-5" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Current Password</label>
              <input type="password" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">New Password</label>
              <input type="password" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Confirm New Password</label>
              <input type="password" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white" />
            </div>
            <button
              id="change-password-btn"
              className="bg-[#111827] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#374151] transition"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
