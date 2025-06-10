'use client';
import React, { useState } from 'react';
import { IMAGES } from '@/utils/images';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  const plans = [
    { 
      name: 'Basic', 
      price: '999',
      duration: '1 month',
      features: [
        'Access to basic study materials',
        'Practice tests',
        'Email support'
      ]
    },
    { 
      name: 'Standard', 
      price: '2499', 
      duration: '3 months',
      features: [
        'Everything in Basic',
        'Mock tests with evaluation',
        'Group discussion sessions',
        'Priority email support'
      ]
    },
    { 
      name: 'Premium', 
      price: '4999', 
      duration: '6 months',
      features: [
        'Everything in Standard',
        '1-on-1 mentoring sessions',
        'Personalized study plan',
        '24/7 support'
      ]
    }
  ];

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: '💳' },
    { id: 'khalti', name: 'Khalti', icon: '🇳🇵' },
    { id: 'esewa', name: 'eSewa', icon: '💰' },
    { id: 'payoneer', name: 'Payoneer', icon: '🌐' }
  ];

  return (
    <div className="min-h-screen relative">
      <img
        src={IMAGES.subscription}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
      
      <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white tracking-tight">Choose your plan</h2>
            <p className="mt-4 text-xl text-gray-200">Select a plan that works best for you</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedPlan === plan.name 
                    ? 'ring-2 ring-black shadow-[0_8px_30px_rgb(0,0,0,0.16)]' 
                    : 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]'
                }`}
              >
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-6 flex items-baseline">
                  <span className="text-5xl font-extrabold">NPR {plan.price}</span>
                  <span className="ml-2 text-gray-600">/{plan.duration}</span>
                </div>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedPlan(plan.name)}
                  className="mt-8 w-full py-3 px-6 text-base font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-white bg-black hover:bg-gray-800"
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
              <h3 className="text-xl font-semibold mb-6">Select payment method</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${
                      selectedPayment === method.id ? 'border-black bg-gray-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="font-medium">{method.name}</div>
                  </div>
                ))}
              </div>

              <button
                className="w-full mt-8 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;