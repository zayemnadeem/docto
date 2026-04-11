import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function PatientProfile() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Full Name</label>
          <p className="mt-1 text-lg text-gray-900 border border-gray-200 px-4 py-2 rounded-md bg-gray-50">{user.full_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Email Address</label>
          <p className="mt-1 text-lg text-gray-900 border border-gray-200 px-4 py-2 rounded-md bg-gray-50">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Phone</label>
          <p className="mt-1 text-lg text-gray-900 border border-gray-200 px-4 py-2 rounded-md bg-gray-50">{user.phone || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}
