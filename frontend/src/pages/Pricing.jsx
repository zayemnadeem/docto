import React from 'react';
import { Link } from 'react-router-dom';

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
    popular: false,
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

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative py-20 px-6 overflow-hidden border-b border-[#e5e7eb]"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, #dde8f8 0%, transparent 55%),
                       radial-gradient(ellipse at 80% 20%, #e8dff5 0%, transparent 55%), #fff`
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl text-[#111827] leading-tight tracking-tight"
            style={{ fontFamily: 'Instrument Serif, serif' }}
          >
            Simple, Transparent Pricing for Doctors
          </h1>
          <p className="mt-4 text-lg text-[#6b7280] max-w-xl mx-auto leading-relaxed">
            Upgrade your practice. Appear higher in search results, unlock advanced analytics, and get more patients.
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 ${
                plan.popular
                  ? 'border-[#111827] shadow-lg xl:-translate-y-4 bg-white z-10'
                  : 'border-[#e5e7eb] hover:border-[#374151] hover:shadow-md bg-white'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-4 py-1 rounded-full bg-[#111827] text-white whitespace-nowrap tracking-wide">
                  MOST POPULAR
                </span>
              )}
              
              <div className="mb-6 flex-grow">
                <p className="text-sm font-medium text-[#6b7280] uppercase tracking-wide">{plan.duration}</p>
                <h3 className="text-2xl text-[#111827] mt-1 mb-3" style={{ fontFamily: 'Instrument Serif, serif' }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-[#111827]">&#8377;{plan.price}</span>
                  <span className="text-sm text-[#6b7280] font-medium">/{plan.duration === '1 month' ? 'mo' : plan.duration}</span>
                </div>
              </div>

              <div className="border-t border-[#f3f4f6] pt-6 mb-8 flex-grow">
                <ul className="space-y-4">
                  {plan.benefits.map(b => (
                    <li key={b} className="flex items-start gap-3 text-sm text-[#374151]">
                      <svg className="w-5 h-5 text-[#10b981] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/register"
                className={`w-full rounded-full py-3 text-sm font-medium transition text-center ${
                  plan.popular 
                  ? 'bg-[#111827] text-white hover:bg-[#374151]' 
                  : 'bg-[#f8f9fb] text-[#111827] hover:bg-[#e5e7eb] border border-[#e5e7eb]'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ or extra info */}
        <div className="mt-20 max-w-2xl mx-auto text-center space-y-4">
          <h3 className="text-2xl text-[#111827]" style={{ fontFamily: 'Instrument Serif, serif' }}>Frequently Asked Questions</h3>
          <div className="bg-[#f8f9fb] rounded-2xl p-6 border border-[#e5e7eb] text-left">
            <h4 className="font-medium text-[#111827]">Can I upgrade or downgrade anytime?</h4>
            <p className="text-sm text-[#6b7280] mt-1 mb-4">Yes, your plan will be seamlessly prorated for upgrades.</p>
            
            <h4 className="font-medium text-[#111827]">Is there a completely free plan?</h4>
            <p className="text-sm text-[#6b7280] mt-1">Yes, new doctors start on a basic free plan to explore the platform before opting into increased visibility.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
