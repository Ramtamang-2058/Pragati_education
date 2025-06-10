'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Handle password reset logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <Logo />
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset password</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address to receive a password reset link
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Email address"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Send reset link
                </button>
              </form>
            ) : (
              <div className="text-center mt-8">
                <div className="text-green-600 mb-4">
                  Check your email for the OTP code
                </div>
                <Link href="/verify-otp" className="text-red-600 hover:text-red-500">
                  Enter OTP code
                </Link>
              </div>
            )}

            <div className="text-center">
              <Link href="/login" className="text-sm text-red-600 hover:text-red-500">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;