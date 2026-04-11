import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL, useAuth } from '../../contexts/AuthContext';

export default function BookingConfirm() {
  const { id } = useParams(); // Slot ID
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor, selectedSlot } = location.state || {}; // Passed from DoctorProfile
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!doctor || !selectedSlot) {
    return <div className="p-8 text-center text-red-500">Invalid booking parameters. Go back and select a slot.</div>;
  }

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/bookings`, { doctor_id: doctor.id, slot_id: selectedSlot.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const order = res.data;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Docto Setup",
        description: `Advance for appointment with ${doctor.full_name}`,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API_URL}/bookings/${order.booking_id}/confirm-payment`, { // Warning: create_booking returns order without booking_id in standard scheme wait... Let me look at create_booking in API!
              // In API create_booking returns schemas.RazorpayOrderOut
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              razorpay_order_id: response.razorpay_order_id
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert("Booking Confirmed!");
            navigate('/patient/bookings');
          } catch(err) {
            setError("Payment confirmation failed. Check your network.");
          }
        },
        prefill: { name: user?.full_name || '', email: user?.email || '' },
        theme: { color: "#2563eb" }
      };
      
      if (window.Razorpay) {
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
         setError("Razorpay SDK not loaded.");
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to create booking order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Confirm Appointment</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">{error}</div>}

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
           {doctor.profile_photo ? (
             <img src={doctor.profile_photo} alt={doctor.full_name} className="w-16 h-16 rounded-full object-cover shadow-sm"/>
           ) : (
             <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold font-serif">
               {doctor.full_name.charAt(0)}
             </div>
           )}
           <div>
             <h3 className="text-xl font-semibold">{doctor.full_name}</h3>
             <p className="text-sm text-gray-500">{doctor.specialization}</p>
           </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <p className="text-gray-700"><strong>Date:</strong> {selectedSlot.date}</p>
          <p className="text-gray-700"><strong>Time:</strong> {selectedSlot.start_time.slice(0,5)} - {selectedSlot.end_time.slice(0,5)}</p>
          <p className="text-gray-700 mt-2"><strong>Total Fee:</strong> ₹{doctor.consultation_fee}</p>
          <p className="text-blue-800 font-semibold text-lg mt-2 pt-2 border-t border-blue-200">
             Advance Payment required (30%): ₹{Math.round(doctor.consultation_fee * 0.3)}
          </p>
          <span className="text-xs text-gray-500">* Advance is required to secure the slot and prevent no-shows.</span>
        </div>

        <button 
          onClick={handleBooking} 
          disabled={loading}
          className={`w-full py-3 mt-6 rounded-lg font-bold text-white shadow-md transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
        >
          {loading ? 'Processing...' : 'Pay Advance & Book'}
        </button>
      </div>
    </div>
  );
}
