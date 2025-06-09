"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-2xl text-red-600">
            Pragati IELTS
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-red-600 transition-colors">
              Home
            </Link>
            <Link href="/study-plan" className="text-gray-700 hover:text-red-600 transition-colors">
              Study Plan
            </Link>
            <Link href="/practice" className="text-gray-700 hover:text-red-600 transition-colors">
              Practice Tests
            </Link>
            <Link href="/resources" className="text-gray-700 hover:text-red-600 transition-colors">
              Resources
            </Link>
            <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
