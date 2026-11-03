"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Slow } from "@lucasmarkes/hairline/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const { data } = await authClient.getSession();
      if (cancelled) return;

      if (!data?.session) {
        toast.error("Session expired", {
          description: "Please sign in again.",
        });
        router.replace("/auth");
        return;
      }

      const { onboardingCompleted } = data.user as {
        onboardingCompleted?: boolean;
      };
      if (!onboardingCompleted) {
        toast("Looks like you haven't completed onboarding yet...", {
          id: "onboarding-incomplete",
        });
        router.replace("/welcome");
        return;
      }
      router.replace("/dashboard");
    }

    validate();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <div className="w-72 text-[#191919] sm:w-80">
        <Slow />
      </div>
      <p className="text-sm text-[#191919]/60">Validating session.....</p>
    </main>
  );
}
