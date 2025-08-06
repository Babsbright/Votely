"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { logoutWithRouter } from "../lib/logout";
import { useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user] = useAuthState(auth);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const router = useRouter();

  const handleLogout = () => logoutWithRouter(router);
  return (
    <nav className="bg-black font-sora p-6 shadow-md mb-6 px-6 lg:px-12">
      <div className="flex md:flex-row items-center justify-between gap-4">
        <Link href="/" className="tracking-wide">
          <h4 className="text-2xl font-semibold text-purple-500 mb-2">
            Votely
          </h4>
        </Link>

        <div className="hidden text-sm md:flex gap-6 items-center">
          <Link href="/events" className="hover:underline">
            My events
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          )}
        </div>

        {/* Hamburger Menu */}
        <button className="md:hidden" onClick={toggleMenu}>
          <MenuIcon className="w-6 h-6 text-purple-500" />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-2 text-sm">
          <Link href="/events" className="block hover:underline">
            My events
          </Link>
          <button
            onClick={handleLogout}
            className="block text-left w-full bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
