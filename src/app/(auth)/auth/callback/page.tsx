"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Slow } from "@lucasmarkes/hairline/react";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const { data } = await authClient.getSession();
      if (cancelled) return;

      if (!data?.session) {
        toast.add({
          type: "error",
          title: "Session expired",
          description: "Please sign in again.",
        });
        router.replace("/auth");
        return;
      }

      const { onboardingCompleted } = data.user as { onboardingCompleted?: boolean };
      router.replace(onboardingCompleted ? "/dashboard" : "/welcome");
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
