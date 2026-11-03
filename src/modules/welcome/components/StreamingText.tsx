"use client";

import { useEffect, useRef, useState } from "react";

// Reveals text one word at a time, each word fading in, like an LLM streaming
// its reply. It is a fixed script, so this is only an animation.
export function StreamingText({
  text,
  onDone,
  wordMs = 120,
}: {
  text: string;
  onDone?: () => void;
  wordMs?: number;
}) {
  const words = text.split(" ");
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setCount(words.length);
      return;
    }
    if (count >= words.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), wordMs);
    return () => clearTimeout(t);
  }, [count, words.length, wordMs]);

  useEffect(() => {
    if (count >= words.length) onDoneRef.current?.();
  }, [count, words.length]);

  return (
    <>
      {words.slice(0, count).map((word, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: words never reorder
          key={i}
          className="animate-in fade-in slide-in-from-bottom-0.5 duration-700"
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
