// lib/auth.ts
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);

import type { User } from "firebase/auth";

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Stop listening once we get the user
      resolve(user);
    });
  });
};
