import { auth } from "@/lib/auth";

// Reads the signed-in session, but never throws. If the database can't be
// reached (bad network, Neon waking up), Better Auth throws "Failed to get
// session", which would show Next.js's error screen. We treat that as "no
// session" and log it instead.
export async function getSessionSafe(headers: Headers) {
  try {
    return await auth.api.getSession({ headers });
  } catch (error) {
    console.error("[auth] could not read session", error);
    return null;
  }
}
