'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IMAGES } from '@/utils/images';
import Logo from '@/components/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-auto">
      <div className="flex-1 flex items-center justify-center p-[5%]">
        <div className="w-[90%] max-w-[32rem]">
          <Logo />
          <div className="bg-white rounded-[1.5rem] shadow-xl overflow-hidden">
            <div className="px-[6%] py-[8%]">
              <div className="text-center">
                <h2 className="mt-[1.5rem] text-[2rem] font-bold text-red-700">Welcome back</h2>
                <p className="mt-[0.5rem] text-[0.875rem] text-gray-600">Sign in to your account</p>
              </div>
              
              <form className="mt-[2rem] space-y-[1.5rem]">
                <div className="space-y-[1rem]">
                  <div className="relative">
                    <label className="text-[0.875rem] font-medium text-gray-700 mb-[0.25rem] block">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-[0.75rem] py-[0.5rem] border border-gray-300 placeholder-gray-400 text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[0.875rem] font-medium text-gray-700 mb-[0.25rem] block">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-[0.75rem] py-[0.5rem] border border-gray-300 placeholder-gray-400 text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-black focus:ring-red-500 border-gray-300 rounded" />
                    <label className="ml-2 text-[0.875rem] text-gray-900">Remember me</label>
                  </div>
                  <Link href="/forgot-password" className="text-[0.875rem] text-red-600 hover:text-red-500">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" className="w-full flex justify-center py-[0.75rem] px-[1rem] border border-transparent rounded-md shadow-sm text-[0.875rem] font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Sign in
                </button>
              </form>

              <p className="mt-[0.5rem] text-center text-[0.875rem] text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-red-600 hover:text-red-500">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2">
        <div className="h-[90vh] w-[90%] relative m-[5%] rounded-[1.5rem] overflow-hidden">
          <img src={IMAGES.login} alt="Study" className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem]" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-black/20 rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;