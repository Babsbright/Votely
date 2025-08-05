"use client";

import Link from "next/link";
import { useEffect } from "react";
import gsap from "gsap";

export default function LandingPage() {
  useEffect(() => {
    gsap.from(".fade-in", {
      opacity: 1,
      y: 40,
      duration: 1,
      ease: "power2.out",
      stagger: 0.2,
    });
  }, []);

  return (
    // <main className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 text-gray-900 font-outfit overflow-x-hidden">
    <main className="min-h-screen bg-black text-white font-outfit overflow-x-hidden">
    {/* Navbar */}
      {/* <nav className="sticky top-0 z-50 bg-white bg-opacity-95 backdrop-blur-md shadow-md py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold text-purple-700">
          Votelly
        </Link>
        <div className="space-x-4 hidden sm:flex">
          <Link href="/events" className="hover:text-purple-600 font-medium">
            Events
          </Link>
          <Link href="/create-event" className="hover:text-purple-600 font-medium">
            Create Event
          </Link>
          <Link href="/login" className="hover:text-purple-600 font-medium">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-700"
          >
            Sign Up
          </Link>
        </div>
      </nav> */}
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black bg-opacity-95 backdrop-blur-md shadow-md py-4 px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="text-3xl font-extrabold text-white">
          Votelly
        </Link>
        <div className="space-x-4 hidden sm:flex items-center">
         
          <Link href="/events" className="hover:text-purple-300 font-medium">
            Create Event
          </Link>
         
          <Link
            href="/login"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-700"
          >
           Login
          </Link>
        </div>
      </nav>

    {/* Hero Section - Webex Style */}
      <section className="relative min-h-[80vh] flex flex-col md:flex-row justify-between items-center px-6 md:px-20 py-20 bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="md:w-1/2 text-left">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white mb-6">
            Create & Run <br /> Stunning Voting Events
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Whether it's a photo contest, talent show, or fan favorite challenge — Votelly makes it ridiculously easy to set up, vote, and view results live.
          </p>
          <div>
            <p className="text-md text-purple-400 font-medium mb-2">
              Featured Event:
            </p>
            <p className="text-xl font-bold text-purple-400">
              Top Model Africa — Voting Ends August 13, 2025
            </p>
            <p className="text-sm text-gray-400 mb-6">
              (UTC+01:00) West Central Africa
            </p>
            <p className="text-sm text-white">
              <span className="font-semibold">Organizer:</span> FameFest Studios
            </p>
          </div>
        </div>

        <div className="md:w-1/2 bg-white text-black rounded-lg shadow-lg p-8 max-w-sm mt-10 md:mt-0">
          <h2 className="text-2xl font-bold mb-4">Start Your Own Contest</h2>
          <p className="text-sm mb-6">
            Set up an event in minutes. Add contestants, set vote limits, and go live. It's free, secure, and insanely fast.
          </p>
          <Link
            href="/events"
            className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold"
          >
            Launch an Event
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-purple-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-purple-800 mb-12">What Users Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md fade-in">
                <p className="text-gray-700 text-sm italic">
                  "Votelly made our community contest go viral! We had over 5,000 votes in 48 hours."
                </p>
                <div className="mt-4 text-left">
                  <p className="font-semibold text-purple-700">Jane M.</p>
                  <p className="text-xs text-gray-500">Event Host, Lagos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-purple-800 mb-8">Pricing that Fits Everyone</h2>
          <p className="text-gray-700 mb-12">
            Start for free. Upgrade only when you're ready for more powerful features.
          </p>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="p-8 bg-purple-50 rounded-xl shadow-md fade-in">
              <h3 className="text-xl font-semibold text-purple-700 mb-4">Free Plan</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ Create 1 Event</li>
                <li>✅ Up to 500 Votes</li>
                <li>✅ Live Results</li>
                <li>✅ Export as PDF</li>
              </ul>
            </div>
            <div className="p-8 bg-purple-600 text-white rounded-xl shadow-lg fade-in">
              <h3 className="text-xl font-semibold mb-4">Pro Plan</h3>
              <ul className="text-sm space-y-2">
                <li>🚀 Unlimited Events</li>
                <li>🚀 Unlimited Votes</li>
                <li>🚀 Voter Analytics</li>
                <li>🚀 Priority Support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-purple-700 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Launch Your Contest?</h2>
        <p className="text-lg mb-6">Get started for free and watch the votes roll in.</p>
        <Link
          href="/create-event"
          className="bg-white text-purple-700 px-6 py-3 text-lg font-semibold rounded hover:bg-purple-100"
        >
          Create Event Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Votelly. Built with 💜 in Naija.
      </footer>
    </main>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-purple-700">{number}</div>
      <div className="text-gray-700 text-sm">{label}</div>
    </div>
  );
}
