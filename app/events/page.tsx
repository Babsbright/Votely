"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import CreateEventModal from "./CreateEventModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { logoutWithRouter } from "../lib/logout";
import { useRouter } from "next/navigation";
import { withAuth } from "../lib/withAuth";
import Footer from "../event/Footer";



function formatCountdown(ms: number) {
  if (ms <= 0) return "Voting Ended";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((ms / (1000 * 60)) % 60);
  const secs = Math.floor((ms / 1000) % 60);
  return `${days}d ${hrs}h ${mins}m ${secs}s`;
}

const AllEventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const [user] = useAuthState(auth);
  const [isModalOpen, setModalOpen] = useState(false);
  const router = useRouter();
const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => logoutWithRouter(router);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return; // Wait until auth state is ready

      try {
        const q = query(
          collection(db, "events"),
          where("creatorId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const eventsWithCounts = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;

            const contestantsSnap = await getDocs(
              collection(db, "events", id, "contestants")
            );

            return {
              id,
              ...data,
              contestantCount: contestantsSnap.size,
            };
          })
        );

        setEvents(eventsWithCounts);
      } catch (error) {
        console.error("Error fetching user-specific events:", error);
      }
    };

    fetchEvents();
  }, [user]);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title?.toLowerCase().includes(search.toLowerCase()) ||
      ev.description?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "free" && !ev.isPriced) ||
      (filter === "paid" && ev.isPriced);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="">
    



  <div className="bg-[#1c1c1f] border border-[#2a2a2e] backdrop-blur-md py-6 px-6 lg:px-12 shadow-lg text-sm font-outfit text-white">
    <div className="flex items-center justify-between font-sora">
      {/* LEFT: Votely title */}
      <h2 className="text-2xl font-semibold text-purple-500">Votely</h2>

      {/* RIGHT: Desktop visible, Mobile hidden */}
      <div className="hidden lg:flex items-center gap-4">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 px-4 py-2 rounded-lg bg-[#2a2a2e] border border-[#444] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 text-sm"
        />

        <button
          onClick={() => setModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Create Event
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Logout
        </button>
      </div>

      
 

      {/* HAMBURGER: Mobile only */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="lg:hidden focus:outline-none"
      >
        <svg
          className="w-6 h-6 text-purple-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {menuOpen ? (
            <path strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </div>

   {/* FILTERS: Always visible */}
    <div className="lg:flex hidden flex-wrap gap-2 mt-6 px-6 lg:px-12 justify-end">
      {(["all", "free", "paid"] as const).map((type) => {
        const isActive = filter === type;
        const base =
          "px-4 py-1.5 rounded-full border text-xs transition whitespace-nowrap";

        const styles = {
          all: isActive
            ? "bg-purple-600 border-purple-600 text-white"
            : "bg-transparent text-purple-300 border-purple-400 hover:bg-purple-900",
          free: isActive
            ? "bg-green-500 border-green-500 text-white"
            : "bg-transparent text-green-300 border-green-400 hover:bg-green-900",
          paid: isActive
            ? "bg-red-500 border-red-500 text-white"
            : "bg-transparent text-red-300 border-red-400 hover:bg-red-900",
        };

        return (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`${base} ${styles[type]}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        );
      })}
    </div>



    {/* MOBILE MENU */}
    <div
      className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        menuOpen ? "max-h-[1000px] mt-6" : "max-h-0"
      }`}
    >
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[#2a2a2e] border border-[#444] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 text-sm"
        />

        <button
          onClick={() => setModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Create Event
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  </div>




 {/* FILTERS: Always visible */}
    <div className="flex lg:hidden flex-wrap gap-2 mt-6 px-6 lg:px-12 justify-end">
      {(["all", "free", "paid"] as const).map((type) => {
        const isActive = filter === type;
        const base =
          "px-4 py-1.5 rounded-full border text-xs transition whitespace-nowrap";

        const styles = {
          all: isActive
            ? "bg-purple-600 border-purple-600 text-white"
            : "bg-transparent text-purple-300 border-purple-400 hover:bg-purple-900",
          free: isActive
            ? "bg-green-500 border-green-500 text-white"
            : "bg-transparent text-green-300 border-green-400 hover:bg-green-900",
          paid: isActive
            ? "bg-red-500 border-red-500 text-white"
            : "bg-transparent text-red-300 border-red-400 hover:bg-red-900",
        };

        return (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`${base} ${styles[type]}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        );
      })}
    </div>






<div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-100">
  {filteredEvents.length === 0 ? (
    <div className="flex items-center py-10 justify-center h-full text-center text-gray-400 text-xl font-semibold font-sora">
      👋 Welcome! No event created yet.
    </div>
  ) : (
    <div className="py-10 px-4 sm:px-6 lg:px-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredEvents.map((ev) => (
        <EventCard key={ev.id} ev={ev} />
      ))}
    </div>
  )}

  <CreateEventModal
    isOpen={isModalOpen}
    onClose={() => setModalOpen(false)}
  />
  <Footer />
</div>





     
      </div>
       
  );
};




function EventCard({ ev }: { ev: any }) {
  const [timeLeft, setTimeLeft] = useState("Calculating...");
  const endsAt = ev.endsAt?.toDate ? ev.endsAt.toDate() : new Date(ev.endsAt);

  useEffect(() => {
    const interval = setInterval(() => {
      const msLeft = endsAt.getTime() - Date.now();
      setTimeLeft(formatCountdown(msLeft));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isEnded = timeLeft.includes("Ended");

  return (
    <Link
      href={`/event/${ev.id}/view`}
      className="group rounded-2xl font-inter overflow-hidden shadow-xl border border-white/10 bg-[#1c1c1f] hover:border-purple-500 transition-all duration-300"
    >
      {/* Poster */}
      <div className="relative h-48 sm:h-52 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
        style={{ backgroundImage: `url(${ev.posterUrl || "/fallback.jpg"})` }}
      >
        {/* Frosted overlay */}
        <div className="absolute bottom-0 w-full px-4 py-2 bg-black/40 backdrop-blur-sm text-xs text-white flex justify-between">
          <span className="font-semibold truncate capitalize text-base">{ev.title}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              ev.isPriced ? "bg-pink-600" : "bg-green-600"
            }`}
          >
            {ev.isPriced ? "Paid" : "Free"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 text-white">
        <p className="text-sm text-gray-400 leading-snug line-clamp-3">
          {ev.description || "No description available."}
        </p>

        <div className="flex justify-between items-center text-xs mt-2">
          <span className="text-gray-400">
            👥 {ev.contestantCount || 0} Contestant
            {ev.contestantCount === 1 ? "" : "s"}
          </span>
          <span
            className={`font-medium ${
              isEnded ? "text-red-500" : "text-blue-400 animate-pulse"
            }`}
          >
            {isEnded ? "Voting Ended" : `⏳ ${timeLeft}`}
          </span>
        </div>
      </div>
    </Link>
  );
}


export default withAuth(AllEventsPage);
