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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-auto">
      <div className="flex-1 flex items-center justify-center p-[5%]">
        <div className="w-[90%] max-w-[32rem]">
          <Logo />
          <div className="bg-white rounded-[1.5rem] shadow-xl overflow-hidden">
            <div className="px-[6%] py-[8%]">
              <div className="text-center">
                <h2 className="mt-[1.5rem] text-[2rem] font-bold text-red-700">Verify OTP</h2>
                <p className="mt-[0.5rem] text-[0.875rem] text-gray-600">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div className="mt-[2rem]">
                <div className="flex justify-center gap-[3%]">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-[15%] aspect-square text-center text-[1.5rem] font-semibold border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  ))}
                </div>

                <button className="mt-[2rem] w-full flex justify-center py-[0.75rem] px-[1rem] border border-transparent rounded-md shadow-sm text-[0.875rem] font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Verify OTP
                </button>

                <div className="mt-[1rem] text-center">
                  <button className="text-[0.875rem] text-red-600 hover:text-red-500">
                    Resend OTP
                  </button>
                </div>
              </div>

              <div className="mt-[1rem] text-center">
                <Link href="/login" className="text-[0.875rem] text-red-600 hover:text-red-500">
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2">
        <div className="h-[90vh] w-[90%] relative m-[5%] rounded-[1.5rem] overflow-hidden">
          <img
            src={IMAGES.verify}
            alt="Verification"
            className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem]"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-black/20 rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;