import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionSafe } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Called by the browser after the Go API has saved the onboarding answers.
// Before marking the user as onboarded, we ask Go whether the answers really
// exist, so this flag can't be flipped by calling the route directly.
export async function POST() {
  const reqHeaders = await headers();
  const session = await getSessionSafe(reqHeaders);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { token } = await auth.api.getToken({ headers: reqHeaders });
  const res = await fetch(`${API_URL}/v1/onboarding`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!res?.ok) {
    return NextResponse.json({ error: "onboarding_not_saved" }, { status: 409 });
  }

  const ctx = await auth.$context;
  await ctx.internalAdapter.updateUser(session.user.id, {
    onboardingCompleted: true,
  });
  return NextResponse.json({ ok: true });
}
