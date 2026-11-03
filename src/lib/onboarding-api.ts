import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type OnboardingPayload = {
  preferredLanguage: string;
  shopName: string;
  category: string;
  city: string;
  purpose: string;
  phone: string;
  aiEmployeeName: string;
};

// Saves all onboarding answers in one request to the Go API, then marks the
// user as onboarded. Safe to retry: if Go already has the answers (409), we
// just continue to the second step.
export async function submitOnboarding(payload: OnboardingPayload) {
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new Error("Could not get an auth token.");

  const res = await fetch(`${API_URL}/v1/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`Saving failed (${res.status}).`);
  }

  const done = await fetch("/api/onboarding/complete", { method: "POST" });
  if (!done.ok)
    throw new Error(`Completing onboarding failed (${done.status}).`);
}
