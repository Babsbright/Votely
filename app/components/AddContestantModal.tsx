'use client';

import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  eventId: string;
  onClose: () => void;
  refresh?: () => void; // Optional: pass a refresh function after adding
}

export default function AddContestantModal({ eventId, onClose, refresh }: Props) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const cloudName = "dssbzbnhi";
  const uploadPreset = "votely_unsigned";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image) return toast("Both name and image are required.");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", uploadPreset);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const imageUrl = res.data.secure_url;

      await addDoc(collection(db, "events", eventId, "contestants"), {
        name,
        imageUrl,
        votes: 0,
        createdAt: Timestamp.now(),
      });

      toast.success("Contestant added!");
      setName("");
      setImage(null);
      refresh?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to add contestant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white text-black text-xs p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Add Contestant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Contestant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-20 h-20 object-cover rounded"
            />
          )}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
