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
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AddContestantModal from "../../../components/AddContestantModal";
import VotingLink from "../../../components/votingLink";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../../navbar";
import Footer from "../../Footer";
import toast from "react-hot-toast";

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

  //   const isAdmin = user?.email === event?.createdBy;
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
  const checkIfUserCanVote = async (eventId: string, voterId: string) => {
    const eventSnap = await getDoc(doc(db, "events", eventId));
    const { votesPerUser = 1, voteReset = "none" } = eventSnap.data() || {};

    // const snap = await getDocs(
    //   query(
    //     collection(db, "events", eventId, "votes"),
    //     where("voterId", "==", voterId)
    //   )
    // );

    const snap = await getDocs(
      query(
        collection(db, "events", String(eventId), "votes"),
        where("voterId", "==", voterId)
      )
    );

    let votes = snap.docs;
    if (voteReset === "daily") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      votes = votes.filter((d) => d.data().createdAt?.toDate() >= start);
    }
    if (voteReset === "hourly") {
      const cutoff = new Date(Date.now() - 3600000);
      votes = votes.filter((d) => d.data().createdAt?.toDate() >= cutoff);
    }

    return votes.length < votesPerUser;
  };


function canVoteLocally(eventId: string, votesPerUser: number, voteReset: "none" | "daily" | "hourly"): boolean {
  const stored = localStorage.getItem(`voted_${eventId}`);
  const parsed = stored ? JSON.parse(stored) : [];

  const now = new Date();
  const validVotes = parsed.filter((entry: { time: string }) => {
    const time = new Date(entry.time);
    if (voteReset === "none") return true;
    if (voteReset === "daily") return time.toDateString() === now.toDateString();
    if (voteReset === "hourly") return now.getTime() - time.getTime() < 3600_000;
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

  const canVote = canVoteLocally(event.id, event.votesPerUser, event.voteReset);
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
      <div className="flex items-center justify-center h-full text-center text-gray-500 text-xl font-semibold">
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
    <main className="bg-gradient-to-br from-purple-100 to-indigo-100">
      <Navbar />
      <div className="mx-auto flex w-full justify-around">
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
          {/* <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center"> */}
          <div
            className="w-full max-w-md bg-cover bg-center rounded-xl shadow-xl border border-white/20 overflow-hidden mb-10"
            style={{
              backgroundImage: `url(${event.posterUrl || "/fallback.jpg"})`,
            }}
          >
            {/* Inner glassy overlay to ensure readability */}
            <div className="backdrop-blur-md bg-white/10 dark:bg-black/30 p-6 h-full w-full text-white mb-10">
              <h1 className="text-4xl bg-purple-400 rounded-lg p-4 sm:text-5xl text-white font-extrabold mb-4 bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                {event.title}
              </h1>

              <p className="text-white dark:text-gray-200 text-lg leading-relaxed mb-6">
                {event.description}
              </p>

              <div className="flex flex-col sm:items-start gap-4">
                <VotingLink eventId={String(eventId)} />

                {userAuth?.uid === event.creatorId && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    ➕ Add Contestant
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Voting End Info */}
          {!hasEnded && !ended ? (
            <p className="text-green-700 font-medium text-sm mb-6 bg-green-50 px-4 py-2 rounded border border-green-200">
              ⏰ Voting ends at:{" "}
              <span className="font-semibold">
                {event.endsAt.toDate().toLocaleString()}
              </span>
            </p>
          ) : (
            <p className="text-red-700 font-semibold bg-red-50 px-4 py-2 mb-6 rounded border border-red-200">
              ❌ Voting has ended!
            </p>
          )}

          {/* End Voting Button */}
          {isAdmin && !hasEnded && !ended && (
            <button
              onClick={endVotingManually}
              className="mb-8 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition"
            >
              🔒 End Voting Now
            </button>
          )}
        </div>

        {/* VOTING PHASE */}
        {!hasEnded && !ended ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {sortedContestants.map((contestant) => (
              <div
                key={contestant.id}
                className="border rounded-lg p-4 w-full h-44 backdrop-blur-md shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={contestant.imageUrl}
                    alt={contestant.name}
                    className="w-20 h-20 object-cover rounded-full border-4 border-purple-500"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {contestant.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Votes:{" "}
                      <span className="font-bold text-purple-600">
                        {contestant.votes}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  disabled={loading}
                  onClick={() => handleVote(contestant.id)}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition"
                >
                  🗳️ Vote
                </button>
              </div>
            ))}
          </div>
        ) : (
          // RESULTS PHASE
          <div id="results-section" className="mt-10">
            {userAuth?.uid === event.creatorId && (
              <button
                className="mb-4 bg-gradient-to-r from-red-600 to-pink-500 text-white px-6 py-2 rounded-lg hover:scale-105 transition-transform shadow"
                onClick={exportResultsAsPDF}
              >
                Export Results as PDF
              </button>
            )}

            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Final Results
            </h2>

            <div className="space-y-3 mb-10">
              {sortedContestants.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between px-4 py-3 rounded shadow-sm mb-2 transition-all
      ${
        i === 0
          ? "bg-yellow-100 border-2 border-yellow-400 animate-pulse"
          : "bg-gray-100"
      }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-gray-800">
                    {i === 0 && (
                      <span className="text-2xl animate-bounce">👑</span>
                    )}
                    <span>
                      {i + 1}. {c.name}
                    </span>
                  </div>

                  <span
                    className={`font-bold ${
                      i === 0 ? "text-yellow-700 text-lg" : "text-purple-700"
                    }`}
                  >
                    {c.votes} votes
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <PieChart width={360} height={300}>
                <Pie
                  data={sortedContestants}
                  dataKey="votes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  fill="#8884d8"
                  label
                >
                  {sortedContestants.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ["#8884d8", "#82ca9d", "#ffc658", "#ff6666", "#66ccff"][
                          index % 5
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {showModal && (
        <AddContestantModal
          eventId={Array.isArray(eventId) ? eventId[0] : eventId}
          onClose={() => setShowModal(false)}
          refresh={fetchContestants} // If you have a refetch function
        />
      )}
    </main>
  );
}
