// components/VotingLink.tsx

'use client';
import React from "react";
import toast from "react-hot-toast";

export default function VotingLink({ eventId }: { eventId: string }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/event/${eventId}/view` : "";

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-white mb-1">
        Voting Link
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={link}
          readOnly
          className="flex-1 p-2 border rounded text-sm bg-black border-black"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(link);
            toast("Copied!");
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Copy
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "Vote in this event",
                text: "Cast your vote now!",
                url: link,
              });
            } else {
              toast("Share not supported on this device.");
            }
          }}
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
        >
          Share
        </button>
      </div>
    </div>
  );
}
