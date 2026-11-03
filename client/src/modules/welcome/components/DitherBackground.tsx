"use client";

import { useEffect, useRef } from "react";

const CELL = 4; // size of one dither dot, in css pixels
const FRAME_MS = 50; // ~20fps is plenty for a soft background

// 4x4 Bayer matrix: the classic ordered-dither threshold pattern.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

// Soft dot colour (slate blue) with some transparency, on a white page.
const DOT = [99, 120, 190, 55] as const;

export function DitherBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let image: ImageData;
    let raf = 0;
    let last = 0;

    function resize() {
      if (!canvas || !ctx) return;
      width = Math.ceil(window.innerWidth / CELL);
      height = Math.ceil(window.innerHeight / CELL);
      canvas.width = width;
      canvas.height = height;
      image = ctx.createImageData(width, height);
    }

    function draw(time: number) {
      if (!ctx) return;
      const t = time / 3200;
      const data = image.data;

      for (let y = 0; y < height; y++) {
        const ny = y / height;
        for (let x = 0; x < width; x++) {
          const nx = x / width;

          // A slowly moving field made from a few overlapping waves (0..1).
          const wave =
            0.5 +
            0.25 * Math.sin(nx * 6 + t) +
            0.2 * Math.sin(ny * 5 - t * 0.8) +
            0.15 * Math.sin((nx + ny) * 9 + t * 0.6);

          // Stronger near the edges, calmer in the middle where the content is.
          const dx = nx - 0.5;
          const dy = ny - 0.5;
          const edge = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 1.8);

          const level = wave * (0.12 + 0.88 * edge * edge) * 0.8;
          const on = level > BAYER[y & 3][x & 3];

          const i = (y * width + x) * 4;
          data[i] = DOT[0];
          data[i + 1] = DOT[1];
          data[i + 2] = DOT[2];
          data[i + 3] = on ? DOT[3] : 0;
        }
      }
      ctx.putImageData(image, 0, 0);
    }

    function loop(time: number) {
      raf = requestAnimationFrame(loop);
      if (time - last < FRAME_MS) return;
      last = time;
      draw(time);
    }

    resize();
    draw(0);
    if (!reduceMotion) raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      draw(performance.now());
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]"
    />
  );
}
