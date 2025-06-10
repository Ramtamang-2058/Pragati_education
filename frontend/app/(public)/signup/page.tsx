'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IMAGES } from '@/utils/images';
import Logo from '@/components/Logo';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  return (
    <div className="min-h-screen flex flex-row-reverse bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Logo />
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold text-gray-900">Create an account</h2>
                <p className="mt-2 text-sm text-gray-600">Join us today</p>
              </div>
              
              <form className="mt-8 space-y-6">
                <div className="rounded-md shadow-sm space-y-4">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Full name"
                  />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Email address"
                  />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Password"
                  />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Confirm password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Sign up
                </button>
              </form>

              <p className="mt-2 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2">
        <div className="h-full w-full relative">
          <img
            src={IMAGES.signup}
            alt="Education"
            className="absolute inset-0 w-full h-full object-cover rounded-r-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20 rounded-r-3xl" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;