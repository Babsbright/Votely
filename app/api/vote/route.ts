import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/firebase";
import {
  doc,
  updateDoc,
  increment,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, contestantId, voterId } = body;

    if (!eventId || !contestantId || !voterId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    console.log("🧪 Incoming vote payload:", { eventId, contestantId, voterId });

    const contestantRef = doc(db, "events", eventId, "contestants", contestantId);
    console.log("📌 Contestant ref path:", contestantRef.path);

    await updateDoc(contestantRef, {
      votes: increment(1),
    });

    console.log("✅ Vote incremented");

    const voteRef = collection(db, "events", eventId, "votes");
    console.log("📌 Vote ref path:", voteRef.path);

    await addDoc(voteRef, {
      voterId,
      contestantId,
      createdAt: Timestamp.now(),
    });

    console.log("✅ Vote recorded");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("🔥 API ERROR:", err); // Log the full error object
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
