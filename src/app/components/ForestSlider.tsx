"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import Image from "next/image";

type Slide = {
  src: string;
  heading: string;
  subheading?: string;
};

export type ForestSliderProps = {
  slides: Slide[];
  /** milliseconds between auto transitions */
  intervalMs?: number;
  /** strength of the displacement ripple */
  intensity?: number; // 0..1
};

// Small 64x64 cloudy noise as displacement map (data URI) to avoid shipping an extra asset
const NOISE_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsSAAALEgHS3X78AAAArUlEQVR4nO3QsQkAMAwAsXz/0wq4wC0a6m3o6w6zVw7kq3l1AQAAAAAAAAAAAAAAAKC/J5H8a1o9b3p8Y1v9rBq7z2b3i9c9d8m6+Vq5HkOje4c7k1d2N7h+Wj2n8mP2Z3YHq2nB7m9Yh+9jW2b2mN9jv1t8y9r2b3xkAAAAAAAAAAAAAAABw2A2m4gq0x0H1AAAAAElFTkSuQmCC";

export function ForestSlider({
  slides,
  intervalMs = 4500,
  intensity = 0.55,
}: ForestSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [appReady, setAppReady] = useState(false);
  const [index, setIndex] = useState(0);
  const nextIndex = useMemo(() => (index + 1) % slides.length, [index, slides.length]);

  // Create PIXI app once
  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    const app = new PIXI.Application();
    (async () => {
      await app.init({ resizeTo: containerRef.current!, backgroundAlpha: 0, antialias: true });
      containerRef.current!.appendChild(app.canvas);
      appRef.current = app as unknown as PIXI.Application; // keep ref
      setAppReady(true); // trigger scene build
    })();
  }, []);

  // Build scene per slide change
  useEffect(() => {
    const app = appRef.current;
    const host = containerRef.current;
    if (!app || !host) return;

    let disposed = false;

    const stage = new PIXI.Container();

    // base and next textures
    const baseSprite = PIXI.Sprite.from(slides[index].src);
    const nextSprite = PIXI.Sprite.from(slides[nextIndex].src);
    baseSprite.anchor.set(0.5);
    nextSprite.anchor.set(0.5);

    // cover fit
    const fitCover = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      const sprites = [baseSprite, nextSprite];
      sprites.forEach((s) => {
        const tex = s.texture as PIXI.Texture;
        const texW = (tex?.width && tex.width > 0) ? tex.width : 1920;
        const texH = (tex?.height && tex.height > 0) ? tex.height : 1080;
        const ratio = texW / texH;
        const viewRatio = w / h;
        if (ratio > viewRatio) {
          s.width = h * ratio;
          s.height = h;
        } else {
          s.width = w;
          s.height = w / ratio;
        }
        s.x = w / 2;
        s.y = h / 2;
      });
    };

    const ensureReady = async () => {
      try {
        await Promise.all([
          PIXI.Assets.load(slides[index].src),
          PIXI.Assets.load(slides[nextIndex].src),
        ]);
      } catch {}
      fitCover();
    };
    ensureReady();
    const ro = new ResizeObserver(fitCover);
    ro.observe(host);

    // displacement map
    const disp = PIXI.Sprite.from(NOISE_DATA_URI);
    disp.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT as any;
    const filter = new PIXI.DisplacementFilter(disp);
    filter.scale.x = 0;
    filter.scale.y = 0;
    stage.addChild(baseSprite, nextSprite, disp);
    stage.filters = [filter];

    // start with next transparent and scaled slightly for ken burns
    nextSprite.alpha = 0;
    nextSprite.scale.set(1.06);
    baseSprite.scale.set(1.02);

    // add stage to app
    app.stage.removeChildren();
    app.stage.addChild(stage);

    // simple ticker animation
    let t = 0;
    const duration = 60; // frames ~ 1s at 60fps per transition portion
    const total = duration * 3; // in + hold + out

    const tick = () => {
      if (disposed) return;
      t += 1;
      // ripple noise scroll
      disp.x += 1.3;
      disp.y += 0.9;

      // easing
      const ease = (p: number) => 1 - Math.pow(1 - p, 3);
      // const pIn = Math.min(1, t / duration);
      // const pOut = Math.max(0, Math.min(1, (t - duration * 2) / duration));

      // fade in next with displacement peak in the middle section
      if (t <= duration * 2) {
        nextSprite.alpha = ease(Math.min(1, t / (duration * 1.2)));
        filter.scale.x = filter.scale.y = intensity * 180 * Math.sin((Math.PI * t) / (duration * 2));
      } else {
        // fade out base displacement
        filter.scale.x *= 0.92;
        filter.scale.y *= 0.92;
      }

      // Subtle ken burns zoom
      baseSprite.scale.x += 0.0008;
      baseSprite.scale.y += 0.0008;
      nextSprite.scale.x += 0.0006;
      nextSprite.scale.y += 0.0006;

      if (t >= total) {
        // stop this transition
        app.ticker.remove(tick);
      }
    };

    app.ticker.add(tick);

    return () => {
      disposed = true;
      try { ro.disconnect(); } catch {}
      app.ticker.remove(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, nextIndex, slides, appReady]);

  // autoplay
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  return (
    <div
      className="relative h-[100svh] w-full overflow-hidden"
      onMouseMove={(e) => {
        const el = containerRef.current;
        const text = textRef.current;
        if (!el || !text) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width; // -0.5..0.5
        const dy = (e.clientY - cy) / rect.height;
        const tx = (-dx * 20).toFixed(2);
        const ty = (-dy * 16).toFixed(2);
        text.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }}
      onMouseLeave={() => {
        if (textRef.current) textRef.current.style.transform = "translate3d(0,0,0)";
      }}
    >
      {/* Canvas host for WebGL */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Parallax overlay text */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div ref={textRef} className="text-center text-white will-change-transform transition-transform duration-300">
          <div
            className="will-change-transform text-[11px] tracking-[0.4em] uppercase opacity-80"
            style={{ transform: "translateY(-6vh)" }}
          >
            BLUSH & BOWTIES
          </div>
          <h1 className="mt-3 text-5xl md:text-7xl font-medium will-change-transform">
            {slides[index].heading}
          </h1>
          {slides[index].subheading && (
            <p className="mt-3 text-sm md:text-base text-white/80 will-change-transform">
              {slides[index].subheading}
            </p>
          )}
        </div>
      </div>

      {/* Preload next image with Next/Image for better cache behavior */}
      <div className="invisible">
        <Image src={slides[nextIndex].src} alt="preload" width={10} height={10} />
      </div>
    </div>
  );
}


