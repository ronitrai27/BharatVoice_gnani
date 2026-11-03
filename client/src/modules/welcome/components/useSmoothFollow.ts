import { type RefObject, useEffect } from "react";

// Keeps a scroll area glued to its bottom with a gentle ease, so new messages
// and streaming words glide into view instead of jumping.
// It stops following if the user scrolls up, and resumes near the bottom.
export function useSmoothFollow(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const viewport = containerRef.current?.querySelector<HTMLElement>(
      '[data-slot="message-scroller-viewport"]',
    );
    if (!viewport) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let follow = true;
    let raf = 0;

    const distance = () =>
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) follow = false;
    };
    const onTouchMove = () => {
      follow = false;
    };
    const onScroll = () => {
      if (distance() < 24) follow = true;
    };

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!follow) return;
      const d = distance();
      if (d <= 0.5) return;
      viewport!.scrollTop += reduceMotion || d < 1.5 ? d : d * 0.08;
    }

    viewport.addEventListener("wheel", onWheel, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: true });
    viewport.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("scroll", onScroll);
    };
  }, [containerRef]);
}
