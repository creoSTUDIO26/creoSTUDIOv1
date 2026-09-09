import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ServiceDetail } from '../types';

interface ChapterServicesProps {
  services: ServiceDetail[];
  onSelectService: (serviceId: string) => void;
}

export default function ChapterServices({ services, onSelectService }: ChapterServicesProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const [horizontalDistance, setHorizontalDistance] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Measure the total horizontal travel distance needed to reveal all services on desktop
  useEffect(() => {
    const updateDistance = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile && runwayRef.current && viewportRef.current) {
        const runwayWidth = runwayRef.current.scrollWidth;
        const viewportWidth = viewportRef.current.clientWidth;
        const distance = Math.max(0, runwayWidth - viewportWidth);
        setHorizontalDistance(distance);
      } else {
        setHorizontalDistance(0);
      }
    };

    updateDistance();
    // Allow DOM to settle and recalculate
    const timer1 = setTimeout(updateDistance, 100);
    const timer2 = setTimeout(updateDistance, 500);
    window.addEventListener('resize', updateDistance);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateDistance);
    };
  }, [services]);

  // Framer motion scroll tracking: tracks vertical scroll through the pinned container
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end']
  });

  // 1-to-1 conversion: vertical page scroll drives horizontal translation of the runway
  const x = useTransform(scrollYProgress, [0, 1], [0, -horizontalDistance]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const scrollByDirection = (dir: 'left' | 'right') => {
    const step = Math.max(350, window.innerHeight * 0.4);
    window.scrollBy({
      top: dir === 'right' ? step : -step,
      behavior: 'smooth'
    });
  };

  return (
    <div
      ref={sectionRef}
      id="services-index-section"
      className="relative w-full select-none"
      style={{
        // On mobile, keep natural height for normal vertical scroll.
        // On desktop, outer container provides exact scroll height for horizontal gliding.
        height: isMobile ? 'auto' : (horizontalDistance > 0 ? `calc(100vh + ${horizontalDistance}px)` : '100vh')
      }}
    >
      {/* MOBILE VIEW (< md): Normal vertical scroll & clean editorial list matching Image 1 */}
      <div className="block md:hidden w-full bg-[#1e1c19] text-[#faf9f6] px-5 py-12 sm:px-8 border-y border-[#3a3632] dark-section">
        {/* Chapter & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-editorial text-xs tracking-[0.25em] text-white/50 uppercase font-medium">
              CHAPTER III
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c2cb]" />
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl text-white tracking-wide uppercase font-normal">
            STUDIO SERVICES
          </h2>
          <p className="font-serif italic text-white/40 text-sm mt-1">curation</p>

          <div className="mt-6 pt-5 border-t border-[#3a3632]">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 mb-2 block font-semibold">
              WHAT WE DO?
            </span>
            <p className="font-display font-medium text-base sm:text-lg text-white/90 leading-snug tracking-tight">
              Designing digital experiences and visual productions with clarity, structure, and intention.
            </p>
          </div>
        </div>

        {/* Services List matching Image 1:
            Horizontal dividers, two-digit number on the left, right-aligned uppercase serif title */}
        <div className="border-t border-white/15">
          {services.map((s, idx) => {
            const displayCount = s.count || String(idx + 1).padStart(2, '0');

            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectService(s.id);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="group py-5 sm:py-6 border-b border-white/15 flex items-center justify-between cursor-pointer active:bg-white/[0.04] transition-colors"
              >
                {/* Left: Two-digit index */}
                <span className="font-mono text-xs sm:text-sm text-white/45 tracking-widest group-hover:text-white transition-colors shrink-0">
                  {displayCount}
                </span>

                {/* Right: Uppercase Didone serif title right-aligned */}
                <div className="flex items-center justify-end gap-2.5 text-right flex-1 ml-6">
                  <span className="font-editorial text-xl sm:text-2xl tracking-wider uppercase text-white group-hover:text-[#00c2cb] transition-colors">
                    {s.name}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#00c2cb] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Offering counter indicator */}
        <div className="mt-6 pt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
          <span>{services.length} OFFERINGS</span>
          <span className="text-[#00c2cb]/80">TAP TO EXPLORE →</span>
        </div>
      </div>

      {/* DESKTOP VIEW (>= md): Sticky pinned container with horizontal runway */}
      <div className="hidden md:flex sticky top-0 h-screen w-full overflow-hidden bg-[#1e1c19] text-[#faf9f6] flex-col md:flex-row border-y border-[#3a3632] dark-section">
        
        {/* LEFT COLUMN: CHAPTER III & MANIFESTO */}
        <div className="w-full md:w-[320px] lg:w-[380px] xl:w-[420px] shrink-0 h-auto md:h-full flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 border-b md:border-b-0 md:border-r border-[#3a3632] bg-[#1a1816] z-20">
          {/* Top: Chapter III heading */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-editorial text-xs sm:text-sm tracking-[0.25em] text-white/50 uppercase font-medium">
                CHAPTER III
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c2cb]" />
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide uppercase font-normal">
              STUDIO SERVICES
            </h2>
            <p className="font-serif italic text-white/40 text-sm mt-1">curation</p>
          </div>

          {/* Bottom: "WHAT WE DO?" Quote & Scroll Progress */}
          <div className="mt-6 md:mt-0 space-y-6">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-white/40 mb-2.5 block font-semibold">
                WHAT WE DO?
              </span>
              <p className="font-display font-medium text-lg sm:text-xl lg:text-2xl text-white/90 leading-[1.25] tracking-tight">
                Designing digital experiences and visual productions with clarity, structure, and intention.
              </p>
            </div>

            {/* Navigation controls & live scroll progress bar */}
            <div className="pt-4 border-t border-[#3a3632] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">
                  {services.length} OFFERINGS
                </span>

                {/* Arrow Buttons that smoothly step the scroll */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollByDirection('left')}
                    className="p-2 border border-white/15 hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer rounded-none active:scale-95"
                    aria-label="Scroll back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByDirection('right')}
                    className="p-2 border border-white/15 hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer rounded-none active:scale-95"
                    aria-label="Scroll forward"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-[2px] bg-white/10 overflow-hidden relative">
                <motion.div
                  className="h-full bg-[#00c2cb] origin-left"
                  style={{ width: progressWidth }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono uppercase text-white/30 tracking-widest">
                <span>SCROLL DOWN TO ADVANCE</span>
                <span>HORIZONTAL RUNWAY →</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: HORIZONTAL GLIDING RUNWAY */}
        <div
          ref={viewportRef}
          className="flex-1 h-full overflow-hidden relative flex items-stretch bg-[#1d1b19]"
        >
          <motion.div
            ref={runwayRef}
            style={{ x }}
            className="flex h-full flex-row shrink-0 will-change-transform"
          >
            {services.map((s, idx) => {
              const displayCount = s.count || String(idx + 1).padStart(2, '0');

              return (
                <article
                  key={s.id}
                  onClick={() => {
                    onSelectService(s.id);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="w-[85vw] sm:w-[360px] md:w-[400px] lg:w-[440px] xl:w-[480px] shrink-0 h-full flex flex-col justify-between p-8 sm:p-10 md:p-12 lg:p-14 border-l border-[#3a3632] transition-colors duration-500 relative group overflow-hidden cursor-pointer select-none"
                >
                  {/* CURTAIN REVEAL ON HOVER (Matching Image 3) */}
                  <div
                    className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0_0)]"
                  >
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover object-center scale-110 group-hover:scale-100 transition-transform duration-1000 ease-out"
                      loading="lazy"
                    />
                    {/* Dark gradient scrim so text remains 100% readable over the image */}
                    <div className="absolute inset-0 bg-[#161412]/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/70" />
                  </div>

                  {/* 1. TOP: Large Luxury Serif Numeral (Matching Image 2 & 3) */}
                  <div className="relative z-10 flex items-start justify-between">
                    <span className="font-editorial text-7xl sm:text-8xl md:text-9xl font-normal text-white/90 leading-none tracking-tight transition-transform duration-500 group-hover:-translate-y-1 group-hover:text-white">
                      {displayCount}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#00c2cb]">
                        SERVICE
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* 2. MIDDLE: Pure Serif Editorial Title (Matching Image 2 & 3 - No permanent thumbnail) */}
                  <div className="relative z-10 my-auto py-8">
                    <h3 className="font-editorial text-3xl sm:text-4xl md:text-5xl uppercase text-white font-normal tracking-wide leading-[1.12] transition-colors duration-300">
                      {s.name}
                    </h3>
                  </div>

                  {/* 3. BOTTOM: Clean Description Tagline with subtle dark backing (Matching Image 2 & 3) */}
                  <div className="relative z-10 pt-4 space-y-3">
                    <div className="bg-[#1a1816]/60 backdrop-blur-xs p-4 -mx-4 -mb-4 border-t border-white/10 group-hover:bg-black/60 group-hover:border-white/20 transition-all">
                      <p className="text-xs sm:text-sm font-sans text-white/70 leading-relaxed max-w-[320px] group-hover:text-white/90 transition-colors">
                        {s.tagline}
                      </p>

                      <div className="flex items-center justify-between pt-3 text-[10px] font-mono uppercase tracking-widest text-white/40 group-hover:text-[#00c2cb] transition-colors">
                        <span className="flex items-center gap-1.5">
                          <span>Explore service</span>
                          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                        </span>
                        <span className="text-[9px] text-white/30 font-mono">
                          {s.subsections?.length || 0} WORKS
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
