"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { nearestColorName } from "@/lib/color";
import { dominantColor, processCapture, type ProcessedCapture } from "@/lib/image";
import { StorageFullError, addItem, updateItem } from "@/lib/store";
import type { Category } from "@/lib/types";
import { useItem } from "@/lib/useCloset";
import CategoryStrip from "./CategoryStrip";
import SavedConfirmation from "./SavedConfirmation";

type Phase = "starting" | "live" | "review" | "saved" | "blocked";

/**
 * Full-screen capture flow: viewfinder -> shutter -> auto clean-up -> one-tap
 * category -> saved. The camera is never torn down between items, so adding a
 * whole shelf is shutter, tap, shutter, tap.
 */
export default function CameraCapture({ attachToId }: { attachToId?: string }) {
  const router = useRouter();
  // Attach mode: we already know what this is, so there's nothing to tag.
  const attachTarget = useItem(attachToId ?? "");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("starting");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [shot, setShot] = useState<ProcessedCapture | null>(null);
  const [savedCategory, setSavedCategory] = useState<Category | null>(null);
  const [flash, setFlash] = useState(0);
  const [error, setError] = useState<string | null>(null);
  /** Shown inside the review panel, where the unsaved shot still is. */
  const [saveError, setSaveError] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(() => {
    stopStream();
    // Promise chain rather than await: the state updates belong to the camera
    // callback, not to the effect body that kicks this off.
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
        setPhase("live");
      })
      .catch(() => {
        // No camera, or permission denied. The library picker still works.
        setPhase("blocked");
        setError(
          "Camera unavailable. Check browser permissions, or add a photo from your library.",
        );
      });
  }, [facing, stopStream]);

  useEffect(() => {
    startStream();
    return stopStream;
  }, [startStream, stopStream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    setFlash((n) => n + 1);
    setShot(processCapture(video));
    setPhase("review");
  }, []);

  const captureFromFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setShot(processCapture(img));
      setPhase("review");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const retake = useCallback(() => {
    setSaveError(null);
    setShot(null);
    setPhase(streamRef.current ? "live" : "blocked");
  }, []);

  const save = useCallback(
    async (category: Category) => {
      if (!shot) return;
      const rgb = await dominantColor(shot.dataUrl);
      try {
        addItem({
          photoUrl: shot.dataUrl,
          category,
          color: rgb ? nearestColorName(rgb) : "multi",
          tags: [],
          occasions: ["everyday"],
        });
      } catch (cause) {
        // Keep the shot on screen: it isn't saved, and retaking it won't help.
        if (cause instanceof StorageFullError) {
          setSaveError(
            "No room left on this device. Delete a few items from your closet, then tap the category again.",
          );
          return;
        }
        throw cause;
      }
      setSaveError(null);
      setSavedCategory(category);
      setAddedCount((n) => n + 1);
      setPhase("saved");
      // Straight back to the viewfinder — cataloguing is a batch job.
      window.setTimeout(() => {
        setShot(null);
        setSavedCategory(null);
        setPhase(streamRef.current ? "live" : "blocked");
      }, 1150);
    },
    [shot],
  );

  const attachPhoto = useCallback(() => {
    if (!shot || !attachToId) return;
    updateItem(attachToId, { photoUrl: shot.dataUrl });
    stopStream();
    router.push(`/closet/${attachToId}`);
  }, [attachToId, router, shot, stopStream]);

  const close = useCallback(() => {
    stopStream();
    router.push(addedCount > 0 ? "/closet" : "/");
  }, [addedCount, router, stopStream]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === " " && phase === "live") {
        event.preventDefault();
        capture();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capture, close, phase]);

  const reviewing = phase === "review" || phase === "saved";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-shell text-white">
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover transition-opacity duration-200 ${
            reviewing ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Framing guide — a hint, not a crop box. */}
        {phase === "live" ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="aspect-square w-[78%] max-w-md rounded-3xl border border-white/25" />
          </div>
        ) : null}

        {reviewing && shot ? (
          <div className="absolute inset-0 flex items-center justify-center bg-shell p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={shot.dataUrl}
              src={shot.dataUrl}
              alt="Captured item"
              className="animate-settle max-h-full w-auto max-w-md rounded-3xl object-contain"
            />
          </div>
        ) : null}

        {flash > 0 ? (
          <div key={flash} className="animate-flash pointer-events-none absolute inset-0 bg-white" />
        ) : null}

        {phase === "saved" && savedCategory ? (
          <SavedConfirmation category={savedCategory} total={addedCount} />
        ) : null}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button
            type="button"
            onClick={close}
            aria-label="Close camera"
            className="grid h-11 w-11 place-items-center rounded-full bg-black/45 backdrop-blur transition-transform active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {addedCount > 0 ? (
            <span className="rounded-full bg-black/45 px-3 py-1.5 font-mono text-xs backdrop-blur">
              {addedCount} added
            </span>
          ) : null}

          {phase === "live" ? (
            <button
              type="button"
              onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
              aria-label="Switch camera"
              className="grid h-11 w-11 place-items-center rounded-full bg-black/45 backdrop-blur transition-transform active:scale-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 9a8 8 0 0 1 13.5-3.5L20 8M20 15a8 8 0 0 1-13.5 3.5L4 16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path d="M20 4v4h-4M4 20v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <span className="w-10" />
          )}
        </div>

        {error && !reviewing ? (
          <p className="absolute inset-x-0 bottom-6 mx-auto max-w-xs text-center text-sm text-white/75">
            {error}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 bg-shell px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-4">
        {phase === "review" && shot ? (
          <div className="animate-rise space-y-4">
            {saveError ? (
              <p className="mx-auto max-w-xs rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-center text-sm">
                {saveError}
              </p>
            ) : null}

            <p className="text-center text-xs text-white/55">
              {shot.backgroundRemoved
                ? "Background removed and cropped."
                : "Kept the photo as shot — the background wouldn't separate cleanly."}
              {attachToId ? "" : " Tap a category to save."}
            </p>

            {attachToId ? (
              <button
                type="button"
                onClick={attachPhoto}
                className="mx-auto flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-transform active:scale-95"
              >
                Save photo to {attachTarget?.name ?? "this item"}
              </button>
            ) : (
              <CategoryStrip onPick={save} />
            )}

            <button
              type="button"
              onClick={retake}
              className="mx-auto flex min-h-11 items-center px-4 text-sm text-white/70 underline-offset-4 hover:underline"
            >
              Retake
            </button>
          </div>
        ) : phase === "saved" ? (
          <p className="py-9 text-center text-sm text-white/55">
            Saved. Line up the next one.
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-4 text-sm text-white/85 transition-transform active:scale-95"
            >
              Library
            </button>

            <button
              type="button"
              onClick={capture}
              disabled={phase !== "live"}
              aria-label="Take photo"
              className="group relative grid h-[70px] w-[70px] place-items-center rounded-full border-[3px] border-white/85 transition-transform active:scale-90 disabled:opacity-40"
            >
              <span className="h-[54px] w-[54px] rounded-full bg-accent transition-transform group-active:scale-90" />
            </button>

            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 w-[74px] items-center justify-end text-sm text-white/70 transition-transform active:scale-95"
            >
              Done
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) captureFromFile(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
