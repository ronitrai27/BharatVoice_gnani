"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MorphingText } from "@/components/ui/morphing-text";
import { BoomerangVideoBg } from "./BoomerangVideoBg";

const BUSINESS_WORDS = ["business", "बिज़नेस", "ਬਿਜ਼ਨਸ", "بزنس", "பிசினஸ்"];

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-between overflow-hidden h-screen">
      {/* Background Boomerang Video / Canvas */}
      <BoomerangVideoBg />

      {/* Hero Copy Block (centered at top) */}
      <div className="relative z-10 w-full flex flex-col items-center text-center pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 pointer-events-auto">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.1] tracking-tighter text-[#191919] font-normal">
          Grow your{" "}
          <MorphingText
            texts={BUSINESS_WORDS}
            className="inline-block align-top mx-0 w-[3.6em] max-w-none h-[1.1em] md:h-[1.1em] font-serif font-normal text-[length:inherit]! lg:text-[length:inherit]! leading-[1.1]"
          />
          ,
          <br />
          not your <span className="text-[#2563EB]">workload.</span>
        </h1>

        <p className="max-w-md sm:max-w-xl mt-4 sm:mt-5 md:mt-6 text-sm md:text-base text-[#191919]/75 leading-relaxed">
          Deploy AI employees to handle operations, support customers, and
          automate work &mdash; without the cost of hiring an entire team.
        </p>
      </div>

      {/* Bottom Info Panel (Fixed at bottom edge of hero) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center px-4 sm:px-6 pointer-events-auto">
        <div className="w-full max-w-[900px] bg-white/45 hover:bg-white/55 backdrop-blur-md border border-white/60 border-b-0 rounded-t-2xl sm:rounded-t-3xl pt-8 sm:pt-10 md:pt-12 px-6 sm:px-10 md:px-12 pb-0 shadow-lg transition-colors duration-300">
          {/* Row 1 — 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-16">
            {/* Left Column */}
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/60 font-semibold">
                AI EMPLOYEE FOR INDIAN SMB ONLY
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-tight tracking-tight text-[#191919]">
                Conversations that
                <br className="hidden sm:inline" /> build momentum
              </h2>
            </div>

            {/* Right Column: bottom-aligned body */}
            <div className="flex flex-col justify-end">
              <p className="text-sm md:text-[15px] text-[#191919]/80 leading-relaxed">
                Conversational AI built for Indian SMBs. Agents that hold real
                conversations across WhatsApp, voice, and email, plug directly
                into the tools you run, and deliver real results.
              </p>
            </div>
          </div>

          {/* Hairline Divider */}
          <div className="mt-6 sm:mt-8 h-px bg-gray-300/40 w-full" />

          {/* Bottom Action Buttons: Sign up & See Demo */}
          <div className="mt-5 sm:mt-6 pb-6 sm:pb-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="#signup"
              className="px-6 sm:px-7 py-3 bg-[#191919] hover:bg-[#191919]/90 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 group shadow-sm"
            >
              <span>Sign up</span>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>

            <Link
              href="#demo"
              className="px-6 sm:px-7 py-3 bg-white/70 hover:bg-white/95 text-[#191919] border border-gray-300/80 hover:border-gray-400 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 group backdrop-blur-xs shadow-xs"
            >
              <span>See Demo</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
