import { type NextRequest, NextResponse } from "next/server";
import { getSessionSafe } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const session = await getSessionSafe(request.headers);

  if (!session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const { onboardingCompleted } = session.user as {
    onboardingCompleted?: boolean;
  };
  if (onboardingCompleted) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/welcome"],
};
