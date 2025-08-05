"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import CreateEventModal from "./CreateEventModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { logoutWithRouter } from "../lib/logout";
import { useRouter } from "next/navigation";
import { withAuth } from "../lib/withAuth";


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

  const handleLogout = () => logoutWithRouter(router);
  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));

      // Fetch contestant counts in parallel
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
    };

    fetchEvents();
  }, []);

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
      <div className="bg-purple-100 p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-purple-800 w-full md:w-auto">
            🎯 Explore Events
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 p-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />

            <button
              onClick={() => setModalOpen(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              ➕ Create Event
            </button>

           <button onClick={handleLogout} className="block text-left bg-red-500 px-3 py-2 rounded">
              Logout
            </button>

            <CreateEventModal
              isOpen={isModalOpen}
              onClose={() => setModalOpen(false)}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-end">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full border transition ${
              filter === "all"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("free")}
            className={`px-4 py-1.5 rounded-full border transition ${
              filter === "free"
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-green-700 border-green-300 hover:bg-green-50"
            }`}
          >
            Free
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-4 py-1.5 rounded-full border transition ${
              filter === "paid"
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-red-700 border-red-300 hover:bg-red-50"
            }`}
          >
            Paid
          </button>
        </div>
      </div>

     <div className="p-6 min-h-[40vh]">
  {filteredEvents.length === 0 ? (
    <div className="flex items-center justify-center h-full text-center text-gray-500 text-xl font-semibold">
    No event created yet
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filteredEvents.map((ev) => (
        <EventCard key={ev.id} ev={ev} />
      ))}
    </div>
  )}
</div>

      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600 mt-10">
        <p>© {new Date().getFullYear()} Votely. All rights reserved.</p>
        <p className="mt-1">Built with 💜 by the brains that never sleep.</p>
      </footer>
    </div>

    // <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
    //   {events.map((ev) => (
    //     <EventCard key={ev.id} ev={ev} />
    //   ))}
    // </div>
  );
}

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

  return (
    <Link
      href={`/event/${ev.id}/view`}
      className="relative rounded-lg overflow-hidden shadow-md group"
    >
      <div
        className="h-48 bg-cover bg-center transition-transform group-hover:scale-105"
        style={{ backgroundImage: `url(${ev.posterUrl || "/fallback.jpg"})` }}
      />
      <div className="p-4 bg-white dark:bg-gray-900">
        <h3 className="text-lg font-bold truncate">{ev.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {ev.description.length > 100
            ? ev.description.slice(0, 100) + "..."
            : ev.description}
        </p>
        <div className="mt-2 flex justify-between items-center text-sm">
          <span
            className={`px-2 py-0.5 rounded text-white ${
              ev.isPriced ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {ev.isPriced ? "Paid" : "Free"}
          </span>
          <span className="text-gray-700 dark:text-gray-300">
            {ev.contestantCount || 0} Contestants
          </span>
        </div>
        <p
          className={`mt-1 text-sm font-medium ${
            timeLeft.includes("Ended")
              ? "text-red-600"
              : "text-blue-600 animate-pulse"
          }`}
        >
          Ends in: {timeLeft}
        </p>
      </div>
    </Link>
  );
}

export default withAuth(AllEventsPage)