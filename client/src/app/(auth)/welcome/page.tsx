import { headers } from "next/headers";
import { Suspense } from "react";
import { getSessionSafe } from "@/lib/session";
import { WelcomeScreen } from "@/modules/welcome/components/WelcomeScreen";

// Show the first name; email sign-ups have no name, so fall back to the
// part of the email before the "@".
function displayName(user: { name?: string | null; email: string }) {
  const name = user.name?.trim() || user.email.split("@")[0];
  return name.split(/\s+/)[0];
}

async function WelcomeContent() {
  const session = await getSessionSafe(await headers());
  return <WelcomeScreen name={session ? displayName(session.user) : "there"} />;
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<main className="h-screen bg-white" />}>
      <WelcomeContent />
    </Suspense>
  );
}
