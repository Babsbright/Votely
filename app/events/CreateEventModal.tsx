"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateEventModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [votesPerUser, setVotesPerUser] = useState(1);
  const [voteReset, setVoteReset] = useState<"none" | "daily" | "hourly">(
    "none"
  );
  const [isPriced, setIsPriced] = useState(false);
  const [endsAt, setEndsAt] = useState("");
  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [votePrice, setVotePrice] = useState<number>(0);

  const router = useRouter();
  const [user] = useAuthState(auth);

  const CLOUDINARY_CLOUD = "dssbzbnhi";
  const UPLOAD_PRESET = "votely_unsigned";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return toast("Please login first.");
    if (!title || !description || !endsAt || !poster)
      return toast("All fields required.");

    if (isNaN(new Date(endsAt).getTime())) return toast("Invalid end date.");

    if (isPriced && (!votePrice || votePrice <= 0)) {
      toast("Please enter a valid price for each vote.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", poster);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        formData
      );

      const posterUrl = res.data.secure_url;
      

      const docRef = await addDoc(collection(db, "events"), {
        title,
        description,
        votesPerUser,
        voteReset,
        isPriced,
        votePrice: isPriced ? votePrice : 0,
        posterUrl,
        endsAt: Timestamp.fromDate(new Date(endsAt)),
        votingEnded: false,
        createdAt: Timestamp.now(),
        creatorId: user.uid,
      });

      onClose();
      router.push(`/event/${docRef.id}/view`);
      toast.success("Event created successfully!");
    } catch (err: any) {
      console.error("Error creating event:", err);
      toast.error("Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  const handlePosterChange = (file: File | null) => {
    setPoster(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPosterPreview(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 relative shadow-lg animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white text-2xl"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Create New Event</h2>

        <form onSubmit={handleSubmit} className="space-y-2 text-xs">
          <div>
            <label className="block mb-1 font-medium">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Event Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Votes Per User</label>
            <input
              type="number"
              min={1}
              value={votesPerUser}
              onChange={(e) => setVotesPerUser(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Vote Reset Frequency
            </label>
            <select
              value={voteReset}
              onChange={(e) => setVoteReset(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="none">No Reset</option>
              <option value="daily">Reset Daily</option>
              <option value="hourly">Reset Hourly</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPriced}
              onChange={(e) => setIsPriced(e.target.checked)}
            />
            <label className="font-medium">Is this a paid vote event?</label>
       

          {isPriced && (
            <div className="ml-6">
              <label className="block text-xs font-semibold mb-1">
                Price per Vote (₦)
              </label>
              <input
                type="number"
                min={1}
                value={votePrice}
                onChange={(e) => setVotePrice(Number(e.target.value))}
                className="w-full p-2 border rounded bg-white/70 dark:bg-gray-800"
                placeholder="Enter amount in Naira"
                required
              />
            </div>
          )}
             </div>

          <div>
            <label className="block mb-1 font-medium">Voting Ends At</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Event Poster</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePosterChange(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {posterPreview && (
            <img
              src={posterPreview}
              alt="Poster Preview"
              className="w-10 h-10 object-cover rounded shadow"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
