"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { logoutWithRouter } from "../lib/logout";
import { useRouter } from "next/navigation";



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user] = useAuthState(auth);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const router = useRouter();

  const handleLogout = () => logoutWithRouter(router);
  return (


     <nav className="bg-purple-100 p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
    {/* <nav className="bg-purple-700 text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-6xl mx-auto"> */}
        <Link href="/" className="text-xl font-bold tracking-wide">
          🎯 Votely
        </Link>

        <div className="hidden md:flex gap-6 items-center">
          <Link href="/events" className="hover:underline">
            Events
          </Link>
       
          {user ? (
            <button onClick={() => signOut(auth)} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          ) : (
            <Link href="/login" className="bg-white text-purple-700 px-3 py-1 rounded">
              Login
            </Link>
          )}
        </div>

        {/* Hamburger Menu */}
        <button className="md:hidden" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-2 px-6">
          <Link href="/events" className="block hover:underline">Events</Link>
          {user && <Link href="/create-event" className="block hover:underline">Create Event</Link>}
          {user ? (
            <button onClick={handleLogout} className="block text-left w-full bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          ) : (
            <Link href="/login" className="block bg-white text-purple-700 px-3 py-1 rounded">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
