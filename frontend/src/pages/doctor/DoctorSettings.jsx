import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';

export default function DoctorSettings() {
  const { user, token, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(
    user?.profile_photo ? `${API_URL}${user.profile_photo}` : null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');


  // Form refs
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const bioRef = useRef(null);
  const clinicNameRef = useRef(null);
  const clinicAddrRef = useRef(null);
  const feeRef = useRef(null);

  if (!user) return null;

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post(`${API_URL}/doctors/me/photo`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (setUser) setUser(prev => ({ ...prev, profile_photo: res.data.profile_photo }));
      setSaveMsg('Photo updated!');
    } catch (err) {
      setSaveMsg('Photo upload failed. Try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.put(`${API_URL}/doctors/me`, {
        full_name: nameRef.current?.value || undefined,
        phone: phoneRef.current?.value || undefined,
        bio: bioRef.current?.value || undefined,
        clinic_name: clinicNameRef.current?.value || undefined,
        clinic_address: clinicAddrRef.current?.value || undefined,
        consultation_fee: feeRef.current?.value ? Number(feeRef.current.value) : undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveMsg('Changes saved successfully!');
    } catch (err) {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#0d2b28] mb-8">
          Settings
        </h1>

        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-24 h-24 rounded-full bg-[#e6f7f5] border-2 border-[#c8e8e5] flex items-center justify-center text-3xl font-medium text-[#1a9e8f] mb-3 overflow-hidden cursor-pointer hover:opacity-80 transition"
            onClick={handlePhotoClick}
            title="Click to change photo"
           
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.full_name?.charAt(0)?.toUpperCase() || 'D'
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <button
            id="change-photo-btn"
            onClick={handlePhotoClick}
            disabled={uploading}
            className="text-sm text-[#6b7280] hover:text-[#1a9e8f] underline underline-offset-2 transition disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Change profile photo'}
          </button>
        </div>

        {/* Personal Info Section */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 mb-5">
          <h2 className="text-lg font-medium text-[#0d2b28] mb-5">
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Full Name</label>
              <input
                id="settings-name"
                ref={nameRef}
                type="text"
                defaultValue={user.full_name}
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white"
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
                ref={phoneRef}
                type="tel"
                defaultValue={user.phone || ''}
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Bio</label>
              <textarea
                id="settings-bio"
                ref={bioRef}
                defaultValue={user.bio || ''}
                placeholder="Tell patients about yourself…"
                rows={4}
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Clinic Info Section */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 mb-5">
          <h2 className="text-lg font-medium text-[#0d2b28] mb-5">
            Clinic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Clinic Name</label>
              <input
                id="settings-clinic-name"
                ref={clinicNameRef}
                type="text"
                defaultValue={user.clinic_name || ''}
                placeholder="Apollo Clinic"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Clinic Address</label>
              <input
                id="settings-clinic-address"
                ref={clinicAddrRef}
                type="text"
                defaultValue={user.clinic_address || ''}
                placeholder="123, Anna Salai, Chennai"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Consultation Fee (₹)</label>
              <input
                id="settings-fee"
                ref={feeRef}
                type="number"
                defaultValue={user.consultation_fee || ''}
                placeholder="500"
                min="0"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          id="settings-save-btn"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#1a9e8f] text-white rounded-full py-3 text-sm font-medium hover:bg-[#158577] transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        {saveMsg && (
          <p className={`mt-3 text-center text-sm ${saveMsg.includes('fail') || saveMsg.includes('failed') ? 'text-red-500' : 'text-green-600'}`}>
            {saveMsg}
          </p>
        )}

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 mt-6">
          <h2 className="text-lg font-medium text-[#0d2b28] mb-5">
            Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Current Password</label>
              <input type="password" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">New Password</label>
              <input type="password" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Confirm New Password</label>
              <input type="password" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm text-[#0d2b28] focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white" />
            </div>
            <button
              id="change-password-btn"
              className="bg-[#1a9e8f] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#158577] transition"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


