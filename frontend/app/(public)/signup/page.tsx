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
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-white overflow-auto">
      <div className="flex-1 flex items-center justify-center p-[5%]">
        <div className="w-[90%] max-w-[32rem]">
          <Logo />
          <div className="bg-white rounded-[1.5rem] shadow-xl overflow-hidden">
            <div className="px-[6%] py-[8%]">
              <div className="text-center">
                <h2 className="mt-[1.5rem] text-[2rem] font-bold text-red-700">Create an account</h2>
                <p className="mt-[0.5rem] text-[0.875rem] text-gray-600">Join us today</p>
              </div>
              
              <form className="mt-[2rem] space-y-[1.5rem]">
                <div className="rounded-md shadow-sm space-y-[1rem]">
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
                  className="w-full flex justify-center py-[0.75rem] px-[1rem] border border-transparent rounded-md shadow-sm text-[0.875rem] font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
        <div className="h-[90vh] w-[90%] relative m-[5%] rounded-[1.5rem] overflow-hidden">
          <img
            src={IMAGES.signup}
            alt="Education"
            className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20 rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;