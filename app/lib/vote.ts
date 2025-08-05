import {
  doc,
  updateDoc,
  increment,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Increments a contestant's vote count and logs the vote.
 *
 * @param eventId - ID of the event
 * @param contestantId - ID of the contestant being voted for
 * @param userId - ID of the user voting
 */
export const voteForContestant = async (
  eventId: string,
  contestantId: string,
  userId: string
) => {
  const contestantRef = doc(db, "events", eventId, "contestants", contestantId);

  try {
    // Increment vote count on contestant
    await updateDoc(contestantRef, {
      votes: increment(1),
    });

    // Log vote under votes subcollection
    await addDoc(collection(db, "events", eventId, "votes"), {
      userId,
      contestantId,
      createdAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error("Failed to vote: " + error.message);
  }
};
