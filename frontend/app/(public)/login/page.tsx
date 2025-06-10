'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IMAGES } from '@/utils/images';
import Logo from '@/components/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Logo />
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
                <p className="text-base text-gray-600">Sign in to your account</p>
              </div>
              <form className="mt-12 space-y-7">
                <div className="space-y-5">
                  <div className="relative">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-black focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Remember me</label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-red-600 hover:text-red-500">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                >
                  Sign in
                </button>
              </form>

              <p className="mt-2 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-red-600 hover:text-red-500">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2">
        <div className="h-full w-full relative">
          <img
            src={IMAGES.login}
            alt="Study"
            className="absolute inset-0 w-full h-full object-cover rounded-l-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-black/20 rounded-l-3xl" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;