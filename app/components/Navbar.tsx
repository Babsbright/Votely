"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          Votely
        </Link>

        <div className="md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        <ul className={`md:flex gap-6 text-sm ${open ? "block" : "hidden"} md:block`}>
          <li><Link href="/events">All Events</Link></li>
          <li><Link href="/create">Create Event</Link></li>
          <li><Link href="/login">Login</Link></li>
          <li><Link href="/signup">Sign Up</Link></li>
        </ul>
      </div>
    </nav>
  );
}
