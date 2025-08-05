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
      <div className="bg-[#1c1c1f] border border-[#2a2a2e] backdrop-blur-md py-6 px-6 lg:px-12 shadow-lg mb-6 text-sm font-outfit text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <h2 className="text-2xl font-semibold text-purple-500 hero-card">
            Votelly
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg bg-[#2a2a2e] border border-[#444] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 text-sm"
            />

            <button
              onClick={() => setModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              ➕ Create Event
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Logout
            </button>

            <CreateEventModal
              isOpen={isModalOpen}
              onClose={() => setModalOpen(false)}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-end">
          {(["all", "free", "paid"] as Array<"all" | "free" | "paid">).map(
            (type) => {
              const isActive = filter === type;
              const base = "px-4 py-1.5 rounded-full border text-xs transition";

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
                  className={`${base} ${styles[type as keyof typeof styles]}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="py-6 min-h-[40vh]">
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 text-xl font-semibold">
            Welcome, No event created yet
          </div>
        ) : (
          <div className="px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </div>
      {/* <Footer /> */}
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

export default withAuth(AllEventsPage);
