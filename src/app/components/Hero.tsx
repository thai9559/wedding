// components/Hero.tsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants, Transition } from "framer-motion";
import { ForestSlider } from "./ForestSlider";

// Fix TS: framer-motion expects Easing tuple or named easing. Cast tuple strongly.
const easeCubic = [0.16, 1, 0.3, 1] as [number, number, number, number];
const transitionIn: Transition = { duration: 0.9, ease: easeCubic };
const transitionOut: Transition = { duration: 0.7, ease: easeCubic };

const slides = [
  { src: "/images/main-banner.jpg", alt: "Slide 1" },
  { src: "/images/main-banner_2.jpg", alt: "Slide 2" },
  { src: "/images/main-banner_3.jpg", alt: "Slide 3" },
];

export  function Hero({ ctaText = "EXPLORE" }: { ctaText?: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => {
    setDir(1);
    setIndex((i) => (i + 1) % slides.length);
  }, []);
  const prev = useCallback(() => {
    setDir(-1);
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const current = slides[index];

  const variants: Variants = useMemo(
    () => ({
      enter: (direction: 1 | -1) => ({
        opacity: 0,
        scale: direction === 1 ? 1.05 : 1.15,
        filter: "blur(6px)",
      }),
      center: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: transitionIn,
      },
      exit: (direction: 1 | -1) => ({
        opacity: 0,
        scale: direction === 1 ? 1.1 : 1.0,
        filter: "blur(10px)",
        transition: transitionOut,
      }),
    }),
    []
  );

  return (
    <section
      className="relative h-[100svh] w-screen overflow-hidden bg-black"
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchMove={(e) => {
        const x0 = touchStartX.current;
        if (x0 == null) return;
        const dx = e.touches[0].clientX - x0;
        if (Math.abs(dx) > 70) {
          dx < 0 ? next() : prev();
          touchStartX.current = null;
        }
      }}
      onTouchEnd={() => (touchStartX.current = null)}
    >
      {/* Replace background Image sequence with WebGL Forest-style slider */}
      <ForestSlider
        slides={[
          { src: "/images/main-banner.jpg", heading: "Our Wedding Day", subheading: "A celebration of love" },
          { src: "/images/main-banner_2.jpg", heading: "Captured Moments", subheading: "Memories to cherish" },
          { src: "/images/main-banner_3.jpg", heading: "Together Forever", subheading: "Join our story" },
        ]}
        intervalMs={5000}
        intensity={0.6}
      />

      <button
        onClick={next}
        className="group absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 px-7 py-3 text-xs tracking-[0.35em] text-white/90 backdrop-blur-[2px] transition hover:bg-white/10"
        aria-label="Next"
      >
        {ctaText}
      </button>

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 text-white mix-blend-difference">
        <div className="text-[11px] tracking-[0.4em] uppercase">BLUSH & BOWTIES</div>
        <div className="size-8 grid place-items-center">
          <span className="block h-px w-5 bg-white mb-1" />
          <span className="block h-px w-5 bg-white mb-1" />
          <span className="block h-px w-5 bg-white" />
        </div>
      </header>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-3">
        <button
          onClick={prev}
          aria-label="Previous"
          className="pointer-events-auto grid size-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="pointer-events-auto grid size-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
        >
          ›
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-1.5 w-6 rounded-full transition ${
              i === index ? "bg-white" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
