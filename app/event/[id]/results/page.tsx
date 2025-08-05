'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function ResultsPage() {
  const { id: eventId } = useParams();
  const [contestants, setContestants] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const q = query(
        collection(db, "events", String(eventId), "contestants"),
        orderBy("votes", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setContestants(data);
    };

    fetchResults();
  }, [eventId]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Results</h2>
      {contestants.map((c, i) => (
        <div key={c.id} className="mb-4 p-4 border rounded bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{i + 1}. {c.name}</p>
              <p className="text-sm text-gray-500">Votes: {c.votes}</p>
            </div>
            <img src={c.imageUrl} alt={c.name} className="w-16 h-16 object-cover rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
