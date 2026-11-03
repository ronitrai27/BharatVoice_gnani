"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mascot } from "page-mascot";
import { DitherBackground } from "./DitherBackground";
import { WelcomeChat } from "./WelcomeChat";

const INTRO_MS = 4200;
const EASE = [0.4, 0, 0.2, 1] as const;

// Fades all four edges (and so the corners) of the panel into the background.
const FADE =
  "transparent 0, black 56px, black calc(100% - 56px), transparent 100%";
const FADE_MASK = {
  maskImage: `linear-gradient(to right, ${FADE}), linear-gradient(to bottom, ${FADE})`,
  maskComposite: "intersect",
  WebkitMaskImage: `linear-gradient(to right, ${FADE}), linear-gradient(to bottom, ${FADE})`,
  WebkitMaskComposite: "source-in",
} as const;

export function WelcomeScreen({ name }: { name: string }) {
  const [phase, setPhase] = useState<"intro" | "chat">("intro");

  useEffect(() => {
    const t = setTimeout(() => setPhase("chat"), INTRO_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-white px-4">
      <DitherBackground />

      <div className="relative z-10 h-[86vh] w-full max-w-4xl overflow-hidden">
        {/* The white panel is its own layer so only its edges fade out; the
            content on top stays fully visible. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-white/85 backdrop-blur-sm"
          style={FADE_MASK}
        />
        <AnimatePresence mode="wait">
          {phase === "intro" ? (
            <motion.div
              key="intro"
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              exit={{
                opacity: 0,
                y: -180,
                scale: 0.85,
                transition: { duration: 0.8, ease: EASE },
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 16 }}
              >
                <Mascot
                  directions="/crt-directions.webp"
                  reactions="/crt-reactions.webp"
                  label="Onboarding agent"
                />
              </motion.div>

              <motion.h1
                className="mt-6 font-serif text-4xl tracking-tight text-[#191919] md:text-5xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
              >
                Welcome, {name}
              </motion.h1>

              <motion.p
                className="mt-3 max-w-md text-sm text-[#191919]/65 md:text-base"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.7, ease: EASE }}
              >
                I&apos;m your onboarding agent. I&apos;ll help you complete the
                initial steps.
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              className="absolute inset-0"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <WelcomeChat />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
