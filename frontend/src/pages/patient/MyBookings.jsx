import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import StarRating from '../../components/StarRating';

const STATUS_STYLES = {
  confirmed: 'bg-[#d1fae5] text-[#065f46]',
  pending: 'bg-[#fef3c7] text-[#92400e]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  completed: 'bg-[#f3f4f6] text-[#374151]',
};

const TABS = ['upcoming', 'completed', 'cancelled'];

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewOpen, setReviewOpen] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_URL}/patients/me/bookings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBookings(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filterBookings = (tab) => {
    if (tab === 'upcoming') return bookings.filter(b => ['confirmed', 'pending'].includes(b.status));
    if (tab === 'completed') return bookings.filter(b => b.status === 'completed');
    if (tab === 'cancelled') return bookings.filter(b => b.status === 'cancelled');
    return bookings;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const filtered = filterBookings(activeTab);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#111827] mb-8" style={{ fontFamily: 'Instrument Serif, serif' }}>
          My Appointments
        </h1>

        {/* Tab Strip */}
        <div className="flex gap-1 bg-[#f8f9fb] rounded-full p-1 w-fit mb-8 border border-[#e5e7eb]">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`bookings-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Booking List */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f8f9fb] border border-[#e5e7eb] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[#9ca3af] text-sm">No {activeTab} appointments.</p>
            {activeTab === 'upcoming' && (
              <Link to="/" className="mt-4 inline-block bg-[#111827] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#374151] transition">
                Find a Doctor
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center text-sm font-medium text-[#374151]" style={{ fontFamily: 'Instrument Serif, serif' }}>
                        {b.doctor?.full_name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="font-medium text-[#111827]">{b.doctor?.full_name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[#374151]">{b.doctor?.specialization}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280] mt-3">
                      <span>{formatDate(b.slot?.date)}</span>
                      <span>·</span>
                      <span>{formatTime(b.slot?.start_time)}</span>
                      <span>·</span>
                      <span className="text-[#111827] font-medium">₹{b.advance_amount} paid</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                      {b.status}
                    </span>
                    {b.status === 'confirmed' && (
                      <button
                        id={`cancel-booking-${b.id}`}
                        className="border border-[#fecaca] text-[#ef4444] rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#fef2f2] transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Leave Review (completed) */}
                {b.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                    {reviewOpen === b.id ? (
                      <div className="space-y-3">
                        <StarRating rating={reviewRating} setRating={setReviewRating} />
                        <textarea
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          placeholder="Share your experience…"
                          className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button className="bg-[#111827] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#374151] transition">
                            Submit Review
                          </button>
                          <button onClick={() => setReviewOpen(null)} className="border border-[#e5e7eb] text-[#374151] rounded-full px-5 py-2 text-sm font-medium hover:bg-[#f8f9fb] transition">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        id={`leave-review-${b.id}`}
                        onClick={() => setReviewOpen(b.id)}
                        className="border border-[#e5e7eb] text-[#111827] rounded-full px-5 py-2 text-sm font-medium hover:bg-[#f8f9fb] transition"
                      >
                        Leave a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
