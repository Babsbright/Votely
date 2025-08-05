'use client';

import { useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import axios from "axios";
import toast from "react-hot-toast";

export default function AddContestants() {
  const params = useParams();
  const eventId = params.id as string;

  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const cloudName = "dssbzbnhi"; // ✅ Replace with your Cloudinary cloud name
  const uploadPreset = "votely_unsigned"; // ✅ Must be an unsigned preset

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !image) {
      toast.error("Please provide both name and image");
      return;
    }

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
    } catch (err: any) {
      console.error(err.message);
      toast.error("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Contestant</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Contestant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
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
            className="w-32 h-32 object-cover mt-2 rounded"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white p-2 rounded"
        >
          {loading ? "Uploading..." : "Add Contestant"}
        </button>
      </form>
    </div>
  );
}
