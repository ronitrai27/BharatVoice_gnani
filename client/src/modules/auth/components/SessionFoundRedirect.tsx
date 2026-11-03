"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Shown on /auth when the visitor is already signed in: tells them, then moves
// on to /auth/callback, which decides where they should go next.
export function SessionFoundRedirect() {
  const router = useRouter();

  useEffect(() => {
    toast.success("Session found, redirecting...", { id: "session-found" });
    const t = setTimeout(() => router.replace("/auth/callback"), 900);
    return () => clearTimeout(t);
  }, [router]);

  return null;
}
