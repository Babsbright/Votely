import React from 'react';
import Link from 'next/link';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const Footer: React.FC = () => (
  <>
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
  </>
);

export default Footer;
