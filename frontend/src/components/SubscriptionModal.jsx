import React from 'react';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 99,
    duration: '1 month',
    benefits: ['Appear in search results', 'Up to 30 bookings/month', 'Basic analytics', 'Email support'],
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 250,
    duration: '3 months',
    benefits: ['Everything in Monthly', 'Priority in search results', 'Advanced analytics', 'Priority support'],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 999,
    duration: '12 months',
    benefits: ['Everything in Quarterly', 'Top search placement', 'Full analytics suite', 'Dedicated support', 'Profile badge'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 349,
    duration: '6 months',
    benefits: ['Multi-clinic support', 'Team accounts', 'Custom analytics', 'SLA guarantee', 'Account manager'],
  },
];

export default function SubscriptionModal({ onClose, onSubscribe }) {
  if (!onClose) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-[#e5e7eb] shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-medium text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>
                Choose a Plan
              </h2>
              <p className="text-sm text-[#6b7280] mt-1">
                Upgrade to appear higher in search results and unlock analytics.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#f8f9fb] text-[#9ca3af] hover:text-[#374151] transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-5 border transition-all ${
                plan.popular
                  ? 'border-[#111827] shadow-md'
                  : 'border-[#e5e7eb] hover:border-[#374151]'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full bg-[#111827] text-white whitespace-nowrap">
                  Most Popular
                </span>
              )}
              <div className="mb-4">
                <p className="text-sm font-medium text-[#6b7280]">{plan.duration}</p>
                <h3 className="text-lg font-medium text-[#111827] mt-0.5" style={{ fontFamily: 'Instrument Serif, serif' }}>
                  {plan.name}
                </h3>
                <p className="text-3xl font-semibold text-[#111827] mt-2">
                  &#8377;{plan.price}
                </p>
              </div>
              <ul className="space-y-2 mb-5">
                {plan.benefits.map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm text-[#374151]">
                    <svg className="w-4 h-4 text-[#10b981] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <button
                id={`subscribe-${plan.id}-btn`}
                onClick={() => onSubscribe && onSubscribe(plan)}
                className="w-full bg-[#111827] text-white rounded-full py-2.5 text-sm font-medium hover:bg-[#374151] transition"
              >
                Subscribe for &#8377;{plan.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
