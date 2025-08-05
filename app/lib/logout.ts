// lib/logout.ts (for client components)
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export async function logoutWithRouter(router: any) {
  try {
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
