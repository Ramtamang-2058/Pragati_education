'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { IMAGES } from '@/utils/images';
import Logo from '@/components/Logo';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Logo />
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Verify OTP</h2>
                <p className="text-base text-gray-600">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div className="mt-12">
                <div className="flex justify-center space-x-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-semibold border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  ))}
                </div>

                <button
                  className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Verify OTP
                </button>

                <div className="mt-4 text-center">
                  <button className="text-sm text-red-600 hover:text-red-500">
                    Resend OTP
                  </button>
                </div>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-sm text-red-600 hover:text-red-500">
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2">
        <div className="h-full w-full relative">
          <img
            src={IMAGES.verify}
            alt="Verification"
            className="absolute inset-0 w-full h-full object-cover rounded-l-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-black/20 rounded-l-3xl" />
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;