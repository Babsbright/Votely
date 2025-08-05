// lib/withAuth.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./auth";

export function withAuth(Component: React.ComponentType) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (!user) router.push("/login");
        else setChecking(false);
      });
      return () => unsub();
    }, []);

    if (checking) return <p className="p-6">Checking authentication...</p>;

    return <Component {...props} />;
  };
}
