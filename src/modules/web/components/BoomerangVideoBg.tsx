"use client";

import { useEffect, useRef, useState } from "react";

const CLOUDFRONT_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4";

export function BoomerangVideoBg() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let isDisposed = false;
    let isCapturing = true;
    const capturedFrames: HTMLCanvasElement[] = [];
    let lastTime = -1;
    let animFrameId: number | null = null;
    let videoCallbackId: number | null = null;
    let playbackInterval: NodeJS.Timeout | null = null;

    video.muted = true;
    video.playsInline = true;

    const captureCurrentFrame = () => {
      if (!isCapturing || isDisposed) return;

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const currentTime = video.currentTime;
        if (currentTime !== lastTime) {
          lastTime = currentTime;
          const maxWidth = 960;
          const scale = Math.min(1, maxWidth / video.videoWidth);
          const targetWidth = Math.round(video.videoWidth * scale);
          const targetHeight = Math.round(video.videoHeight * scale);

          try {
            const offscreen = document.createElement("canvas");
            offscreen.width = targetWidth;
            offscreen.height = targetHeight;
            const ctx = offscreen.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
              capturedFrames.push(offscreen);
            }
          } catch (err) {
            // Log warning if canvas capture fails
            console.warn("Frame capture skipped due to context error:", err);
          }
        }
      }

      if (isCapturing && !video.ended) {
        scheduleNextCapture();
      }
    };

    const scheduleNextCapture = () => {
      if (!isCapturing || isDisposed) return;

      if ("requestVideoFrameCallback" in video) {
        const callbackVideo = video as HTMLVideoElement & {
          requestVideoFrameCallback: (cb: () => void) => number;
        };
        videoCallbackId = callbackVideo.requestVideoFrameCallback(captureCurrentFrame);
      } else {
        animFrameId = requestAnimationFrame(captureCurrentFrame);
      }
    };

    const startBoomerangPlayback = () => {
      if (isDisposed) return;

      if (capturedFrames.length < 2) {
        // Fallback: If capture was not possible, loop native video smoothly
        if (video) {
          video.loop = true;
          video.play().catch(() => {});
        }
        return;
      }

      setIsCanvasReady(true);
      const displayCtx = canvas.getContext("2d");
      const firstFrame = capturedFrames[0];
      canvas.width = firstFrame.width;
      canvas.height = firstFrame.height;

      let frameIndex = 0;
      let forward = true;
      const intervalMs = 1000 / 30; // 30 fps

      playbackInterval = setInterval(() => {
        if (isDisposed || !displayCtx) return;

        const frame = capturedFrames[frameIndex];
        if (frame) {
          displayCtx.drawImage(frame, 0, 0);
        }

        if (forward) {
          if (frameIndex >= capturedFrames.length - 1) {
            forward = false;
            frameIndex = Math.max(0, capturedFrames.length - 2);
          } else {
            frameIndex++;
          }
        } else {
          if (frameIndex <= 0) {
            forward = true;
            frameIndex = Math.min(1, capturedFrames.length - 1);
          } else {
            frameIndex--;
          }
        }
      }, intervalMs);
    };

    const handlePlay = () => {
      isCapturing = true;
      scheduleNextCapture();
    };

    const handleEnded = () => {
      isCapturing = false;
      if (videoCallbackId !== null && "cancelVideoFrameCallback" in video) {
        (
          video as HTMLVideoElement & {
            cancelVideoFrameCallback: (id: number) => void;
          }
        ).cancelVideoFrameCallback(videoCallbackId);
      }
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
      startBoomerangPlayback();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("ended", handleEnded);

    // Initial play trigger
    const playAttempt = video.play();
    if (playAttempt !== undefined) {
      playAttempt.catch((e) => {
        console.warn("Video playback requires user gesture or failed autoplay:", e);
      });
    }

    return () => {
      isDisposed = true;
      isCapturing = false;
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("ended", handleEnded);
      if (videoCallbackId !== null && "cancelVideoFrameCallback" in video) {
        (
          video as HTMLVideoElement & {
            cancelVideoFrameCallback: (id: number) => void;
          }
        ).cancelVideoFrameCallback(videoCallbackId);
      }
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
      if (playbackInterval !== null) {
        clearInterval(playbackInterval);
      }
      capturedFrames.length = 0;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 scale-[1.15] origin-top overflow-hidden pointer-events-none select-none">
      <video
        ref={videoRef}
        src={CLOUDFRONT_VIDEO_URL}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className={`w-full h-full object-cover object-top ${
          isCanvasReady ? "hidden" : "block"
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover object-top ${
          isCanvasReady ? "block" : "hidden"
        }`}
      />
    </div>
  );
}

