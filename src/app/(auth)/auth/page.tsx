import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/modules/auth/components/AuthForm";
import { AuthShowcase } from "@/modules/auth/components/AuthShowcase";

async function RedirectIfSignedIn() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/auth/callback");
  return null;
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
