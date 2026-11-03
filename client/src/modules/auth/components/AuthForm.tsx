"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

const CALLBACK_URL = "/auth/callback";
const RESEND_SECONDS = 30;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function AuthForm() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "email" | "otp" | null>(
    null,
  );
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function signInWithGoogle() {
    setError(null);
    setLoading("google");
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: CALLBACK_URL,
    });
    if (error) {
      setError(error.message ?? "Could not continue with Google.");
      setLoading(null);
    }
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setLoading("email");
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    });
    setLoading(null);
    if (error) {
      setError(error.message ?? "Could not send the code. Try again.");
      return;
    }
    setOtp("");
    setCooldown(RESEND_SECONDS);
    setStep("otp");
  }

  async function verifyCode(code: string) {
    setError(null);
    setLoading("otp");
    const { error } = await authClient.signIn.emailOtp({
      email: email.trim(),
      otp: code,
    });
    if (error) {
      setError(error.message ?? "That code didn't work. Try again.");
      setOtp("");
      setLoading(null);
      return;
    }
    window.location.assign(CALLBACK_URL);
  }

  const busy = loading !== null;

  return (
    <div className="flex min-h-screen flex-col justify-between px-6 py-10 sm:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-[400px] pt-6 sm:pt-16">
        <Image src="/logo.svg" alt="Logo" width={40} height={40} />

        {step === "email" ? (
          <>
            <h1 className="mt-10 font-serif text-3xl tracking-tight text-[#191919]">
              Get started
            </h1>
            <p className="mt-2 text-sm text-[#191919]/60">
              Sign in or create your account. No password needed.
            </p>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-8 h-11 w-full gap-2.5 text-sm"
              onClick={signInWithGoogle}
              disabled={busy}
            >
              {loading === "google" ? <Spinner /> : <GoogleIcon />}
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-4 text-xs text-[#191919]/50">
              <div className="h-px flex-1 bg-[#191919]/10" />
              or
              <div className="h-px flex-1 bg-[#191919]/10" />
            </div>

            <form onSubmit={sendCode} className="space-y-3">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#191919]"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@yourshop.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="h-11"
              />
              <Button
                type="submit"
                size="lg"
                disabled={busy || !email.trim()}
                className="h-11 w-full gap-2 bg-[#191919] text-white hover:bg-[#191919]/90"
              >
                {loading === "email" && <Spinner />}
                Continue with Email
              </Button>
            </form>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="mt-10 inline-flex items-center gap-1.5 text-sm text-[#191919]/60 hover:text-[#191919]"
            >
              <ArrowLeft className="size-4" />
              Change email
            </button>
            <h1 className="mt-4 font-serif text-3xl tracking-tight text-[#191919]">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-[#191919]/60">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-[#191919]">{email}</span>.
            </p>

            <div className="mt-8">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={verifyCode}
                disabled={busy}
                autoFocus
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="size-12 text-lg"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="button"
              size="lg"
              disabled={busy || otp.length < 6}
              onClick={() => verifyCode(otp)}
              className="mt-6 h-11 w-full gap-2 bg-[#191919] text-white hover:bg-[#191919]/90"
            >
              {loading === "otp" && <Spinner />}
              Verify and continue
            </Button>

            <p className="mt-5 text-sm text-[#191919]/60">
              Didn&apos;t get it?{" "}
              <button
                type="button"
                onClick={() => sendCode()}
                disabled={busy || cooldown > 0}
                className="font-medium text-[#2563EB] disabled:text-[#191919]/40"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </p>
          </>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-[400px] gap-6 text-sm text-[#191919]/50">
        <a href="/privacy" className="hover:text-[#191919]">
          Privacy
        </a>
        <a href="/terms" className="hover:text-[#191919]">
          Terms
        </a>
        <a href="/cookies" className="hover:text-[#191919]">
          Cookies
        </a>
      </div>
    </div>
  );
}
