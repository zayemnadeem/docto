import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import StarRating from '../../components/StarRating';

const STATUS_STYLES = {
  confirmed: 'bg-[#d1fae5] text-[#065f46]',
  pending: 'bg-[#fef3c7] text-[#92400e]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  completed: 'bg-[#e6f7f5] text-[#1a9e8f]',
};

const TABS = ['upcoming', 'completed', 'cancelled'];

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Per-booking review state
  const [reviewOpen, setReviewOpen] = useState(null);   // booking id
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewedIds, setReviewedIds] = useState(new Set()); // already reviewed

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.post(`${API_URL}/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel booking.');
    }
  };

  const handleRemovePending = async (bookingId) => {
    if (!window.confirm('Remove this incomplete booking from your list?')) return;
    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove booking.');
    }
  };

  const filterBookings = (tab) => {
    if (tab === 'upcoming') return bookings.filter(b => ['confirmed', 'pending'].includes(b.booking.status));
    if (tab === 'completed') return bookings.filter(b => b.booking.status === 'completed');
    if (tab === 'cancelled') return bookings.filter(b => b.booking.status === 'cancelled');
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

  const openReview = (bookingId) => {
    setReviewOpen(bookingId);
    setReviewRating(5);
    setReviewText('');
    setReviewError('');
  };

  const submitReview = async (bookingId) => {
    if (!reviewText.trim()) {
      setReviewError('Please write a short review before submitting.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await axios.post(
        `${API_URL}/reviews`,
        { booking_id: bookingId, rating: reviewRating, review_text: reviewText.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReviewedIds(prev => new Set([...prev, bookingId]));
      setReviewOpen(null);
      setReviewText('');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setReviewError(typeof detail === 'string' ? detail : 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filtered = filterBookings(activeTab);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#1a9e8f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-[#0d2b28] mb-8">
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
                  ? 'bg-[#1a9e8f] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#1a9e8f]'
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
              <Link to="/" className="mt-4 inline-block bg-[#1a9e8f] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#158577] transition">
                Find a Doctor
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b.booking.id} className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#e6f7f5] border border-[#c8e8e5] flex items-center justify-center text-sm font-medium text-[#1a9e8f]">
                        {b.doctor?.full_name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="font-medium text-[#0d2b28]">{b.doctor?.full_name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#e6f7f5] text-[#1a9e8f]">{b.doctor?.specialization}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280] mt-3">
                      <span>{formatDate(b.slot?.date)}</span>
                      <span>&middot;</span>
                      <span>{formatTime(b.slot?.start_time)}</span>
                      <span>&middot;</span>
                      <span className="text-[#0d2b28] font-medium">&#8377;{b.booking.advance_amount} {b.booking.payment_status === 'paid' ? 'paid' : 'to pay'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[b.booking.status] || STATUS_STYLES.pending}`}>
                      {b.booking.status}
                    </span>
                    {b.booking.status === 'confirmed' && (
                      <button
                        id={`cancel-booking-${b.booking.id}`}
                        onClick={() => handleCancel(b.booking.id)}
                        className="border border-[#fecaca] text-[#ef4444] rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[#fef2f2] transition"
                      >
                        Cancel
                      </button>
                    )}
                    {b.booking.status === 'pending' && (
                      <button
                        onClick={() => handleRemovePending(b.booking.id)}
                        className="text-[#9ca3af] hover:text-[#ef4444] text-xs font-medium transition underline underline-offset-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Leave Review (completed) */}
                {b.booking.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                    {reviewedIds.has(b.booking.id) ? (
                      <p className="text-sm text-[#1a9e8f] font-medium flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Review submitted &mdash; thank you!
                      </p>
                    ) : reviewOpen === b.booking.id ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[#6b7280] font-medium mb-2">Your rating</p>
                          <StarRating rating={reviewRating} setRating={setReviewRating} />
                        </div>
                        <textarea
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          placeholder="Share your experience with this doctor&hellip;"
                          className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9e8f] bg-white resize-none"
                          rows={3}
                        />
                        {reviewError && (
                          <p className="text-xs text-[#ef4444]">{reviewError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            id={`submit-review-${b.booking.id}`}
                            onClick={() => submitReview(b.booking.id)}
                            disabled={reviewSubmitting}
                            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                              reviewSubmitting
                                ? 'bg-[#e6f7f5] text-[#9ca3af] cursor-not-allowed'
                                : 'bg-[#1a9e8f] text-white hover:bg-[#158577]'
                            }`}
                          >
                            {reviewSubmitting ? 'Submitting&hellip;' : 'Submit Review'}
                          </button>
                          <button
                            onClick={() => { setReviewOpen(null); setReviewError(''); }}
                            className="border border-[#e5e7eb] text-[#5a7370] rounded-full px-5 py-2 text-sm font-medium hover:bg-[#f8f9fb] transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        id={`leave-review-${b.booking.id}`}
                        onClick={() => openReview(b.booking.id)}
                        className="border border-[#c8e8e5] text-[#1a9e8f] rounded-full px-5 py-2 text-sm font-medium hover:bg-[#e6f7f5] transition"
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


