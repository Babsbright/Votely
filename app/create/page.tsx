"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [votesPerUser, setVotesPerUser] = useState(1);
  const [voteReset, setVoteReset] = useState<"none" | "daily" | "hourly">("none");
  const [isPriced, setIsPriced] = useState(false);
  const [endsAt, setEndsAt] = useState("");
  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const [user] = useAuthState(auth);

  // Cloudinary setup
  const CLOUDINARY_CLOUD = "dssbzbnhi";
  const UPLOAD_PRESET = "votely_unsigned";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create an event.");
      return;
    }

    if (!title || !description || !endsAt || !poster) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (isNaN(new Date(endsAt).getTime())) {
      toast.error("Invalid end date.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", poster);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        formData
      );

      const posterUrl = res.data.secure_url;

      // 2. Add event to Firestore
      const docRef = await addDoc(collection(db, "events"), {
        title,
        description,
        votesPerUser,
        voteReset,
        isPriced,
        posterUrl,
        endsAt: Timestamp.fromDate(new Date(endsAt)),
        votingEnded: false,
        createdAt: Timestamp.now(),
        creatorId: user.uid,
      });

      router.push(`/event/${docRef.id}/view`);
    } catch (err: any) {
      console.error("Error creating event:", err);
      toast.error("Failed to create event. Please try again.");
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

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          min={1}
          placeholder="Votes Per User"
          value={votesPerUser}
          onChange={(e) => setVotesPerUser(parseInt(e.target.value))}
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={voteReset}
          onChange={(e) => setVoteReset(e.target.value as any)}
          className="w-full p-2 border rounded"
        >
          <option value="none">No Reset</option>
          <option value="daily">Reset Daily</option>
          <option value="hourly">Reset Hourly</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPriced}
            onChange={(e) => setIsPriced(e.target.checked)}
          />
          Priced Voting?
        </label>

        <input
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePosterChange(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded"
          required
        />

        {posterPreview && (
          <img
            src={posterPreview}
            alt="Poster Preview"
            className="w-full h-48 object-cover rounded shadow"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white p-2 rounded"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
