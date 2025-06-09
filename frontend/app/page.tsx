"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWishlist } from './context/WishlistContext';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    // Hero section animations
    gsap.from(".hero-text", {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power4.out",
    });

    // Features animations
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top center",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
    });

    // Stats animations
    gsap.from(".stat-item", {
      scrollTrigger: {
        trigger: statsRef.current,
        start: "top center",
      },
      scale: 0.5,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)",
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center px-4 py-20"
      >
        <h1 className="hero-text text-6xl md:text-7xl font-bold text-gray-900 text-center mb-6">
          Master IELTS with
          <span className="text-red-600 block">Confidence</span>
        </h1>
        <p className="hero-text text-xl md:text-2xl text-gray-600 text-center max-w-2xl mb-12">
          Comprehensive practice sessions, personalized study plans, and expert-designed content to achieve your target score.
        </p>
        <button className="hero-text bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transform hover:scale-105 transition-all">
          Start Practice Now
        </button>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          Complete IELTS Preparation
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: "speaking",
              title: "Speaking Practice",
              description: "AI-powered speaking sessions with instant feedback",
              icon: "🎙️",
            },
            {
              id: "writing",
              title: "Writing Assessment",
              description: "Expert evaluation of your essays and reports",
              icon: "✍️",
            },
            {
              id: "reading",
              title: "Reading Tests",
              description: "Timed reading exercises with detailed explanations",
              icon: "📚",
            },
          ].map((feature) => (
            <div
              key={feature.id}
              className="feature-card bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow relative"
            >
              <button
                onClick={() => isInWishlist(feature.id) 
                  ? removeFromWishlist(feature.id)
                  : addToWishlist(feature)
                }
                className="absolute top-4 right-4 text-red-600 hover:text-red-700 transition-colors"
              >
                {isInWishlist(feature.id) ? (
                  <span className="text-2xl">❤️</span>
                ) : (
                  <span className="text-2xl">🤍</span>
                )}
              </button>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="bg-red-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { number: "10K+", label: "Active Students" },
            { number: "500+", label: "Practice Tests" },
            { number: "95%", label: "Success Rate" },
            { number: "8.0", label: "Average Score" },
          ].map((stat, index) => (
            <div key={index} className="stat-item text-center">
              <div className="text-4xl font-bold mb-2">{stat.number}</div>
              <div className="text-red-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-8">Ready to Start Your Journey?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Join thousands of successful IELTS test-takers who prepared with our
          platform
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transform hover:scale-105 transition-all">
            Create Free Account
          </button>
          <button className="border-2 border-red-600 text-red-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-50 transform hover:scale-105 transition-all">
            View Study Plans
          </button>
        </div>
      </section>
    </div>
  );
}
