import { headers } from "next/headers";
import { Suspense } from "react";
import { getSessionSafe } from "@/lib/session";
import { AuthForm } from "@/modules/auth/components/AuthForm";
import { SessionFoundRedirect } from "@/modules/auth/components/SessionFoundRedirect";
import { AuthShowcase } from "@/modules/auth/components/AuthShowcase";

async function RedirectIfSignedIn() {
  const session = await getSessionSafe(await headers());
  return session ? <SessionFoundRedirect /> : null;
}

export default function AuthPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2 lg:gap-3 lg:p-3">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <AuthForm />
      <AuthShowcase />
    </main>
  );
}
