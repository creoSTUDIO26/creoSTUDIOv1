import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ServiceDetail } from '../types';
import SpatialCard3D from './SpatialCard3D';

interface ChapterServicesProps {
  services: ServiceDetail[];
  onSelectService: (serviceId: string) => void;
}

export default function ChapterServices({ services, onSelectService }: ChapterServicesProps) {
  return (
    <section
      id="services-index-section"
      className="w-full bg-[#1a1816] text-[#faf9f6] border-y border-[#3a3632] dark-section py-16 sm:py-20 md:py-24 relative z-10 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER: CHAPTER III & MANIFESTO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 sm:pb-16 border-b border-[#3a3632]">
          {/* Left Column: Chapter Title */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-editorial text-xs sm:text-sm tracking-[0.25em] text-white/50 uppercase font-medium">
                CHAPTER III
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c2cb]" />
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide uppercase font-normal leading-[1.05]">
              STUDIO SERVICES
            </h2>
            <p className="font-serif italic text-white/40 text-sm sm:text-base mt-1.5">curation</p>
          </div>

          {/* Right Column: "WHAT WE DO?" Quote & Offering count */}
          <div className="lg:col-span-6 flex flex-col justify-between lg:pl-6">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-white/40 mb-2.5 block font-semibold">
                WHAT WE DO?
              </span>
              <p className="font-display font-medium text-lg sm:text-xl lg:text-2xl text-white/90 leading-snug tracking-tight">
                Designing digital experiences and visual productions with clarity, structure, and intention.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#3a3632] flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
              <span className="font-semibold text-white/60">{services.length} OFFERINGS</span>
              <span className="text-[#00c2cb]">CLICK CARD TO EXPLORE →</span>
            </div>
          </div>
        </div>

        {/* SERVICES CARDS GRID: 4-column luxury architectural grid without horizontal scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#3a3632] border border-[#3a3632] mt-10 sm:mt-12">
          {services.map((s, idx) => {
            const displayCount = s.count || String(idx + 1).padStart(2, '0');
            const worksCount = s.subsections?.length || 0;

            return (
              <SpatialCard3D
                key={s.id}
                maxTilt={6}
                glareOpacity={0.12}
                scaleOnHover={1.015}
                className="w-full h-full"
              >
                <article
                  onClick={() => {
                    onSelectService(s.id);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="group relative bg-[#1e1c19] hover:bg-[#161412] p-7 sm:p-8 md:p-9 min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-colors duration-500 h-full"
                >
                {/* CURTAIN REVEAL IMAGE ON HOVER */}
                <div
                  className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0_0)]"
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover object-center scale-110 group-hover:scale-100 transition-transform duration-1000 ease-out"
                    loading="lazy"
                  />
                  {/* Dark gradient scrim so text remains 100% legible over the image */}
                  <div className="absolute inset-0 bg-[#161412]/50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/70" />
                </div>

                {/* 1. TOP: Large Luxury Serif Numeral + Service Link */}
                <div className="relative z-10 flex items-start justify-between">
                  <span className="font-editorial text-6xl sm:text-7xl lg:text-8xl font-normal text-white/90 leading-none tracking-tight transition-transform duration-500 group-hover:-translate-y-1 group-hover:text-white">
                    {displayCount}
                  </span>

                  <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00c2cb] font-semibold">
                      SERVICE
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:text-[#00c2cb] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>

                {/* 2. MIDDLE: Pure Serif Editorial Title */}
                <div className="relative z-10 my-auto py-8">
                  <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl uppercase text-white font-normal tracking-wide leading-[1.12] transition-colors duration-300">
                    {s.name}
                  </h3>
                </div>

                {/* 3. BOTTOM: Clean Description Tagline & Works Count */}
                <div className="relative z-10 pt-4 space-y-3">
                  <div className="bg-[#1a1816]/70 backdrop-blur-xs p-4 -mx-2 -mb-2 border-t border-white/10 group-hover:bg-black/70 group-hover:border-white/20 transition-all">
                    <p className="text-xs sm:text-[13px] font-sans text-white/70 leading-relaxed group-hover:text-white/90 transition-colors line-clamp-3 mb-3">
                      {s.tagline}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono uppercase tracking-widest text-white/40 group-hover:text-[#00c2cb] transition-colors">
                      <span className="flex items-center gap-1 font-semibold">
                        <span>Explore service</span>
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                      </span>
                      <span className="text-[9px] text-white/30 font-mono">
                        {worksCount} {worksCount === 1 ? 'WORK' : 'WORKS'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </SpatialCard3D>
          );
        })}
        </div>
      </div>
    </section>
  );
}
