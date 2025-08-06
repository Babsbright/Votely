"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  addDoc,
  increment,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AddContestantModal from "../../../components/AddContestantModal";
import VotingLink from "../../../components/votingLink";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../../navbar";
import Footer from "../../Footer";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";

export default function ViewEventPage() {
  const { id: eventId } = useParams();
  const [contestants, setContestants] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userAuth] = useAuthState(auth);

  const COLORS = [
    "#8b5cf6", // purple-500
    "#6366f1", // indigo-500
    "#7c3aed", // violet-600
    "#a78bfa", // purple-400
    "#4f46e5", // indigo-600
    "#9333ea", // violet-700
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: PieLabelRenderProps) => {
    const RADIAN = Math.PI / 180;

    const cxNum = Number(cx ?? 0);
    const cyNum = Number(cy ?? 0);
    const inner = Number(innerRadius ?? 0);
    const outer = Number(outerRadius ?? 0);
    const pct = percent ?? 0;

    const radius = inner + (outer - inner) * 0.6;
    const x = cxNum + radius * Math.cos(-midAngle * RADIAN);
    const y = cyNum + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#e0e0e0"
        textAnchor={x > cxNum ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        className="font-sora"
      >
        {`${(pct * 100).toFixed(0)}%`}
      </text>
    );
  };

  const fetchContestants = async () => {
    if (!eventId) return;
    const snapshot = await getDocs(
      collection(db, "events", String(eventId), "contestants")
    );
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setContestants(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      const eventSnap = await getDoc(doc(db, "events", String(eventId)));
      const eventData = eventSnap.data();
      setEvent({ id: eventSnap.id, ...eventData });

      const contestantsSnap = await getDocs(
        collection(db, "events", String(eventId), "contestants")
      );
      const data = contestantsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContestants(data);
    };

    if (eventId) fetchData();
  }, [eventId, ended]);

  const isAdmin = user?.uid === event?.creatorId;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("voterId");
    if (!id) {
      const newId = crypto.randomUUID();
      localStorage.setItem("voterId", newId);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const eventSnap = await getDoc(doc(db, "events", String(eventId)));
      const eventData = eventSnap.data();
      setEvent({ id: eventSnap.id, ...eventData });

      const contestantsSnap = await getDocs(
        collection(db, "events", String(eventId), "contestants")
      );
      const data = contestantsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContestants(data);
    };

    if (eventId) fetchData();
  }, [eventId, ended]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasEnded = event?.endsAt && now > event.endsAt.toDate();

  const endVotingManually = async () => {
    setEnded(true);
    toast("Voting manually ended. Results now visible.");
  };

  // Generate fallback voterId once
  const fallbackVoterId =
    localStorage.getItem("voterId") ??
    (() => {
      const id = crypto.randomUUID();
      localStorage.setItem("voterId", id);
      return id;
    })();

  // Function to check if the voter can vote
  // const checkIfUserCanVote = async (eventId: string, voterId: string) => {
  //   const eventSnap = await getDoc(doc(db, "events", eventId));
  //   const { votesPerUser = 1, voteReset = "none" } = eventSnap.data() || {};

  //   const snap = await getDocs(
  //     query(
  //       collection(db, "events", String(eventId), "votes"),
  //       where("voterId", "==", voterId)
  //     )
  //   );

  //   let votes = snap.docs;
  //   if (voteReset === "daily") {
  //     const start = new Date();
  //     start.setHours(0, 0, 0, 0);
  //     votes = votes.filter((d) => d.data().createdAt?.toDate() >= start);
  //   }
  //   if (voteReset === "hourly") {
  //     const cutoff = new Date(Date.now() - 3600000);
  //     votes = votes.filter((d) => d.data().createdAt?.toDate() >= cutoff);
  //   }

  //   return votes.length < votesPerUser;
  // };

  function canVoteLocally(
    eventId: string,
    votesPerUser: number,
    voteReset: "none" | "daily" | "hourly"
  ): boolean {
    const stored = localStorage.getItem(`voted_${eventId}`);
    const parsed = stored ? JSON.parse(stored) : [];

    const now = new Date();
    const validVotes = parsed.filter((entry: { time: string }) => {
      const time = new Date(entry.time);
      if (voteReset === "none") return true;
      if (voteReset === "daily")
        return time.toDateString() === now.toDateString();
      if (voteReset === "hourly")
        return now.getTime() - time.getTime() < 3600_000;
      return false;
    });

    return validVotes.length < votesPerUser;
  }

  function recordLocalVote(eventId: string) {
    const stored = localStorage.getItem(`voted_${eventId}`);
    const parsed = stored ? JSON.parse(stored) : [];
    parsed.push({ time: new Date().toISOString() });
    localStorage.setItem(`voted_${eventId}`, JSON.stringify(parsed));
  }

  const handleVote = async (contestantId: string) => {
    if (!event) return toast.error("Event not loaded yet.");

    if (hasEnded || ended) return toast.error("Voting has ended.");

    const canVote = canVoteLocally(
      event.id,
      event.votesPerUser,
      event.voteReset
    );
    if (!canVote) return toast.error("You've used up your vote(s) for now.");

    setLoading(true);
    try {
      const ref = doc(db, "events", event.id, "contestants", contestantId);
      await updateDoc(ref, { votes: increment(1) });

      await addDoc(collection(db, "events", event.id, "votes"), {
        contestantId,
        voterId: localStorage.getItem("voterId") || "anonymous",
        createdAt: Timestamp.now(),
      });

      recordLocalVote(event.id);
      toast.success("Vote counted!");
      fetchContestants();
    } catch (err) {
      console.error("Failed to vote:", err);
      toast.error("Failed to vote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!event)
    return (
      <div className="flex items-center justify-center h-full text-center w-full text-gray-500 text-xl font-semibold">
        Loading event...
      </div>
    );

  const sortedContestants = [...contestants].sort((a, b) => b.votes - a.votes);

  const exportResultsAsPDF = async () => {
    const input = document.getElementById("results-section");
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("voting_results.pdf");
  };

  return (
    <main className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen font-outfit text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 font-sora">
        {/* Event Details Section */}
        <section className="bg-gradient-to-r backdrop-blur-md from-black to-purple-500 bg-black p-6 rounded-xl shadow-inner border border-white/10 mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div
              className="rounded-xl overflow-hidden shadow-lg border border-white/10 bg-cover bg-center h-64 lg:w-1/2"
              style={{
                backgroundImage: `url(${event.posterUrl || "/fallback.jpg"})`,
              }}
            ></div>

            <div className="flex-1">
              <h1 className="text-3xl sm:text-5xl font-bold text-purple-200 mb-4">
                {event.title}
              </h1>
              <p className="text-sm text-white/90 mb-6 font-inter">
                {event.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <VotingLink eventId={String(eventId)} />

                <div className="flex gap-x-4 items-center">
                  {userAuth?.uid === event.creatorId && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 hover:brightness-110 text-white px-4 py-2 text-sm rounded-md shadow"
                    >
                      Add Contestant
                    </button>
                  )}

                  <div>
                    {userAuth?.uid === event.creatorId &&
                      isAdmin &&
                      !hasEnded &&
                      !ended && (
                        <button
                          onClick={endVotingManually}
                          className="bg-gradient-to-br mb-2 from-pink-600 via-rose-500 to-red-500 hover:brightness-110 text-white px-4 py-2 text-sm rounded-md shadow"
                        >
                          End Voting Now
                        </button>
                      )}

                    <div className="">
                      {!hasEnded && !ended ? (
                        <p className="text-xs text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-600 rounded px-4 py-2 inline-block">
                          Voting ends at:
                          <span className="ml-2 font-semibold">
                            {event.endsAt.toDate().toLocaleString()}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-600 rounded px-4 py-2 inline-block">
                          Voting has ended!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contestants or Results */}
        {!hasEnded && !ended ? (
          <section>
            <h2 className="text-xl font-semibold text-purple-300 mb-4">
              Contestants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedContestants.map((contestant) => (
                <div
                  key={contestant.id}
                  className="relative group rounded-2xl overflow-hidden shadow-xl transition hover:scale-[1.02] border border-white/10"
                >
                  <img
                    src={contestant.imageUrl}
                    alt={contestant.name}
                    className="w-full h-64 object-cover group-hover:brightness-75 transition duration-300"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                    <h3 className="text-lg font-outfit font-bold text-white/90 drop-shadow-md capitalize">
                      {contestant.name}
                    </h3>
                    <p className="text-sm font-inter text-white/90 drop-shadow-md">
                      {contestant.votes} vote{contestant.votes !== 1 && "s"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVote(contestant.id)}
                    disabled={loading}
                    className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg backdrop-blur-sm"
                  >
                    Vote
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-12" id="results-section">
            {userAuth?.uid === event.creatorId && (
              <button
                className="mb-6 bg-gradient-to-r from-purple-400 text-sm to-purple-500 text-white px-6 py-2 rounded-lg hover:scale-105 transition-transform shadow"
                onClick={exportResultsAsPDF}
              >
                Export Results as PDF
              </button>
            )}

            <h2 className="text-lg font-bold mb-6 text-purple-500">
              Final Results
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard */}
              <div className="space-y-4">
                {sortedContestants.map((c, i) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium shadow transition-all ${
                      i === 0
                        ? "bg-black border border-yellow-300 text-yellow-300"
                        : "bg-purple-500 text-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="text-xl animate-bounce">👑</span>
                      )}
                      <span>
                        {i + 1}. {c.name}
                      </span>
                    </div>
                    <span>{c.votes} votes</span>
                  </div>
                ))}
              </div>

              {/* Pie Chart */}
              <div className="bg-[#1c1c1f] border border-purple-500/20 rounded-xl p-6 shadow-xl">
                <h3 className="text-white text-lg font-bold mb-4 text-center">
                  Vote Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sortedContestants}
                      dataKey="votes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      labelLine={false}
                      label={renderCustomizedLabel} // assume this is defined
                    >
                      {sortedContestants.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]} // assume COLORS is defined
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f1f1f",
                        border: "1px solid #444",
                        borderRadius: "8px",
                        color: "#eee",
                      }}
                      itemStyle={{ fontSize: "14px", fontFamily: "Sora" }}
                    />

                    <Legend
                      iconType="circle"
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      wrapperStyle={{ color: "#ccc", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />

      {showModal && (
        <AddContestantModal
          eventId={Array.isArray(eventId) ? eventId[0] : eventId}
          onClose={() => setShowModal(false)}
          refresh={fetchContestants}
        />
      )}
    </main>
  );
}
