"use client";

import Link from "next/link";
import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { FaInstagram, FaXTwitter, FaFacebookF } from "react-icons/fa6";

gsap.registerPlugin(ScrollTrigger);
export default function LandingPage() {
  useEffect(() => {
  
    // Animate headline text with SplitType
    const split = new SplitType(".hero-heading", { types: "words,chars" });
    gsap.from(split.chars, {
      opacity: 0,
      y: 50,
      stagger: 0.02,
      duration: 1,
      ease: "back.out(1.7)",
      delay: 0.5,
      clearProps: "opacity,transform", // this is the magic line
    });

    // Button hover bounce
    gsap.utils.toArray(".cta-button").forEach((btn) => {
      const button = btn as Element;
      button.addEventListener("mouseenter", () => {
        gsap.to(button, { scale: 1.05, duration: 0.3, ease: "power1.out" });
      });
      button.addEventListener("mouseleave", () => {
        gsap.to(button, { scale: 1, duration: 0.3, ease: "power1.out" });
      });
    });
    // Animated fade-slide-in with stagger
    gsap.utils.toArray(".fade-in").forEach((el) => {
      gsap.fromTo(
        el as Element,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el as Element,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    });

    // Wiggle social icons
    gsap.utils.toArray(".social-icon").forEach((el) => {
      gsap.to(el as Element, {
        rotation: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        duration: 1.2,
      });
    });

    gsap.fromTo(
      ".hero-card",
      { rotationY: -180, opacity: 0 },
      {
        rotationY: 0,
        opacity: 1,
        duration: 1.2,
        ease: "back.out(1.7)",
        transformOrigin: "center",
        scrollTrigger: {
          trigger: ".hero-card",
          start: "top 80%",
          once: true,
        },
      }
    );

    // Newsletter input bounce
    gsap.from(".newsletter-form", {
      scrollTrigger: {
        trigger: ".newsletter-form",
        start: "top 85%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "bounce.out",
    });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white font-outfit overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black bg-opacity-95 backdrop-blur-md shadow-md py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold text-purple-500">
          Votelly
        </Link>
        <div className="space-x-4 hidden sm:flex items-center">
          <Link
            href="/events"
            className="hover:text-purple-300 font-medium text-sm"
          >
            Create Event
          </Link>
          <Link
            href="/signup"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 text-sm"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section - Webex Style */}
      <section className="relative min-h-[80vh] flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-20 bg-[url('/hero.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="md:w-1/2 text-left">
          <h1 className="hero-heading text-5xl md:text-6xl font-bold leading-tight text-white mb-6">
            Create & Run <br /> Stunning Voting Events
          </h1>
          <p className="text-sm text-gray-300 mb-8">
            Whether it&apos;s a photo contest, talent show, or fan favorite challenge
            — Votelly makes it ridiculously easy to set up, vote, and view
            results live.
          </p>
          <div>
            <p className="text-sm text-purple-400 font-medium mb-2">
              Featured Event:
            </p>
            <p className="text-base font-bold text-purple-400">
              Top Model Africa — Voting Ends August 13, 2025
            </p>
            <p className="text-xs text-gray-400 mb-6">
              (UTC+01:00) West Central Africa
            </p>
            <p className="text-xs text-white">
              <span className="font-semibold">Organizer:</span> FameFest Studios
            </p>
          </div>
        </div>

        <div className="hero-card md:w-1/2 bg-white text-black rounded-lg shadow-lg p-8 max-w-sm mt-10 md:mt-0">
          <h2 className="text-xl font-bold mb-4">Start Your Own Contest</h2>
          <p className="text-sm mb-6">
            Set up an event in minutes. Add contestants, set vote limits, and go
            live. It&apos;s free, secure, and insanely fast.
          </p>
          <Link
            href="/events"
            className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold text-sm"
          >
            Launch an Event
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#0f0f0f] text-white py-24 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            {
              title: "🎯 Zero Hassle Setup",
              desc: "Create and launch contests in less than 2 minutes. No tech skills required.",
            },
            {
              title: "📈 Real-time Voting",
              desc: "Votes update live. View contestant rankings and analytics instantly.",
            },
            {
              title: "🛡️ Anti-Fraud Controls",
              desc: "Limit votes per user, set reset intervals, and keep your contest fair.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="fade-in opacity-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition duration-300"
            >
              <h3 className="text-purple-500 font-semibold text-sm mb-2">
                {f.title}
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-black text-white border-t border-t-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 text-center gap-6 px-6">
          {[
            ["1.2M+", "Total Votes"],
            ["800+", "Events Hosted"],
            ["99.99%", "Uptime"],
            ["4.8⭐", "Average Rating"],
          ].map(([num, label], i) => (
            <div key={i} className="fade-in opacity-0">
              <div className="text-lg font-bold text-purple-500">{num}</div>
              <div className="text-gray-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-28 px-6 bg-gradient-to-r from-purple-800 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero.svg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Go Live?</h2>
          <p className="text-sm text-purple-100 mb-6">
            Set up your contest, invite your audience, and watch the votes roll
            in. No stress. Just results.
          </p>
          <Link
            href="/events"
            className="cta-button inline-block bg-white text-purple-800 hover:bg-purple-200 px-6 py-3 text-sm font-semibold rounded shadow"
          >
            Create an Event
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-16 px-6 text-gray-400 text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 fade-in">
          {/* Votelly Info */}
          <div>
            <h4 className="text-sm font-semibold text-purple-500 mb-2">Votelly</h4>
            <p className="text-xs leading-relaxed text-gray-400">
              Votelly lets you launch powerful, engaging voting contests in
              minutes. Create, vote, and share events with real-time results and
              fraud-proof security.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-purple-500 mb-2">
              Quick Links
            </h4>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-purple-500 mb-2">
              Stay Connected
            </h4>
            <div className="flex gap-4 text-lg mb-4 social-icon">
              <Link
                href="https://instagram.com"
                target="_blank"
                className="hover:text-white social-icon"
              >
                <FaInstagram />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                className="hover:text-white social-icon"
              >
                <FaXTwitter />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                className="hover:text-white social-icon"
              >
                <FaFacebookF />
              </Link>
            </div>
            <form className="flex items-center gap-2 group">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-800 text-white text-xs px-3 py-2 rounded w-full focus:outline-none transition-all duration-300 group-hover:scale-105"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs transform transition-transform duration-300 hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-600 text-xs border-t border-gray-700 pt-6">
          © {new Date().getFullYear()} <span className=" text-purple-500">Votelly. </span>Made with 💜 by Tolu.
        </div>
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
